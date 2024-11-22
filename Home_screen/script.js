document.addEventListener("DOMContentLoaded", () => {
    var typed = new Typed(".text", {
        strings: ["Us", "GelSound"],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });

    const aboutText = document.querySelector(".about-text");

    // Buat observe antar section
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {            
                aboutText.style.opacity = '1'; 
                aboutText.classList.add("animate"); 

                
                observer.unobserve(aboutText);
            }
        });
    }, {
        threshold: 0.5 // bakal ketrigger kalo 50% page udah kelliatan
    });

    observer.observe(aboutText);
});
