---
name: Musclo
description: Intelligent Workout Journal & AI Personal Trainer
colors:
  primary: "#0000EE"
  neutral-bg: "#F4F4F5"
  text-primary: "#1A1A1A"
  text-secondary: "#4A4A4A"
  text-muted: "#7C7C80"
  border-divider: "rgba(0, 0, 0, 0.05)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(3.5rem, 12vw, 8rem)"
    fontWeight: 900
    lineHeight: 0.85
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
rounded:
  sm: "12px"
  md: "24px"
  lg: "32px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
---

# Design System: Musclo

## 1. Overview

**Creative North Star: "The Tactile Laboratory"**

Musclo is a high-performance environment where the rigor of exercise science meets the physical feedback of elite equipment. The system rejects the "paper-thin" flatness of modern SaaS in favor of a **Neumorphic (Soft UI)** depth that makes every interaction feel intentional and grounded. 

**Key Characteristics:**
- **Physical Feedback**: Surfaces have mass, depth, and tactility.
- **Scientific Precision**: Typography is bold, uppercase, and clear, reflecting clinical authority.
- **High-Energy Restraint**: The vibrant Orange accent is used sparingly to signal intensity and "Active" states.

## 2. Colors

The palette is a high-contrast industrial system. We utilize "True Blue" as a signal of high-voltage performance, paired with "Midnight Ink" (dark) and "Zinc White" (light) surfaces.

### Primary
- **True Blue** (#0000EE): The signal of precision, athletic intelligence, and active synchronization. Used for CTAs, live readouts, and active states.

### Neutral
- **Zinc Surface** (#F4F4F5): The foundational surface for light mode.
- **Midnight Ink** (#09090B): The foundational surface for dark mode.
- **Onyx Text** (#09090B): Deep, high-contrast primary text.
- **Zinc Secondary** (#52525B): Hierarchy for supporting data.

**The Rarity Rule.** The True Blue accent is used on ≤15% of any given screen. Its rarity makes it an authoritative signal of performance.

## 3. Typography

**Display Font:** Inter (Sans-serif)
**Body Font:** Inter (Sans-serif)

**Character:** The typography is engineered for clarity. High-weight contrasts and tracking-tight headers give the interface an "Industrial Strength" feel.

### Hierarchy
- **Display** (900, clamp 2.5rem-4rem, 1): Hero headlines and major section titles. Always uppercase.
- **Headline** (700, 1.5rem, 1.2): Section headers and primary card titles.
- **Body** (400, 15px, 1.6): All prose and log entries. Max line length 65ch.
- **Label** (800, 10px, 0.1em tracking): Used for "Initializing Intelligence" states and micro-metadata. Always uppercase.

## 4. Elevation

Musclo explicitly rejects flat design. Depth is conveyed through **Dual-Shadow Neumorphism**, creating a "curved" surface effect where elements appear to be molded from the background.

### Shadow Vocabulary
- **Standard Depth** (`10px 10px 20px rgba(174, 174, 192, 0.6)`): Used for primary cards and floating panels.
- **Inset Depth** (`inset 6px 6px 12px ...`): Used for "Pressed" states, input fields, and completed sets.

**The Responsive Depth Rule.** Elements are raised by default. They "press" into the surface only as a response to interaction (active/focus) or completion.

## 5. Components

### Buttons
- **Shape:** Softly squared corners (24px radius).
- **Primary:** Orange background with white text. High-contrast and physically raised.
- **Interactive:** Transitions to an "Inset" shadow on click to simulate a physical button press.

### Cards / Containers
- **Corner Style:** Large radii (32px) for a premium, ergonomic feel.
- **Background:** Solid surfaces only (Glassmorphism is prohibited).
- **Elevation:** Standard Neumorphic shadow (`shadow-neu`).

### Inputs / Fields
- **Style:** Inset Neumorphic shadows to represent a "Well" or "Receptacle" for data.
- **Focus:** Border shift toward Orange with a subtle external glow.

## 6. Do's and Don'ts

### Do:
- **Do** use uppercase for all headers and labels to maintain authoritative tone.
- **Do** apply `shadow-neu` to all primary containers to maintain the "Tactile Lab" theme.
- **Do** use `rounded-[2.5rem]` or larger for primary containers to signal "Industrial Precision."

### Don't:
- **Don't** use Glassmorphism or background blurs for primary containers; use solid, grounded surfaces.
- **Don't** use generic corporate blues; our Blue (#0000EE) is high-voltage.
- **Don't** use "Side-stripe" borders as accents; use background depth or True Blue outlines.
