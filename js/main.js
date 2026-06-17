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
    
    if (header) {
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check on load
    }

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
        const dpr = window.devicePixelRatio || 1;
        
        let width = window.innerWidth;
        let height = window.innerHeight;
        let lastWidth = width;

        // Scale canvas for high-DPI screens
        const setCanvasSize = () => {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };
        setCanvasSize();

        const nodes = [];
        const maxDistance = 120; // Connection range between nodes
        const mouseDistance = 165; // Connection range to cursor
        const cyanColor = '6, 182, 212'; // rgb corresponding to #06b6d4

        const mouse = { x: null, y: null };

        // Desktop Mouse Listeners
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Mobile Touch Listeners
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('touchcancel', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Node {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.radius = Math.random() * 1.5 + 1; // 1px to 2.5px
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off boundaries (clamped dynamically to current width/height)
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Keep particles in bounds if dimensions shrink
                if (this.x > width) this.x = width;
                if (this.y > height) this.y = height;
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
            const nodeDensity = 0.000045; // 45 nodes per million pixels
            const totalNodes = Math.min(90, Math.floor(width * height * nodeDensity));
            for (let i = 0; i < totalNodes; i++) {
                nodes.push(new Node());
            }
        };

        const handleResize = () => {
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;

            width = currentWidth;
            height = currentHeight;
            setCanvasSize();

            // Only regenerate particles if width changes (orientation shift / desktop resize)
            // This prevents screen flashing on mobile due to scrolling address bar toggles
            if (currentWidth !== lastWidth) {
                lastWidth = currentWidth;
                setupNodes();
            }
        };

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
                        const alpha = (1 - dist / maxDistance) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = `rgba(${cyanColor}, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Check connection to cursor/touch
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = n1.x - mouse.x;
                    const dy = n1.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouseDistance) {
                        const alpha = (1 - dist / mouseDistance) * 0.25;
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

    // 6. Interactive Python Resume Toggle
    const pythonToggleBtn = document.getElementById('python-toggle');
    const standardView = document.querySelector('.standard-view');
    const pythonView = document.getElementById('python-code-view');
    
    if (pythonToggleBtn && standardView && pythonView) {
        let toggleTimeout = null;
        const codeBlock = pythonView.querySelector('pre code');
        const gutter = pythonView.querySelector('.ide-gutter');

        // Python dictionary representing Jeffrey's experience
        const pythonDict = `professional_experience = {
    "military_service": {
        "organization": "US Army",
        "roles": "Crew Chief and Flight Instructor",
        "description": "Served as Crew Chief and Flight Instructor directing flight safety and training programs"
    },
    "dealership_leadership": {
        "priority_one": {
            "company": "Priority One Auto Sales",
            "role": "Leadership",
            "description": "Directed team operations and business scaling strategies"
        },
        "jason_ross": {
            "company": "Jason Ross Auto Sales",
            "role": "General Manager",
            "description": "Managed dealership growth and scaled active inventory and monthly revenue"
        }
    },
    "technical_projects": {
        "programming": "Custom application development and scripting solutions",
        "automation": "n8n workflow automation to integrate back office pipelines",
        "ai_responders": "Custom AI lead responders for automated customer engagement"
    }
}`;

        // Custom syntax highlighting engine for Python dictionary format
        function highlightPython(text) {
            const rules = [
                { type: 'comment', regex: /^#[^\n]*/ },
                { type: 'key', regex: /^"(?:[^"\\]|\\.)*"(?=\s*:)/ },
                { type: 'string', regex: /^"(?:[^"\\]|\\.)*"/ },
                { type: 'number', regex: /^\b\d+(?:\.\d+)?\b/ },
                { type: 'keyword', regex: /^(?:def|class|self|import|from|return|if|elif|else)\b/ },
                { type: 'bracket', regex: /^[{}[\]()]/ },
                { type: 'punct', regex: /^[:=,]/ },
                { type: 'whitespace', regex: /^\s+/ },
                { type: 'identifier', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
                { type: 'other', regex: /^./ }
            ];

            let html = '';
            let i = 0;
            while (i < text.length) {
                const sub = text.slice(i);
                let matched = false;
                for (const rule of rules) {
                    const match = sub.match(rule.regex);
                    if (match) {
                        const val = match[0];
                        i += val.length;
                        matched = true;
                        
                        const escapedVal = val
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;');

                        if (rule.type === 'comment') {
                            html += `<span class="py-comment">${escapedVal}</span>`;
                        } else if (rule.type === 'key') {
                            html += `<span class="py-key">${escapedVal}</span>`;
                        } else if (rule.type === 'string') {
                            html += `<span class="py-string">${escapedVal}</span>`;
                        } else if (rule.type === 'number') {
                            html += `<span class="py-number">${escapedVal}</span>`;
                        } else if (rule.type === 'keyword') {
                            html += `<span class="py-keyword">${escapedVal}</span>`;
                        } else if (rule.type === 'bracket') {
                            html += `<span class="py-bracket">${escapedVal}</span>`;
                        } else if (rule.type === 'punct') {
                            html += `<span class="py-punct">${escapedVal}</span>`;
                        } else if (rule.type === 'whitespace') {
                            html += escapedVal;
                        } else if (rule.type === 'identifier') {
                            if (escapedVal === 'self') {
                                html += `<span class="py-self">self</span>`;
                            } else {
                                html += escapedVal;
                            }
                        } else {
                            html += escapedVal;
                        }
                        break;
                    }
                }
                if (!matched) {
                    html += text[i];
                    i++;
                }
            }
            return html;
        }

        // Initialize and render the syntax-highlighted code block and gutter numbers
        const initCodeView = () => {
            if (codeBlock) {
                codeBlock.innerHTML = highlightPython(pythonDict);
                if (gutter) {
                    const lineCount = pythonDict.split('\n').length;
                    let gutterHTML = '';
                    for (let idx = 1; idx <= lineCount; idx++) {
                        gutterHTML += `<span>${idx}</span>`;
                    }
                    gutter.innerHTML = gutterHTML;
                }
            }
        };

        // Render code view immediately on load
        initCodeView();

        pythonToggleBtn.addEventListener('click', () => {
            const isActive = pythonToggleBtn.classList.contains('active');
            const statusText = pythonToggleBtn.querySelector('.toggle-status');
            
            // Clear any pending timeout from a previous click transition to prevent state corruption
            if (toggleTimeout) {
                clearTimeout(toggleTimeout);
                toggleTimeout = null;
            }
            
            if (!isActive) {
                // Turn Python Mode ON
                pythonToggleBtn.classList.add('active');
                pythonToggleBtn.setAttribute('aria-pressed', 'true');
                if (statusText) statusText.textContent = 'python_mode = True';
                
                // Transition: Fade standard view out
                standardView.style.opacity = '0';
                standardView.style.transform = 'translateY(-10px)';
                
                toggleTimeout = setTimeout(() => {
                    standardView.style.display = 'none';
                    pythonView.style.display = 'flex';
                    
                    // Replace forced synchronous reflow (offsetHeight) with high-performance requestAnimationFrame
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            pythonView.style.opacity = '1';
                            pythonView.style.transform = 'translateY(0)';
                        });
                    });
                }, 250);
            } else {
                // Turn Python Mode OFF
                pythonToggleBtn.classList.remove('active');
                pythonToggleBtn.setAttribute('aria-pressed', 'false');
                if (statusText) statusText.textContent = 'python_mode = False';
                
                // Transition: Fade python view out
                pythonView.style.opacity = '0';
                pythonView.style.transform = 'translateY(10px)';
                
                toggleTimeout = setTimeout(() => {
                    pythonView.style.display = 'none';
                    standardView.style.display = 'grid';
                    
                    // Replace forced synchronous reflow (offsetHeight) with high-performance requestAnimationFrame
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            standardView.style.opacity = '1';
                            standardView.style.transform = 'translateY(0)';
                        });
                    });
                }, 250);
            }
        });
        
        // Copy Code to Clipboard functionality
        const copyBtn = document.getElementById('code-copy-btn');
        
        if (copyBtn && codeBlock) {
            copyBtn.addEventListener('click', () => {
                const textToCopy = codeBlock.textContent;
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        copyBtn.classList.add('copied');
                        const tooltip = copyBtn.querySelector('.copy-tooltip');
                        if (tooltip) tooltip.textContent = 'Copied!';
                        
                        setTimeout(() => {
                            copyBtn.classList.remove('copied');
                            if (tooltip) tooltip.textContent = 'Copy';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
            });
        }
    }

    // 7. Hidden Keyboard Easter Egg (Helicopter Flyby)
    // 7. Hidden Keyboard Easter Egg (Helicopter Flyby)
    const initEasterEgg = () => {
        // Prevent duplicate initialization
        if (window.__heliEasterEggInitialized) return;
        window.__heliEasterEggInitialized = true;

        let typedBuffer = '';
        const keywords = ['flyby', 'rotor', 'apache', 'copter'];
        const maxKeywordLength = Math.max(...keywords.map(k => k.length));
        let isHeliFlying = false;

        const triggerEasterEgg = () => {
            if (isHeliFlying) return;

            // Respect prefers-reduced-motion preferences
            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion) return;

            isHeliFlying = true;

            const container = document.createElement('div');
            container.className = 'heli-container';
            container.innerHTML = `
                <svg class="easter-egg-heli" viewBox="0 0 200 80" width="200" height="80" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <g filter="url(#cyan-glow)" stroke="#06b6d4" stroke-width="2" stroke-linejoin="miter" stroke-linecap="round" fill="none">
                        <!-- Tail Rotor Group (Translated and animated) -->
                        <g transform="translate(15, 30)">
                            <g class="tail-rotor">
                                <line x1="0" y1="-12" x2="0" y2="12" stroke-width="1.5" />
                                <line x1="-12" y1="0" x2="12" y2="0" stroke-width="1.5" />
                            </g>
                        </g>
                        <!-- Tail Fin / Rotor Hub -->
                        <polygon points="10,25 22,18 22,42 12,42" fill="rgba(6, 182, 212, 0.1)" />
                        
                        <!-- Tail Boom (Stealth style angular structure) -->
                        <polygon points="22,28 80,30 80,42 22,38" fill="rgba(6, 182, 212, 0.15)" />
                        
                        <!-- Main Rotor Shaft -->
                        <line x1="110" y1="20" x2="110" y2="12" stroke-width="3" />
                        <!-- Rotor Hub / Swashplate -->
                        <line x1="102" y1="12" x2="118" y2="12" stroke-width="2" />
                        
                        <!-- Main Rotor Blades Group (Translated and animated) -->
                        <g transform="translate(110, 12)">
                            <g class="main-rotor">
                                <line x1="-65" y1="0" x2="65" y2="0" stroke-width="1.5" />
                                <path d="M -65,-2 L -65,2" />
                                <path d="M 65,-2 L 65,2" />
                            </g>
                        </g>
                        
                        <!-- Main Fuselage (Stealth RAH-66 Comanche / Apache vibe) -->
                        <polygon points="80,30 110,20 135,20 165,30 178,38 174,45 155,54 100,54 80,42" fill="rgba(6, 182, 212, 0.2)" />
                        
                        <!-- Cockpit Canopy Glass -->
                        <polygon points="120,24 138,24 160,34 142,44 120,44" fill="rgba(6, 182, 212, 0.45)" stroke-width="1.5" />
                        
                        <!-- Weapon Pylons / Wings (Military look) -->
                        <polygon points="95,44 120,44 125,49 92,49" fill="rgba(6, 182, 212, 0.3)" />
                        <!-- Rocket pod or missile -->
                        <rect x="98" y="49" width="22" height="5" rx="1.5" fill="none" stroke-width="1" />
                        
                        <!-- Landing Gear / Skids -->
                        <line x1="105" y1="54" x2="100" y2="66" stroke-width="2" />
                        <line x1="140" y1="54" x2="135" y2="66" stroke-width="2" />
                        <path d="M 90,66 L 150,66 M 150,66 C 153,66 155,64 156,61" stroke-width="2.5" />
                    </g>
                </svg>
            `;

            document.body.appendChild(container);

            // Fallback timeout to ensure cleanup even if the animation fails or does not complete (e.g. background tab)
            const cleanupTimeout = setTimeout(() => {
                cleanup();
            }, 7000); // 6s animation + 1s buffer

            const cleanup = () => {
                clearTimeout(cleanupTimeout);
                container.removeEventListener('animationend', handleAnimationEnd);
                if (container.parentNode) {
                    container.remove();
                }
                isHeliFlying = false;
            };

            const handleAnimationEnd = (e) => {
                if (e.animationName === 'heli-flyby') {
                    cleanup();
                }
            };

            container.addEventListener('animationend', handleAnimationEnd);
        };

        window.addEventListener('keydown', (e) => {
            // Ignore if modifier keys are pressed to avoid polluting the buffer or blocking standard hotkeys
            if (e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }

            // Ignore keypresses if the user is typing in standard inputs or interactive form controls
            const activeEl = document.activeElement;
            if (activeEl) {
                const tagName = activeEl.tagName.toUpperCase();
                if (
                    tagName === 'INPUT' || 
                    tagName === 'TEXTAREA' || 
                    tagName === 'SELECT' || 
                    tagName === 'OPTION' ||
                    activeEl.isContentEditable ||
                    activeEl.getAttribute('role') === 'textbox' ||
                    activeEl.getAttribute('role') === 'searchbox'
                ) {
                    return;
                }
            }

            // Only capture single, alphabetical keys to avoid spaces, symbols, and function keys polluting the buffer
            if (/^[a-zA-Z]$/.test(e.key)) {
                typedBuffer += e.key.toLowerCase();
                if (typedBuffer.length > maxKeywordLength) {
                    typedBuffer = typedBuffer.slice(-maxKeywordLength);
                }
                
                for (const keyword of keywords) {
                    if (typedBuffer.endsWith(keyword)) {
                        triggerEasterEgg();
                        typedBuffer = '';
                        break;
                    }
                }
            }
        });
    };

    // Start the animations
    initEasterEgg();
    initNodeNetwork();
});

