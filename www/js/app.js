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
                views: {
                    'tab-reminders': {
                        templateUrl: 'templates/tab-reminders.html',
                        controller: 'RemindersCtrl'
                    }
                }
            })

            .state('tab.reminder-detail', {
                url: '/reminders/:reminderId',
                views: {
                    'tab-reminders': {
                        templateUrl: 'templates/reminder-detail.html',
                        controller: 'ReminderDetailCtrl'
                    }
                }
            })

            .state('tab.add-reminder', {
                url: '/addreminder',
                views: {
                    'tab-reminders': {
                        templateUrl: 'templates/add-reminder.html',
                        controller: 'AddReminderCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
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
    .run(function ($ionicPlatform, $cordovaLocalNotification, $rootScope, Notifications, $moment) {
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
                    location.href = "#/tab/reminders/" + JSON.parse(notification.data).id;
                });

            $rootScope.$on('$cordovaLocalNotification:trigger',
                function (event, notification, state) {
                    //console.log(notification + "   " + $moment(notification.at, "X").format() + " was triggered");
                    var now = $moment(notification.at, "X").add(5, "minutes").format();
                    var newDate = Notifications.randomDate(now, notification.every);
                    //console.log("Notification before update! New date is now " + newDate + " old date is " + now);
                    $cordovaLocalNotification.update({
                        id: notification.id,
                        at: newDate,
                        every: notification.every,
                        message: notification.message,
                        title: notification.title,
                        data: notification.data
                    });
                    //console.log("Notification updated! New date is now " + newDate + " old date is " + now);
                });
        });
    });