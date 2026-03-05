/**
 * script.js – Mangalam HDPE Pipes
 * Handles: hamburger menu toggle + products dropdown
 */

(function () {
  "use strict";

  /* --- Hamburger / mobile menu toggle --- */
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen);
      mobileNav.setAttribute("aria-hidden", !isOpen);
    });
  }

  /* --- Products dropdown (click for keyboard/touch users) --- */
  document.querySelectorAll(".dropdown__trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const menu = this.nextElementSibling;
      const isOpen = menu.classList.toggle("is-open");
      this.setAttribute("aria-expanded", isOpen);
    });
  });

  /* --- Close dropdown when clicking outside --- */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown__menu").forEach(function (menu) {
        menu.classList.remove("is-open");
      });
      document.querySelectorAll(".dropdown__trigger").forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
      });
    }
  });

  /* --- Close mobile menu when a link is tapped --- */
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
      });
    });
  }
})();

/* =============================================
   PRODUCT IMAGE GALLERY / CAROUSEL
   – prev/next arrows + thumbnail click
============================================= */
(function () {
  "use strict";

  const track = document.getElementById("galleryTrack");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");
  const thumbsWrap = document.getElementById("galleryThumbs");

  if (!track) return; // not on product page

  const slides = track.querySelectorAll(".gallery__slide");
  const thumbs = thumbsWrap
    ? thumbsWrap.querySelectorAll(".gallery__thumb")
    : [];
  const total = slides.length;
  let current = 0;

  /* Move to a given slide index */
  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = "translateX(-" + current * 100 + "%)";

    /* Update active thumbnail */
    thumbs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === current);
    });
  }

  /* Arrow buttons */
  if (prevBtn)
    prevBtn.addEventListener("click", function () {
      goTo(current - 1);
    });
  if (nextBtn)
    nextBtn.addEventListener("click", function () {
      goTo(current + 1);
    });

  /* Thumbnail clicks */
  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      goTo(parseInt(this.dataset.index, 10));
    });
  });

  /* Touch / swipe support on main image */
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

/* =============================================
   APPLICATIONS CAROUSEL
   – prev/next buttons + drag/swipe to scroll
============================================= */
(function () {
  "use strict";

  const track = document.getElementById("appsTrack");
  const prevBtn = document.getElementById("appsPrev");
  const nextBtn = document.getElementById("appsNext");

  if (!track) return;

  const CARD_WIDTH = () => {
    const card = track.querySelector(".apps__card");
    if (!card) return 360;
    const gap = 20; // 1.25rem gap
    return card.offsetWidth + gap;
  };

  let offset = 0;

  function clampOffset(val) {
    const maxScroll = track.scrollWidth - track.parentElement.offsetWidth;
    return Math.max(0, Math.min(val, maxScroll));
  }

  function moveTo(val, animate) {
    offset = clampOffset(val);
    track.style.transition = animate
      ? "transform 0.45s cubic-bezier(.16,1,.3,1)"
      : "none";
    track.style.transform = "translateX(-" + offset + "px)";
  }

  if (prevBtn)
    prevBtn.addEventListener("click", function () {
      moveTo(offset - CARD_WIDTH(), true);
    });
  if (nextBtn)
    nextBtn.addEventListener("click", function () {
      moveTo(offset + CARD_WIDTH(), true);
    });

  /* ── Drag to scroll (mouse) ── */
  var isDragging = false,
    startX = 0,
    startOffset = 0;

  track.addEventListener("mousedown", function (e) {
    isDragging = true;
    startX = e.clientX;
    startOffset = offset;
    track.style.transition = "none";
  });

  window.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    moveTo(startOffset - (e.clientX - startX), false);
  });

  window.addEventListener("mouseup", function () {
    isDragging = false;
  });

  /* ── Touch swipe ── */
  var touchStartX = 0,
    touchStartOffset = 0;

  track.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartOffset = offset;
      track.style.transition = "none";
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    function (e) {
      moveTo(touchStartOffset - (e.touches[0].clientX - touchStartX), false);
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      /* Snap to nearest card after swipe */
      if (Math.abs(delta) > 40) {
        moveTo(delta < 0 ? offset + CARD_WIDTH() : offset - CARD_WIDTH(), true);
      }
    },
    { passive: true },
  );
})();

