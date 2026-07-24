/**
 * ========================================
 * SMOOTH ANIMATIONS & SCROLL EFFECTS
 * For Welcome Page Enhancement
 * ========================================
 */

(function() {
    'use strict';

    // ========================================
    // SCROLL PROGRESS INDICATOR
    // ========================================
    function initScrollProgress() {
        // Create progress bar element
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        // Update progress on scroll
        window.addEventListener('scroll', function() {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // ========================================
    // ANIMATE ON SCROLL (AOS)
    // ========================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);

        animatedElements.forEach(function(element) {
            observer.observe(element);
        });
    }

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if href is just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 80; // Adjust based on your header height
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // PARALLAX EFFECT FOR HERO IMAGE
    // ========================================
    function initParallax() {
        const heroImage = document.querySelector('.herotoppngimg');
        
        if (heroImage) {
            window.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;
                const parallaxSpeed = 0.5;
                
                // Only apply parallax on desktop
                if (window.innerWidth > 768) {
                    heroImage.style.transform = 'translateX(-50%) translateY(' + (scrolled * parallaxSpeed) + 'px)';
                } else {
                    heroImage.style.transform = 'translateX(-50%)';
                }
            });
        }
    }

    // ========================================
    // STAGGER ANIMATION FOR CARDS
    // ========================================
    function initStaggerAnimation() {
        // Add stagger-item class to cards
        const cardContainers = document.querySelectorAll('.layoutbgcss .row');
        
        cardContainers.forEach(function(container) {
            const cards = container.querySelectorAll('.maincardbox');
            cards.forEach(function(card, index) {
                card.classList.add('stagger-item');
                card.style.animationDelay = (index * 0.1) + 's';
            });
        });

        // Observe and trigger animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const cards = entry.target.querySelectorAll('.stagger-item');
                    cards.forEach(function(card) {
                        card.style.opacity = '1';
                    });
                }
            });
        }, observerOptions);

        cardContainers.forEach(function(container) {
            observer.observe(container);
        });
    }

    // ========================================
    // COUNTER ANIMATION FOR PROOF SECTION
    // ========================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.proofcount');
        
        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateCounter(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    function animateCounter(element) {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasPercent = text.includes('%');
        const number = parseInt(text.replace(/[^0-9]/g, ''));
        
        if (isNaN(number)) return;

        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = number / steps;
        let current = 0;
        
        const timer = setInterval(function() {
            current += increment;
            
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(current).toLocaleString();
            
            if (hasPlus) displayValue += '+';
            if (hasPercent) displayValue += '%';
            
            element.textContent = displayValue;
        }, duration / steps);
    }

    // ========================================
    // HOVER EFFECT FOR PACKAGE CARDS
    // ========================================
    function initPackageCardEffects() {
        const packageCards = document.querySelectorAll('.quote-wizard-package-card');
        
        packageCards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

    // ========================================
    // RIPPLE EFFECT FOR BUTTONS
    // ========================================
    function initRippleEffect() {
        const buttons = document.querySelectorAll('.fillbttn, .nonfillbtn, .quote-wizard-btn-nav');
        
        buttons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');
                
                this.appendChild(ripple);
                
                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    function initNavbarScroll() {
        const header = document.querySelector('.top-header');
        
        if (header) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 100) {
                    header.style.background = 'rgba(0, 0, 0, 0.9)';
                    header.style.backdropFilter = 'blur(10px)';
                    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.background = 'transparent';
                    header.style.backdropFilter = 'none';
                    header.style.boxShadow = 'none';
                }
            });
        }
    }

    // ========================================
    // LAZY LOAD IMAGES
    // ========================================
    function initLazyLoad() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // ========================================
    // FORM INPUT FOCUS EFFECTS
    // ========================================
    function initFormEffects() {
        const inputs = document.querySelectorAll('.form-control, .form-select');
        
        inputs.forEach(function(input) {
            input.addEventListener('focus', function() {
                const parent = this.closest('.quoteinputcss, .quote-wizard-input-group-pill, .quote-wizard-merged-input-group');
                if (parent) {
                    parent.style.transform = 'translateY(-2px)';
                    parent.style.boxShadow = '0 4px 12px rgba(0, 87, 255, 0.15)';
                }
            });
            
            input.addEventListener('blur', function() {
                const parent = this.closest('.quoteinputcss, .quote-wizard-input-group-pill, .quote-wizard-merged-input-group');
                if (parent) {
                    parent.style.transform = 'translateY(0)';
                    parent.style.boxShadow = 'none';
                }
            });
        });
    }

    // ========================================
    // ACCORDION SMOOTH ANIMATION
    // ========================================
    function initAccordionAnimation() {
        const accordionButtons = document.querySelectorAll('.accordion-button');
        
        accordionButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const icon = this.querySelector('::after');
                
                // Add rotation animation
                setTimeout(function() {
                    button.style.transition = 'all 0.3s ease';
                }, 10);
            });
        });
    }

    // ========================================
    // MOUSE PARALLAX EFFECT
    // ========================================
    function initMouseParallax() {
        const parallaxElements = document.querySelectorAll('.gridmaincard, .maincardbox');
        
        // Only on desktop
        if (window.innerWidth > 1024) {
            parallaxElements.forEach(function(element) {
                element.addEventListener('mousemove', function(e) {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const deltaX = (x - centerX) / centerX;
                    const deltaY = (y - centerY) / centerY;
                    
                    this.style.transform = 'perspective(1000px) rotateY(' + (deltaX * 5) + 'deg) rotateX(' + (-deltaY * 5) + 'deg) translateY(-8px)';
                });
                
                element.addEventListener('mouseleave', function() {
                    this.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
                });
            });
        }
    }

    // ========================================
    // INITIALIZE ALL ANIMATIONS
    // ========================================
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initializeAnimations();
            });
        } else {
            initializeAnimations();
        }
    }

    function initializeAnimations() {
        // Initialize all animation functions
        initScrollProgress();
        initScrollAnimations();
        initSmoothScroll();
        initParallax();
        initStaggerAnimation();
        initCounterAnimation();
        initPackageCardEffects();
        initRippleEffect();
        initNavbarScroll();
        initLazyLoad();
        initFormEffects();
        initAccordionAnimation();
        initMouseParallax();

        // Add loaded class to body
        document.body.classList.add('animations-loaded');
    }

    // Start initialization
    init();

})();
