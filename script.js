/**
 * script.js – Mangalam HDPE Pipes
 * ─────────────────────────────────────────────────────────────────
 * Sections (in order):
 *  1.  Navbar          — hamburger, dropdown, mobile-menu
 *  2.  Gallery         — prev/next arrows, thumbnails, touch swipe
 *  3.  Gallery Zoom    — lens + zoomed preview on hover (desktop)
 *  4.  Sticky Header   — appears past first fold, hides on scroll up
 *                        syncs product thumbnail with active slide
 *  5.  FAQ Accordion   — open/close with chevron animation
 *  6.  Applications    — drag/swipe + prev/next carousel
 *  7.  Process Tabs    — desktop tab switcher + mobile prev/next badge
 *  8.  Process Images  — mini carousel inside each process panel
 *  9.  Testimonials    — auto-scroll infinite loop, drag to scrub
 *  10. Modals          — open/close, Escape key, backdrop click
 * ─────────────────────────────────────────────────────────────────
 */

/* =============================================================
   1. NAVBAR
   Hamburger toggle, products dropdown, close-on-outside-click
============================================================= */
(function () {
  "use strict";

  var hamburger = document.getElementById("hamburger");
  var mobileNav = document.getElementById("mobileNav");

  /* Hamburger toggle */
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen);
      mobileNav.setAttribute("aria-hidden", !isOpen);
    });

    /* Close when any nav link is tapped */
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
      });
    });
  }

  /* Products dropdown (keyboard / touch users) */
  document.querySelectorAll(".dropdown__trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var menu = this.nextElementSibling;
      var isOpen = menu.classList.toggle("is-open");
      this.setAttribute("aria-expanded", isOpen);
    });
  });

  /* Close all dropdowns on outside click */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown__menu").forEach(function (m) {
        m.classList.remove("is-open");
      });
      document.querySelectorAll(".dropdown__trigger").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
      });
    }
  });
})();

/* =============================================================
   2. GALLERY CAROUSEL
   Prev/next arrows, thumbnail clicks, touch swipe
============================================================= */
(function () {
  "use strict";

  var track = document.getElementById("galleryTrack");
  var prevBtn = document.getElementById("galleryPrev");
  var nextBtn = document.getElementById("galleryNext");
  var thumbsWrap = document.getElementById("galleryThumbs");

  if (!track) return;

  var slides = track.querySelectorAll(".gallery__slide");
  var thumbs = thumbsWrap ? thumbsWrap.querySelectorAll(".gallery__thumb") : [];
  var total = slides.length;
  var current = 0;

  /* Initialise the global so the zoom module always has a valid value */
  window.__galleryCurrentSlide = 0;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = "translateX(-" + current * 100 + "%)";

    /* Keep global in sync — zoom module reads this as a fallback */
    window.__galleryCurrentSlide = current;

    thumbs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === current);
    });
  }

  if (prevBtn)
    prevBtn.addEventListener("click", function () {
      goTo(current - 1);
    });
  if (nextBtn)
    nextBtn.addEventListener("click", function () {
      goTo(current + 1);
    });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      goTo(parseInt(this.dataset.index, 10));
    });
  });

  /* Touch swipe */
  var touchStartX = 0;
  track.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        delta < 0 ? goTo(current + 1) : goTo(current - 1);
      }
    },
    { passive: true },
  );
})();

