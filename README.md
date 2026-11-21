# ইমরান রাফি — বাংলা-প্রথম পোর্টফলিও + অ্যাডমিন CMS

একটি প্রিমিয়াম, মোবাইল-ফার্স্ট ব্যক্তিগত পোর্টফলিও — **বাংলা ডিফল্ট**, ইংরেজি ঐচ্ছিক, এবং Supabase-চালিত অ্যাডমিন প্যানেল থেকে ফোন থেকেই সম্পূর্ণ কনটেন্ট ব্যবস্থাপনা।

**Live site:** https://rmd734412-web.github.io/imran-rafi/
**Admin panel:** https://rmd734412-web.github.io/imran-rafi/admin.html

> Supabase কনফিগার না থাকলেও সাইট **খালি হয় না** — সম্পূর্ণ ডেমো কনটেন্ট দেখা যায়। শুধু অ্যাডমিন লগ ইন বন্ধ থাকে।

---

## প্রধান বৈশিষ্ট্য

### পাবলিক সাইট
- **বাংলা ডিফল্ট**, ওয়ান-ক্লিকে English — পুনরায় লোড ছাড়াই সব টেক্সট বদলায়; পছন্দ `localStorage`-এ মনে থাকে।
- Noto Sans Bengali ফন্ট, ডার্ক নেভি থিম, ব্লু/সিয়ান accent, হালকা গ্রেডিয়েন্ট ও নিয়ন্ত্রিত অ্যানিমেশন।
- মোবাইল নেভিগেশন, প্রকল্প ফিল্টার, গ্যালারি লাইটবক্স (কীবোর্ড সহ), স্কিল বার, back-to-top, reveal ইফেক্ট।
- সব সেকশন CMS-চালিত: হিরো, পরিচয়, আগ্রহ, দক্ষতা, ইলেকট্রনিক্স/এআই/ওয়েব, প্রকল্প, গ্যালারি, শিক্ষা, যোগাযোগ, ফুটার।
- SEO: বাংলা/ইংরেজি meta, OG/Twitter card, canonical, favicon, `robots.txt`, `sitemap.xml`, সেম্যান্টিক HTML, alt text, skip link, ARIA লেবেল।

### অ্যাডমিন CMS (`admin.html`)
- Supabase **email/password Auth**, সুরক্ষিত সেশন, লগ আউট, অননুমোদিত ব্যবহারকারী ব্লক।
- প্রোফাইল ও সাইট সেটিংস; প্রকল্প, গ্যালারি, দক্ষতা, শিক্ষা, আগ্রহ, সোশ্যাল লিংক — সবের CRUD।
- ফোন থেকে ছবি আপলোড (প্রোগ্রেস সহ), বাংলা/ইংরেজি দুই ভাষায় টেক্সট, **publish/unpublish**, featured, ↑↓ দিয়ে reorder, search/filter, মুছতে নিশ্চিতকরণ, টোস্ট/লোডিং/খালি-অবস্থা।
- বাংলা ও ইংরেজি **প্রিভিউ** (লুকানো কনটেন্টসহ), **JSON ব্যাকআপ/পুনরুদ্ধার**।

### নিরাপত্তা
- শুধু **anon / publishable key** ফ্রন্টএন্ডে; service-role key কোথাও নেই।
- Supabase **RLS**: সাধারণ দর্শক শুধু প্রকাশিত কনটেন্ট পড়তে পারেন; লেখার অনুমতি শুধু allowlist-এ থাকা অ্যাডমিনের।
- কনফিগারেশন GitHub Secrets থেকে ডিপ্লয়ের সময় তৈরি হয় → রিপোজিটরিতে কোনো ক্রেডেনশিয়াল কমিট হয় না।

---

## ফাইল গঠন

```
.
├── index.html                  # পাবলিক সাইট (i18n hooks + dynamic containers)
├── admin.html                  # অ্যাডমিন CMS entrance
├── css/
│   ├── style.css               # পাবলিক থিম + বাংলা টাইপোগ্রাফি
│   └── admin.css               # অ্যাডমিন UI (মোবাইল-ফার্স্ট)
├── js/
│   ├── config.js               # খালি; Actions থেকে তৈরি (কমিট করবেন না)
│   ├── config.example.js       # স্থানীয় টেস্টিংয়ের নমুনা
│   ├── supabase.js             # REST + Auth + Storage ক্লায়েন্ট (SDK নেই)
│   ├── i18n.js                 # ভাষা ও অনুবাদ
│   ├── data.js                 # ডেমো কনটেন্ট + লাইভ লোডার
│   ├── main.js                 # পাবলিক সাইট রেন্ডার ও ইন্টারঅ্যাকশন
│   └── admin.js                # CMS লজিক
├── translations/
│   ├── bn.js                   # বাংলা strings (ডিফল্ট)
│   └── en.js                   # English strings
├── supabase/schema.sql         # টেবিল, RLS, storage, seed data
├── SUPABASE_SETUP.md           # সহজ বাংলা সেটআপ গাইড
├── robots.txt / sitemap.xml
├── assets/                     # favicon, OG, profile, gallery, project images
└── .github/workflows/deploy.yml # Pages deploy + Secret config generation
```

