# Project Overview

## What This Project Is

This project is a **single-purpose incident reporting web application** designed for residents of Laureate Park (Orlando, FL).

Its sole function is to allow residents to quickly report when cattle have escaped their designated land and to automatically notify the responsible ranger or responder — without requiring a phone call.

This is not a general neighborhood app, social platform, or HOA system.

---

## Problem Being Solved

There are parcels of land adjacent to a neighborhood that contain cattle. Occasionally, cows escape their assigned areas and wander into residential spaces or roadways.

The current process requires residents to:

- Find a phone number
- Make a call
- Verbally describe the issue

This is slower than necessary and does not provide visibility into whether the issue has already been reported or resolved.

---

## Desired User Experience

### Resident (Public User)

- Can report a loose cow in under 30 seconds
- Uses a mobile phone in most cases
- Is not required to create an account
- Provides minimal required information
- Receives clear confirmation that the report was sent

The experience should be **faster than calling a phone number**.

---

### Ranger / Responder (Admin User)

- Receives immediate SMS notification when a report is submitted
- Can view reports in a simple dashboard
- Can acknowledge and resolve reports
- Does not need complex tooling or workflows

---

## Core Functional Goals

- Accept incident reports with minimal friction
- Capture useful location context
- Persist reports in a database
- Notify responders automatically via SMS
- Track report status (reported → acknowledged → resolved)
- Reduce duplicate reports through status visibility

---

## Non-Goals (Important)

The following are explicitly out of scope:

- Social feeds or comments
- General neighborhood discussions
- HOA governance tools
- User profiles for residents
- Long-term analytics or reporting dashboards
- Monetization or advertising

The application should remain narrowly focused.

---

## Behavioral Constraints

- The app should work reliably on mobile devices
- The reporting flow should never require more than one primary action
- SMS notifications must be sent server-side and be reliable
- Sensitive credentials must never be exposed to the client
- The system should fail gracefully if notifications cannot be sent

---

## Success Criteria

The project is considered successful if:

- Residents prefer it over calling the ranger
- Rangers reliably receive actionable notifications
- Duplicate reports decrease
- The app requires minimal ongoing maintenance

---

## Mental Model for Contributors and AI Tools

When making decisions, ask:

> “Does this make it easier to report a loose cow and notify the ranger?”

If the answer is no, it likely does not belong in this project.

---

## Summary

This project is intentionally simple.

It replaces a phone call with a fast, reliable web-based reporting flow and nothing more.