/* =============================================================
   3. GALLERY IMAGE ZOOM  — FIXED
   
   Bug that was present:
     The zoom preview always showed the first image because
     getActiveImg() tried to use window.__galleryCurrentSlide
     which could be undefined on page load (before any goTo call),
     and the sticky-header syncThumb was trying to parse a px value
     from a transform that actually uses percentage units.

   Fix:
     • Derive the active slide index directly from the track's
       CSS transform string (translateX(-N * 100%)), which is the
       single source of truth set by goTo() in Section 2.
     • window.__galleryCurrentSlide is now also initialised to 0
       in Section 2 and used only as a secondary fallback here.
============================================================= */
(function () {
  "use strict";

  var wrap = document.getElementById("galleryTrackWrap");
  var lens = document.getElementById("galleryZoomLens");
  var preview = document.getElementById("galleryZoomPreview");
  var track = document.getElementById("galleryTrack");

  if (!wrap || !lens || !preview || !track) return;

  var ZOOM = 2.5;
  var PW = 320; /* preview box width  — must match CSS */
  var PH = 320; /* preview box height — must match CSS */

  /* Capture all slide images once at init */
  var slideImgs = Array.from(track.querySelectorAll(".gallery__slide img"));

  /*
   * Read active index from the track's transform.
   * goTo() always writes:  track.style.transform = "translateX(-N*100%)"
   * So we parse the percentage to recover N.
   */
  function getActiveIndex() {
    var transform = track.style.transform || "";
    // Matches both "translateX(-100%)" and "translateX(-0%)"
    var match = transform.match(/translateX\(\s*-\s*(\d+(?:\.\d+)?)%\s*\)/);
    if (match) {
      return Math.round(parseFloat(match[1]) / 100);
    }
    // Secondary fallback: global set by goTo()
    if (typeof window.__galleryCurrentSlide === "number") {
      return window.__galleryCurrentSlide;
    }
    return 0;
  }

  function getActiveImg() {
    var idx = getActiveIndex();
    return slideImgs[idx] || slideImgs[0];
  }

  function onMove(e) {
    /* Don't show zoom when hovering arrow buttons */
    if (e.target.closest(".gallery__arrow")) {
      lens.style.display = "none";
      preview.style.display = "none";
      return;
    }

    var img = getActiveImg();
    if (!img || !img.src) return;

    /* Bounds of the visible image area */
    var rect = wrap.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    /* Clamp cursor inside image */
    var cx = Math.max(0, Math.min(x, rect.width));
    var cy = Math.max(0, Math.min(y, rect.height));

    /* Position the lens — CSS translate(-50%,-50%) centres it on cursor */
    lens.style.left = cx + "px";
    lens.style.top = cy + "px";
    lens.style.display = "block";

    /* Fraction (0–1) of the image the cursor is over */
    var fx = cx / rect.width;
    var fy = cy / rect.height;

    /* Dimensions of the zoomed image */
    var bw = rect.width * ZOOM;
    var bh = rect.height * ZOOM;

    /* Shift the background so the hovered point lands at the preview centre */
    var bx = PW / 2 - fx * bw;
    var by = PH / 2 - fy * bh;

    preview.style.backgroundImage = 'url("' + img.src + '")';
    preview.style.backgroundSize = bw + "px " + bh + "px";
    preview.style.backgroundPosition = bx + "px " + by + "px";
    preview.style.display = "block";
  }

  function onLeave() {
    lens.style.display = "none";
    preview.style.display = "none";
  }

  wrap.addEventListener("mousemove", onMove);
  wrap.addEventListener("mouseleave", onLeave);
})();

/* =============================================================
   4. STICKY HEADER
   Slides in above navbar after scrolling past first fold (100vh).
   Hides immediately on any upward scroll.
   Product-bar thumbnail syncs with the active gallery slide.
============================================================= */
(function () {
  "use strict";

  var stickyHeader = document.getElementById("stickyHeader");
  var stickyHamburg = document.getElementById("stickyHamburger");
  var mobileNav = document.getElementById("mobileNav");
  var galleryTrack = document.getElementById("galleryTrack");
  var thumbImg = document.getElementById("psbarThumbSticky");

  if (!stickyHeader) return;

  var lastScrollY = 0;
  var firstFold = window.innerHeight;
  var ticking = false;

  function updateHeader() {
    var y = window.scrollY || window.pageYOffset;
    var scrollingDown = y > lastScrollY;

    if (y > firstFold && scrollingDown) {
      stickyHeader.classList.add("is-visible");
      stickyHeader.setAttribute("aria-hidden", "false");
    } else if (!scrollingDown) {
      stickyHeader.classList.remove("is-visible");
      stickyHeader.setAttribute("aria-hidden", "true");
    }

    lastScrollY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "resize",
    function () {
      firstFold = window.innerHeight;
    },
    { passive: true },
  );

  /* Sticky hamburger opens the same mobileNav panel as main navbar */
  if (stickyHamburg && mobileNav) {
    stickyHamburg.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      stickyHamburg.classList.toggle("is-open", isOpen);
      stickyHamburg.setAttribute("aria-expanded", isOpen);
      mobileNav.setAttribute("aria-hidden", !isOpen);
    });
  }

  /* Dropdowns inside sticky header */
  stickyHeader.querySelectorAll(".dropdown__trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var menu = this.nextElementSibling;
      var isOpen = menu.classList.toggle("is-open");
      this.setAttribute("aria-expanded", isOpen);
    });
  });

  /*
   * Sync product-bar thumbnail with the active gallery slide.
   *
   * FIXED: The old code tried to parse a px value from the transform,
   * but goTo() writes percentage units ("translateX(-N*100%)"), so the
   * regex never matched and offset was always 0 → always showed slide 0.
   *
   * Fix: parse the percentage exactly the same way Section 3 does.
   */
  if (galleryTrack && thumbImg) {
    function syncThumb() {
      var transform = galleryTrack.style.transform || "";
      var match = transform.match(/translateX\(\s*-\s*(\d+(?:\.\d+)?)%\s*\)/);
      var slideIndex = match ? Math.round(parseFloat(match[1]) / 100) : 0;
      var imgs = galleryTrack.querySelectorAll(".gallery__slide img");
      var active = imgs[slideIndex] || imgs[0];
      if (active && active.src) thumbImg.src = active.src;
    }

    new MutationObserver(syncThumb).observe(galleryTrack, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
})();

