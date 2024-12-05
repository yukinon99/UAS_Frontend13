angular.module('productApp', [])
    .controller('SearchController', function ($scope) {
        $scope.products = [
            { name: 'Product 1', brand: 'Brand A', price: 100, type: 'Type 1' },
            { name: 'Product 2', brand: 'Brand B', price: 200, type: 'Type 2' },
            { name: 'Product 3', brand: 'Razer', price: 150, type: 'Gaming' },
            { name: 'Product 4', brand: 'Sony', price: 250, type: 'Casual' },
            // Tambahkan produk lainnya di sini
        ];

        $scope.searchQuery = '';
        $scope.selectedBrand = '';
        $scope.selectedType = '';
        $scope.maxPrice = '';

        // Fungsi untuk memfilter produk
        $scope.filterProducts = function (product) {
            return (!$scope.searchQuery || product.name.toLowerCase().includes($scope.searchQuery.toLowerCase())) &&
                (!$scope.selectedBrand || product.brand === $scope.selectedBrand) &&
                (!$scope.selectedType || product.type === $scope.selectedType) &&
                (!$scope.maxPrice || product.price <= $scope.maxPrice);
        };

        // Fungsi untuk memilih merek tertentu
        $scope.setBrandFilter = function (brand) {
            $scope.selectedBrand = brand; // Atur merek yang dipilih
        };

        // Fungsi untuk mereset semua filter
        $scope.resetFilters = function () {
            $scope.searchQuery = '';
            $scope.selectedBrand = '';
            $scope.selectedType = '';
            $scope.maxPrice = '';
        };
    });
