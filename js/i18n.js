/* ============================================================
   Bilingual language layer — Bengali default, English optional.
   Preference is stored locally and applied without a reload.
   ============================================================ */
(function (global) {
  "use strict";

  var STORAGE_KEY = "ir_lang";
  var currentLang = "bn";

  function dictionary(lang) {
    return (global.I18N && global.I18N[lang]) || (global.I18N && global.I18N.bn) || {};
  }

  function supported(lang) { return lang === "en" || lang === "bn"; }

  function stored() {
    try { return global.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function detect() {
    var saved = stored();
    if (supported(saved)) return saved;
    return "bn";
  }

  function current() { return currentLang; }

  function t(path) {
    var parts = String(path).split(".");
    var node = dictionary(currentLang);
    for (var i = 0; i < parts.length; i += 1) {
      if (!node || typeof node !== "object") return "";
      node = node[parts[i]];
    }
    if (typeof node === "string" || typeof node === "number") return String(node);
    /* fall back to English for missing keys */
    var en = dictionary("en");
    for (var j = 0; j < parts.length; j += 1) {
      if (!en || typeof en !== "object") return "";
      en = en[parts[j]];
    }
    return typeof en === "string" ? en : "";
  }

  function raw(path) {
    var parts = String(path).split(".");
    var node = dictionary(currentLang);
    for (var i = 0; i < parts.length; i += 1) {
      if (!node || typeof node !== "object") return null;
      node = node[parts[i]];
    }
    return node == null ? null : node;
  }

  function localize(row, field, lang) {
    if (!row) return "";
    var l = lang || currentLang;
    return row[field + "_" + l] || row[field + "_en"] || row[field + "_bn"] || "";
  }

  function categoryLabel(value) {
    if (!value) return "";
    var key = String(value).toLowerCase();
    var direct = t("categories." + key);
    return direct || String(value);
  }

  function applyStatic(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (value) el.textContent = value;
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n-aria"));
      if (value) el.setAttribute("aria-label", value);
    });
    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n-title"));
      if (value) el.setAttribute("title", value);
    });
  }

  function set(lang, silent) {
    if (!supported(lang)) return;
    currentLang = lang;
    try { global.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* noop */ }
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    applyStatic(document);
    if (!silent) {
      document.dispatchEvent(new CustomEvent("app:languagechange", { detail: { lang: lang } }));
    }
  }

  function init() {
    currentLang = detect();
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute("data-lang", currentLang);
    applyStatic(document);
  }

  function setMeta(settings) {
    var lang = currentLang;
    var title = (settings && settings["title_" + lang]) || t("meta.title");
    var description = (settings && settings["description_" + lang]) || t("meta.description");
    var ogImage = (settings && settings.og_image_url) || "assets/og-image.png";
    if (/^https?:\/\//i.test(ogImage) === false && ogImage.indexOf("assets/") === 0) {
      ogImage = "https://rmd734412-web.github.io/imran-rafi/" + ogImage;
    }
    document.title = title;
    setMetaContent("name", "description", description);
    setMetaContent("name", "keywords", t("meta.keywords"));
    setMetaContent("property", "og:title", title);
    setMetaContent("property", "og:description", description);
    setMetaContent("property", "og:image", ogImage);
    setMetaContent("property", "og:locale", lang === "bn" ? "bn_BD" : "en_US");
    setMetaContent("name", "twitter:title", title);
    setMetaContent("name", "twitter:description", description);
    setMetaContent("name", "twitter:image", ogImage);
  }

  function setMetaContent(attr, name, value) {
    var el = document.querySelector("meta[" + attr + "='" + name + "']");
    if (el && value) el.setAttribute("content", value);
  }

  global.AppI18n = {
    init: init,
    current: current,
    set: set,
    t: t,
    raw: raw,
    localize: localize,
    categoryLabel: categoryLabel,
    applyStatic: applyStatic,
    setMeta: setMeta
  };
})(window);
