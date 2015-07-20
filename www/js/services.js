angular.module('bugme.services', [])

    .factory('Reminders', function (LocalStorage, Notifications) {
        // Might use a resource here that returns a JSON array
        //LocalStorage.clear();
        var reminders = [];

        if (LocalStorage.getArray('xreminders')) {
            console.log("xreminder exists");
            reminders = LocalStorage.getArray('xreminders');
        } else {
            console.log("no xreminder exists");
            LocalStorage.setArray('xreminders', []);
            reminders = LocalStorage.getArray('xreminders');
        }

        return {
            all: function () {
                return reminders;
            },
            remove: function (reminder) {
                reminders.splice(reminders.indexOf(reminder), 1);
                LocalStorage.set('xreminders', JSON.stringify(reminders));
                Notifications.delete(reminder);
            },
            save: function(reminder) {
                reminders[reminder.id] = reminder;
                LocalStorage.set('xreminders', JSON.stringify(reminders));
            },
            update: function (reminder, oldReminder) {
                console.log("getting to the update function in services");
                //if nothing changed, don't do an update
                if(JSON.stringify(reminder) === JSON.stringify(oldReminder) ) {
                    console.log("old reminder is equal to new reminder");
                    return;
                }
                console.log(JSON.stringify(reminders[reminder.id]) + "   " + JSON.stringify(reminder));
                reminders[reminder.id] = reminder;
                LocalStorage.set('xreminders', JSON.stringify(reminders));

                if(reminder.active && !oldReminder.active) {
                    console.log("reschedule reminders " + reminder.active + " " + oldReminder.active);
                    Notifications.schedule(reminder);
                }

                if(!reminder.active && oldReminder.active) {
                    console.log("delete reminders " + reminder.active + " " + oldReminder.active);
                    Notifications.delete(reminder);
                }

                if(oldReminder.active && reminder.active) {
                    if(reminder.frequency !== oldReminder.frequency || reminder.interval !== oldReminder.interval) {
                        console.log("delete and reschedule reminders " + reminder.active + " " + oldReminder.active);
                        Notifications.delete(reminder);
                        Notifications.schedule(reminder);
                    }
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
                LocalStorage.set('xreminders', JSON.stringify(reminders));
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
            console.log("nid exists");
            notificationId = LocalStorage.get('nid');
        } else {
            console.log("no nid exists");
            LocalStorage.set('nid', 0);
        }

        return {
            saveReminder: function(reminder) {
                var reminders = LocalStorage.get("xreminders");
                reminders[reminder.id] = reminder;
                LocalStorage.set('xreminders', JSON.stringify(reminders));
            },
            randomDate: function (start, interval) {
                console.log(start + " interval   " + interval );
                //start = new Date(start);
                var check = start;
                var end;
                var sStart = Settings.getStartTimeForDay(start);
                var sEnd = Settings.getEndTimeForDay(start);
                console.log("sstart  " + $moment(sStart).format() + "  " + $moment(start).format());
                if($moment(start).isBefore(sStart)) {
                    start = sStart;
                    console.log("START " + start);
                }
                if($moment(start).isAfter(sEnd)) {
                    start = $moment(sStart).add(1, "days");
                    console.log("START " + start);
                }

                if(interval === 'minute') {
                    end = $moment(start).add(1, "minutes").format();
                } else if(interval === 'hour') {
                    end = $moment(start).add(1, "hours").format();
                } else if(interval === 'day') {
                    console.log($moment(start));
                    end = $moment(start).add(1, "days").format();
                    console.log("end  ---- end" + end);
                } else if(interval === 'month') {
                    end = $moment(start).add(1, "months").format();
                } else if(interval === 'year') {
                    end = $moment(start).add(1, "years").format();
                }

                var sEnd = Settings.getEndTimeForDay(end);
                console.log("start " + start + " end " + end + " send " + sEnd);
                if($moment(end).isAfter($moment(sEnd))) {
                    end = sEnd;
                }
                console.log(start + " end --- " + end);

                var randDate = this.getProperDate($moment(start).format(), $moment(end).format());

                console.log("new date " + new Date(randDate) + " " + randDate);
                return $moment(randDate).format();
            },
            generateRandomNumber: function(start, end) {
                return start + (Math.random() * (end - start));
            },
            getProperDate: function (start, end) {
                console.log(">>>> " + new Date(start).getTime());
                var startHour = $moment(Settings.getStartTime()).hours();
                var endHour = ($moment(end).hours() < $moment(Settings.getEndTime()).hours())?$moment(end).hours():$moment(Settings.getEndTime()).hours()
                var date = new Date(+new Date(start).getTime() + Math.random() * (new Date(end).getTime() - new Date(start).getTime()));
                var sHour = ($moment(start).hours() > startHour)?$moment(start).hours():startHour;
                console.log("start date " + $moment(start).format() + "   " + "end date: " + $moment(end).format());
                console.log("starthour " + sHour + "   " + "endHour: " + endHour);
                var hour = sHour + Math.random() * (endHour - sHour) | 0;
                date.setHours(hour);
                date.setMinutes(new Date(start).getMinutes() + date.getMinutes());
                console.log("new random date is " + date);
                return date;
            },
            schedule: function (reminder) {

                var moment = $moment().format();
                console.log("moment ---- " + moment);
                var frequency = parseInt(reminder.frequency);
                console.log("REMINDER FREQUENCY IS " + reminder.frequency);
                console.log("Random date is " + new Date(this.randomDate(moment, reminder.interval)));
                var nMin = parseInt(this.getId()) + 1;
                var notifications = [];
                for (i = 0; i < frequency; i++) {
                    notifications.push({
                        id: parseInt(this.getId()) + i + 1,
                        every: reminder.interval,
                        message: reminder.note,
                        title: reminder.title,
                        at: new Date(this.randomDate(moment, reminder.interval)),
                        data: {id:reminder.id, frequency: reminder.frequency}
                    });
                }
                console.dir("notifications are    " + JSON.stringify(notifications));
                $cordovaLocalNotification.schedule(notifications).then(function(){
                    console.log("Notifications scheduled");

                });
                notificationId = parseInt(notificationId) + parseInt(frequency);
                console.log("after frequency add, nid is " + notificationId);
                this.setId(notificationId);
                reminder.nIdMin = Number(nMin);
                reminder.nIdMax = Number(notificationId);
                this.saveReminder(reminder);
            },
            delete: function(reminder) {
                var notificationsArray = this.generateNotificationArray(Number(reminder.nIdMin), Number(reminder.nIdMax));
                $cordovaLocalNotification.cancel(notificationsArray, function(){
                    console.log("Notifications cancelled");
                });
            },
            generateNotificationArray: function(min, max) {
                var arrayOfNotifications = Array.apply(null, {length: max + 1 - min}).map(function(_, idx) {
                    return idx + min;
                });
                console.log("Array of notifications is " + arrayOfNotifications);
                return arrayOfNotifications;
            },
            getId: function() {
                console.log("notification id is " + notificationId);
                return Number(notificationId);
            },
            setId: function(nid) {
                LocalStorage.set('nid', nid);
            }
        }
    })
    .factory('Settings', function (LocalStorage, $moment) {
        //LocalStorage.remove("xsettings");
        var settings = {};

        if (Object.keys(LocalStorage.getObject('xsettings')).length !== 0) {
            console.log("xsettings exists");
            settings = LocalStorage.getObject('xsettings');
        } else {
            console.log("no xsetting exists");
            LocalStorage.setObject('xsettings', {
                startTime: new Date(1970, 0, 1, 8, 0, 0),
                endTime: new Date(1970, 0, 1, 21, 0, 0),
                interval: "day",
                frequency: 15
            });
            settings = LocalStorage.getObject('xsettings');
        }
        console.log("setting start time " + new Date(settings.startTime));
        var shours = $moment(settings.startTime).hours();
        var sminutes = $moment(settings.startTime).minutes();
        var sseconds = $moment(settings.startTime).seconds();

        var ehours = $moment(settings.endTime).hours();
        var eminutes = $moment(settings.endTime).minutes();
        var eseconds = $moment(settings.endTime).seconds();

        return {
            get: function () {
                return settings;
            },
            getStartTime: function() {
                var date = $moment()
                    .startOf('day')
                    .add(shours, 'hours')
                    .add(sminutes, 'minutes')
                    .add(sseconds, 'seconds');
                return date;
            },
            getEndTime: function() {
                var date = $moment()
                    .startOf('day')
                    .add(ehours, 'hours')
                    .add(eminutes, 'minutes')
                    .add(eseconds, 'seconds');
                return date;
            },
            getStartTimeForDay: function(date) {
               // date = new Date($moment(date));
              //  console.log("date    " + date.toString());
               // var dateString = date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate();
                var startTimeForDay = $moment(date.toString(), "YYYY-MM-DD")
                    .add(shours, 'hours')
                    .add(sminutes, 'minutes')
                    .add(sseconds, 'seconds');
                //console.log("startTimeForDay " + startTimeForDay.format() + "   " + $moment(date.toString(), "YYYY-MM-DD").format());
                return startTimeForDay.format();
            },
            getEndTimeForDay: function(date) {
               // date = $moment(date);
              //  console.log("date in getend time " + date);
                //var dateString = date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate();
               // console.log("dateString " + dateString);
                var endTimeForDay = $moment(date.toString(), "YYYY-MM-DD")
                    .add(ehours, 'hours')
                    .add(eminutes, 'minutes')
                    .add(eseconds, 'seconds');
                //console.log("end time of the day is " + endTimeForDay.format() + " " + ehours + " " + eminutes);
                return endTimeForDay.format();
            },
            save: function (settings) {
                LocalStorage.set('xsettings', JSON.stringify(settings));
            }
        };
    });