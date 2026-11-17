import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const context = { URL, URLSearchParams };
context.window = context;
vm.createContext(context);

const scripts = [
  "assets/data/ui.js",
  "assets/data/profile.js",
  "assets/data/experience.js",
  "assets/data/education.js",
  "assets/data/activities.js",
  "assets/data/evidence.js",
  "assets/data/skills.js",
  "assets/data/projects.js",
  "assets/js/i18n.js",
  "assets/js/format.js",
  "assets/js/icons.js",
  "assets/js/evidence.js",
  "assets/js/render.js"
];

for (const file of scripts) {
  try {
    vm.runInContext(read(file), context, { filename: file });
  } catch (error) {
    fail(`${file} failed to load: ${error.message}`);
  }
}

const CV = context.CV;
const enKeys = Object.keys(CV.ui.en).sort();
const idKeys = Object.keys(CV.ui.id).sort();
if (enKeys.join("\n") !== idKeys.join("\n")) {
  const missingId = enKeys.filter((key) => !CV.ui.id[key]);
  const missingEn = idKeys.filter((key) => !CV.ui.en[key]);
  fail(`UI key mismatch. Missing id: ${missingId.join(", ")}. Missing en: ${missingEn.join(", ")}`);
}

for (const key of enKeys) {
  if (!String(CV.ui.en[key]).trim() || !String(CV.ui.id[key]).trim()) fail(`Empty UI string: ${key}`);
}

const html = read("index.html");
const usedKeys = new Set();
for (const match of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) usedKeys.add(match[1]);
for (const file of ["assets/js/render.js", "assets/js/projects.js", "assets/js/app.js", "assets/js/evidence.js"]) {
  for (const match of read(file).matchAll(/i18n\.t\("([^"]+)"\)/g)) usedKeys.add(match[1]);
}
for (const key of usedKeys) {
  if (!CV.ui.en[key] || !CV.ui.id[key]) fail(`Missing translation for used key ${key}`);
}

function years(value) {
  return (String(value).match(/\d{4}/g) || []).join(",");
}

function walk(node, trail) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walk(item, `${trail}[${index}]`));
    return;
  }
  if (!node || typeof node !== "object") return;
  if (Object.prototype.hasOwnProperty.call(node, "en")) {
    if (typeof node.en !== "string" || !node.en.trim()) fail(`Missing English at ${trail}`);
    if (typeof node.id !== "string" || !node.id.trim()) fail(`Missing Indonesian at ${trail}`);
    if (years(node.en) !== years(node.id)) fail(`Year mismatch at ${trail}: ${years(node.en)} != ${years(node.id)}`);
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "en" || key === "id") continue;
    walk(value, `${trail}.${key}`);
  }
}

walk(CV.profile, "profile");
walk(CV.experience, "experience");
walk(CV.education, "education");
walk(CV.organizations, "organizations");
walk(CV.volunteering, "volunteering");
walk(CV.skills, "skills");
walk(CV.projects, "projects");
walk(CV.credentials, "credentials");

const titles = CV.experience.map((item) => item.title);
const expectedTitles = [
  "Expert Cybersecurity — Enterprise & Business Service",
  "Network Operations Specialist / NTE Management",
  "Infrastructure Operation Performance — Officer 2",
  "Performance — Officer 3"
];
if (titles.join("|") !== expectedTitles.join("|")) fail(`Experience titles changed: ${titles.join(" | ")}`);

const periodEn = ["2026–present", "Sep 2021–Nov 2024", "2019–2021", "2015–2018"];
const periodId = ["2026–sekarang", "Sep 2021–Nov 2024", "2019–2021", "2015–2018"];
for (const item of CV.experience) {
  if (item.organization !== "PT Telkom Indonesia") {
    fail(`Employer label changed on ${item.id}: ${item.organization}`);
  }
  if (typeof item.organization !== "string" || typeof item.title !== "string") fail(`Translated official field on ${item.id}`);
  const index = CV.experience.indexOf(item);
  if (item.period.en !== periodEn[index] || item.period.id !== periodId[index]) {
    fail(`Employment dates changed on ${item.id}`);
  }
}
if ((read("assets/data/experience.js").match(/PT Telkom Indonesia/g) || []).length !== 1) {
  fail("Employer name must be stored once");
}

if (CV.education[0].organization !== "UNSW Sydney") fail("UNSW Sydney label changed");
if (CV.education[1].organization !== "Telkom University") fail("Telkom University label changed");
if (CV.education[0].title !== "Master of Commerce — Business Analytics & Cyber Security") fail("Master title changed");
if (CV.projects.length !== 8) fail(`Expected 8 projects, found ${CV.projects.length}`);
if (CV.volunteering.length !== 7) fail(`Expected 7 volunteering records, found ${CV.volunteering.length}`);
if (CV.skills.length !== 7) fail(`Expected 7 skill groups, found ${CV.skills.length}`);
if (CV.evidence.length !== 0) fail("Public evidence must stay empty until an approved item is added");
if (CV.recognitions.length !== 0) fail("Recognitions were empty in the source and must stay empty");

