// TTC Spacing Calculator - AWP Safety
// Queries 840 pre-calculated scenarios for MUTCD-compliant work zone setup

let scenariosData = null;

// Load scenario data on page load
async function loadScenarioData() {
    try {
        const response = await fetch('ttc-scenarios-table.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        scenariosData = await response.json();
        console.log(`Loaded ${scenariosData.length} scenarios`);
    } catch (error) {
        console.error('Error loading scenario data:', error);
        showError('Failed to load scenario data. Please refresh the page.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadScenarioData();

    const form = document.getElementById('spacingForm');
    form.addEventListener('submit', handleFormSubmit);

    form.addEventListener('reset', () => {
        hideResults();
        hideError();
    });
});

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    hideError();

    if (!scenariosData) {
        showError('Scenario data not loaded yet. Please wait and try again.');
        return;
    }

    // Get form values
    const formData = {
        speed: parseInt(document.getElementById('speed').value),
        roadType: document.getElementById('roadType').value,
        state: document.getElementById('state').value,
        duration: document.getElementById('duration').value,
        control: document.getElementById('control').value,
        workArea: parseInt(document.getElementById('workArea').value) || 500
    };

    // Validate control method for road type
    if (formData.roadType !== '2-lane-2-way' && (formData.control === 'flagger' || formData.control === 'AFAD')) {
        showError('Flagger and AFAD control methods are only valid for 2-lane roads. Please select "Signs Only" for multi-lane roads.');
        return;
    }

    // Find matching scenario
    const scenario = findMatchingScenario(formData);

    if (!scenario) {
        showError('No matching scenario found for the selected parameters. Please verify your inputs.');
        return;
    }

    // Display results
    displayResults(scenario, formData);
}

// Find matching scenario in the 840-scenario table
function findMatchingScenario(formData) {
    return scenariosData.find(scenario => {
        return scenario.speed_limit === formData.speed &&
               scenario.road_type === formData.roadType &&
               scenario.state === formData.state &&
               scenario.work_duration === formData.duration &&
               scenario.control_method === formData.control;
    });
}

// Display calculation results
function displayResults(scenario, formData) {
    // Advance Warning Signs
    document.getElementById('signA').textContent = `${scenario.sign_a_distance_ft} ft`;
    document.getElementById('signB').textContent = `${scenario.sign_b_distance_ft} ft`;
    document.getElementById('signC').textContent = `${scenario.sign_c_distance_ft} ft`;

    // Show Sign D only for flagger operations
    if (scenario.sign_d_distance_ft && scenario.sign_d_distance_ft > 0) {
        document.getElementById('signD').textContent = `${scenario.sign_d_distance_ft} ft`;
        document.getElementById('signDRow').style.display = 'grid';
    } else {
        document.getElementById('signDRow').style.display = 'none';
    }

    // Taper & Buffer
    document.getElementById('taperLength').textContent = `${scenario.taper_length_ft} ft`;
    document.getElementById('bufferSpace').textContent = `${scenario.buffer_space_ft} ft`;
    document.getElementById('coneSpacingTaper').textContent = `${scenario.cone_spacing_taper_ft} ft`;
    document.getElementById('coneSpacingTangent').textContent = `${scenario.cone_spacing_tangent_ft} ft`;

    // Calculate cone quantities
    const coneQuantities = calculateConeQuantities(scenario, formData.workArea);

    // Equipment Requirements
    document.getElementById('deviceType').textContent = scenario.device_type;
    document.getElementById('deviceQuantity').textContent = `${coneQuantities.total} cones (with 20% contingency)`;
    document.getElementById('arrowBoard').textContent = scenario.arrow_board_required;
    document.getElementById('tmaRequired').textContent = scenario.tma_required;

    // Crew size based on road type and control method
    const crewSize = determineCrewSize(formData.roadType, formData.control);
    document.getElementById('crewSize').textContent = crewSize;

    // Signs Required
    displaySignsRequired(scenario, formData);

    // State-Specific Requirements
    displayStateRequirements(scenario, formData);

    // Show results section
    showResults();

    // Store scenario and form data for SOP generation
    window.currentScenario = scenario;
    window.currentFormData = formData;
    window.currentConeQuantities = coneQuantities;

    // Show the SOP generation button
    document.getElementById('generateSOPButton').style.display = 'inline-block';

    // Hide SOP section if it was previously shown
    hideSOPSection();
}

// Calculate cone quantities based on work area length
function calculateConeQuantities(scenario, workAreaLength) {
    // Taper cones
    const taperCones = Math.ceil(scenario.taper_length_ft / scenario.cone_spacing_taper_ft);

    // Buffer cones
    const bufferCones = Math.ceil(scenario.buffer_space_ft / scenario.cone_spacing_tangent_ft);

    // Work area cones
    const workAreaCones = Math.ceil(workAreaLength / scenario.cone_spacing_tangent_ft);

    // Termination taper (typically same as transition taper)
    const terminationCones = taperCones;

    // Subtotal
    const subtotal = taperCones + bufferCones + workAreaCones + terminationCones;

    // Add 20% contingency
    const total = Math.ceil(subtotal * 1.2);

    return {
        taper: taperCones,
        buffer: bufferCones,
        workArea: workAreaCones,
        termination: terminationCones,
        subtotal: subtotal,
        total: total
    };
}

// Determine crew size based on configuration
function determineCrewSize(roadType, controlMethod) {
    if (roadType === '2-lane-2-way') {
        if (controlMethod === 'flagger') {
            return '4 minimum (2 flaggers, 1 driver, 1 qualified observer)';
        } else if (controlMethod === 'AFAD') {
            return '3 minimum (1 driver, 1 AFAD operator, 1 qualified observer)';
        }
    } else {
        // Multi-lane
        return '2 minimum (1 driver, 1 qualified observer)';
    }
    return '2 minimum';
}

// Display required signs
function displaySignsRequired(scenario, formData) {
    const signsContainer = document.getElementById('signsRequired');
    signsContainer.innerHTML = '';

    const signs = [];

    if (formData.roadType === '2-lane-2-way') {
        signs.push('Sign A: Road Work Ahead (W20-1) - Qty: 2');
        signs.push('Sign B: One Lane Road Ahead (W20-4) - Qty: 2');
        signs.push('Sign C: Be Prepared to Stop (W3-4) - Qty: 2');

        if (formData.control === 'flagger') {
            signs.push('Sign D: Flagger Symbol (W20-7a) - Qty: 2');
        } else if (formData.control === 'AFAD') {
            signs.push('Sign D: AFAD Ahead - Qty: 2');
        }
    } else {
        // Multi-lane
        signs.push('Sign A: Road Work Ahead (W20-1) - Qty: 1');

        if (formData.roadType === 'multi-lane-divided') {
            signs.push('Sign B: Right Lane Closed Ahead (W20-5R) - Qty: 1');
        } else {
            signs.push('Sign B: Lane Closed Ahead (W20-5) - Qty: 1');
        }

        signs.push('Sign C: Merge Right (W4-1R) - Qty: 1');
    }

    // Add state-specific signs from scenario
    if (scenario.state_signs_required && scenario.state_signs_required !== 'none') {
        const stateSignsArray = scenario.state_signs_required.split(';').filter(s => s.trim());
        signs.push(...stateSignsArray);
    }

    // Create badge elements
    signs.forEach(sign => {
        const badge = document.createElement('span');
        badge.className = 'sign-badge';
        badge.textContent = sign;
        signsContainer.appendChild(badge);
    });
}

// Display state-specific requirements
function displayStateRequirements(scenario, formData) {
    const stateNotesCard = document.getElementById('stateNotesCard');
    const stateNotesDiv = document.getElementById('stateNotes');
    const stateSignsDiv = document.getElementById('stateSigns');
    const stateEquipmentDiv = document.getElementById('stateEquipment');

    // Check if there are state-specific requirements
    const hasStateNotes = scenario.state_notes && scenario.state_notes !== 'none';
    const hasStateSigns = scenario.state_signs_required && scenario.state_signs_required !== 'none';
    const hasStateEquipment = scenario.state_equipment_required && scenario.state_equipment_required !== 'none';

    if (hasStateNotes || hasStateSigns || hasStateEquipment) {
        stateNotesCard.style.display = 'block';

        // State notes
        if (hasStateNotes) {
            stateNotesDiv.textContent = scenario.state_notes;
        } else {
            stateNotesDiv.textContent = '';
        }

        // State-specific signs
        if (hasStateSigns) {
            const signsArray = scenario.state_signs_required.split(';').filter(s => s.trim());
            stateSignsDiv.innerHTML = '<strong>Additional Signs Required:</strong><br>' +
                signsArray.map(s => `• ${s}`).join('<br>');
        } else {
            stateSignsDiv.innerHTML = '';
        }

        // State-specific equipment
        if (hasStateEquipment) {
            const equipmentArray = scenario.state_equipment_required.split(';').filter(e => e.trim());
            stateEquipmentDiv.innerHTML = '<strong>Additional Equipment Required:</strong><br>' +
                equipmentArray.map(e => `• ${e}`).join('<br>');
        } else {
            stateEquipmentDiv.innerHTML = '';
        }
    } else {
        stateNotesCard.style.display = 'none';
    }
}

// Show results section
function showResults() {
    document.getElementById('results').classList.remove('hidden');

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hide results section
function hideResults() {
    document.getElementById('results').classList.add('hidden');
}

// Show error message
function showError(message) {
    const errorSection = document.getElementById('error');
    const errorText = document.getElementById('errorText');

    errorText.textContent = message;
    errorSection.classList.remove('hidden');

    // Scroll to error
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hide error message
function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// Generate and show SOP
function handleGenerateSOP() {
    if (!window.currentScenario || !window.currentFormData) {
        showError('Please calculate spacing first before generating SOP.');
        return;
    }

    const sopHTML = generateCompleteSOP(
        window.currentScenario,
        window.currentFormData,
        window.currentConeQuantities
    );

    const sopContainer = document.getElementById('sopContent');
    sopContainer.innerHTML = sopHTML;

    showSOPSection();

    // Scroll to SOP section
    document.getElementById('sop').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Show SOP section
function showSOPSection() {
    document.getElementById('sop').classList.remove('hidden');
}

// Hide SOP section
function hideSOPSection() {
    document.getElementById('sop').classList.add('hidden');
}

// Print SOP
function printSOP() {
    window.print();
}
