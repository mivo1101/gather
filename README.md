# Gather

Interactive digital invitation platform - **Every guest is your +1**.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Urbanist** (Google Fonts)

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Brand tokens & global styles
│   ├── layout.tsx        # Root layout with Urbanist font
│   └── page.tsx          # Landing page composition
└── components/
    ├── ui/
    │   ├── Button.tsx    # Reusable button variants
    │   └── Logo.tsx      # Gather wordmark with + icon
    └── landing/
        ├── Navigation.tsx
        ├── Hero.tsx              # Hero + envelope preview
        ├── HowItWorks.tsx
        ├── InteractiveExperience.tsx
        ├── Features.tsx
        ├── TemplatePreview.tsx
        ├── FinalCTA.tsx
        └── Footer.tsx
```

## Brand Colours

| Name           | Hex       |
|----------------|-----------|
| Black          | `#000000` |
| White          | `#FFFFFF` |
| Grey           | `#8E8E93` |
| Soft Grey      | `#F6F6F6` |
| Signature Pink | `#FF60AA` |
| Sugar Milk     | `#FFF8F4` |
