angular.module('reviewApp', [])
.controller('ReviewController', function($scope) {
    $scope.reviews = [
        { brand: 'Brand A', comment: 'Sangat nyaman dan suara jernih.', likes: 0, dislikes: 0, rating: 4 },
        { brand: 'Brand B', comment: 'Bass terlalu kuat, tidak cocok untuk semua genre.', likes: 0, dislikes: 0, rating: 3 },
        { brand: 'Brand C', comment: 'Desain keren dan ringan.', likes: 0, dislikes: 0, rating: 5 }
    ];

    $scope.likeReview = function(review) {
        review.likes++;
    };

    $scope.dislikeReview = function(review) {
        review.dislikes++;
    };
});
