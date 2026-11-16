// ==========================
// main.js - CHAT LIST + MOOD PILL + INPUT + CONTACT / GROUP INFO + DELETE
// CLEAN - No random, no confirm(), no emoji in UI
// ==========================
const list = document.querySelector('.chat-load-list');
const chatLoadList = document.querySelector('.chat-load-list');
const chatBg = document.querySelector('.chat-background');
const chatRightWrap = document.getElementById('chatRightWrap');
const chatContainer = document.getElementById('chatContainer');
const title = document.getElementById('chatListTitle');
const backBtn = document.getElementById('closeChatBtn') || document.querySelector('.arrow-icon');
const tabs = document.querySelectorAll('.tab-btn');

const avatarGradients = [
  "linear-gradient(135deg, #FF6B6B, #EE5A24)",
  "linear-gradient(135deg, #70A1FF, #1E90FF)",
  "linear-gradient(135deg, #7BED9F, #2ED573)",
  "linear-gradient(135deg, #FFA502, #FF7F50)",
  "linear-gradient(135deg, #A29BFE, #6C5CE7)",
  "linear-gradient(135deg, #7ED6DF, #0984E3)",
  "linear-gradient(135deg, #FD79A8, #E84393)",
  "linear-gradient(135deg, #55EFC4, #00B894)"
];

function getInitials(name){
  const n = (name || "User").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase().slice(0,2);
}
function gradientFor(name){
  let h = 0;
  for(let i=0;i<name.length;i++) h += name.charCodeAt(i);
  return avatarGradients[h % avatarGradients.length];
}

function handleScroll(){
  const scrollTop = list ? list.scrollTop : window.scrollY;
  if(window.innerWidth <= 768){
    if(scrollTop > 50) list?.classList.add('scrolled');
    else list?.classList.remove('scrolled');
  }
}
if(list) list.addEventListener('scroll', handleScroll, {passive:true});
window.addEventListener('scroll', handleScroll, {passive:true});

// Avatars - NEVER wipe img. Only fill .avatar-initials span. Backend swaps src + has-image.
function paintAvatars(scope){
  (scope || document).querySelectorAll(".chat-avatar, .group-member-ava, .add-group-ava").forEach(el => {
    const name = (el.dataset.name || el.closest('.chat-item')?.querySelector('.chat-name')?.textContent || "User").trim();
    const initialsEl = el.querySelector('.avatar-initials');
    const initials = getInitials(name);
    if(initialsEl) initialsEl.textContent = initials;
    else if(!el.querySelector('img')){
      // Fallback if HTML has no span yet
      const s = document.createElement('span');
      s.className = 'avatar-initials';
      s.textContent = initials;
      el.appendChild(s);
    }
    el.dataset.initials = initials;
    // Only gradient when NO image - has-image keeps konnekt.jfif
    if(!el.classList.contains('has-image')){
      el.style.background = gradientFor(name);
    }
  });
  // Header + contact + group big avatars
  document.querySelectorAll('.profile-border, .contact-round-profile, .group-info-pic-btn').forEach(el => {
    const img = el.querySelector('img');
    const hasImg = img && img.getAttribute('src') && !img.hidden;
    el.classList.toggle('has-image', !!hasImg);
  });
}
paintAvatars();

// ==========================
// TABS - All / Chats / Groups. NEVER wipe chatBackground.innerHTML.
// ==========================
function updateEmptyState(){
  const desktopEmpty = document.getElementById('chatEmptyState');
  const mobileEmpty = document.getElementById('chatEmptyStateMobile');
  const isChatOpen = chatBg && !chatBg.hasAttribute('hidden') && chatBg.classList.contains('active-chat');
  if(desktopEmpty && window.innerWidth > 768) desktopEmpty.hidden = !!isChatOpen;
  // Mobile empty: show if list has 0 visible items AND no chat open
  const visibleItems = [...document.querySelectorAll('#chatContainer .chat-item')].filter(i => i.style.display !== 'none');
  const isEmpty = visibleItems.length === 0 && !isChatOpen;
  if(window.innerWidth <= 768){
    chatLoadList?.classList.toggle('is-empty-mobile', isEmpty);
    if(mobileEmpty) mobileEmpty.classList.toggle('show', isEmpty);
    if(mobileEmpty) mobileEmpty.hidden = !isEmpty;
  } else {
    chatLoadList?.classList.remove('is-empty-mobile');
    if(mobileEmpty) mobileEmpty.classList.remove('show');
  }
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'all';
  const startBtn = document.getElementById('emptyStartChatBtn');
  const groupBtn = document.getElementById('emptyCreateGroupBtn');
  if(startBtn && groupBtn){ startBtn.hidden = activeTab === 'groups'; groupBtn.hidden = activeTab !== 'groups'; }
  const startBtnM = document.getElementById('emptyStartChatBtnMobile');
  const groupBtnM = document.getElementById('emptyCreateGroupBtnMobile');
  if(startBtnM && groupBtnM){ startBtnM.hidden = activeTab === 'groups'; groupBtnM.hidden = activeTab !== 'groups'; }
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab; // all | chats | groups
    const mid = document.getElementById('midChatsText');
    if(mid) mid.textContent = tab === 'groups' ? 'Groups' : tab === 'chats' ? 'Chats' : 'Chats';
    if(title) title.textContent = tab === 'groups' ? 'Groups' : tab === 'chats' ? 'Chats' : 'All Chats';
    document.querySelectorAll('#chatContainer .chat-item').forEach(item => {
      let show = true;
      if(tab === 'chats') show = item.dataset.type === 'chat';
      if(tab === 'groups') show = item.dataset.type === 'group';
      if(tab === 'all') show = true;
      item.style.display = show ? 'flex' : 'none';
    });
    updateEmptyState();
    if(window.lucide) lucide.createIcons();
  });
});

