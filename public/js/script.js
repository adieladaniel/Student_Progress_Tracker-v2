// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active navigation highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Smooth scrolling function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for subscribing to our newsletter!');
        newsletterForm.reset();
    });
}

// Play button interactions
document.querySelectorAll('.btn-play').forEach(button => {
    button.addEventListener('click', () => {
        alert('Game feature coming soon! This will redirect to the interactive game.');
    });
});

// Learn More button interactions
document.querySelectorAll('.btn-learn-more').forEach(button => {
    button.addEventListener('click', () => {
        alert('Detailed program information coming soon!');
    });
});

// Scroll animations for feature cards, portal cards, game cards, and blog cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections (excluding program cards as they have their own observer)
document.querySelectorAll('.feature-card, .portal-card, .game-card, .blog-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Parallax effect for floating shapes
window.addEventListener('scroll', () => {
    const shapes = document.querySelectorAll('.shape');
    const scrolled = window.pageYOffset;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.1;
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add bounce animation to stat cards on hover
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.animation = 'bounce 0.5s ease';
    });
    
    card.addEventListener('animationend', () => {
        card.style.animation = '';
    });
});

// Add CSS animation for bounce
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// ========== DOODLE INTERACTIONS ========== //
document.querySelectorAll('.doodle').forEach(doodle => {
    doodle.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2)';
        this.style.opacity = '1';
        this.style.filter = 'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.3))';
    });
    
    doodle.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.opacity = '0.7';
        this.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1))';
    });
});

// Random additional animations on scroll for doodles
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const doodles = document.querySelectorAll('.doodle');
    
    if (Math.abs(currentScrollY - lastScrollY) > 50) {
        doodles.forEach((doodle, index) => {
            if (Math.random() > 0.7) {
                doodle.style.transition = 'transform 0.3s ease';
                doodle.style.transform = 'scale(1.15) rotate(10deg)';
                
                setTimeout(() => {
                    doodle.style.transform = '';
                }, 300);
            }
        });
        lastScrollY = currentScrollY;
    }
});

// Make doodles slightly move with mouse movement (parallax effect)
document.addEventListener('mousemove', (e) => {
    const doodles = document.querySelectorAll('.doodle');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    doodles.forEach((doodle, index) => {
        const speed = (index % 3 + 1) * 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        
        const currentTransform = window.getComputedStyle(doodle).transform;
        if (currentTransform !== 'none') {
            doodle.style.transform = `${currentTransform} translate(${x}px, ${y}px)`;
        }
    });
});

// ========== PROGRAM CARDS ANIMATIONS ========== //

// Observe program cards for scroll animations
const programCards = document.querySelectorAll('.program-card');

const programObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

programCards.forEach(card => {
    programObserver.observe(card);
});

// Add subtle 3D tilt effect on mouse move for program cards
programCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

console.log('ILB Angels Trust Website - Service Learning Project');
console.log('All interactive features, animated doodles, and program cards loaded successfully!');
