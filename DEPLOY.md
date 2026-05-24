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
| `UPSTASH_REDIS_REST_URL` | Yes† | From **Upstash Redis** (Vercel Storage) |
| `UPSTASH_REDIS_REST_TOKEN` | Yes† | Same integration |
| `REDIS_URL` | Yes† | Alternative: TCP URL from Storage (`rediss://...`) — supported |
| `KV_REST_API_URL` | Yes† | If Vercel KV uses these names instead |
| `KV_REST_API_TOKEN` | Yes† | Pair with `KV_REST_API_URL` |
| `BLOB_READ_WRITE_TOKEN` | Yes† | Alternative: **Vercel Blob** (only need one storage option) |

†**Required on Vercel Production** for short `/s/abc123` links. Connect Storage → Production → redeploy.

**“Sensitive” in Vercel:** That only hides values in the dashboard. **Non-sensitive is fine** — serverless functions can still read them. What matters: variables are enabled for **Production** and you **redeploy** after adding storage.

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

## Only have `REDIS_URL`? (like your Vercel screenshot)

That is enough — the app uses `REDIS_URL` for short links. You do **not** need to add REST vars manually unless `REDIS_URL` fails.

1. Push latest code and **Redeploy** Production  
2. Check: `https://devmatch-dev.vercel.app/api/share-storage`  
   - Should show: `"configured": true`, `"redisUrl": true`  
3. Optional write test: `https://devmatch-dev.vercel.app/api/share-storage?test=1`  
   - Should show: `"writeTest": { "ok": true, "backend": "redis" }`

### Optional: add REST vars (faster on serverless)

1. Vercel → **Storage** (not Environment Variables) → click your Redis database  
2. Open the **`.env` / Quickstart** tab  
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into **Environment Variables** → Production  
4. Redeploy  

## SEO

Set `NEXT_PUBLIC_APP_URL` to your production domain (no trailing slash). This drives:

- Canonical URLs and Open Graph links
- `/robots.txt` and `/sitemap.xml`
- Dynamic titles for `/{username}` (from daily.dev profile)
- Default social preview image at `/opengraph-image`

Embed pages (`/embed/*`) are `noindex` to avoid duplicate content.

## Embeddable badge

After deploy, users can embed their Tech Identity:

- Live badge: `https://YOUR_DOMAIN/embed/USERNAME`
- Script: `<script src="https://YOUR_DOMAIN/embed.js" data-username="USERNAME" async></script>`
- Copy snippets from the results page (**Embed on your site**)
- **GitHub README** uses a PNG badge (`/api/readme-badge/USERNAME`) — iframes are blocked by GitHub

## Verify

- Open `/` and run a match
- Share page: `https://YOUR_DOMAIN/s/...` should show the full card
- PNG: `https://YOUR_DOMAIN/api/share-card-publish/...` should return an image
- X preview: `https://YOUR_DOMAIN/api/share-card-publish/...?social=1` should return 1200×630 PNG

**Short links:** After adding Redis or Blob storage, redeploy — URLs look like `https://devmatch-dev.vercel.app/s/a1b2c3d4e5` (~55 chars).