document.getElementById('emptyStartChatBtn')?.addEventListener('click', () => document.getElementById('openNewChatBtn')?.click());
document.getElementById('emptyCreateGroupBtn')?.addEventListener('click', () => document.getElementById('nkNewGroupRow')?.click());
document.getElementById('emptyStartChatBtnMobile')?.addEventListener('click', () => { closeChatBg(); setTimeout(()=> document.getElementById('openNewChatBtn')?.click(), 150); });
document.getElementById('emptyCreateGroupBtnMobile')?.addEventListener('click', () => { closeChatBg(); setTimeout(()=> document.getElementById('nkNewGroupRow')?.click(), 150); });

// ==========================
// OPEN / CLOSE CHAT - Sidebar NEVER disappears on image send
// ==========================
let currentChatType = 'chat';
let currentChatId = null;
let currentChatItem = null;

function openChatBg(item){
  currentChatType = item?.dataset.type || 'chat';
  currentChatId = item?.dataset.userId || item?.dataset.groupId || null;
  currentChatItem = item;
  if(chatBg){
    chatBg.hidden = false;
    chatBg.classList.add('active-chat');
    chatBg.classList.toggle('is-group', currentChatType === 'group');
  }
  updateEmptyState();
  updateChatHeader(currentChatType, item);
  if(window.innerWidth <= 768){
    chatLoadList.classList.add('mobile-hide');
    chatRightWrap?.classList.add('mobile-show');
    document.querySelector('.sidebar-section')?.classList.add('hide-nav');
  }
  initChatScrollLogic();
  initStickyDate();
  initReadMore();
  initMediaLoading();
  window.showTyping();
  item?.classList.remove('unread');
}

function updateChatHeader(type, item){
  const nameEl = document.getElementById('chatHeaderName');
  const statusEl = document.getElementById('chatHeaderStatus');
  const dotEl = document.getElementById('chatOnlineDot');
  const initialsEl = document.getElementById('chatHeaderInitials');
  const avatarImg = document.getElementById('chatHeaderAvatarImg');
  const border = document.querySelector('.profile-border');
  if(!item) return;
  const name = item.querySelector('.chat-name')?.textContent || 'Chat';
  if(nameEl) nameEl.textContent = name;
  if(initialsEl) initialsEl.textContent = getInitials(name);
  // Avatar: if list item has image, header uses same konnekt.jfif, else initials
  const itemImg = item.querySelector('.chat-avatar img');
  const hasImg = item?.dataset.hasImage === 'true' && itemImg?.src;
  if(avatarImg){
    if(hasImg){ avatarImg.src = itemImg.src; avatarImg.hidden = false; }
    else avatarImg.hidden = true;
  }
  if(border) border.classList.toggle('has-image', !!hasImg);
  if(type === 'group'){
    if(statusEl){ statusEl.textContent = '12 members • 3 online'; statusEl.className = 'chat-header-status'; statusEl.hidden = false; }
    if(dotEl) dotEl.style.display = 'none';
  } else {
    const isOnline = true; // Backend sets real status
    if(statusEl){ statusEl.textContent = isOnline ? 'Online' : 'Offline • Last seen 2:30 PM'; statusEl.className = 'chat-header-status' + (isOnline ? '' : ' offline'); statusEl.hidden = false; }
    if(dotEl){ dotEl.style.display = 'block'; dotEl.classList.toggle('offline', !isOnline); }
  }
}

document.querySelectorAll('.chat-item').forEach(item => {
  item.addEventListener('click', (e) => {
    // Blocked tag click = Unblock popup, not open chat
    if(e.target.closest('.chat-blocked-tag')){ e.stopPropagation(); openUnblockPopup(item); return; }
    openChatBg(item);
  });
});

function closeChatBg(){
  if(window.innerWidth <= 768){
    chatLoadList.classList.remove('mobile-hide');
    chatRightWrap?.classList.remove('mobile-show');
    document.querySelector('.sidebar-section')?.classList.remove('hide-nav');
  } else {
    if(chatBg){ chatBg.hidden = true; chatBg.classList.remove('active-chat'); }
  }
  document.getElementById('contactInfoBg')?.setAttribute('hidden','');
  document.getElementById('groupInfoBg')?.setAttribute('hidden','');
  document.getElementById('editContactBg')?.setAttribute('hidden','');
  document.getElementById('addToGroupsBg')?.setAttribute('hidden','');
  document.getElementById('groupEditBg')?.setAttribute('hidden','');
  document.getElementById('memberSheet')?.setAttribute('hidden','');
  updateEmptyState();
}
window.closeChat = closeChatBg;
backBtn?.addEventListener('click', () => closeChatBg());

document.addEventListener('touchmove', (e) => { if(e.touches.length > 1) e.preventDefault(); }, {passive:false});
let lastTouch = 0;
document.addEventListener('touchend', (e) => { const now = Date.now(); if(now - lastTouch <= 300) e.preventDefault(); lastTouch = now; }, false);