/* =============================================================
   5. FAQ ACCORDION
   Clicking a question opens it and closes all others.
============================================================= */
(function () {
  "use strict";

  var faqItems = document.querySelectorAll(".faq__item");
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq__question");
    var chevron = item.querySelector(".faq__chevron");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      /* Close all */
      faqItems.forEach(function (el) {
        el.classList.remove("is-open");
        var q = el.querySelector(".faq__question");
        var c = el.querySelector(".faq__chevron");
        if (q) q.setAttribute("aria-expanded", "false");
        if (c)
          c.innerHTML =
            '<polyline points="6 9 12 15 18 9"/>'; /* chevron down */
      });

      /* Re-open if it was closed */
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (chevron)
          chevron.innerHTML =
            '<polyline points="18 15 12 9 6 15"/>'; /* chevron up */
      }
    });
  });
})();

/* =============================================================
   6. APPLICATIONS CAROUSEL
   Prev/next buttons + mouse drag + touch swipe.
============================================================= */
(function () {
  "use strict";

  var track = document.getElementById("appsTrack");
  var prevBtn = document.getElementById("appsPrev");
  var nextBtn = document.getElementById("appsNext");

  if (!track) return;

  var offset = 0;

  function cardWidth() {
    var card = track.querySelector(".apps__card");
    return card ? card.offsetWidth + 20 : 360; /* 20px ≈ 1.25rem gap */
  }

  function clamp(val) {
    return Math.max(
      0,
      Math.min(val, track.scrollWidth - track.parentElement.offsetWidth),
    );
  }

  function moveTo(val, animate) {
    offset = clamp(val);
    track.style.transition = animate
      ? "transform 0.45s cubic-bezier(.16,1,.3,1)"
      : "none";
    track.style.transform = "translateX(-" + offset + "px)";
  }

  if (prevBtn)
    prevBtn.addEventListener("click", function () {
      moveTo(offset - cardWidth(), true);
    });
  if (nextBtn)
    nextBtn.addEventListener("click", function () {
      moveTo(offset + cardWidth(), true);
    });

  /* Mouse drag */
  var isDragging = false,
    dragStartX = 0,
    dragStartOffset = 0;

  track.addEventListener("mousedown", function (e) {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartOffset = offset;
    track.style.transition = "none";
  });
  window.addEventListener("mousemove", function (e) {
    if (isDragging) moveTo(dragStartOffset - (e.clientX - dragStartX), false);
  });
  window.addEventListener("mouseup", function () {
    isDragging = false;
  });

  /* Touch swipe */
  var touchX = 0,
    touchOffset = 0;

  track.addEventListener(
    "touchstart",
    function (e) {
      touchX = e.touches[0].clientX;
      touchOffset = offset;
      track.style.transition = "none";
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    function (e) {
      moveTo(touchOffset - (e.touches[0].clientX - touchX), false);
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    function (e) {
      var delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 40) {
        moveTo(delta < 0 ? offset + cardWidth() : offset - cardWidth(), true);
      }
    },
    { passive: true },
  );
})();

/* =============================================================
   7. MANUFACTURING PROCESS
   Desktop: tab switcher.
   Mobile: prev/next buttons + step badge (tabs are hidden via CSS).
============================================================= */
(function () {
  "use strict";

  var tabs = document.querySelectorAll(".process__tab");
  var panels = document.querySelectorAll(".process__panel");
  var badge = document.getElementById("processMobileBadge");
  var prevBtn = document.getElementById("processPrev");
  var nextBtn = document.getElementById("processNext");
  var total = tabs.length;

  if (!total) return;

  var stepNames = Array.from(tabs).map(function (t) {
    return t.textContent.trim();
  });

  function activateStep(index) {
    tabs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    panels.forEach(function (p, i) {
      p.classList.toggle("is-active", i === index);
    });
    if (tabs[index]) {
      tabs[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    if (badge)
      badge.textContent =
        "Step " + (index + 1) + "/" + total + ": " + stepNames[index];
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === total - 1;
  }

  function getCurrentStep() {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].classList.contains("is-active")) return i;
    }
    return 0;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateStep(parseInt(this.dataset.step, 10));
    });
  });

  if (prevBtn)
    prevBtn.addEventListener("click", function () {
      var cur = getCurrentStep();
      if (cur > 0) activateStep(cur - 1);
    });
  if (nextBtn)
    nextBtn.addEventListener("click", function () {
      var cur = getCurrentStep();
      if (cur < total - 1) activateStep(cur + 1);
    });

  activateStep(0);
})();

