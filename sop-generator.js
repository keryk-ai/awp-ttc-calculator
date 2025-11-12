// TTC SOP Generator - Comprehensive Step-by-Step Instructions
// Generates scenario-specific SOPs based on calculator inputs

let setupChecklistData = null;
let breakdownChecklistData = null;

// Load checklist data
async function loadChecklistData() {
    try {
        // GitHub Pages serves from /docs folder, so use relative path within docs
        const setupResponse = await fetch('data/ttc-setup-sequence-2lane.json');
        const breakdownResponse = await fetch('data/ttc-breakdown-sequence.json');

        if (!setupResponse.ok || !breakdownResponse.ok) {
            throw new Error(`Failed to load checklist files. Setup: ${setupResponse.status}, Breakdown: ${breakdownResponse.status}`);
        }

        setupChecklistData = await setupResponse.json();
        breakdownChecklistData = await breakdownResponse.json();

        console.log('✅ Loaded checklist data for SOP generation');
        console.log('Setup checklist sections:', setupChecklistData.sections?.length);
        console.log('Breakdown checklist sections:', breakdownChecklistData.sections?.length);
    } catch (error) {
        console.error('❌ Error loading checklist data:', error);
        console.error('Make sure data/ttc-setup-sequence-2lane.json and data/ttc-breakdown-sequence.json exist in the docs folder');
        // Show user-friendly error
        alert('Could not load SOP templates. Please check browser console for details or refresh the page.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadChecklistData();
});

// Main function to generate complete SOP
function generateCompleteSOP(scenario, formData, coneQuantities) {
    if (!setupChecklistData || !breakdownChecklistData) {
        return '<p>SOP data not loaded. Please refresh the page.</p>';
    }

    const sections = [];

    // Header
    sections.push(generateSOPHeader(scenario, formData));

    // Safety Summary
    sections.push(generateSafetySummary(scenario, formData));

    // Equipment List
    sections.push(generateEquipmentSection(scenario, formData, coneQuantities));

    // Pre-Job Safety Briefing
    sections.push(generatePJSBSection(scenario, formData));

    // Setup Procedure
    sections.push(generateSetupProcedure(scenario, formData));

    // Breakdown Procedure
    sections.push(generateBreakdownProcedure(scenario, formData));

    // Safety Reference Card
    sections.push(generateSafetyReference(scenario, formData));

    return sections.join('\n\n');
}

// Generate SOP Header with scenario details
function generateSOPHeader(scenario, formData) {
    const roadTypeDisplay = {
        '2-lane-2-way': '2-Lane, 2-Way Road (TA-17)',
        'multi-lane-undivided': 'Multi-Lane Undivided Highway',
        'multi-lane-divided': 'Multi-Lane Divided Highway'
    };

    const durationDisplay = {
        'short-term': 'Short-term (< 1 hour)',
        'intermediate': 'Intermediate (1-24 hours)',
        'long-term': 'Long-term (> 24 hours)'
    };

    const controlDisplay = {
        'flagger': 'Flagger Control',
        'AFAD': 'AFAD (Automated Flagger)',
        'none': 'Signs Only'
    };

    return `
        <div class="sop-header">
            <h1>TTC Work Zone Setup & Breakdown SOP</h1>
            <div class="sop-meta">
                <div class="sop-meta-row">
                    <span class="label">Configuration:</span>
                    <span class="value">${roadTypeDisplay[formData.roadType]}</span>
                </div>
                <div class="sop-meta-row">
                    <span class="label">Posted Speed:</span>
                    <span class="value">${formData.speed} mph</span>
                </div>
                <div class="sop-meta-row">
                    <span class="label">State:</span>
                    <span class="value">${getStateName(formData.state)}</span>
                </div>
                <div class="sop-meta-row">
                    <span class="label">Duration:</span>
                    <span class="value">${durationDisplay[formData.duration]}</span>
                </div>
                <div class="sop-meta-row">
                    <span class="label">Control Method:</span>
                    <span class="value">${controlDisplay[formData.control]}</span>
                </div>
                <div class="sop-meta-row">
                    <span class="label">Generated:</span>
                    <span class="value">${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `;
}

// Generate Safety Summary with critical requirements
function generateSafetySummary(scenario, formData) {
    const alerts = [];

    // Speed-based PPE requirement
    if (formData.speed >= 45) {
        alerts.push('⚠️ ANSI Class 3 vests REQUIRED (speed ≥45 mph)');
    } else {
        alerts.push('ANSI Class 2 vests minimum');
    }

    // TMA requirements
    if (scenario.tma_required === 'True') {
        if (formData.state === 'SC') {
            alerts.push('⚠️ TMA MANDATORY - South Carolina requires TMA at 40+ mph (STRICTEST in region)');
        } else if (formData.state === 'NC') {
            alerts.push('⚠️ TMA MANDATORY - North Carolina requires TMA at 55+ mph');
        }
    }

    // Arrow board requirements
    if (scenario.arrow_board_required === 'True') {
        alerts.push('⚠️ ARROW BOARD MANDATORY - Tennessee requires arrow boards for all multi-lane closures');
    }

    // State-specific signs
    if (formData.state === 'FL' && formData.duration === 'long-term') {
        alerts.push('⚠️ Florida DURATION SIGNS REQUIRED - "Speeding Fines Doubled" and "End Road Work" signs mandatory for work >24 hours');
    }

    return `
        <div class="sop-section safety-summary">
            <h2>🛡️ Critical Safety Requirements</h2>
            <div class="alert-box critical">
                ${alerts.map(alert => `<div class="alert-item">${alert}</div>`).join('')}
            </div>
            <div class="cardinal-rules">
                <h3>3 Cardinal Safety Rules (Non-Negotiable)</h3>
                <ol>
                    <li><strong>Hazard Assessment:</strong> Complete before EVERY operation. Document in PJSB. Reassess if conditions change.</li>
                    <li><strong>Personal Protective Equipment:</strong> Worn at ALL times outside vehicle. Daily inspection required. Replace immediately if damaged.</li>
                    <li><strong>Qualified Traffic Observer:</strong> Present during ALL setup/breakdown. Dedicated role. Authority to STOP WORK, no justification needed.</li>
                </ol>
            </div>
        </div>
    `;
}

// Generate Equipment Section
function generateEquipmentSection(scenario, formData, coneQuantities) {
    const crewSize = determineCrewSize(formData.roadType, formData.control);

    let equipment = `
        <div class="sop-section equipment-section page-break-before">
            <h2>📋 Required Equipment & Materials</h2>

            <div class="equipment-category">
                <h3>Traffic Control Devices</h3>
                <ul class="equipment-list">
                    <li>Traffic cones (28" minimum): <strong>${coneQuantities.total} total</strong> (includes 20% contingency)
                        <ul class="sub-list">
                            <li>Taper: ${coneQuantities.taper} cones</li>
                            <li>Buffer: ${coneQuantities.buffer} cones</li>
                            <li>Work area: ${coneQuantities.workArea} cones</li>
                            <li>Termination: ${coneQuantities.termination} cones</li>
                        </ul>
                    </li>
    `;

    // Add signs based on configuration
    if (formData.roadType === '2-lane-2-way') {
        equipment += `
                    <li>Road Work Ahead signs (W20-1): 2 required (one per approach)</li>
                    <li>One Lane Road Ahead signs (W20-4): 2 required</li>
        `;

        if (formData.control === 'flagger') {
            equipment += `
                    <li>Flagger Ahead signs (W20-7): 2 required</li>
                    <li>Be Prepared to Stop signs (W3-4): 2 required</li>
            `;
        } else if (formData.control === 'AFAD') {
            equipment += `
                    <li>AFAD Ahead signs: 2 required</li>
            `;
        }
    } else {
        equipment += `
                    <li>Road Work Ahead sign (W20-1): 1 required</li>
                    <li>Lane Closed Ahead sign (W20-5): 1 required</li>
        `;
    }

    // State-specific signs
    if (formData.state === 'FL' && formData.duration === 'long-term') {
        equipment += `
                    <li class="state-specific">⚠️ FL REQUIRED: Speeding Fines Doubled sign (48"×30"): 2 required</li>
                    <li class="state-specific">⚠️ FL REQUIRED: End Road Work sign (48"×48"): 2 required</li>
        `;
    }

    if (formData.state === 'FL' && formData.speed > 55) {
        equipment += `
                    <li class="state-specific">⚠️ FL REQUIRED: Rumble Strips Ahead sign (48"×30"): 2 required</li>
        `;
    }

    equipment += `
                    <li>Sign stands: ${formData.roadType === '2-lane-2-way' ? '8-10' : '4-6'} minimum</li>
                </ul>
            </div>
    `;

    // Special equipment
    equipment += `
            <div class="equipment-category">
                <h3>Special Equipment</h3>
                <ul class="equipment-list">
    `;

    if (scenario.arrow_board_required === 'True') {
        equipment += `
                    <li class="state-specific">⚠️ MANDATORY: Arrow board (Type C minimum, 48"×24") - Tennessee requirement</li>
        `;
    }

    if (scenario.tma_required === 'True') {
        equipment += `
                    <li class="state-specific">⚠️ MANDATORY: TMA (Truck-Mounted Attenuator), MASH/NCHRP 350 compliant - ${formData.state} requirement at ${formData.speed}+ mph</li>
        `;
    }

    if (formData.control === 'flagger') {
        equipment += `
                    <li>STOP/SLOW paddles: 2 required (one per flagger)</li>
        `;
    } else if (formData.control === 'AFAD') {
        equipment += `
                    <li>AFAD unit (Automated Flagger Assistance Device): 1 required</li>
        `;
    }

    equipment += `
                </ul>
            </div>
    `;

    // PPE
    const vestClass = formData.speed >= 45 ? 'Class 3' : 'Class 2';
    equipment += `
            <div class="equipment-category">
                <h3>Personal Protective Equipment (PPE)</h3>
                <p><em>Required for ALL ${crewSize} crew members:</em></p>
                <ul class="equipment-list">
                    <li>ANSI ${vestClass} safety vest (${formData.speed >= 45 ? 'HIGH SPEED REQUIREMENT' : 'minimum'})</li>
                    <li>ANSI Z89.1 hard hat with chin strap</li>
                    <li>ANSI Z87.1 safety glasses</li>
                    <li>Steel-toe work boots (ASTM F2413)</li>
                    <li>Storm whistle on breakaway lanyard (emergency use only)</li>
                    <li>Work gloves</li>
                    <li>High-visibility rain gear (if weather requires)</li>
                </ul>
            </div>

            <div class="equipment-category">
                <h3>Communication & Safety</h3>
                <ul class="equipment-list">
                    <li>Two-way radios: ${formData.control === 'flagger' ? '4 minimum (all crew)' : '2 minimum'}</li>
                    <li>Storm whistles: ${crewSize} (one per crew member)</li>
                    <li>First aid kit</li>
                    <li>Fire extinguisher (ABC rated, 5 lb minimum)</li>
                    <li>Emergency contact list</li>
                </ul>
            </div>

            <div class="equipment-category">
                <h3>Vehicles</h3>
                <ul class="equipment-list">
                    <li>Shadow vehicle with amber warning lights</li>
                    ${scenario.tma_required === 'True' ? '<li>TMA vehicle (unoccupied during work)</li>' : ''}
                    <li>Work vehicle(s) for equipment transport</li>
                </ul>
            </div>
        </div>
    `;

    return equipment;
}

// Generate PJSB Section
function generatePJSBSection(scenario, formData) {
    return `
        <div class="sop-section pjsb-section page-break-before">
            <h2>📝 Pre-Job Safety Briefing (PJSB)</h2>
            <div class="alert-box">
                <strong>Duration:</strong> 10-15 minutes minimum, 20-30 minutes for complex sites<br>
                <strong>Required:</strong> ALL crew members must attend and sign documentation
            </div>

            <div class="checklist-section">
                <h3>1. Site Information Review</h3>
                <ul class="checklist">
                    <li><input type="checkbox"> Location: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Posted speed: ${formData.speed} mph</li>
                    <li><input type="checkbox"> Road type: ${formData.roadType}</li>
                    <li><input type="checkbox"> State: ${getStateName(formData.state)}</li>
                    <li><input type="checkbox"> Work duration: ${formData.duration}</li>
                    <li><input type="checkbox"> Date/Time: <span class="fill-blank">_______________________</span></li>
                </ul>
            </div>

            <div class="checklist-section">
                <h3>2. Crew Roster & Role Assignments</h3>
                <ul class="checklist">
                    <li><input type="checkbox"> Driver: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Qualified Observer: <span class="fill-blank">_______________________</span></li>
                    ${formData.control === 'flagger' ? `
                    <li><input type="checkbox"> Flagger A: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Flagger B: <span class="fill-blank">_______________________</span></li>
                    ` : ''}
                    <li><input type="checkbox"> Verify all certifications current (flagger, first aid)</li>
                </ul>
            </div>

            <div class="checklist-section">
                <h3>3. Hazard Assessment</h3>
                <ul class="checklist">
                    <li><input type="checkbox"> Traffic volume: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Vehicle speeds observed: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Weather conditions: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Visibility: ${formData.speed > 55 ? '⚠️ CRITICAL - High speed zone' : 'Minimum 500 ft required'}</li>
                    <li><input type="checkbox"> Road surface condition: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Sight distance adequate: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Shoulders wide enough: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Overhead hazards (power lines): <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Underground utilities marked: <span class="fill-blank">_______________________</span></li>
                </ul>
            </div>

            <div class="checklist-section critical">
                <h3>4. Escape Route Identification (MANDATORY)</h3>
                <div class="alert-box critical">
                    ⚠️ ESCAPE ROUTE IS MANDATORY, NOT OPTIONAL
                </div>
                <ul class="checklist">
                    <li><input type="checkbox"> Escape route identified - Approach A: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Escape route identified - Approach B: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Physically walk escape routes to verify clear</li>
                    <li><input type="checkbox"> Escape routes reachable in 2-3 seconds maximum</li>
                    <li><input type="checkbox"> Escape routes on level ground (not slope/embankment)</li>
                    <li><input type="checkbox"> ALL crew members understand where escape routes are</li>
                </ul>
                <div class="note-box">
                    <strong>ESCAPE ROUTE CANNOT BE:</strong>
                    <ul>
                        <li>Another roadway or active traffic lane</li>
                        <li>Steep slope or embankment</li>
                        <li>Behind guardrail or barrier</li>
                        <li>Body of water or drainage ditch</li>
                        <li>Railroad tracks</li>
                    </ul>
                </div>
            </div>

            <div class="checklist-section">
                <h3>5. Storm Whistle Signals</h3>
                <ul class="checklist">
                    <li><input type="checkbox"> Storm whistle signal agreed: <strong>3 short blasts = DANGER, GO TO ESCAPE ROUTE</strong></li>
                    <li><input type="checkbox"> All crew members have whistle on breakaway lanyard</li>
                    <li><input type="checkbox"> Test whistles - audible at distance</li>
                    <li><input type="checkbox"> Confirm: Whistle is ONLY for emergency (not for getting attention)</li>
                </ul>
            </div>

            <div class="checklist-section">
                <h3>6. Emergency Procedures</h3>
                <ul class="checklist">
                    <li><input type="checkbox"> Nearest hospital: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Hospital address: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Emergency contact: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Supervisor phone: <span class="fill-blank">_______________________</span></li>
                    <li><input type="checkbox"> Radio channels verified - all crew can communicate</li>
                    <li><input type="checkbox"> Emergency response plan reviewed</li>
                </ul>
            </div>

            <div class="checklist-section critical">
                <h3>7. Stop Work Authority</h3>
                <div class="alert-box">
                    ANY crew member can call STOP WORK at ANY time, for ANY safety concern. No justification needed. No retaliation.
                </div>
                <ul class="checklist">
                    <li><input type="checkbox"> All crew understand stop work authority</li>
                    <li><input type="checkbox"> Stop work conditions reviewed:
                        <ul class="sub-list">
                            <li>Loss of qualified observer</li>
                            <li>Visibility below 500 feet</li>
                            <li>PPE failure or damage</li>
                            <li>Equipment malfunction</li>
                            <li>Severe weather approaching</li>
                            <li>Near-miss incident</li>
                            <li>ANY unsafe condition</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="checklist-section">
                <h3>8. Questions & Concerns</h3>
                <ul class="checklist">
                    <li><input type="checkbox"> All crew members given opportunity to ask questions</li>
                    <li><input type="checkbox"> All concerns addressed before beginning work</li>
                    <li><input type="checkbox"> Crew confirms understanding of plan</li>
                </ul>
            </div>

            <div class="signature-section">
                <h3>9. PJSB Sign-Off</h3>
                <p><em>ALL crew members must sign acknowledging attendance and understanding:</em></p>
                <div class="signature-lines">
                    <div class="signature-line">
                        <span class="label">Name:</span> <span class="fill-blank">_______________________</span>
                        <span class="label">Signature:</span> <span class="fill-blank">_______________________</span>
                    </div>
                    <div class="signature-line">
                        <span class="label">Name:</span> <span class="fill-blank">_______________________</span>
                        <span class="label">Signature:</span> <span class="fill-blank">_______________________</span>
                    </div>
                    <div class="signature-line">
                        <span class="label">Name:</span> <span class="fill-blank">_______________________</span>
                        <span class="label">Signature:</span> <span class="fill-blank">_______________________</span>
                    </div>
                    <div class="signature-line">
                        <span class="label">Name:</span> <span class="fill-blank">_______________________</span>
                        <span class="label">Signature:</span> <span class="fill-blank">_______________________</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate Setup Procedure with state-specific insertions
function generateSetupProcedure(scenario, formData) {
    let html = `
        <div class="sop-section setup-section page-break-before">
            <h2>🚧 Work Zone Setup Procedure</h2>
            <div class="alert-box">
                <strong>CRITICAL:</strong> Signs and devices installed WITH traffic flow (same direction as traffic travel)
            </div>
    `;

    // Generate each phase from checklist data
    setupChecklistData.sections.forEach((section, index) => {
        html += `
            <div class="procedure-phase">
                <h3>${section.title}</h3>
                <ul class="checklist">
        `;

        section.items.forEach(item => {
            const criticalClass = item.critical ? ' class="critical-item"' : '';
            const criticalIcon = item.critical ? '⚠️ ' : '';

            // Customize labels with scenario data
            let label = customizeLabel(item.label, scenario, formData);

            html += `<li${criticalClass}><input type="checkbox"> ${criticalIcon}${label}</li>`;
        });

        // Insert state-specific requirements at appropriate phases
        if (section.id === 'phase-1-signs-a') {
            html += insertStateSpecificSetupSteps(scenario, formData);
        }

        html += `
                </ul>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

// Generate Breakdown Procedure
function generateBreakdownProcedure(scenario, formData) {
    let html = `
        <div class="sop-section breakdown-section page-break-before">
            <h2>🔚 Work Zone Breakdown Procedure</h2>
            <div class="alert-box critical">
                <strong>⚠️ MOST DANGEROUS PHASE - Maximum vigilance required</strong>
            </div>
    `;

    // Generate each phase from breakdown checklist
    breakdownChecklistData.sections.forEach(section => {
        html += `
            <div class="procedure-phase">
                <h3>${section.title}</h3>
                <ul class="checklist">
        `;

        section.items.forEach(item => {
            const criticalClass = item.critical ? ' class="critical-item"' : '';
            const criticalIcon = item.critical ? '⚠️ ' : '';

            let label = customizeLabel(item.label, scenario, formData);

            html += `<li${criticalClass}><input type="checkbox"> ${criticalIcon}${label}</li>`;
        });

        html += `
                </ul>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

// Generate Safety Reference Card
function generateSafetyReference(scenario, formData) {
    return `
        <div class="sop-section safety-reference page-break-before">
            <h2>🛡️ Quick Safety Reference</h2>

            <div class="reference-card">
                <h3>If You See Errant Vehicle</h3>
                <ol>
                    <li><strong>DROP</strong> equipment immediately</li>
                    <li><strong>MOVE</strong> quickly to escape route</li>
                    <li><strong>BLOW</strong> storm whistle (3 short blasts)</li>
                    <li><strong>DO NOT</strong> attempt to stop vehicle</li>
                    <li><strong>GET TO SAFETY</strong> - equipment can be replaced</li>
                </ol>
            </div>

            <div class="reference-card">
                <h3>Stop Work Immediately If:</h3>
                <ul class="safety-list">
                    <li>Qualified observer absent or distracted</li>
                    <li>Visibility drops below 500 feet</li>
                    <li>PPE damaged or unavailable</li>
                    <li>Equipment malfunction</li>
                    <li>Severe weather approaching</li>
                    <li>Near-miss incident occurs</li>
                    <li>ANY unsafe condition observed</li>
                </ul>
            </div>

            <div class="reference-card">
                <h3>Storm Whistle Protocol</h3>
                <div class="protocol-grid">
                    <div>
                        <strong>Signal:</strong> 3 short blasts
                    </div>
                    <div>
                        <strong>Meaning:</strong> DANGER - GO TO ESCAPE ROUTE
                    </div>
                    <div>
                        <strong>DO use for:</strong> Errant vehicle, imminent collision
                    </div>
                    <div>
                        <strong>DO NOT use for:</strong> Getting attention, signaling, directing traffic
                    </div>
                </div>
            </div>

            <div class="reference-card">
                <h3>Emergency Contacts</h3>
                <div class="contact-grid">
                    <div class="contact-item">
                        <strong>Emergency (911):</strong> <span class="fill-blank">_______________________</span>
                    </div>
                    <div class="contact-item">
                        <strong>Supervisor:</strong> <span class="fill-blank">_______________________</span>
                    </div>
                    <div class="contact-item">
                        <strong>Safety Officer:</strong> <span class="fill-blank">_______________________</span>
                    </div>
                    <div class="contact-item">
                        <strong>Nearest Hospital:</strong> <span class="fill-blank">_______________________</span>
                    </div>
                </div>
            </div>

            <div class="reference-card">
                <h3>Critical Spacing Values (This Configuration)</h3>
                <table class="spacing-table">
                    <tr>
                        <td>Sign A Distance:</td>
                        <td><strong>${scenario.sign_a_distance_ft} ft</strong></td>
                    </tr>
                    <tr>
                        <td>Sign B Distance:</td>
                        <td><strong>${scenario.sign_b_distance_ft} ft</strong></td>
                    </tr>
                    <tr>
                        <td>Sign C Distance:</td>
                        <td><strong>${scenario.sign_c_distance_ft} ft</strong></td>
                    </tr>
                    <tr>
                        <td>Taper Length:</td>
                        <td><strong>${scenario.taper_length_ft} ft</strong></td>
                    </tr>
                    <tr>
                        <td>Buffer Space:</td>
                        <td><strong>${scenario.buffer_space_ft} ft</strong></td>
                    </tr>
                    <tr>
                        <td>Cone Spacing (Taper):</td>
                        <td><strong>${scenario.cone_spacing_taper_ft} ft</strong></td>
                    </tr>
                    <tr>
                        <td>Cone Spacing (Tangent):</td>
                        <td><strong>${scenario.cone_spacing_tangent_ft} ft</strong></td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

// Helper Functions

function customizeLabel(label, scenario, formData) {
    // Replace placeholders with actual values
    label = label.replace(/Sign A location/, `Sign A location (${scenario.sign_a_distance_ft} ft from work area)`);
    label = label.replace(/Sign B location/, `Sign B location (${scenario.sign_b_distance_ft} ft from work area)`);
    label = label.replace(/Sign C location/, `Sign C location (${scenario.sign_c_distance_ft} ft from work area)`);
    label = label.replace(/per spacing calculation/, `${scenario.sign_b_distance_ft} ft`);
    label = label.replace(/Refer to spacing calculator for taper length/, `Taper length: ${scenario.taper_length_ft} ft`);
    label = label.replace(/Refer to spacing calculator for buffer distances/, `Buffer space: ${scenario.buffer_space_ft} ft`);

    // Speed-specific cone spacing
    if (formData.speed <= 35) {
        label = label.replace(/10ft \(25-35mph\), 15ft \(40-50mph\), 20ft \(55-70mph\)/, `10 ft (your speed: ${formData.speed} mph)`);
    } else if (formData.speed <= 50) {
        label = label.replace(/10ft \(25-35mph\), 15ft \(40-50mph\), 20ft \(55-70mph\)/, `15 ft (your speed: ${formData.speed} mph)`);
    } else {
        label = label.replace(/10ft \(25-35mph\), 15ft \(40-50mph\), 20ft \(55-70mph\)/, `20 ft (your speed: ${formData.speed} mph)`);
    }

    return label;
}

function insertStateSpecificSetupSteps(scenario, formData) {
    let html = '';

    // FL duration signs
    if (formData.state === 'FL' && formData.duration === 'long-term') {
        html += `
            <li class="state-specific critical-item">
                <input type="checkbox"> ⚠️ FL REQUIREMENT: Install "Speeding Fines Doubled" signs at both approaches
            </li>
            <li class="state-specific critical-item">
                <input type="checkbox"> ⚠️ FL REQUIREMENT: Install "End Road Work" signs (will be placed at termination during setup completion)
            </li>
        `;
    }

    // FL rumble strips
    if (formData.state === 'FL' && formData.speed > 55) {
        html += `
            <li class="state-specific critical-item">
                <input type="checkbox"> ⚠️ FL REQUIREMENT: Install "Rumble Strips Ahead" signs at both approaches
            </li>
        `;
    }

    // TN arrow board
    if (scenario.arrow_board_required === 'True') {
        html += `
            <li class="state-specific critical-item">
                <input type="checkbox"> ⚠️ TN REQUIREMENT: Position arrow board BEFORE installing cones (MANDATORY for multi-lane)
            </li>
            <li class="state-specific">
                <input type="checkbox"> Arrow board in CAUTION mode while approaching taper installation
            </li>
        `;
    }

    // NC/SC TMA
    if (scenario.tma_required === 'True') {
        const state = formData.state === 'NC' ? 'NC' : 'SC';
        const threshold = formData.state === 'NC' ? '55+ mph' : '40+ mph (STRICTEST threshold)';
        html += `
            <li class="state-specific critical-item">
                <input type="checkbox"> ⚠️ ${state} REQUIREMENT: Position TMA at work area start (MANDATORY at ${threshold})
            </li>
            <li class="state-specific critical-item">
                <input type="checkbox"> Verify TMA is MASH/NCHRP 350 compliant
            </li>
            <li class="state-specific critical-item">
                <input type="checkbox"> Driver positions TMA, then EXITS vehicle - TMA MUST BE UNOCCUPIED during work
            </li>
        `;
    }

    return html;
}

function getStateName(code) {
    const states = {
        'FL': 'Florida',
        'TN': 'Tennessee',
        'NC': 'North Carolina',
        'SC': 'South Carolina',
        'GA': 'Georgia'
    };
    return states[code] || code;
}

function determineCrewSize(roadType, controlMethod) {
    if (roadType === '2-lane-2-way') {
        if (controlMethod === 'flagger') {
            return '4';
        } else if (controlMethod === 'AFAD') {
            return '3';
        }
    }
    return '2';
}

// Export for use in main calculator
window.generateCompleteSOP = generateCompleteSOP;
