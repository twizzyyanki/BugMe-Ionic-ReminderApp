angular.module('starter.services', [])

    .factory('Reminders', function (LocalStorage) {
        // Might use a resource here that returns a JSON array
        //LocalStorage.clear();
        var reminders = [];

        if(LocalStorage.getArray('xreminders')) {
            console.log("xreminder exists");
            reminders = LocalStorage.getArray('xreminders');
        } else {
            console.log("no xreminder exists");
            LocalStorage.setArray('xreminders', []);
            reminders = LocalStorage.getArray('xreminders');
        }

        console.log("empty array " + [] + " " + typeof []);
        // Some fake testing data
       /* var reminders = [{
            id: 0,
            title: 'Ben Sparrow',
            note: 'You on your way?',
            face: './img/active.png',
            active: true,
            frequency: 1,
            interval: 'Weekly'

        }, {
            id: 1,
            title: 'Max Lynx',
            note: 'Hey, it\'s me',
            face: './img/inactive.png',
            active: false,
            frequency: 5,
            interval: 'Daily'
        }, {
            id: 2,
            title: 'Adam Bradleyson',
            note: 'I should buy a boat',
            face: './img/active.png',
            active: true,
            frequency: 10,
            interval: 'Daily'
        }, {
            id: 3,
            title: 'Perry Governor',
            note: 'Look at my mukluks!',
            face: './img/inactive.png',
            active: false,
            frequency: 1,
            interval: 'Daily'
        }, {
            id: 4,
            title: 'Mike Harrington',
            note: 'This is wicked good ice cream.',
            face: './img/active.png',
            active: true,
            frequency: 1,
            interval: 'Daily'
        }]; */

        return {
            all: function () {
                return reminders;
            },
            remove: function (reminder) {
                reminders.splice(reminders.indexOf(reminder), 1);
                LocalStorage.set('xreminders', JSON.stringify(reminders));
            },
            update: function(reminder) {
                console.log(JSON.stringify(reminders[reminder.id]) + "   " + JSON.stringify(reminder));
                reminders[reminder.id] = reminder;
                LocalStorage.set('xreminders', JSON.stringify(reminders));
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
            size: function() {
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
            clear: function() {
                $window.localStorage.clear();
            },
            remove: function(key) {
                $window.localStorage.removeItem(key);
            }
        }
    }]);
