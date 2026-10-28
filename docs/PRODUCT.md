# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Static site on Cloudflare Pages; the map is one self-contained HTML page: three.js r128 (cdnjs) + OrbitControls, inline CSS/JS, no build step. External scripts only from cdnjs/jsdelivr; fonts only from Google Fonts.

## Users
- New students and freshmen finding classes between periods.
- Any Adlai E. Stevenson High School student looking for an unfamiliar room, club room, office, or the pool.
- Visitors and parents finding event spaces (PAC, Field House, conference rooms).
Primary use is on a phone, one-handed, while walking the halls.

## Product Purpose
An interactive 3D map of Stevenson High School (Lincolnshire, IL): every building, level 1–4, every numbered room, hallways and walls, plus walking directions between any two rooms. Success: someone standing in a hallway understands where they are and how to get where they're going within seconds.

## Positioning
Student-made and unofficial, with its own name (the successor in spirit to SHSMaps, a student app that is now offline). Rooms are traced from the district's 2023–24 campus map PDF and the floor plans in SHSMaps' demo video, fitted to real building outlines, and cross-checked with student door photos.

## Operating Context
- Walking between classes with a short passing period; phone in one hand.
- Room numbers follow a zone scheme: 1xxx/2xxx West levels 1–2, 3xxx Link, 4xxx performing arts, 5xxx Field House/pool/PWC, 6xxx/7xxx/8xxx East levels 1–3, 9xxx rooftop level 4.
- Pool entry depends on time of day (locker rooms before 3:30 PM, deck entrance after).

## Capabilities and Constraints
- Views: Outside (exterior) and Levels 1–4; search by number or name; walking directions with stairs/elevator-only option; Plan my day (periods 1–8); deep links (#room=, #from=&to=); per-room card with source; local label edits and "copy my corrections".
- Map-style touch controls: one finger pans, two fingers rotate/pinch.
- Per-viewer state uses localStorage only (edits, plan, locker preference).
- First screen must lead with exploring the building (the 3D map), tools secondary.

## Brand Commitments
- Must read as student-made and unofficial; uses the school colors (green and gold, at the user's request) but never district logos, wordmarks or mascot art.
- Name: SHS Atlas (chosen by the user from proposals).

## Evidence on Hand
- 650+ rooms with numbers and names from official plans; club/office notes from d125.org pages and the 2019 co-curricular catalog; student door photos for level 3.
- No testimonials, usage figures, or endorsements exist; do not invent them.

## Product Principles
1. The building is the interface: the map fills the screen and stays visible while using tools.
2. Hallway-speed answers: a room number typed gives a location and a route in one step.
3. Honest about sources: every room says where its data came from and how exact it is.
4. Thumb-first: primary actions reachable one-handed at the bottom of a phone screen.

## Accessibility & Inclusion
Readable outdoors and on small phones; respects prefers-reduced-motion and light/dark mode; keyboard usable on laptops/Chromebooks.