// Edge swipe to go back - Mobile only
(function(){
  const chatBgEl = document.querySelector('.chat-background');
  const chatListEl = document.querySelector('.chat-load-list');
  const sidebar = document.querySelector('.sidebar-section');
  if(!chatBgEl || !chatListEl) return;
  let startX = 0, startY = 0, isEdgeSwipe = false;
  function openChatList(){ chatRightWrap?.classList.remove('mobile-show'); chatListEl.classList.remove('mobile-hide'); if(sidebar) sidebar.classList.remove('hide-nav'); }
  chatBgEl.addEventListener('touchstart', (e) => {
    if(e.touches.length !== 1) return;
    const touch = e.touches[0];
    startX = touch.clientX; startY = touch.clientY;
    if(startX > 30){ isEdgeSwipe = false; return; }
    if(e.target.closest('.msg-row') || e.target.closest('.bubble') || e.target.closest('.chat-input-bar')){ isEdgeSwipe = false; return; }
    isEdgeSwipe = true;
  }, {passive:true});
  chatBgEl.addEventListener('touchmove', (e) => {
    if(!isEdgeSwipe) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startX;
    const diffY = touch.clientY - startY;
    if(Math.abs(diffY) > 50){ isEdgeSwipe = false; return; }
    if(diffX < 0){ isEdgeSwipe = false; return; }
    if(diffX > 90){ isEdgeSwipe = false; openChatList(); }
  }, {passive:true});
})();

(function(){
  const replyPreview = document.querySelector('.reply-preview');
  const scrollBtn = document.querySelector('.scroll-down-btn');
  const chatBgEl = document.querySelector('.chat-background');
  if(!replyPreview || !scrollBtn) return;
  const observer = new MutationObserver(() => {
    if(replyPreview.classList.contains('show')){ scrollBtn.style.bottom = '138px'; if(chatBgEl) chatBgEl.classList.add('has-reply'); }
    else { scrollBtn.style.bottom = '80px'; if(chatBgEl) chatBgEl.classList.remove('has-reply'); }
  });
  observer.observe(replyPreview, {attributes:true, attributeFilter:['class']});
})();

// ====================================================================
// MOOD PILL - OLD WAY - 28px, TAP ONLY, 3 STATES, NO EMOJI, NO SWIPE
// ====================================================================
(function(){
  const moodFloat = document.getElementById('moodFloat');
  if(!moodFloat) return;
  const moodPills = moodFloat.querySelectorAll('.mood-pill-mini');
  const moodCard = document.getElementById('moodCard');
  const moodCardTitle = document.getElementById('moodCardTitle');
  const moodCardArtist = document.getElementById('moodCardArtist');
  const moodCardTime = document.getElementById('moodCardTime');
  const states = [
    {state:'playing', hasCard:true, cardTitle:'Asiwaju', cardArtist:'Ruger', cardSub:'Playing now • Spotify'},
    {state:'recent', hasCard:true, cardTitle:'Chilling', cardArtist:'Last vibe', cardSub:'Played 2 hours ago'},
    {state:'typed', hasCard:false, cardTitle:'', cardArtist:'', cardSub:''}
  ];
  let currentIndex = 0, cycleTimer = null, hideTimer = null, isCardOpen = false, isHidden = false;
  function enforceHeight(){
    moodFloat.style.height = '28px'; moodFloat.style.minHeight = '28px'; moodFloat.style.maxHeight = '28px';
    moodPills.forEach(p => { p.style.height='28px'; p.style.minHeight='28px'; p.style.maxHeight='28px'; });
  }
  function renderState(index){
    const data = states[index]; if(!data) return;
    moodPills.forEach((pill,i) => {
      if(i===index){ pill.classList.add('active'); pill.classList.remove('hidden'); pill.style.display='flex'; }
      else { pill.classList.remove('active'); pill.classList.add('hidden'); pill.style.display='none'; }
    });
    moodFloat.classList.remove('hidden');
    if(moodCardTitle) moodCardTitle.textContent = data.cardTitle;
    if(moodCardArtist) moodCardArtist.textContent = data.cardArtist;
    if(moodCardTime) moodCardTime.textContent = data.cardSub;
    enforceHeight();
    if(window.lucide) lucide.createIcons();
  }
  function hideMood(){ moodFloat.style.opacity='0'; moodFloat.style.pointerEvents='none'; moodFloat.classList.add('hidden'); isHidden = true; }
  function showMood(){ moodFloat.style.opacity='1'; moodFloat.style.pointerEvents='auto'; moodFloat.classList.remove('hidden'); isHidden = false; }
  function startCycle(){
    renderState(0); currentIndex = 0;
    cycleTimer = setInterval(() => {
      if(isCardOpen) return;
      if(isHidden){ isHidden = false; currentIndex = (currentIndex+1)%states.length; showMood(); renderState(currentIndex); return; }
      currentIndex++;
      if(currentIndex >= states.length){ hideMood(); currentIndex = states.length-1; hideTimer = setTimeout(()=>{ currentIndex=0; showMood(); renderState(0); }, 1000); }
      else renderState(currentIndex);
    }, 3000);
  }
  moodFloat.addEventListener('click', (e) => {
    e.stopPropagation(); enforceHeight();
    const activePill = moodFloat.querySelector('.mood-pill-mini.active');
    if(!activePill) return;
    const state = activePill.dataset.state || states[currentIndex].state;
    const hasCard = activePill.dataset.hasCard === 'true';
    if(state === 'typed') return; // Typed mood = NOTHING on tap
    if(hasCard){
      isCardOpen = !moodFloat.classList.contains('open');
      moodFloat.classList.toggle('open');
      if(isCardOpen) setTimeout(()=>{ moodFloat.classList.remove('open'); isCardOpen = false; }, 3000);
    }
  });
  document.addEventListener('click', (e) => { if(!moodFloat.contains(e.target)){ moodFloat.classList.remove('open'); isCardOpen = false; } });
  window.addEventListener('resize', enforceHeight);
  enforceHeight(); startCycle();
  window.moodPill = { startCycle, stopCycle:()=>{ clearInterval(cycleTimer); clearTimeout(hideTimer); }, showState:(idx)=>{ currentIndex=idx; renderState(idx); }, hide:hideMood, show:showMood, states };
})();

