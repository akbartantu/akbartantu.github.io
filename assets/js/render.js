(function () {
  const CV = (window.CV = window.CV || {});
  CV.render = CV.render || {};
  CV.openIds = CV.openIds || new Set();

  function section(id, titleKey, introKey, body) {
    return '<section class="section" id="' + id + '"><div class="shell"><div class="section-head"><h2>' + CV.esc(CV.i18n.t(titleKey)) + "</h2><p>" + CV.esc(CV.i18n.t(introKey)) + "</p></div>" + body + "</div></section>";
  }

  function related(ids) {
    const links = (ids || []).map(function (id) {
      const project = (CV.projects || []).find(function (item) { return item.id === id; });
      if (!project) return "";
      return '<a href="#case/' + CV.esc(id) + '">' + CV.esc(project.title) + "</a>";
    }).filter(Boolean);
    if (!links.length) return "";
    return '<p class="related"><span>' + CV.esc(CV.i18n.t("experience.related")) + "</span> " + links.join(", ") + "</p>";
  }

  CV.render.expandable = function (item) {
    const open = CV.openIds.has(item.id);
    const details = item.contributions || [];
    const extra = CV.list(details) + related(item.relatedProjects);
    const canOpen = Boolean(details.length || (item.relatedProjects || []).length);
    const button = canOpen
      ? '<button type="button" class="text-button" data-expand="' + CV.esc(item.id) + '" aria-expanded="' + (open ? "true" : "false") + '" aria-controls="panel-' + CV.esc(item.id) + '">' + CV.esc(CV.i18n.t(open ? "experience.hide" : "experience.show")) + "</button>"
      : "";
    const panel = canOpen
      ? '<div class="entry-panel" id="panel-' + CV.esc(item.id) + '"' + (open ? "" : " hidden") + ">" + (details.length ? "<h4>" + CV.esc(CV.i18n.t("experience.contributions")) + "</h4>" : "") + extra + "</div>"
      : "";
    return '<article class="entry" id="' + CV.esc(item.id) + '"><p class="entry-period">' + CV.text(item.period) + '</p><div><h3>' + CV.esc(item.title || "") + '</h3><p class="entry-meta">' + CV.esc(item.organization || "") + (item.location ? " · " + CV.esc(item.location) : "") + '</p><p>' + CV.text(item.summary) + "</p>" + button + panel + "</div></article>";
  };

  CV.render.home = function () {
    const profile = CV.profile;
    const highlights = profile.highlights.map(function (item) {
      return "<li>" + CV.text(item) + "</li>";
    }).join("");
    const expertise = profile.expertise.map(function (item) {
      return "<li>" + CV.text(item) + "</li>";
    }).join("");
    const selected = CV.projects.slice(0, 3).map(CV.render.projectCard).join("");
    return '<section class="section hero-section" id="home"><div class="shell"><p class="eyebrow">' + CV.esc(CV.i18n.t("home.greeting")) + '</p><div class="hero"><div class="hero-main"><div class="identity"><div class="avatar" role="img" aria-label="' + CV.esc(CV.i18n.t("home.photoAlt")) + '"><span aria-hidden="true">AT</span></div><div><h1>' + CV.esc(profile.name) + '</h1><p class="headline">' + CV.text(profile.headline) + "</p></div></div><p class=\"lede\">" + CV.text(profile.summary) + '</p><div class="actions"><a class="button" href="#experience">' + CV.esc(CV.i18n.t("home.ctaExperience")) + '</a><a class="button button-secondary" href="#projects">' + CV.esc(CV.i18n.t("home.ctaProjects")) + '</a><a class="button button-secondary" href="#contact">' + CV.esc(CV.i18n.t("home.ctaContact")) + '</a></div><p class="fine-print">' + CV.esc(CV.i18n.t("home.note")) + '</p></div><aside class="hero-aside"><p class="aside-label">' + CV.esc(CV.i18n.t("home.expertise")) + "</p><ul>" + expertise + "</ul></aside></div><div class=\"home-grid\"><article class=\"panel\"><h2>" + CV.esc(CV.i18n.t("home.highlights")) + "</h2><ol class=\"highlights\">" + highlights + '</ol></article><article class="panel"><h2>' + CV.esc(CV.i18n.t("home.projects")) + '</h2><div class="stack">' + selected + '</div><p><a class="text-link" href="#projects">' + CV.esc(CV.i18n.t("home.allProjects")) + "</a></p></article></div></div></section>";
  };

  CV.render.about = function () {
    const profile = CV.profile;
    const blocks = [
      ["about.background", profile.background.map(function (paragraph) { return "<p>" + CV.text(paragraph) + "</p>"; }).join("")],
      ["about.journey", "<p>" + CV.text(profile.journey) + "</p>"],
      ["about.interests", "<ul>" + profile.interests.map(function (item) { return "<li>" + CV.text(item) + "</li>"; }).join("") + "</ul>"],
      ["about.values", "<ul>" + profile.values.map(function (item) { return "<li>" + CV.text(item) + "</li>"; }).join("") + "</ul>"],
      ["about.direction", "<p>" + CV.text(profile.direction) + "</p>"]
    ];
    const body = '<div class="stack">' + blocks.map(function (block) {
      return '<article class="panel"><h3>' + CV.esc(CV.i18n.t(block[0])) + "</h3>" + block[1] + "</article>";
    }).join("") + "</div>";
    return section("about", "about.title", "about.intro", body);
  };

  CV.render.experience = function () {
    const body = '<div class="timeline">' + CV.experience.map(CV.render.expandable).join("") + "</div>";
    return section("experience", "experience.title", "experience.intro", body);
  };

  CV.render.education = function () {
    const body = '<div class="timeline">' + CV.education.map(function (item) {
      const note = item.note ? "<p class=\"fine-print\">" + CV.text(item.note) + "</p>" : "";
      return '<article class="entry" id="' + CV.esc(item.id) + '"><p class="entry-period">' + CV.text(item.period) + '</p><div><h3>' + CV.esc(item.title) + '</h3><p class="entry-meta">' + CV.esc(item.organization) + " · " + CV.esc(item.location) + "</p><p>" + CV.text(item.subtitle) + "</p>" + CV.list(item.details) + note + "</div></article>";
    }).join("") + "</div>";
    return section("education", "education.title", "education.intro", body);
  };

  CV.render.skills = function () {
    const body = '<div class="skill-grid">' + CV.skills.map(function (group) {
      const tags = group.items.map(function (item) {
        return '<li>' + CV.text(item) + "</li>";
      }).join("");
      return '<article class="panel"><h3>' + CV.text(group.group) + "</h3><ul class=\"tags\">" + tags + '</ul><p class="fine-print">' + CV.text(group.note) + "</p></article>";
    }).join("") + "</div>";
    return section("skills", "skills.title", "skills.intro", body);
  };

  CV.render.organizations = function () {
    return section("organizations", "organizations.title", "organizations.intro", '<div class="timeline">' + CV.organizations.map(CV.render.expandable).join("") + "</div>");
  };

  CV.render.volunteering = function () {
    return section("volunteering", "volunteering.title", "volunteering.intro", '<div class="timeline">' + CV.volunteering.map(CV.render.expandable).join("") + "</div>");
  };

  CV.render.licenses = function () {
    const cards = CV.credentials.map(function (item) {
      return '<article class="panel credential"><p class="badge">' + CV.esc(CV.i18n.t("licenses.academic")) + "</p><h3>" + CV.esc(item.title) + '</h3><p class="entry-meta">' + CV.esc(item.issuer) + "</p><dl><div><dt>" + CV.esc(CV.i18n.t("licenses.issued")) + "</dt><dd>" + CV.text(item.issued) + "</dd></div><div><dt>" + CV.esc(CV.i18n.t("licenses.expires")) + "</dt><dd>" + CV.text(item.expires) + "</dd></div><div><dt>" + CV.esc(CV.i18n.t("licenses.link")) + "</dt><dd>" + CV.esc(CV.i18n.t("licenses.noLink")) + "</dd></div></dl><p>" + CV.text(item.summary) + "</p>" + CV.list(item.details) + "</article>";
    }).join("");
    const notes = '<p class="fine-print">' + CV.esc(CV.i18n.t("licenses.planned")) + "</p><h3>" + CV.esc(CV.i18n.t("licenses.awards")) + "</h3><p>" + CV.esc(CV.i18n.t("licenses.awardsNone")) + "</p>";
    return section("licenses", "licenses.title", "licenses.intro", cards + notes);
  };

  CV.render.contact = function () {
    const profile = CV.profile;
    const links = [
      CV.externalLink(profile.linkedin, CV.i18n.t("contact.linkedin")),
      CV.externalLink(profile.github, CV.i18n.t("contact.github"))
    ].filter(Boolean).map(function (link) { return "<li>" + link + "</li>"; }).join("");
    const body = '<div class="panel contact-panel"><p>' + CV.esc(CV.i18n.t("contact.location")) + ": " + CV.esc(profile.location) + '</p><ul class="contact-list">' + links + "</ul></div>";
    return section("contact", "contact.title", "contact.intro", body);
  };

  CV.render.page = function () {
    return [
      CV.render.home(),
      CV.render.about(),
      CV.render.experience(),
      CV.render.education(),
      CV.render.skills(),
      CV.render.organizations(),
      CV.render.volunteering(),
      CV.render.licenses(),
      CV.render.projects(),
      CV.render.contact()
    ].join("");
  };
})();
