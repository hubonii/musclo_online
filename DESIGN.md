---
name: Musclo
description: Intelligent Workout Journal & AI Personal Trainer
colors:
  primary: "#EA580C"
  neutral-bg: "#F0F0F3"
  text-primary: "#1A1A1A"
  text-secondary: "#4A4A4A"
  text-muted: "#7C7C80"
  border-divider: "rgba(0, 0, 0, 0.05)"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 4rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
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

The palette is a "Gold Standard" Soft UI White, avoiding the coldness of pure greys by tinting neutrals toward a warm, clinical tone.

### Primary
- **Musclo Orange** (#EA580C): The signal of energy, success, and active performance. Used for CTAs, active set tracking, and achievements.

### Neutral
- **Soft UI Base** (#F0F0F3): The foundational surface for both light and dark modes (rebranded for dark as Midnight Black).
- **Onyx Text** (#1A1A1A): Deep, high-contrast primary text for maximum readability under strain.
- **Zinc Secondary** (#4A4A4A): Muted hierarchy for supporting data and labels.

**The Rarity Rule.** The primary orange accent is used on ≤10% of any given screen. Its rarity makes it an authoritative signal of action.

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
- **Do** respect the 10% Orange rule; keep the interface primarily neutral.

### Don't:
- **Don't** use Glassmorphism or background blurs; Musclo is built on solid, grounded surfaces.
- **Don't** use generic SaaS blue or neon gradients; these dilute the scientific brand.
- **Don't** use "Side-stripe" borders as accents; use background depth instead.
