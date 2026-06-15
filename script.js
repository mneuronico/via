document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       1. HERO CANVAS — Particle network (magenta + blue)
       ========================================================== */
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: -9999, y: -9999 };
        const PARTICLE_COUNT = 80;
        const CONNECTION_DIST = 150;
        const MOUSE_RADIUS = 200;

        function resize() {
            canvas.width = canvas.offsetWidth * devicePixelRatio;
            canvas.height = canvas.offsetHeight * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.offsetWidth;
                this.y = Math.random() * canvas.offsetHeight;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.r = Math.random() * 2 + 0.5;
                // magenta or blue
                this.color = Math.random() > 0.5 ? 'rgba(255,0,128,' : 'rgba(0,102,255,';
            }
            update() {
                // Mouse repulsion
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                    this.vx += dx / dist * force * 0.8;
                    this.vy += dy / dist * force * 0.8;
                }
                // Damping
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.x += this.vx;
                this.y += this.vy;

                const w = canvas.offsetWidth;
                const h = canvas.offsetHeight;
                if (this.x < -20) this.x = w + 20;
                if (this.x > w + 20) this.x = -20;
                if (this.y < -20) this.y = h + 20;
                if (this.y > h + 20) this.y = -20;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = this.color + '0.7)';
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255,0,128,${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();

        const hero = document.getElementById('hero');
        if (hero) {
            hero.addEventListener('mousemove', e => {
                const rect = hero.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });
            hero.addEventListener('mouseleave', () => {
                mouse.x = -9999;
                mouse.y = -9999;
            });
        }
    }

    /* ==========================================================
       2. CURSOR GLOW (desktop only)
       ========================================================== */
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
        let cx = -600, cy = -600;
        let tx = -600, ty = -600;
        document.addEventListener('mousemove', e => {
            tx = e.clientX;
            ty = e.clientY;
        });
        function animateCursor() {
            cx += (tx - cx) * 0.12;
            cy += (ty - cy) * 0.12;
            cursorGlow.style.left = cx + 'px';
            cursorGlow.style.top = cy + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    /* ==========================================================
       3. NAVBAR scroll effect
       ========================================================== */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    /* ==========================================================
       4. MOBILE MENU
       ========================================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    /* ==========================================================
       5. SMOOTH SCROLL
       ========================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    /* ==========================================================
       6. INTERSECTION OBSERVER — reveal animations
       ========================================================== */
    // Reveal text headings
    const revealTexts = document.querySelectorAll('[data-reveal]');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    revealTexts.forEach(el => revealObs.observe(el));

    // Production cards
    const cards = document.querySelectorAll('.prod-card');
    const cardObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                cardObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(card => cardObs.observe(card));

    // Generic animate elements
    const animateEls = document.querySelectorAll('[data-animate]');
    const animObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                animObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    animateEls.forEach(el => animObs.observe(el));

    /* ==========================================================
       7. PRODUCTION CARDS — hover video preview & tilt
       ========================================================== */
    cards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) return;

        // Hover: play preview
        card.addEventListener('mouseenter', () => {
            video.currentTime = 0;
            video.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
            video.pause();
        });

        // Tilt effect (desktop)
        if (window.matchMedia('(pointer: fine)').matches) {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(0)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        }
    });

    /* ==========================================================
       8. LIGHTBOX — click card to watch fullscreen
       ========================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxClose = document.getElementById('lightboxClose');

    if (lightbox && lightboxVideo) {
        // Click play button or card overlay to open lightbox
        cards.forEach(card => {
            const playBtn = card.querySelector('.prod-card__play');
            const videoSrc = card.querySelector('video source');
            const overlay = card.querySelector('.prod-card__overlay');
            if (!playBtn || !overlay) return;

            // Cards with data-href navigate to an external page instead of
            // opening the video lightbox.
            const href = card.dataset.href;
            const open = (e) => {
                e.stopPropagation();
                if (href) {
                    window.open(href, '_blank', 'noopener');
                    return;
                }
                if (!videoSrc) return;
                lightboxVideo.src = videoSrc.getAttribute('src');
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            playBtn.addEventListener('click', open);
            overlay.addEventListener('click', open);
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lightboxVideo.pause();
            lightboxVideo.removeAttribute('src');
            document.body.style.overflow = '';
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
        });
    }

    /* ==========================================================
       9. MAGNETIC BUTTON (contact CTA)
       ========================================================== */
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
            setTimeout(() => { btn.style.transition = ''; }, 500);
        });
    });

    /* ==========================================================
       10. SCROLL INDICATOR — fade out on scroll
       ========================================================== */
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            const opacity = Math.max(0, 1 - window.scrollY / 200);
            scrollIndicator.style.opacity = opacity;
        });
    }

    /* ==========================================================
       11. PARALLAX subtle bg shift on sections
       ========================================================== */
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                // Parallax on hero canvas
                if (canvas) {
                    canvas.style.transform = `translateY(${scrollY * 0.3}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });

});
