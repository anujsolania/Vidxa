# Vidxa - UI/UX Design Guidelines

## 1. Design Philosophy
Vidxa aims to provide a **simple, professional, and highly focused** user experience for video uploading and processing. The interface should feel snappy, modern, and uncluttered. 

We will adhere to a **minimalist "Glassmorphism" & "Dark Mode first"** aesthetic, which gives a premium feel to media-heavy applications.

## 2. Color Palette
- **Primary (Accent):** `#6366f1` (Indigo 500) - Used for primary actions, buttons, and active states.
- **Background:** `#0f172a` (Slate 900) - Deep dark background to make video thumbnails pop.
- **Surface/Card:** `#1e293b` (Slate 800) - Slightly lighter than the background for cards and modals.
- **Text (Primary):** `#f8fafc` (Slate 50) - For main headings and primary readable text.
- **Text (Secondary):** `#94a3b8` (Slate 400) - For subtitles, placeholders, and less important information.
- **Success:** `#22c55e` (Green 500) - Upload success, processing complete.
- **Error:** `#ef4444` (Red 500) - Upload failed, validation errors.

## 3. Typography
- **Font Family:** `Inter`, sans-serif. It is highly legible and provides a clean, modern look.
- **Headings:** Bold (700), tightly tracked. 
- **Body Text:** Regular (400) or Medium (500), comfortable line height (1.5).

## 4. Layout & Spacing
- **Grid System:** Standard 12-column grid with a maximum container width of `1200px` for the main dashboard.
- **Spacing Scale:** Based on a 4px/8px grid (e.g., 8px, 16px, 24px, 32px) to ensure consistent rhythm.
- **Border Radius:** `8px` (rounded-lg) for buttons and inputs, `12px` (rounded-xl) for cards and modals to keep it friendly but professional.

## 5. Core Components & Interactions

### A. Buttons
- **Primary:** Indigo background, white text, slight shadow. On hover: slightly lighter indigo, scale up by `1.02`.
- **Secondary:** Transparent background with Slate 700 border. On hover: Slate 800 background.
- **Disabled State:** 50% opacity, `cursor-not-allowed`.

### B. Inputs & Forms
- Inputs should have a Slate 800 background with no border by default, adding a primary color ring on focus (`focus:ring-2 focus:ring-indigo-500`).
- Use clear, short labels above inputs.

### C. The Video Uploader (Hero Component)
- **Drag & Drop Zone:** A large, dashed-border area in the center of the dashboard. 
- **Feedback:** When dragging a file over, the border should turn solid Indigo and the background should slightly tint Indigo.
- **Progress:** Show a sleek, thin progress bar attached to the file item during upload.

### D. Animations & Transitions
- **Micro-interactions:** 150ms ease-in-out transitions on buttons, links, and hover states.
- **Page Transitions:** Gentle fade-in (opacity 0 to 1 over 300ms) for new pages and modals.
- **Loading States:** Use subtle pulse animations (skeleton loaders) rather than blocking spinners where possible.

## 6. Accessibility (a11y)
- **Contrast:** Ensure all text passes WCAG AA contrast ratios against the dark backgrounds.
- **Focus States:** Every interactive element must have a clear visible focus ring for keyboard navigation.
- **Feedback:** Always provide toast notifications for success/error states (e.g., "Video uploaded successfully").
