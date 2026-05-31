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
                formStatus.classList.add('error');
                return;
            }

            // Simulate form submission (Since it is a static website)
            // Note: For real deployments, this form action can point to a backend or serverless handler like Formspree or Netlify Forms.
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Message...';

            setTimeout(() => {
                formStatus.textContent = 'Thank you for your message, Jeffrey. Your contact request was successfully processed.';
                formStatus.classList.add('success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }, 1000);
        });
    }

    // Helper utility to validate email formats
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }
});
