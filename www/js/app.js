angular.module('starter', ['ionic', 'bugme.controllers', 'bugme.services', 'ngCordova', 'angular-momentjs'])

    .config(function ($stateProvider, $urlRouterProvider, $momentProvider) {

        $stateProvider

            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('tab.reminders', {
                url: '/reminders',
                cache: false,
                views: {
                    'tab-reminders': {
                        templateUrl: 'templates/tab-reminders.html',
                        controller: 'RemindersCtrl'
                    }
                }
            })

            .state('tab.reminder-detail', {
                url: '/reminders/:reminderId',
                cache: false,
                views: {
                    'tab-reminders': {
                        templateUrl: 'templates/reminder-detail.html',
                        controller: 'ReminderDetailCtrl'
                    }
                }
            })

            .state('tab.add-reminder', {
                url: '/addreminder',
                cache: false,
                views: {
                    'tab-reminders': {
                        templateUrl: 'templates/add-reminder.html',
                        controller: 'AddReminderCtrl',
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                cache: false,
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        $urlRouterProvider.otherwise('/tab/reminders');

        $momentProvider
            .asyncLoading(false)
            .scriptUrl('../lib/momemt/moment.js');

    })
    .run(function ($ionicPlatform, $rootScope, Notifications, $moment, TimeManipulation) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }

            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            if (window.device && window.device.platform === 'iOS') {
                window.plugin.notification.local.registerPermission();
            }

            $rootScope.$on('$cordovaLocalNotification:click',
                function (event, notification, state) {
                    //console.log("Notification was clicked " + notification.data);
                    console.log("All ids are " + JSON.stringify($cordovaLocalNotification.getAllIds()));
                    location.href = "#/tab/reminders/" + JSON.parse(notification.data).id;
                }, this);

            $rootScope.$on('$cordovaLocalNotification:trigger',
                function (event, notification, state) {
                   //console.log(notification + "   " + $moment(notification.at, "X").format() + " was triggered");
                    var now = JSON.parse(notification.data).at;
                    var reminder = Notifications.getReminder(JSON.parse(notification.data).id);
                    console.log("This notification belongs to this reminder " + JSON.parse(notification.data).at + "  " + reminder.interval);
                    var newDate = TimeManipulation.getNext(JSON.parse(notification.data).at, reminder.interval);
                    console.log("Notification before update! New date is now " + newDate + " old date is " + now);
                    //var id = Number(7000000 + Math.random() * (8000000 - 7000000));
                    console.log("the id to be used " + (notification.id*100000) + 1 + " and firstAt " + new Date(newDate));
                    Notifications.update(notification, newDate);

                    /*var newNotification = {
                        id: notification.id,
                        at: new Date(newDate),
                        //every: "0",
                        message: notification.message,
                        title: notification.title,
                        data: notification.data
                    };
                    Notifications.scheduleNotification(newNotification);*/
                    console.log("Notification rescheduled! New notification added " + JSON.stringify(newNotification));
                }, this);
        });
    });