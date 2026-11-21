# Imran Rafi — Personal Portfolio

A modern, lightweight, mobile-first personal portfolio built with plain HTML, CSS and JavaScript. Deployed to GitHub Pages with an official GitHub Actions workflow.

**Live site:** https://rmd734412-web.github.io/imran-rafi/

## What's inside

- Premium dark theme with blue accents and subtle animations
- Fully responsive layout with a working mobile navigation menu
- Sections: Hero, About, Interests, Skills, Electronics & Embedded, AI & Automation, Web Development, Project Showcase, Photo Gallery, Education, Contact
- Animated skill bars, project filters, gallery lightbox and back-to-top button
- SEO metadata, Open Graph / Twitter cards, favicon and accessibility features
- No frameworks, no build step, no external dependencies

## File structure

```
.
├── index.html                  # All page content and metadata
├── css/style.css               # Theme, layout, responsive rules, animations
├── js/main.js                  # Navigation, reveal effects, filters, lightbox
├── assets/
│   ├── favicon.svg / .png      # Site icon
│   ├── og-image.svg / .png     # Social media preview image
│   ├── profile.svg             # Profile photo placeholder
│   ├── gallery-1..6.svg        # Gallery placeholders
│   └── project-1..3.svg        # Project thumbnails
└── .github/workflows/deploy.yml # GitHub Pages deployment
```

## Customise it (no coding needed)

All placeholder content is clearly marked in `index.html`. You can safely replace these files:

1. **Profile photo** — replace `assets/profile.svg` with your own image. Easiest option: save your photo as `profile.jpg`, then change `assets/profile.svg` to `assets/profile.jpg` in `index.html` (there is one reference).
2. **Gallery photos** — replace `assets/gallery-1.svg` … `gallery-6.svg` with your own images. If you use `.jpg` files, update the matching `src` paths in the gallery section of `index.html`. The captions are in `data-caption` attributes.
3. **Project thumbnails** — replace `assets/project-1.svg` … `project-3.svg` and edit the project titles/descriptions in the Project Showcase section.
4. **Email address** — search `index.html` for `your.email@example.com` and replace it with your real email (appears in the hero, contact section and social links).
5. **Social links** — search `index.html` for `your-profile`, `your-channel` and `your-handle` and replace those URLs with your real profiles. Your GitHub URL is already set.
6. **Education** — update the three timeline entries in the Education section with your real school, qualification and years.
7. **Skills & interests** — edit the text and the `data-level` values (0–100) in the Skills section.

After making changes, commit and push to `main`. GitHub Actions will redeploy the site automatically.

## Local preview

Just open `index.html` in a browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deployment

The `.github/workflows/deploy.yml` workflow deploys to GitHub Pages whenever you push to `main`. It uses only official GitHub Actions (`checkout`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`) and requires **Settings → Pages → Build and deployment → Source: GitHub Actions**.
