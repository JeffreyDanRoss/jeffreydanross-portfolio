/**
 * Jeffrey Dan Ross - Personal Website Controller
 * Handles Navigation scroll effects, Mobile Menu toggle, 
 * Projects expandable cards (accordion), and Contact Form validation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Header scroll handler (adds/removes border and dark background on scroll)
    const header = document.querySelector('.site-header');
    
    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load

    // 2. Mobile Navigation Toggle (Drawer menu)
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu when clicking navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close menu when clicking outside of navigation menu
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Prevent layout breakage if window is resized while menu is open
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        menuToggle.classList.add('open');
        navMenu.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeMobileMenu() {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.style.overflow = ''; // Unlock background scroll
    }

    // 3. Projects Page Accordion (Smooth slide animations for expandable cards)
    const projectHeaders = document.querySelectorAll('.project-header');

    projectHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.project-card');
            const body = card.querySelector('.project-body');
            const isActive = card.classList.contains('active');

            // Collapse all other active cards for a true accordion experience
            document.querySelectorAll('.project-card.active').forEach(activeCard => {
                if (activeCard !== card) {
                    activeCard.classList.remove('active');
                    activeCard.querySelector('.project-body').style.maxHeight = '0';
                }
            });

            // Toggle selected card
            if (isActive) {
                card.classList.remove('active');
                body.style.maxHeight = '0';
            } else {
                card.classList.add('active');
                // Set max-height to the exact content scroll height to allow smooth slide animations
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    // 4. Contact Form Validation and Submission Handling
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect form elements
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            // Reset status state
            formStatus.style.display = 'none';
            formStatus.className = 'form-status';

            // Simple validation
            let isValid = true;
            let errors = [];

            if (!nameInput.value.trim()) {
                isValid = false;
                errors.push('Name is required.');
            }

            if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
                isValid = false;
                errors.push('A valid email address is required.');
            }

            if (!subjectInput.value.trim()) {
                isValid = false;
                errors.push('Subject is required.');
            }

            if (!messageInput.value.trim()) {
                isValid = false;
                errors.push('Message cannot be empty.');
            }

            if (!isValid) {
                formStatus.textContent = errors.join(' ');
                formStatus.className = 'form-status error';
                formStatus.style.display = 'block';
                return;
            }

            // Submit to Web3Forms API
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Message...';

            const formData = new FormData(contactForm);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(async (response) => {
                const resJson = await response.json();
                if (response.status === 200) {
                    formStatus.textContent = 'Thank you! Your message has been sent successfully.';
                    formStatus.className = 'form-status success';
                    formStatus.style.display = 'block';
                    contactForm.reset();
                } else {
                    console.error(resJson);
                    formStatus.textContent = resJson.message || 'Something went wrong. Please try again.';
                    formStatus.className = 'form-status error';
                    formStatus.style.display = 'block';
                }
            })
            .catch(error => {
                console.error(error);
                formStatus.textContent = 'Network error. Please check your connection and try again.';
                formStatus.className = 'form-status error';
                formStatus.style.display = 'block';
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            });
        });
    }

    // Helper utility to validate email formats
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    // 5. Lightweight Canvas Node Network Background Animation
    const initNodeNetwork = () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'node-network-canvas';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const nodes = [];
        const maxDistance = 120; // Connection range between nodes
        const mouseDistance = 165; // Connection range to cursor
        const cyanColor = '6, 182, 212'; // rgb corresponding to #06b6d4

        const mouse = { x: null, y: null };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Node {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Drifts slowly: velocity between -0.3 and 0.3
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.radius = Math.random() * 1.5 + 1; // 1px to 2.5px
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off boundaries
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cyanColor}, 0.45)`;
                ctx.fill();
            }
        }

        const setupNodes = () => {
            nodes.length = 0;
            // Adjust quantity based on screen area to keep performance stable
            const nodeDensity = 0.000045; // 45 nodes per million pixels
            const totalNodes = Math.min(90, Math.floor(width * height * nodeDensity));
            for (let i = 0; i < totalNodes; i++) {
                nodes.push(new Node());
            }
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            setupNodes();
        };

        // Simple debounce to prevent performance hit on dragging window
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });

        setupNodes();

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw nodes
            nodes.forEach(node => {
                node.update();
                node.draw();
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];
                
                // Check connection to other nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        const alpha = (1 - dist / maxDistance) * 0.15; // Max opacity 0.15
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = `rgba(${cyanColor}, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Check connection to mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = n1.x - mouse.x;
                    const dy = n1.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouseDistance) {
                        const alpha = (1 - dist / mouseDistance) * 0.25; // Max opacity 0.25
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(${cyanColor}, ${alpha})`;
                        ctx.lineWidth = 1.0;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    };

    // Start the network animation
    initNodeNetwork();
});
