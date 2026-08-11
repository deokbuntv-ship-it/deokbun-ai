---
name: Precision & Trust
colors:
  surface: '#fbf9fa'
  surface-dim: '#dbd9db'
  surface-bright: '#fbf9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f4'
  surface-container: '#efedef'
  surface-container-high: '#e9e7e9'
  surface-container-highest: '#e4e2e3'
  on-surface: '#1b1c1d'
  on-surface-variant: '#44474c'
  inverse-surface: '#303032'
  inverse-on-surface: '#f2f0f2'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#346666'
  on-secondary: '#ffffff'
  secondary-container: '#b5e9e9'
  on-secondary-container: '#386b6b'
  tertiary: '#260f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#451f00'
  on-tertiary-container: '#db7618'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#b8ecec'
  secondary-fixed-dim: '#9cd0d0'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#194e4e'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#fbf9fa'
  on-background: '#1b1c1d'
  surface-variant: '#e4e2e3'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  data-table:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  baseline: 4px
  container-max-width: 1440px
  sidebar-width: 260px
  gutter: 16px
  margin-desktop: 24px
  padding-card: 20px
---

## Brand & Style

The design system is engineered for **Deokbun AI**, a professional AI administration platform. The brand personality is grounded in technical authority, reliability, and precision. It targets power users and data analysts who require a high-density, low-friction environment for complex decision-making.

The aesthetic follows a **Corporate / Modern** style with a focus on high information density. It prioritizes clarity and functional hierarchy over decorative elements. The visual language uses subtle tonal shifts to define boundaries, ensuring the UI remains unobtrusive while highlighting critical data insights. The emotional response should be one of "calm control"—the interface feels stable, performant, and deeply organized.

## Colors

The color palette is built on a foundation of professional neutrals to facilitate long-duration focus. 

- **Deep Navy (#1A2B3C)** is the primary color, used for structural navigation (Sidebar) and primary actions to establish authority.
- **Muted Teal (#4A7C7C)** provides secondary contrast for sub-navigation or grouping, softening the heavy navy.
- **Muted Warm Orange (#E67E22)** is used sparingly as an accent for call-to-actions that require immediate attention without causing visual fatigue.
- **Functional Colors** (Success, Warning, Error) are desaturated to ensure they fit within the professional SaaS aesthetic while remaining distinct for status reporting.
- **Background (#F8F9FA)** and **Surface (#FFFFFF)** create a clear "layer" distinction, where the surface represents actionable content areas.

## Typography

This design system utilizes **Hanken Grotesk** as the primary typeface for its clean, contemporary Grotesque qualities that pair excellently with Korean characters (fallback to Pretendard). For data-heavy contexts, tabular figures are enforced to ensure numbers align perfectly in vertical columns.

- **JetBrains Mono** is introduced for labels, IDs, and technical metadata to differentiate static content from dynamic system data.
- **Text Alignment:** All numeric data in tables must be right-aligned or decimal-aligned.
- **Density:** Body text is set slightly smaller (14px) than standard consumer apps to accommodate the high-density requirements of an admin dashboard.

## Layout & Spacing

The layout follows a **Fixed Grid** model optimized for 1440px desktop environments. It utilizes a structural "Shell" architecture.

- **Sidebar:** Fixed at 260px. It uses the Primary Deep Navy color for the highest hierarchy.
- **Main Content:** A fluid area with a 1440px max-width cap to prevent line-lengths from becoming unreadable on ultra-wide monitors.
- **Spacing Rhythm:** Based on a 4px baseline grid. Components use 16px (gutter) and 24px (margin) increments to maintain a compact but breathable technical feel.
- **Data Grids:** Use a "Compact" vertical rhythm (8px internal cell padding) to maximize the amount of visible information per screen.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** instead of heavy shadows. Depth is communicated through color stacking:
1. **Level 0 (Background):** Soft Gray (#F8F9FA) - The canvas.
2. **Level 1 (Surface):** White (#FFFFFF) - Cards, Table containers, Sidebar sections. These have a 1px border (#E9ECEF) to define edges.
3. **Level 2 (Overlays):** Drawers and Dialogs. These use a very soft, diffused shadow (0px 8px 24px rgba(0,0,0,0.08)) to lift them above the main work area.

Avoid using shadows on standard cards; use the 1px border to maintain a "flat and fast" professional aesthetic.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness profile. This creates a disciplined, precise look that feels modern but remains institutional and serious.

- **Buttons & Inputs:** 4px (0.25rem) corner radius.
- **Cards & Modals:** 8px (0.5rem) corner radius.
- **Status Badges:** 2px or fully square to denote technicality.

## Components

### Buttons
- **Primary:** Deep Navy background, white text. No gradient.
- **Secondary:** Muted Teal ghost-style or light tint background.
- **Danger:** Muted Red background for destructive actions.

### KPI Cards
- White surface, 1px border. 
- Large Hanken Grotesk numbers (Medium weight).
- Top-right corner reserved for "Trend" indicators (Success/Error colors).

### Data Tables
- Header: Light gray background (#F1F3F5), bold 12px uppercase labels.
- Rows: 48px height for standard density. 
- Hover state: Very light gray tint (#F8F9FA).
- Numeric columns: Right-aligned using JetBrains Mono or tabular-spaced Hanken Grotesk.

### Status Badges
- Small, rectangular with subtle rounded corners (2px).
- Low-opacity background tints (e.g., Success: 10% Green background with 100% Green text).

### Filter Bar
- Horizontal arrangement above data tables. 
- Segmented controls or simple outlined input fields to minimize visual weight.

### Drawer & Dialog
- **Drawer:** Slides from right, 400px width, used for viewing record details without losing context.
- **Confirmation Dialog:** Centered, high-contrast primary button, used only for irreversible actions.