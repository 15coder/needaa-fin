# نداء الرحمن محمد عبود — Personal Portfolio Site

A static personal profile/portfolio website for Nidaa Alrahman Muhammad Aboud, a software developer and digital forensics / cybersecurity specialist from Syria.

## Stack

- Pure static site: single `index.html` with bundled CSS and JS (`assets/`)
- Arabic RTL layout
- Custom fonts: Daken-Black, Qomra-Regular (`fonts/`)
- No build step, no package manager, no backend

## Running

```bash
python3 -m http.server 5000
```

The "Start application" workflow runs this automatically. The site is served at port 5000.

## Project structure

```
index.html        # Main (and only) page
assets/           # Bundled CSS + JS (production build artifacts)
fonts/            # Custom Arabic web fonts
images/           # Logo, favicon, Open Graph image, etc.
logo.webp         # Profile logo
manifest.json     # PWA manifest
sitemap.xml       # SEO sitemap
robots.txt        # Search engine directives
```

## User preferences

- Keep existing structure and stack — do not migrate or restructure.
