angular.module('productApp', [])
.controller('SearchController', function($scope) {
    $scope.products = [
        { name: 'Product 1', brand: 'Brand A', price: 100, type: 'Type 1' },
        { name: 'Product 2', brand: 'Brand B', price: 200, type: 'Type 2' },
        // Tambahkan produk lainnya di sini
    ];

    $scope.searchQuery = '';
    $scope.selectedBrand = '';
    $scope.selectedType = '';
    $scope.maxPrice = '';

    $scope.filterProducts = function(product) {
        return (!$scope.searchQuery || product.name.toLowerCase().includes($scope.searchQuery.toLowerCase())) &&
               (!$scope.selectedBrand || product.brand === $scope.selectedBrand) &&
               (!$scope.selectedType || product.type === $scope.selectedType) &&
               (!$scope.maxPrice || product.price <= $scope.maxPrice);
    };
});
