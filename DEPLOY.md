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
- Share card image: `https://YOUR_DOMAIN/api/share-card-publish?t=...` should return a PNG
