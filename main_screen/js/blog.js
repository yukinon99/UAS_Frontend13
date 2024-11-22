document.querySelectorAll('.post').forEach(post => {
    const likeBtn = post.querySelector('.like-btn');
    const dislikeBtn = post.querySelector('.dislike-btn');
    const likeCountSpan = post.querySelector('.like-count');
    const dislikeCountSpan = post.querySelector('.dislike-count');

    let likeCount = 0;
    let dislikeCount = 0;

    likeBtn.addEventListener('click', () => {
        likeCount++;
        likeCountSpan.textContent = likeCount;
    });

    dislikeBtn.addEventListener('click', () => {
        dislikeCount++;
        dislikeCountSpan.textContent = dislikeCount;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const menuBar = document.getElementById('menu-bar');
    const navbar = document.getElementById('navbar');

    menuBar.addEventListener('click', function () {
        navbar.classList.toggle('active');
    });
});