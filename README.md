This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Setup

- Next.js (`docman`): copy `.env.local.example` to `.env.local` and set URLs.
- NestJS API (`doc-man-ws`): copy `.env.example` to `.env` and set `PORT` as needed.
- FastAPI convert (`doc-convert`): copy `.env.example` to `.env` to set `HOST`/`PORT`.

Example values:

```bash
# docman/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3500
NEXT_PUBLIC_CONVERT_API_URL=http://localhost:8001

# doc-man-ws/.env
PORT=3500

# doc-convert/.env
HOST=127.0.0.1
PORT=8001
```

## Run Locally

In separate terminals:

```bash
# Frontend
cd docman && pnpm dev

# NestJS API
cd doc-man-ws && pnpm start:dev

# FastAPI service
cd doc-convert && uvicorn app.main:app --host $HOST --port $PORT --reload
```

Alternatively, run `python app/main.py` in `doc-convert` to use `.env` directly.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
