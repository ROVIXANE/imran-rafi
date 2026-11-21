/* ============================================================
   Imran Rafi Portfolio 2.0 — public site orchestrator
   Renders bilingual, CMS-driven content; keeps original UX.
   ============================================================ */
(function () {
  "use strict";

  var I18n = window.AppI18n;
  var Data = window.AppData;
  var SB = window.AppSupabase;
  var state = { data: null, lang: "bn", preview: false, gallery: [], projects: [] };
  var revealObserver = null;
  var lastFocused = null;
  var currentImage = 0;

  /* ---------- Utilities ---------- */
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function safeUrl(value) {
    var url = String(value || "").trim();
    if (!url) return "";
    if (/^(https?:\/\/|mailto:|\/|assets\/|#)/i.test(url)) return url;
    return "";
  }

  function first(list) { return list && list.length ? list[0] : null; }

  function loc(row, field) { return I18n.localize(row, field, state.lang); }

  function label(value) { return I18n.categoryLabel(value); }

  function byOrder(a, b) {
    return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.hidden = true; }, 3200);
  }

  function showBanner(title, text, withRetry) {
    var banner = document.getElementById("status-banner");
    if (!banner) return;
    document.getElementById("status-title").textContent = title || "";
    document.getElementById("status-text").textContent = text || "";
    document.getElementById("status-retry").hidden = !withRetry;
    banner.hidden = false;
  }

  /* ---------- Icons ---------- */
  var ICONS = {
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.68 5.4-5.24 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.67 2 3.51v16.98c0 .84.69 1.51 1.55 1.51h16.9c.86 0 1.55-.67 1.55-1.51V3.51c0-.84-.69-1.51-1.55-1.51ZM7.93 18.75H4.98V9.4h2.95v9.35ZM6.45 8.06a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.69h-2.94v-4.55c0-1.09-.02-2.49-1.52-2.49-1.52 0-1.75 1.18-1.75 2.41v4.63H9.6V9.4h2.83v1.28h.04c.39-.74 1.35-1.52 2.78-1.52 2.97 0 3.52 1.96 3.52 4.5v5.09Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.55 3.55 12 3.55 12 3.55s-7.55 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.03 0 12 0 12s0 3.97.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.83.51 9.38.51 9.38.51s7.55 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14c.5-1.83.5-5.8.5-5.8s0-3.97-.5-5.8ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96Zm0 1.8a3.18 3.18 0 1 0 0 6.36 3.18 3.18 0 0 0 0-6.36Zm5.18-3.23a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4.8A2.8 2.8 0 0 1 4.8 2h14.4A2.8 2.8 0 0 1 22 4.8v14.4A2.8 2.8 0 0 1 19.2 22H4.8A2.8 2.8 0 0 1 2 19.2V4.8Zm2.2.48 7.8 5.85 7.8-5.85a.8.8 0 0 0-1-.28L10 11.2 4.2 5.28a.8.8 0 0 0 0 0Zm15.6 13.92V8.4l-8.2 6.15a.8.8 0 0 1-.96 0L4.2 8.4v10.8c0 .22.18.4.4.4h14.8c.22 0 .4-.18.4-.4Z"/></svg>'
  };

  function iconFor(name) {
    return ICONS[String(name || "").toLowerCase()] || "<span aria-hidden=\"true\">↗</span>";
  }

  /* ---------- Renderers ---------- */
  function renderHero() {
    var p = first(state.data.profiles) || {};
    var name = p.name || "Imran Rafi";
    document.getElementById("hero-name").textContent = name;
    document.getElementById("hero-role").textContent = loc(p, "headline") || I18n.t("sections.hero.role");
    document.getElementById("hero-desc").textContent = loc(p, "intro") || I18n.t("sections.hero.desc");
    document.getElementById("hero-primary").textContent = I18n.t("sections.hero.primary");
    document.getElementById("hero-secondary").textContent = I18n.t("sections.hero.secondary");
    document.getElementById("hero-badge").textContent = I18n.t("sections.hero.badge");
    var photo = safeUrl(p.photo_url) || "assets/profile.svg";
    var img = document.getElementById("hero-photo");
    img.src = photo;
    img.alt = I18n.t("sections.hero.alt") + " — " + name;

    var socials = (state.data.social_links || []).filter(function (s) { return s.visible !== false && safeUrl(s.url); });
    var el = document.getElementById("hero-socials");
    el.innerHTML = socials.length ? socials.map(function (s) {
      var url = safeUrl(s.url);
      var external = /^https?:\/\//.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a href="' + esc(url) + '"' + external + ' aria-label="' + esc(s.platform || "Social") + '" title="' + esc(s.platform || "Social") + '">' + iconFor(s.icon || s.platform) + "</a>";
    }).join("") : "";
    el.setAttribute("aria-label", I18n.t("ui.findOnline"));
  }

  function renderAbout() {
    var p = first(state.data.profiles) || {};
    var about = loc(p, "about") || I18n.t("sections.about.p1");
    document.getElementById("about-p1").textContent = about;
    document.getElementById("about-p2").textContent = I18n.t("sections.about.p2");
    document.getElementById("about-p3").textContent = I18n.t("sections.about.p3");
    var chips = (state.data.interests || []).slice(0, 4).map(function (i) { return loc(i, "title"); }).filter(Boolean);
    if (!chips.length) chips = I18n.raw("sections.about.chips") || [];
    document.getElementById("about-chips").innerHTML = chips.map(function (c) {
      return '<span class="chip">' + esc(c) + "</span>";
    }).join("");
    var stats = [
      { icon: "⚡", value: (state.data.interests || []).length + "+", label: I18n.t("sections.about.stat1") + " · " + I18n.t("sections.about.stat1sub") },
      { icon: "🔧", value: I18n.t("sections.about.stat2"), label: I18n.t("sections.about.stat2sub") },
      { icon: "🌱", value: I18n.t("sections.about.stat3"), label: I18n.t("sections.about.stat3sub") }
    ];
    document.getElementById("about-stats").innerHTML = stats.map(function (s) {
      return '<article class="stat-card"><span class="stat-icon" aria-hidden="true">' + s.icon + '</span><div><strong>' + esc(s.value) + "</strong><span>" + esc(s.label) + "</span></div></article>";
    }).join("");
    var location = loc(p, "location");
    var goal = loc(p, "learning_goal");
    var locEl = document.getElementById("about-location");
    var goalEl = document.getElementById("about-goal");
    locEl.hidden = !location; locEl.textContent = location;
    goalEl.hidden = !goal; goalEl.textContent = goal;
  }

  function emptyState() {
    return '<div class="empty-state"><span aria-hidden="true">◌</span>' + esc(I18n.t("ui.noItems")) + "</div>";
  }

  function renderInterests() {
    var items = (state.data.interests || []).slice().sort(byOrder);
    var el = document.getElementById("interests-grid");
    el.innerHTML = items.length ? items.map(function (i) {
      return '<article class="interest-card reveal"><span class="interest-icon" aria-hidden="true">' + esc(i.icon || "✦") + "</span><h3>" + esc(loc(i, "title")) + "</h3><p>" + esc(loc(i, "description")) + "</p></article>";
    }).join("") : emptyState();
  }

  function renderSkills() {
    var items = (state.data.skills || []).filter(function (s) { return s.visible !== false; }).sort(byOrder);
    var groups = {};
    items.forEach(function (s) {
      var cat = s.category || "other";
      (groups[cat] = groups[cat] || []).push(s);
    });
    var icons = { electronics: "⚙️", programming: "💻", ai: "🤖", web: "🌐", hardware: "🔧", other: "✦" };
    var el = document.getElementById("skills-grid");
    var keys = Object.keys(groups);
    el.innerHTML = keys.length ? keys.map(function (cat) {
      var rows = groups[cat].map(function (s) {
        var hasLevel = s.level !== null && s.level !== undefined && s.level !== "";
        var level = Math.min(100, Math.max(0, Number(s.level) || 0));
        return '<div class="skill"><div class="skill-meta"><span>' + esc(loc(s, "name")) + "</span>" +
          (hasLevel ? "<span>" + level + "%</span>" : "<span>" + esc(I18n.t("sections.skills.noLevel")) + "</span>") +
          '</div><div class="skill-track">' + (hasLevel ? '<div class="skill-fill" data-level="' + level + '"></div>' : "") + "</div></div>";
      }).join("");
      return '<article class="skill-group reveal"><h3><span aria-hidden="true">' + (icons[cat] || "✦") + "</span> " + esc(label(cat)) + "</h3>" + rows + "</article>";
    }).join("") : emptyState();
  }

  function featureCard(project) {
    var thumb = safeUrl(project.image_url);
    var links = [];
    var live = safeUrl(project.project_url);
    var repo = safeUrl(project.github_url);
    if (live) links.push('<a href="' + esc(live) + '" target="_blank" rel="noopener noreferrer">' + esc(I18n.t("ui.visit")) + " ↗</a>");
    if (repo) links.push('<a href="' + esc(repo) + '" target="_blank" rel="noopener noreferrer">' + esc(I18n.t("ui.github")) + " ↗</a>");
    var tech = (project.technologies || []).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
    return '<article class="feature-card reveal">' +
      (thumb ? '<img class="feature-thumb" src="' + esc(thumb) + '" alt="' + esc(loc(project, "title")) + '" loading="lazy">' : "") +
      '<h3>' + esc(loc(project, "title")) + "</h3><p>" + esc(loc(project, "description")) + "</p>" +
      (tech ? '<div class="tags">' + tech + "</div>" : "") +
      (links.length ? '<div class="project-links">' + links.join("") + "</div>" : "") + "</article>";
  }

  function renderFeatures() {
    var projects = (state.data.projects || []).filter(function (p) { return p.visible !== false; });
    [["embedded", "embedded-grid"], ["ai", "ai-grid"], ["web", "webdev-grid"]].forEach(function (pair) {
      var items = projects.filter(function (p) { return (p.section || "showcase") === pair[0]; }).sort(byOrder);
      var el = document.getElementById(pair[1]);
      el.innerHTML = items.length ? items.map(featureCard).join("") : emptyState();
    });
  }

  function projectCard(project) {
    var thumb = safeUrl(project.image_url) || "assets/project-1.svg";
    var links = [];
    var live = safeUrl(project.project_url);
    var repo = safeUrl(project.github_url);
    if (live) links.push('<a href="' + esc(live) + '" target="_blank" rel="noopener noreferrer">' + esc(I18n.t("ui.visit")) + " ↗</a>");
    if (repo) links.push('<a href="' + esc(repo) + '" target="_blank" rel="noopener noreferrer">' + esc(I18n.t("ui.github")) + " ↗</a>");
    var tech = (project.technologies || []).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
    return '<article class="project-card reveal" data-category="' + esc(project.category || "other") + '">' +
      '<div class="project-thumb"><img src="' + esc(thumb) + '" alt="' + esc(loc(project, "title")) + '" width="600" height="360" loading="lazy">' +
      (project.featured ? '<span class="project-label">' + esc(I18n.t("ui.featured")) + "</span>" : "") + "</div>" +
      '<div class="project-body"><h3>' + esc(loc(project, "title")) + "</h3><p>" + esc(loc(project, "description")) + "</p>" +
      (tech ? '<div class="tags">' + tech + "</div>" : "") +
      (links.length ? '<div class="project-links">' + links.join("") + "</div>" : "") + "</div></article>";
  }

  function renderProjects() {
    /* Showcase lists every published project; featured only adds a badge. */
    var items = (state.data.projects || []).filter(function (p) {
      return p.visible !== false;
    }).sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || byOrder(a, b);
    });
    state.projects = items;
    var el = document.getElementById("project-grid");
    el.innerHTML = items.length ? items.map(projectCard).join("") : emptyState();
    applyFilter("all");
  }

  function renderGallery() {
    var items = (state.data.gallery || []).filter(function (g) { return g.visible !== false; }).sort(byOrder);
    state.gallery = items;
    var el = document.getElementById("gallery-grid");
    el.innerHTML = items.length ? items.map(function (g, index) {
      var src = safeUrl(g.image_url) || "assets/gallery-1.svg";
      var caption = loc(g, "caption");
      return '<button class="gallery-item reveal" type="button" data-index="' + index + '" data-caption="' + esc(caption) + '" aria-label="' + esc(caption || I18n.t("ui.openImage")) + '">' +
        '<img src="' + esc(src) + '" alt="' + esc(caption || I18n.t("ui.imageAlt")) + '" width="600" height="600" loading="lazy">' +
        '<span class="gallery-overlay" aria-hidden="true">＋</span>' +
        (caption ? '<span class="gallery-caption">' + esc(caption) + "</span>" : "") + "</button>";
    }).join("") : emptyState();
  }

  function renderEducation() {
    var items = (state.data.education || []).filter(function (e) { return e.visible !== false; }).sort(byOrder);
    var el = document.getElementById("education-timeline");
    el.innerHTML = items.length ? items.map(function (e) {
      var years = [e.start_year, e.end_year].filter(Boolean).join(" — ") || loc(e, "level");
      return '<article class="timeline-item reveal"><div class="timeline-marker" aria-hidden="true"></div><div class="timeline-card">' +
        '<span class="timeline-date">' + esc(years) + "</span>" +
        "<h3>" + esc(loc(e, "institution")) + "</h3>" +
        '<p class="timeline-place">' + esc([loc(e, "level"), loc(e, "department")].filter(Boolean).join(" · ")) + "</p>" +
        "<p>" + esc(loc(e, "description")) + "</p></div></article>";
    }).join("") : emptyState();
  }

  function renderContact() {
    var links = (state.data.social_links || []).filter(function (s) { return s.visible !== false && safeUrl(s.url); }).sort(byOrder);
    document.getElementById("contact-email-title").textContent = I18n.t("sections.contact.emailTitle");
    document.getElementById("contact-email-desc").textContent = I18n.t("sections.contact.emailDesc");
    document.getElementById("contact-social-title").textContent = I18n.t("sections.contact.socialTitle");
    document.getElementById("contact-social-desc").textContent = I18n.t("sections.contact.socialDesc");
    var emailLink = links.filter(function (s) { return /^mailto:/i.test(s.url); })[0];
    var emailEl = document.getElementById("contact-email");
    if (emailLink) {
      emailEl.href = safeUrl(emailLink.url);
      emailEl.textContent = emailLink.platform || emailLink.url.replace(/^mailto:/, "");
      emailEl.hidden = false;
    } else {
      emailEl.hidden = true;
      document.getElementById("email-card").hidden = true;
    }
    document.getElementById("contact-socials").innerHTML = links.filter(function (s) { return !/^mailto:/i.test(s.url); }).map(function (s) {
      return '<a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(s.platform || "Link") + ' <span aria-hidden="true">↗</span></a>';
    }).join("") || '<p class="section-subtitle">' + esc(I18n.t("ui.noItems")) + "</p>";
  }

  function applyTheme(settings) {
    var accent = settings && settings.accent_color;
    if (!accent || !/^#[0-9a-f]{6}$/i.test(accent)) accent = "#3b82f6";
    var r = parseInt(accent.slice(1, 3), 16);
    var g = parseInt(accent.slice(3, 5), 16);
    var b = parseInt(accent.slice(5, 7), 16);
    var light = [r, g, b].map(function (v) { return Math.round(v + (255 - v) * 0.35); });
    var root = document.documentElement;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-light", "rgb(" + light.join(",") + ")");
    root.style.setProperty("--accent-glow", "rgba(" + [r, g, b].join(",") + ",0.35)");
  }

  function renderAll() {
    var data = state.data;
    renderHero();
    renderAbout();
    renderInterests();
    renderSkills();
    renderFeatures();
    renderProjects();
    renderGallery();
    renderEducation();
    renderContact();
    var settings = first(data.site_settings) || {};
    var footer = document.getElementById("footer-note");
    footer.textContent = loc(settings, "footer") || I18n.t("sections.footer.note");
    document.getElementById("footer-copyright").textContent = settings.copyright || "Imran Rafi";
    applyTheme(settings);
    I18n.setMeta(settings);
    document.getElementById("year").textContent = String(new Date().getFullYear());
    observeReveals();
    requestAnimationFrame(function () {
      document.querySelectorAll(".skill-fill").forEach(function (bar) {
        bar.style.width = (Number(bar.getAttribute("data-level")) || 0) + "%";
      });
    });
  }

  /* ---------- Interactions ---------- */
  function observeReveals() {
    var els = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    }
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  function applyFilter(filter) {
    document.querySelectorAll(".project-card").forEach(function (card) {
      var show = filter === "all" || card.getAttribute("data-category") === filter;
      card.classList.toggle("is-hidden", !show);
    });
  }

  function initNav() {
    var header = document.getElementById("site-header");
    var back = document.getElementById("back-to-top");
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("primary-nav");

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle("scrolled", y > 30);
      back.classList.toggle("visible", y > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    back.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    function closeNav() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", I18n.t("ui.openMenu"));
      document.body.classList.remove("nav-open");
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", I18n.t(open ? "ui.closeMenu" : "ui.openMenu"));
      document.body.classList.toggle("nav-open", open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a, .lang-btn")) closeNav();
    });
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 768) closeNav(); });

    var links = Array.prototype.slice.call(nav.querySelectorAll(".nav-link"));
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
      links.forEach(function (link) {
        var section = document.querySelector(link.getAttribute("href"));
        if (section) observer.observe(section);
      });
    }
  }

  function initFilters() {
    var filterBar = document.getElementById("filter-bar");
    filterBar.addEventListener("click", function (e) {
      var button = e.target.closest(".filter-btn");
      if (!button) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (btn) {
        var active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilter(button.getAttribute("data-filter"));
    });
  }

  function initLightbox() {
    var lightbox = document.getElementById("lightbox");
    var image = document.getElementById("lightbox-img");
    var caption = document.getElementById("lightbox-caption");
    var close = document.getElementById("lightbox-close");

    function show(index) {
      if (!state.gallery.length) return;
      currentImage = (index + state.gallery.length) % state.gallery.length;
      var item = state.gallery[currentImage];
      image.src = safeUrl(item.image_url) || "assets/gallery-1.svg";
      image.alt = loc(item, "caption") || I18n.t("ui.imageAlt");
      caption.textContent = loc(item, "caption");
    }
    function open(index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      close.focus();
    }
    function hide() {
      if (lightbox.hidden) return;
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    document.getElementById("gallery-grid").addEventListener("click", function (e) {
      var item = e.target.closest(".gallery-item");
      if (item) open(Number(item.getAttribute("data-index")) || 0);
    });
    close.addEventListener("click", hide);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) hide();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") show(currentImage + 1);
      if (e.key === "ArrowLeft") show(currentImage - 1);
    });
  }

  function initLanguage() {
    document.querySelector(".lang-switch").addEventListener("click", function (e) {
      var button = e.target.closest(".lang-btn");
      if (!button) return;
      var lang = button.getAttribute("data-lang");
      if (lang === state.lang) return;
      state.lang = lang;
      I18n.set(lang);
      syncLangButtons();
      renderAll();
      showToast(lang === "bn" ? "ভাষা বাংলায় পরিবর্তন করা হয়েছে" : "Language switched to English");
    });
  }

  function syncLangButtons() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === state.lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function initStatus() {
    document.getElementById("status-close").addEventListener("click", function () {
      document.getElementById("status-banner").hidden = true;
    });
    document.getElementById("status-retry").addEventListener("click", function () { location.reload(); });
  }

  /* ---------- Boot ---------- */
  async function boot() {
    I18n.init();
    state.lang = I18n.current();

    var params = new URLSearchParams(location.search);
    var previewLang = params.get("preview");
    state.preview = Boolean(previewLang) || params.get("preview") === "" || params.has("preview");
    if (previewLang === "bn" || previewLang === "en") {
      state.lang = previewLang;
      I18n.set(previewLang, true);
      syncLangButtons();
    }
    if (state.preview) {
      var badge = document.getElementById("preview-badge");
      badge.textContent = I18n.t("ui.previewMode");
      badge.hidden = false;
    }

    initNav();
    initFilters();
    initLightbox();
    initLanguage();
    initStatus();

    var loading = document.createElement("div");
    loading.className = "container skeleton";
    loading.style.marginTop = "120px";
    document.getElementById("main").prepend(loading);

    var result = await Data.load(state.preview && SB.getSession());
    loading.remove();

    state.data = result.data;
    renderAll();
    syncLangButtons();

    if (result.error) {
      showBanner(I18n.t("ui.errorTitle"), I18n.t("ui.errorText"), true);
    } else if (!result.live && state.preview) {
      showBanner(I18n.t("ui.demoMode"), I18n.t("ui.errorText"), false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
