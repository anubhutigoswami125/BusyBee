# BusyBee 🐝

**A Pop Art deadline calendar for students who have a lot going on.**

[**Open BusyBee →**](https://anubhutigoswami125.github.io/BusyBee/)

BusyBee is a lightweight, browser-based academic planner for keeping deadlines visible without turning the calendar into a wall of text. It pairs a bold comic-book / scrapbook-inspired interface with a deliberately clean calendar: dates stay readable, and deadlines show up as solid subject-colour fills instead of task labels and badges inside each cell.

## What it does

- **Monthly calendar:** move between months or jump straight back to today.
- **Colour-coded dates:** deadline dates use their assigned colours; the calendar cells stay uncluttered.
- **Quick capture:** enter multiple deadlines in a sticky-note-style box, one task per line, such as `C++ CA 30 Oct` or `BioSustain 18-19 Nov`.
- **Per-task colour choices:** choose from a broad swatch grid while adding deadlines.
- **Create, edit, and delete:** manage individual deadlines from the calendar and selected-day list.
- **Subjects you can customise:** rename subjects and change their colours.
- **Selected-day details and upcoming list:** see task names and details outside the calendar grid.
- **Light and dark themes:** the dark theme uses a pink-and-black palette.
- **Keyboard support:** navigate the calendar grid with arrow keys and Enter.
- **Backup and restore:** export calendar data as JSON and restore it later.
- **Local-first storage:** deadlines are saved in your browser using `localStorage`; no account is required.
- **Privacy and terms pages:** included in the project.

## The visual direction

BusyBee uses thick comic-style outlines, bold colour, halftone-inspired details, offset shadows, and playful Pop Art accents. The calendar itself is intentionally restrained so the colours communicate which dates have deadlines without adding extra clutter.

## Run locally

BusyBee is a static HTML, CSS, and JavaScript project. It does not require a package install or build step.

1. Clone or download this repository.
2. Open `index.html` in a modern browser, or serve the folder with any static web server.
3. Your deadlines will be stored in that browser profile. Use **Back Up** before clearing browser data or moving to another device.

## Deploy with GitHub Pages

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose the `main` branch and `/(root)`, then save.

GitHub Pages publishes the site at:

`https://anubhutigoswami125.github.io/BusyBee/`

## Data and limitations

- **Browser-specific data:** your calendar does not automatically sync across browsers or devices.
- **Storage security:** browser storage is not encrypted. Avoid entering passwords or sensitive information in notes.
- **Backup restore:** restoring a backup replaces the current calendar data after confirmation.
- **Verify important dates:** BusyBee is a personal planner, not an official university deadline service. Confirm critical dates against official notices.
- **Legal-page review:** the Privacy Policy and Terms and Conditions should be reviewed and completed for your intended public release.

## Built with

HTML · CSS · JavaScript · Browser `localStorage` · GitHub Pages

## Author

Created by [Anubhuti Goswami](https://github.com/anubhutigoswami125).
