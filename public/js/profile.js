var app = angular.module('profileApp', []);

app.controller('ProfileController', function($scope, $timeout, $http) {
    $scope.successMessage = '';
    $scope.errorMessage = '';
    $scope.fadeOut = false;

    $scope.initUser = function(userData) {
        $scope.user = userData;
    };

    function showNotification(message, isError) {
        if (isError) {
            $scope.errorMessage = message;
            $scope.successMessage = '';
        } else {
            $scope.successMessage = message;
            $scope.errorMessage = '';
        }
        $scope.fadeOut = false;

        $timeout(function() {
            $scope.fadeOut = true;
        }, 3000);

        $timeout(function() {
            $scope.successMessage = '';
            $scope.errorMessage = '';
        }, 3500);
    }

    $scope.updateProfile = function() {
        $http({
            method: 'POST',
            url: '/auth/update',
            data: $scope.user
        }).then(function(response) {
            console.log('Update response:', response);
            if (response.data.success) {
                $scope.user = response.data.user;
                showNotification(response.data.message, false);
            } else {
                showNotification(response.data.message || 'Update failed', true);
            }
        }).catch(function(error) {
            console.error('Update error:', error);
            showNotification(error.data?.message || 'Update failed', true);
        });
    };

    $scope.deleteAccount = function() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            $http({
                method: 'POST',
                url: '/auth/delete'
            }).then(function(response) {
                if (response.data.success) {
                    window.location.href = '/login';
                } else {
                    showNotification(response.data.message, true);
                }
            }).catch(function(error) {
                showNotification(error.data?.message || 'Delete failed', true);
            });
        }
    };

    $scope.logout = function() {
        $http({
            method: 'POST',
            url: '/auth/logout'
        }).then(function() {
            window.location.href = '/login';
        }).catch(function(error) {
            showNotification('Logout failed', true);
        });
    };
}); 