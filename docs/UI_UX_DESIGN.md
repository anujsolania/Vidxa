# Vidxa - UI/UX Design Guidelines

## 1. Design Philosophy
Vidxa draws profound inspiration from modern developer-centric tools like **Linear** and **Vercel**. 
The goal is to provide a **simple, professional, and highly focused** user experience. The interface should feel snappy, technical, and uncluttered. 

We will adhere to a **minimalist "Glassmorphism" & "Dark Mode first"** aesthetic, featuring sharp borders, deep contrasts, and subtle ambient glows.

## 2. Color Palette
- **Primary (Accent):** `#6366f1` (Indigo 500) / Pure Black in Light Mode.
- **Dark Mode Background:** `#000000` (Pure Black) with a subtle radial gradient mesh in the top right.
- **Light Mode Background:** `#ffffff` (Pure White) with a clean, low-opacity radial mesh.
- **Glass Surface:** `rgba(25, 25, 25, 0.4)` (Dark) / `rgba(255, 255, 255, 0.7)` (Light) for frosted panels.
- **Borders:** `rgba(255, 255, 255, 0.08)` (Dark) - crucial for the Linear aesthetic. Clean, 1px lines.
- **Text (Primary):** `#ffffff` (Dark) / `#000000` (Light) - high contrast for readability.
- **Text (Secondary):** `#888888` (Dark) / `#666666` (Light) - muted for less important information.

## 3. Typography
- **Font Family:** `Inter`, system UI stack. It is highly legible and provides a technical, precise look.
- **Headings:** SemiBold (600) to Bold (700), tightly tracked (`letter-spacing: -0.02em` or `-0.03em`) for a premium feel.
- **Body Text:** Regular (400) or Medium (500), comfortable line height (1.5).

## 4. Layout & Spacing
- **Border Radius:** `12px` for cards and large panels, `6px` for buttons and inputs. Keeps the UI looking sharp but not aggressive.
- **Shadows:** Use dramatic, diffused shadows. Buttons should have an inner glow or colored drop shadow (e.g. `0 4px 14px rgba(99, 102, 241, 0.39)`).
- **Forms:** Inputs should be slightly darker than the surface background, with an inner shadow and a clean border focus ring.

## 5. Core Components & Interactions

### A. Buttons
- **Primary:** Solid background, high contrast text, slight colored shadow. On hover: translate Y by `-1px` and slightly darken the background.
- **Secondary:** Transparent background with border. On hover: border brightens, background slightly fills.
- **Disabled State:** 50% opacity, `cursor-not-allowed`.

### B. Inputs & Forms
- Inputs have a solid but slightly transparent background. Focus triggers a colored ring (`box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15)`).
- Labels are small, uppercase or title case, heavily muted.

### C. The Video Uploader (Hero Component)
- **Drag & Drop Zone:** A large, dashed-border area in the center of the dashboard. 
- **Feedback:** When dragging a file over, the border should turn solid Indigo and the background should slightly tint Indigo.

### D. Animations & Transitions
- **Micro-interactions:** 200ms `ease` transitions on borders, background colors, and transforms.
- **Page Transitions:** Gentle fade-in for new pages and modals.

## 6. Accessibility (a11y)
- **Contrast:** Ensure all text passes WCAG AA contrast ratios against backgrounds.
- **Focus States:** Every interactive element must have a clear visible focus ring for keyboard navigation.
