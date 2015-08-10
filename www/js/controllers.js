angular.module('bugme.controllers', ['ionic', 'ngStorage', 'ngCordova'])

    .controller('DashCtrl', function ($scope, Reminders, filterFilter, Notifications) {
        $scope.$on('$ionicView.enter', function(e) {
            $scope.reminders = Reminders.all();
            $scope.inactive = filterFilter($scope.reminders, 'inactive');
            $scope.active = $scope.reminders.length - $scope.inactive.length;
            $scope.totalNotifications = Notifications.getId();
        });
    })

    .controller('RemindersCtrl', function ($scope, Reminders, $state) {

        $scope.reminders = Reminders.all();

        $scope.$on('$ionicView.enter', function(e) {
            $scope.reminders = Reminders.all();
        });

        $scope.remove = function (reminder) {
            Reminders.remove(reminder);
            $state.go($state.current, {}, {reload: true});
        };
    })

    .controller('ReminderDetailCtrl', function ($scope, $ionicPopup, Reminders, $stateParams, $state) {
        $scope.reminder = Reminders.get($stateParams.reminderId);
        $scope.oldReminderObject = angular.copy($scope.reminder);

        $scope.update = function () {
            if(!$scope.reminder.title) {
                $ionicPopup.alert({
                    title: 'Error!!!',
                    template: "<div class='center'>Title cannot be empty</div>"
                });
                return;
            }
            $scope.reminder.face = ($scope.reminder.active) ? './img/active.png' : './img/inactive.png';
            Reminders.update($scope.reminder, $scope.oldReminderObject);
            $ionicPopup.alert({
                title: 'Success!!!',
                template: "<div class='center'>The reminder has been updated</div>"
            });
        };

        $scope.remove = function () {
            Reminders.remove($scope.reminder);
            $state.go("tab.reminders");
        };
    })

    .controller('AddReminderCtrl', function ($scope, $ionicPopup, $rootScope, $state, $ionicPlatform, Reminders, Notifications, Settings) {

        $scope.reminder = {interval: Settings.get().interval, frequency: Settings.get().frequency};

        $scope.save = function () {

            if(!$scope.reminder.title) {
                $ionicPopup.alert({
                    title: 'Error!!!',
                    template: "<div class='center'>Title cannot be empty</div>"
                });
                return;
            }

            var newreminder = {
                id: Reminders.size(),
                title: $scope.reminder.title,
                note: $scope.reminder.note,
                face: ($scope.reminder.active) ? './img/active.png' : './img/inactive.png',
                active: $scope.reminder.active,
                interval: $scope.reminder.interval,
                frequency: parseInt($scope.reminder.frequency),
                nIdMin: -2,
                nIdMax: -1
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

        $scope.save = function () {
            if ($moment($scope.settings.endTime).diff($moment($scope.settings.startTime), "hours") < 1) {
                $ionicPopup.alert({
                    title: 'Error!!!',
                    template: "<div class='center'>End time has to be after start time by at least 1 hour</div>"
                });
                return;
            }
            Settings.save($scope.settings);
            $ionicPopup.alert({
                title: 'Success!!!',
                template: "<div class='center'>Settings saved</div>"
            });
        };
    });