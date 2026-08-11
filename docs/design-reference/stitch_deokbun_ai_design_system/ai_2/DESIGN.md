---
name: 덕분AI
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#44474c'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#386568'
  on-secondary: '#ffffff'
  secondary-container: '#b9e8eb'
  on-secondary-container: '#3d6a6d'
  tertiary: '#260f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#442000'
  on-tertiary-container: '#d8781e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#bcebee'
  secondary-fixed-dim: '#a0cfd2'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#1f4d50'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb781'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703800'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Pretendard
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Pretendard
    fontSize: 26px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Pretendard
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Pretendard
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Pretendard
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Pretendard
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Pretendard
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  gutter: 16px
  section-gap: 32px
  element-gap: 12px
  nav-height: 64px
---

## Brand & Style

The design system for 덕분AI is built on the philosophy of "Warm Guidance." It aims to evoke a sense of calm, wisdom, and reliability, positioning the AI as a helpful companion for counseling and fortune-telling. 

The aesthetic is **Corporate Modern with a Soft Touch**, blending the precision of a professional service with the warmth of a lifestyle app. It utilizes high-quality typography, generous whitespace, and a sophisticated color palette to differentiate itself from cluttered or overly mystical alternatives. The emotional response should be one of "gentle clarity"—users should feel heard, supported, and clear-headed while interacting with the interface.

## Colors

The color palette is grounded in stability and warmth, avoiding the starkness of pure white and black.

- **Background (Warm White - #F9F7F2):** The foundation of the UI. It provides a softer, more organic feel than clinical white, reducing eye strain during long reading sessions.
- **Primary (Deep Navy - #1A2B3C):** Used for headers, primary text, and key structural elements. It conveys authority, wisdom, and professional depth.
- **Secondary (Muted Teal - #5E8B8E):** Used for calming elements, secondary buttons, and success states. It bridges the gap between the professional navy and the warm background.
- **Accent (Warm Orange - #F28C33):** Used sparingly for critical focus points, notifications, or call-to-action highlights. It should never dominate the screen.
- **Surface (White - #FFFFFF):** Used for cards and containers to pop against the Warm White background without needing heavy shadows.

## Typography

The typography system prioritizes legibility and a modern, clean Korean reading experience. **Pretendard** is the primary typeface, ensuring optimized rendering across all platforms and devices.

- **Korean Text:** Uses variable weight Pretendard to ensure perfect balance between titles and long-form counseling text.
- **Numerics:** While using Pretendard, numbers should maintain a clean, sans-serif appearance for data and dates.
- **Hierarchy:** Headlines use tighter tracking and heavier weights (600-700) to stand out against the Deep Navy color. Body text maintains a generous line height (1.6) to ensure comfortable reading of AI-generated responses.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on mobile-first interaction.

- **Safe Margins:** A consistent 20px margin is applied to the left and right of all screens.
- **Vertical Rhythm:** A base 4px/8px scaling system is used. Components are separated by 32px (sections) or 12px (related elements).
- **Bottom Navigation:** Fixed at 64px height with equitable 25% width distribution for the four main icons.
- **Breakpoints:**
  - Mobile: < 600px (1 column)
  - Tablet/Desktop: 600px+ (Maximum content width 480px, centered with side padding to maintain the intimate "chat" feel).

## Elevation & Depth

This design system uses **Tonal Layers** rather than heavy shadows to define hierarchy.

- **Layer 0 (Base):** Warm White (#F9F7F2) background.
- **Layer 1 (Cards/Containers):** Pure White (#FFFFFF) surfaces with a subtle 1px border (#E5E1D8).
- **Layer 2 (Floating/Interactive):** Minimal, high-diffusion shadows (Blur: 12px, Opacity: 4%, Color: Deep Navy) used only for primary interactive elements like the active state of a card or a floating button.
- **Navigation:** The bottom navigation bar uses a subtle top border (1px) and a background blur or solid white fill to separate it from the scrolling content.

## Shapes

The shape language is friendly and approachable, utilizing generous radii to avoid a sharp, institutional feel.

- **Primary Radius:** 16px to 20px for all major cards, input fields, and modals.
- **Small Radius:** 8px for chips, small buttons, and tags.
- **Pill Shape:** Used exclusively for secondary status indicators or "New" badges.

## Components

### Header
The header follows a strict pattern with no hamburger menu:
- **Home:** Displays "덕분AI 나 ▾" (Profile switcher/indicator included).
- **Top Tabs:** Displays "화면명 나 ▾" (e.g., "운세 나 ▾").
- **Detail Screens:** Displays "← 화면명" for easy back-navigation.

### Bottom Navigation
A fixed persistent bar containing exactly 4 items: **홈 (Home), 상담 (Counseling), 운세우편함 (Fortune Inbox), MY**. 
- **Height:** 64px.
- **Icons:** 24px x 24px, stroke-based (2px weight).
- **Active State:** Deep Navy for icons and labels; inactive items use a muted version of Deep Navy at 40% opacity.

### Cards
- **Styling:** White surface, 16-20px corner radius.
- **Definition:** Use a subtle border (#E5E1D8) instead of shadows to differentiate from the Warm White background. 
- **Padding:** 20px internal padding for content breathability.

### Input Fields & Buttons
- **Primary Button:** Deep Navy background with White text, 16px radius, bold weight.
- **Secondary Button:** Muted Teal text or border, used for less critical actions.
- **Inputs:** White background, 16px radius, with the label placed clearly above the field in Deep Navy.

### Chips & Tags
- Used for categories or quick-replies.
- Rounded (8px or pill), using Muted Teal at 10% opacity for backgrounds with Muted Teal text.