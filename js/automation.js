/**
 * Jeffrey Dan Ross - Automation Workflow Controller
 * Manages interactive node workflow, dynamic SVG connector lines,
 * execution path tracing, and the details inspector panel.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Define Node Metadata for the Inspector Panel
    const nodeDetails = {
        'node-trigger': {
            title: 'Lead Ingestion Trigger',
            type: 'Trigger Node (Webhook / API)',
            status: 'Active (Listening)',
            badgeClass: 'badge-trigger',
            description: 'Listens for incoming webhooks from site contact forms, Facebook Lead Ads, or email parsers. Extracts raw payload data and normalizes the request format instantly.',
            impact: 'Replaces manual data entry, guarantees 100% lead capture without human latency, and logs client requests in real time (<100ms response time).',
            inputs: {
                source: 'HTTPS POST Request (JSON)',
                auth: 'API Token / HMAC Signature',
                data: ['name', 'email', 'phone', 'message', 'timestamp']
            },
            outputs: {
                destination: 'Data Router',
                payload: {
                    lead_id: 'ld_98a7c2e1',
                    raw_data: {
                        name: 'Marcus Vance',
                        email: 'm.vance@vancetech.com',
                        phone: '+1 (555) 902-3142',
                        message: 'Looking to build an enterprise RAG system to parse our internal PDFs. Budget is $15k.',
                        submitted_at: '2026-06-17T19:06:07Z'
                    }
                }
            }
        },
        'node-router': {
            title: 'Lead Profiler & Router',
            type: 'Decision Router',
            status: 'Active (Routing)',
            badgeClass: 'badge-router',
            description: 'Parses lead fields and routes requests based on pre-defined criteria. It evaluates email domains (e.g., corporate vs public), checks query keywords, and segments leads into appropriate pipelines.',
            impact: 'Eliminates administrative sorting. Corporate domains or budget-oriented inquiries are routed to AI enrichment; standard info requests or direct sales sync straight to CRM.',
            inputs: {
                source: 'Lead Ingestion Trigger',
                parameters: ['domain_type', 'message_content', 'budget_estimate']
            },
            outputs: {
                routes: {
                    high_value_path: 'AI Context Enricher (Condition: Corporate/Budget > $5k)',
                    standard_path: 'CRM Direct Sync (Condition: Public Domain/Low Budget)'
                },
                payload: {
                    route_selected: 'high_value_path',
                    route_criteria: {
                        is_corporate: true,
                        detected_keywords: ['enterprise', 'RAG', 'budget'],
                        has_valid_email: true
                    }
                }
            }
        },
        'node-ai-enrich': {
            title: 'VeteranLM Context Enricher',
            type: 'AI Processing (LLM / RAG)',
            status: 'Active (Idle)',
            badgeClass: 'badge-ai',
            description: 'Enriches lead metadata using search tools, corporate directory APIs, and semantic indexes. Gathers details about VanceTech, their industry sector, and existing tech stacks.',
            impact: 'Provides the sales pipeline with complete corporate intelligence automatically, saving hours of manual LinkedIn and Google search research prior to initial contact.',
            inputs: {
                source: 'Lead Profiler & Router',
                apis: ['LinkedIn Finder', 'Clearbit / Hunter API', 'Internal Vector DB']
            },
            outputs: {
                destination: 'AI Sentiment & Priority Classifier',
                payload: {
                    enriched_data: {
                        company_name: 'Vance Technologies Inc.',
                        industry: 'Cloud Infrastructure & Enterprise Security',
                        company_size: '50-200 employees',
                        tech_stack: ['AWS', 'Kubernetes', 'Python', 'PostgreSQL'],
                        estimated_revenue: '$8.5M'
                    }
                }
            }
        },
        'node-ai-sentiment': {
            title: 'Intent & Priority Classifier',
            type: 'AI Processing (LLM Evaluation)',
            status: 'Active (Idle)',
            badgeClass: 'badge-ai',
            description: 'Leverages small, fast LLMs to classify the message\'s intent, urgency level, and sentiment score. It drafts an initial personalized response matching Jeffrey\'s professional tone.',
            impact: 'Ensures immediate qualification. Scores urgency so high-priority corporate contracts trigger real-time operational SMS/Slack alerts for immediate human-in-the-loop engagement.',
            inputs: {
                source: 'VeteranLM Context Enricher',
                prompt_template: 'Lead Qualification & Tone-Matched Draft v2.1'
            },
            outputs: {
                destination: 'CRM Sync & Action Dispatches',
                payload: {
                    classification: {
                        intent: 'Service Inquiry / System Build',
                        urgency: 'HIGH',
                        sentiment_score: 0.85,
                        priority_score: 9.2
                    },
                    draft_reply: 'Hi Marcus, thank you for reaching out. Parsing internal PDFs using a localized RAG system is a great way to unlock siloed organizational knowledge... Let\'s schedule a brief call next Tuesday...'
                }
            }
        },
        'node-action-slack': {
            title: 'Slack Operations Dispatch',
            type: 'Action Node (Slack Webhook)',
            status: 'Active (Listening)',
            badgeClass: 'badge-action',
            description: 'Dispatches an styled operational digest to Jeffrey\'s private Slack channel when a lead receives a priority score above 8.0.',
            impact: 'Enables <5 minute response times for high-value leads by pushing mobile push notifications containing contact details, AI intent analysis, and draft responses directly to the operations leader.',
            inputs: {
                source: 'AI Sentiment & Priority Classifier',
                channel: '#operations-leads',
                priority_threshold: 8.0
            },
            outputs: {
                status: 'Delivered',
                payload: {
                    slack_response_code: 200,
                    channel_notified: '#operations-leads',
                    message_preview: '🚨 NEW HIGH-PRIORITY LEAD: Marcus Vance (VanceTech) - Priority: 9.2 - Intent: RAG Build - Draft reply prepared.'
                }
            }
        },
        'node-action-email': {
            title: 'Auto-Email Dispatcher',
            type: 'Action Node (SMTP / Twilio)',
            status: 'Active (Listening)',
            badgeClass: 'badge-action',
            description: 'Dispatches the AI-drafted reply to the lead via SMTP or Twilio SendGrid. Uses dynamic merge tags to insert personalized details.',
            impact: 'Cuts lead response latency to 0 minutes for standard inquiries. For high-priority leads, it holds the email in a "draft queue" for up to 30 minutes, allowing Jeffrey to review and edit before sending.',
            inputs: {
                source: 'AI Sentiment & Priority Classifier',
                mode: 'Delay Queue (30m review window for High Priority)',
                sender: 'jeffrey@jeffreydanross.com'
            },
            outputs: {
                status: 'Queued (Awaiting Approval / Review)',
                payload: {
                    email_queued_id: 'em_8a73b22e',
                    recipient: 'm.vance@vancetech.com',
                    subject: 'Re: Enterprise RAG System Inquiry - Jeffrey Ross',
                    send_scheduled_at: '2026-06-17T19:36:07Z'
                }
            }
        },
        'node-action-crm': {
            title: 'CRM & Database Sync',
            type: 'Action Node (API Sync)',
            status: 'Active (Listening)',
            badgeClass: 'badge-action',
            description: 'Synchronizes all collected information, AI classification scores, and logs to the lead database (CRM, self-hosted Postgres, or Hubspot).',
            impact: 'Keeps all databases unified. Ensures zero data leakage between initial inbound contact, AI processing pipelines, Slack alerts, and eventual emails.',
            inputs: {
                source: ['Lead Profiler & Router', 'AI Sentiment & Priority Classifier'],
                targets: ['Self-hosted Database (PostgreSQL)', 'Hubspot API']
            },
            outputs: {
                status: 'Synchronized',
                payload: {
                    db_insert_status: 'SUCCESS',
                    hubspot_sync_status: 'CREATED',
                    records_updated: {
                        contact_id: 'ct_12093',
                        deal_id: 'dl_40211',
                        pipeline_stage: 'Qualified Lead'
                    }
                }
            }
        }
    };

    // 2. Select Elements
    const nodes = document.querySelectorAll('.workflow-node');
    const svgOverlay = document.getElementById('workflow-connections');
    const inspector = document.getElementById('node-inspector');
    const canvasContainer = document.querySelector('.workflow-canvas');
    
    // Inspector Details Elements
    const insTitle = document.getElementById('ins-node-title');
    const insType = document.getElementById('ins-node-type');
    const insStatus = document.getElementById('ins-node-status');
    const insDesc = document.getElementById('ins-node-description');
    const insImpact = document.getElementById('ins-node-impact');
    const insInputs = document.getElementById('ins-node-inputs');
    const insOutputs = document.getElementById('ins-node-outputs');
    const insPayload = document.getElementById('ins-node-payload');
    const closeInspectorBtn = document.getElementById('close-inspector-btn');

    // 3. Define Connections Map
    // We map output socket names/types to input sockets
    const connections = [
        { from: 'node-trigger', to: 'node-router', pathId: 'path-trigger-router', type: 'primary' },
        { from: 'node-router', to: 'node-ai-enrich', pathId: 'path-router-enrich', type: 'high-value' },
        { from: 'node-router', to: 'node-action-crm', pathId: 'path-router-crm', type: 'standard' },
        { from: 'node-ai-enrich', to: 'node-ai-sentiment', pathId: 'path-enrich-sentiment', type: 'primary' },
        { from: 'node-ai-sentiment', to: 'node-action-slack', pathId: 'path-sentiment-slack', type: 'high-value' },
        { from: 'node-ai-sentiment', to: 'node-action-email', pathId: 'path-sentiment-email', type: 'primary' },
        { from: 'node-ai-sentiment', to: 'node-action-crm', pathId: 'path-sentiment-crm', type: 'primary' }
    ];

    // 4. Draw dynamic connection lines
    const drawConnections = () => {
        if (!svgOverlay || !canvasContainer) return;

        // Get container dimensions to calculate relative points
        const containerRect = canvasContainer.getBoundingClientRect();
        
        // Ensure SVG overlay matches canvas size
        svgOverlay.setAttribute('width', containerRect.width);
        svgOverlay.setAttribute('height', containerRect.height);

        // Clear existing generated paths
        let pathsHtml = '';

        // Determine if layout is vertical (mobile) or horizontal (desktop)
        const isVertical = window.innerWidth <= 768;

        connections.forEach(conn => {
            const sourceEl = document.getElementById(conn.from);
            const targetEl = document.getElementById(conn.to);

            if (!sourceEl || !targetEl) return;

            // Find specific sockets on source and target
            let sourceSocket = null;
            let targetSocket = null;

            if (isVertical) {
                // Stacked vertically: output is bottom center, input is top center
                sourceSocket = sourceEl.querySelector('.socket-bottom') || sourceEl;
                targetSocket = targetEl.querySelector('.socket-top') || targetEl;
            } else {
                // Horizontal layout:
                // For router, it has multiple output sockets: high-value on top-right, standard on bottom-right
                if (conn.type === 'high-value' && conn.from === 'node-router') {
                    sourceSocket = sourceEl.querySelector('.socket-right-top') || sourceEl;
                } else if (conn.type === 'standard' && conn.from === 'node-router') {
                    sourceSocket = sourceEl.querySelector('.socket-right-bottom') || sourceEl;
                } else {
                    sourceSocket = sourceEl.querySelector('.socket-right') || sourceEl;
                }

                // Inputs are usually on the left
                targetSocket = targetEl.querySelector('.socket-left') || targetEl;
            }

            const srcRect = sourceSocket.getBoundingClientRect();
            const tgtRect = targetSocket.getBoundingClientRect();

            // Calculate coordinates relative to canvas container
            const x1 = srcRect.left + srcRect.width / 2 - containerRect.left;
            const y1 = srcRect.top + srcRect.height / 2 - containerRect.top;
            const x2 = tgtRect.left + tgtRect.width / 2 - containerRect.left;
            const y2 = tgtRect.top + tgtRect.height / 2 - containerRect.top;

            // Compute Bezier control points
            let pathData = '';
            if (isVertical) {
                // Vertical curve
                const dy = Math.abs(y2 - y1) * 0.5;
                pathData = `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
            } else {
                // Horizontal curve
                const dx = Math.abs(x2 - x1) * 0.5;
                pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
            }

            // Determine classes based on active state of source/target
            const isSourceActive = sourceEl.classList.contains('active') || sourceEl.classList.contains('active-state');
            const isTargetActive = targetEl.classList.contains('active') || targetEl.classList.contains('active-state');
            
            // Path classes
            let pathClass = 'connection-path';
            if (conn.type === 'high-value') pathClass += ' path-high-value';
            if (conn.type === 'standard') pathClass += ' path-standard';
            if (isSourceActive && isTargetActive) {
                pathClass += ' active-path pulse-flow';
            }

            pathsHtml += `<path id="${conn.pathId}" d="${pathData}" class="${pathClass}" />`;
            
            // Add a duplicate glowing background path for selected connections
            if (isSourceActive && isTargetActive) {
                pathsHtml += `<path d="${pathData}" class="connection-path-glow" />`;
            }
        });

        svgOverlay.innerHTML = pathsHtml;
    };

    // 5. Select & populate inspector card
    const selectNode = (nodeId) => {
        const data = nodeDetails[nodeId];
        if (!data) return;

        // Update active class and accessibility state on nodes
        nodes.forEach(node => {
            if (node.id === nodeId) {
                node.classList.add('active');
                node.setAttribute('aria-expanded', 'true');
            } else {
                node.classList.remove('active');
                node.setAttribute('aria-expanded', 'false');
            }
        });

        // Set text
        insTitle.textContent = data.title;
        insType.textContent = data.type;
        insStatus.textContent = data.status;
        
        // Remove existing badge classes and add current one
        insType.className = `inspector-node-type ${data.badgeClass}`;
        
        insDesc.textContent = data.description;
        insImpact.textContent = data.impact;

        // Render Inputs list
        insInputs.innerHTML = '';
        if (Array.isArray(data.inputs.data)) {
            data.inputs.data.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<code>${item}</code>`;
                insInputs.appendChild(li);
            });
        } else if (Array.isArray(data.inputs.parameters)) {
            data.inputs.parameters.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<code>${item}</code>`;
                insInputs.appendChild(li);
            });
        } else if (Array.isArray(data.inputs)) {
            data.inputs.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<code>${item}</code>`;
                insInputs.appendChild(li);
            });
        } else if (typeof data.inputs === 'object') {
            Object.entries(data.inputs).forEach(([key, val]) => {
                const li = document.createElement('li');
                const valStr = Array.isArray(val) ? val.join(', ') : val;
                li.innerHTML = `<strong>${key}:</strong> <code>${valStr}</code>`;
                insInputs.appendChild(li);
            });
        }

        // Render Outputs
        insOutputs.innerHTML = '';
        if (typeof data.outputs === 'object') {
            Object.entries(data.outputs).forEach(([key, val]) => {
                const li = document.createElement('li');
                if (typeof val === 'string') {
                    li.innerHTML = `<strong>${key}:</strong> <code>${val}</code>`;
                } else if (Array.isArray(val)) {
                    li.innerHTML = `<strong>${key}:</strong> <code>${val.join(', ')}</code>`;
                } else {
                    li.innerHTML = `<strong>${key}:</strong> <code>Data Object</code>`;
                }
                insOutputs.appendChild(li);
            });
        }

        // Render Code block
        const payloadData = data.outputs.payload || data.outputs;
        insPayload.textContent = JSON.stringify(payloadData, null, 2);

        // Open Inspector panel
        inspector.classList.add('open');
        inspector.setAttribute('aria-hidden', 'false');

        // Redraw paths to reflect active/selected node highlighting
        drawConnections();
    };

    // 6. Close Inspector Handler
    const closeInspector = () => {
        inspector.classList.remove('open');
        inspector.setAttribute('aria-hidden', 'true');
        
        // Remove active highlights and reset accessibility state on all nodes
        nodes.forEach(node => {
            node.classList.remove('active');
            node.setAttribute('aria-expanded', 'false');
        });
        
        // Redraw connections
        drawConnections();
    };

    if (closeInspectorBtn) {
        closeInspectorBtn.addEventListener('click', closeInspector);
    }

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && inspector.classList.contains('open')) {
            closeInspector();
        }
    });

    // 7. Node Click Listeners
    nodes.forEach(node => {
        const handleNodeSelect = (e) => {
            e.stopPropagation();
            selectNode(node.id);
        };

        node.addEventListener('click', handleNodeSelect);
        node.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNodeSelect(e);
            }
        });
    });

    // Close inspector when clicking outside diagram or inspector
    document.addEventListener('click', (e) => {
        const isClickInsideInspector = inspector.contains(e.target);
        const isClickInsideNode = Array.from(nodes).some(node => node.contains(e.target));
        
        if (!isClickInsideInspector && !isClickInsideNode && inspector.classList.contains('open')) {
            closeInspector();
        }
    });

    // 8. Run Pipeline Simulation (Subtle pulse animations passing data)
    const runSimulationBtn = document.getElementById('run-simulation-btn');
    let simInterval = null;

    const runSimulation = () => {
        if (runSimulationBtn) {
            runSimulationBtn.disabled = true;
            runSimulationBtn.textContent = 'Simulating Exec...';
            runSimulationBtn.classList.add('active');
        }

        // List of nodes in order of high-value lead execution path
        const steps = [
            'node-trigger',
            'node-router',
            'node-ai-enrich',
            'node-ai-sentiment',
            ['node-action-slack', 'node-action-email', 'node-action-crm']
        ];

        // Clear active classes from nodes first
        nodes.forEach(node => {
            node.classList.remove('active-state');
        });
        drawConnections();

        let currentStep = 0;

        const animateStep = () => {
            // Remove active-state from previous step nodes
            if (currentStep > 0) {
                const prev = steps[currentStep - 1];
                if (Array.isArray(prev)) {
                    prev.forEach(id => document.getElementById(id)?.classList.remove('active-state'));
                } else {
                    document.getElementById(prev)?.classList.remove('active-state');
                }
            }

            if (currentStep >= steps.length) {
                // Done simulation
                clearInterval(simInterval);
                if (runSimulationBtn) {
                    runSimulationBtn.disabled = false;
                    runSimulationBtn.textContent = 'Simulate Live Lead';
                    runSimulationBtn.classList.remove('active');
                }
                drawConnections();
                return;
            }

            // Highlight current step nodes
            const curr = steps[currentStep];
            if (Array.isArray(curr)) {
                curr.forEach(id => document.getElementById(id)?.classList.add('active-state'));
            } else {
                document.getElementById(curr)?.classList.add('active-state');
            }

            // Highlight connections where source and target are active
            drawConnections();
            
            currentStep++;
        };

        animateStep();
        simInterval = setInterval(animateStep, 1400); // 1.4s per step
    };

    if (runSimulationBtn) {
        runSimulationBtn.addEventListener('click', runSimulation);
    }

    // 9. Initial Setup & Resizing
    drawConnections();
    
    // Select first node (Trigger) on page load so the inspector is open and user sees payload instantly!
    setTimeout(() => {
        selectNode('node-trigger');
    }, 400);

    // Watch resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawConnections();
        }, 100);
    });

    // Draw lines again after window finishes loading
    window.addEventListener('load', drawConnections);
});