/* =============================================================
   8. PROCESS PANEL IMAGE CAROUSEL
   Each panel has its own independent mini carousel.
============================================================= */
(function () {
  "use strict";

  document
    .querySelectorAll(".process__panel-image")
    .forEach(function (container) {
      var track = container.querySelector(".pimg__track");
      var slides = container.querySelectorAll(".pimg__slide");
      var dots = container.querySelectorAll(".pimg__dot");
      var prev = container.querySelector(".process__img-arrow--prev");
      var next = container.querySelector(".process__img-arrow--next");
      var total = slides.length;
      var current = 0;

      if (!track || total === 0) return;

      function goTo(idx) {
        current = (idx + total) % total;
        track.style.transform = "translateX(-" + current * 100 + "%)";
        dots.forEach(function (d, i) {
          d.classList.toggle("is-active", i === current);
        });
      }

      if (prev)
        prev.addEventListener("click", function () {
          goTo(current - 1);
        });
      if (next)
        next.addEventListener("click", function () {
          goTo(current + 1);
        });

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          goTo(parseInt(this.dataset.slide, 10));
        });
      });
    });
})();

/* =============================================================
   9. TESTIMONIALS CAROUSEL
   Auto-scrolls at a constant speed with seamless looping.
============================================================= */
(function () {
  "use strict";

  var outer = document.querySelector(".testimonials__outer");
  var track = document.querySelector(".testimonials__track");
  if (!outer || !track) return;

  var SPEED = 0.6;
  var offset = 0;
  var isPaused = false;
  var isDragging = false;
  var startX = 0;
  var startOffset = 0;

  /* Clone original cards for seamless loop */
  Array.from(track.children).forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
  track.style.width = "max-content";

  function maxLoop() {
    return track.scrollWidth / 2;
  }

  function tick() {
    if (!isPaused && !isDragging) {
      offset += SPEED;
      if (offset >= maxLoop()) offset -= maxLoop();
      track.style.transform = "translateX(-" + offset + "px)";
    }
    requestAnimationFrame(tick);
  }

  outer.addEventListener("mouseenter", function () {
    isPaused = true;
  });
  outer.addEventListener("mouseleave", function () {
    isPaused = false;
  });
  outer.addEventListener(
    "touchstart",
    function () {
      isPaused = true;
    },
    { passive: true },
  );
  outer.addEventListener(
    "touchend",
    function () {
      isPaused = false;
    },
    { passive: true },
  );

  track.addEventListener("mousedown", function (e) {
    isDragging = true;
    isPaused = true;
    startX = e.clientX;
    startOffset = offset;
    track.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    offset = startOffset + (startX - e.clientX);
    var max = maxLoop();
    if (offset < 0) offset += max;
    if (offset >= max) offset -= max;
    track.style.transform = "translateX(-" + offset + "px)";
  });

  window.addEventListener("mouseup", function () {
    if (!isDragging) return;
    isDragging = false;
    isPaused = false;
    track.style.cursor = "grab";
  });

  requestAnimationFrame(tick);
})();

/* =============================================================
  10. MODAL SYSTEM
============================================================= */
(function () {
  "use strict";

  function openModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("is-open");
      });
    });
    var first = overlay.querySelector("input");
    if (first)
      setTimeout(function () {
        first.focus();
      }, 250);
  }

  function closeModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    setTimeout(function () {
      overlay.setAttribute("hidden", "");
    }, 200);
  }

  document.querySelectorAll(".btn-download").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal("modalCatalogue");
    });
  });

  document
    .querySelectorAll(
      ".btn-request-quote, .btn-primary-cta, .btn-catalogue, .btn-request-cta",
    )
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal("modalCallBack");
      });
    });

  document.querySelectorAll(".modal__close").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeModal(this.dataset.close);
    });
  });

  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.is-open").forEach(function (o) {
        closeModal(o.id);
      });
    }
  });
})();