// ====================================================================
// INPUT BAR - Grows with text
// ====================================================================
(function(){
  const msgInput = document.getElementById('msgInput');
  const chatInputBar = document.getElementById('chatInputBar');
  const inputPill = document.getElementById('inputPill') || document.querySelector('.input-pill');
  const micBtn = document.getElementById('micSendBtn');
  if(!msgInput) return;
  function autoGrow(){
    msgInput.style.height = 'auto';
    const newHeight = Math.min(msgInput.scrollHeight, 100);
    msgInput.style.height = newHeight + 'px';
    if(chatInputBar){ const extra = Math.max(0, newHeight-22); chatInputBar.style.minHeight = (62+extra)+'px'; chatInputBar.style.height='auto'; }
    if(inputPill){ const extra = Math.max(0, newHeight-22); inputPill.style.minHeight = (42+extra)+'px'; inputPill.style.height='auto'; }
    if(msgInput.value.trim().length>0) micBtn?.classList.add('sending'); else micBtn?.classList.remove('sending');
  }
  msgInput.addEventListener('input', autoGrow);
  msgInput.addEventListener('focus', autoGrow);
  window.resetInputBar = function(){
    msgInput.value=''; msgInput.style.height='auto';
    if(chatInputBar){ chatInputBar.style.minHeight='62px'; chatInputBar.style.height='auto'; }
    if(inputPill){ inputPill.style.minHeight='42px'; inputPill.style.height='auto'; }
    micBtn?.classList.remove('sending');
  };
  autoGrow();
})();

// ==========================
// DATE - Floating + Sticky
// ==========================
let floatingDateTimeout = null;
function initChatScrollLogic(){
  const chatMessages = document.getElementById('chatMessages');
  const floatingDate = document.getElementById('floatingDate');
  if(!chatMessages || !floatingDate) return;
  const dateSeps = chatMessages.querySelectorAll('.date-sep');
  if(dateSeps.length===0) return;
  chatMessages.addEventListener('scroll', () => {
    let currentDate = null;
    dateSeps.forEach(sep => {
      const rect = sep.getBoundingClientRect();
      const containerRect = chatMessages.getBoundingClientRect();
      if(rect.top <= containerRect.top + 100) currentDate = sep.getAttribute('data-date');
    });
    if(currentDate){
      floatingDate.textContent = currentDate;
      floatingDate.classList.add('show');
      clearTimeout(floatingDateTimeout);
      floatingDateTimeout = setTimeout(()=> floatingDate.classList.remove('show'), 1500);
    }
  }, {passive:true});
}
function initStickyDate(){
  const chatMessages = document.getElementById('chatMessages');
  const sticky = document.getElementById('stickyDateDivider');
  const stickyText = document.getElementById('stickyDateText');
  if(!chatMessages || !sticky) return;
  chatMessages.addEventListener('scroll', () => {
    let cur = 'Today';
    chatMessages.querySelectorAll('.date-sep').forEach(sep => {
      const r = sep.getBoundingClientRect();
      const c = chatMessages.getBoundingClientRect();
      if(r.top <= c.top + 80) cur = sep.getAttribute('data-date') || cur;
    });
    if(stickyText) stickyText.textContent = cur;
  }, {passive:true});
}

// ==========================
// READ MORE + MEDIA LOADING
// ==========================
function initReadMore(){
  document.querySelectorAll('.msg-text.long-text').forEach(p => {
    const btn = p.parentElement?.querySelector('.read-more-btn');
    if(!btn) return;
    // Show button only if text is long - backend sets long-text only for long
    btn.classList.add('show');
    btn.textContent = 'Read more';
    btn.onclick = () => {
      const expanded = p.classList.toggle('expanded');
      btn.textContent = expanded ? 'Read less' : 'Read more';
    };
  });
}
function initMediaLoading(){
  document.querySelectorAll('.media-loading-overlay').forEach(ov => {
    // Demo: hidden by default, backend shows when downloading
    // Tap overlay = retry if failed
    ov.addEventListener('click', (e) => { e.stopPropagation(); ov.classList.toggle('is-retry'); });
  });
}

window.enableSelectModeScroll = function(){
  const cm = document.getElementById('chatMessages');
  if(cm){ cm.style.overflowY='auto'; cm.style.pointerEvents='auto'; }
  document.getElementById('chatBackground')?.classList.add('select-mode','select-mode-active');
}
window.disableSelectModeScroll = function(){ document.getElementById('chatBackground')?.classList.remove('select-mode','select-mode-active'); }
const _origEnterSelect = window.enterSelectMode;
window.enterSelectMode = function(...args){ if(_origEnterSelect) _origEnterSelect(...args); window.enableSelectModeScroll(); }
const _origExitSelect = window.exitSelectMode;
window.exitSelectMode = function(...args){ if(_origExitSelect) _origExitSelect(...args); window.disableSelectModeScroll(); }

window.showTyping = function(){
  const typing = document.getElementById('typingIndicator');
  if(!typing) return;
  typing.classList.add('show','always-show'); typing.style.display='flex';
  const cm = document.getElementById('chatMessages'); if(cm) cm.scrollTop = cm.scrollHeight;
}
window.hideTyping = function(){
  const typing = document.getElementById('typingIndicator');
  if(!typing) return;
  typing.classList.add('show','always-show'); typing.style.display='flex';
}
setTimeout(()=>{ window.showTyping(); }, 300);
window.positionPillSmart = function(msgRow){
  const container = document.getElementById('poppedMessageContainer');
  if(!container || !msgRow) return;
  const text = msgRow.querySelector('p')?.innerText || '';
  const isLong = text.length > 80 || msgRow.offsetHeight > 130;
  container.classList.toggle('long-msg', isLong);
  container.classList.toggle('short-msg', !isLong);
  container.setAttribute('data-long', isLong ? 'true' : 'false');
}

