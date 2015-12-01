angular.module('bugme.services', [])

    .factory('Reminders', function (LocalStorage, Notifications) {
        //LocalStorage.clear();
        var reminders = [];

        if (LocalStorage.getArray('xreminders')) {
            //console.log("xreminder exists");
            reminders = LocalStorage.getArray('xreminders');
        } else {
            ////console.log("no xreminder exists");
            LocalStorage.setArray('xreminders', []);
            reminders = LocalStorage.getArray('xreminders');
        }

        return {
            all: function () {
                return reminders;
            },
            remove: function (reminder) {
                reminders.splice(reminders.indexOf(reminder), 1);
                LocalStorage.setArray('xreminders', reminders);
                Notifications.delete(reminder);
            },
            save: function (reminder) {
                reminders[reminder.id] = reminder;
                LocalStorage.setArray('xreminders', reminders);
            },
            update: function (reminder, oldReminder) {
                console.log("getting to the update function in services " + JSON.stringify(reminder) + " " + JSON.stringify(oldReminder));
                //if nothing changed, don't do an update
                if (JSON.stringify(reminder) === JSON.stringify(oldReminder)) {
                    //console.log("old reminder is equal to new reminder");
                    return;
                }
                //console.log(JSON.stringify(reminders[reminder.id]) + "   " + JSON.stringify(reminder));
                reminders[reminder.id] = reminder;
                LocalStorage.setArray('xreminders', reminders);

                if (reminder.active && !oldReminder.active) {
                    //console.log("reschedule reminders " + reminder.active + " " + oldReminder.active);
                    Notifications.schedule(reminder);
                }

                if (!reminder.active) {
                    //console.log("delete reminders " + reminder.active + " " + oldReminder.active);
                    Notifications.delete(reminder);
                }

                if ((reminder.frequency !== oldReminder.frequency || reminder.interval !== oldReminder.interval) && reminder.active) {
                    //console.log("delete and reschedule reminders " + reminder.active + " " + oldReminder.active);
                    Notifications.delete(reminder);
                    Notifications.schedule(reminder);
                }

            },
            get: function (reminderId) {
                for (var i = 0; i < reminders.length; i++) {
                    if (reminders[i].id === parseInt(reminderId)) {
                        return reminders[i];
                    }
                }
                return null;
            },
            add: function (reminder) {
                reminders.push(reminder);
                LocalStorage.setArray('xreminders', reminders);
            },
            size: function () {
                return reminders.length;
            }
        };
    })
    .factory('LocalStorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            },
            setArray: function (key, value) {
                $window.localStorage.setItem(key, JSON.stringify(value));
            },
            getArray: function (key) {
                return JSON.parse($window.localStorage.getItem(key));

            },
            clear: function () {
                $window.localStorage.clear();
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            }
        }
    }])
    .factory('Notifications', function ($moment, Settings, $cordovaLocalNotification, LocalStorage) {

        var notificationId = 0;
        if (LocalStorage.get('nid')) {
            notificationId = parseInt(LocalStorage.get('nid'));
        } else {
            LocalStorage.set('nid', 0);
        }

        return {
            saveReminder: function (reminder) {
                var reminders = LocalStorage.getArray("xreminders");
                reminders[parseInt(reminder.id)] = reminder;
                LocalStorage.setArray('xreminders', reminders);
            },
            getReminder: function (reminderId) {
                var reminders = LocalStorage.getArray("xreminders");
                return reminders[parseInt(reminderId)];
            },
            randomDate: function (start, interval) {
                console.log(start + " interval   " + interval);
                var check = start;
                var end;
                var sStart = Settings.getStartTimeForDay(start);
                var sEnd = Settings.getEndTimeForDay(start);
                //console.log("sstart  " + $moment(sStart).format() + "  " + $moment(start).format());

                if ($moment(start).isAfter(sEnd) && $moment(start).days() === $moment(sEnd).days()) {
                    start = $moment(Settings.getEndTimeOfDay()).add(1, "seconds");
                    //console.log("START " + start);
                }

                sStart = Settings.getStartTimeForDay(start);
                sEnd = Settings.getEndTimeForDay(start);

                if ($moment(start).isBefore(sStart)) {
                    start = sStart;
                    //console.log("START " + start);
                }

                if (interval === 'minute') {
                    end = $moment(start).add(1, "minutes").format();
                } else if (interval === 'hour') {
                    end = $moment(start).add(1, "hours").format();
                } else if (interval === 'day') {
                    //console.log($moment(start));
                    end = $moment(start).add(1, "days").format();
                    //console.log("end  ---- end" + end);
                } else if (interval === 'week') {
                    end = $moment(start).add(1, "week").format();
                } else if (interval === 'month') {
                    end = $moment(start).add(1, "months").format();
                } else if (interval === 'year') {
                    end = $moment(start).add(1, "years").format();
                }

                var sEnd = Settings.getEndTimeForDay(end);
                //console.log("start " + start + " end " + end + " send " + sEnd);
                if ($moment(end).isAfter($moment(sEnd))) {
                    end = sEnd;
                }
                //console.log(start + " end --- " + end);
                var randDate = this.getProperDate($moment(start).format(), $moment(end).format());
                return $moment(randDate).format();
            },
            generateRandomNumber: function (start, end) {
                return start + (Math.random() * (end - start));
            },
            getProperDate: function (start, end) {
                console.log('start in proper function is ' + start + " and end is " + end);
                //console.log(">>>> " + new Date(start).getTime());
                var startHour = $moment(start).hours();
                var endHour = ($moment(end).hours() < $moment(Settings.getEndTimeForDay(end)).hours()) ? $moment(end).hours() : $moment(Settings.getEndTimeForDay(end)).hours()
                console.log($moment(end).hours() + " " + $moment(Settings.getEndTimeForDay(end)).hours());
                var date = new Date(+new Date(start).getTime() + Math.random() * (new Date(end).getTime() - new Date(start).getTime()));
                //var sHour = ($moment(start).hours() > startHour) ? $moment(start).hours() : startHour;
                //console.log("start date " + $moment(start).format() + "   " + "end date: " + $moment(end).format());
                //console.log("starthour " + sHour + "   " + "endHour: " + endHour);
                date = $moment(date).format("YYYY-MM-DD");
                var hours = parseInt(startHour + Math.random() * (endHour - startHour)) | 0;
                var minutes = parseInt($moment(start).minutes() + Math.random() * (59 - $moment(start).minutes()));
                console.log("hours and minutes are " + hours + " " + minutes + " " + startHour + "  " + endHour);
                date = $moment(date).add(hours, "hours").add(minutes, "minutes").format();
                //date.setMinutes(new Date(start).getMinutes() + date.getMinutes());
                //console.log("new random date is " + date);
                return date;
            },
            scheduleNotification: function (notification) {
                $cordovaLocalNotification.schedule(notification, function (result) {
                    console.log("Notification scheduled then " + results);
                });
            },
            schedule: function (reminder) {
                console.log("About to schedule reminder " + JSON.stringify(reminder));
                var moment = $moment().format();
                var frequency = parseInt(reminder.frequency);
                var nMin = parseInt(this.getId());
                var notifications = [];

                for (i = 0; i < frequency; i++) {
                    var at = new Date(this.randomDate(moment, reminder.interval));
                    notifications.push({
                        id: parseInt(Number(notificationId) + Number(i)),
                        every: reminder.every,
                        message: reminder.note,
                        title: reminder.title,
                        at: at,
                        data: {id: reminder.id, frequency: reminder.frequency, at: at}
                    });
                }
                console.log("notifications are    " + JSON.stringify(notifications));
                $cordovaLocalNotification.schedule(notifications, function (result) {
                    console.log("Notification scheduled then " + results);
                });
                notificationId = parseInt(notificationId) + parseInt(frequency);
                //console.log("after frequency add, nid is " + notificationId);
                this.setId(notificationId);
                reminder.nIdMin = nMin;
                reminder.nIdMax = parseInt(notificationId) - 1;
                this.saveReminder(reminder);
            },
            delete: function (reminder) {
                var notificationsArray = this.generateNotificationArray(Number(reminder.nIdMin), Number(reminder.nIdMax));
                console.log("Notifications array is " + notificationsArray);
                $cordovaLocalNotification.cancel(notificationsArray, function () {
                    //console.log("Notifications cancelled");
                });
            },
            update: function (notification, newDate) {
                console.log("NEW DATE IS " + new Date(newDate));
                newDate = new Date(newDate).getTime();
                $cordovaLocalNotification.update({id: notification.id, at: newDate, every: notification.every});
                console.log("All notifications" + JSON.stringify($cordovaLocalNotification.getAll()));
            },
            generateNotificationArray: function (min, max) {
                var arrayOfNotifications = Array.apply(null, {length: max + 1 - min}).map(function (_, idx) {
                    return idx + min;
                });
                //console.log("Array of notifications is " + arrayOfNotifications);
                return arrayOfNotifications;
            },
            getId: function () {
                //console.log("notification id is " + notificationId);
                return Number(notificationId);
            },
            setId: function (nid) {
                LocalStorage.set('nid', nid);
            }
        }
    })
    .factory('Settings', function (LocalStorage, $moment) {
        //LocalStorage.remove("xsettings");
        var settings = {};

        if (Object.keys(LocalStorage.getObject('xsettings')).length !== 0) {
            settings = LocalStorage.getObject('xsettings');
            console.log("settings exist");
        } else {
            console.log("settings don't exist ");
            var now = $moment().startOf("day");
            LocalStorage.setObject('xsettings', {
                startTime: now.add(8, "hours").format(),
                endTime: now.add(13, "hours").format(),
                interval: "day",
                frequency: 15
            });
            settings = LocalStorage.getObject('xsettings');
        }
        console.log("setting start time " + new Date(settings.startTime));

        return {
            get: function () {
                return LocalStorage.getObject('xsettings');
            },
            getStartOfDay: function () {
                var date = $moment()
                    .startOf('day')
                    .format();
                return date;
            },
            getEndTimeOfDay: function () {
                var date = $moment()
                    .endOf('day')
                    .format();
                return date;
            },
            getStartTimeForDay: function (date) {
                settings = LocalStorage.getObject('xsettings');
                var shours = $moment(settings.startTime).hours();
                var sminutes = $moment(settings.startTime).minutes();
                var sseconds = $moment(settings.startTime).seconds();

                var startTimeForDay = $moment(date)
                    .startOf("day")
                    .add(shours, 'hours')
                    .add(sminutes, 'minutes')
                    .add(sseconds, 'seconds');
                return startTimeForDay.format();
            },
            getEndTimeForDay: function (date) {
                settings = LocalStorage.getObject('xsettings');
                var ehours = $moment(settings.endTime).hours();
                var eminutes = $moment(settings.endTime).minutes();
                var eseconds = $moment(settings.endTime).seconds();

                console.log("date coming in is " + date + " " + ehours + "  " + eminutes + "   " + eseconds);
                var endTimeForDay = $moment(date)
                    .startOf("day")
                    .add(ehours, 'hours')
                    .add(eminutes, 'minutes')
                    .add(eseconds, 'seconds');
                return endTimeForDay.format();
            },
            save: function (nsettings) {
                settings = nsettings;
                LocalStorage.setObject('xsettings', settings);
            }
        };
    })
    .factory('TimeManipulation', function ($moment, Settings) {
        var interval = "";
        return {
            getNext: function (date, int) {
                interval = int;
                var nextNotificationDate = this.getNextDate(date, interval);
                return nextNotificationDate;
            },
            getNextDate: function (start, interval) {
                console.log(start + " interval   " + interval);
                var check = start;
                var end;
                var sStart = Settings.getStartTimeForDay(start);
                var sEnd = Settings.getEndTimeForDay(start);
                //console.log("sstart  " + $moment(sStart).format() + "  " + $moment(start).format());

                if ($moment(start).isAfter(sEnd) && $moment(start).days() === $moment(sEnd).days()) {
                    start = $moment(Settings.getEndTimeOfDay()).add(1, "seconds");
                    //console.log("START " + start);
                }

                sStart = Settings.getStartTimeForDay(start);
                sEnd = Settings.getEndTimeForDay(start);

                if ($moment(start).isBefore(sStart)) {
                    start = sStart;
                    //console.log("START " + start);
                }

                if (interval === 'minute') {
                    end = $moment(start).add(1, "minutes").format();
                } else if (interval === 'hour') {
                    //end = $moment(start).add(1, "hours").format();
                    var nextHour = $moment(start).startOf("hour").add(1, "hour").format();
                    var endOfNextHour = $moment(nextHour).endOf("hour").format();
                    start = nextHour;
                    end = endOfNextHour;
                } else if (interval === 'day') {
                    //get the next day
                    var nextDay = $moment(start).startOf("day").add(1, "day").format();
                    //get the beginning of the next day
                    var startOfNextDay = Settings.getStartTimeForDay(nextDay); //$moment(nextDay).startOf("day");
                    //get the end of the next day
                    var endOfNextDay = Settings.getEndTimeForDay(nextDay);
                    //set a time inbetween the start and end of the next day
                    start = startOfNextDay
                    end = endOfNextDay;
                    //console.log("end  ---- end" + end);
                } else if (interval === 'week') {
                    var nextWeek = $moment(start).startOf("week").add(1, "week").format();
                    var endOfNextWeek = $moment(nextWeek).endOf("week").format();
                    start = nextWeek;
                    end = endOfNextWeek;
                } else if (interval === 'month') {
                    var nextMonth = $moment(start).startOf("month").add(1, "month").format();
                    var endOfNextMonth = $moment(nextMonth).endOf("month").format();
                    start = nextMonth;
                    end = endOfNextMonth;
                } else if (interval === 'year') {
                    //get the next year
                    var nextYear = $moment(start).startOf("year").add(1, "year").format();
                    //var nextYear = $moment(start).year(nextYearNo).format();
                    //get the beginning of the month
                    //var startOfNextYear = $moment(nextYear).startOf("year").format();
                    //get the end of the month
                    var endOfNextYear = $moment(nextYear).endOf("year").format();
                    //set a time between the beginning and end of the next month
                    start = nextYear;
                    end = endOfNextYear;
                }

                var sEnd = Settings.getEndTimeForDay(end);
                //console.log("start " + start + " end " + end + " send " + sEnd);
                if ($moment(end).isAfter($moment(sEnd))) {
                    end = sEnd;
                }
                //console.log(start + " end --- " + end);
                var randDate = this.getNextDateHelper($moment(start).format(), $moment(end).format());
                return $moment(randDate).format();
            },
            generateRandomTimeStamp: function (start, end) {
                return start + (Math.random() * (end - start));
            },
            getNextDateHelper: function (start, end) {
                console.log('start in proper function is ' + start + " and end is " + end);
                //console.log(">>>> " + new Date(start).getTime());
                var startHour = $moment(start).hours();
                var endHour = ($moment(end).hours() < $moment(Settings.getEndTimeForDay(end)).hours()) ? $moment(end).hours() : $moment(Settings.getEndTimeForDay(end)).hours()
                console.log($moment(end).hours() + " " + $moment(Settings.getEndTimeForDay(end)).hours());
                var date = new Date(+new Date(start).getTime() + Math.random() * (new Date(end).getTime() - new Date(start).getTime()));
                //var sHour = ($moment(start).hours() > startHour) ? $moment(start).hours() : startHour;
                //console.log("start date " + $moment(start).format() + "   " + "end date: " + $moment(end).format());
                //console.log("starthour " + sHour + "   " + "endHour: " + endHour);
                date = $moment(date).format("YYYY-MM-DD");
                var hours = parseInt(startHour + Math.random() * (endHour - startHour)) | 0;
                var minutes = parseInt($moment(start).minutes() + Math.random() * (59 - $moment(start).minutes()));
                console.log("hours and minutes are " + hours + " " + minutes + " " + startHour + "  " + endHour);
                date = $moment(date).add(hours, "hours").add(minutes, "minutes").format();
                //date.setMinutes(new Date(start).getMinutes() + date.getMinutes());
                //console.log("new random date is " + date);
                return date;
            },
        };
    });