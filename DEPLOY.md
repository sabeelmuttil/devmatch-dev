# Deploy to Vercel

## 1. Push to GitHub

```bash
git push origin master
```

Repo: https://github.com/sabeelmuttil/devmatch-dev

## 2. Import on Vercel

1. Open [vercel.com/new](https://vercel.com/new)
2. Import **sabeelmuttil/devmatch-dev**
3. Framework: **Next.js** (auto-detected)
4. Build command: `npm run build` (default)
5. Output: default (Next.js)

## 3. Environment variables

In **Project → Settings → Environment Variables**, add:

| Name | Required | Notes |
|------|----------|--------|
| `DAILY_DEV_PAT` | Yes | [daily.dev API settings](https://app.daily.dev/settings/api) |
| `GEMINI_API_KEY` | Yes | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your live URL, e.g. `https://devmatch-dev.vercel.app` (no trailing slash) |
| `UPSTASH_REDIS_REST_URL` | Yes† | From **Upstash Redis** ([Vercel Storage](https://vercel.com/marketplace?category=storage&search=redis)) |
| `UPSTASH_REDIS_REST_TOKEN` | Yes† | Same integration |
| `BLOB_READ_WRITE_TOKEN` | Yes† | Alternative: **Vercel Blob** storage (only need one of Redis or Blob) |

†**Required in Production** for share links. Without storage, Share on X returns an error (no long URLs).

Optional: `GEMINI_MODEL` (e.g. `gemini-2.5-flash`)

Apply to **Production**, **Preview**, and **Development**.

## 4. Deploy

Click **Deploy**. After the first deploy, set `NEXT_PUBLIC_APP_URL` to the real production URL and **redeploy** so X share links use a public image URL (not `localhost`).

## 5. Custom domain (optional)

**Project → Settings → Domains** → add `dailydevmatch.dev` and follow DNS instructions.

## CLI deploy (optional)

```bash
npx vercel login
npx vercel link
npx vercel env add DAILY_DEV_PAT
npx vercel env add GEMINI_API_KEY
npx vercel env add NEXT_PUBLIC_APP_URL
npx vercel --prod
```

## Verify

- Open `/` and run a match
- Share page: `https://YOUR_DOMAIN/s/...` should show the full card
- PNG: `https://YOUR_DOMAIN/api/share-card-publish/...` should return an image
- X preview: `https://YOUR_DOMAIN/api/share-card-publish/...?social=1` should return 1200×630 PNG

**Short links:** After adding Redis or Blob storage, redeploy — URLs look like `https://devmatch-dev.vercel.app/s/a1b2c3d4e5` (~55 chars).