// ==========================
// CONTACT / GROUP INFO
// ==========================
function openContactInfo(){
  if(currentChatType === 'group'){
    document.getElementById('groupInfoBg')?.removeAttribute('hidden');
  } else {
    const name = document.getElementById('chatHeaderName')?.textContent || 'Faith Mike';
    const userEl = document.getElementById('contactUsername');
    if(userEl) userEl.textContent = '@' + name.toLowerCase().replace(/\s+/g,'_');
    const aboutName = document.getElementById('contactAboutName');
    if(aboutName) aboutName.textContent = '@' + name.toLowerCase().replace(/\s+/g,'_');
    document.getElementById('contactInfoBg')?.removeAttribute('hidden');
  }
  if(window.lucide) lucide.createIcons();
}
document.getElementById('openProfilePreviewBtn')?.addEventListener('click', openContactInfo);
document.getElementById('openProfilePreviewBtn2')?.addEventListener('click', openContactInfo);
document.getElementById('contactInfoBack')?.addEventListener('click', () => document.getElementById('contactInfoBg')?.setAttribute('hidden',''));
document.getElementById('groupInfoBack')?.addEventListener('click', () => document.getElementById('groupInfoBg')?.setAttribute('hidden',''));

// Share Thought - WHITE border on top of profile
document.getElementById('shareThoughtBox')?.addEventListener('click', () => {
  // Opens share thought composer - backend handles send
  const input = document.getElementById('msgInput');
  if(input){ input.focus(); input.placeholder = 'Share a thought...'; }
  document.getElementById('contactInfoBg')?.setAttribute('hidden','');
  if(currentChatItem) openChatBg(currentChatItem);
});

// Edit Contact
document.getElementById('contactEditBtn')?.addEventListener('click', () => document.getElementById('editContactBg')?.removeAttribute('hidden'));
document.getElementById('editContactBack')?.addEventListener('click', () => document.getElementById('editContactBg')?.setAttribute('hidden',''));
document.getElementById('editContactSaveBtn')?.addEventListener('click', () => document.getElementById('editContactBg')?.setAttribute('hidden',''));
document.getElementById('editContactSaveBtnTop')?.addEventListener('click', () => document.getElementById('editContactBg')?.setAttribute('hidden',''));

// Add To Groups
document.getElementById('openAddToGroupsBtn')?.addEventListener('click', () => document.getElementById('addToGroupsBg')?.removeAttribute('hidden'));
document.getElementById('addToGroupsClose')?.addEventListener('click', () => document.getElementById('addToGroupsBg')?.setAttribute('hidden',''));
document.getElementById('addToGroupsConfirmBtn')?.addEventListener('click', () => {
  // Backend adds to selected groups
  document.getElementById('addToGroupsBg')?.setAttribute('hidden','');
});
document.getElementById('openCreateGroupWithContactBtn')?.addEventListener('click', () => {
  // Auto-selects this contact, others available - opens New Group flow
  document.getElementById('contactInfoBg')?.setAttribute('hidden','');
  document.getElementById('nkNewGroupRow')?.click();
  window._createGroupPreselected = currentChatId;
});

// Group QR
document.getElementById('groupQrBtn')?.addEventListener('click', () => document.getElementById('groupQrBg')?.removeAttribute('hidden'));
document.getElementById('groupQrBack')?.addEventListener('click', () => document.getElementById('groupQrBg')?.setAttribute('hidden',''));
document.getElementById('qrShareLinkBtn')?.addEventListener('click', () => { if(navigator.clipboard) navigator.clipboard.writeText('https://konnekt.app/group/DesignTeam'); });

// Group Tabs
document.querySelectorAll('.group-tab-mini').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.group-tab-mini').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.groupTab;
    const membersSec = document.getElementById('groupMembersSection');
    const settingsSec = document.getElementById('groupSettingsSection');
    if(tab === 'members'){ if(membersSec) membersSec.hidden = false; if(settingsSec) settingsSec.hidden = true; }
    else { if(membersSec) membersSec.hidden = true; if(settingsSec) settingsSec.hidden = false; document.getElementById('groupInfoScroll')?.scrollTo({top:0, behavior:'smooth'}); }
  });
});

