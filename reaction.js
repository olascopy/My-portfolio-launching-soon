// ==========================
// reaction.js - REACTION + STICKER + FFmpeg + VOICE + PLUS PILL + INPUT LIMIT - CLEAN - NO CUT
// Load AFTER konnekt-main.js. Main JS owns Hold / Contact / Group. This file owns Reaction / Sticker / Voice / Plus.
// FIX: Plus Pill MUST show even if HTML has no #plusPillMenu - JS creates it
// FIX: Reaction border function proper, Image select NO trigger hold / reaction
// ==========================
(function(){
  const $ = (s,p=document)=>p.querySelector(s);
  const $$ = (s,p=document)=>[...p.querySelectorAll(s)];
  const chatMessages = $('#chatMessages');
  const chatBackground = $('#chatBackground');
  if(!chatMessages || !chatBackground) return;

  const overlay = $('#messageFocusOverlay');
  const poppedContainer = $('#poppedMessageContainer');
  const poppedClone = $('#poppedClone');
  const actionPill = $('#messageActionPill');
  const emojiBar = $('#emojiReactBar');
  const emojiPlusBtn = $('#emojiPlusBtn');
  const emojiPickerPanel = $('#emojiPickerPanel');
  const emojiPickerGrid = $('#emojiPickerGrid');
  const toast = $('#toast');
  const favText = $('#favText');
  const favIcon = $('#favIcon');

  const stickerBtn = $('#emojiStickerBtn');
  const stickerPanel = $('#stickerBorderPanel');
  const stickerGrid = $('#stickerGrid');
  const stickerAddBox = $('#stickerAddBox');
  const chatStickerSelectMode = $('#chatStickerSelectMode');
  const stickerSelectGrid = $('#stickerSelectGrid');
  const addStickerConfirmBtn = $('#addStickerConfirmBtn');
  const addStickerCancelX = $('#addStickerCancelX');
  const stickerSelectClose = $('#stickerSelectClose');

  const galleryInput = $('#galleryInput');
  const cameraInput = $('#cameraInput');
  const imagePreview = $('#imagePreviewOverlay');
  const previewImage = $('#previewImage');
  const previewVideo = $('#previewVideo');
  const previewClose = $('#previewClose');
  const previewCancelText = $('#previewCancelText');
  const captionInput = $('#captionInput');
  const previewSendBtn = $('#previewSendBtn');

  const videoFullOverlay = $('#videoFullOverlay');
  const videoFullPlayer = $('#videoFullPlayer');
  const videoFullCaption = $('#videoFullCaption');
  const videoFullClose = $('#videoFullClose');

  const createPage = $('#createStickerPage');
  const createClose = $('#createStickerClose');
  const createBack = $('#createStickerBack');
  const createCancelBtn = $('#createCancelBtn');
  const createImage = $('#createStickerImage');
  const createVideo = $('#createStickerVideo');
  const createCanvasEl = $('#createCanvas');
  const createPlaceholder = $('#createPlaceholder');
  const stickerFileInput = $('#stickerFileInput');
  const textOverlay = $('#textOverlay');
  const textOverlayWrapper = $('#textOverlayWrapper');
  const addTextBtn = $('#addTextBtn');
  const boldTextBtn = $('#boldTextBtn');
  const zoomTextBtn = $('#zoomTextBtn');
  const cropBtn = $('#cropBtn');
  const createAddBtn = $('#createAddBtn');
  const videoTrimBar = $('#videoTrimBar');
  const trimStart = $('#trimStart');
  const trimEnd = $('#trimEnd');
  const trimLabel = $('#trimLabel');
  const ffmpegLoader = $('#ffmpegLoader');
  const cuttingLoader = $('#cuttingLoader');

  const voiceOverlay = $('#voiceRecordingOverlay');
  const voiceTimer = $('#voiceTimer');
  const voiceCancelBtn = $('#voiceCancelBtn');
  const voiceSendBtn = $('#voiceSendBtn');
  const voiceStopBtn = $('#voiceStopBtn');
  const voiceWaveBig = $('#voiceWaveBig');
  const msgInput = $('#msgInput');
  const micBtn = $('#micSendBtn');

  // ---------- STATE ----------
  let currentRow = null, currentId = null, pressTimer = null;
  let stickers = [];
  try{ stickers = JSON.parse(localStorage.getItem('my_stickers')||'[]').map(s=>typeof s==='string'?{src:s,type:'image'}:s); }catch(e){ stickers = []; }
  let memoryVideoStickers = [];
  let previewType = 'image', previewObjectUrl = '';
  let cropScale = 1, cropX = 0, cropY = 0, lastDist = 0, lastX = 0, lastY = 0, textScale = 1, isCropped = false;
  let originalVideoFile = null;
  let ffmpegInstance = null, ffmpegLoaded = false, ffmpegLoading = false;
  let isPlusOpen = false;
  let lastValidInput = '';
  let limitPopupOpen = false;

  function refresh(){ if(window.lucide) lucide.createIcons(); }
  function showToast(msg='Added'){
    if(!toast) return; const sp = toast.querySelector('span'); if(sp) sp.textContent = msg;
    toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2000); refresh();
  }
  function cleanSrc(src){ return (src||'').split('#')[0]; }
  // FIX: Media row = image / video bubble - NO hold, NO reaction, tap = preview only
  function nkIsMediaRow(row){ return !!row?.querySelector('.image-bubble, .video-bubble'); }
  function loadingHtml(cls){
    return `<div class="media-loading-overlay ${cls}"><div class="media-loading-circle"><i data-lucide="download" class="media-download-icon"></i><i data-lucide="rotate-ccw" class="media-retry-icon"></i><svg class="media-progress-ring" viewBox="0 0 48 48"><circle class="media-progress-bg" cx="24" cy="24" r="20"></circle><circle class="media-progress-fill" cx="24" cy="24" r="20"></circle></svg><span class="media-loading-percent">0%</span></div></div>`;
  }
  function runLoading(bubble, done){
    if(!bubble) { if(done) done(); return; }
    bubble.classList.add('is-loading');
    const ov = bubble.querySelector('.media-loading-overlay'); if(!ov){ bubble.classList.remove('is-loading'); if(done) done(); return; }
    ov.hidden = false; ov.classList.remove('is-retry');
    let p = 0;
    const iv = setInterval(()=>{
      p += Math.floor(Math.random()*18)+8;
      if(p >= 100){ p = 100; clearInterval(iv); ov.hidden = true; bubble.classList.remove('is-loading'); const pct = ov.querySelector('.media-loading-percent'); if(pct) pct.textContent = '100%'; const ring = ov.querySelector('.media-progress-fill'); if(ring) ring.style.strokeDashoffset = 0; if(done) done(); return; }
      const pct = ov.querySelector('.media-loading-percent'); if(pct) pct.textContent = p+'%';
      const ring = ov.querySelector('.media-progress-fill'); if(ring) ring.style.strokeDashoffset = 126 - (126*p/100);
    },180);
    if(!ov.dataset.retryBound){ ov.dataset.retryBound='1'; ov.addEventListener('click', ()=>{ if(!ov.classList.contains('is-retry')) return; ov.classList.remove('is-retry'); runLoading(bubble, done); }); }
  }
  window.nkRunLoading = runLoading;

  // ---------- PLUS PILL - Find by ANY name, CREATE if missing, MUST show ----------
  function findPlusBtn(){
    return $('#inputPlusBtn') || $('[data-plus]') || $('.input-plus-btn') || $('.plus-btn') || $('#plusBtn') || $('[data-action="plus"]') || document.querySelector('.chat-input-bar button:first-child');
  }
  function findPlusMenu(){
    return $('#plusPillMenu') || $('.plus-pill-menu') || $('[data-plus-menu]') || $('#plusMenu') || $('.plus-menu');
  }
  function createPlusMenu(){
    let m = findPlusMenu();
    if(m) return m;
    m = document.createElement('div');
    m.id = 'plusPillMenu';
    m.className = 'plus-pill-menu';
    m.innerHTML = `<button type="button" data-action="send-file" style="display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;background:#1c1c1e;color:#fff;border:0;border-radius:12px;cursor:pointer;text-align:left;"><span>📁</span><span>Send file</span></button><button type="button" data-action="create-sticker" style="display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;background:#1c1c1e;color:#fff;border:0;border-radius:12px;cursor:pointer;text-align:left;"><span>✨</span><span>Create sticker</span></button><button type="button" data-action="camera" style="display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;background:#1c1c1e;color:#fff;border:0;border-radius:12px;cursor:pointer;text-align:left;"><span>📷</span><span>Camera</span></button>`;
    m.style.cssText = 'display:none;position:fixed;z-index:99999;background:#111;padding:10px;border-radius:16px;gap:8px;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.5);width:200px;';
    document.body.appendChild(m);
    return m;
  }
  function getPlusMenu(){ return findPlusMenu() || createPlusMenu(); }
  function positionPlusMenu(){
    const menu = getPlusMenu();
    const btn = findPlusBtn();
    if(!menu) return;
    if(menu.parentElement !== document.body) document.body.appendChild(menu);
    menu.style.position = 'fixed'; menu.style.zIndex = '99999';
    if(btn){
      const r = btn.getBoundingClientRect();
      const w = 210;
      menu.style.left = Math.max(10, Math.min(window.innerWidth - w - 10, r.left - 10)) + 'px';
      const h = menu.offsetHeight || 190;
      let top = r.top - h - 12;
      if(top < 10) top = r.bottom + 12;
      menu.style.top = top + 'px'; menu.style.bottom = 'auto'; menu.style.right = 'auto'; menu.style.width = w + 'px';
    } else { menu.style.left = '16px'; menu.style.bottom = '90px'; menu.style.top = 'auto'; }
  }
  function openPlusMenu(){
    const menu = getPlusMenu();
    if(!menu){ showToast('Plus menu not found'); return; }
    positionPlusMenu();
    menu.classList.remove('closing'); menu.classList.add('show'); menu.hidden = false;
    menu.style.display = 'flex'; menu.style.flexDirection = 'column'; menu.style.visibility = 'visible'; menu.style.opacity = '1'; menu.style.pointerEvents = 'auto'; menu.style.zIndex = '99999';
    isPlusOpen = true;
    stickerPanel?.classList.remove('show'); chatBackground.classList.remove('sticker-open');
    refresh(); requestAnimationFrame(positionPlusMenu);
  }
  function closePlusMenu(){
    const menu = findPlusMenu(); if(!menu) return;
    isPlusOpen = false;
    menu.classList.add('closing'); menu.classList.remove('show');
    menu.style.display = 'none'; menu.style.visibility = 'hidden'; menu.style.opacity = '0'; menu.style.pointerEvents = 'none';
    setTimeout(()=>{ if(!isPlusOpen) menu.classList.remove('closing'); },260);
  }
  window.nkOpenPlusMenu = openPlusMenu; window.nkClosePlusMenu = closePlusMenu; window.nkIsPlusOpen = ()=>isPlusOpen;
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('#inputPlusBtn, [data-plus], .input-plus-btn, .plus-btn, #plusBtn, [data-action="plus"]');
    if(!btn) return;
    if(!btn.closest('#chatBackground, .chat-input-bar, .chat-input, #chatInputBar')) {
      if(!btn.closest('.chat-input-bar') && document.querySelectorAll('#inputPlusBtn').length===0 && !e.target.closest('.chat-input-bar')) return;
    }
    e.preventDefault(); e.stopPropagation();
    if(isPlusOpen) closePlusMenu(); else openPlusMenu();
  }, true);
  const plusBtnDirect = findPlusBtn();
  if(plusBtnDirect && !plusBtnDirect.dataset.nkPlusBound){ plusBtnDirect.dataset.nkPlusBound = '1'; plusBtnDirect.style.pointerEvents = 'auto'; plusBtnDirect.style.cursor = 'pointer'; }
  document.addEventListener('click', (e)=>{
    if(!isPlusOpen) return;
    const menu = findPlusMenu(); if(!menu) return;
    if(menu.contains(e.target)) return;
    if(e.target.closest('#inputPlusBtn, [data-plus], .input-plus-btn, .plus-btn, #plusBtn')) return;
    closePlusMenu();
  }, true);
  document.addEventListener('click', (e)=>{
    const b = e.target.closest('#plusPillMenu [data-action], .plus-pill-menu [data-action], #plusMenu [data-action]');
    if(!b) return;
    e.stopPropagation(); e.preventDefault();
    const act = b.dataset.action;
    closePlusMenu();
    if(act==='send-file') galleryInput?.click();
    if(act==='camera') cameraInput?.click();
    if(act==='create-sticker'){ createPage?.classList.add('show'); ensureFFmpegLoaded(); refresh(); }
  });
  (function(){ const m = getPlusMenu(); if(m){ m.style.display='none'; m.style.visibility='hidden'; m.style.opacity='0'; m.style.pointerEvents='none'; } })();

  // ---------- INPUT LIMIT 2000 ----------
  function getLimitPopup(){ return $('#tooLongPopup') || $('#msgTooLongPopup') || $('[data-limit-popup]'); }
  function showLimitPopup(){
    const popup = getLimitPopup();
    if(!popup){ alert('Message is too long, it will be cut to 2000 characters'); return; }
    limitPopupOpen = true;
    popup.classList.remove('hidden'); popup.classList.add('show'); popup.hidden = false;
    popup.style.display = 'flex'; popup.style.visibility = 'visible'; popup.style.opacity = '1'; popup.style.pointerEvents = 'auto'; popup.style.zIndex = '99999';
    refresh();
  }
  function hideLimitPopup(){
    const popup = getLimitPopup(); if(!popup) return;
    limitPopupOpen = false;
    popup.classList.remove('show'); popup.classList.add('hidden');
    popup.style.display = 'none'; popup.style.visibility = 'hidden'; popup.style.opacity = '0'; popup.style.pointerEvents = 'none';
  }
  function bindLimitPopupOnce(){
    const popup = getLimitPopup(); if(!popup || popup.dataset.bound) return; popup.dataset.bound='1';
    popup.querySelectorAll('button, [data-too-long], [data-action], [data-limit-action]').forEach(btn=>{
      if(btn.dataset.limitBound) return; btn.dataset.limitBound='1';
      btn.addEventListener('click', (e)=>{
        e.stopPropagation(); e.preventDefault();
        const action = (btn.dataset.tooLong || btn.dataset.action || btn.dataset.limitAction || btn.textContent || '').toLowerCase().trim();
        const isOk = action.includes('ok') || action.includes('cut') || action.includes('yes') || action.includes('confirm') || btn.id.toLowerCase().includes('ok');
        const isCancel = action.includes('cancel') || action.includes('no') || action.includes('close') || btn.id.toLowerCase().includes('cancel');
        if(isOk){ if(msgInput){ msgInput.value = msgInput.value.slice(0,2000); lastValidInput = msgInput.value; } hideLimitPopup(); if(msgInput) msgInput.focus(); }
        else if(isCancel){ if(msgInput) msgInput.value = lastValidInput; hideLimitPopup(); if(msgInput) msgInput.focus(); }
        else { if(msgInput){ msgInput.value = msgInput.value.slice(0,2000); lastValidInput = msgInput.value; } hideLimitPopup(); }
      });
    });
    popup.addEventListener('click', (e)=>{ if(e.target === popup){ if(msgInput) msgInput.value = lastValidInput; hideLimitPopup(); } });
  }
  function checkInputLimit(){
    if(!msgInput) return;
    bindLimitPopupOnce();
    const v = msgInput.value;
    if(v.length > 2000){ if(!limitPopupOpen) showLimitPopup(); return; }
    lastValidInput = v;
    if(limitPopupOpen) hideLimitPopup();
  }
  if(msgInput){
    lastValidInput = msgInput.value || '';
    if(!msgInput.dataset.limitBound){
      msgInput.dataset.limitBound='1';
      msgInput.addEventListener('beforeinput', ()=>{ if(msgInput.value.length <= 2000) lastValidInput = msgInput.value; });
      msgInput.addEventListener('input', ()=>checkInputLimit());
      msgInput.addEventListener('paste', ()=>setTimeout(checkInputLimit, 0));
      msgInput.addEventListener('change', ()=>checkInputLimit());
    }
  }
  window.nkCheckInputLimit = checkInputLimit; window.nkShowLimitPopup = showLimitPopup; window.nkHideLimitPopup = hideLimitPopup;
  bindLimitPopupOnce();

  // ---------- READ MORE - When you send long text ----------
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.read-more-btn, [data-read-more]');
    if(!btn) return;
    e.preventDefault(); e.stopPropagation();
    let target = null;
    if(btn.dataset.target) target = document.getElementById(btn.dataset.target);
    if(!target) target = btn.closest('.about-wrap, .msg-wrap, .bubble, .contact-about-wrap, .group-about-wrap')?.querySelector('.about-text, .msg-text, .long-text, .contact-about-text, .group-about-text');
    if(!target) target = btn.previousElementSibling;
    if(!target) return;
    const exp = target.classList.toggle('expanded');
    target.classList.toggle('clamped', !exp);
    btn.textContent = exp ? 'Read Less' : 'Read More';
  });

  // ---------- HOLD - Media = NO hold ----------
  function enterFocusMode(row){
    if(!row || row.classList.contains('no-actions') || row.classList.contains('call-row') || row.classList.contains('deleted-row')) return;
    if(nkIsMediaRow(row)) return; // FIX: Image / Video = NO hold
    currentRow = row; currentId = row.dataset.messageId;
    const mediaEl = row.querySelector('.sticker-bubble img,.sticker-bubble video,.image-bubble img,.video-bubble video');
    if(mediaEl && favText && favIcon){
      const src = cleanSrc(mediaEl.src || mediaEl.currentSrc || '');
      const exists = [...stickers,...memoryVideoStickers].some(s=>cleanSrc(s.src)===src);
      favText.textContent = exists ? 'Remove from favorites' : 'Add to favorites';
      favIcon.setAttribute('data-lucide', exists ? 'x' : 'star'); refresh();
    }
    const bubble = row.querySelector('.bubble'); if(!bubble || !poppedClone) return;
    poppedClone.innerHTML = '';
    const clone = bubble.cloneNode(true); clone.classList.add('cloned-bubble');
    const badge = clone.querySelector('.msg-reaction-badge'); if(badge) badge.remove();
    clone.querySelectorAll('img,video').forEach(el=>{ el.style.pointerEvents='none'; el.style.display='block'; if(el.tagName==='VIDEO'){ el.muted=true; el.loop=true; el.autoplay=true; } });
    poppedClone.appendChild(clone);
    overlay?.classList.add('active'); poppedContainer?.classList.add('active','always-middle');
    poppedContainer?.classList.toggle('is-sticker', !!row.querySelector('.sticker-bubble'));
    chatBackground.classList.add('focus-mode');
    if(actionPill) actionPill.style.display='flex'; if(emojiBar) emojiBar.classList.remove('show');
    if(navigator.vibrate) navigator.vibrate(25); refresh();
  }
  function resetFocus(){
    overlay?.classList.remove('active'); poppedContainer?.classList.remove('active'); chatBackground.classList.remove('focus-mode');
    if(actionPill) actionPill.style.display='flex'; if(emojiBar) emojiBar.classList.remove('show'); currentRow=null; currentId=null;
  }
  window.closeHold = resetFocus;

  // ---------- VOICE PLAY ----------
  function ensureAudioForBubble(vb){
    let audio = vb.querySelector('audio');
    if(audio && audio.src) return audio;
    const src = vb.dataset.audioSrc || vb.querySelector('[data-audio-src]')?.dataset.audioSrc || '';
    if(!audio){ audio = document.createElement('audio'); audio.preload='auto'; vb.appendChild(audio); }
    if(src) audio.src = src;
    return audio;
  }
  function bindVoicePlay(vb){
    if(!vb || vb.dataset.voiceBound) return; vb.dataset.voiceBound='1';
    const btn = vb.querySelector('.voice-play-btn'); if(!btn) return;
    if(!btn.dataset.bound){
      btn.dataset.bound='1';
      if(!btn.querySelector('.play-ic')){ btn.innerHTML = `<i data-lucide="play" class="play-ic"></i><i data-lucide="pause" class="pause-ic" style="display:none"></i>`; refresh(); }
      const showPlay = ()=>{ const p=btn.querySelector('.play-ic'); const pa=btn.querySelector('.pause-ic'); if(p) p.style.display='block'; if(pa) pa.style.display='none'; vb.classList.remove('playing'); };
      const showPause = ()=>{ const p=btn.querySelector('.play-ic'); const pa=btn.querySelector('.pause-ic'); if(p) p.style.display='none'; if(pa) pa.style.display='block'; vb.classList.add('playing'); };
      btn.addEventListener('click', (e)=>{
        e.stopPropagation(); e.preventDefault();
        if(vb.classList.contains('is-loading')){ const ov = vb.querySelector('.media-loading-overlay'); if(ov) ov.hidden = true; vb.classList.remove('is-loading'); }
        const audio = ensureAudioForBubble(vb);
        if(!audio.src){
          try{ const ctx = new (window.AudioContext||window.webkitAudioContext)(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 440; gain.gain.value = 0.15; osc.start(); showPause(); setTimeout(()=>{ osc.stop(); ctx.close(); showPlay(); }, 800); }catch(err){ showToast('No voice file'); }
          return;
        }
        if(audio.paused){
          $$('.voice-bubble audio').forEach(a=>{ if(a!==audio){ a.pause(); a.currentTime=0; } });
          $$('.voice-bubble').forEach(b=>{ if(b!==vb){ b.classList.remove('playing'); const bp=b.querySelector('.play-ic'); const bpa=b.querySelector('.pause-ic'); if(bp) bp.style.display='block'; if(bpa) bpa.style.display='none'; } });
          audio.play().then(showPause).catch(()=>{ showToast('Tap again to play'); showPlay(); });
        } else { audio.pause(); showPlay(); }
        audio.onended = showPlay;
      });
    }
  }
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.voice-play-btn'); if(!btn) return;
    const vb = btn.closest('.voice-bubble'); if(!vb) return;
    if(!vb.dataset.voiceBound) bindVoicePlay(vb);
  }, true);

  // ---------- BIND ROW - Reaction + Image guard ----------
  function bindReactionRow(row){
    if(!row || row.dataset.reactionBound) return; row.dataset.reactionBound='1';
    if(row.classList.contains('no-actions')) return;
    let sx=0, sy=0;
    row.addEventListener('contextmenu', e=>{ e.preventDefault(); if(nkIsMediaRow(row)) return; enterFocusMode(row); return false; });
    row.addEventListener('touchstart', e=>{ if(chatBackground.classList.contains('focus-mode')) return; if(!e.touches[0]) return; if(nkIsMediaRow(row)) return; sx=e.touches[0].clientX; sy=e.touches[0].clientY; pressTimer=setTimeout(()=>enterFocusMode(row),480); }, {passive:true});
    row.addEventListener('touchmove', e=>{ if(!pressTimer) return; if(!e.touches[0]) return; if(Math.abs(e.touches[0].clientX-sx)>12 || Math.abs(e.touches[0].clientY-sy)>12){ clearTimeout(pressTimer); pressTimer=null; } }, {passive:true});
    row.addEventListener('touchend', ()=>{ clearTimeout(pressTimer); pressTimer=null; }, {passive:true});
    row.addEventListener('touchcancel', ()=>{ clearTimeout(pressTimer); pressTimer=null; }, {passive:true});
    // FIX: Tap image = preview only, Main JS handles it, Reaction JS must NOT open hold here
    row.addEventListener('click', e=>{
      if(nkIsMediaRow(row)) return;
      if(e.target.closest('.msg-reaction-badge')) return;
    });
    const badge = row.querySelector('.msg-reaction-badge');
    if(badge && !badge.dataset.bound){ badge.dataset.bound='1'; badge.addEventListener('click', e=>{ e.stopPropagation(); window.nkCurrentReactionRow = row; const pop = $('#reactionActionPopup'); if(pop) pop.classList.add('show'); }); }
    const sv = row.querySelector('.sticker-bubble video');
    if(sv && !sv.dataset.boundSticker){
      sv.dataset.boundSticker='1'; sv.muted=true; sv.playsInline=true; sv.preload='auto'; sv.setAttribute('muted',''); sv.setAttribute('playsinline',''); sv.setAttribute('webkit-playsinline',''); sv.loop=true; sv.autoplay=true;
      sv.addEventListener('canplay', ()=>sv.play().catch(()=>{}), {once:true}); setTimeout(()=>sv.play().catch(()=>{}),200);
      sv.addEventListener('click', (e)=>{ e.stopPropagation(); const b=row.querySelector('.bubble'); if(b && b.classList.contains('is-loading')) return; openVideoFull(cleanSrc(sv.src),''); });
    }
    const nv = row.querySelector('.video-bubble video,.video-wrap video');
    if(nv && !nv.dataset.boundNormal){
      nv.dataset.boundNormal='1'; nv.loop=false; nv.autoplay=false;
      nv.addEventListener('click', ()=>{ const b=row.querySelector('.bubble'); if(b && b.classList.contains('is-loading')) return; openVideoFull(cleanSrc(nv.src), row.querySelector('.img-caption-text')?.innerText||''); });
      const pc = row.querySelector('.video-play-center');
      if(pc && !pc.dataset.bound){ pc.dataset.bound='1'; pc.addEventListener('click', e=>{ e.stopPropagation(); const b=row.querySelector('.bubble'); if(b && b.classList.contains('is-loading')) return; openVideoFull(cleanSrc(nv.src), row.querySelector('.img-caption-text')?.innerText||''); }); }
    }
    const vb = row.querySelector('.voice-bubble'); if(vb) bindVoicePlay(vb);
  }
  $$('.msg-row').forEach(bindReactionRow);
  $$('.voice-bubble').forEach(bindVoicePlay);
  new MutationObserver(muts=>{ muts.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType===1 && n.classList?.contains('msg-row')) bindReactionRow(n); if(n.nodeType===1 && n.classList?.contains('voice-bubble')) bindVoicePlay(n); })); }).observe(chatMessages,{childList:true, subtree:true});

  // ---------- ACTION PILL - Reaction border ----------
  if(actionPill && !actionPill.dataset.bound){
    actionPill.dataset.bound='1';
    actionPill.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn || !currentId) return; const act = btn.dataset.action;
      if(act==='delete'){
        if(currentRow?.classList.contains('receiver')){ currentRow.style.transition='opacity .25s'; currentRow.style.opacity='0'; setTimeout(()=>{ if(currentRow) currentRow.remove(); },250); resetFocus(); showToast('Deleted for me'); }
        else if(window.enterSelectMode){ const r=currentRow; resetFocus(); window.enterSelectMode(); if(r) r.classList.add('selected'); }
      } else if(act==='select'){ const r=currentRow; resetFocus(); if(window.enterSelectMode) window.enterSelectMode(); if(r) r.classList.add('selected'); }
      else if(act==='react'){ actionPill.style.display='none'; emojiBar?.classList.add('show'); }
      else if(act==='reply'){ const r=currentRow; resetFocus(); setTimeout(()=>{ if(window.triggerSwipeReply) window.triggerSwipeReply(r); else if(r){ const t=r.querySelector('.msg-text')?.innerText||''; const rp=$('#replyPreview'); const rn=$('#replyPreviewName'); const rt=$('#replyPreviewText'); if(rn) rn.textContent=r.classList.contains('sender')?'You':'Joshua dayo'; if(rt) rt.textContent=t; if(rp) rp.classList.add('show'); msgInput?.focus(); } },150); }
      else if(act==='copy'){ const t=currentRow?.querySelector('.msg-text')?.innerText||''; if(t) navigator.clipboard?.writeText(t); showToast('Copied'); resetFocus(); }
      else if(act==='save'){ showToast('Saved'); resetFocus(); }
      else if(act==='favorite'){
        const imgEl = currentRow?.querySelector('.sticker-bubble img,.sticker-bubble video,.image-bubble img,.video-bubble video');
        if(!imgEl){ showToast('No media'); resetFocus(); return; }
        const src = cleanSrc(imgEl.src || imgEl.currentSrc || ''); const type = imgEl.tagName==='VIDEO' ? 'video' : 'image';
        let idx = stickers.findIndex(s=>cleanSrc(s.src)===src); let memIdx = memoryVideoStickers.findIndex(s=>cleanSrc(s.src)===src);
        if(idx>=0){ stickers.splice(idx,1); localStorage.setItem('my_stickers', JSON.stringify(stickers)); showToast('Removed from favorites'); }
        else if(memIdx>=0){ memoryVideoStickers.splice(memIdx,1); showToast('Removed from favorites'); }
        else { if(type==='video') memoryVideoStickers.push({src, type}); else { stickers.push({src, type}); localStorage.setItem('my_stickers', JSON.stringify(stickers)); } showToast('Added to favorites'); }
        renderStickers(); resetFocus();
      }
    });
  }
  if(emojiBar && !emojiBar.dataset.bound){
    emojiBar.dataset.bound='1';
    emojiBar.addEventListener('click', e=>{
      const btn = e.target.closest('[data-emoji]'); if(!btn || !currentId) return;
      const badge = document.getElementById(`reaction-${currentId}`) || currentRow?.querySelector('.msg-reaction-badge');
      if(badge){ badge.textContent = btn.dataset.emoji; badge.classList.add('show'); badge.dataset.reaction = btn.dataset.emoji; }
      resetFocus();
    });
  }
  if(emojiPlusBtn && !emojiPlusBtn.dataset.bound){
    emojiPlusBtn.dataset.bound='1';
    emojiPlusBtn.addEventListener('click', (e)=>{ e.stopPropagation(); stickerPanel?.classList.remove('show'); chatBackground.classList.remove('sticker-open'); if(emojiPickerPanel){ emojiPickerPanel.classList.add('show'); emojiPickerPanel.style.display='flex'; emojiPickerPanel.style.visibility='visible'; emojiPickerPanel.style.opacity='1'; chatBackground.classList.add('emoji-open'); } });
  }
  if(emojiPickerGrid && !emojiPickerGrid.dataset.bound){
    emojiPickerGrid.dataset.bound='1';
    const EMOJIS = ['❤️','😂','😮','😢','🙏','🔥','👍','👎','😍','😡','🥺','👏','💯','😅','🤔','🎉','😭','🙌','😇','🤣','😘','😴','👀','💔','✨','🌹','👋','🤝','😎','🫡'];
    if(!emojiPickerGrid.children.length){
      EMOJIS.forEach(em=>{
        const b=document.createElement('button'); b.textContent=em; b.type='button';
        b.addEventListener('click', ()=>{
          const row = window.nkCurrentReactionRow || currentRow;
          if(row){ const badge=row.querySelector('.msg-reaction-badge'); if(badge){ badge.textContent=em; badge.classList.add('show'); badge.dataset.reaction=em; } }
          if(emojiPickerPanel){ emojiPickerPanel.classList.remove('show'); emojiPickerPanel.style.display='none'; chatBackground.classList.remove('emoji-open'); }
          resetFocus();
        });
        emojiPickerGrid.appendChild(b);
      });
    }
  }
  const emojiPickerClose = $('#emojiPickerClose');
  if(emojiPickerClose && !emojiPickerClose.dataset.bound){ emojiPickerClose.dataset.bound='1'; emojiPickerClose.addEventListener('click', ()=>{ if(emojiPickerPanel){ emojiPickerPanel.classList.remove('show'); emojiPickerPanel.style.display='none'; chatBackground.classList.remove('emoji-open'); } }); }

  // ---------- STICKER ----------
  function forcePlayStickerVideos(){ $$('.sticker-item video,.sticker-bubble video').forEach(v=>{ if(v.paused){ v.muted=true; v.playsInline=true; v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline',''); v.play().catch(()=>{}); } }); }
  function renderStickers(){
    if(!stickerGrid || !stickerAddBox) return;
    stickerGrid.querySelectorAll('.sticker-item').forEach(e=>e.remove());
    const seen = new Set(); const all = [...memoryVideoStickers, ...stickers];
    all.forEach(item=>{
      const src = cleanSrc(item.src); if(!src || seen.has(src)) return; seen.add(src);
      const type = item.type||'image';
      const div = document.createElement('div'); div.className='sticker-item'+(type==='video'?' is-video':'');
      div.style.position='relative'; div.style.overflow='hidden'; div.style.background='#000'; div.style.borderRadius='12px'; div.style.webkitMaskImage='-webkit-radial-gradient(white, black)';
      if(type==='video'){
        const video = document.createElement('video'); video.muted=true; video.playsInline=true; video.preload='auto'; video.setAttribute('playsinline',''); video.setAttribute('webkit-playsinline',''); video.setAttribute('muted',''); video.style.width='100%'; video.style.height='100%'; video.style.objectFit='cover'; video.style.borderRadius='12px'; video.style.position='relative'; video.style.zIndex='2'; video.src = src; video.loop=true; video.autoplay=true;
        const tryPlay = ()=>video.play().catch(()=>{}); video.addEventListener('canplay', tryPlay, {once:true}); video.addEventListener('loadeddata', tryPlay, {once:true}); div.addEventListener('touchstart', tryPlay, {once:true}); setTimeout(tryPlay,120); div.appendChild(video);
      } else { const img=document.createElement('img'); img.src=src; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover'; div.appendChild(img); }
      div.onclick = ()=>sendSticker(src, type);
      stickerGrid.insertBefore(div, stickerAddBox);
    });
    refresh(); setTimeout(forcePlayStickerVideos,400);
  }
  function sendSticker(src, type='image'){
    const id='msg_'+Date.now(); const row=document.createElement('div'); row.className='msg-row sender'; row.dataset.messageId=id; row.dataset.owner='sender';
    const clean = cleanSrc(src); const time = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    if(type==='video'){
      row.innerHTML = `<div class="select-circle"><i data-lucide="check"></i></div><div class="swipe-reply-icon"><i data-lucide="reply"></i></div><div class="bubble sticker-bubble is-loading"><div class="sticker-media-wrap">${loadingHtml('sticker-loading')}</div><span class="msg-meta sticker-meta right-meta"><span class="msg-time">${time}</span><i data-lucide="check-check" class="tick-icon blue"></i></span><span class="msg-reaction-badge" id="reaction-${id}"></span></div>`;
      const wrap = row.querySelector('.sticker-media-wrap'); const video = document.createElement('video'); video.src=clean; video.muted=true; video.playsInline=true; video.preload='auto'; video.setAttribute('playsinline',''); video.setAttribute('webkit-playsinline',''); video.setAttribute('muted',''); video.style.borderRadius='12px'; video.loop=true; video.autoplay=true; wrap.prepend(video); video.addEventListener('canplay', ()=>video.play().catch(()=>{}), {once:true}); setTimeout(()=>video.play().catch(()=>{}),150); runLoading(row.querySelector('.bubble'));
    } else {
      row.innerHTML = `<div class="select-circle"><i data-lucide="check"></i></div><div class="swipe-reply-icon"><i data-lucide="reply"></i></div><div class="bubble sticker-bubble is-loading"><div class="sticker-media-wrap"><img src="${clean}">${loadingHtml('sticker-loading')}</div><span class="msg-meta sticker-meta right-meta"><span class="msg-time">${time}</span><i data-lucide="check-check" class="tick-icon blue"></i></span><span class="msg-reaction-badge" id="reaction-${id}"></span></div>`; runLoading(row.querySelector('.bubble'));
    }
    const typing = $('#typingIndicator'); if(typing) chatMessages.insertBefore(row, typing); else chatMessages.appendChild(row);
    bindReactionRow(row); refresh(); chatMessages.scrollTo({top:chatMessages.scrollHeight, behavior:'smooth'});
    stickerPanel?.classList.remove('show'); chatBackground.classList.remove('sticker-open');
  }
  function renderChatStickersSelect(){
    if(!stickerSelectGrid) return; stickerSelectGrid.innerHTML='';
    const favSrcs = new Set([...stickers,...memoryVideoStickers].map(s=>cleanSrc(s.src)));
    $$('.image-bubble img,.video-bubble video,.sticker-bubble img,.sticker-bubble video').forEach(el=>{
      const src = el.src||el.currentSrc; if(!src) return; const clean = cleanSrc(src); if(favSrcs.has(clean)) return;
      const div = document.createElement('div'); div.className='sticker-item selectable selected';
      if(el.tagName==='VIDEO'){ const v=document.createElement('video'); v.src=clean; v.muted=true; v.playsInline=true; v.setAttribute('muted',''); v.setAttribute('playsinline',''); div.appendChild(v); }
      else { const img=document.createElement('img'); img.src=clean; div.appendChild(img); }
      div.dataset.src=clean; div.dataset.type = el.tagName==='VIDEO' ? 'video' : 'image'; div.onclick = ()=>div.classList.toggle('selected'); stickerSelectGrid.appendChild(div);
    });
  }

  // ---------- FULL VIDEO ----------
  function openVideoFull(src, caption){
    if(!videoFullOverlay || !videoFullPlayer) return;
    videoFullPlayer.src = cleanSrc(src); if(videoFullCaption) videoFullCaption.textContent = caption||''; videoFullOverlay.classList.add('show'); videoFullPlayer.loop=false; videoFullPlayer.muted=false; videoFullPlayer.play().catch(()=>{}); refresh();
  }
  function closeVideoFull(){ videoFullOverlay?.classList.remove('show'); if(videoFullPlayer){ videoFullPlayer.pause(); videoFullPlayer.src=''; } }
  if(videoFullClose && !videoFullClose.dataset.bound){ videoFullClose.dataset.bound='1'; videoFullClose.addEventListener('click', e=>{ e.stopPropagation(); closeVideoFull(); }); }
  if(videoFullOverlay && !videoFullOverlay.dataset.bound){ videoFullOverlay.dataset.bound='1'; videoFullOverlay.addEventListener('click', e=>{ if(e.target===videoFullPlayer || e.target.closest('.video-full-caption') || e.target.closest('.preview-header')) return; closeVideoFull(); }); }

  // ---------- PREVIEW - Image select = preview only ----------
  function openPreview(src, type='image'){
    if(!imagePreview) return; previewType=type; previewObjectUrl=src;
    if(type==='video'){ if(previewImage) previewImage.style.display='none'; if(previewVideo){ previewVideo.src=cleanSrc(src); previewVideo.style.display='block'; } }
    else { if(previewVideo){ previewVideo.style.display='none'; previewVideo.pause(); } if(previewImage){ previewImage.src=cleanSrc(src); previewImage.style.display='block'; } }
    imagePreview.classList.add('show'); imagePreview.style.display='flex'; imagePreview.style.visibility='visible'; imagePreview.style.opacity='1'; refresh();
  }
  function handleFile(file){ if(!file) return; openPreview(URL.createObjectURL(file), file.type.startsWith('video/')?'video':'image'); }
  if(galleryInput && !galleryInput.dataset.reactionBound){ galleryInput.dataset.reactionBound='1'; window.nkGalleryHandled=true; galleryInput.addEventListener('change', e=>handleFile(e.target.files[0])); }
  if(cameraInput && !cameraInput.dataset.reactionBound){ cameraInput.dataset.reactionBound='1'; cameraInput.addEventListener('change', e=>handleFile(e.target.files[0])); }
  function closePreview(){ imagePreview?.classList.remove('show'); if(imagePreview) imagePreview.style.display='none'; if(previewVideo){ previewVideo.pause(); previewVideo.src=''; } if(captionInput) captionInput.value=''; }
  if(previewClose && !previewClose.dataset.bound){ previewClose.dataset.bound='1'; previewClose.addEventListener('click', closePreview); }
  if(previewCancelText && !previewCancelText.dataset.bound){ previewCancelText.dataset.bound='1'; previewCancelText.addEventListener('click', closePreview); }
  if(imagePreview && !imagePreview.dataset.bound){ imagePreview.dataset.bound='1'; imagePreview.addEventListener('click', e=>{ if(e.target===imagePreview || e.target.classList.contains('preview-blur-bg')) closePreview(); }); }
  if(previewSendBtn && !previewSendBtn.dataset.bound){
    previewSendBtn.dataset.bound='1';
    previewSendBtn.addEventListener('click', ()=>{
      const caption = captionInput?.value.trim()||''; const replyData = window.getCurrentReplyData ? window.getCurrentReplyData() : null;
      let quotedHtml=''; if(replyData){ quotedHtml=`<div class="quoted-reply">${replyData.thumb?`<img class="quoted-thumb" src="${replyData.thumb}">`:''}<div class="quoted-content"><span class="quoted-name">${replyData.name}</span><span class="quoted-text">${replyData.text}</span></div></div>`; }
      const id='msg_'+Date.now(); const row=document.createElement('div'); row.className='msg-row sender'; row.dataset.messageId=id; row.dataset.owner='sender';
      const clean = cleanSrc(previewObjectUrl); const time = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      if(previewType==='video'){ row.innerHTML=`<div class="select-circle"><i data-lucide="check"></i></div><div class="swipe-reply-icon"><i data-lucide="reply"></i></div><div class="bubble video-bubble with-caption is-loading">${quotedHtml}<div class="video-wrap"><video src="${clean}"></video><button class="video-play-center"><i data-lucide="play"></i></button><span class="video-duration">00:10</span>${loadingHtml('')}<span class="msg-meta over-image right-meta"><span class="msg-time">${time}</span><i data-lucide="check-check" class="tick-icon blue"></i></span></div>${caption?`<div class="img-caption-wrap"><p class="img-caption-text">${caption}</p></div>`:''}<span class="msg-reaction-badge" id="reaction-${id}"></span></div>`; }
      else if(caption){ row.innerHTML=`<div class="select-circle"><i data-lucide="check"></i></div><div class="swipe-reply-icon"><i data-lucide="reply"></i></div><div class="bubble image-bubble with-caption is-loading">${quotedHtml}<div class="img-wrap"><img src="${clean}">${loadingHtml('')}<span class="msg-meta over-image right-meta"><span class="msg-time">${time}</span><i data-lucide="check-check" class="tick-icon blue"></i></span></div><div class="img-caption-wrap"><p class="img-caption-text">${caption}</p></div><span class="msg-reaction-badge" id="reaction-${id}"></span></div>`; }
      else { row.innerHTML=`<div class="select-circle"><i data-lucide="check"></i></div><div class="swipe-reply-icon"><i data-lucide="reply"></i></div><div class="bubble image-bubble is-loading">${quotedHtml}<div class="img-wrap"><img src="${clean}">${loadingHtml('')}<span class="msg-meta over-image right-meta"><span class="msg-time">${time}</span><i data-lucide="check-check" class="tick-icon blue"></i></span></div><span class="msg-reaction-badge" id="reaction-${id}"></span></div>`; }
      const typing = $('#typingIndicator'); if(typing) chatMessages.insertBefore(row, typing); else chatMessages.appendChild(row);
      bindReactionRow(row); refresh(); closePreview(); runLoading(row.querySelector('.bubble'));
      if(galleryInput) galleryInput.value=''; if(cameraInput) cameraInput.value=''; if(window.clearReplyData) window.clearReplyData(); chatMessages.scrollTo({top:chatMessages.scrollHeight, behavior:'smooth'});
    });
  }

  // ---------- STICKER PANEL - Under input on mobile ----------
  if(stickerBtn && !stickerBtn.dataset.bound){
    stickerBtn.dataset.bound='1';
    stickerBtn.addEventListener('click', (e)=>{
      e.stopPropagation(); e.preventDefault();
      emojiPickerPanel?.classList.remove('show'); if(emojiPickerPanel) emojiPickerPanel.style.display='none'; chatBackground.classList.remove('emoji-open');
      if(emojiBar) emojiBar.classList.remove('show');
      const isShow = stickerPanel?.classList.contains('show');
      if(isShow){ stickerPanel.classList.remove('show'); chatBackground.classList.remove('sticker-open'); }
      else { renderStickers(); if(msgInput) msgInput.blur(); stickerPanel?.classList.add('show'); chatBackground.classList.add('sticker-open'); closePlusMenu(); refresh(); setTimeout(forcePlayStickerVideos,400); }
    });
  }
  const spClose = $('#stickerPanelClose');
  if(spClose && !spClose.dataset.bound){ spClose.dataset.bound='1'; spClose.addEventListener('click', ()=>{ stickerPanel?.classList.remove('show'); chatBackground.classList.remove('sticker-open'); }); }
  if(msgInput && !msgInput.dataset.stickerBound){ msgInput.dataset.stickerBound='1'; msgInput.addEventListener('focus', ()=>{ if(stickerPanel?.classList.contains('show')){ stickerPanel.classList.remove('show'); chatBackground.classList.remove('sticker-open'); } }); }
  if(stickerAddBox && !stickerAddBox.dataset.bound){ stickerAddBox.dataset.bound='1'; stickerAddBox.addEventListener('click', ()=>{ renderChatStickersSelect(); chatStickerSelectMode?.classList.add('show'); stickerPanel?.classList.remove('show'); chatBackground.classList.remove('sticker-open'); refresh(); }); }
  if(chatStickerSelectMode && !chatStickerSelectMode.dataset.bound){
    chatStickerSelectMode.dataset.bound='1';
    addStickerConfirmBtn?.addEventListener('click', ()=>{
      $$('.sticker-item.selected', chatStickerSelectMode).forEach(el=>{
        const src = cleanSrc(el.dataset.src); const type = el.dataset.type||'image';
        const exists = [...stickers,...memoryVideoStickers].some(s=>cleanSrc(s.src)===src);
        if(!exists){ if(type==='video') memoryVideoStickers.push({src, type}); else { stickers.push({src, type}); localStorage.setItem('my_stickers', JSON.stringify(stickers)); } }
      });
      renderStickers(); chatStickerSelectMode.classList.remove('show'); if(msgInput) msgInput.blur(); stickerPanel?.classList.add('show'); chatBackground.classList.add('sticker-open'); showToast('Sticker added'); setTimeout(forcePlayStickerVideos,300);
    });
    stickerSelectClose?.addEventListener('click', ()=>chatStickerSelectMode.classList.remove('show'));
    addStickerCancelX?.addEventListener('click', ()=>chatStickerSelectMode.classList.remove('show'));
    chatStickerSelectMode.addEventListener('click', e=>{ if(e.target===chatStickerSelectMode) chatStickerSelectMode.classList.remove('show'); });
  }

  // ---------- FFMPEG - Real cut, NO fake ----------
  async function ensureFFmpegLoaded(){
    if(ffmpegLoaded) return ffmpegInstance; if(ffmpegLoading) return null; ffmpegLoading=true;
    try{
      if(ffmpegLoader){ ffmpegLoader.classList.add('show'); ffmpegLoader.style.display='flex'; }
      if(!window.FFmpeg){ await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
      if(!window.FFmpeg) throw new Error('ffmpeg not loaded');
      const { createFFmpeg, fetchFile } = window.FFmpeg; window.FFmpeg.fetchFile = fetchFile;
      ffmpegInstance = createFFmpeg({log:false, corePath:'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js'});
      await ffmpegInstance.load(); ffmpegLoaded=true; showToast('Editor ready');
    } catch(e){ console.log('ffmpeg fallback', e); ffmpegLoaded=false; }
    finally { ffmpegLoading=false; if(ffmpegLoader){ ffmpegLoader.classList.remove('show'); ffmpegLoader.style.display='none'; } }
    return ffmpegInstance;
  }
  async function cutVideoWithFFmpeg(file, start, end){
    const duration = Math.min(6, Math.max(0.2, end - start));
    if(cuttingLoader){ cuttingLoader.classList.add('show'); cuttingLoader.style.display='flex'; const txt=cuttingLoader.querySelector('.cut-text'); if(txt) txt.textContent=`Cutting video to ${duration.toFixed(1)}s...`; }
    try{
      const ffmpeg = await ensureFFmpegLoaded();
      if(!ffmpeg || !ffmpegLoaded) throw new Error('FFmpeg not ready - cannot fake cut');
      const input='input.mp4', output='output.mp4';
      ffmpeg.FS('writeFile', input, await window.FFmpeg.fetchFile(file));
      await ffmpeg.run('-ss', `${start}`, '-to', `${end}`, '-i', input, '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-t', `${duration}`, '-movflags', '+faststart', output);
      const data = ffmpeg.FS('readFile', output); const blob = new Blob([data.buffer], {type:'video/mp4'});
      try{ ffmpeg.FS('unlink', input); ffmpeg.FS('unlink', output); }catch(e){}
      return URL.createObjectURL(blob);
    } finally { if(cuttingLoader){ cuttingLoader.classList.remove('show'); cuttingLoader.style.display='none'; } }
  }
  window.cutVideoWithFFmpeg = cutVideoWithFFmpeg;

  // ---------- CREATE STICKER - Different background from Send File (CSS) ----------
  function closeCreatePage(){
    createPage?.classList.remove('show');
    if(createImage){ createImage.src=''; createImage.style.display='none'; }
    if(createVideo){ createVideo.src=''; createVideo.style.display='none'; createVideo.pause(); createVideo.ontimeupdate=null; }
    if(createPlaceholder) createPlaceholder.style.display='flex';
    if(textOverlay) textOverlay.textContent='';
    if(textOverlayWrapper){ textOverlayWrapper.style.display='none'; textOverlayWrapper.style.left='50%'; textOverlayWrapper.style.top='50%'; textOverlayWrapper.style.transform='translate(-50%,-50%)'; }
    if(videoTrimBar) videoTrimBar.style.display='none';
    if(stickerFileInput) stickerFileInput.value='';
    cropScale=1; cropX=0; cropY=0; originalVideoFile=null;
    if(createImage) createImage.style.transform='translate(0px,0px) scale(1)';
    if(createVideo) createVideo.style.transform='translate(0px,0px) scale(1)';
  }
  let isDraggingText=false, sdX=0, sdY=0, sLeft=0, sTop=0;
  if(textOverlayWrapper && !textOverlayWrapper.dataset.bound){
    textOverlayWrapper.dataset.bound='1';
    const startDrag = (cx,cy)=>{ isDraggingText=true; sdX=cx; sdY=cy; const r=textOverlayWrapper.getBoundingClientRect(); const pr=createCanvasEl.getBoundingClientRect(); sLeft=r.left-pr.left; sTop=r.top-pr.top; };
    textOverlayWrapper.addEventListener('touchstart', e=>{ if(e.target.classList.contains('resize-handle')) return; startDrag(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
    textOverlayWrapper.addEventListener('touchmove', e=>{ if(!isDraggingText) return; e.preventDefault(); textOverlayWrapper.style.left=(sLeft + e.touches[0].clientX - sdX)+'px'; textOverlayWrapper.style.top=(sTop + e.touches[0].clientY - sdY)+'px'; }, {passive:false});
    textOverlayWrapper.addEventListener('touchend', ()=>isDraggingText=false);
    textOverlayWrapper.addEventListener('mousedown', e=>{ startDrag(e.clientX, e.clientY); e.preventDefault(); });
    window.addEventListener('mousemove', e=>{ if(!isDraggingText) return; textOverlayWrapper.style.left=(sLeft + e.clientX - sdX)+'px'; textOverlayWrapper.style.top=(sTop + e.clientY - sdY)+'px'; });
    window.addEventListener('mouseup', ()=>isDraggingText=false);
  }
  function updateCropTransform(){ const t=`translate(${cropX}px, ${cropY}px) scale(${cropScale})`; if(createImage && createImage.style.display!=='none') createImage.style.transform=t; if(createVideo && createVideo.style.display!=='none') createVideo.style.transform=t; }
  function initIphoneCrop(){
    if(!createCanvasEl || createCanvasEl.dataset.bound) return; createCanvasEl.dataset.bound='1';
    let isDraggingCrop=false;
    createCanvasEl.addEventListener('touchstart', e=>{ if(e.target.closest('#textOverlayWrapper')) return; if(e.touches.length===1){ isDraggingCrop=true; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY; } else if(e.touches.length===2){ lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); } }, {passive:true});
    createCanvasEl.addEventListener('touchmove', e=>{
      if(e.target.closest('#textOverlayWrapper')) return;
      if(e.touches.length===1 && isDraggingCrop){ const dx=e.touches[0].clientX-lastX, dy=e.touches[0].clientY-lastY; cropX+=dx; cropY+=dy; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY; updateCropTransform(); }
      else if(e.touches.length===2){ const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); if(lastDist>0){ cropScale*=dist/lastDist; cropScale=Math.max(1,Math.min(3,cropScale)); updateCropTransform(); } lastDist=dist; }
      if(e.touches.length>0) e.preventDefault();
    }, {passive:false});
    createCanvasEl.addEventListener('touchend', ()=>{ isDraggingCrop=false; lastDist=0; });
    createCanvasEl.addEventListener('mousedown', e=>{ if(e.target.closest('#textOverlayWrapper')) return; isDraggingCrop=true; lastX=e.clientX; lastY=e.clientY; });
    window.addEventListener('mousemove', e=>{ if(!isDraggingCrop) return; const dx=e.clientX-lastX, dy=e.clientY-lastY; cropX+=dx; cropY+=dy; lastX=e.clientX; lastY=e.clientY; updateCropTransform(); });
    window.addEventListener('mouseup', ()=>isDraggingCrop=false);
    createCanvasEl.addEventListener('wheel', e=>{ e.preventDefault(); cropScale+= e.deltaY<0 ? 0.1 : -0.1; cropScale=Math.max(1,Math.min(3,cropScale)); updateCropTransform(); }, {passive:false});
  }
  initIphoneCrop();
  if(createPlaceholder && !createPlaceholder.dataset.bound){ createPlaceholder.dataset.bound='1'; createPlaceholder.addEventListener('click', ()=>stickerFileInput?.click()); }
  if(stickerFileInput && !stickerFileInput.dataset.bound){
    stickerFileInput.dataset.bound='1';
    stickerFileInput.addEventListener('change', e=>{
      const file = e.target.files[0]; if(!file) return;
      originalVideoFile = file.type.startsWith('video/') ? file : null;
      const url = URL.createObjectURL(file); cropScale=1; cropX=0; cropY=0;
      if(file.type.startsWith('video/')){
        if(createImage) createImage.style.display='none';
        if(createVideo){ createVideo.src=url; createVideo.style.display='block'; createVideo.load(); createVideo.style.transform='translate(0px,0px) scale(1)'; }
        if(videoTrimBar) videoTrimBar.style.display='flex';
        if(trimStart){ trimStart.min=0; trimStart.value=0; }
        if(trimEnd) trimEnd.value=6;
        if(trimLabel) trimLabel.textContent='0.0s - 6.0s (max 6s)';
        if(createVideo){ createVideo.addEventListener('loadedmetadata', ()=>{ const dur = createVideo.duration; if(trimStart) trimStart.max=dur; if(trimEnd){ trimEnd.max=dur; trimEnd.value=Math.min(dur,6); } if(trimStart) trimStart.value=0; if(trimLabel) trimLabel.textContent=`${parseFloat(trimStart.value).toFixed(1)}s - ${parseFloat(trimEnd.value).toFixed(1)}s`; createVideo.currentTime=0; createVideo.ontimeupdate = ()=>{ const s=parseFloat(trimStart.value)||0, en=parseFloat(trimEnd.value)||6; if(createVideo.currentTime>=en) createVideo.currentTime=s; }; }, {once:true}); }
        ensureFFmpegLoaded();
      } else {
        if(createVideo){ createVideo.style.display='none'; createVideo.pause(); createVideo.ontimeupdate=null; }
        if(createImage){ createImage.src=url; createImage.style.display='block'; createImage.style.transform='translate(0px,0px) scale(1)'; }
        if(videoTrimBar) videoTrimBar.style.display='none';
      }
      if(createPlaceholder) createPlaceholder.style.display='none';
      if(textOverlayWrapper){ textOverlayWrapper.style.display='flex'; textOverlayWrapper.style.left='50%'; textOverlayWrapper.style.top='55%'; textOverlayWrapper.style.transform='translate(-50%,-50%)'; }
    });
  }
  if(trimStart && !trimStart.dataset.bound){ trimStart.dataset.bound='1'; trimStart.addEventListener('input', ()=>{ let s=parseFloat(trimStart.value), en=parseFloat(trimEnd.value); if(s>=en-0.2) trimStart.value=(en-0.2).toFixed(1); if((parseFloat(trimEnd.value)-parseFloat(trimStart.value))>6) trimEnd.value=(parseFloat(trimStart.value)+6).toFixed(1); if(trimLabel) trimLabel.textContent=`${parseFloat(trimStart.value).toFixed(1)}s - ${parseFloat(trimEnd.value).toFixed(1)}s`; if(createVideo) createVideo.currentTime=parseFloat(trimStart.value); }); }
  if(trimEnd && !trimEnd.dataset.bound){ trimEnd.dataset.bound='1'; trimEnd.addEventListener('input', ()=>{ let s=parseFloat(trimStart.value), en=parseFloat(trimEnd.value); if(en<=s+0.2) trimEnd.value=(s+0.2).toFixed(1); if((parseFloat(trimEnd.value)-parseFloat(trimStart.value))>6){ trimEnd.value=(parseFloat(trimStart.value)+6).toFixed(1); showToast('Max 6 seconds'); } if(trimLabel) trimLabel.textContent=`${parseFloat(trimStart.value).toFixed(1)}s - ${parseFloat(trimEnd.value).toFixed(1)}s`; }); }
  if(addTextBtn && !addTextBtn.dataset.bound){ addTextBtn.dataset.bound='1'; addTextBtn.addEventListener('click', ()=>{ if(textOverlayWrapper) textOverlayWrapper.style.display='flex'; if(textOverlay) textOverlay.focus(); }); }
  if(boldTextBtn && !boldTextBtn.dataset.bound){ boldTextBtn.dataset.bound='1'; boldTextBtn.addEventListener('click', ()=>{ if(!textOverlay) return; textOverlay.classList.toggle('bold'); textOverlay.focus(); }); }
  if(zoomTextBtn && !zoomTextBtn.dataset.bound){ zoomTextBtn.dataset.bound='1'; zoomTextBtn.addEventListener('click', ()=>{ textScale = textScale>=1.8 ? 1 : textScale+0.2; if(textOverlay) textOverlay.style.transform=`scale(${textScale})`; }); }
  if(cropBtn && !cropBtn.dataset.bound){ cropBtn.dataset.bound='1'; cropBtn.addEventListener('click', ()=>{ isCropped=!isCropped; showToast(isCropped ? 'Crop mode: drag & pinch image' : 'Crop reset'); if(!isCropped){ cropScale=1; cropX=0; cropY=0; updateCropTransform(); } }); }
  function bakeImageWithTextAndCrop(src, cb){
    const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=512; const ctx=canvas.getContext('2d');
    const img=new Image(); img.src=src;
    img.onload=()=>{
      ctx.clearRect(0,0,512,512); ctx.save(); const rect = createCanvasEl.getBoundingClientRect(); const ratio = 512 / rect.width; ctx.translate(256 + cropX*ratio, 256 + cropY*ratio); ctx.scale(cropScale, cropScale); ctx.drawImage(img,-256,-256,512,512); ctx.restore();
      if(textOverlay && textOverlay.textContent.trim() && textOverlayWrapper.style.display!=='none'){
        const wRect=textOverlayWrapper.getBoundingClientRect(); const cRect=createCanvasEl.getBoundingClientRect(); const relX=((wRect.left+wRect.width/2)-cRect.left)/cRect.width*512; const relY=((wRect.top+wRect.height/2)-cRect.top)/cRect.height*512; const fontSize=Math.round(22*textScale); ctx.font=`${textOverlay.classList.contains('bold')?'900':'800'} ${fontSize}px sans-serif`; ctx.fillStyle='white'; ctx.strokeStyle='black'; ctx.lineWidth=4; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.strokeText(textOverlay.textContent, relX, relY); ctx.fillText(textOverlay.textContent, relX, relY);
      }
      cb(canvas.toDataURL('image/png'));
    }; img.onerror=()=>cb(src);
  }
  if(createAddBtn && !createAddBtn.dataset.bound){
    createAddBtn.dataset.bound='1';
    createAddBtn.addEventListener('click', async ()=>{
      const hasImage = createImage && createImage.src && createImage.style.display!=='none' && createImage.src!=='';
      const hasVideo = createVideo && createVideo.src && createVideo.style.display!=='none' && createVideo.src!=='';
      if(!hasImage && !hasVideo){ showToast('Select image or video first'); return; }
      createAddBtn.disabled=true; createAddBtn.textContent='Adding...';
      try{
        if(hasVideo){
          const start = parseFloat(trimStart.value)||0; const end = parseFloat(trimEnd.value)||6; if((end-start)>6.1){ showToast('Max 6 seconds'); return; } if(!originalVideoFile){ showToast('No video file'); return; }
          const finalSrc = await cutVideoWithFFmpeg(originalVideoFile, start, end); memoryVideoStickers.push({src:cleanSrc(finalSrc), type:'video'}); renderStickers(); closeCreatePage(); showToast('Video sticker added - 6s real cut');
        } else if(hasImage){ bakeImageWithTextAndCrop(createImage.src, (finalSrc)=>{ stickers.push({src:finalSrc, type:'image'}); localStorage.setItem('my_stickers', JSON.stringify(stickers)); renderStickers(); closeCreatePage(); showToast('Sticker added'); }); return; }
      } catch(err){ console.error(err); showToast('Error cutting - try again, FFmpeg needs https'); }
      finally { createAddBtn.disabled=false; createAddBtn.textContent='Add'; setTimeout(()=>{ if(stickerPanel){ stickerPanel.classList.add('show'); chatBackground.classList.add('sticker-open'); } refresh(); setTimeout(forcePlayStickerVideos,400); },150); }
    });
  }
  if(createClose && !createClose.dataset.bound){ createClose.dataset.bound='1'; createClose.addEventListener('click', closeCreatePage); }
  if(createBack && !createBack.dataset.bound){ createBack.dataset.bound='1'; createBack.addEventListener('click', closeCreatePage); }
  if(createCancelBtn && !createCancelBtn.dataset.bound){ createCancelBtn.dataset.bound='1'; createCancelBtn.addEventListener('click', closeCreatePage); }
  if(createPage && !createPage.dataset.bound){ createPage.dataset.bound='1'; createPage.addEventListener('click', e=>{ if(e.target===createPage) closeCreatePage(); }); }

  // ---------- VOICE RECORDING ----------
  let mediaRecorder=null, audioChunks=[], audioStream=null, isRecording=false, shouldSend=false, voiceInterval=null, voiceSec=0, voiceStartTime=0;
  function animateWave(){ if(!voiceWaveBig) return; voiceWaveBig.querySelectorAll('span').forEach(sp=>{ sp.style.height=(8+Math.random()*22)+'px'; }); }
  async function startVoice(){
    try{
      audioChunks=[]; voiceSec=0; voiceStartTime=Date.now(); if(voiceTimer) voiceTimer.textContent='0:00';
      const stream = await navigator.mediaDevices.getUserMedia({audio:true}); audioStream=stream;
      mediaRecorder = new MediaRecorder(stream,{mimeType:'audio/webm'}); mediaRecorder.ondataavailable = e=>{ if(e.data && e.data.size>0) audioChunks.push(e.data); }; mediaRecorder.start(100); isRecording=true; shouldSend=false;
      voiceOverlay?.classList.add('show'); chatBackground.classList.add('voice-open');
      if(voiceInterval) clearInterval(voiceInterval);
      voiceInterval = setInterval(()=>{ const diff=Math.floor((Date.now()-voiceStartTime)/1000); voiceSec=diff; const m=Math.floor(diff/60), s=diff%60; if(voiceTimer) voiceTimer.textContent=`${m}:${String(s).padStart(2,'0')}`; animateWave(); },200);
      if(navigator.vibrate) navigator.vibrate(30);
    } catch(err){ showToast('Mic permission denied - use https'); isRecording=false; }
  }
  function cleanupStream(){ if(audioStream){ audioStream.getTracks().forEach(t=>t.stop()); audioStream=null; } if(voiceInterval) clearInterval(voiceInterval); voiceInterval=null; }
  function sendVoiceMessage(){
    if(audioChunks.length===0){ cleanupStream(); return; }
    const blob = new Blob(audioChunks,{type:'audio/webm'}); const url = URL.createObjectURL(blob);
    const id='msg_'+Date.now(); const timeStr = voiceTimer ? voiceTimer.textContent : `0:${String(voiceSec).padStart(2,'0')}`;
    const row = document.createElement('div'); row.className='msg-row sender'; row.dataset.messageId=id; row.dataset.owner='sender';
    row.innerHTML = `<div class="select-circle"><i data-lucide="check"></i></div><div class="bubble voice-bubble is-loading"><div class="voice-play-wrap"><button class="voice-play-btn"><i data-lucide="play"></i></button>${loadingHtml('voice-loading')}</div><div class="voice-wave"><span></span><span></span><span></span><span></span></div><span class="voice-duration">0:00</span><span class="msg-meta right-meta"><span class="msg-time">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span><i data-lucide="check-check" class="tick-icon blue"></i></span><span class="msg-reaction-badge" id="reaction-${id}"></span><audio src="${url}"></audio></div>`;
    const typing = $('#typingIndicator'); if(typing) chatMessages.insertBefore(row, typing); else chatMessages.appendChild(row);
    bindReactionRow(row); refresh(); chatMessages.scrollTo({top:chatMessages.scrollHeight, behavior:'smooth'});
    runLoading(row.querySelector('.bubble'), ()=>{ const durEl=row.querySelector('.voice-duration'); if(durEl) durEl.textContent=timeStr; });
    cleanupStream(); audioChunks=[];
  }
  function stopVoice(send){
    shouldSend=send;
    if(!mediaRecorder || mediaRecorder.state==='inactive'){ voiceOverlay?.classList.remove('show'); chatBackground.classList.remove('voice-open'); cleanupStream(); isRecording=false; return; }
    mediaRecorder.onstop = ()=>{ if(shouldSend && voiceSec>=1) sendVoiceMessage(); else { cleanupStream(); audioChunks=[]; } voiceOverlay?.classList.remove('show'); chatBackground.classList.remove('voice-open'); isRecording=false; voiceSec=0; };
    mediaRecorder.stop();
  }
  let micPressTimer=null;
  if(micBtn && !micBtn.dataset.voiceBound){
    micBtn.dataset.voiceBound='1';
    micBtn.addEventListener('pointerdown', e=>{ if(msgInput && msgInput.value.trim().length>0) return; e.preventDefault(); if(isRecording) return; micPressTimer=setTimeout(()=>{ startVoice(); },200); });
    micBtn.addEventListener('pointerup', e=>{ clearTimeout(micPressTimer); e.preventDefault(); if(msgInput && msgInput.value.trim().length>0) return; if(isRecording) stopVoice(true); });
    micBtn.addEventListener('pointerleave', ()=>clearTimeout(micPressTimer));
  }
  if(voiceCancelBtn && !voiceCancelBtn.dataset.bound){ voiceCancelBtn.dataset.bound='1'; voiceCancelBtn.addEventListener('click', ()=>stopVoice(false)); }
  if(voiceStopBtn && !voiceStopBtn.dataset.bound){ voiceStopBtn.dataset.bound='1'; voiceStopBtn.addEventListener('click', ()=>stopVoice(false)); }
  if(voiceSendBtn && !voiceSendBtn.dataset.bound){ voiceSendBtn.dataset.bound='1'; voiceSendBtn.addEventListener('click', ()=>stopVoice(true)); }

  // ---------- ESC ----------
  document.addEventListener('keydown', e=>{
    if(e.key!=='Escape') return;
    if(createPage?.classList.contains('show')) closeCreatePage();
    else if(voiceOverlay?.classList.contains('show')) stopVoice(false);
    else if(videoFullOverlay?.classList.contains('show')) closeVideoFull();
    else if(imagePreview?.classList.contains('show')) closePreview();
    else if(isPlusOpen) closePlusMenu();
    else if(emojiPickerPanel?.classList.contains('show')){ emojiPickerPanel.classList.remove('show'); emojiPickerPanel.style.display='none'; chatBackground.classList.remove('emoji-open'); }
    else if(limitPopupOpen) hideLimitPopup();
    else resetFocus();
  });
  overlay?.addEventListener('click', ()=>resetFocus());

  setInterval(forcePlayStickerVideos,2500);
  renderStickers(); renderChatStickersSelect();
  setTimeout(forcePlayStickerVideos,700);
  refresh();
  console.log('NK Reaction: plusBtn found =', !!findPlusBtn(), 'plusMenu found/created =', !!findPlusMenu());
})();