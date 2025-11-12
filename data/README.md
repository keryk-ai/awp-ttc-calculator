# SOP Generator Data Files

This folder contains checklist data files used by the SOP generator.

## Files

- **ttc-setup-sequence-2lane.json** - 15-step setup procedure for 2-lane roads
- **ttc-breakdown-sequence.json** - 14-step breakdown procedure

## Why This Folder Exists

GitHub Pages serves content from the `/docs` folder. Files outside of `/docs` (like `/assets/checklists/`) are not accessible to the JavaScript running in the browser.

These are copies of the source files located in:
- `../assets/checklists/ttc-setup-sequence-2lane.json`
- `../assets/checklists/ttc-breakdown-sequence.json`

## Updating

If the source checklist files in `/assets/checklists/` are updated, these copies need to be updated as well:

```bash
cp ../assets/checklists/ttc-setup-sequence-2lane.json docs/data/
cp ../assets/checklists/ttc-breakdown-sequence.json docs/data/
```

## Usage

The `sop-generator.js` file loads these JSON files to generate scenario-specific Standard Operating Procedures.
