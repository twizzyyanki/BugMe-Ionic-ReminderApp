angular.module('starter.controllers', ['ionic', 'ngStorage', 'ngCordova'])

    .controller('DashCtrl', function ($scope) {
    })

    .controller('RemindersCtrl', function ($scope, Reminders, $ionicPopup) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        $scope.reminders = Reminders.all();
        console.log("Reminders are " + $scope.reminders);
        $scope.remove = function (reminder) {
            Reminders.remove(reminder);
        };
    })

    .controller('ReminderDetailCtrl', function ($scope, $ionicPopup, Reminders, $stateParams, Reminders) {
        $scope.reminder = Reminders.get($stateParams.reminderId);

        $scope.update = function() {
            $scope.reminder.face = ($scope.reminder.active)?'./img/active.png':'./img/inactive.png';
            Reminders.update($scope.reminder);
            $ionicPopup.alert({
                title: 'Success!!!',
                template: 'The reminder has been updated'
            });
        };
    })

    .controller('AddReminderCtrl', function ($scope, $ionicPopup, $rootScope, $state, $ionicPlatform, $cordovaLocalNotification, Reminders) {
        //$scope.reminder = Reminders.get($stateParams.reminderId);

        $scope.reminder = {interval: "Daily", frequency: 1};

        $scope.save = function(){

            var newreminder = {
                id: Reminders.size(),
                title: $scope.reminder.title,
                note: $scope.reminder.note,
                face: ($scope.reminder.active)?'./img/active.png':'./img/inactive.png',
                active: $scope.reminder.active,
                interval: $scope.reminder.interval,
                frequency: $scope.reminder.frequency
            };
            Reminders.add(newreminder);

            //$scope.reminders = Reminders.all();

            var alarmTime = new Date();
            alarmTime.setMinutes(alarmTime.getMinutes() + 1);

            var now             = new Date().getTime(),
                _5_sec_from_now = new Date(now + 5*1000);

            $cordovaLocalNotification.schedule({
                id: "1234",
                every: "minute",
                message: "This is a message",
                title: "This is a title",
                data: newreminder.id


            }).then(function () {
                console.log("The notification has been set");


            });
            $state.go("tab.reminders");
        };
    })

    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