// ==========================
// GROUP EDIT - Edit under round border -> Pill -> Name / Photo / About
// ==========================
document.getElementById('groupEditBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const pill = document.getElementById('groupEditPill');
  if(pill) pill.hidden = !pill.hidden;
});
document.addEventListener('click', (e) => {
  const pill = document.getElementById('groupEditPill');
  if(pill && !pill.hidden && !pill.contains(e.target) && e.target.id !== 'groupEditBtn' && !e.target.closest('#groupEditBtn')) pill.hidden = true;
});
function openGroupEdit(mode){
  const bg = document.getElementById('groupEditBg');
  const titleEl = document.getElementById('groupEditTitle');
  const labelEl = document.getElementById('groupEditLabel');
  const inputEl = document.getElementById('groupEditInput');
  if(!bg) return;
  document.getElementById('groupEditPill')?.setAttribute('hidden','');
  if(mode === 'name'){ if(titleEl) titleEl.textContent = 'Change Group Name'; if(labelEl) labelEl.textContent = 'Group Name'; if(inputEl){ inputEl.placeholder = 'Design Team'; inputEl.value = document.getElementById('groupInfoName')?.textContent || ''; } }
  if(mode === 'about'){ if(titleEl) titleEl.textContent = 'Edit Group About'; if(labelEl) labelEl.textContent = 'About Group'; if(inputEl){ inputEl.placeholder = 'Add about group'; inputEl.value = document.getElementById('groupInfoDesc')?.textContent || ''; } }
  bg.dataset.mode = mode;
  bg.removeAttribute('hidden');
}
document.getElementById('editGroupNameBtn')?.addEventListener('click', () => openGroupEdit('name'));
document.getElementById('editGroupAboutBtn')?.addEventListener('click', () => openGroupEdit('about'));
document.getElementById('editGroupPhotoBtn')?.addEventListener('click', () => { document.getElementById('groupEditPill')?.setAttribute('hidden',''); document.getElementById('groupPhotoInput')?.click(); });
document.getElementById('groupPhotoInput')?.addEventListener('change', (e) => {
  const file = e.target.files?.[0]; if(!file) return;
  const url = URL.createObjectURL(file);
  const img = document.getElementById('groupInfoImage'); if(img){ img.src = url; img.hidden = false; }
});
document.getElementById('groupEditBack')?.addEventListener('click', () => document.getElementById('groupEditBg')?.setAttribute('hidden',''));
function saveGroupEdit(){
  const bg = document.getElementById('groupEditBg');
  const mode = bg?.dataset.mode || 'name';
  const val = document.getElementById('groupEditInput')?.value.trim();
  if(val){
    if(mode === 'name'){ const n = document.getElementById('groupInfoName'); if(n) n.textContent = val; }
    if(mode === 'about'){ const d = document.getElementById('groupInfoDesc'); if(d) d.textContent = val; }
  }
  bg?.setAttribute('hidden','');
}
document.getElementById('groupEditSaveBtn')?.addEventListener('click', saveGroupEdit);
document.getElementById('groupEditSaveBtn2')?.addEventListener('click', saveGroupEdit);

// ==========================
// MEMBER SHEET - Slide up from down
// ==========================
let currentMemberRow = null;
let isCurrentUserAdmin = true; // Backend sets real - demo admin
document.querySelectorAll('.group-member-row').forEach(row => {
  row.addEventListener('click', () => {
    currentMemberRow = row;
    const sheet = document.getElementById('memberSheet');
    const nameEl = document.getElementById('memberSheetName');
    if(!sheet) return;
    const name = row.querySelector('.group-member-name')?.textContent || 'Member';
    const role = row.dataset.role || 'member';
    const isYou = row.dataset.userId === 'me' || name === 'You';
    if(nameEl) nameEl.textContent = isYou ? 'You' : name;
    const actions = document.getElementById('memberSheetActions');
    const viewBtn = actions?.querySelector('[data-member-action="view-info"]');
    const removeBtn = actions?.querySelector('[data-member-action="remove"]');
    const makeBtn = actions?.querySelector('[data-member-action="make-admin"]');
    const dismissBtn = actions?.querySelector('[data-member-action="dismiss-admin"]');
    const exitBtn = actions?.querySelector('[data-member-action="exit"]');
    if(viewBtn) viewBtn.hidden = false;
    if(removeBtn) removeBtn.hidden = !(isCurrentUserAdmin && !isYou);
    if(makeBtn) makeBtn.hidden = !(isCurrentUserAdmin && !isYou && role === 'member');
    if(dismissBtn) dismissBtn.hidden = !(isCurrentUserAdmin && !isYou && role === 'admin');
    if(exitBtn) exitBtn.hidden = !isYou;
    sheet.removeAttribute('hidden');
  });
});
document.getElementById('memberSheetCancel')?.addEventListener('click', () => document.getElementById('memberSheet')?.setAttribute('hidden',''));
document.querySelectorAll('#memberSheetActions [data-member-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.memberAction;
    const name = currentMemberRow?.querySelector('.group-member-name')?.textContent || 'Member';
    const username = currentMemberRow?.dataset.username || name.toLowerCase();
    document.getElementById('memberSheet')?.setAttribute('hidden','');
    if(action === 'view-info'){
      // Opens profile UI of person
      document.getElementById('groupInfoBg')?.setAttribute('hidden','');
      const contactName = document.getElementById('chatHeaderName');
      if(contactName) contactName.textContent = name;
      document.getElementById('contactInfoBg')?.removeAttribute('hidden');
    }
    if(action === 'remove'){
      currentMemberRow?.remove();
      addSystemMessage(`Admin removed @${username}`);
    }
    if(action === 'make-admin'){
      if(currentMemberRow){ currentMemberRow.dataset.role = 'admin'; const roleEl = currentMemberRow.querySelector('.group-member-role'); if(roleEl) roleEl.textContent = 'Admin'; document.getElementById('groupAdminsList')?.appendChild(currentMemberRow); }
      addSystemMessage(`Admin made @${username} an admin`);
    }
    if(action === 'dismiss-admin'){
      if(currentMemberRow){ currentMemberRow.dataset.role = 'member'; const roleEl = currentMemberRow.querySelector('.group-member-role'); if(roleEl) roleEl.textContent = 'Member'; document.getElementById('groupMembersList')?.appendChild(currentMemberRow); }
      addSystemMessage(`Admin dismissed @${username} as admin`);
    }
    if(action === 'exit'){
      // If other admins exist, leave. If no other admin, group gone.
      const otherAdmins = [...document.querySelectorAll('#groupAdminsList .group-member-row')].filter(r => r.dataset.userId !== 'me');
      if(otherAdmins.length === 0){ setGroupGone(); }
      else { addSystemMessage('You • @you left'); document.getElementById('groupInfoBg')?.setAttribute('hidden',''); closeChatBg(); }
    }
  });
});

