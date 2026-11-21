/* ============================================================
   Admin CMS — Supabase Auth + REST + Storage
   No passwords or keys are stored in frontend files.
   ============================================================ */
(function () {
  "use strict";

  var SB = window.AppSupabase;
  var I18n = window.AppI18n;
  var state = { session: null, user: null, view: "dashboard", rows: [], all: {} };
  var TABLES = ["profiles", "site_settings", "projects", "gallery", "skills", "education", "interests", "social_links"];

  function T(key) { return I18n.t("admin." + key); }
  function text(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function bi(obj) { return (obj && (obj[I18n.current()] || obj.en)) || ""; }
  function loc(row, field) {
    return row[field + "_" + I18n.current()] || row[field + "_en"] || row[field + "_bn"] || "";
  }
  function toast(message, isError) {
    var el = document.getElementById("admin-toast");
    el.textContent = message;
    el.classList.toggle("error", Boolean(isError));
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.hidden = true; }, 3600);
  }

  /* ---------- Field labels (keys match database column names) ---------- */
  var L = {
    title_bn: { bn: "বাংলা শিরোনাম", en: "Title (Bengali)" },
    title_en: { bn: "শিরোনাম (English)", en: "Title (English)" },
    description_bn: { bn: "বাংলা বিবরণ", en: "Description (Bengali)" },
    description_en: { bn: "বিবরণ (English)", en: "Description (English)" },
    name_bn: { bn: "বাংলা নাম", en: "Name (Bengali)" },
    name_en: { bn: "নাম (English)", en: "Name (English)" },
    image_url: { bn: "ছবি", en: "Image" },
    photo_url: { bn: "প্রোফাইল ছবি", en: "Profile photo" },
    og_image_url: { bn: "OG image", en: "OG image" },
    category: { bn: "ক্যাটাগরি", en: "Category" },
    section: { bn: "সেকশন", en: "Section" },
    sort_order: { bn: "প্রদর্শন ক্রম", en: "Display order" },
    level: { bn: "মাত্রা (০-১০০, ঐচ্ছিক)", en: "Level (0-100, optional)" },
    technologies: { bn: "প্রযুক্তি (কমা দিয়ে আলাদা করুন)", en: "Technologies (comma separated)" },
    project_url: { bn: "প্রকল্পের লিংক", en: "Project URL" },
    github_url: { bn: "GitHub লিংক", en: "GitHub URL" },
    platform: { bn: "প্ল্যাটফর্ম", en: "Platform" },
    url: { bn: "লিংক", en: "URL" },
    icon: { bn: "আইকন নাম", en: "Icon name" },
    institution_bn: { bn: "প্রতিষ্ঠান (বাংলা)", en: "Institution (Bengali)" },
    institution_en: { bn: "প্রতিষ্ঠান (English)", en: "Institution (English)" },
    level_bn: { bn: "শিক্ষাগত যোগ্যতা (বাংলা)", en: "Education level (Bengali)" },
    level_en: { bn: "শিক্ষাগত যোগ্যতা (English)", en: "Education level (English)" },
    department_bn: { bn: "বিভাগ (বাংলা)", en: "Department (Bengali)" },
    department_en: { bn: "বিভাগ (English)", en: "Department (English)" },
    start_year: { bn: "শুরুর বছর", en: "Start year" },
    end_year: { bn: "শেষের বছর", en: "End year" },
    name: { bn: "নাম", en: "Name" },
    headline_bn: { bn: "Headline (বাংলা)", en: "Headline (Bengali)" },
    headline_en: { bn: "Headline (English)", en: "Headline (English)" },
    intro_bn: { bn: "সংক্ষিপ্ত পরিচয় (বাংলা)", en: "Short intro (Bengali)" },
    intro_en: { bn: "সংক্ষিপ্ত পরিচয় (English)", en: "Short intro (English)" },
    about_bn: { bn: "বিবরণ (বাংলা)", en: "About text (Bengali)" },
    about_en: { bn: "বিবরণ (English)", en: "About text (English)" },
    location_bn: { bn: "অবস্থান (বাংলা, সাধারণ)", en: "Location (Bengali, broad)" },
    location_en: { bn: "অবস্থান (English, broad)", en: "Location (English, broad)" },
    learning_goal_bn: { bn: "শেখার লক্ষ্য (বাংলা)", en: "Learning goal (Bengali)" },
    learning_goal_en: { bn: "শেখার লক্ষ্য (English)", en: "Learning goal (English)" },
    site_name: { bn: "ওয়েবসাইটের নাম", en: "Website name" },
    footer_bn: { bn: "ফুটার টেক্সট (বাংলা)", en: "Footer text (Bengali)" },
    footer_en: { bn: "ফুটার টেক্সট (English)", en: "Footer text (English)" },
    copyright: { bn: "কপিরাইট নাম", en: "Copyright name" },
    accent_color: { bn: "Accent color", en: "Accent color" },
    default_language: { bn: "ডিফল্ট ভাষা", en: "Default language" },
    caption_bn: { bn: "ক্যাপশন (বাংলা)", en: "Caption (Bengali)" },
    caption_en: { bn: "ক্যাপশন (English)", en: "Caption (English)" }
  };

  /* Map internal view names to translation keys */
  var VIEW_KEYS = {
    dashboard: "dashboard", profile: "profile", projects: "projects",
    gallery: "gallery", skills: "skills", education: "education",
    interests: "interests", social_links: "socials",
    site_settings: "settings", backup: "backup"
  };
  function viewTitle(view) { return T(VIEW_KEYS[view] || view) || view; }

  function f(key, type, extra) {
    return Object.assign({ key: key, label: L[key] || { en: key }, type: type || "text" }, extra || {});
  }

  /* ---------- Manager configurations ---------- */
  var MANAGERS = {
    projects: {
      table: "projects",
      titleRow: function (r) { return loc(r, "title") || "(untitled)"; },
      metaRow: function (r) { return [I18n.categoryLabel(r.category), r.section, (r.technologies || []).join(", ")].filter(Boolean).join(" · "); },
      fields: [
        f("title_bn", "text", { required: true }), f("title_en", "text"),
        f("description_bn", "textarea", { full: true }), f("description_en", "textarea", { full: true }),
        f("image_url", "image", { full: true }),
        f("category", "select", { options: [["electronics", "Electronics"], ["ai", "AI & Automation"], ["web", "Web"], ["other", "Other"]] }),
        f("section", "select", { options: [["showcase", "Project showcase"], ["embedded", "Electronics & Embedded"], ["ai", "AI & Automation"], ["web", "Web Development"]] }),
        f("technologies", "text"), f("project_url", "url"), f("github_url", "url"),
        f("sort_order", "number"), f("featured", "bool"), f("visible", "bool")
      ]
    },
    gallery: {
      table: "gallery",
      titleRow: function (r) { return loc(r, "caption") || "Gallery image"; },
      metaRow: function (r) { return [r.category, r.image_url].filter(Boolean).join(" · "); },
      thumb: "image_url",
      fields: [
        f("image_url", "image", { full: true, required: true }),
        f("caption_bn", "text"), f("caption_en", "text"),
        f("category", "text"), f("sort_order", "number"), f("visible", "bool")
      ]
    },
    skills: {
      table: "skills",
      titleRow: function (r) { return loc(r, "name") || "(unnamed)"; },
      metaRow: function (r) { return [I18n.categoryLabel(r.category), r.level != null ? r.level + "%" : ""].filter(Boolean).join(" · "); },
      fields: [
        f("name_bn", "text", { required: true }), f("name_en", "text"),
        f("category", "select", { options: [["electronics", "Electronics"], ["programming", "Programming"], ["web", "Web Development"], ["ai", "AI & Automation"], ["hardware", "Hardware"], ["other", "Other"]] }),
        f("level", "number"), f("sort_order", "number"), f("visible", "bool")
      ]
    },
    education: {
      table: "education",
      titleRow: function (r) { return loc(r, "institution") || "(untitled)"; },
      metaRow: function (r) { return [r.start_year, r.end_year, loc(r, "level")].filter(Boolean).join(" — "); },
      fields: [
        f("institution_bn", "text", { required: true }), f("institution_en", "text"),
        f("level_bn", "text"), f("level_en", "text"),
        f("department_bn", "text"), f("department_en", "text"),
        f("start_year", "text"), f("end_year", "text"),
        f("description_bn", "textarea", { full: true }), f("description_en", "textarea", { full: true }),
        f("sort_order", "number"), f("visible", "bool")
      ]
    },
    interests: {
      table: "interests",
      titleRow: function (r) { return loc(r, "title") || "(untitled)"; },
      metaRow: function (r) { return I18n.categoryLabel(r.category); },
      fields: [
        f("title_bn", "text", { required: true }), f("title_en", "text"),
        f("description_bn", "textarea", { full: true }), f("description_en", "textarea", { full: true }),
        f("icon", "text"),
        f("category", "select", { options: [["microcontrollers", "Microcontrollers"], ["electronics", "Electronics"], ["ai", "AI"], ["web", "Web Development"], ["programming", "Programming"], ["technology", "Technology"], ["creative projects", "Creative Projects"]] }),
        f("sort_order", "number"), f("visible", "bool")
      ]
    },
    social_links: {
      table: "social_links",
      titleRow: function (r) { return r.platform || "Link"; },
      metaRow: function (r) { return r.url || "—"; },
      fields: [
        f("platform", "select", { options: [["GitHub", "GitHub"], ["LinkedIn", "LinkedIn"], ["YouTube", "YouTube"], ["Instagram", "Instagram"], ["Facebook", "Facebook"], ["Email", "Email"], ["Other", "Other"]] }),
        f("url", "url", { full: true }), f("icon", "text"),
        f("sort_order", "number"), f("visible", "bool")
      ]
    }
  };

  var SINGLE = {
    profile: {
      table: "profiles", id: "profile-main", titleKey: "profile",
      fields: [
        f("name", "text"), f("photo_url", "image", { full: true }),
        f("headline_bn", "textarea", { full: true }), f("headline_en", "textarea", { full: true }),
        f("intro_bn", "textarea", { full: true }), f("intro_en", "textarea", { full: true }),
        f("about_bn", "textarea", { full: true }), f("about_en", "textarea", { full: true }),
        f("location_bn", "text"), f("location_en", "text"),
        f("learning_goal_bn", "textarea", { full: true }), f("learning_goal_en", "textarea", { full: true })
      ]
    },
    site_settings: {
      table: "site_settings", id: "settings-main", titleKey: "settings",
      fields: [
        f("site_name", "text"),
        f("title_bn", "text", { full: true, label: { bn: "SEO title (বাংলা)", en: "SEO title (Bengali)" } }),
        f("title_en", "text", { full: true, label: { bn: "SEO title (English)", en: "SEO title (English)" } }),
        f("description_bn", "textarea", { full: true, label: { bn: "SEO description (বাংলা)", en: "SEO description (Bengali)" } }),
        f("description_en", "textarea", { full: true, label: { bn: "SEO description (English)", en: "SEO description (English)" } }),
        f("og_image_url", "image", { full: true }),
        f("footer_bn", "text", { full: true }), f("footer_en", "text", { full: true }),
        f("copyright", "text"), f("accent_color", "text"),
        f("default_language", "select", { options: [["bn", "বাংলা"], ["en", "English"]] })
      ]
    }
  };

  /* ---------- API guard ---------- */
  async function safe(fn) {
    try {
      return await fn();
    } catch (error) {
      var message = error && error.message ? error.message : String(error);
      if (/JWT|expired|401|Unauthorized/i.test(message)) {
        SB.signOut();
        state.session = null;
        showLogin();
        toast(T("sessionExpired"), true);
      } else {
        toast(message, true);
      }
      throw error;
    }
  }

  /* ---------- Auth views ---------- */
  function showLogin() {
    document.getElementById("login-view").hidden = false;
    document.getElementById("app-view").hidden = true;
    if (!SB.configured()) {
      document.getElementById("config-notice").hidden = false;
      document.getElementById("login-submit").disabled = true;
    }
  }

  function showApp(user) {
    state.user = user || null;
    document.getElementById("login-view").hidden = true;
    document.getElementById("app-view").hidden = false;
    document.getElementById("user-email").textContent = (user && user.email) || (SB.getSession() || {}).email || "";
    navigate("dashboard");
  }

  /* A valid Auth account is not enough — the email must also be in the
     allowlist created by supabase/schema.sql. RLS still enforces this on
     every request; this check is an early, user-friendly rejection. */
  async function isAllowed(email) {
    if (!email) return false;
    try {
      var rows = await SB.select("admin_allowlist", { admin: true });
      return (rows || []).some(function (r) {
        return String(r.email || "").toLowerCase() === String(email).toLowerCase();
      });
    } catch (e) {
      return false;
    }
  }

  function denyAccess() {
    SB.signOut();
    state.session = null;
    state.user = null;
    showLogin();
    var err = document.getElementById("login-error");
    err.textContent = T("notAuthorized") + " — " + T("notAuthorizedText");
    err.hidden = false;
  }

  function syncLangButtons() {
    document.querySelectorAll(".admin-topbar .lang-btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === I18n.current();
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  async function boot() {
    I18n.init();
    syncLangButtons();
    bindGlobalUI();
    if (!SB.configured()) { showLogin(); return; }
    var user = await SB.getUser();
    if (!user) { showLogin(); return; }
    if (!(await isAllowed(user.email))) { denyAccess(); return; }
    showApp(user);
  }

  function bindGlobalUI() {
    document.getElementById("login-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var button = document.getElementById("login-submit");
      var errorEl = document.getElementById("login-error");
      errorEl.hidden = true;
      button.disabled = true;
      button.innerHTML = '<span id="login-spin"></span>';
      document.getElementById("login-spin").textContent = T("signingIn");
      try {
        var session = await SB.signIn(
          document.getElementById("login-email").value.trim(),
          document.getElementById("login-password").value
        );
        state.session = session;
        var user = await SB.getUser();
        if (!(await isAllowed(user && user.email))) { denyAccess(); return; }
        showApp(user);
        toast(T("signedIn") || "Signed in");
      } catch (error) {
        errorEl.textContent = T("authError") + " — " + (error.message || "");
        errorEl.hidden = false;
      } finally {
        button.disabled = false;
        button.innerHTML = '<span data-i18n="admin.signIn">' + text(T("signIn")) + "</span>";
      }
    });

    document.getElementById("logout-btn").addEventListener("click", function () {
      SB.signOut();
      state.session = null;
      showLogin();
    });

    document.getElementById("side-nav").addEventListener("click", function (e) {
      var button = e.target.closest(".side-link");
      if (button) navigate(button.getAttribute("data-view"));
    });

    var sidebar = document.getElementById("sidebar");
    var backdrop = document.getElementById("sidebar-backdrop");
    var menu = document.getElementById("admin-menu");
    function closeSidebar() {
      sidebar.classList.remove("open");
      backdrop.hidden = true;
      menu.setAttribute("aria-expanded", "false");
    }
    menu.addEventListener("click", function () {
      var open = sidebar.classList.toggle("open");
      backdrop.hidden = !open;
      menu.setAttribute("aria-expanded", open ? "true" : "false");
    });
    backdrop.addEventListener("click", closeSidebar);

    document.querySelector(".admin-topbar .lang-switch").addEventListener("click", function (e) {
      var button = e.target.closest(".lang-btn");
      if (!button) return;
      var lang = button.getAttribute("data-lang");
      if (lang === I18n.current()) return;
      I18n.set(lang);
      syncLangButtons();
      navigate(state.view);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---------- Navigation / views ---------- */
  async function navigate(view) {
    state.view = view;
    document.querySelectorAll(".side-link[data-view]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-view") === view);
    });
    document.getElementById("topbar-title").textContent =
      viewTitle(view);
    var content = document.getElementById("admin-content");
    content.innerHTML = '<div class="panel muted">' + text(T("loading") || "Loading…") + "</div>";

    try {
      if (view === "dashboard") {
        await safe(async function () {
          var results = await Promise.all(TABLES.map(function (t) { return SB.select(t, { admin: true }); }));
          TABLES.forEach(function (t, i) { state.all[t] = results[i] || []; });
        });
        renderDashboard();
      } else if (SINGLE[view]) {
        var rows = await safe(function () { return SB.select(SINGLE[view].table, { admin: true }); });
        renderSingle(view, rows && rows[0]);
      } else if (MANAGERS[view]) {
        state.rows = await safe(function () {
          return SB.select(MANAGERS[view].table, { admin: true, order: "sort_order.asc" });
        });
        renderManager(view);
      } else if (view === "backup") {
        renderBackup();
      }
    } catch (error) { /* toast already shown by safe() */ }
  }

  function pageHead(title, subtitle, actionHtml) {
    return '<div class="page-head"><div><h1>' + text(title) + "</h1><p>" + text(subtitle || "") + "</p></div>" + (actionHtml || "") + "</div>";
  }

  function renderDashboard() {
    var el = document.getElementById("admin-content");
    var all = state.all;
    var recent = [];
    Object.keys(all).forEach(function (table) {
      (all[table] || []).forEach(function (row) {
        if (row.updated_at) recent.push({ table: table, row: row, at: row.updated_at });
      });
    });
    recent.sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
    recent = recent.slice(0, 5);

    var quick = ["projects", "gallery", "skills", "education", "interests", "social_links"];
    el.innerHTML =
      pageHead(T("dashboard"), T("tagline")) +
      '<div class="stat-grid">' +
        statBox(T("totalProjects"), (all.projects || []).length) +
        statBox(T("totalGallery"), (all.gallery || []).length) +
        statBox(T("totalSkills"), (all.skills || []).length) +
        '<div class="stat-box"><span>' + text(T("siteStatus")) + '</span><strong class="ok">' + text(T("connected")) + "</strong></div>" +
      "</div>" +
      '<div class="panel"><h2>' + text(T("quickActions")) + '</h2><div class="quick-grid">' +
        quick.map(function (key) {
          return '<button type="button" class="quick-card" data-go="' + key + '"><span aria-hidden="true">✎</span>' + text(T(key)) + "</button>";
        }).join("") +
        '<a class="quick-card" href="index.html?preview=bn" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🇧🇩</span>' + text(T("previewBn")) + "</a>" +
        '<a class="quick-card" href="index.html?preview=en" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🌐</span>' + text(T("previewEn")) + "</a>" +
      "</div></div>" +
      '<div class="panel"><h2>' + text(T("recent")) + '</h2><div class="recent-list">' +
        (recent.length ? recent.map(function (item) {
          var title = item.row.title_bn || item.row.title_en || item.row.name_bn || item.row.name_en || item.row.caption_bn || item.row.platform || item.table;
          return '<div class="recent-row"><strong>' + text(title) + '</strong><small>' + text(item.table) + " · " + text(new Date(item.at).toLocaleDateString()) + "</small></div>";
        }).join("") : '<p class="muted">' + text(T("empty")) + "</p>") +
      "</div></div>";

    el.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () { navigate(btn.getAttribute("data-go")); });
    });
  }

  function statBox(label, value) {
    return '<div class="stat-box"><span>' + text(label) + '</span><strong>' + text(String(value)) + "</strong></div>";
  }

  /* ---------- Single-record editors ---------- */
  function renderSingle(view, row) {
    var cfg = SINGLE[view];
    var el = document.getElementById("admin-content");
    el.innerHTML = pageHead(T(cfg.titleKey), T("tagline")) +
      '<div class="panel"><form id="single-form">' +
        fieldsHtml(cfg.fields, row || {}) +
        '<div class="modal-foot" style="margin:22px -22px -22px"><button type="submit" class="btn-primary">' + text(T("save")) + "</button></div>" +
      "</form></div>";
    bindImageFields(el, row || {});
    document.getElementById("single-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var button = e.target.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        var payload = await collect(cfg.fields, row || {}, el);
        payload.id = cfg.id;
        await safe(function () { return SB.upsert(cfg.table, [payload]); });
        toast(T("saved"));
      } catch (error) { /* handled */ }
      finally { button.disabled = false; }
    });
  }

  /* ---------- List managers ---------- */
  function renderManager(view) {
    var cfg = MANAGERS[view];
    var rows = state.rows || [];
    var el = document.getElementById("admin-content");

    el.innerHTML = pageHead(viewTitle(view), T("tagline"),
      '<button type="button" class="btn-primary" id="add-btn">+ ' + text(T("addNew")) + "</button>") +
      '<div class="manager-tools"><input type="search" id="manager-search" placeholder="' + text(T("search")) + '">' +
      '<select id="manager-filter"><option value="">' + text(T("allCategories")) + "</option>" +
        uniqueCategories(rows, cfg).map(function (c) { return '<option value="' + text(c) + '">' + text(I18n.categoryLabel(c)) + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="item-list" id="item-list"></div>';

    function draw() {
      var query = (document.getElementById("manager-search").value || "").toLowerCase();
      var filter = document.getElementById("manager-filter").value;
      var shown = rows.filter(function (row) {
        var hay = JSON.stringify(row).toLowerCase();
        var matchQuery = !query || hay.indexOf(query) !== -1;
        var matchFilter = !filter || String(row.category || "") === filter;
        return matchQuery && matchFilter;
      });
      var list = document.getElementById("item-list");
      if (!shown.length) {
        list.innerHTML = '<div class="empty-box">' + text(T("empty")) + "</div>";
        return;
      }
      list.innerHTML = shown.map(function (row, index) {
        var thumb = cfg.thumb ? row[cfg.thumb] : row.image_url;
        var visible = row.visible !== false;
        return '<article class="item-card" data-id="' + text(row.id) + '">' +
          (thumb ? '<img class="item-thumb" src="' + text(SB.publicUrl(thumb)) + '" alt="" loading="lazy">' : "") +
          '<div class="item-info"><strong>' + text(cfg.titleRow(row)) + "</strong>" +
            "<small>" + text(cfg.metaRow(row)) + "</small>" +
            '<span class="badge ' + (visible ? "ok" : "off") + '">' + text(T(visible ? "visible" : "hidden")) + "</span>" +
            (row.featured ? '<span class="badge star">' + text(T("featured")) + "</span>" : "") +
          "</div>" +
          '<div class="item-actions">' +
            '<button type="button" class="btn-small" data-act="edit">' + text(T("edit")) + "</button>" +
            '<button type="button" class="btn-small" data-act="toggle">' + text(T(visible ? "unpublish" : "publish")) + "</button>" +
            (view === "projects" ? '<button type="button" class="btn-small" data-act="feature">' + text(T(row.featured ? "unfeatured" : "featured")) + "</button>" : "") +
            '<button type="button" class="btn-small" data-act="up" aria-label="' + text(T("moveUp")) + '">↑</button>' +
            '<button type="button" class="btn-small" data-act="down" aria-label="' + text(T("moveDown")) + '">↓</button>' +
            '<button type="button" class="btn-small danger" data-act="delete">' + text(T("delete")) + "</button>" +
          "</div></article>";
      }).join("");
    }

    document.getElementById("manager-search").addEventListener("input", draw);
    document.getElementById("manager-filter").addEventListener("change", draw);
    document.getElementById("add-btn").addEventListener("click", function () { openForm(view, null); });
    document.getElementById("item-list").addEventListener("click", async function (e) {
      var button = e.target.closest("[data-act]");
      if (!button) return;
      var card = button.closest(".item-card");
      var id = card.getAttribute("data-id");
      var row = rows.filter(function (r) { return String(r.id) === id; })[0];
      if (!row) return;
      var act = button.getAttribute("data-act");
      if (act === "edit") { openForm(view, row); return; }
      if (act === "delete") { confirmDelete(view, row); return; }
      if (act === "toggle") {
        try {
          await safe(function () { return SB.update(cfg.table, row.id, { visible: row.visible === false }); });
          row.visible = row.visible === false;
          toast(T("saved")); draw();
        } catch (error) { /* handled */ }
        return;
      }
      if (act === "feature") {
        try {
          await safe(function () { return SB.update(cfg.table, row.id, { featured: !row.featured }); });
          row.featured = !row.featured;
          toast(T("saved")); draw();
        } catch (error) { /* handled */ }
        return;
      }
      if (act === "up" || act === "down") {
        var sorted = rows.slice().sort(function (a, b) { return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0); });
        var pos = sorted.findIndex(function (r) { return String(r.id) === id; });
        var other = pos + (act === "up" ? -1 : 1);
        if (pos < 0 || other < 0 || other >= sorted.length) return;
        var a = sorted[pos], b = sorted[other];
        var ao = Number(a.sort_order) || pos + 1, bo = Number(b.sort_order) || other + 1;
        try {
          await safe(function () { return SB.update(cfg.table, a.id, { sort_order: bo }); });
          await safe(function () { return SB.update(cfg.table, b.id, { sort_order: ao }); });
          rows = await safe(function () { return SB.select(cfg.table, { admin: true, order: "sort_order.asc" }); });
          state.rows = rows;
          draw();
          toast(T("saved"));
        } catch (error) { /* handled */ }
      }
    });
    draw();
  }

  function uniqueCategories(rows, cfg) {
    var seen = {};
    rows.forEach(function (r) { if (r.category) seen[r.category] = true; });
    return Object.keys(seen);
  }

  /* ---------- Modal form ---------- */
  function openModal(html) {
    var root = document.getElementById("modal-root");
    root.innerHTML = '<div class="modal">' + html + "</div>";
    root.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    var root = document.getElementById("modal-root");
    root.hidden = true;
    root.innerHTML = "";
    document.body.style.overflow = "";
  }

  function fieldsHtml(fields, row) {
    return '<div class="form-grid">' + fields.map(function (field) {
      var value = row[field.key];
      var id = "field-" + field.key;
      var cls = field.full ? " class=\"full\"" : "";
      var label = '<label' + cls + '><span>' + text(bi(field.label)) + "</span>";
      var control = "";
      if (field.type === "textarea") {
        control = '<textarea id="' + id + '" data-key="' + field.key + '">' + text(value == null ? "" : value) + "</textarea>";
      } else if (field.type === "bool") {
        var checked = value === true || value === "true" ? " checked" : "";
        return '<label' + cls + '><span>' + text(bi(field.label)) + '</span><input type="checkbox" id="' + id + '" data-key="' + field.key + '" data-type="bool"' + checked + "></label>";
      } else if (field.type === "select") {
        control = '<select id="' + id + '" data-key="' + field.key + '">' + field.options.map(function (opt) {
          return '<option value="' + text(opt[0]) + '"' + (String(value) === String(opt[0]) ? " selected" : "") + ">" + text(opt[1]) + "</option>";
        }).join("") + "</select>";
      } else if (field.type === "image") {
        control = '<div class="image-field">' +
          (value ? '<img class="image-preview" src="' + text(SB.publicUrl(value)) + '" alt="">' : "") +
          '<input type="file" accept="image/*" data-file-for="' + field.key + '">' +
          '<div class="progress" hidden><div></div></div>' +
          '<input type="text" id="' + id + '" data-key="' + field.key + '" value="' + text(value || "") + '" placeholder="' + text(T("imageUrl")) + '">' +
          '<small class="muted">' + text(T("uploadHint")) + "</small></div>";
        return '<div' + (field.full ? ' class="full"' : "") + '><span class="field-label">' + text(bi(field.label)) + "</span>" + control + "</div>";
      } else {
        var type = field.type === "number" ? "number" : (field.type === "url" ? "url" : "text");
        control = '<input type="' + type + '" id="' + id + '" data-key="' + field.key + '" value="' + text(value == null ? "" : value) + '"' + (field.required ? " required" : "") + ">";
      }
      return label + control + "</label>";
    }).join("") + "</div>";
  }

  function bindImageFields(scope, row) {
    scope.querySelectorAll("[data-file-for]").forEach(function (input) {
      input.addEventListener("change", async function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var wrapper = input.closest(".image-field");
        var fieldKey = input.getAttribute("data-file-for");
        var progress = wrapper.querySelector(".progress");
        var bar = progress.querySelector("div");
        progress.hidden = false;
        bar.style.width = "0%";
        input.disabled = true;
        try {
          var path = await safe(function () {
            return SB.upload(file, fieldKey === "photo_url" ? "profile" : "media", function (pct) {
              bar.style.width = pct + "%";
            });
          });
          var urlInput = wrapper.querySelector('input[type="text"]');
          urlInput.value = path;
          var preview = wrapper.querySelector(".image-preview");
          if (!preview) {
            preview = document.createElement("img");
            preview.className = "image-preview";
            wrapper.prepend(preview);
          }
          preview.src = SB.publicUrl(path);
          toast(T("uploading") + " ✓");
        } catch (error) { /* handled */ }
        finally { input.disabled = false; progress.hidden = true; }
      });
    });
  }

  async function collect(fields, row, scope) {
    var payload = Object.assign({}, row);
    fields.forEach(function (field) {
      if (field.key === "id") return;
      if (field.type === "bool") {
        var box = scope.querySelector('[data-key="' + field.key + '"][type="checkbox"]');
        payload[field.key] = box ? box.checked : false;
        return;
      }
      var selector = field.type === "image"
        ? 'input[type="text"][data-key="' + field.key + '"]'
        : '[data-key="' + field.key + '"]';
      var el = scope.querySelector(selector);
      if (!el || el.tagName === "INPUT" && el.type === "file") return;
      var value = el.value;
      if (field.key === "technologies") {
        payload[field.key] = String(value).split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      } else if (field.type === "number") {
        payload[field.key] = value === "" ? null : Number(value);
      } else if (field.type === "image") {
        payload[field.key] = value.trim();
      } else {
        payload[field.key] = value;
      }
    });
    ["id", "created_at", "updated_at"].forEach(function (k) {
      if (payload[k] === undefined) delete payload[k];
    });
    return payload;
  }

  function openForm(view, row) {
    var cfg = MANAGERS[view];
    if (!cfg) return;
    var isNew = !row;
    openModal(
      '<div class="modal-head"><h2>' + text(T(isNew ? "addNew" : "edit")) + " — " + text(viewTitle(view)) + '</h2><button type="button" class="modal-close" data-close>×</button></div>' +
      '<form id="manager-form"><div class="modal-body">' + fieldsHtml(cfg.fields, row || {}) + "</div>" +
      '<div class="modal-foot"><button type="button" class="btn-ghost" data-close>' + text(T("cancel")) + "</button>" +
      '<button type="submit" class="btn-primary">' + text(T("save")) + "</button></div></form>"
    );
    var form = document.getElementById("manager-form");
    bindImageFields(form, row || {});
    form.querySelectorAll("[data-close]").forEach(function (btn) { btn.addEventListener("click", closeModal); });
    document.querySelector(".modal-head [data-close]").addEventListener("click", closeModal);
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        var payload = await collect(cfg.fields, row || {}, form);
        if (isNew) delete payload.id;
        await safe(function () {
          return isNew ? SB.insert(cfg.table, [payload]) : SB.update(cfg.table, row.id, payload);
        });
        closeModal();
        toast(T("saved"));
        navigate(view);
      } catch (error) { button.disabled = false; }
    });
  }

  function confirmDelete(view, row) {
    var cfg = MANAGERS[view];
    openModal(
      '<div class="modal-head"><h2>' + text(T("confirmDelete")) + '</h2><button type="button" class="modal-close" data-close>×</button></div>' +
      '<div class="modal-body"><p>' + text(T("confirmDeleteText")) + "</p><p><strong>" + text(cfg.titleRow(row)) + "</strong></p></div>" +
      '<div class="modal-foot"><button type="button" class="btn-ghost" data-close>' + text(T("cancel")) + '</button>' +
      '<button type="button" class="btn-danger" id="confirm-delete">' + text(T("yesDelete")) + "</button></div>"
    );
    document.querySelectorAll(".modal [data-close]").forEach(function (btn) { btn.addEventListener("click", closeModal); });
    document.getElementById("confirm-delete").addEventListener("click", async function () {
      try {
        await safe(function () { return SB.remove(cfg.table, row.id); });
        if (row.image_url && !/^(https?:\/\/|assets\/|\/)/i.test(row.image_url)) {
          await SB.removeFile(row.image_url).catch(function () {});
        }
        closeModal();
        toast(T("deleted"));
        navigate(view);
      } catch (error) { /* handled */ }
    });
  }

  /* ---------- Backup ---------- */
  function renderBackup() {
    var el = document.getElementById("admin-content");
    el.innerHTML = pageHead(T("backup"), T("tagline")) +
      '<div class="panel"><h2>' + text(T("export")) + '</h2><p class="muted">' + text(T("tagline")) + "</p>" +
      '<button type="button" class="btn-primary" id="export-btn">↓ ' + text(T("export")) + "</button></div>" +
      '<div class="panel"><h2>' + text(T("restore")) + '</h2><p class="muted">' + text(T("restoreConfirm")) + "</p>" +
      '<input type="file" id="restore-file" accept="application/json,.json">' +
      '<div style="margin-top:14px"><button type="button" class="btn-ghost" id="restore-btn" disabled>↺ ' + text(T("restore")) + "</button></div></div>";

    document.getElementById("export-btn").addEventListener("click", async function () {
      try {
        var bundle = await safe(async function () {
          var results = await Promise.all(TABLES.map(function (t) { return SB.select(t, { admin: true }); }));
          var data = {};
          TABLES.forEach(function (t, i) { data[t] = results[i] || []; });
          return { version: 1, exported_at: new Date().toISOString(), data: data };
        });
        var blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "imran-rafi-backup-" + new Date().toISOString().slice(0, 10) + ".json";
        a.click();
        URL.revokeObjectURL(url);
        toast(T("export"));
      } catch (error) { /* handled */ }
    });

    var parsed = null;
    document.getElementById("restore-file").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      document.getElementById("restore-btn").disabled = !file;
      if (!file) { parsed = null; return; }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var json = JSON.parse(reader.result);
          if (!json || !json.data || typeof json.data !== "object") throw new Error("Invalid backup file");
          parsed = json;
        } catch (error) {
          parsed = null;
          toast(error.message, true);
          document.getElementById("restore-btn").disabled = true;
        }
      };
      reader.readAsText(file);
    });

    document.getElementById("restore-btn").addEventListener("click", function () {
      if (!parsed) return;
      openModal(
        '<div class="modal-head"><h2>' + text(T("restore")) + '</h2><button type="button" class="modal-close" data-close>×</button></div>' +
        '<div class="modal-body"><p>' + text(T("restoreConfirm")) + "</p></div>" +
        '<div class="modal-foot"><button type="button" class="btn-ghost" data-close>' + text(T("cancel")) + '</button>' +
        '<button type="button" class="btn-primary" id="do-restore">' + text(T("restore")) + "</button></div>"
      );
      document.querySelectorAll(".modal [data-close]").forEach(function (btn) { btn.addEventListener("click", closeModal); });
      document.getElementById("do-restore").addEventListener("click", async function () {
        var button = this;
        button.disabled = true;
        try {
          await safe(async function () {
            for (var i = 0; i < TABLES.length; i += 1) {
              var table = TABLES[i];
              var rows = parsed.data[table];
              if (Array.isArray(rows) && rows.length) await SB.upsert(table, rows);
            }
          });
          closeModal();
          toast(T("restored"));
          navigate("dashboard");
        } catch (error) { button.disabled = false; }
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
