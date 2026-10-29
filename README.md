# BusyBee 🐝

**A colourful, scrapbook-inspired academic calendar designed to make deadlines easier to see and manage.**

BusyBee is a student-focused planner concept built around one simple idea: deadlines should be visually obvious. Instead of relying on tiny event markers or thin bars, BusyBee aims to colour the **entire calendar date cell** by subject, with a separate visual indicator for urgency.

> **Project status:** Early development. This repository documents the first version and its intended features; features are not considered implemented until they are available in the app.

## ✨ Goals

- **Full-cell colour blocking:** Fill the whole date square for dates with deadlines.
- **Subject-based colours:** Give each course a consistent, recognisable colour.
- **Separate urgency cues:** Make overdue and approaching deadlines stand out without replacing subject colours.
- **Monthly calendar view:** Navigate the month and select dates to inspect their deadlines.
- **Quick deadline entry:** Add a task title, due date, subject, and urgency.
- **Local-first storage:** Keep deadline data in the browser for the first version, without requiring an account.
- **Backup and portability:** Plan for export/import so users can keep a backup of their deadlines.
- **Scrapbook-inspired visual design:** A playful, tactile planner aesthetic that stays readable and avoids clutter.

## 🎨 Design principles

1. **See it before you calculate it.** Visual hierarchy should reduce the effort needed to recognise a busy or urgent week.
2. **Colour has a consistent meaning.** Subject colours stay stable; urgency is communicated separately with labels, borders, or countdown text.
3. **Readable at a glance.** Deadline titles and urgency labels should remain legible inside coloured cells.
4. **Simple first.** The calendar and reliable deadline management come before optional extras such as study timers, streaks, and ambience.
5. **Local-first by default.** The initial version is intended to save data in the current browser. Browser storage is not cloud sync, and clearing browser data can erase saved deadlines, so export/backup support is important.

## 🗓️ Planned first-version workflow

1. Open the monthly calendar.
2. Select a date and add a deadline.
3. Assign a subject and urgency level.
4. See the date cell filled with the subject colour and a separate urgency cue.
5. Select the date later to review, edit, or complete its deadlines.

## 🧰 Technology

The implementation stack is still to be finalised. A lightweight web app using **React and Vite** with a custom-styled calendar is one candidate. The calendar must support custom date-cell styling rather than relying only on default event bars.

## 🚧 Roadmap

- [ ] Build the monthly calendar and month navigation
- [ ] Implement full-cell colour fills
- [ ] Add and edit deadlines
- [ ] Create an editable subject colour palette
- [ ] Add overdue / urgent / upcoming indicators
- [ ] Show all deadlines for a selected date
- [ ] Persist data in browser storage
- [ ] Add deadline export/import
- [ ] Test keyboard access, contrast, and smaller screens
- [ ] Consider optional study tools after the core calendar is reliable

## 💡 Why BusyBee?

Traditional calendars can show *when* something is due without making the overall workload immediately apparent. BusyBee explores a more visual, colour-blocked way to organise academic deadlines, especially for students who benefit from seeing time and priorities represented spatially.

## 📌 Scope

BusyBee is a personal productivity project, not a replacement for an institution's official deadline system. Always verify important dates against the official course or university source.

## 👩‍💻 Author

Created by [Anubhuti Goswami](https://github.com/anubhutigoswami125).

---

*Made for busy semesters, colourful calendars, and a little less deadline chaos.* 🐝