/* =============================================
   MANUFACTURING PROCESS – TAB SWITCHER
   Clicking a tab shows the matching panel
============================================= */
(function () {
  "use strict";

  const tabs = document.querySelectorAll(".process__tab");
  const panels = document.querySelectorAll(".process__panel");

  if (!tabs.length) return;

  function activateStep(index) {
    /* Update tabs */
    tabs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    /* Update panels */
    panels.forEach(function (p, i) {
      p.classList.toggle("is-active", i === index);
    });

    /* Scroll the active tab into view inside the scrollable row */
    if (tabs[index]) {
      tabs[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateStep(parseInt(this.dataset.step, 10));
    });
  });
})();

/* =============================================
   TESTIMONIALS CAROUSEL
   – auto-scrolling, pauses on hover/drag, loops seamlessly
============================================= */
(function () {
  "use strict";

  var outer = document.querySelector(".testimonials__outer");
  var track = document.querySelector(".testimonials__track");
  if (!track || !outer) return;

  var SPEED = 0.6; /* px per animation frame — adjust for faster/slower */
  var offset = 0;
  var isPaused = false;
  var isDragging = false;
  var startX = 0;
  var startOffset = 0;
  var rafId = null;

  /* Clone all cards for seamless infinite loop */
  var cards = Array.from(track.children);
  cards.forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  function getMaxLoop() {
    /* Scroll only through the original set, then reset */
    return track.scrollWidth / 2;
  }

  function autoScroll() {
    if (!isPaused && !isDragging) {
      offset += SPEED;
      if (offset >= getMaxLoop()) {
        offset -= getMaxLoop(); /* seamless jump back */
      }
      track.style.transform = "translateX(-" + offset + "px)";
    }
    rafId = requestAnimationFrame(autoScroll);
  }

  /* Pause on hover */
  outer.addEventListener("mouseenter", function () {
    isPaused = true;
  });
  outer.addEventListener("mouseleave", function () {
    isPaused = false;
  });

  /* Pause on touch */
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

  /* Drag to manually scroll, then resume auto */
  track.addEventListener("mousedown", function (e) {
    isDragging = true;
    isPaused = true;
    startX = e.clientX;
    startOffset = offset;
    track.style.transition = "none";
    track.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    var delta = startX - e.clientX;
    offset = startOffset + delta;
    /* Wrap offset within loop range */
    var max = getMaxLoop();
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

  /* Remove fixed width so track can grow with cloned cards */
  track.style.width = "max-content";

  /* Kick off */
  rafId = requestAnimationFrame(autoScroll);
})();

/* =============================================
   MODAL SYSTEM
   Modal 1 (Catalogue)  → "Download Full Technical Datasheet"
   Modal 2 (Call Back)  → "Request a Quote" / "Get Custom Quote"
============================================= */
(function () {
  "use strict";

  /* ── Helpers ── */
  function openModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    /* Trigger CSS transition on next frame */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("is-open");
      });
    });
    /* Focus first input */
    var firstInput = overlay.querySelector("input");
    if (firstInput)
      setTimeout(function () {
        firstInput.focus();
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

  /* ── Open triggers ── */

  /* "Download Full Technical Datasheet" button → Catalogue modal */
  document.querySelectorAll(".btn-download").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal("modalCatalogue");
    });
  });

  /* "Request a Quote" / "Get Custom Quote" / "Request Catalogue" buttons → Call-back modal */
  document
    .querySelectorAll(
      ".btn-request-quote, .btn-primary-cta, .btn-catalogue, .btn-request-cta",
    )
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal("modalCallBack");
      });
    });

  /* ── Close triggers ── */

  /* × buttons */
  document.querySelectorAll(".modal__close").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeModal(this.dataset.close);
    });
  });

  /* Click on overlay backdrop */
  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  /* Escape key */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal-overlay.is-open")
        .forEach(function (overlay) {
          closeModal(overlay.id);
        });
    }
  });
})();