// Group Actions
document.getElementById('groupExitBtn')?.addEventListener('click', () => {
  const otherAdmins = [...document.querySelectorAll('#groupAdminsList .group-member-row')].filter(r => r.dataset.userId !== 'me');
  if(otherAdmins.length === 0){ setGroupGone(); document.getElementById('groupInfoBg')?.setAttribute('hidden',''); return; }
  addSystemMessage('You • @you left');
  document.getElementById('groupInfoBg')?.setAttribute('hidden','');
  closeChatBg();
});
document.getElementById('groupDeleteBtn')?.addEventListener('click', () => {
  openDeleteChatPopup('group');
});
document.getElementById('groupReportBtn')?.addEventListener('click', () => document.getElementById('reportGroupBg')?.removeAttribute('hidden'));
document.getElementById('reportGroupClose')?.addEventListener('click', () => document.getElementById('reportGroupBg')?.setAttribute('hidden',''));
document.getElementById('reportGroupSubmit')?.addEventListener('click', () => {
  const success = document.getElementById('reportSuccess');
  if(success) success.hidden = false;
  setTimeout(()=>{ document.getElementById('reportGroupBg')?.setAttribute('hidden',''); if(success) success.hidden = true; }, 1200);
});
document.getElementById('groupClearBtn')?.addEventListener('click', () => {
  document.getElementById('clearChatsPopup')?.classList.remove('hidden');
});
document.getElementById('groupActionShare')?.addEventListener('click', () => { if(navigator.clipboard) navigator.clipboard.writeText('https://konnekt.app/group/DesignTeam'); });
document.getElementById('groupActionChats')?.addEventListener('click', () => document.getElementById('groupInfoBg')?.setAttribute('hidden',''));
document.getElementById('groupActionAdd')?.addEventListener('click', () => { document.getElementById('groupInfoBg')?.setAttribute('hidden',''); document.getElementById('nkNewGroupRow')?.click(); });
document.getElementById('groupAddMemberBtn')?.addEventListener('click', () => { document.getElementById('groupInfoBg')?.setAttribute('hidden',''); document.getElementById('nkNewGroupRow')?.click(); });

// ==========================
// POPUPS - Clear / Block / Delete Chat / Unblock - NO confirm()
// ==========================
function openDeleteChatPopup(kind){
  const popup = document.getElementById('deleteChatPopup');
  if(popup) popup.classList.remove('hidden');
}
function openUnblockPopup(item){
  const popup = document.getElementById('unblockPopup');
  const nameEl = document.getElementById('unblockPopupName');
  if(nameEl && item) nameEl.textContent = '@' + (item.dataset.username || 'user');
  if(popup) popup.classList.remove('hidden');
  window._unblockItem = item;
}
document.getElementById('deleteChatCancel')?.addEventListener('click', () => document.getElementById('deleteChatPopup')?.classList.add('hidden'));
document.getElementById('deleteChatConfirm')?.addEventListener('click', () => {
  document.getElementById('deleteChatPopup')?.classList.add('hidden');
  document.getElementById('contactInfoBg')?.setAttribute('hidden','');
  document.getElementById('groupInfoBg')?.setAttribute('hidden','');
  closeChatBg();
});
document.getElementById('unblockCancel')?.addEventListener('click', () => document.getElementById('unblockPopup')?.classList.add('hidden'));
document.getElementById('unblockConfirm')?.addEventListener('click', () => {
  document.getElementById('unblockPopup')?.classList.add('hidden');
  const item = window._unblockItem;
  if(item){ item.classList.remove('blocked-item'); const tag = item.querySelector('.chat-blocked-tag'); if(tag) tag.hidden = true; }
  document.getElementById('chatInputBar')?.removeAttribute('hidden');
  document.getElementById('blockedTakeover')?.setAttribute('hidden','');
  document.getElementById('contactBlockedActions')?.setAttribute('hidden','');
});
document.getElementById('clearChatsCancel')?.addEventListener('click', () => document.getElementById('clearChatsPopup')?.classList.add('hidden'));
document.getElementById('clearChatsConfirm')?.addEventListener('click', () => {
  document.getElementById('clearChatsPopup')?.classList.add('hidden');
  const cm = document.getElementById('chatMessages'); if(cm) cm.innerHTML = '';
  // E2EE notice stays - backend re-adds it
  document.getElementById('contactInfoBg')?.setAttribute('hidden','');
  document.getElementById('groupInfoBg')?.setAttribute('hidden','');
});
document.getElementById('blockCancel')?.addEventListener('click', () => document.getElementById('blockUserPopup')?.classList.add('hidden'));
document.getElementById('blockConfirm')?.addEventListener('click', () => {
  document.getElementById('blockUserPopup')?.classList.add('hidden');
  doBlock();
});
function doBlock(){
  document.getElementById('chatInputBar')?.setAttribute('hidden','');
  document.getElementById('blockedTakeover')?.removeAttribute('hidden');
  document.getElementById('contactBlockedActions')?.removeAttribute('hidden');
  document.getElementById('contactInfoBg')?.setAttribute('hidden','');
  if(currentChatItem){ currentChatItem.classList.add('blocked-item'); const tag = currentChatItem.querySelector('.chat-blocked-tag'); if(tag) tag.hidden = false; }
}

// Contact Actions
document.getElementById('contactClearChatsBtn')?.addEventListener('click', () => document.getElementById('clearChatsPopup')?.classList.remove('hidden'));
document.getElementById('contactBlockBtn')?.addEventListener('click', () => document.getElementById('blockUserPopup')?.classList.remove('hidden'));
document.getElementById('contactUnblockBtn')?.addEventListener('click', () => openUnblockPopup(currentChatItem));
document.getElementById('unblockBtn')?.addEventListener('click', () => openUnblockPopup(currentChatItem));
document.getElementById('blockedDeleteBtn')?.addEventListener('click', () => openDeleteChatPopup('chat'));
document.getElementById('contactDeleteBtn')?.addEventListener('click', () => openDeleteChatPopup('chat'));
document.getElementById('contactDeleteAfterBlockBtn')?.addEventListener('click', () => openDeleteChatPopup('chat'));

