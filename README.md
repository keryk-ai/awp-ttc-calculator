# TTC Spacing Calculator - GitHub Pages Site

MUTCD-compliant work zone spacing calculator with 840 pre-calculated scenarios for FL, TN, NC, SC, and GA.

## Overview

This is a standalone static website that provides:
- **Sign spacing calculations** (Signs A, B, C distances from work area)
- **Taper length and buffer space** (based on posted speed)
- **Cone spacing and quantity estimates** (with 20% contingency)
- **State-specific requirements** (TMA thresholds, arrow boards, special signs)
- **Equipment requirements** (device types, crew size, arrow board, TMA)

## Files

- `index.html` - Main calculator interface with form inputs and results display
- `styles.css` - AWP Safety branding with orange/yellow theme, responsive design
- `calculator.js` - JavaScript logic for 840-scenario lookup and calculations
- `ttc-scenarios-table.json` - Complete 840-scenario dataset (590KB)
- `README.md` - This file

## Running Locally

Start a local web server in the `docs` directory:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server -p 8000
```

Then open: http://localhost:8000

## Usage

1. **Select parameters:**
   - Posted speed limit (25-70 mph)
   - Road type (2-lane, multi-lane undivided, multi-lane divided)
   - State (FL, TN, NC, SC, GA)
   - Work duration (short-term, intermediate, long-term)
   - Traffic control method (flagger, AFAD, signs only)
   - Work area length (optional, default 500 ft)

2. **Click "Calculate Spacing"**

3. **View results:**
   - Advance warning sign distances
   - Taper length and buffer space
   - Cone spacing (taper and tangent sections)
   - Device quantities with 20% contingency
   - Required signs list
   - State-specific requirements (if applicable)

## State-Specific Rules

The calculator includes state jurisdiction requirements:

- **Florida (FL):** Duration signs for long-term work
- **Tennessee (TN):** Arrow board MANDATORY for multi-lane closures
- **North Carolina (NC):** TMA required at 55+ mph
- **South Carolina (SC):** TMA required at 40+ mph (STRICTEST threshold)
- **Georgia (GA):** Standard MUTCD compliance

## Technical Details

- **Scenario matching:** Queries 840 pre-calculated scenarios based on 5 input parameters
- **Cone calculations:** Uses taper length, buffer space, and work area length with standard spacing
- **Responsive design:** Mobile-friendly grid layout with breakpoints at 768px and 480px
- **Print support:** Hides form and shows only results when printing
- **Error handling:** Validates inputs and shows clear error messages

## Data Source

Scenarios generated from MUTCD 2023 standards using:
- Table 6C-3 (sign spacing)
- Table 6C-4 (taper lengths)
- Section 6G (buffer space)
- State-specific supplements for FL, TN, NC, SC, GA

## Integration with TTC Agent

This calculator is linked from the TTC voice agent as an external tool. The agent can:
- Direct users to the calculator URL for detailed spacing calculations
- Provide the link when users need exact measurements
- Explain results after users have calculated their scenario

The agent has complementary tools:
- Equipment checklist (types without quantities)
- Setup/breakdown procedures (step-by-step)
- PJSB guide (pre-job safety briefing)
- PPE inspection checklist
- State requirements reference

## Deployment

This site is designed for GitHub Pages deployment:

1. Ensure all files are in the `docs` folder
2. Enable GitHub Pages in repository settings
3. Select "Deploy from a branch" → `main` → `/docs`
4. Site will be available at: `https://<username>.github.io/<repo-name>/`

## License

© 2025 AWP Safety. MUTCD-compliant TTC spacing calculator.