/* =============================================
   STICKY HEADER
   Shows after scrolling past first fold (100vh).
   Hides when scrolling back up toward the top.
============================================= */
(function () {
  "use strict";

  var stickyHeader = document.getElementById("stickyHeader");
  var stickyHamburg = document.getElementById("stickyHamburger");
  var mobileNav = document.getElementById("mobileNav");

  if (!stickyHeader) return;

  var lastScrollY = 0;
  var firstFold = window.innerHeight; /* 100vh threshold */
  var ticking = false;

  function updateHeader() {
    var currentY = window.scrollY || window.pageYOffset;
    var scrollingDown = currentY > lastScrollY;

    /* Only show after user has scrolled past the first fold */
    if (currentY > firstFold && scrollingDown) {
      /* Scrolling down past fold — show sticky header */
      stickyHeader.classList.add("is-visible");
      stickyHeader.setAttribute("aria-hidden", "false");
    } else if (!scrollingDown || currentY <= firstFold) {
      /* Scrolling up OR back near the top — hide sticky header */
      stickyHeader.classList.remove("is-visible");
      stickyHeader.setAttribute("aria-hidden", "true");
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      /* Throttle with requestAnimationFrame */
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );

  /* Recalculate first-fold threshold on resize */
  window.addEventListener(
    "resize",
    function () {
      firstFold = window.innerHeight;
    },
    { passive: true },
  );

  /* Sticky hamburger opens the same mobileNav panel */
  if (stickyHamburg && mobileNav) {
    stickyHamburg.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      stickyHamburg.classList.toggle("is-open", isOpen);
      stickyHamburg.setAttribute("aria-expanded", isOpen);
      mobileNav.setAttribute("aria-hidden", !isOpen);
    });
  }

  /* Sticky header dropdowns — reuse same logic */
  stickyHeader.querySelectorAll(".dropdown__trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var menu = this.nextElementSibling;
      var isOpen = menu.classList.toggle("is-open");
      this.setAttribute("aria-expanded", isOpen);
    });
  });
})();

/* =============================================
   PROCESS SECTION — MOBILE PREV/NEXT + BADGE
============================================= */
(function () {
  "use strict";

  var tabs = document.querySelectorAll(".process__tab");
  var panels = document.querySelectorAll(".process__panel");
  var badge = document.getElementById("processMobileBadge");
  var prevBtn = document.getElementById("processPrev");
  var nextBtn = document.getElementById("processNext");
  var total = tabs.length;

  if (!prevBtn || !nextBtn || !badge) return;

  var stepNames = Array.from(tabs).map(function (t) {
    return t.textContent.trim();
  });

  function updateBadge(index) {
    badge.textContent =
      "Step " + (index + 1) + "/" + total + ": " + stepNames[index];
  }

  function getCurrentStep() {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].classList.contains("is-active")) return i;
    }
    return 0;
  }

  function goToStep(index) {
    /* Reuse the existing tab activateStep logic */
    tabs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    panels.forEach(function (p, i) {
      p.classList.toggle("is-active", i === index);
    });
    updateBadge(index);
    /* Update disabled state */
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
  }

  prevBtn.addEventListener("click", function () {
    var cur = getCurrentStep();
    if (cur > 0) goToStep(cur - 1);
  });

  nextBtn.addEventListener("click", function () {
    var cur = getCurrentStep();
    if (cur < total - 1) goToStep(cur + 1);
  });

  /* Keep badge in sync when desktop tabs are clicked */
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var idx = parseInt(this.dataset.step, 10);
      updateBadge(idx);
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === total - 1;
    });
  });

  /* Init */
  updateBadge(0);
  prevBtn.disabled = true;
})();

/* =============================================
   PROCESS PANEL — IMAGE MINI CAROUSEL
   Each panel-image div has prev/next arrows + dots
============================================= */
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
        /* Disable arrows at ends (optional — loops by default) */
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