// Full Pic - New background, chevron back
document.getElementById('contactPicOpen')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const img = document.getElementById('contactProfileImage');
  const full = document.getElementById('fullPicImage');
  if(full) full.src = img?.src || 'konnekt.jfif';
  const nameEl = document.getElementById('fullPicName');
  if(nameEl) nameEl.textContent = document.getElementById('contactUsername')?.textContent || '@Faith_mike';
  document.getElementById('fullPicPreview')?.removeAttribute('hidden');
});
document.getElementById('groupPicOpen')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const full = document.getElementById('fullPicImage');
  const img = document.getElementById('groupInfoImage');
  if(full) full.src = img?.src || 'konnekt.jfif';
  const nameEl = document.getElementById('fullPicName');
  if(nameEl) nameEl.textContent = document.getElementById('groupInfoName')?.textContent || 'Design Team';
  document.getElementById('fullPicPreview')?.removeAttribute('hidden');
});
document.getElementById('fullPicClose')?.addEventListener('click', () => document.getElementById('fullPicPreview')?.setAttribute('hidden',''));

// ==========================
// SYSTEM MESSAGES
// ==========================
function addSystemMessage(text){
  const container = document.getElementById('chatMessages');
  if(!container) return;
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.innerHTML = `<span>${text}</span>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
window.addSystemMessage = addSystemMessage;

// ==========================
// PILL - Copy / Save / Delete
// ==========================
let currentPillRow = null;
window.setCurrentPillRow = function(row, isImage){
  currentPillRow = row;
  const copyBtn = document.getElementById('pillCopyBtn');
  const saveBtn = document.getElementById('pillSaveBtn');
  // Text = Copy, Image/Video = Save, Sticker = neither Copy nor Save - handled by caller passing isSticker
  if(copyBtn) copyBtn.hidden = !!isImage;
  if(saveBtn) saveBtn.hidden = !isImage;
};
window.setCurrentPillRowSticker = function(row){
  currentPillRow = row;
  const copyBtn = document.getElementById('pillCopyBtn');
  const saveBtn = document.getElementById('pillSaveBtn');
  if(copyBtn) copyBtn.hidden = true;
  if(saveBtn) saveBtn.hidden = true;
};
document.getElementById('pillCopyBtn')?.addEventListener('click', () => {
  const text = currentPillRow?.querySelector('.msg-text')?.dataset.fullText || currentPillRow?.querySelector('p')?.innerText || '';
  if(navigator.clipboard && text) navigator.clipboard.writeText(text);
  document.getElementById('poppedMessageContainer')?.classList.remove('active');
});
document.getElementById('pillSaveBtn')?.addEventListener('click', () => {
  document.getElementById('poppedMessageContainer')?.classList.remove('active');
});
document.querySelectorAll('.delete-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.delete;
    if(!currentPillRow) return;
    if(mode === 'me'){ currentPillRow.remove(); }
    else {
      const bubble = currentPillRow.querySelector('.bubble');
      if(bubble){
        const time = bubble.querySelector('.msg-time')?.textContent || '';
        bubble.className = 'bubble deleted-bubble';
        bubble.innerHTML = `<i data-lucide="trash-2"></i><p>You deleted this message</p><span class="msg-meta right-meta"><span class="msg-time">${time}</span></span>`;
        currentPillRow.classList.add('deleted-row');
        const listMsg = currentChatItem?.querySelector('.chat-last-message');
        if(listMsg){ listMsg.classList.add('deleted-preview'); listMsg.innerHTML = `<i data-lucide="trash-2" class="deleted-preview-icon"></i><span>This message was deleted</span>`; }
      }
      if(window.lucide) lucide.createIcons();
    }
    document.getElementById('deleteActionBar')?.classList.remove('show');
    document.getElementById('poppedMessageContainer')?.classList.remove('active');
  });
});

window.setAdminOnly = function(isAdminOnly, isAdmin){
  const takeover = document.getElementById('adminOnlyTakeover');
  const inputBar = document.getElementById('chatInputBar');
  if(isAdminOnly && !isAdmin){ inputBar?.setAttribute('hidden',''); takeover?.removeAttribute('hidden'); }
  else { inputBar?.removeAttribute('hidden'); takeover?.setAttribute('hidden',''); }
};
window.setGroupGone = function(){
  const takeover = document.getElementById('groupGoneTakeover');
  const inputBar = document.getElementById('chatInputBar');
  if(inputBar) inputBar.setAttribute('hidden','');
  if(takeover) takeover.removeAttribute('hidden');
  document.getElementById('groupInfoBg')?.setAttribute('hidden','');
};
window.setGroupTyping = function(names){
  const typingEl = document.getElementById('chatHeaderTyping');
  const statusEl = document.getElementById('chatHeaderStatus');
  if(!typingEl || !statusEl) return;
  if(!names || names.length === 0){ typingEl.hidden = true; statusEl.hidden = false; return; }
  let text = '';
  if(names.length === 1) text = `${names[0]} is typing...`;
  else if(names.length === 2) text = `${names[0]}, ${names[1]} are typing...`;
  else text = `${names.length} people are typing...`;
  typingEl.textContent = text; typingEl.hidden = false; statusEl.hidden = true;
};

if(window.lucide) lucide.createIcons();
initChatScrollLogic();
initStickyDate();
initReadMore();
initMediaLoading();
updateEmptyState();