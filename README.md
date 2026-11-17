# Digital CV & Career Portfolio

Public digital CV for Muhammad Akbar Tantu. The site presents work experience, education, skills, community involvement, and project case studies in English and Bahasa Indonesia.

**Website:** https://akbartantu.github.io

## Languages

- English (`en`) is the default.
- Bahasa Indonesia (`id`) is available from the **EN | ID** control in the header.
- The choice is saved in `localStorage` under `portfolio-language`.
- A shared link can set the language with `?lang=en` or `?lang=id`.
- Official names stay as written. Company, university, program, and product names are not translated. Official role and degree titles are not rewritten.

## Technology

- HTML
- CSS
- Vanilla JavaScript
- GitHub Pages

There is no backend, database, or translation API. The site is a static GitHub Pages project.

## Folder structure

```text
index.html                  Page shell, metadata, and navigation
assets/css/                 Base, layout, and component styles
assets/data/                Profile, career records, projects, and UI copy
assets/js/                  Language, rendering, and page behavior
assets/favicon.svg          Site icon
assets/evidence/            Approved public evidence files only
tests/check-content.mjs     Content and privacy checks
```

`assets/css/style.css` and `assets/js/theme.js` from the earlier template are not used. The live page is `index.html`.

## Local development

1. Clone the repository.
2. From the repository root, start a static server:

```bash
python -m http.server 8080
```

3. Open `http://localhost:8080`.
4. Run the content checks:

```bash
node tests/check-content.mjs
```

## How translations work

Interface labels live in `assets/data/ui.js` as `en` and `id` dictionaries.

Career text lives beside the record it describes:

```javascript
summary: {
  en: "...",
  id: "..."
}
```

A company, degree, or role title that must stay official is a single string, not a translation object. If a translation is missing, the page falls back to English.

`home.headline` and `home.summary` are `profile.headline` and `profile.summary` in `assets/data/profile.js`, so the public wording has one source.

## How to update content

Edit the record in `assets/data/` and keep the same `id`. Add both `en` and `id` for any sentence. Do not change an official title or organization string unless the wording is confirmed.

Experience is listed from the most recent role. Project pages read `assets/data/projects.js`.

## Photographs and evidence

No profile photograph is published. The monogram is a placeholder.

To add evidence:

1. Put only an approved file in `assets/evidence/`. Use a simple file name such as `dashboard-note.png`.
2. Add a record to `CV.evidence` in `assets/data/activities.js`:

```javascript
{
  id: "EVD-001",
  projectId: "PORT-001",
  approved: true,
  title: { en: "...", id: "..." },
  type: { en: "Note", id: "Catatan" },
  date: { en: "2025", id: "2025" },
  description: { en: "...", id: "..." },
  demonstrates: { en: "...", id: "..." },
  image: "assets/evidence/dashboard-note.png"
}
```

Records with `approved: false` are not shown. Do not commit internal documents, customer information, network diagrams, or unapproved screenshots.

## GitHub Pages

The workflow in `.github/workflows/static.yml` deploys pushes to `main`. This feature branch is not deployed automatically.

To publish after review:

1. Merge the reviewed branch into `main`.
2. Confirm GitHub Pages still deploys the repository root.
3. Check https://akbartantu.github.io in a private window.

## Privacy and security

Everything in this repository is public. `localStorage` only remembers the language choice. It is not a privacy boundary.

Do not commit credentials, private contact details, internal files, or assessment notes. A public email address is omitted because none was supplied for publication. Hidden markup is not access control.

## Known limitations

- Language switching is done in the browser. Crawlers that do not run JavaScript receive the English shell, not a separate Indonesian URL. This is not full multilingual SEO.
- LinkedIn could not be read while this version was prepared. Facts come from the existing repository unless noted below.
- The public employer label remains **National Telecommunications Company**, as already published. Examples in the update brief used "Telkom Indonesia", and the GitHub profile company field says "UNSW". Those were not substituted.
- Spoken-language proficiency, Foodhub, and Mata Garuda Australia New Zealand are not in the repository and were not added.
- No professional certification or award is listed. The UNSW degree is shown as an academic degree, not as a professional license.
- No approved project evidence files are published yet.
- The in-browser editor from the previous page is not part of this public site. Edit the data files instead. The old page remains in git history.

## Disclaimer

This is a personal portfolio. It does not speak for employers, universities, or other organizations.
