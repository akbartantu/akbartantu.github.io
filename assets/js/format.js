(function () {
  const CV = (window.CV = window.CV || {});

  CV.esc = function (value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  };

  CV.text = function (value) {
    return CV.esc(CV.tx(value));
  };

  CV.safeLink = function (value) {
    if (typeof value !== "string") return "";
    let url;
    try {
      url = new URL(value);
    } catch (error) {
      return "";
    }
    if (url.protocol !== "https:") return "";
    const host = url.hostname.toLowerCase();
    const allowed = host === "linkedin.com" || host === "www.linkedin.com" || host === "github.com" || host === "www.github.com";
    return allowed ? url.href : "";
  };

  const IMAGE_CATEGORIES = "profile|experience|organizations|volunteering|projects|education|certifications";
  const KEBAB = "[a-z0-9]+(?:-[a-z0-9]+)*";
  const IMAGE_FILE = new RegExp("^assets/images/(?:" + IMAGE_CATEGORIES + ")/" + KEBAB + "(?:/" + KEBAB + ")?\\.(?:jpg|jpeg|png|webp)$");
  const PUBLIC_FILE = new RegExp("^assets/images/(?:" + IMAGE_CATEGORIES + ")/" + KEBAB + "(?:/" + KEBAB + ")?\\.(?:jpg|jpeg|png|webp|pdf)$");
  const PROFILE_FILE = new RegExp("^assets/images/profile/" + KEBAB + "\\.(?:jpg|jpeg|png|webp)$");

  function localPublicPath(value) {
    if (typeof value !== "string" || !value || value !== value.trim()) return "";
    if (/[\s\\?#]|%2e|%2f|%5c|\.\./i.test(value)) return "";
    if (value.charAt(0) === "/" || value.indexOf("://") !== -1) return "";
    return value;
  }

  CV.safeImage = function (value) {
    const assetPath = localPublicPath(value);
    return IMAGE_FILE.test(assetPath) ? assetPath : "";
  };

  CV.safeAsset = function (value) {
    const assetPath = localPublicPath(value);
    return PUBLIC_FILE.test(assetPath) ? assetPath : "";
  };

  CV.safeProfilePhoto = function (value) {
    const assetPath = localPublicPath(value);
    return PROFILE_FILE.test(assetPath) ? assetPath : "";
  };

  CV.isPublishedEvidence = function (item) {
    if (!item || item.publicationApproved !== true) return false;
    const id = item.evidenceId || item.id;
    return typeof id === "string" && /^[A-Za-z0-9-]+$/.test(id);
  };

  CV.findEvidence = function (evidenceId) {
    return (CV.evidence || []).find(function (item) {
      return CV.isPublishedEvidence(item) && (item.evidenceId === evidenceId || item.id === evidenceId);
    }) || null;
  };

  CV.evidenceFor = function (recordType, recordId) {
    if (!recordType || !recordId) return [];
    return (CV.evidence || []).filter(function (item) {
      if (!CV.isPublishedEvidence(item)) return false;
      if (item.relatedRecordType === recordType && item.relatedRecordId === recordId) return true;
      return recordType === "project" && !item.relatedRecordType && item.projectId === recordId;
    });
  };

  CV.evidenceForRecord = function (record, recordType) {
    if (!record) return [];
    return CV.evidenceFor(recordType, record.id);
  };

  CV.visibleEvidence = function (projectId) {
    return CV.evidenceFor("project", projectId);
  };

  CV.externalLink = function (url, label) {
    const safe = CV.safeLink(url);
    if (!safe) return "";
    const note = CV.esc(CV.i18n.t("common.newTab"));
    return '<a class="text-link" href="' + CV.esc(safe) + '" target="_blank" rel="noopener noreferrer me">' + CV.esc(label) + '<span class="visually-hidden"> (' + note + ")</span></a>";
  };

  CV.evidenceLabel = function (count) {
    if (count === 1) return CV.i18n.t("projects.evidenceOne");
    if (count > 1) return CV.i18n.t("projects.evidenceMany").replace("{n}", String(count));
    return CV.i18n.t("projects.evidenceNone");
  };

  CV.list = function (items) {
    if (!items || !items.length) return "";
    return "<ul>" + items.map(function (item) {
      return "<li>" + CV.text(item) + "</li>";
    }).join("") + "</ul>";
  };
})();
