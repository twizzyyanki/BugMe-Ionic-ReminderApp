angular.module('starter.controllers', ['ionic', 'ngStorage', 'ngCordova'])

    .controller('DashCtrl', function ($scope, Reminders, filterFilter, Notifications) {
        $scope.$on('$ionicView.enter', function(e) {
            $scope.reminders = Reminders.all();
            $scope.inactive = filterFilter($scope.reminders, 'inactive');
            $scope.active = $scope.reminders.length - $scope.inactive.length;
            $scope.totalNotifications = Notifications.getId();
        });

    })

    .controller('RemindersCtrl', function ($scope, Reminders, $ionicPopup) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        $scope.$on('$ionicView.enter', function(e) {
            $scope.reminders = Reminders.all();
        });


        console.log("Reminders are " + $scope.reminders);
        $scope.remove = function (reminder) {
            Reminders.remove(reminder);
        };
    })

    .controller('ReminderDetailCtrl', function ($scope, $ionicPopup, Reminders, $stateParams, Reminders) {
        $scope.reminder = Reminders.get($stateParams.reminderId);

        $scope.update = function () {
            $scope.reminder.face = ($scope.reminder.active) ? './img/active.png' : './img/inactive.png';
            Reminders.update($scope.reminder);
            $ionicPopup.alert({
                title: 'Success!!!',
                template: 'The reminder has been updated'
            });
        };
    })

    .controller('AddReminderCtrl', function ($scope, $ionicPopup, $rootScope, $state, $ionicPlatform, Reminders, Notifications, Settings) {
        //$scope.reminder = Reminders.get($stateParams.reminderId);
        console.log("settings interval" + Settings.get().interval);
        $scope.reminder = {interval: Settings.get().interval, frequency: Settings.get().frequency};

        $scope.save = function () {

            var newreminder = {
                id: Reminders.size(),
                title: $scope.reminder.title,
                note: $scope.reminder.note,
                face: ($scope.reminder.active) ? './img/active.png' : './img/inactive.png',
                active: $scope.reminder.active,
                interval: $scope.reminder.interval,
                frequency: $scope.reminder.frequency
            };
            Reminders.add(newreminder);
            if(newreminder.active) {
                Notifications.schedule(newreminder);
            }
            $scope.reminder = {interval: Settings.get().interval, frequency: Settings.get().frequency};
            $state.go("tab.reminders");
        };
    })

    .controller('AccountCtrl', function ($scope, Settings, $moment, $ionicPopup) {
        $scope.settings = Settings.get();
        $scope.settings.startTime = new Date($scope.settings.startTime);
        $scope.settings.endTime = new Date($scope.settings.endTime);
        //console.log($moment($scope.settings.endTime).diff($moment($scope.settings.startTime), "minutes"));
        $scope.save = function () {
            if ($moment($scope.settings.endTime).diff($moment($scope.settings.startTime), "minutes") < 1) {
                $ionicPopup.alert({
                    title: 'Error!!!',
                    template: 'End time has to be after start time by at least 1 minute'
                });
                return;
            }
            Settings.save($scope.settings);
            $ionicPopup.alert({
                title: 'Success!!!',
                template: 'Settings saved'
            });

        };
    });