/* =============================================
   PRODUCT IMAGE GALLERY / CAROUSEL
   – prev/next arrows + thumbnail click
============================================= */
(function () {
  "use strict";

  const track = document.getElementById("galleryTrack");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");
  const thumbsWrap = document.getElementById("galleryThumbs");

  if (!track) return; // not on product page

  const slides = track.querySelectorAll(".gallery__slide");
  const thumbs = thumbsWrap
    ? thumbsWrap.querySelectorAll(".gallery__thumb")
    : [];
  const total = slides.length;
  let current = 0;

  /* Move to a given slide index */
  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = "translateX(-" + current * 100 + "%)";

    /* Update active thumbnail */
    thumbs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === current);
    });
  }

  /* Arrow buttons */
  if (prevBtn)
    prevBtn.addEventListener("click", function () {
      goTo(current - 1);
    });
  if (nextBtn)
    nextBtn.addEventListener("click", function () {
      goTo(current + 1);
    });

  /* Thumbnail clicks */
  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      goTo(parseInt(this.dataset.index, 10));
    });
  });

  /* Touch / swipe support on main image */
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

/* =============================================
   FAQ ACCORDION
   – clicking a question opens it and closes others
============================================= */
(function () {
  "use strict";

  const faqItems = document.querySelectorAll(".faq__item");
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    const btn = item.querySelector(".faq__question");
    if (!btn) return;

    btn.addEventListener("click", function () {
      // ✅ Capture BEFORE the loop mutates anything
      const isOpen = item.classList.contains("is-open");

      // Close ALL items including this one
      faqItems.forEach(function (el) {
        el.classList.remove("is-open");
        const q = el.querySelector(".faq__question");
        if (q) q.setAttribute("aria-expanded", "false");
      });

      // Only reopen if it was closed before the click
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
})();

/* =============================================
   APPLICATIONS CAROUSEL
   – prev/next buttons + drag/swipe to scroll
============================================= */
(function () {
  "use strict";

  const track = document.getElementById("appsTrack");
  const prevBtn = document.getElementById("appsPrev");
  const nextBtn = document.getElementById("appsNext");

  if (!track) return;

  const CARD_WIDTH = () => {
    const card = track.querySelector(".apps__card");
    if (!card) return 360;
    const gap = 20; // 1.25rem gap
    return card.offsetWidth + gap;
  };

  let offset = 0;

  function clampOffset(val) {
    const maxScroll = track.scrollWidth - track.parentElement.offsetWidth;
    return Math.max(0, Math.min(val, maxScroll));
  }

  function moveTo(val, animate) {
    offset = clampOffset(val);
    track.style.transition = animate
      ? "transform 0.45s cubic-bezier(.16,1,.3,1)"
      : "none";
    track.style.transform = "translateX(-" + offset + "px)";
  }

  if (prevBtn)
    prevBtn.addEventListener("click", function () {
      moveTo(offset - CARD_WIDTH(), true);
    });
  if (nextBtn)
    nextBtn.addEventListener("click", function () {
      moveTo(offset + CARD_WIDTH(), true);
    });

  /* ── Drag to scroll (mouse) ── */
  var isDragging = false,
    startX = 0,
    startOffset = 0;

  track.addEventListener("mousedown", function (e) {
    isDragging = true;
    startX = e.clientX;
    startOffset = offset;
    track.style.transition = "none";
  });

  window.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    moveTo(startOffset - (e.clientX - startX), false);
  });

  window.addEventListener("mouseup", function () {
    isDragging = false;
  });

  /* ── Touch swipe ── */
  var touchStartX = 0,
    touchStartOffset = 0;

  track.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartOffset = offset;
      track.style.transition = "none";
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    function (e) {
      moveTo(touchStartOffset - (e.touches[0].clientX - touchStartX), false);
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      /* Snap to nearest card after swipe */
      if (Math.abs(delta) > 40) {
        moveTo(delta < 0 ? offset + CARD_WIDTH() : offset - CARD_WIDTH(), true);
      }
    },
    { passive: true },
  );
})();

