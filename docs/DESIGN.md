---
name: SHS Atlas
description: A student-made indoor map of Stevenson High School that behaves like a native maps app, in the school's green and gold.
colors:
  patriot-green: "#007236"
  patriot-green-dark: "#12aa4c"
  patriot-green-soft: "#e0f0e6"
  route-red: "#e0202b"
  route-red-dark: "#ff4f55"
  gold: "#e8c703"
  gold-dark: "#e8c703"
  gold-ink: "#241a00"
  ground: "#f3f4f1"
  surface: "#ffffff"
  ink: "#14171c"
  ink-muted: "#5d6670"
  hairline: "#e3e6ea"
  hairline-strong: "#cfd4da"
  ok: "#1d7a46"
  ok-soft: "#e5f4ea"
  warn: "#9a5b00"
  warn-soft: "#fdf1dc"
  north-red: "#e5484d"
  dark-ground: "#17191d"
  dark-surface: "#24272c"
  dark-ink: "#eef1f4"
  dark-ink-muted: "#a3acb6"
  poi-classroom: "#ffffff"
  poi-lab: "#c4e7df"
  poi-arts: "#f6d3db"
  poi-athletics: "#cfe0f7"
  poi-dining: "#f8e2b4"
  poi-services: "#e0daf4"
  poi-library: "#cdebc9"
  hallway: "#a7b3c1"
  wall: "#1f252d"
  wall-dark: "#e3e8ee"
  dark-green-ink: "#04170b"
  dark-hairline: "#363b42"
  dark-poi-classroom: "#3a3f46"
  dark-poi-lab: "#2c5a52"
  dark-poi-arts: "#6a4049"
  dark-poi-athletics: "#344d6e"
  dark-poi-dining: "#6b5730"
  dark-poi-services: "#4c4669"
  dark-poi-library: "#33573a"
  swatch-edge: "rgba(0,0,0,0.15)"
typography:
  fun-wordmark:
    fontFamily: "Comic Sans MS, Comic Sans, Comic Neue, Chalkboard SE, cursive"
    fontSize: "21px"
    fontWeight: 700
  fun-wordmark-desktop:
    fontFamily: "Comic Sans MS, Comic Sans, Comic Neue, Chalkboard SE, cursive"
    fontSize: "25px"
    fontWeight: 700
  fun-title:
    fontFamily: "Comic Sans MS, Comic Sans, Comic Neue, Chalkboard SE, cursive"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: 1.05
  fun-heading:
    fontFamily: "Comic Sans MS, Comic Sans, Comic Neue, Chalkboard SE, cursive"
    fontSize: "19px"
    fontWeight: 700
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI Variable Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI Variable Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI, Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  place-name:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.25
  icon-glyph:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "20px"
    lineHeight: 1
  input:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  control:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 550
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 650
  tile-number:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
rounded:
  xs: "3px"
  sm: "8px"
  mark: "10px"
  md: "12px"
  lg: "18px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
components:
  search-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "50px"
  button-primary:
    backgroundColor: "{colors.patriot-green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 18px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 15px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "40px"
  floor-picker:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    width: "46px"
  floor-picker-active:
    backgroundColor: "{colors.patriot-green}"
    textColor: "{colors.surface}"
  map-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "46px"
  route-pill:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  place-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 18px 18px"
---

# Design System: SHS Atlas

## Overview

SHS Atlas is the school as a native maps app. The 3D building fills the whole screen; everything else floats on top of it: one search pill, one bottom sheet (a 380px floating panel on desktop), a vertical floor picker with compass and reset, and a place card when a room is tapped. It borrows the shared canon of Apple Maps and Google Maps on purpose, so a student who has never seen it already knows how to use it, between classes, one-handed.

