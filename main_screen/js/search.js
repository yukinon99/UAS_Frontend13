let products = {
    data: [
        {
            productName: "Sony Inzone H9",
            category: "Gaming",
            price: 120,
            brand: "Sony",
            image: "../images/inzoneh9.png",
            description: "A top-tier gaming headset with noise cancellation and superior Bass quality."
        },
        {
            productName: "HyperX Cloud Stinger 2",
            category: "Gaming",
            price: 60,
            brand: "HyperX",
            image: "../images/cloudstinger2.png",
            description: "A powerful headset for your Gaming needs yet perfect for daily use and comfort."
        },
        {
            productName: "Bose Runner Comfort",
            category: "Sports",
            price: 85,
            brand: "Bose",
            image: "../images/bosequiet.png",
            description: "Ideal for sports enthusiasts with sweat-resistant features and premium sound."
        },
        {
            productName: "Razer Kraken V3",
            category: "Gaming",
            price: 150,
            brand: "Razer",
            image: "../images/krakenv3.png",
            description: "An excellent choice for pro gamers with customizable RGB lighting."
        },
        {
            productName: "JBL-T450 ",
            category: "Casual",
            price: 45,
            brand: "JBL",
            image: "../images/jbl450.png",
            description: "Affordable headphones with enhanced bass for casual listening."
        },
        {
            productName: "Beats Solo 4",
            category: "Sports",
            price: 95,
            brand: "Beats",
            image: "../images/Sony1.png",
            description: "Sweat proof and water ressistance design providing maximum comfort for extended workouts."
        },
        {
            productName: "SteelSeries Arctis 5",
            category: "Gaming",
            price: 200,
            brand: "SteelSeries",
            image: "../images/arctis5.png",
            description: "Wireless gaming headset with a long-lasting battery and clear sound."
        },
        {
            productName: "AKG-K275 Foldable",
            category: "Casual",
            price: 55,
            brand: "AKG",
            image: "../images/akgk275.png",
            description: "Foldable design for easy portability, perfect for everyday use."
        },
    ],
};

// Create product cards dynamically
function displayProducts(productList, filterBrand) {
    const productsContainer = document.getElementById("products");
    productsContainer.innerHTML = ""; // Clear previous results

    let filteredList = productList;
    if (filterBrand) {
        filteredList = productList.filter(product => product.brand === filterBrand);
    }

    filteredList.forEach((product) => {
        const card = document.createElement("div");
        card.className = "card product"; // Adding 'product' class for hover effects
        card.innerHTML = `
            <div class="image-container">
                <img src="${product.image}" alt="${product.productName}">
                <div class="hidden-text">${product.description}</div> <!-- Use the product description here -->
            </div>
            <div class="container">
                <h3>${product.productName}</h3>
                <p>Price: $${product.price}</p>
                <p>Brand: ${product.brand}</p>
                <div class="brand-logo">
                    <img src="../images/logos/${product.brand.toLowerCase()}.png" alt="${product.brand} logo">
                </div>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

// Filter products based on dropdown selection
function filterProducts() {
    let categoryValue = document.getElementById("category-filter").value;
    let budgetValue = document.getElementById("budget-filter").value;
    let brandValue = document.getElementById("brand-filter").value;

    let filteredProducts = products.data.filter(product => {
        return (categoryValue === "all" || product.category === categoryValue) &&
            (budgetValue === "all" || 
             (budgetValue === "0-50" && product.price <= 50) ||
             (budgetValue === "51-100" && product.price > 50 && product.price <= 100) ||
             (budgetValue === "101-200" && product.price > 100 && product.price <= 200)) &&
            (brandValue === "all" || product.brand === brandValue);
    });

    // Display filtered products
    displayProducts(filteredProducts);
    document.getElementById("no-results-message").classList.toggle("hide", filteredProducts.length > 0);
}

// Event listeners for dropdown filters
document.getElementById("category-filter").addEventListener("change", filterProducts);
document.getElementById("budget-filter").addEventListener("change", filterProducts);
document.getElementById("brand-filter").addEventListener("change", filterProducts);

// Initial display of all products
displayProducts(products.data);

function getQueryParams() {
    const queryParams = new URLSearchParams(window.location.search);
    return {
        brand: queryParams.get('brand')
    };
}

// On page load
window.onload = function() {
    const { brand } = getQueryParams();
    displayProducts(products.data, brand);

    // Set the brand filter dropdown
    if (brand) {
        const brandDropdown = document.getElementById('brand-filter');
        brandDropdown.value = brand;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const menuBar = document.getElementById('menu-bar');
    const navbar = document.getElementById('navbar');

    menuBar.addEventListener('click', function() {
        navbar.classList.toggle('active');
    });
});

// Add search functionality
function searchProducts() {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const filteredProducts = products.data.filter(product => 
        product.productName.toLowerCase().includes(searchInput)
    );

    // Display products that match the search
    displayProducts(filteredProducts);
    document.getElementById("no-results-message").classList.toggle("hide", filteredProducts.length > 0);
}

// Event listener for search button
document.getElementById("search").addEventListener("click", searchProducts);