/* =============================================
   MANUFACTURING PROCESS – TAB SWITCHER
   Clicking a tab shows the matching panel
============================================= */
(function () {
  "use strict";

  const tabs = document.querySelectorAll(".process__tab");
  const panels = document.querySelectorAll(".process__panel");

  if (!tabs.length) return;

  function activateStep(index) {
    /* Update tabs */
    tabs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    /* Update panels */
    panels.forEach(function (p, i) {
      p.classList.toggle("is-active", i === index);
    });

    /* Scroll the active tab into view inside the scrollable row */
    if (tabs[index]) {
      tabs[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateStep(parseInt(this.dataset.step, 10));
    });
  });
})();

/* =============================================
   TESTIMONIALS CAROUSEL
   – auto-scrolling, pauses on hover/drag, loops seamlessly
============================================= */
(function () {
  "use strict";

  var outer = document.querySelector(".testimonials__outer");
  var track = document.querySelector(".testimonials__track");
  if (!track || !outer) return;

  var SPEED = 0.6; /* px per animation frame — adjust for faster/slower */
  var offset = 0;
  var isPaused = false;
  var isDragging = false;
  var startX = 0;
  var startOffset = 0;
  var rafId = null;

  /* Clone all cards for seamless infinite loop */
  var cards = Array.from(track.children);
  cards.forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  function getMaxLoop() {
    /* Scroll only through the original set, then reset */
    return track.scrollWidth / 2;
  }

  function autoScroll() {
    if (!isPaused && !isDragging) {
      offset += SPEED;
      if (offset >= getMaxLoop()) {
        offset -= getMaxLoop(); /* seamless jump back */
      }
      track.style.transform = "translateX(-" + offset + "px)";
    }
    rafId = requestAnimationFrame(autoScroll);
  }

  /* Pause on hover */
  outer.addEventListener("mouseenter", function () {
    isPaused = true;
  });
  outer.addEventListener("mouseleave", function () {
    isPaused = false;
  });

  /* Pause on touch */
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

  /* Drag to manually scroll, then resume auto */
  track.addEventListener("mousedown", function (e) {
    isDragging = true;
    isPaused = true;
    startX = e.clientX;
    startOffset = offset;
    track.style.transition = "none";
    track.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    var delta = startX - e.clientX;
    offset = startOffset + delta;
    /* Wrap offset within loop range */
    var max = getMaxLoop();
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

  /* Remove fixed width so track can grow with cloned cards */
  track.style.width = "max-content";

  /* Kick off */
  rafId = requestAnimationFrame(autoScroll);
})();

/* =============================================
   MODAL SYSTEM
   Modal 1 (Catalogue)  → "Download Full Technical Datasheet"
   Modal 2 (Call Back)  → "Request a Quote" / "Get Custom Quote"
============================================= */
(function () {
  "use strict";

  /* ── Helpers ── */
  function openModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    /* Trigger CSS transition on next frame */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("is-open");
      });
    });
    /* Focus first input */
    var firstInput = overlay.querySelector("input");
    if (firstInput)
      setTimeout(function () {
        firstInput.focus();
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

  /* ── Open triggers ── */

  /* "Download Full Technical Datasheet" button → Catalogue modal */
  document.querySelectorAll(".btn-download").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal("modalCatalogue");
    });
  });

  /* "Request a Quote" / "Get Custom Quote" / "Request Catalogue" buttons → Call-back modal */
  document
    .querySelectorAll(
      ".btn-request-quote, .btn-primary-cta, .btn-catalogue, .btn-request-cta",
    )
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal("modalCallBack");
      });
    });

  /* ── Close triggers ── */

  /* × buttons */
  document.querySelectorAll(".modal__close").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeModal(this.dataset.close);
    });
  });

  /* Click on overlay backdrop */
  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  /* Escape key */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal-overlay.is-open")
        .forEach(function (overlay) {
          closeModal(overlay.id);
        });
    }
  });
})();