const projectTitles = [
  "Digital Operations Dashboard Innovation",
  "Bangkit Academy — Soft Skills & Capstone",
  "UNSW — Let's CommUNIcate Facilitator",
  "UNSW — Language Exchange Facilitator",
  "UNSW — Cultural Mentor",
  "SXSW Sydney — Event Volunteering",
  "Vivid Sydney — Event Volunteering",
  "GoTo Impact Foundation — Career Readiness"
];
if (CV.projects.map((item) => item.title).join("|") !== projectTitles.join("|")) fail("Project titles changed");

for (const group of CV.skills) {
  if ("level" in group || "percent" in group || "rating" in group) fail(`Proficiency field on ${group.id}`);
}

const publicText = scripts.map(read).join("\n") + "\n" + html;
if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicText)) fail("An email address is present");
if (/password|api[_-]?key|secret|BEGIN [A-Z ]*PRIVATE/i.test(publicText)) fail("Secret-like text is present");
if (!html.includes('"name": "PT Telkom Indonesia"')) fail("Structured employer name missing");
if ((publicText + "\n" + read("README.md")).includes("National Telecommunications Company")) fail("Old employer label remains");
if (publicText.includes("photoData") || publicText.includes("KB Mapping")) fail("Private editor data is still in the public site");

CV._lang = "en";
if (CV.esc(`<img alt="x">`) !== "&lt;img alt=&quot;x&quot;&gt;") fail("HTML escaping failed");
if (CV.safeLink("javascript:alert(1)")) fail("Unsafe link was accepted");
if (CV.safeLink("https://example.com") !== "") fail("Unapproved host was accepted");
if (!CV.safeLink("https://www.linkedin.com/in/akbartantu/")) fail("LinkedIn link was rejected");
if (!CV.safeLink("https://github.com/akbartantu")) fail("GitHub link was rejected");

if (CV.profile.photo.src !== "" && !CV.safeProfilePhoto(CV.profile.photo.src)) fail("Profile photo path is not a local image");
if (CV.profile.photo.src && !fs.existsSync(path.join(root, CV.profile.photo.src))) fail("Configured profile photo is missing");
if (CV.safeProfilePhoto("https://example.com/a.webp")) fail("Remote profile photo was accepted");
if (CV.safeProfilePhoto("assets/images/profile/../experience/note.webp")) fail("Profile path traversal was accepted");
if (CV.safeImage("assets/images/profile/profile-photo.webp") !== "assets/images/profile/profile-photo.webp") fail("WebP profile path was rejected");
if (CV.safeImage("assets/images/profile/profile-photo.jpg") !== "assets/images/profile/profile-photo.jpg") fail("JPG profile path was rejected");
if (CV.safeImage("assets/images/profile/profile-photo.png") !== "assets/images/profile/profile-photo.png") fail("PNG profile path was rejected");
if (CV.safeAsset("assets/images/projects/operational-dashboard/dashboard-overview.webp") !== "assets/images/projects/operational-dashboard/dashboard-overview.webp") fail("Nested evidence image was rejected");
if (CV.safeAsset("assets/images/certifications/degree-note.pdf") !== "assets/images/certifications/degree-note.pdf") fail("PDF evidence path was rejected");
if (CV.safeAsset("assets/evidence/note.png") || CV.safeAsset("assets/images/profile/my photo.webp")) fail("Unsafe evidence path was accepted");
if (CV.safeProfilePhoto("assets/images/projects/note.webp")) fail("Project image was accepted as a profile photo");

const imageDirs = ["profile", "experience", "organizations", "volunteering", "projects", "education", "certifications"];
function listFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}
const approvedFiles = new Set();
if (CV.profile.photo.src) approvedFiles.add(CV.profile.photo.src);
for (const item of CV.evidence) {
  if (item.publicationApproved !== true) fail(`Unapproved evidence is stored in the repository: ${item.evidenceId || item.id || "unknown"}`);
  for (const key of ["filePath", "thumbnailPath"]) {
    if (item[key]) approvedFiles.add(String(item[key]).replace(/\\/g, "/"));
  }
}
for (const dir of imageDirs) {
  if (!fs.existsSync(path.join(root, "assets", "images", dir, ".gitkeep"))) fail(`Missing image directory: ${dir}`);
}
for (const file of listFiles(path.join(root, "assets", "images"))) {
  const posix = path.relative(root, file).split(path.sep).join("/");
  if (posix.endsWith("/.gitkeep")) continue;
  if (!approvedFiles.has(posix)) fail(`Unapproved public image file: ${posix}`);
}

