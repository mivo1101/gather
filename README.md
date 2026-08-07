# Gather

Interactive digital invitation platform - **Every guest is your +1**.

Design invitations, personalise them per guest, send email invites, and collect RSVPs.

## Live app

**https://gather-invitation.vercel.app**

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for local development.

For production invite links and email, set `NEXT_PUBLIC_APP_URL` / `AUTH_URL` to the live app URL (see `.env.example`).

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Urbanist** (Google Fonts)
- **Supabase** (auth + data)
- **Resend** (invite email)
- **Vercel** (hosting)

## What’s included

- Landing page and branded app shell
- Invitation editor (canvas, templates, interactive widgets)
- Event hub: design, details, guests, email send
- Guest invite experience with personalised links and RSVP

## Project Structure

```
src/
├── app/                 # Routes (landing, auth, home, editor, invite)
├── components/
│   ├── app/             # Event hub, guests, email, previews
│   ├── editor/          # Invitation editor
│   ├── invitation/      # Guest-facing invite viewer
│   ├── landing/         # Marketing pages
│   └── ui/              # Shared UI (Button, Logo, Select)
└── lib/                 # Actions, data, email, auth helpers
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
