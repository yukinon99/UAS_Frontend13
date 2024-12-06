angular.module('searchApp', [])
    .controller('SearchController', function ($scope, $window, $http) {
        // Fungsi untuk navigasi ke halaman utama
        $scope.goToMain = function() {
            $window.location.href = '/main.html';
        };

        // Fungsi untuk navigasi ke halaman review
        $scope.goToReview = function() {
            $window.location.href = '/review.html';
        };

        // Fungsi untuk navigasi ke profile dengan pengecekan session
        $scope.goToProfile = function() {
            // Cek session terlebih dahulu
            $http.get('/check-session')
                .then(function(response) {
                    if (response.data.isLoggedIn) {
                        $window.location.href = '/profile';
                    } else {
                        $window.location.href = '/login';
                    }
                })
                .catch(function(error) {
                    console.error('Session check failed:', error);
                    $window.location.href = '/login';
                });
        };

        // Inisialisasi variabel pencarian
        $scope.searchQuery = '';
        $scope.filters = {
            budget: '',
            brands: {},
            types: {}
        };

        // Available brands and types
        $scope.brands = ['Razer', 'HyperX', 'SteelSeries', 'Logitech', 'Sony', 'Bose', 'JBL'];
        $scope.types = ['Gaming', 'Sports', 'Casual'];

        // Function to reset filters
        $scope.resetFilters = function() {
            $scope.searchQuery = '';
            $scope.filters = {
                budget: '',
                brands: {},
                types: {}
            };
            $scope.applyFilters();
        };

        // Function to apply filters
        $scope.applyFilters = function() {
            $scope.filteredProducts = $scope.products.filter(function(product) {
                // Search query filter
                if ($scope.searchQuery && !product.name.toLowerCase().includes($scope.searchQuery.toLowerCase())) {
                    return false;
                }

                // Budget filter
                if ($scope.filters.budget) {
                    var [min, max] = $scope.filters.budget.split('-').map(Number);
                    if (max) {
                        if (product.price < min || product.price > max) return false;
                    } else {
                        // Untuk kasus "500+" (di atas 500)
                        if (product.price < min) return false;
                    }
                }

                // Brand filter
                var selectedBrands = Object.keys($scope.filters.brands).filter(brand => $scope.filters.brands[brand]);
                if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
                    return false;
                }

                // Type filter
                var selectedTypes = Object.keys($scope.filters.types).filter(type => $scope.filters.types[type]);
                if (selectedTypes.length > 0 && !selectedTypes.includes(product.type)) {
                    return false;
                }

                return true;
            });
        };

        // Fungsi untuk melakukan pencarian
        $scope.search = function() {
            $scope.applyFilters();
        };

        // Function to view product details
        $scope.viewDetails = function(product) {
            // Tutup details yang lain jika ada
            $scope.products.forEach(p => {
                if (p !== product) p.showDetails = false;
            });
            // Toggle details untuk produk yang diklik
            product.showDetails = !product.showDetails;
        };

        $scope.closeDetails = function(product) {
            product.showDetails = false;
        };

        // Optional: Tutup details saat klik di luar
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.product-card')) {
                $scope.$apply(function() {
                    $scope.products.forEach(p => p.showDetails = false);
                });
            }
        });

        // Function to add to wishlist
        $scope.addToWishlist = function(product) {
            $http.post('/api/wishlist', product)
                .then(function(response) {
                    alert('Product added to wishlist!');
                })
                .catch(function(error) {
                    console.error('Error adding to wishlist:', error);
                    alert('Failed to add product to wishlist');
                });
        };

        // Load initial products
        $http.get('/api/products')
            .then(function(response) {
                $scope.products = response.data;
                $scope.filteredProducts = $scope.products;
            })
            .catch(function(error) {
                console.error('Error loading products:', error);
                $scope.products = [];
                $scope.filteredProducts = [];
            });

        // Watch for filter changes
        $scope.$watch('filters', function() {
            $scope.applyFilters();
        }, true);

        // Initialize modal
        var addProductModal;
        
        // Initialize new product object
        $scope.newProduct = {
            name: '',
            brand: '',
            type: '',
            price: '',
            image: '',
            description: ''
        };

        // Function to open add product modal
        $scope.openAddProductModal = function() {
            if (!addProductModal) {
                addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
            }
            addProductModal.show();
        };

        // Update fungsi compressImage dengan kompresi yang lebih agresif
        function compressImage(base64String, maxWidth, maxHeight, quality) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = base64String;
                
                img.onload = function() {
                    let width = img.width;
                    let height = img.height;
                    
                    // Lebih agresif dalam pengurangan ukuran
                    const maxSize = 600; // Kurangi ukuran maksimum
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round(height * (maxSize / width));
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round(width * (maxSize / height));
                            height = maxSize;
                        }
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Kurangi kualitas menjadi 50%
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
                    resolve(compressedBase64);
                };
                
                img.onerror = reject;
            });
        }

        // Update previewImage dengan pengecekan ukuran file
        $scope.previewImage = async function(input) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                
                // Check file size before processing
                if (file.size > 5000000) { // 5MB
                    alert('File is too large. Please choose an image under 5MB');
                    input.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        let compressedImage = await compressImage(
                            e.target.result,
                            600,  // maxWidth
                            600,  // maxHeight
                            0.5   // quality 50%
                        );
                        
                        // If still too large, compress again
                        if (compressedImage.length > 1000000) {
                            compressedImage = await compressImage(
                                compressedImage,
                                400,  // even smaller
                                400,
                                0.3   // even lower quality
                            );
                        }
                        
                        $scope.$apply(function() {
                            $scope.newProduct.image = compressedImage;
                        });
                    } catch (error) {
                        console.error('Error compressing image:', error);
                        alert('Failed to process image. Please try a different image.');
                        input.value = '';
                    }
                };
                
                reader.readAsDataURL(file);
            }
        };

        // Edit product
        $scope.editProduct = function(product) {
            // Copy data produk ke form
            $scope.newProduct = {
                _id: product._id,  // Simpan ID produk yang akan diupdate
                name: product.name,
                brand: product.brand,
                type: product.type,
                price: product.price,
                description: product.description,
                image: product.image
            };
            
            // Set flag untuk mode edit
            $scope.isEditing = true;
            
            // Buka modal
            var addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
            addProductModal.show();
        };

        // Save product (create atau update)
        $scope.addProduct = function() {
            if ($scope.isEditing) {
                // Update existing product
                $http.put('/api/products/' + $scope.newProduct._id, $scope.newProduct)
                    .then(function(response) {
                        // Update product di array
                        var index = $scope.products.findIndex(p => p._id === $scope.newProduct._id);
                        if (index !== -1) {
                            $scope.products[index] = response.data;
                            $scope.filteredProducts = [...$scope.products];
                        }
                        
                        // Reset form dan tutup modal
                        $scope.newProduct = {};
                        $scope.isEditing = false;
                        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
                        alert('Product updated successfully!');
                    })
                    .catch(function(error) {
                        console.error('Error updating product:', error);
                        alert('Failed to update product');
                    });
            } else {
                // Create new product
                $http.post('/api/products', $scope.newProduct)
                    .then(function(response) {
                        $scope.products.push(response.data);
                        $scope.filteredProducts = [...$scope.products];
                        $scope.newProduct = {};
                        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
                        alert('Product added successfully!');
                    })
                    .catch(function(error) {
                        console.error('Error adding product:', error);
                        alert('Failed to add product');
                    });
            }
        };

        $scope.deleteProduct = function(product) {
            if(confirm('Are you sure you want to delete this product?')) {
                $http.delete('/api/products/' + product._id)
                    .then(function(response) {
                        // Remove dari array products
                        var index = $scope.products.indexOf(product);
                        $scope.products.splice(index, 1);
                        $scope.filteredProducts = [...$scope.products];
                        alert('Product deleted successfully');
                    })
                    .catch(function(error) {
                        console.error('Error deleting product:', error);
                        alert('Failed to delete product');
                    });
            }
        };
    });
