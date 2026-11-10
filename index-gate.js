/* ==================================================================
   INDEX-GATE.JS - GATE FOR index.html ONLY - NOT sign.html
   File: index-gate.js - for index.html only
   Connects sign.html -> index.html
   sign.html saves: localStorage konnekt_signup_progress = { loggedIn: true, step: "main" }
   This file checks that. If no signup -> go sign.html. If signup done -> stay.
   First Splash: cannot copy text or image.
   Sidebar-section: hidden first, show only after gate passes.
   PWA: after 30s, show slide up, only if not installed, only if Not Now not in last 2 days.
   No backend now - localStorage fakes backend. Backend later will replace loadProgress().
   ================================================================== */

(function () {
  "use strict";

  /* ================= 0. HELPERS ================= */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ================= 1. NO STRETCHING / ZOOMING - FOR ALL ================= */
  // Block pinch zoom on iPhone
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturechange", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("gestureend", function (e) { e.preventDefault(); }, { passive: false });

  // Block Ctrl + wheel zoom (desktop)
  document.addEventListener("wheel", function (e) {
    if (e.ctrlKey) { e.preventDefault(); }
  }, { passive: false });

  // Block Ctrl + + / - / 0 zoom (desktop)
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && ["+", "-", "0", "=", "_"].includes(e.key)) {
      e.preventDefault();
    }
  });

  // Block double-tap zoom on mobile
  let lastTouchEnd = 0;
  document.addEventListener("touchend", function (e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) { e.preventDefault(); }
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { passive: false });

  /* ================= 2. FIRST SPLASH - CANNOT COPY TEXT OR IMAGE ================= */
  // Same lock as sign.html. User can see it, but cannot copy, drag, long-press, select.
  function lockIndexSplash() {
    const splash = $("indexFirstSplash");
    if (!splash) return;

    // CSS lock - no select, no callout, no highlight
    splash.style.userSelect = "none";
    splash.style.webkitUserSelect = "none";
    splash.style.webkitTouchCallout = "none"; // No iPhone long-press menu
    splash.style.webkitTapHighlightColor = "transparent";
    splash.style.touchAction = "none";

    // Lock every child inside splash - image + text
    splash.querySelectorAll("*").forEach(function (el) {
      el.style.userSelect = "none";
      el.style.webkitUserSelect = "none";
      el.style.webkitTouchCallout = "none";
      el.style.webkitTapHighlightColor = "transparent";
      if (el.tagName === "IMG") {
        el.draggable = false;
        el.style.pointerEvents = "none"; // Image cannot be touched / dragged
        el.style.webkitUserDrag = "none";
      }
    });

    // Block copy / cut / paste on splash
    ["copy", "cut", "paste"].forEach(function (type) {
      splash.addEventListener(type, function (e) { e.preventDefault(); return false; });
    });

    // Block select start - cannot highlight text
    splash.addEventListener("selectstart", function (e) { e.preventDefault(); return false; });

    // Block right-click / long-press menu on splash
    splash.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });

    // Block drag start on splash
    splash.addEventListener("dragstart", function (e) { e.preventDefault(); return false; });

    // Block long-press on mobile - touchstart longer than 400ms
    let splashTouchTimer = null;
    splash.addEventListener("touchstart", function () {
      splashTouchTimer = setTimeout(function () {
        if (window.getSelection) window.getSelection().removeAllRanges();
      }, 400);
    }, { passive: true });
    splash.addEventListener("touchend", function () {
      if (splashTouchTimer) clearTimeout(splashTouchTimer);
      if (window.getSelection) window.getSelection().removeAllRanges();
    }, { passive: true });
    splash.addEventListener("touchmove", function () {
      if (splashTouchTimer) clearTimeout(splashTouchTimer);
    }, { passive: true });

    // Block mouse down selection on splash
    splash.addEventListener("mousedown", function (e) { e.preventDefault(); });
  }

  // Also block context menu / drag on ALL images in index.html - extra safety
  document.addEventListener("contextmenu", function (e) {
    if (e.target && e.target.tagName === "IMG") { e.preventDefault(); }
  });
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") { e.preventDefault(); }
  });

  // Fix all images - no stretch - on load
  function fixImagesNoStretch() {
    document.querySelectorAll("img").forEach(function (img) {
      img.draggable = false;
      img.style.userSelect = "none";
      img.style.webkitUserDrag = "none";
      if (img.classList.contains("index-splash-image") || img.classList.contains("pwa-icon")) {
        img.style.objectFit = "contain";
        img.style.objectPosition = "center";
      }
    });
  }
  fixImagesNoStretch();

  /* ================= 3. SIDEBAR + MAIN APP - HIDDEN FIRST ================= */
  // Sidebar-section must NOT show during splash + check.
  // connect.css already hides it with display: none !important.
  // JS adds gate-passed to <body> after check passes, then sidebar shows.
  function hideGate() {
    // Remove gate-passed first - hide sidebar + main app
    document.body.classList.remove("gate-passed");
    // Extra JS hide - in case connect.css not loaded yet - no flash
    $$(".sidebar-section").forEach(function (el) {
      el.style.display = "none";
      el.style.visibility = "hidden";
    });
    const main = $("mainApp");
    if (main) {
      main.style.display = "none";
      main.style.visibility = "hidden";
    }
  }
  function showGate() {
    // Add gate-passed - connect.css shows sidebar + main app
    document.body.classList.add("gate-passed");
    // Clear inline hide - let CSS control it
    $$(".sidebar-section").forEach(function (el) {
      el.style.display = "";
      el.style.visibility = "";
    });
    const main = $("mainApp");
    if (main) {
      main.style.display = "";
      main.style.visibility = "";
    }
  }

  /* ================= 4. FAKE BACKEND - CHECK SIGNUP ================= */
  // Later, backend-connect.js will replace this with real fetch.
  // Same name, same return shape - flow will NOT break.
  const PROGRESS_KEY = "konnekt_signup_progress";
  const PWA_NOTNOW_KEY = "konnekt_pwa_notnow";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null"); } catch (e) { return null; }
  }
  function hasFinishedSignup() {
    const p = loadProgress();
    // Must be loggedIn = true + step = main + finished = true
    // If OTP not verified, or step not main, or loggedIn false -> not finished
    if (!p) return false;
    if (p.loggedIn !== true) return false;
    if (p.step !== "main") return false;
    if (p.finished !== true && !p.loggedIn) return false;
    return true;
  }

  /* ================= 5. PWA - CHECK INSTALLED ================= */
  // If already installed (standalone), PWA popup must NOT show, even after 30s.
  function isInstalled() {
    // iPhone standalone
    if (window.navigator.standalone === true) return true;
    // Android / Desktop standalone
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
    return false;
  }
  function wasNotNowRecently() {
    try {
      const t = parseInt(localStorage.getItem(PWA_NOTNOW_KEY) || "0", 10);
      if (!t) return false;
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      return (Date.now() - t) < twoDays;
    } catch (e) { return false; }
  }

  // PWA install prompt - saved from beforeinstallprompt
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); // Don't show browser mini prompt - we show our own slide up
    deferredPrompt = e;
  });
  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    hidePwa();
  });

  function showPwa() {
    const overlay = $("pwaOverlay");
    if (!overlay) return;
    // If already installed -> never show
    if (isInstalled()) return;
    // If user tapped Not Now in last 2 days -> don't show again
    if (wasNotNowRecently()) return;
    // Show correct steps - iPhone vs Android
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const iphoneSteps = $("pwaIphoneSteps");
    const androidSteps = $("pwaAndroidSteps");
    if (iphoneSteps) iphoneSteps.hidden = !isIOS;
    if (androidSteps) androidSteps.hidden = isIOS;
    overlay.hidden = false;
    // Focus install button for keyboard users
    const installBtn = $("pwaInstallBtn");
    if (installBtn) installBtn.focus();
  }
  function hidePwa() {
    const overlay = $("pwaOverlay");
    if (overlay) overlay.hidden = true;
  }

  // PWA Buttons
  if ($("pwaInstallBtn")) $("pwaInstallBtn").addEventListener("click", function () {
    // Android / Desktop - show real install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === "accepted") {
          // Installed - hide, never show again
          hidePwa();
        }
        deferredPrompt = null;
      });
      return;
    }
    // iPhone - no real prompt, user must follow steps manually
    // Keep sheet open, user follows Share -> Add to Home Screen
    // If already installed, hide
    if (isInstalled()) hidePwa();
  });
  if ($("pwaNotNowBtn")) $("pwaNotNowBtn").addEventListener("click", function () {
    // Save Not Now time - show again after 2 days, not every time
    try { localStorage.setItem(PWA_NOTNOW_KEY, String(Date.now())); } catch (e) {}
    hidePwa();
  });
  // Tap overlay background to close - same as Not Now
  if ($("pwaOverlay")) $("pwaOverlay").addEventListener("click", function (e) {
    if (e.target === this) {
      try { localStorage.setItem(PWA_NOTNOW_KEY, String(Date.now())); } catch (e2) {}
      hidePwa();
    }
  });
  // Swipe down on sheet to close - drag handle
  let pwaTouchY = 0;
  const pwaSheet = $("pwaSheet");
  if (pwaSheet) {
    pwaSheet.addEventListener("touchstart", function (e) { pwaTouchY = e.touches[0].clientY; }, { passive: true });
    pwaSheet.addEventListener("touchend", function (e) {
      const dy = e.changedTouches[0].clientY - pwaTouchY;
      if (dy > 80) { // Swiped down 80px -> close, same as Not Now
        try { localStorage.setItem(PWA_NOTNOW_KEY, String(Date.now())); } catch (err) {}
        hidePwa();
      }
    }, { passive: true });
  }

  /* ================= 6. GATE - FIRST SPLASH -> CHECK -> MAIN APP -> PWA AFTER 30s ================= */
  let pwaTimer = null;
  function startGate() {
    // Lock splash FIRST
    lockIndexSplash();
    // Hide sidebar + main app FIRST - no flash
    hideGate();
    fixImagesNoStretch();

    // Show splash - it is already visible in HTML, ensure it shows
    const splash = $("indexFirstSplash");
    if (splash) {
      splash.hidden = false;
      splash.style.display = "flex";
      lockIndexSplash(); // Re-lock
    }
    // Hide PWA first - it shows only after 30s
    hidePwa();

    // Splash shows 1-2 seconds, then check signup
    setTimeout(function () {
      // CHECK: Did user finish signup in sign.html?
      if (!hasFinishedSignup()) {
        // NOT finished -> go to sign.html, never show main app
        // Keep sidebar hidden, keep splash hidden, redirect
        window.location.href = "sign.html";
        return;
      }

      // FINISHED -> stay in index.html, show main app + sidebar
      if (splash) {
        splash.style.display = "none";
        splash.hidden = true;
      }
      showGate(); // Adds gate-passed -> sidebar + main app show

      // PWA: wait 30 seconds after landing in index.html, then show slide up
      // Not immediately. User first sees main app small, settles.
      clearTimeout(pwaTimer);
      pwaTimer = setTimeout(function () {
        showPwa();
      }, 30000); // 30,000ms = 30 seconds

    }, 1500); // 1.5 seconds splash
  }

  /* ================= 7. EXPOSE FOR OTHER FILES ================= */
  window.KonnektGate = {
    hasFinishedSignup: hasFinishedSignup,
    loadProgress: loadProgress,
    isInstalled: isInstalled,
    showPwa: showPwa,
    hidePwa: hidePwa,
    showGate: showGate,
    hideGate: hideGate
  };

  /* ================= 8. START ================= */
  lockIndexSplash();
  hideGate(); // Hide sidebar immediately, before DOMContentLoaded, no flash
  document.addEventListener("DOMContentLoaded", startGate);
  // If script is at end of body, DOM already ready
  if (document.readyState !== "loading") startGate();
})();