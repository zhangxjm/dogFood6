document.addEventListener('DOMContentLoaded', function () {
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    var flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(function (msg) {
        setTimeout(function () {
            msg.style.transition = 'opacity 0.5s ease';
            msg.style.opacity = '0';
            setTimeout(function () {
                if (msg.parentElement) {
                    msg.remove();
                }
            }, 500);
        }, 4000);
    });

    var likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(function (btn) {
        btn.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });

    var audioPlayers = document.querySelectorAll('.audio-player');
    audioPlayers.forEach(function (player) {
        player.addEventListener('play', function () {
            audioPlayers.forEach(function (other) {
                if (other !== player && !other.paused) {
                    other.pause();
                }
            });
        });
    });

    var regionCards = document.querySelectorAll('.region-card');
    regionCards.forEach(function (card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(function () {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 60);
    });

    var postCards = document.querySelectorAll('.post-card');
    postCards.forEach(function (card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(function () {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 80);
    });

    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:44px;height:44px;border-radius:50%;background:#e74c3c;color:white;border:none;cursor:pointer;font-size:1.1rem;display:none;z-index:999;box-shadow:0 2px 10px rgba(0,0,0,0.2);transition:all 0.3s ease;';
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'flex';
            scrollTopBtn.style.alignItems = 'center';
            scrollTopBtn.style.justifyContent = 'center';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    scrollTopBtn.addEventListener('mouseenter', function () {
        this.style.background = '#c0392b';
        this.style.transform = 'scale(1.1)';
    });
    scrollTopBtn.addEventListener('mouseleave', function () {
        this.style.background = '#e74c3c';
        this.style.transform = 'scale(1)';
    });
});

function toggleLike(btn) {
    var postId = btn.getAttribute('data-post-id');
    fetch('/post/' + postId + '/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
        var countSpan = btn.querySelector('.like-count');
        var textSpan = btn.querySelector('.like-text');
        countSpan.textContent = data.likes_count;
        if (data.liked) {
            btn.classList.add('liked');
            textSpan.textContent = '已点赞';
        } else {
            btn.classList.remove('liked');
            textSpan.textContent = '点赞';
        }
    })
    .catch(function (err) {
        console.error('Like error:', err);
    });
}
