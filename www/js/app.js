// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'bugme.controllers', 'bugme.services', 'ngCordova', 'angular-momentjs'])

    .config(function ($stateProvider, $urlRouterProvider, $momentProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            // Each tab has its own nav history stack:

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

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/reminders');

        $momentProvider
            .asyncLoading(false)
            .scriptUrl('../lib/momemt/moment.js');

    })
    .run(function ($ionicPlatform, $cordovaLocalNotification, $rootScope, Notifications) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }

            if (window.device && window.device.platform === 'iOS') {
                window.plugin.notification.local.registerPermission();
            }

            $rootScope.$on('$cordovaLocalNotification:click',
                function (event, notification, state) {
                    console.log("Notification was clicked " + notification.data);
                    location.href = "#/tab/reminders/" + JSON.parse(notification.data).id;
                    //$state.go("#/tab/reminders/" + notification.data.rid);
                });

            $rootScope.$on('$cordovaLocalNotification:trigger',
                function (event, notification, state) {
                    console.log(notification + "   " + notification.at + " was triggered");
                });
        });
    });
