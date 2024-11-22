var nextBtn = document.querySelector('.next'),
    prevBtn = document.querySelector('.prev'),
    carousel = document.querySelector('.carousel'),
    list = document.querySelector('.list'), 
    items = document.querySelectorAll('.item');

var timeAutoNext = 5000; // 5 detik
var timeRunning = 7000; 

nextBtn.onclick = function() {
    showSlider('next');
};

prevBtn.onclick = function() {
    showSlider('prev');
};

let runTimeOut;
let runNextAuto = setTimeout(() => {
    nextBtn.click();
}, timeAutoNext);

function showSlider(type) {
    let sliderItemsDom = list.querySelectorAll('.carousel .list .item');
    if (type === 'next') {
        list.appendChild(sliderItemsDom[0]);
        carousel.classList.add('next');
    } else {
        list.prepend(sliderItemsDom[sliderItemsDom.length - 1]);
        carousel.classList.add('prev');
    }

    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        carousel.classList.remove('next', 'prev');
    }, timeRunning);

    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        nextBtn.click();
    }, timeAutoNext);

    resetTimeAnimation(); // Reset the running time animation
}

// Start the initial animation
resetTimeAnimation();

function redirectToSearch(brand) {
    window.location.href = `search.html?brand=${encodeURIComponent(brand)}`;
}

function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    products.data.forEach(product => {
        const productHTML = `
            <div class="product">
                <img src="${product.image}" alt="${product.productName}">
                <h3>${product.productName}</h3>
                <p>${product.category} - $${product.price}</p>
                <button onclick="redirectToSearch('${product.brand}')">See More</button>
            </div>
        `;
        productsContainer.innerHTML += productHTML;
    });
}

// Panggil fungsi ini saat halaman dimuat
window.onload = function() {
    displayProducts();
};

function resetTimeAnimation() {
    console.log('Resetting time animation');
}

document.getElementById('hero-arrow').addEventListener('click', function() {    
    document.getElementById('slider').scrollIntoView({ behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', function() {
    const menuBar = document.getElementById('menu-bar');
    const navbar = document.getElementById('navbar');

    menuBar.addEventListener('click', function() {
        navbar.classList.toggle('active');
    });
});

