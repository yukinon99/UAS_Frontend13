angular.module('reviewApp', [])
.controller('ReviewController', function($scope, $window, $http, $timeout) {
    // Navigation functions
    $scope.goToProfile = function() {
        // Cek session terlebih dahulu
        $http.get('/check-session')
            .then(function(response) {
                if (response.data.isLoggedIn) {
                    $window.location.href = '/profile.html';
                } else {
                    $window.location.href = '/login.html';
                }
            })
            .catch(function(error) {
                console.error('Session check failed:', error);
                $window.location.href = '/login.html';
            });
    };

    $scope.goToMain = function() {
        $window.location.href = '/main.html';
    };

    $scope.goToSearch = function() {
        $window.location.href = '/search.html';
    };

    $scope.goToReview = function() {
        $window.location.href = '/review.html';
    };

    // Pagination variables
    $scope.currentPage = 0;
    $scope.pageSize = 4;
    $scope.reviews = [];
    
    // Get reviews from server
    $scope.loadReviews = function() {
        $http.get('/api/reviews')
            .then(function(response) {
                $scope.reviews = response.data;
                $scope.totalItems = $scope.reviews.length;
                $scope.pageCount = Math.ceil($scope.totalItems / $scope.pageSize);
                
                // Set timeout untuk update otomatis
                $timeout(function() {
                    $scope.loadReviews();
                }, 2000); // Update setiap 2 detik
            })
            .catch(function(error) {
                console.error('Error loading reviews:', error);
            });
    };

    // Get current page reviews
    $scope.getCurrentReviews = function() {
        var begin = $scope.currentPage * $scope.pageSize;
        var end = begin + $scope.pageSize;
        return $scope.reviews.slice(begin, end);
    };

    // Change page with smooth transition
    $scope.changePage = function(newPage) {
        if (newPage >= 0 && newPage < $scope.pageCount) {
            // Tambahkan class untuk animasi fade out
            angular.element(document.querySelector('.row')).addClass('fade-out');
            
            $timeout(function() {
                $scope.currentPage = newPage;
                // Tambahkan class untuk animasi fade in
                angular.element(document.querySelector('.row')).removeClass('fade-out').addClass('fade-in');
                
                $timeout(function() {
                    angular.element(document.querySelector('.row')).removeClass('fade-in');
                }, 300);
            }, 300);
        }
    };

    // Previous page with animation
    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.changePage($scope.currentPage - 1);
        }
    };

    // Next page with animation
    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.pageCount - 1) {
            $scope.changePage($scope.currentPage + 1);
        }
    };

    // Get array for pagination numbers
    $scope.getPages = function() {
        return new Array($scope.pageCount);
    };

    // Load initial data
    $scope.loadReviews();

    // Cleanup when controller is destroyed
    $scope.$on('$destroy', function() {
        if ($timeout.cancel) {
            $timeout.cancel($scope.loadReviews);
        }
    });

    // Initialize review data
    $scope.newReview = {
        productName: '',
        brand: '',
        rating: 5,
        comment: '',
        likes: 0,
        dislikes: 0
    };
    $scope.isEditing = false;

    // Create/Edit review modal
    $scope.openReviewModal = function(review) {
        if (review) {
            // Edit mode
            $scope.isEditing = true;
            $scope.newReview = {
                _id: review._id,
                productName: review.productName,
                brand: review.brand,
                rating: review.rating,
                comment: review.comment
            };
        } else {
            // Create mode
            $scope.isEditing = false;
            $scope.newReview = {
                productName: '',
                brand: '',
                rating: 5,
                comment: '',
                likes: 0,
                dislikes: 0
            };
        }
        
        var reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
        reviewModal.show();
    };

    // Save review
    $scope.saveReview = function() {
        if ($scope.isEditing) {
            // Update existing review
            $http.put('/api/reviews/' + $scope.newReview._id, $scope.newReview)
                .then(function(response) {
                    var index = $scope.reviews.findIndex(r => r._id === $scope.newReview._id);
                    if (index !== -1) {
                        $scope.reviews[index] = response.data;
                    }
                    bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
                    alert('Review updated successfully!');
                })
                .catch(function(error) {
                    console.error('Error updating review:', error);
                    alert('Failed to update review');
                });
        } else {
            // Create new review
            $http.post('/api/reviews', $scope.newReview)
                .then(function(response) {
                    $scope.reviews.push(response.data);
                    bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
                    alert('Review added successfully!');
                })
                .catch(function(error) {
                    console.error('Error adding review:', error);
                    alert('Failed to add review');
                });
        }
    };

    // Delete review
    $scope.deleteReview = function(review) {
        if (confirm('Are you sure you want to delete this review?')) {
            $http.delete('/api/reviews/' + review._id)
                .then(function() {
                    var index = $scope.reviews.indexOf(review);
                    $scope.reviews.splice(index, 1);
                    alert('Review deleted successfully!');
                })
                .catch(function(error) {
                    console.error('Error deleting review:', error);
                    alert('Failed to delete review');
                });
        }
    };

    // Like/Dislike functions
    $scope.likeReview = function(review) {
        $http.post('/api/reviews/' + review._id + '/like')
            .then(function(response) {
                review.likes = response.data.likes;
            })
            .catch(function(error) {
                console.error('Error liking review:', error);
            });
    };

    $scope.dislikeReview = function(review) {
        $http.post('/api/reviews/' + review._id + '/dislike')
            .then(function(response) {
                review.dislikes = response.data.dislikes;
            })
            .catch(function(error) {
                console.error('Error disliking review:', error);
            });
    };
});