const fixedOrganizations = [
  [CV.education[0], "UNSW Sydney"],
  [CV.education[1], "Telkom University"],
  [CV.organizations[0], "UNSW Student Programs"],
  [CV.volunteering[0], "Bangkit Academy"],
  [CV.volunteering[1], "UNSW Sydney"],
  [CV.volunteering[4], "SXSW Sydney"],
  [CV.volunteering[5], "Vivid Sydney"],
  [CV.volunteering[6], "GoTo Impact Foundation — Generasi GIGIH 3.0"]
];
for (const [record, name] of fixedOrganizations) {
  if (!record || record.organization !== name) fail(`Organization label changed: ${name}`);
}
if (CV.credentials[0].issuer !== "UNSW Sydney") fail("Credential issuer changed");

CV._lang = "en";
const englishRole = CV.render.expandable(CV.experience[0], "experience");
if (!englishRole.includes("PT Telkom Indonesia")) fail("English experience view omitted the employer");
if (!englishRole.includes("Expert Cybersecurity")) fail("English job title changed");
CV._lang = "id";
const indonesianRole = CV.render.expandable(CV.experience[0], "experience");
if (!indonesianRole.includes("PT Telkom Indonesia")) fail("Indonesian experience view omitted the employer");
if (!indonesianRole.includes("Expert Cybersecurity")) fail("Indonesian job title changed");
if (!CV.tx(CV.profile.headline).includes("Keamanan Siber")) fail("Indonesian headline did not apply");
if (CV.experience[0].organization !== "PT Telkom Indonesia") fail("Organization name changed with language");

const published = {
  evidenceId: "EVD-TEST",
  title: { en: "Overview <script>", id: "Ikhtisar <script>" },
  description: { en: "Public overview.", id: "Ikhtisar publik." },
  type: "image",
  date: { en: "2024", id: "2024" },
  filePath: "assets/images/projects/operational-dashboard/dashboard-overview.webp",
  thumbnailPath: "assets/images/projects/operational-dashboard/dashboard-overview.webp",
  relatedRecordType: "project",
  relatedRecordId: "PORT-001",
  contribution: { en: "Started the dashboard.", id: "Menginisiasi dashboard." },
  supportedClaim: { en: "An early dashboard existed.", id: "Dashboard awal ada." },
  verificationStatus: "self-reported",
  publicationApproved: true,
  altText: { en: "Dashboard overview", id: "Ikhtisar dashboard" }
};
CV.evidence.push(published);
CV.evidence.push({
  evidenceId: "EVD-HIDDEN",
  publicationApproved: false,
  relatedRecordType: "project",
  relatedRecordId: "PORT-001",
  title: { en: "Hidden", id: "Tersembunyi" }
});
CV.evidence.push({
  evidenceId: "EVD-OTHER",
  publicationApproved: true,
  relatedRecordType: "experience",
  relatedRecordId: "EXP-001",
  title: { en: "Role note", id: "Catatan peran" },
  description: { en: "A reporting note.", id: "Catatan pelaporan." },
  type: "pdf",
  filePath: "assets/images/experience/role-note.pdf",
  contribution: { en: "Wrote the note.", id: "Menulis catatan." },
  supportedClaim: { en: "The role included reporting.", id: "Peran mencakup pelaporan." },
  altText: { en: "Note", id: "Catatan" }
});
CV.evidence.push({ evidenceId: "EVD-OLD", projectId: "PORT-001", approved: true, title: { en: "Legacy", id: "Lama" } });
if (CV.visibleEvidence("PORT-001").map((item) => item.evidenceId).join() !== "EVD-TEST") fail("Project evidence was not limited to the approved linked record");
if (CV.evidenceFor("experience", "EXP-001").length !== 1) fail("Experience evidence link failed");
if (CV.evidenceFor("experience", "EXP-002").length !== 0) fail("Evidence was attached to the wrong role");
if (CV.findEvidence("EVD-HIDDEN")) fail("Unapproved evidence was visible");
const cards = CV.render.evidenceCards(CV.visibleEvidence("PORT-001"));
if (cards.includes("<script>") || !cards.includes("&lt;script&gt;")) fail("Evidence text was not escaped");
if (!cards.includes("Menginisiasi dashboard.") || cards.includes("Started the dashboard.")) fail("Indonesian evidence text was not used");
const dialog = CV.render.evidenceDialog("EVD-TEST");
if (!dialog || !dialog.includes("dashboard-overview.webp") || /<(?:iframe|object|embed)\b/i.test(dialog)) fail("Image evidence detail was not safe");
const pdfDialog = CV.render.evidenceDialog("EVD-OTHER");
if (!pdfDialog.includes("role-note.pdf") || pdfDialog.includes("<img")) fail("PDF evidence detail was not a file action");
CV.evidence.length = 0;
CV._lang = "en";
CV._lang = "en";
if (CV.i18n.t("nav.home") !== "Home") fail("English UI fallback failed");
CV._lang = "id";
if (CV.i18n.t("nav.home") !== "Beranda") fail("Indonesian navigation failed");

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Content checks passed (${enKeys.length} UI keys, ${CV.projects.length} projects, ${CV.experience.length} roles).`);
