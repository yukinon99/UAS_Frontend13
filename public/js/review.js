angular.module('reviewApp', [])
.controller('ReviewController', function($scope, $window, $http) {
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

    // Initialize review data
    $scope.reviews = [];
    $scope.newReview = {
        productName: '',
        brand: '',
        rating: 5,
        comment: '',
        likes: 0,
        dislikes: 0
    };
    $scope.isEditing = false;

    // Load reviews
    $scope.loadReviews = function() {
        $http.get('/api/reviews')
            .then(function(response) {
                $scope.reviews = response.data;
            })
            .catch(function(error) {
                console.error('Error loading reviews:', error);
            });
    };

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

    // Load initial data
    $scope.loadReviews();
});