It is student-made and unofficial. Its mark is the Stevenson Patriots logo, which the school lets students use for student projects, cleaned up from the source image and embedded at 256px. The green (#007236) and gold (#e8c703) are sampled from that logo. The About section still says the map is not an official school or district site.

## Colors

- **Patriot green** (`#007236`, `#12aa4c` in dark mode) is the main accent. It carries the interface: primary buttons, the active floor, the selected list row, step numbers. Nothing decorative is green.
- **Route red** (`#e0202b`, `#ff4f55` in dark mode) is reserved for the 3D map: the route line (drawn over a white casing, a dark casing in dark mode), its Start/End tags and the selected room's outline. Green and gold disappear against the map's fields, trees, courtyards and library fills, so the route uses a color the map doesn't.
- **Walls** are unlit solid ink (`#1f252d`; near-white `#e3e8ee` in dark mode) so their tops read as lines against the white rooms and blue-gray hallways.
- **Gold** (`#e8c703`, `#e8c703` in dark mode, always with dark `#241a00` text) is the school's second color, used sparingly: the layers in the SHS Atlas mark, the route pill. Gold is never used for text on a light surface.
- **Neutral ground** (`#f3f4f1`) under **white surfaces** (`#ffffff`). Panels never tint; hierarchy comes from shadow and hairlines (`#e3e6ea`).
- **Room categories** are soft point-of-interest fills on the map (classroom white, lab teal, arts pink, athletics blue-gray, dining amber, services lavender, library green). They appear in the UI only as 10px swatches.
- **Status:** green chips mean "from the official plan"; amber chips mean "estimated". The compass north tip is the one red; parking and door labels are neutral dark chips.
- Dark mode follows the device, with matching charcoal surfaces (`#24272c` on `#17191d`) and a lighter green.

## Typography

The playful layer is Comic Sans (Comic Neue from Google Fonts where Comic Sans isn't installed, as on iPhones and iPads). It is used deliberately, never for running text: the SHS Atlas title, section headings in the sheet (green), the level badge, the floor picker numbers, the walking-time pill, and the big building and parking labels on the map. Inputs, lists, steps, room cards and room numbers stay in the system font so they read fast.


The system UI font (SF on Apple devices, Segoe on Windows, Roboto on Android and Chromebooks), with no webfont, so the app feels native and loads instantly. Room numbers are the display style: 30px, heavy, tabular figures. Section titles in the sheet are 17px bold. Body text is 15px; metadata is 13px muted. Search input is 16px so iOS doesn't zoom.

## Layout

- **Brand:** the Patriots logo and "SHS Atlas" sit on the map itself as a wordmark in the bottom-left corner (just above the sheet on phones, right of the panel on desktop), like a maps app's logo. The search bar carries a plain search icon.

- **Phone (below 900px):** the map is edge to edge. The search pill sits at the top inside the safe area; the level badge sits under it on the left; the floor picker, compass and reset sit on the right. A bottom sheet has three resting points: peek (quick chips plus the From/To fields), half, and full. A place card replaces the sheet while open. The sheet goes to peek when a route is shown, so the route stays in view.
- **Desktop (900px and up):** the sheet becomes a 380px floating panel on the left, with the search pill above it; the place card floats beside it.
- The 3D camera's view offset is shifted so whatever is focused centers in the visible part of the map, not behind the sheet or panel.

## Elevation & Depth

Two shadow levels, both soft, offset downward and blurred: `--shadow` for floating controls and pills, `--shadow-lg` for the sheet and place card. There is no glass, blur or gradient anywhere.

## Shapes

Pills (999px) for search, buttons, chips and the route pill; circles for map controls; 12px for the floor picker and inner fields; 18px for the sheet and card. Room-number tiles in the result list are 40px squares with 12px corners.

## Components

- **Search pill:** mark, input, clear button. Focusing it on a phone opens the sheet to full.
- **Floor picker:** a vertical segmented stack with a building glyph for Outside and 1–4. The active floor is Patriot green.
- **Quick chips:** Nurse, Main Office, Pool, Library, Cafeterias, Student Services, Testing. One match opens it; several show the list.
- **Directions:** two fields joined by a dotted start-to-end rail, a swap button, Get directions, Elevators only. Clear appears only when there is something to clear.
- **Route pill:** a walking icon plus "about 7 min · 505 m" and an end-route button. It floats on the map under the level badge. This is the signature element.
- **Steps:** numbered with soft green circles. Tapping a step jumps to that floor and frames that leg.
- **Place card:** room number, name, building, level and category, a source chip, the description, then Directions here (primary) and the secondary actions.
- **Result rows:** number tile, swatch and name, then building and level.

## Do's and Don'ts

- Do keep the map visible: every tool floats over it, and nothing takes over the whole screen except a full sheet the user opened.
- Do use Patriot green only for the user's own context (route, selection, active floor, primary action).
- Do use SVG for icons, size touch targets at 40px or more, and respect reduced motion (the sheet and card stop animating).
- Don't add a sidebar layout, eyebrow labels, gradient text, glass effects or decorative color.
- Don't use the district's logo or wordmark; the school colors are fine, the official marks are not.
- Don't print estimated positions without the amber "estimated" chip.

## Beta front page (site/index.html)

The beta landing page is deliberately outside this system, by request: a bare-bones, amateur, early-web page (white or near-black page, Verdana body, Comic Sans headings in Patriot green, blue underlined links, a dashed yellow heads-up box, a tilted yellow BETA sticker, a chunky green Continue button). It has no map chrome, cards or shadows beyond the button. Detector findings for colors, fonts and sizes outside this file's tokens are expected there; it is replaced when SHS Atlas leaves beta.
