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
  "assets/data/skills.js",
  "assets/data/projects.js",
  "assets/js/i18n.js",
  "assets/js/format.js"
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
for (const file of ["assets/js/render.js", "assets/js/projects.js", "assets/js/app.js"]) {
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

for (const item of CV.experience) {
  if (item.organization !== "National Telecommunications Company") {
    fail(`Employer label changed on ${item.id}: ${item.organization}`);
  }
  if (typeof item.organization !== "string" || typeof item.title !== "string") fail(`Translated official field on ${item.id}`);
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
if (html.includes("Telkom Indonesia")) fail("Telkom Indonesia was introduced into the public page");
if (publicText.includes("photoData") || publicText.includes("KB Mapping")) fail("Private editor data is still in the public site");

CV._lang = "en";
if (CV.esc(`<img alt="x">`) !== "&lt;img alt=&quot;x&quot;&gt;") fail("HTML escaping failed");
if (CV.safeLink("javascript:alert(1)")) fail("Unsafe link was accepted");
if (CV.safeLink("https://example.com") !== "") fail("Unapproved host was accepted");
if (!CV.safeLink("https://www.linkedin.com/in/akbartantu/")) fail("LinkedIn link was rejected");
if (!CV.safeLink("https://github.com/akbartantu")) fail("GitHub link was rejected");

CV.evidence.push({ id: "TEMP", projectId: "PORT-001", approved: false, title: { en: "Hidden", id: "Tersembunyi" } });
if (CV.visibleEvidence("PORT-001").length !== 0) fail("Unapproved evidence was visible");
CV.evidence.pop();

CV._lang = "id";
if (!CV.tx(CV.profile.headline).includes("Keamanan Siber")) fail("Indonesian headline did not apply");
if (CV.experience[0].organization !== "National Telecommunications Company") fail("Organization name changed with language");
CV._lang = "en";
if (CV.i18n.t("nav.home") !== "Home") fail("English UI fallback failed");
CV._lang = "id";
if (CV.i18n.t("nav.home") !== "Beranda") fail("Indonesian navigation failed");

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Content checks passed (${enKeys.length} UI keys, ${CV.projects.length} projects, ${CV.experience.length} roles).`);
