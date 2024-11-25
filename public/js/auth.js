const authApp = angular.module('authApp', []);

authApp.controller('AuthController', function($scope, $http, $window) {
    // Inisialisasi model user
    $scope.user = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    };

    // Fungsi untuk login
    $scope.login = function() {
        if (!$scope.user.email || !$scope.user.password) {
            $scope.showError('Mohon isi semua field');
            return;
        }

        $http.post('/api/auth/login', {
            email: $scope.user.email,
            password: $scope.user.password
        })
        .then(function(response) {
            if (response.data.success) {
                // Langsung redirect ke main.html
                $window.location.href = '/main.html';
            }
        })
        .catch(function(error) {
            $scope.showError(error.data.message || 'Login gagal. Silakan coba lagi.');
        });
    };

    // Fungsi untuk register
    $scope.register = function() {
        console.log('Form data:', {
            username: $scope.user.username,
            email: $scope.user.email,
            passwordLength: $scope.user.password?.length
        });
        
        if (!$scope.validateRegistration()) {
            console.log('Validation failed');
            return;
        }

        $http.post('/api/auth/register', {
            username: $scope.user.username,
            email: $scope.user.email,
            password: $scope.user.password
        })
        .then(function(response) {
            console.log('Server response:', response.data);
            if (response.data.success) {
                $window.location.href = '/login?registered=true';
            }
        })
        .catch(function(error) {
            console.error('Detail error:', error.response?.data);
            $scope.showError(error.response?.data?.message || 'Registrasi gagal. Silakan periksa kembali data Anda.');
        });
    };

    // Validasi form registrasi
    $scope.validateRegistration = function() {
        // Validasi username
        if ($scope.user.username.length < 3) {
            $scope.showError('Username minimal 3 karakter');
            return false;
        }

        // Validasi email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test($scope.user.email)) {
            $scope.showError('Format email tidak valid');
            return false;
        }

        // Validasi password yang lebih sederhana
        if ($scope.user.password.length < 6) {
            $scope.showError('Password minimal 6 karakter');
            return false;
        }

        if ($scope.user.password !== $scope.user.confirmPassword) {
            $scope.showError('Password dan konfirmasi password tidak cocok');
            return false;
        }

        if (!$scope.user.acceptTerms) {
            $scope.showError('Anda harus menyetujui Syarat & Ketentuan');
            return false;
        }

        // Validasi password yang lebih kuat
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!strongPasswordRegex.test($scope.user.password)) {
            $scope.showError('Password harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, dan angka');
            return false;
        }

        return true;
    };

    // Fungsi untuk menampilkan pesan error
    $scope.showError = function(message) {
        $scope.errorMessage = message;
        // Auto-hide error message after 5 seconds
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.closeAlert();
            });
        }, 5000);
    };

    // Fungsi untuk menutup alert
    $scope.closeAlert = function() {
        $scope.errorMessage = null;
    };

    // Cek apakah user sudah login
    $scope.checkAuth = function() {
        const token = localStorage.getItem('token');
        if (token) {
            // Validasi token
            $http.get('/api/auth/validate', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(function(response) {
                if (response.data.valid) {
                    // Redirect ke profile jika sudah login
                    $window.location.href = '/profile';
                }
            })
            .catch(function() {
                // Hapus token jika tidak valid
                localStorage.removeItem('token');
            });
        }
    };

    // Fungsi untuk logout
    $scope.logout = function() {
        localStorage.removeItem('token');
        $window.location.href = '/login';
    };

    // Inisialisasi - cek status login ketika halaman dimuat
    if ($window.location.pathname === '/login' || $window.location.pathname === '/register') {
        $scope.checkAuth();
    }

    // Cek apakah ada pesan registrasi sukses
    if ($window.location.search.includes('registered=true')) {
        $scope.successMessage = 'Registration successful! Please login.';
    }
});

// HTTP Interceptor untuk menangani token
authApp.factory('authInterceptor', function($window) {
    return {
        request: function(config) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = 'Bearer ' + token;
            }
            return config;
        },
        responseError: function(rejection) {
            if (rejection.status === 401) {
                localStorage.removeItem('token');
                $window.location.href = '/login';
            }
            return Promise.reject(rejection);
        }
    };
});

// Daftarkan interceptor
authApp.config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
}); 