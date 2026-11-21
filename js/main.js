/* ============================================================
   Imran Rafi — Portfolio Interactions
   Vanilla JavaScript, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header shadow on scroll + back to top ---------- */
  var header = document.getElementById("site-header");
  var backToTop = document.getElementById("back-to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 30);
    if (backToTop) backToTop.classList.toggle("visible", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("nav-open");
  }

  function openNav() {
    if (!nav || !navToggle) return;
    nav.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("nav-open");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      if (nav.classList.contains("open")) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) closeNav();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated skill bars ---------- */
  var skillFills = document.querySelectorAll(".skill-fill");

  function fillSkills(group) {
    group.querySelectorAll(".skill-fill").forEach(function (bar) {
      var level = parseInt(bar.getAttribute("data-level"), 10);
      if (!isNaN(level)) bar.style.width = Math.min(100, Math.max(0, level)) + "%";
    });
  }

  if ("IntersectionObserver" in window) {
    var skillObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fillSkills(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    document.querySelectorAll(".skill-group").forEach(function (group) {
      skillObserver.observe(group);
    });
  } else {
    document.querySelectorAll(".skill-group").forEach(fillSkills);
  }

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Project filtering ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");

      filterButtons.forEach(function (btn) {
        var active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });

      projectCards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-hidden", !show);
        if (show && !prefersReducedMotion) {
          card.animate(
            [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 350, easing: "ease-out" }
          );
        }
      });
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var currentIndex = 0;
  var lastFocused = null;

  function showImage(index) {
    if (!lightboxImg || !galleryItems.length) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentIndex];
    var img = item.querySelector("img");
    lightboxImg.src = img ? img.src : "";
    lightboxImg.alt = img ? img.alt : "Gallery image";
    lightboxCaption.textContent = item.getAttribute("data-caption") || "";
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.classList.remove("lightbox-open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () { openLightbox(index); });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || lightbox.hidden) {
      if (e.key === "Escape") closeNav();
      return;
    }
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") showImage(currentIndex + 1);
    else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  });

  /* ---------- Current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
