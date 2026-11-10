/* ==================================================================
   SIGN-FLOW.JS - FULL FLOW - CLEAN - NO CUT
   File: sign-up.js - for sign-up.html only, NOT index.html
   After everything, opens index.html - main app
   This JS = FLOW ONLY. backend-connect.js = separate later.
   It will NOT break when backend comes - backend-connect.js will
   just replace saveProgress() / loadProgress() with real fetch.
   No backend now - localStorage fakes backend progress for testing.
   No stretching / zooming - blocked for ALL screens.
   First Splash: image + text CANNOT be copied, cannot be dragged,
   cannot be long-pressed, cannot be selected.
   ================================================================== */

(function () {
  "use strict";

  /* ================= 0. HELPERS ================= */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ================= 1. NO STRETCHING / ZOOMING - FOR ALL ================= */
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturechange", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("gestureend", function (e) { e.preventDefault(); }, { passive: false });

  document.addEventListener("wheel", function (e) {
    if (e.ctrlKey) { e.preventDefault(); }
  }, { passive: false });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && ["+", "-", "0", "=", "_"].includes(e.key)) {
      e.preventDefault();
    }
  });

  let lastTouchEnd = 0;
  document.addEventListener("touchend", function (e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) { e.preventDefault(); }
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { passive: false });

  /* ================= 2. NO COPY - FIX 5 - ALL IMAGES ================= */
  // FIX 5: No image can be copied anywhere in signup
  // iPhone long-press / Android long-press / right-click / drag / copy all blocked

  function lockElementNoCopy(el) {
    if (!el) return;
    el.style.userSelect = "none";
    el.style.webkitUserSelect = "none";
    el.style.webkitTouchCallout = "none";
    el.style.webkitTapHighlightColor = "transparent";
    if (el.tagName === "IMG") {
      el.draggable = false;
      el.style.pointerEvents = "none";
      el.style.webkitUserDrag = "none";
      el.setAttribute("oncontextmenu", "return false");
    }
  }

  function lockFirstSplash() {
    const splash = $("firstSplash");
    if (!splash) return;
    splash.style.userSelect = "none";
    splash.style.webkitUserSelect = "none";
    splash.style.webkitTouchCallout = "none";
    splash.style.webkitTapHighlightColor = "transparent";
    splash.style.touchAction = "none";

    splash.querySelectorAll("*").forEach(function (el) {
      lockElementNoCopy(el);
    });

    ["copy", "cut", "paste"].forEach(function (type) {
      splash.addEventListener(type, function (e) { e.preventDefault(); return false; });
    });
    splash.addEventListener("selectstart", function (e) { e.preventDefault(); return false; });
    splash.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
    splash.addEventListener("dragstart", function (e) { e.preventDefault(); return false; });

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
    splash.addEventListener("mousedown", function (e) { e.preventDefault(); });
  }

  function lockAllImages() {
    // Lock every .no-copy-img + every img in signup
    document.querySelectorAll(".no-copy-img, .no-copy img, img").forEach(function (img) {
      lockElementNoCopy(img);
      if (img.classList.contains("konnekt-image") || img.classList.contains("konnekt-image-small")) {
        img.style.objectFit = "contain";
        img.style.objectPosition = "center";
      }
      if (img.classList.contains("onboarding-image")) {
        img.style.objectFit = "cover";
        img.style.objectPosition = "center";
      }
    });
    // Lock every .no-copy container
    document.querySelectorAll(".no-copy").forEach(function (el) {
      el.style.userSelect = "none";
      el.style.webkitUserSelect = "none";
      el.style.webkitTouchCallout = "none";
    });
  }

  // Global block - any image, anywhere in signup
  document.addEventListener("contextmenu", function (e) {
    if (e.target && (e.target.tagName === "IMG" || e.target.closest(".no-copy"))) { e.preventDefault(); return false; }
  });
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") { e.preventDefault(); return false; }
  });
  document.addEventListener("copy", function (e) {
    // Block copy if selection is inside no-copy area / image area
    const sel = window.getSelection();
    if (sel && sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest(".no-copy")) {
      e.preventDefault();
    }
  });

  function fixImagesNoStretch() {
    lockAllImages();
  }
  fixImagesNoStretch();
  const imgObserver = new MutationObserver(fixImagesNoStretch);
  imgObserver.observe(document.body, { childList: true, subtree: true });

  /* ================= 3. POPUP / SHOW / HIDE ================= */
  function hideAllBgs() {
    $$(".signup-bg").forEach((b) => { b.hidden = true; });
    const splash = $("firstSplash");
    if (splash) splash.style.display = "none";
  }
  function showBg(id) {
    hideAllBgs();
    const el = $(id);
    if (el) { el.hidden = false; el.scrollTop = 0; }
    window.scrollTo(0, 0);
    fixImagesNoStretch();
  }
  function showSplashOnly() {
    $$(".signup-bg").forEach((b) => { b.hidden = true; });
    const splash = $("firstSplash");
    if (splash) {
      splash.style.display = "flex";
      lockFirstSplash();
    }
  }

  let popupOkCb = null;
  function showPopup(msg, title, okCb) {
    const overlay = $("appPopupOverlay");
    if (!overlay) { alert(msg); if (okCb) okCb(); return; }
    $("appPopupTitle").textContent = title || "Notice";
    $("appPopupMessage").textContent = msg;
    $("appPopupCancelBtn").hidden = true;
    popupOkCb = okCb || null;
    overlay.hidden = false;
  }
  function hidePopup() {
    const overlay = $("appPopupOverlay");
    if (overlay) overlay.hidden = true;
    if (popupOkCb) { const cb = popupOkCb; popupOkCb = null; cb(); }
  }
  if ($("appPopupOkBtn")) $("appPopupOkBtn").addEventListener("click", hidePopup);
  if ($("appPopupOverlay")) $("appPopupOverlay").addEventListener("click", function (e) {
    if (e.target === this) { this.hidden = true; popupOkCb = null; }
  });

  /* ================= 4. FAKE BACKEND - localStorage ================= */
  const PROGRESS_KEY = "konnekt_signup_progress";
  function saveProgress(data) {
    try {
      const old = loadProgress() || {};
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...old, ...data }));
    } catch (e) {}
  }
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null"); } catch (e) { return null; }
  }
  function clearProgress() { try { localStorage.removeItem(PROGRESS_KEY); } catch (e) {} }

  const TEST_OTP = "123456";
  // FIX 3: Taken usernames now with @
  const TEST_TAKEN_USERNAMES = ["@Faith_mike", "@John_doe", "@Mary_jane"];

  /* ================= 5. FIRST SPLASH ================= */
  let termsChecked = false;
  let signupMode = "email";
  let currentEmail = "";
  let otpTimerInterval = null;
  let otpSecondsLeft = 60;
  let onboardingIndex = 0;

  function startApp() {
    showSplashOnly();
    lockFirstSplash();
    const progress = loadProgress();
    // FIX 2 part: Already logged in = go straight to index, no signup splash again
    if (progress && progress.loggedIn) {
      setTimeout(() => { window.location.href = "index.html"; }, 1200);
      return;
    }
    setTimeout(() => {
      if (progress && progress.otpVerified && progress.step) {
        resumeFromStep(progress.step);
        return;
      }
      showBg("welcomeBg");
    }, 1500);
  }

  function resumeFromStep(step) {
    if (step === "password") return showBg("passwordBg");
    if (step === "username") return showBg("usernameBg");
    if (step === "onboarding") return showOnboarding(0);
    if (step === "profile") return showBg("profileSetupBg");
    if (step === "campus") return showBg("campusSetupBg");
    if (step === "main") { window.location.href = "index.html"; return; }
    showBg("welcomeBg");
  }

  /* ================= 6. WELCOME - Terms + Get Started ================= */
  function setTermsChecked(val) {
    termsChecked = val;
    const box = $("termsBox");
    const tick = $("termsTick");
    if (box) box.classList.toggle("checked", val);
    if (tick) tick.hidden = !val;
  }
  if ($("termsBox")) $("termsBox").addEventListener("click", () => setTermsChecked(!termsChecked));

  if ($("openTermsBg")) $("openTermsBg").addEventListener("click", () => { showBg("termsBg"); });
  if ($("openPrivacyBg")) $("openPrivacyBg").addEventListener("click", () => { showBg("privacyBg"); });

  $$("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-close");
      if (target === "termsBg" || target === "privacyBg") return showBg("welcomeBg");
      if (target === "signPlaceBg") return showBg("welcomeBg");
      if (target === "otpBg") return showBg("signPlaceBg");
      if (target === "passwordBg") return showBg("signPlaceBg");
      if (target === "usernameBg") return showBg("passwordBg");
      if (target === "profileSetupBg") return showOnboarding(3);
      if (target === "campusSetupBg") return showBg("profileSetupBg");
      if (target === "loginBg") return showBg("welcomeBg");
      if (target === "forgotBg") return showBg("loginBg");
      if (target === "forgotOtpBg") return showBg("forgotBg");
      if (target === "forgotNewBg") return showBg("forgotOtpBg");
      showBg("welcomeBg");
    });
  });

  if ($("getStartedBtn")) $("getStartedBtn").addEventListener("click", () => {
    if (!termsChecked) {
      showPopup("Please agree to Terms and Conditions to continue. You must be 13+ to use Konnekt.", "Terms Required");
      return;
    }
    saveProgress({ termsAgreed: true, step: "sign" });
    showBg("signPlaceBg");
  });

  /* ================= 6A. FIX 1 - Already Have An Account BLOCKED if Terms not ticked ================= */
  // FIX 1: If Terms no tick, click "Already have an account" = popup, no go login
  function handleAlreadyHaveAccount(e) {
    if (!termsChecked) {
      if (e) e.preventDefault();
      showPopup("You should agree to Terms & Conditions", "Terms Required");
      return false;
    }
    return true;
  }

  // Welcome page button
  if ($("goLoginBtn")) $("goLoginBtn").addEventListener("click", (e) => {
    if (!handleAlreadyHaveAccount(e)) return;
    showBg("loginBg");
  });
  // Sign Place page button
  if ($("goLoginFromSignBtn")) $("goLoginFromSignBtn").addEventListener("click", (e) => {
    if (!handleAlreadyHaveAccount(e)) return;
    showBg("loginBg");
  });
  // Any other button with data-requires-terms
  $$("[data-requires-terms]").forEach((btn) => {
    if (btn.id === "goLoginBtn" || btn.id === "goLoginFromSignBtn") return; // already handled above
    btn.addEventListener("click", (e) => {
      if (!handleAlreadyHaveAccount(e)) return;
    }, true);
  });

  if ($("goSignupFromLoginBtn")) $("goSignupFromLoginBtn").addEventListener("click", () => showBg("signPlaceBg"));

  /* ================= 7. SIGN PLACE ================= */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }
  if ($("continueEmailBtn")) $("continueEmailBtn").addEventListener("click", () => {
    const email = ($("signupEmailInput") || {}).value || "";
    const err = $("signupEmailError");
    if (!isValidEmail(email)) {
      if (err) { err.textContent = "Please enter a valid email address."; err.hidden = false; }
      $("signupEmailInput").classList.add("is-invalid");
      return;
    }
    if (err) err.hidden = true;
    $("signupEmailInput").classList.remove("is-invalid");
    signupMode = "email";
    currentEmail = email.trim();
    saveProgress({ email: currentEmail, otpVerified: false, step: "otp" });
    const testEl = $("testOtpDisplay");
    if (testEl) testEl.textContent = "Code: " + TEST_OTP;
    startOtpTimer();
    showBg("otpBg");
    setTimeout(() => { const first = document.querySelector("#otpBg .otp-box"); if (first) first.focus(); }, 100);
  });

  if ($("googleSignupBtn")) $("googleSignupBtn").addEventListener("click", () => {
    signupMode = "google";
    currentEmail = "google-user@gmail.com";
    saveProgress({ email: currentEmail, otpVerified: true, step: "password", google: true });
    showBg("passwordBg");
  });

  /* ================= 8. OTP ================= */
  function setupOtpBoxes(containerId) {
    const container = $(containerId);
    if (!container) return;
    const boxes = Array.from(container.querySelectorAll(".otp-box"));
    boxes.forEach((box, i) => {
      box.value = "";
      box.addEventListener("input", () => {
        box.value = box.value.replace(/[^0-9]/g, "").slice(0, 1);
        if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
      });
      box.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !box.value && i > 0) {
          boxes[i - 1].focus();
          boxes[i - 1].value = "";
          e.preventDefault();
        }
        if (e.key === "ArrowLeft" && i > 0) boxes[i - 1].focus();
        if (e.key === "ArrowRight" && i < boxes.length - 1) boxes[i + 1].focus();
      });
      box.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text").replace(/[^0-9]/g, "").slice(0, 6);
        if (!text) return;
        text.split("").forEach((ch, j) => { if (boxes[j]) boxes[j].value = ch; });
        const next = boxes[Math.min(text.length, 5)];
        if (next) next.focus();
      });
    });
  }
  setupOtpBoxes("otpBoxes");
  setupOtpBoxes("forgotOtpBoxes");

  function getOtpCode(containerId) {
    const c = $(containerId);
    if (!c) return "";
    return Array.from(c.querySelectorAll(".otp-box")).map((b) => b.value).join("");
  }
  function startOtpTimer() {
    clearInterval(otpTimerInterval);
    otpSecondsLeft = 60;
    const timerEl = $("otpTimer");
    const btn = $("resendOtpBtn");
    if (btn) btn.disabled = true;
    otpTimerInterval = setInterval(() => {
      otpSecondsLeft--;
      if (timerEl) timerEl.textContent = otpSecondsLeft + "s";
      if (otpSecondsLeft <= 0) {
        clearInterval(otpTimerInterval);
        if (timerEl) timerEl.textContent = "";
        if (btn) btn.disabled = false;
      }
    }, 1000);
  }
  if ($("resendOtpBtn")) $("resendOtpBtn").addEventListener("click", () => {
    if ($("resendOtpBtn").disabled) return;
    startOtpTimer();
    showPopup("New code sent. For testing, use 123456.", "Code Sent");
  });
  if ($("changeEmailBtn")) $("changeEmailBtn").addEventListener("click", () => showBg("signPlaceBg"));

  if ($("confirmOtpBtn")) $("confirmOtpBtn").addEventListener("click", () => {
    const code = getOtpCode("otpBoxes");
    const err = $("otpError");
    if (code.length !== 6) {
      if (err) { err.textContent = "Please enter the full 6-digit code."; err.hidden = false; }
      return;
    }
    if (code !== TEST_OTP) {
      if (err) { err.textContent = "Wrong code. Try again or tap Resend."; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;
    saveProgress({ otpVerified: true, step: "password" });
    showBg("passwordBg");
  });

  /* ================= 9. PASSWORD ================= */
  function isValidPassword(pw) {
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
  }
  if ($("confirmPasswordBtn")) $("confirmPasswordBtn").addEventListener("click", () => {
    const pw = $("signupPasswordInput").value || "";
    const confirm = $("signupConfirmPasswordInput").value || "";
    const err = $("passwordError");
    if (!isValidPassword(pw)) {
      if (err) { err.textContent = "Password must be 8+ characters, with letter + number."; err.hidden = false; }
      return;
    }
    if (pw !== confirm) {
      if (err) { err.textContent = "Passwords do not match."; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;
    saveProgress({ step: "username" });
    showBg("usernameBg");
  });

  /* ================= 10. USERNAME - FIX 3 - MUST START WITH @ ================= */
  // FIX 3: Username MUST start with @smth
  // Examples: @Faith_mike = correct, Faith_mike = auto becomes @Faith_mike
  function normalizeUsername(raw) {
    let val = String(raw || "").trim();
    // Remove all spaces - replace with _
    val = val.replace(/\s+/g, "_");
    // If user typed without @, auto-add @
    if (val.length > 0 && !val.startsWith("@")) {
      val = "@" + val;
    }
    // If user typed @@, fix to single @
    while (val.startsWith("@@")) val = val.slice(1);
    return val;
  }

  function isValidUsername(val) {
    // Must start with @, then at least 3 chars: letters, numbers, _
    // Total: @ + 3 = at least 4 chars, max 21 (@ + 20)
    if (!val.startsWith("@")) return false;
    const after = val.slice(1);
    if (after.length < 3) return false;
    if (after.length > 20) return false;
    if (/[^A-Za-z0-9_]/.test(after)) return false;
    return true;
  }

  if ($("usernameInput")) $("usernameInput").addEventListener("input", (e) => {
    let val = normalizeUsername(e.target.value);
    e.target.value = val; // Show @ immediately as user types

    const err = $("usernameError");
    const suggest = $("usernameSuggest");
    const tick = $("usernameTick");
    const input = e.target;

    // Empty / only @
    if (val === "@" || val === "") {
      if (err) { err.textContent = "Username must start with @, like @Faith_mike"; err.hidden = false; }
      if (tick) tick.hidden = true;
      input.classList.add("is-invalid");
      return;
    }

    // Special chars after @ - only letters, numbers, _ allowed
    const after = val.slice(1);
    if (/[^A-Za-z0-9_]/.test(after)) {
      if (err) { err.textContent = "Only letters, numbers, and _ allowed after @. No # $ % !"; err.hidden = false; }
      if (tick) tick.hidden = true;
      input.classList.add("is-invalid");
      return;
    }

    if (after.length > 20) {
      if (err) { err.textContent = "Username is too long. Try using underscore _ to make it shorter."; err.hidden = false; }
      if (suggest) { suggest.textContent = "Try: @" + after.slice(0, 15); suggest.hidden = false; }
      if (tick) tick.hidden = true;
      input.classList.add("is-invalid");
      return;
    }

    if (TEST_TAKEN_USERNAMES.includes(val)) {
      if (err) { err.textContent = "This username is taken. Try " + val + "1"; err.hidden = false; }
      if (suggest) { suggest.textContent = "Try: " + val + "1, " + val + "_1, " + val + "2"; suggest.hidden = false; }
      if (tick) tick.hidden = true;
      input.classList.add("is-invalid");
      return;
    }

    if (err) err.hidden = true;
    if (suggest) suggest.hidden = true;
    input.classList.remove("is-invalid");
    if (tick) tick.hidden = !(after.length >= 3);
  });

  if ($("continueUsernameBtn")) $("continueUsernameBtn").addEventListener("click", () => {
    const raw = ($("usernameInput") || {}).value || "";
    const val = normalizeUsername(raw);
    if ($("usernameInput")) $("usernameInput").value = val;
    const err = $("usernameError");
    if (!isValidUsername(val)) {
      if (err) { err.textContent = "Username must start with @ and have at least 3 characters after @, like @Faith_mike"; err.hidden = false; }
      $("usernameInput").classList.add("is-invalid");
      return;
    }
    if (TEST_TAKEN_USERNAMES.includes(val)) {
      if (err) { err.textContent = "This username is taken. Try " + val + "1"; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;
    $("usernameInput").classList.remove("is-invalid");
    saveProgress({ username: val, step: "onboarding" });
    showOnboarding(0);
  });

  /* ================= 11. ONBOARDING ================= */
  function showOnboarding(index) {
    onboardingIndex = index;
    hideAllBgs();
    const bg = $("onboardingBg");
    if (bg) bg.hidden = false;
    $$(".onboarding-slide").forEach((s, i) => { s.hidden = i !== index; });
    $$("#onboardingDots .dot").forEach((d, i) => { d.classList.toggle("active", i === index); });
    const nextBtn = $("onboardingNextBtn");
    if (nextBtn) nextBtn.textContent = index === 3 ? "Continue" : "Next";
    fixImagesNoStretch();
  }
  if ($("onboardingNextBtn")) $("onboardingNextBtn").addEventListener("click", () => {
    if (onboardingIndex < 3) { showOnboarding(onboardingIndex + 1); return; }
    saveProgress({ step: "profile" });
    showBg("profileSetupBg");
  });
  if ($("onboardingSkipBtn")) $("onboardingSkipBtn").addEventListener("click", () => {
    saveProgress({ step: "profile" });
    showBg("profileSetupBg");
  });
  let touchStartX = 0;
  const obBg = $("onboardingBg");
  if (obBg) {
    obBg.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    obBg.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx < -50 && onboardingIndex < 3) showOnboarding(onboardingIndex + 1);
      if (dx > 50 && onboardingIndex > 0) showOnboarding(onboardingIndex - 1);
    }, { passive: true });
  }

  /* ================= 12. PROFILE SETUP ================= */
  if ($("pickProfilePicBtn")) $("pickProfilePicBtn").addEventListener("click", () => { $("profilePicInput").click(); });
  if ($("profilePicInput")) $("profilePicInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const pic = $("profileSetupPic");
    if (pic) pic.innerHTML = '<img src="' + url + '" alt="Profile" style="width:100%;height:100%;object-fit:cover;display:block" />';
  });
  if ($("connectSpotifyBtn")) $("connectSpotifyBtn").addEventListener("click", () => {
    showPopup("Spotify connect is optional. For now, this is a demo. Backend later will connect real Spotify.", "Spotify");
  });
  function goCampus() { saveProgress({ step: "campus" }); showBg("campusSetupBg"); }
  if ($("continueProfileBtn")) $("continueProfileBtn").addEventListener("click", goCampus);
  if ($("skipProfileBtn")) $("skipProfileBtn").addEventListener("click", goCampus);

  /* ================= 13. CAMPUS SETUP ================= */
  const CAMPUSES = [
    "University of Lagos (UNILAG)", "University of Ibadan (UI)", "Obafemi Awolowo University (OAU)",
    "University of Nigeria, Nsukka (UNN)", "Ahmadu Bello University (ABU)", "University of Benin (UNIBEN)",
    "University of Ilorin (UNILORIN)", "Covenant University", "Lagos State University (LASU)",
    "Federal University of Technology, Akure (FUTA)", "University of Port Harcourt (UNIPORT)",
    "Nnamdi Azikiwe University (UNIZIK)", "Bayero University Kano (BUK)", "University of Abuja (UNIABUJA)",
    "University of Calabar (UNICAL)", "Federal University of Technology, Owerri (FUTO)",
    "University of Jos (UNIJOS)", "Ladoke Akintola University (LAUTECH)", "Ekiti State University (EKSU)",
    "Rivers State University (RSU)", "Delta State University (DELSU)", "Ambrose Alli University (AAU)",
    "Michael Okpara University (MOUAU)", "Federal University, Oye-Ekiti (FUOYE)", "Babcock University",
    "Redeemer's University", "Landmark University", "Bowen University", "Afe Babalola University (ABUAD)",
    "Pan-Atlantic University", "Igbinedion University", "Elizade University", "Caleb University",
    "Bells University", "Kwararafa University", "Federal Polytechnic Ilaro", "Yaba College of Technology (YABATECH)",
    "Lagos State Polytechnic (LASPOTECH)", "The Polytechnic Ibadan", "Federal Polytechnic Nekede",
    "Kaduna Polytechnic", "Auchi Polytechnic", "Osun State Polytechnic", "Rufus Giwa Polytechnic",
    "Delta State Polytechnic", "Federal College of Education, Zaria", "Adeniran Ogunsanya College of Education",
    "College of Education, Ikere", "Nasarawa State University", "Gombe State University"
  ];
  function renderCampusList() {
    const list = $("campusSetupList");
    if (!list) return;
    list.innerHTML = "";
    CAMPUSES.forEach((name) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "campus-item";
      b.textContent = name;
      b.addEventListener("click", () => {
        $$(".campus-item").forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
        const custom = $("customCampusSetupInput");
        if (custom) custom.value = name;
      });
      list.appendChild(b);
    });
  }
  renderCampusList();
  function finishSignupAndGoToMainApp() {
    saveProgress({ step: "main", loggedIn: true, finished: true });
    window.location.href = "index.html";
  }
  if ($("continueCampusBtn")) $("continueCampusBtn").addEventListener("click", finishSignupAndGoToMainApp);
  if ($("skipCampusBtn")) $("skipCampusBtn").addEventListener("click", finishSignupAndGoToMainApp);

  /* ================= 14. LOGIN ================= */
  if ($("loginBtn")) $("loginBtn").addEventListener("click", () => {
    const email = ($("loginEmailInput") || {}).value || "";
    const pw = ($("loginPasswordInput") || {}).value || "";
    const err = $("loginError");
    if (!isValidEmail(email)) {
      if (err) { err.textContent = "Please enter a valid email address."; err.hidden = false; }
      return;
    }
    if (!pw) {
      if (err) { err.textContent = "Please enter your password."; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;
    saveProgress({ email: email.trim(), loggedIn: true, step: "main", finished: true });
    window.location.href = "index.html";
  });
  if ($("googleLoginBtn")) $("googleLoginBtn").addEventListener("click", () => {
    saveProgress({ email: "google-user@gmail.com", loggedIn: true, step: "main", finished: true, google: true });
    window.location.href = "index.html";
  });
  if ($("forgotPasswordBtn")) $("forgotPasswordBtn").addEventListener("click", () => showBg("forgotBg"));
  if ($("sendForgotOtpBtn")) $("sendForgotOtpBtn").addEventListener("click", () => {
    const email = ($("forgotEmailInput") || {}).value || "";
    const err = $("forgotEmailError");
    if (!isValidEmail(email)) {
      if (err) { err.textContent = "Please enter a valid email address."; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;
    const testForgot = $("testForgotOtpDisplay");
    if (testForgot) testForgot.textContent = "Code: " + TEST_OTP;
    showBg("forgotOtpBg");
  });
  if ($("confirmForgotOtpBtn")) $("confirmForgotOtpBtn").addEventListener("click", () => {
    const code = getOtpCode("forgotOtpBoxes");
    const err = $("forgotOtpError");
    if (code !== TEST_OTP) {
      if (err) { err.textContent = "Wrong code. For testing, use 123456."; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;
    showBg("forgotNewBg");
  });
  if ($("confirmForgotNewBtn")) $("confirmForgotNewBtn").addEventListener("click", () => {
    const pw = ($("forgotNewPasswordInput") || {}).value || "";
    const confirm = ($("forgotConfirmPasswordInput") || {}).value || "";
    const err = $("forgotNewError");
    if (!isValidPassword(pw)) {
      if (err) { err.textContent = "Password must be 8+ characters, with letter + number."; err.hidden = false; }
      return;
    }
    if (pw !== confirm) {
      if (err) { err.textContent = "Passwords do not match."; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;
    showPopup("Password saved. Please log in again.", "Success", () => showBg("loginBg"));
  });

  /* ================= 15. EXPOSE ================= */
  window.KonnektSignup = { saveProgress, loadProgress };

  /* ================= 16. START ================= */
  lockFirstSplash();
  lockAllImages();

  document.addEventListener("DOMContentLoaded", startApp);
  if (document.readyState !== "loading") startApp();
})();