/* =============================================
   STICKY HEADER
   Shows after scrolling past first fold (100vh).
   Hides when scrolling back up toward the top.
============================================= */
(function () {
  "use strict";

  var stickyHeader = document.getElementById("stickyHeader");
  var stickyHamburg = document.getElementById("stickyHamburger");
  var mobileNav = document.getElementById("mobileNav");

  if (!stickyHeader) return;

  var lastScrollY = 0;
  var firstFold = window.innerHeight; /* 100vh threshold */
  var ticking = false;

  function updateHeader() {
    var currentY = window.scrollY || window.pageYOffset;
    var scrollingDown = currentY > lastScrollY;

    /* Only show after user has scrolled past the first fold */
    if (currentY > firstFold && scrollingDown) {
      /* Scrolling down past fold — show sticky header */
      stickyHeader.classList.add("is-visible");
      stickyHeader.setAttribute("aria-hidden", "false");
    } else if (!scrollingDown || currentY <= firstFold) {
      /* Scrolling up OR back near the top — hide sticky header */
      stickyHeader.classList.remove("is-visible");
      stickyHeader.setAttribute("aria-hidden", "true");
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      /* Throttle with requestAnimationFrame */
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );

  /* Recalculate first-fold threshold on resize */
  window.addEventListener(
    "resize",
    function () {
      firstFold = window.innerHeight;
    },
    { passive: true },
  );

  /* Sticky hamburger opens the same mobileNav panel */
  if (stickyHamburg && mobileNav) {
    stickyHamburg.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      stickyHamburg.classList.toggle("is-open", isOpen);
      stickyHamburg.setAttribute("aria-expanded", isOpen);
      mobileNav.setAttribute("aria-hidden", !isOpen);
    });
  }

  /* Sticky header dropdowns — reuse same logic */
  stickyHeader.querySelectorAll(".dropdown__trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var menu = this.nextElementSibling;
      var isOpen = menu.classList.toggle("is-open");
      this.setAttribute("aria-expanded", isOpen);
    });
  });
})();

/* =============================================
   PROCESS SECTION — MOBILE PREV/NEXT + BADGE
============================================= */
(function () {
  "use strict";

  var tabs = document.querySelectorAll(".process__tab");
  var panels = document.querySelectorAll(".process__panel");
  var badge = document.getElementById("processMobileBadge");
  var prevBtn = document.getElementById("processPrev");
  var nextBtn = document.getElementById("processNext");
  var total = tabs.length;

  if (!prevBtn || !nextBtn || !badge) return;

  var stepNames = Array.from(tabs).map(function (t) {
    return t.textContent.trim();
  });

  function updateBadge(index) {
    badge.textContent =
      "Step " + (index + 1) + "/" + total + ": " + stepNames[index];
  }

  function getCurrentStep() {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].classList.contains("is-active")) return i;
    }
    return 0;
  }

  function goToStep(index) {
    /* Reuse the existing tab activateStep logic */
    tabs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    panels.forEach(function (p, i) {
      p.classList.toggle("is-active", i === index);
    });
    updateBadge(index);
    /* Update disabled state */
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
  }

  prevBtn.addEventListener("click", function () {
    var cur = getCurrentStep();
    if (cur > 0) goToStep(cur - 1);
  });

  nextBtn.addEventListener("click", function () {
    var cur = getCurrentStep();
    if (cur < total - 1) goToStep(cur + 1);
  });

  /* Keep badge in sync when desktop tabs are clicked */
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var idx = parseInt(this.dataset.step, 10);
      updateBadge(idx);
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === total - 1;
    });
  });

  /* Init */
  updateBadge(0);
  prevBtn.disabled = true;
})();

/* =============================================
   PROCESS PANEL — IMAGE MINI CAROUSEL
   Each panel-image div has prev/next arrows + dots
============================================= */
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
        /* Disable arrows at ends (optional — loops by default) */
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

