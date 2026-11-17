(function () {
  const CV = (window.CV = window.CV || {});
  CV.render = CV.render || {};

  function panel(eyebrow, title, body) {
    return '<section class="panel case-panel"><p class="eyebrow">' + CV.esc(eyebrow) + "</p><h2>" + CV.esc(title) + "</h2>" + body + "</section>";
  }

  CV.render.projectCard = function (project) {
    const count = CV.visibleEvidence(project.id).length;
    return '<article class="project-card"><div class="project-mark">' + CV.icon(project.icon, 28) + "</div><div><p class=\"eyebrow\">" + CV.text(project.category) + " · " + CV.text(project.period) + "</p><h3>" + CV.esc(project.title) + "</h3><p>" + CV.text(project.summary) + '</p><div class="card-foot"><span>' + CV.esc(CV.evidenceLabel(count)) + '</span><a class="text-link" href="#case/' + CV.esc(project.id) + '">' + CV.esc(CV.i18n.t("projects.view")) + "</a></div></div></article>";
  };

  CV.render.projects = function () {
    const cards = CV.projects.length
      ? '<div class="project-grid">' + CV.projects.map(CV.render.projectCard).join("") + "</div>"
      : '<p class="empty">' + CV.esc(CV.i18n.t("projects.empty")) + "</p>";
    return '<section class="section" id="projects"><div class="shell"><div class="section-head"><h2>' + CV.esc(CV.i18n.t("projects.title")) + "</h2><p>" + CV.esc(CV.i18n.t("projects.intro")) + "</p></div>" + cards + "</div></section>";
  };

  function evidenceCards(project) {
    const items = CV.visibleEvidence(project.id);
    if (typeof CV.render.evidenceCards === "function") return CV.render.evidenceCards(items, { prominent: true });
    return '<p class="empty">' + CV.esc(CV.i18n.t("case.evidenceEmpty")) + "</p>";
  }

  CV.render.caseStudy = function (id) {
    const project = (CV.projects || []).find(function (item) { return item.id === id; });
    if (!project) {
      return '<div class="shell section"><p class="empty">' + CV.esc(CV.i18n.t("case.notFound")) + '</p><p><a class="text-link" href="#projects">' + CV.esc(CV.i18n.t("case.back")) + "</a></p></div>";
    }
    const labels = (project.competencies || []).map(function (label) {
      return "<li>" + CV.esc(label) + "</li>";
    }).join("");
    const records = [].concat(CV.experience || [], CV.volunteering || [], CV.organizations || []);
    const roleLinks = (project.relatedExperience || []).map(function (roleId) {
      const record = records.find(function (item) { return item.id === roleId; });
      return '<a href="#' + CV.esc(roleId) + '">' + CV.esc(record ? record.title : roleId) + "</a>";
    }).join(", ");
    const main = [
      panel("01", CV.i18n.t("case.challenge"), "<p>" + CV.text(project.challenge) + "</p>"),
      panel("02", CV.i18n.t("case.role"), "<p>" + CV.esc(project.role) + "</p>"),
      panel("03", CV.i18n.t("case.contribution"), CV.list(project.contributions)),
      panel("04", CV.i18n.t("case.approach"), "<p>" + CV.text(project.approach) + "</p>"),
      panel("05", CV.i18n.t("case.results"), "<p>" + CV.text(project.results) + '</p><p class="fine-print">' + CV.esc(CV.i18n.t("case.resultsNote")) + "</p>"),
      panel("06", CV.i18n.t("case.lessons"), "<p>" + CV.text(project.learning) + "</p>"),
      panel("07", CV.i18n.t("case.evidence"), evidenceCards(project))
    ].join("");
    const aside = '<aside class="panel case-aside"><p class="eyebrow">' + CV.esc(CV.i18n.t("case.period")) + "</p><p class=\"aside-value\">" + CV.text(project.period) + '</p><p class="eyebrow">' + CV.esc(CV.i18n.t("case.role")) + '</p><p class="aside-value">' + CV.esc(project.role) + '</p><p class="eyebrow">' + CV.esc(CV.i18n.t("case.capabilities")) + "</p><ul class=\"tags\">" + labels + "</ul><p class=\"fine-print\">" + CV.esc(CV.i18n.t("case.capabilityNote")) + "</p>" + (roleLinks ? '<p class="related"><span>' + CV.esc(CV.i18n.t("case.relatedRole")) + "</span> " + roleLinks + "</p>" : "") + "</aside>";
    return '<article class="case"><header class="case-head"><div class="shell"><a class="back" href="#projects">' + CV.esc(CV.i18n.t("case.back")) + '</a><p class="eyebrow">' + CV.text(project.category) + " · " + CV.text(project.period) + "</p><h1>" + CV.esc(project.title) + '</h1><p class="lede">' + CV.text(project.summary) + "</p></div></header><div class=\"shell case-grid\">" + main + aside + "</div></article>";
  };
})();
