# BusyBee 🐝

**A scrapbook-inspired academic deadline calendar with full-cell subject colours and separate urgency indicators.**

BusyBee is a lightweight, browser-based calendar for tracking academic deadlines. Choose a date, add a deadline, assign a subject and urgency level, and keep notes alongside it. Subject colours fill the calendar date cell, while urgency is indicated separately.

## Features

- Monthly calendar with previous, next, and today navigation
- Add, edit, and delete deadlines
- Subject labels with editable names, six-digit hex colours, and paper-inspired swatch presets
- Diagonal split-colour cells when two different subjects share a date
- Light and dark themes, saved in the current browser
- Keyboard navigation across the calendar grid with arrow keys and Enter
- Separate urgency levels: normal, important, and critical
- Dashed overdue borders and a distinct due-today ribbon
- Selected-day deadline details and an upcoming-deadlines list
- JSON backup and restore
- Local-first storage using the browser's `localStorage`; no account or cloud sync
- Privacy Policy and Terms and Conditions pages

## Run locally

This is a static HTML, CSS, and JavaScript project. No build step or package installation is required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser, or serve the folder with any static web server.
3. Your deadlines remain in that browser profile. Use **Back Up** to export a JSON copy before clearing browser data or changing devices.

## Deploy with GitHub Pages

In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and `/(root)`, then save. Once GitHub finishes publishing, the project site should be available at:

`https://anubhutigoswami125.github.io/BusyBee/`

The app uses relative asset and legal-page links so it can run from the repository subpath.

## Important limitations

- Data is stored in the current browser only. It does not automatically sync between devices.
- Browser storage is not encrypted. Do not enter passwords or sensitive information in notes.
- Restoring a backup replaces the current calendar data after confirmation.
- BusyBee is a personal project, not an official university deadline service. Confirm important dates against official notices.
- The legal pages are present as drafts and need their contact and governing-law details reviewed before a public launch.

## Author

Created by [Anubhuti Goswami](https://github.com/anubhutigoswami125).