---

## দ্রুত শুরু

### ১. কোনো সেটআপ ছাড়াই দেখুন
```bash
python -m http.server 8000
# http://localhost:8000
```
Supabase না থাকলে ডেমো কনটেন্ট দেখা যাবে, ভাষা বদল কাজ করবে, ফিল্টার/লাইটবক্স কাজ করবে।

### ২. CMS চালু করুন
[SUPABASE_SETUP.md](SUPABASE_SETUP.md) তে ধাপে ধাপে নির্দেশনা আছে। সংক্ষেপে:
1. Supabase প্রজেক্ট বানান → `supabase/schema.sql` Run করুন।
2. Auth-এ একজন ইউজার বানান → ইমেইল `admin_allowlist`-এ যোগ করুন।
3. GitHub Secrets-এ `SUPABASE_URL`, `SUPABASE_ANON_KEY` (ও ঐচ্ছিক `SUPABASE_MEDIA_BUCKET`) দিন।
4. Actions workflow আবার run করুন → `admin.html`-এ লগ ইন করুন।

### ৩. কনটেন্ট এডিট করুন
অ্যাডমিন প্যানেলে গিয়ে যেকোনো সেকশন বেছে নিন। পরিবর্তন সাথে সাথে Supabase-এ সেভ হয়; পাবলিক সাইটে দেখতে **প্রকাশিত** অবস্থা নিশ্চিত করুন। ব্রাউজারে হার্ড রিফ্রেশ (`Ctrl+Shift+R`) দিতে পারেন।

---

## কাস্টমাইজেশন

- **ভাষা যোগ/বদল:** `translations/bn.js` ও `translations/en.js` ফাইলে স্ট্রিং আছে। নতুন কী যোগ করলে `js/i18n.js` স্বয়ংক্রিয়ভাবে নেবে।
- **ডেমো কনটেন্ট বদল:** `js/data.js`-এর `FALLBACK` অবজেক্টে আছে — Supabase না থাকলে এটি দেখা যায়।
- **থিম:** `css/style.css`-এ `--accent`, `--bg`, `--surface` ভ্যারিয়েবল; অ্যাডমিনের `css/admin.css`-এ আলাদা ভ্যারিয়েবল।
- **SEO ছবি:** `assets/og-image.png` (১২০০×৬৩০)।

---

## ডেপ্লয়মেন্ট

`.github/workflows/deploy.yml` প্রতি `main` push-এ GitHub Pages-এ ডেপ্লয় করে। এটি:
1. অফিশিয়াল Actions ব্যবহার করে (`checkout`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`)।
2. Secrets থেকে `js/config.js` তৈরি করে (রিপোজিটির ফাইল অপরিবর্তিত থাকে)।
3. `.nojekyll` রাখে, যাতে আন্ডারস্কোর/ডটফোল্ডার নিয়ে Pages সমস্যা না হয়।

Pages source অবশ্যই **Settings → Pages → Build and deployment → Source: GitHub Actions** হতে হবে।

---

## যাচাই (Validation)

কমিট করার আগে নিচেরগুলো চালানো যায়:

```bash
tidy -qe index.html admin.html
python -m http.server 8000     # ম্যানুয়াল চেক: ভাষা, ফিল্টার, গ্যালারি, মোবাইল মেনু
git diff --check
```

Supabase-সংক্রান্ত CRUD/Auth/RLS/Upload **লাইভ ক্রেডেনশিয়াল ছাড়া সম্পূর্ণ যাচাই করা যায় না** — সেটি সেটআপের পর অ্যাডমিন প্যানেলে করে দেখুন।

---

## English summary

Bengali-first bilingual portfolio with a Supabase-backed admin CMS. Plain HTML/CSS/JS, no build step, GitHub Pages compatible. Bengali is the default language; English is one click away and remembered locally. Content is managed at `admin.html` using Supabase Auth, REST and Storage with strict RLS. Without Supabase configured, the site falls back to complete demo content and never renders blank. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for setup.
