# 🏛️ SarkariNaukriHubs.com – Complete Deployment Guide

## What This Website Does
- Aggregates live job notifications from **38 official government portals**
- Sources: Employment News RSS, FreeJobAlert, SarkariResult, NCS Portal
- Auto-refreshes every hour via Vercel's cache
- Google AdSense ready for revenue
- Fully SEO-optimized for "Sarkari Naukri" search terms

---

## STEP 1 – Set Up Your Code (GitHub)

1. Go to [github.com](https://github.com) → Sign up / Log in
2. Click **New Repository** → Name it `sarkarinaukrihubs` → Public → Create
3. Upload all these project files to the repository:
   - Drag and drop the entire project folder contents into GitHub

---

## STEP 2 – Deploy to Vercel (Free Hosting)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **New Project** → Import your `sarkarinaukrihubs` repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** → Wait ~2 minutes

Your site will be live at: `https://sarkarinaukrihubs.vercel.app`

---

## STEP 3 – Connect Your Domain (sarkarinaukrihubs.com)

### In Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add: `sarkarinaukrihubs.com` and `www.sarkarinaukrihubs.com`
3. Vercel will show you DNS records to add

### At Your Domain Registrar (GoDaddy/Namecheap/BigRock):
Add these DNS records:

| Type  | Name | Value                   |
|-------|------|-------------------------|
| A     | @    | 76.76.21.21             |
| CNAME | www  | cname.vercel-dns.com    |

Wait 24–48 hours for DNS propagation.

---

## STEP 4 – Google AdSense Setup

### A. Apply for AdSense
1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign in with your Google account
3. Enter your website: `https://sarkarinaukrihubs.com`
4. Complete account details (PAN card required for India payments)

### B. Get Your Publisher ID
1. After approval → **Account** → **Account Information**
2. Copy your Publisher ID: looks like `ca-pub-1234567890123456`

### C. Add to Vercel Environment Variables
1. Vercel → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `ADSENSE_PUBLISHER_ID`
   - **Value:** `ca-pub-YOUR_ACTUAL_ID_HERE`
3. Redeploy the project

### D. Create Ad Units in AdSense
1. AdSense → **Ads** → **By ad unit** → **Display ads**
2. Create 3 ad units:
   - **"Top Banner"** → Horizontal → Copy slot ID → paste in `AdBanner.js` line with `banner:`
   - **"Rectangle"** → Rectangle → Copy slot ID → paste in `AdBanner.js` line with `rectangle:`
   - **"Sidebar"** → Vertical → Copy slot ID → paste in `AdBanner.js` line with `sidebar:`

### E. Add AdSense Verification File
AdSense will give you a file like `ads.txt` – add it to your `/public` folder.

---

## STEP 5 – Google Search Console (SEO)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → `sarkarinaukrihubs.com` → Verify via DNS TXT record
3. Submit sitemap: `https://sarkarinaukrihubs.com/sitemap.xml`

---

## STEP 6 – Google Analytics (Track Traffic)

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property for `sarkarinaukrihubs.com`
3. Get your Measurement ID: `G-XXXXXXXXXX`
4. Add to Vercel Environment Variables:
   - **Name:** `NEXT_PUBLIC_GA_ID`
   - **Value:** `G-XXXXXXXXXX`

---

## About Meta / Facebook Ads

> ⚠️ **Important Note:** Meta Audience Network is for **mobile apps only** (Android/iOS), not websites.
>
> For **website monetization**, your options are:
> - ✅ **Google AdSense** – Best for Indian government job sites (already integrated)
> - ✅ **Media.net** – Good alternative for Indian traffic (apply at media.net)
> - ✅ **Ezoic** – Requires 10,000 monthly visitors minimum
> - ✅ **PropellerAds** – Works without minimum traffic
>
> Once your site gets 10,000+ monthly visitors, apply to Ezoic for higher RPM.

---

## Revenue Expectations (Indian Gov Job Sites)

| Monthly Visitors | Estimated Monthly Revenue |
|-----------------|--------------------------|
| 10,000          | ₹500 – ₹1,500            |
| 50,000          | ₹2,500 – ₹7,500          |
| 1,00,000        | ₹5,000 – ₹20,000         |
| 5,00,000        | ₹25,000 – ₹1,00,000      |

*RPM for government job sites in India typically ₹50–₹200. Focus on SEO to grow traffic.*

---

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Open http://localhost:3000
```

---

## SEO Tips to Grow Traffic

1. **Target keywords:** "UPSC notification 2024", "SSC CGL apply online", "RRB NTPC vacancy"
2. **Post regularly** – Google loves fresh content
3. **Share on Telegram** – Government job Telegram channels have lakhs of members
4. **Create category pages** – `/category/upsc`, `/category/banking`
5. **Build backlinks** – Get listed on job aggregator directories

---

## Files Reference

```
sarkarinaukrihubs/
├── app/
│   ├── layout.js          ← AdSense + SEO metadata
│   ├── page.js            ← Homepage with job listings
│   ├── globals.css        ← All styling
│   ├── api/jobs/route.js  ← Job fetching API
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── AdBanner.js    ← ⭐ UPDATE slot IDs here after AdSense approval
│   ├── privacy/page.js    ← Required for AdSense
│   ├── disclaimer/page.js ← Required for AdSense
│   ├── sitemap.js         ← Auto-generated sitemap
│   └── robots.js          ← SEO robots.txt
├── lib/scrapers/
│   ├── index.js           ← Master scraper aggregator
│   ├── employment-news.js ← Official RSS feed
│   ├── freejobalert.js    ← FreeJobAlert scraper
│   ├── sarkari-result.js  ← SarkariResult scraper
│   └── ncs.js             ← NCS Portal API
├── vercel.json            ← Vercel config + hourly cron
└── .env.example           ← Environment variables template
```
