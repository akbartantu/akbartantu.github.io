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
index.html                         Page shell, metadata, and navigation
assets/css/                        Base, layout, and component styles
assets/data/                       Profile, career records, projects, evidence, and UI copy
assets/js/                         Language, rendering, and page behavior
assets/favicon.svg                 Site icon
assets/images/profile/             Profile photograph
assets/images/experience/          Approved work-experience evidence
assets/images/organizations/       Approved organization evidence
assets/images/volunteering/        Approved volunteering evidence
assets/images/projects/            Approved project evidence
assets/images/education/           Approved education evidence
assets/images/certifications/      Approved certification evidence
tests/check-content.mjs            Content and privacy checks
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

A company, degree, or role title that must stay official is a single string, not a translation object. The public employer name is **PT Telkom Indonesia**. It is stored once in `assets/data/experience.js` and is not translated. If a translation is missing, the page falls back to English.

Evidence titles, descriptions, contributions, supported claims, alt text, and dates use the same `{ en, id }` shape. `type` stays `image`, `pdf`, or `document`. `relatedRecordType` stays `experience`, `education`, `organization`, `volunteering`, `project`, or `certification`.

`home.headline` and `home.summary` are `profile.headline` and `profile.summary` in `assets/data/profile.js`, so the public wording has one source.

## How to update content

Edit the record in `assets/data/` and keep the same `id`. Add both `en` and `id` for any sentence. Do not change an official title or organization string unless the wording is confirmed.

Experience is listed from the most recent role. Project pages read `assets/data/projects.js`.

## Profile photograph

No profile photograph is published yet. Home and About show the monogram until a local file is configured. A missing file falls back to that monogram and does not leave a broken image.

1. Save a lowercase kebab-case file in `assets/images/profile/`, preferably WebP. JPG and PNG also work. Example: `profile-photo.webp`.
2. Set `photo.src` in `assets/data/profile.js` to that path, such as `assets/images/profile/profile-photo.webp`.
3. Write `photo.alt` in both English and Bahasa Indonesia.
4. Use a local file only. Do not point `photo.src` at an external avatar service.

## Evidence

Evidence is linked from the evidence record to an activity. The activity itself is not copied into the evidence record.

| Field | Purpose |
| --- | --- |
| `evidenceId` | Stable id, such as `EVD-001` |
| `relatedRecordType` | `experience`, `education`, `organization`, `volunteering`, `project`, or `certification` |
| `relatedRecordId` | Existing activity id, such as `PORT-001` or `EXP-002` |
| `publicationApproved` | Boolean `true` before the item can appear |

Create an activity folder only when that activity has an approved file. Example: `assets/images/projects/operational-dashboard/dashboard-overview.webp`.

File names are lowercase kebab-case. Avoid spaces, special characters, generic names such as `image1.jpg`, and extra version suffixes.

To add approved evidence:

1. Confirm the file contains nothing confidential and is approved for a public repository.
2. Put it in the matching folder under `assets/images/`.
3. Add one record to `CV.evidence` in `assets/data/evidence.js`:

```javascript
{
  evidenceId: "EVD-001",
  title: { en: "Dashboard overview", id: "Ikhtisar dashboard" },
  description: { en: "Public overview of the dashboard.", id: "Ikhtisar publik dashboard." },
  type: "image",
  date: { en: "2024", id: "2024" },
  filePath: "assets/images/projects/operational-dashboard/dashboard-overview.webp",
  thumbnailPath: "",
  relatedRecordType: "project",
  relatedRecordId: "PORT-001",
  contribution: { en: "Started the dashboard.", id: "Menginisiasi dashboard." },
  supportedClaim: { en: "An early dashboard was developed.", id: "Dashboard awal dikembangkan." },
  verificationStatus: "self-reported",
  publicationApproved: true,
  altText: { en: "Dashboard overview", id: "Ikhtisar dashboard" }
}
```

The page shows a thumbnail or file icon, the title, explanation, personal contribution, supported claim, date, and a view action. Images open in a detail view that keeps the aspect ratio and links to the original file. PDFs get an open action and are not embedded. Records without approved evidence show a short empty state.

`publicationApproved` must be the boolean `true`. `false` only keeps a record out of the page. It does not protect a file that was committed.

## GitHub Pages

The workflow in `.github/workflows/static.yml` deploys pushes to `main`. This feature branch is not deployed automatically.

To publish after review:

1. Merge the reviewed branch into `main`.
2. Confirm GitHub Pages still deploys the repository root.
3. Check https://akbartantu.github.io in a private window.

## Privacy and security

Everything in this repository is public, including files that the page does not link. `localStorage` only remembers the language choice. It is not a privacy boundary.

Do not commit credentials, customer information, private contact details, internal documents, network diagrams, operational screenshots, or assessment notes. Keep restricted material in approved private storage outside this repository. A public email address is omitted because none was supplied for publication. Hidden markup is not access control. Image and PDF paths must stay under `assets/images/` and use the naming rules above.

## Known limitations

- Language switching is done in the browser. Crawlers that do not run JavaScript receive the English shell, not a separate Indonesian URL. This is not full multilingual SEO.
- LinkedIn could not be read while this version was prepared. Facts come from the existing repository unless noted below.
- Spoken-language proficiency, Foodhub, and Mata Garuda Australia New Zealand are not in the repository and were not added.
- No professional certification or award is listed. The UNSW degree is shown as an academic degree, not as a professional license.
- No profile photograph or approved evidence file is published yet. The folders are ready for files that have been cleared for the public site.
- The in-browser editor from the previous page is not part of this public site. Edit the data files instead. The old page remains in git history.

## Disclaimer

This is a personal portfolio. It does not speak for employers, universities, or other organizations.
