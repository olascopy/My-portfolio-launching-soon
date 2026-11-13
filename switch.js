/* ============================================================
  switch.js - FOLLOWS YOUR POPUP RULES
  Your Rules (from settings.html + settings.css):
        - Popups = <div class="popup-bg" id="xxx" hidden>
        - Open  = remove `hidden` attribute ONLY
        - Close = add `hidden` attribute ONLY
        - Close button = <button data-close="xxx">
        - Save button  = <button data-save="campus">
        - NO style.display, NO .show class for popups
        - Picker = <button data-campus="Name" data-selected="true/false">
        - Backend reads data-campus + data-selected

  This file NEVER touches style.display for popups.
  Loops tabs / header can use class, popups cannot.

  ===== FIX IN THIS VERSION =====
    1. getCampusName() now returns '' if skipped=true. Before it
     returned old name even after skip, so loops.js thought user
     HAS campus and showed Campus border wrongly.
    2. Removed setInterval(updateAll, 1000). That interval overwrote
     loops tabs every 1 sec and fought with loops.js.
     Now we update ONLY when campus actually changes.
    3. switch.js now tells loops.js when campus changes via
     window.LoopFeed.onCampusChanged() + custom event
     'konnekt:campusChanged'. So loops post border updates instantly.
    4. Single source of truth: loop_campus_state + loop_user_campus
          + loop_campus_skipped. loops.js must read from here only.
     loops.js must NOT use konnekt_campus etc.
============================================================ */
(function () {
  const $ = (id) => document.getElementById(id);
  const icon = () => { if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { "stroke-width": 1.7 } }); };

  // ===== BACKEND-READY STATE =====
  // Backend will later do GET /api/user/campus -> same shape
  // Shape: { name: "University of Lagos" | "", skipped: true/false, changeCount, lastChange }
  function getCampusState() {
    try {
      const raw = localStorage.getItem('loop_campus_state');
      if (raw) {
        const s = JSON.parse(raw);
        // FIX: Normalize - if skipped, name must be empty. Old data may have both.
        if (s.skipped) s.name = '';
        return {
          name: (s.name || '').trim(),
          skipped: !!s.skipped,
          changeCount: parseInt(s.changeCount || 0, 10),
          lastChange: parseInt(s.lastChange || 0, 10)
        };
      }
    } catch (e) {}
    return {
      name: (localStorage.getItem('loop_user_campus') || '').trim(),
      skipped: localStorage.getItem('loop_campus_skipped') === 'true',
      changeCount: parseInt(localStorage.getItem('loop_campus_change_count') || '0', 10),
      lastChange: parseInt(localStorage.getItem('loop_campus_last_change') || '0', 10)
    };
  }

  function saveCampusState(s) {
    // FIX: If skipped, force name to '' so no old name remains to confuse loops.js
    const clean = {
      name: s.skipped ? '' : (s.name || '').trim(),
      skipped: !!s.skipped,
      changeCount: s.changeCount || 0,
      lastChange: s.lastChange || 0
    };
    localStorage.setItem('loop_campus_state', JSON.stringify(clean));
    localStorage.setItem('loop_user_campus', clean.name);
    localStorage.setItem('loop_campus_skipped', clean.skipped ? 'true' : 'false');
    localStorage.setItem('loop_campus_change_count', String(clean.changeCount));
    localStorage.setItem('loop_campus_last_change', String(clean.lastChange));
    // FIX: Tell loops.js immediately, don't wait for interval
    notifyCampusChanged();
  }

  // FIX: Central notify - loops.js listens to this
  function notifyCampusChanged() {
    // 1. Direct call if loops.js is loaded
    if (window.LoopFeed && typeof window.LoopFeed.onCampusChanged === 'function') {
      try { window.LoopFeed.onCampusChanged(); } catch (e) {}
    }
    // 2. Event for any other file listening
    try { window.dispatchEvent(new CustomEvent('konnekt:campusChanged')); } catch (e) {}
  }

  // FIX: If skipped, return ''. Before it returned old name even after skip.
  const getCampusName = () => {
    const s = getCampusState();
    if (s.skipped) return '';
    return (s.name || '').trim();
  };
  const hasCampus = () => !!getCampusName();
  const getActive = () => localStorage.getItem('loop_active') || 'general';
  const setActive = (t) => localStorage.setItem('loop_active', t);

  // ===== RULE: TWICE / 30 DAYS =====
  // ADD after skip = not a change. CHANGE to different campus = counts.
  function canChangeCampus() {
    const s = getCampusState();
    if (!s.lastChange) return { allowed: true };
    const THIRTY = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - s.lastChange >= THIRTY) return { allowed: true, reset: true };
    if (s.changeCount >= 2) return { allowed: false, reason: 'You can only change your campus twice. You must wait until the next 30 days before you can change it again.' };
    return { allowed: true };
  }

  // ===== POPUP RULES - ONLY hidden ATTRIBUTE =====
  function openPopup(id) {
    const el = $(id);
    if (!el) return false;
    el.removeAttribute('hidden');
    el.hidden = false;
    // DO NOT use el.style.display, DO NOT use el.classList.add('show')
    // Your CSS: .popup-bg[hidden]{display:none} .popup-bg{display:flex/block}
    icon();
    return true;
  }
  function closePopup(id) {
    const el = $(id);
    if (!el) return;
    el.setAttribute('hidden', '');
    el.hidden = true;
    // DO NOT use el.style.display, DO NOT use el.classList.remove('show')
  }
  function isPopupOpen(id) {
    const el = $(id);
    return el && !el.hidden && !el.hasAttribute('hidden');
  }

  // ===== LOOPS HEADER / TABS - CLASS IS OK HERE, NOT POPUPS =====
  function updateHeader() {
    const name = getCampusName();
    const active = getActive();
    const h = $('campusHeader');
    if (h) h.textContent = (name && active === 'campus') ? name + ' • Campus' : 'General';
    const herd = $('herdLabel');
    if (herd) herd.textContent = (name && active === 'campus') ? 'My Herd • Campus' : 'Everywhere • General';
    const dot = $('dotType');
    if (dot) dot.className = 'dot ' + ((name && active === 'campus') ? 'campus' : 'general');
  }
  function updateTabs() {
    const name = getCampusName();
    const active = getActive();
    const tabC = $('tabCampus');
    const tabG = $('tabGeneral');
    // Tabs are NOT popups, so class + style is allowed here
    if (tabC) {
      if (!name) { tabC.classList.remove('active'); tabC.disabled = true; tabC.setAttribute('aria-hidden', 'true'); tabC.style.display = 'none'; }
      else { tabC.style.display = ''; tabC.disabled = false; tabC.removeAttribute('aria-hidden'); tabC.classList.toggle('active', active === 'campus'); }
    }
    if (tabG) tabG.classList.toggle('active', active === 'general' || !name);
  }
  // FIX: updateAll now also notifies loops.js, but does NOT loop every 1 sec
  function updateAll() {
    updateHeader();
    updateTabs();
    icon();
    // Don't call notify here to avoid infinite loop (notify -> LoopFeed -> setActiveType -> updateAll)
    // Notify is only called from saveCampusState() and switchTo()
  }

  function switchTo(type) {
    // FIX: If no campus, never allow campus. Force to general.
    if (type === 'campus' && !hasCampus()) {
      setActive('general');
      updateAll();
      notifyCampusChanged();
      return;
    }
    setActive(type);
    updateAll();
    notifyCampusChanged();
    if (window.LoopFeed && window.LoopFeed.setActiveType) window.LoopFeed.setActiveType(type);
  }

  function showErr(id, msg) {
    const el = $(id);
    if (el) { el.textContent = msg; el.hidden = false; el.removeAttribute('hidden'); }
  }
  function hideErr(id) {
    const el = $(id);
    if (el) { el.hidden = true; el.setAttribute('hidden', ''); }
  }

  function getChosenCampus(pickerId, inputId) {
    const input = $(inputId);
    if (input && input.value.trim()) return input.value.trim();
    const picker = $(pickerId);
    if (picker) {
      const sel = picker.querySelector('[data-selected="true"]');
      if (sel) return (sel.dataset.campus || sel.textContent || '').trim();
    }
    return '';
  }

  // Page switch (Loops page) follows your page rules, not popup rules
  // Your pages use .show class - this is OK for pages, NOT for popups
  function showLoopsPage() {
    const loops = $('pageLoops');
    if (loops) loops.classList.add('show');
    // Signup campus setup is a popup-bg too, so close with hidden rule
    closePopup('campusSetupBg');
    closePopup('signupCampusBg');
    updateAll();
  }

  // ===== DELEGATION - FOLLOWS YOUR HTML =====
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // --- A. GENERIC POPUP CLOSE ---
    // <button data-close="changeCampusBg"> in .popup-header
    const closeId = btn.getAttribute('data-close');
    if (closeId) {
      closePopup(closeId);
      return;
    }

    const id = btn.id;

    // --- B. OPEN SETTINGS CAMPUS ---
    // <button id="openChangeCampus"> inside #accountBg
    if (id === 'openChangeCampus') {
      openPopup('changeCampusBg');
      const name = getCampusName();
      const picker = $('campusPickerList');
      if (picker && name) {
        picker.querySelectorAll('[data-campus]').forEach(b => {
          const isSel = b.dataset.campus === name;
          b.classList.toggle('selected', isSel);
          b.dataset.selected = isSel ? 'true' : 'false';
          b.setAttribute('aria-selected', isSel ? 'true' : 'false');
        });
      }
      hideErr('campusError');
      return;
    }

    // --- C. PICKER ITEM - <button data-campus="..."> ---
    if (btn.hasAttribute('data-campus')) {
      const list = btn.closest('.campus-picker-list');
      if (list) list.querySelectorAll('[data-campus]').forEach(b => {
        b.classList.remove('selected');
        b.dataset.selected = 'false';
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('selected');
      btn.dataset.selected = 'true';
      btn.setAttribute('aria-selected', 'true');
      hideErr('campusError'); hideErr('campusSetupError');
      return;
    }

    // --- D. SIGNUP SKIP - <button id="skipCampusBtn"> ---
    if (id === 'skipCampusBtn' || id === 'skipCampus') {
      e.preventDefault();
      const s = getCampusState();
      // FIX: Save with name='' + skipped=true, so getCampusName() returns ''
      saveCampusState({ ...s, name: '', skipped: true });
      setActive('general');
      updateAll(); showLoopsPage(); switchTo('general');
      return;
    }

    // --- E. SIGNUP CONTINUE - <button id="continueCampusBtn"> ---
    if (id === 'continueCampusBtn') {
      e.preventDefault();
      const chosen = getChosenCampus('campusSetupList', 'customCampusSetupInput');
      if (!chosen) { showErr('campusSetupError', 'Please choose a university or type your campus name.'); return; }
      hideErr('campusSetupError');
      const s = getCampusState();
      saveCampusState({ ...s, name: chosen, skipped: false });
      setActive('campus');
      updateAll(); showLoopsPage(); switchTo('campus');
      return;
    }

    // --- F. SETTINGS SAVE ---
    // Campus save: <button data-save="campus"> + <button id="confirmCampusBtn">
    if (id === 'confirmCampusBtn' || btn.getAttribute('data-save') === 'campus') {
      // Only handle if changeCampusBg is open (so we don't hijack other saves)
      if (!isPopupOpen('changeCampusBg')) return;
      const chosen = getChosenCampus('campusPickerList', 'customCampusInput');
      if (!chosen) { showErr('campusError', 'Please choose a university or type your campus name.'); return; }
      hideErr('campusError');
      const s = getCampusState();
      const isChanging = !!s.name && s.name !== chosen;
      if (isChanging) {
        const check = canChangeCampus();
        if (!check.allowed) { showErr('campusError', check.reason); return; }
        const newCount = check.reset ? 1 : (s.changeCount + 1);
        saveCampusState({ ...s, name: chosen, skipped: false, changeCount: newCount, lastChange: Date.now() });
      } else {
        saveCampusState({ ...s, name: chosen, skipped: false });
      }
      setActive('campus');
      updateAll();
      closePopup('changeCampusBg');
      if ($('pageLoops')) switchTo('campus');
      return;
    }

    // --- G. LOOPS TABS ---
    if (id === 'tabCampus') { switchTo('campus'); return; }
    if (id === 'tabGeneral') { switchTo('general'); return; }
    if (id === 'emptyExploreCampus') { switchTo('general'); return; }
    if (id === 'emptyExploreGeneral') { switchTo('campus'); return; }
  });

  // Typed input clears picker selection - same rule as other inputs
  document.addEventListener('input', (e) => {
    if (e.target.id === 'customCampusInput' || e.target.id === 'customCampusSetupInput') {
      const pickerId = e.target.id === 'customCampusInput' ? 'campusPickerList' : 'campusSetupList';
      const picker = $(pickerId);
      if (picker && e.target.value.trim()) picker.querySelectorAll('[data-campus]').forEach(b => { b.classList.remove('selected'); b.dataset.selected = 'false'; });
      hideErr('campusError'); hideErr('campusSetupError');
    }
  });

  // FIX: Removed setInterval(updateAll, 1000)
  // Old interval overwrote loops.js tabs every 1 sec and caused flicker.
  // Now we update ONLY when storage changes in another tab, or when campus changes.
  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key.startsWith('loop_campus') || e.key === 'loop_active') {
      updateAll();
    }
  });
  // FIX: Also listen for campus change from loops.js (if loops calls setUserCampus)
  window.addEventListener('konnekt:campusChanged', updateAll);

  updateAll();
  // FIX: Expose hasCampus + getCampusState so loops.js can use same source of truth
  window.CampusSwitch = { getCampusName, hasCampus, getCampusState, saveCampusState, switchTo, updateAll, openPopup, closePopup, canChangeCampus, notifyCampusChanged };
})();