/* =============================================
   GALLERY IMAGE ZOOM
   Lens on image + zoomed preview to the right
============================================= */
(function () {
  "use strict";

  var galleryMain = document.getElementById("galleryMain");
  var trackWrap = document.getElementById("galleryTrackWrap");
  var lens = document.getElementById("galleryZoomLens");
  var preview = document.getElementById("galleryZoomPreview");
  var track = document.getElementById("galleryTrack");

  if (!galleryMain || !lens || !preview || !track) return;

  var ZOOM = 2.5;
  var LENS_W = 120;
  var LENS_H = 120;

  function getActiveImg() {
    var transform = track.style.transform || "";
    var match = transform.match(/translateX\(-?(\d+(?:\.\d+)?)px\)/);
    var offset = match ? parseFloat(match[1]) : 0;
    var slideW = (trackWrap || galleryMain).offsetWidth;
    var index = Math.round(offset / slideW);
    var slides = track.querySelectorAll(".gallery__slide img");
    return slides[index] || slides[0];
  }

  function showZoom(e) {
    var img = getActiveImg();
    if (!img || !img.naturalWidth) return;

    var rect = galleryMain.getBoundingClientRect();

    /* Raw mouse position inside the image */
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    /* Clamp so lens stays fully inside */
    var lx = Math.max(LENS_W / 2, Math.min(x, rect.width - LENS_W / 2));
    var ly = Math.max(LENS_H / 2, Math.min(y, rect.height - LENS_H / 2));

    /* Move lens */
    lens.style.left = lx + "px";
    lens.style.top = ly + "px";
    lens.style.display = "block";

    /* What fraction of the image (0-1) is the lens centre pointing at */
    var fx = lx / rect.width;
    var fy = ly / rect.height;

    /* Preview: image drawn at ZOOM× size, shifted so the hovered
       point appears at the centre of the preview box */
    var pw = preview.offsetWidth || 320;
    var ph = preview.offsetHeight || 320;
    var bw = rect.width * ZOOM;
    var bh = rect.height * ZOOM;

    /* background-position: shift so hovered point is centred in preview */
    var bx = pw / 2 - fx * bw;
    var by = ph / 2 - fy * bh;

    preview.style.backgroundImage = 'url("' + img.src + '")';
    preview.style.backgroundSize = bw + "px " + bh + "px";
    preview.style.backgroundPosition = bx + "px " + by + "px";
    preview.style.display = "block";
  }

  function hideZoom() {
    lens.style.display = "none";
    preview.style.display = "none";
  }

  /* Listen on galleryMain — lens is its direct child so no overflow clipping */
  galleryMain.addEventListener("mousemove", showZoom);
  galleryMain.addEventListener("mouseleave", hideZoom);
})();

/* =============================================
   STICKY HEADER — SCROLL TRIGGER + THUMB SYNC
   Shows after scrolling past first fold (100vh).
   Desktop: shows nav. Mobile: shows product summary.
   Disappears when scrolling back to top.
============================================= */
(function () {
  "use strict";

  var stickyHeader = document.getElementById("stickyHeader");
  var track = document.getElementById("galleryTrack");
  var thumbImg = document.getElementById("psbarThumbSticky");

  if (!stickyHeader) return;

  var lastScrollY = 0;
  var ticking = false;
  var threshold = window.innerHeight; /* first fold = 100vh */

  window.addEventListener("resize", function () {
    threshold = window.innerHeight;
  });

  function update() {
    var scrollY = window.pageYOffset;

    if (scrollY > threshold && scrollY > lastScrollY) {
      /* Past fold AND scrolling down → show */
      stickyHeader.classList.add("is-visible");
      stickyHeader.removeAttribute("aria-hidden");
    } else if (scrollY < lastScrollY) {
      /* Scrolling up (any position) → hide */
      stickyHeader.classList.remove("is-visible");
      stickyHeader.setAttribute("aria-hidden", "true");
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );

  /* Sync thumbnail with active gallery slide */
  function syncThumb() {
    if (!thumbImg || !track) return;
    var transform = track.style.transform || "";
    var match = transform.match(/translateX\(-?(\d+(?:\.\d+)?)px\)/);
    var offset = match ? parseFloat(match[1]) : 0;
    var slideW = track.parentElement ? track.parentElement.offsetWidth : 0;
    var index = slideW ? Math.round(offset / slideW) : 0;
    var imgs = track.querySelectorAll(".gallery__slide img");
    var active = imgs[index] || imgs[0];
    if (active && active.src) thumbImg.src = active.src;
  }

  if (track) {
    new MutationObserver(syncThumb).observe(track, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
})();
