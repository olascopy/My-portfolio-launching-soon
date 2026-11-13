// ==========================
// main.js - CHAT LIST + MOOD PILL + INPUT GROWING + CONTACT / GROUP INFO + DELETE
// ==========================
// SPEC FOR MOOD PILL:
// - Height fixed 28px always, never stretch
// - 3 states auto-cycle for MVP:
// 1) Playing now + wave bar -> tap = show artist card
// 2) Was feeling + time (2h ago) -> tap = show played time card
// 3) moon + typed mood -> tap = NOTHING
// - No swipe, only tap
// - Cycle: 3s each -> hide 1s -> loop
// - Later replace timer with real Spotify WebSocket event

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

// RANDOM DELETED - No randomTab, no randomIdle, no startRandomBtn

function handleScroll() {
  const scrollTop = list ? list.scrollTop : window.scrollY;
  if (window.innerWidth <= 768) {
    if (scrollTop > 50) list?.classList.add('scrolled');
    else list?.classList.remove('scrolled');
  }
}
if (list) list.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('scroll', handleScroll, { passive: true });

// Avatars - initials + gradient
function paintAvatars(scope) {
  (scope || document).querySelectorAll(".chat-avatar").forEach(el => {
    if (el.textContent.trim()) return;
    const name = (el.dataset.name || "User").trim();
    const parts = name.split(/\s+/);
    let initials = parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0];
    el.textContent = initials.toUpperCase().slice(0, 2);
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    el.style.background = avatarGradients[hash % avatarGradients.length];
  });
}
paintAvatars();

// ==========================
// TABS - ONLY Chats / Groups. NEVER wipe chatBackground.innerHTML.
// ==========================
function updateEmptyState() {
  // Desktop empty: show if no chat is open
  const desktopEmpty = document.getElementById('chatEmptyState');
  const isChatOpen = chatBg && !chatBg.hasAttribute('hidden') && chatBg.classList.contains('active-chat');
  if (desktopEmpty && window.innerWidth > 768) {
    desktopEmpty.hidden = !!isChatOpen;
  }
  // Mobile empty: show if list has 0 visible items
  const visibleItems = [...document.querySelectorAll('#chatContainer .chat-item')].filter(i => i.style.display !== 'none');
  if (window.innerWidth <= 768) {
    chatLoadList?.classList.toggle('show-empty', visibleItems.length === 0);
  } else {
    chatLoadList?.classList.remove('show-empty');
  }
  // Empty buttons: Chats tab -> Start Chat, Groups tab -> Create Group
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'chats';
  const startBtn = document.getElementById('emptyStartChatBtn');
  const groupBtn = document.getElementById('emptyCreateGroupBtn');
  if (startBtn && groupBtn) {
    startBtn.hidden = activeTab === 'groups';
    groupBtn.hidden = activeTab !== 'groups';
  }
  const startBtnM = document.getElementById('emptyStartChatBtnMobile');
  const groupBtnM = document.getElementById('emptyCreateGroupBtnMobile');
  if (startBtnM && groupBtnM) {
    startBtnM.hidden = activeTab === 'groups';
    groupBtnM.hidden = activeTab !== 'groups';
  }
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab; // chats or groups only
    const mid = document.getElementById('midChatsText');
    if (mid) mid.textContent = tab === 'groups' ? 'Groups' : 'Chats';
    if (title) title.textContent = tab === 'groups' ? 'Groups' : 'Chats';
    // Filter list only - DO NOT touch chatBackground
    document.querySelectorAll('#chatContainer .chat-item').forEach(item => {
      const show = item.dataset.type === tab || (tab === 'chats' && item.dataset.type === 'chat') || (tab === 'groups' && item.dataset.type === 'group');
      item.style.display = show ? 'flex' : 'none';
    });
    updateEmptyState();
    if (window.lucide) lucide.createIcons();
  });
});

// Empty state buttons
document.getElementById('emptyStartChatBtn')?.addEventListener('click', () => {
  document.getElementById('openNewChatBtn')?.click();
});
document.getElementById('emptyCreateGroupBtn')?.addEventListener('click', () => {
  document.getElementById('nkNewGroupRow')?.click();
});
document.getElementById('emptyStartChatBtnMobile')?.addEventListener('click', () => {
  // Mobile: list comes back for display, then open New Chat
  closeChatBg();
  setTimeout(() => document.getElementById('openNewChatBtn')?.click(), 150);
});
document.getElementById('emptyCreateGroupBtnMobile')?.addEventListener('click', () => {
  closeChatBg();
  setTimeout(() => document.getElementById('nkNewGroupRow')?.click(), 150);
});

// ==========================
// OPEN / CLOSE CHAT - Sidebar NEVER disappears on image send
// ==========================
let currentChatType = 'chat'; // chat or group
let currentChatId = null;

function openChatBg(item) {
  currentChatType = item?.dataset.type || 'chat';
  currentChatId = item?.dataset.userId || item?.dataset.groupId || null;

  // Show chat background, hide desktop empty
  if (chatBg) {
    chatBg.hidden = false;
    chatBg.classList.add('active-chat');
    chatBg.classList.toggle('is-group', currentChatType === 'group');
  }
  updateEmptyState();
  updateChatHeader(currentChatType, item);

  if (window.innerWidth <= 768) {
    chatLoadList.classList.add('mobile-hide');
    chatRightWrap?.classList.add('mobile-show');
    document.querySelector('.sidebar-section')?.classList.add('hide-nav');
  }
  initChatScrollLogic();
  const typing = document.getElementById('typingIndicator');
  if (typing) { typing.classList.add('show', 'always-show'); typing.style.display = 'flex'; }
  // Clear unread for this item
  item?.classList.remove('unread');
}

function updateChatHeader(type, item) {
  const nameEl = document.getElementById('chatHeaderName');
  const statusEl = document.getElementById('chatHeaderStatus');
  const dotEl = document.getElementById('chatOnlineDot');
  const initialsEl = document.getElementById('chatHeaderInitials');
  if (!item) return;
  const name = item.querySelector('.chat-name')?.textContent || 'Chat';
  if (nameEl) nameEl.textContent = name;
  if (initialsEl) {
    const parts = name.trim().split(/\s+/);
    initialsEl.textContent = (parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  if (type === 'group') {
    if (statusEl) { statusEl.textContent = '12 members • 3 online'; statusEl.className = 'chat-header-status'; }
    if (dotEl) dotEl.style.display = 'none';
  } else {
    // Demo: online. Backend will set real status.
    const isOnline = true;
    if (statusEl) {
      statusEl.textContent = isOnline ? 'Online' : 'Offline • Last seen 2:30 PM';
      statusEl.className = 'chat-header-status' + (isOnline ? '' : ' offline');
    }
    if (dotEl) {
      dotEl.style.display = 'block';
      dotEl.classList.toggle('offline', !isOnline);
    }
  }
}

document.querySelectorAll('.chat-item').forEach(item => {
  item.addEventListener('click', () => openChatBg(item));
});

function closeChatBg() {
  // List comes back for display - Mobile + Desktop
  if (window.innerWidth <= 768) {
    chatLoadList.classList.remove('mobile-hide');
    chatRightWrap?.classList.remove('mobile-show');
    document.querySelector('.sidebar-section')?.classList.remove('hide-nav');
  } else {
    // Desktop: hide chat, show empty state
    if (chatBg) {
      chatBg.hidden = true;
      chatBg.classList.remove('active-chat');
    }
  }
  // Close any open info backgrounds too
  document.getElementById('contactInfoBg')?.setAttribute('hidden', '');
  document.getElementById('groupInfoBg')?.setAttribute('hidden', '');
  updateEmptyState();
}
window.closeChat = closeChatBg;
backBtn?.addEventListener('click', () => closeChatBg());

// Prevent zoom
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
let lastTouch = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouch <= 300) e.preventDefault();
  lastTouch = now;
}, false);

// Edge swipe to go back - Mobile only
(function() {
  const chatBgEl = document.querySelector('.chat-background');
  const chatListEl = document.querySelector('.chat-load-list');
  const sidebar = document.querySelector('.sidebar-section');
  if (!chatBgEl || !chatListEl) return;
  let startX = 0, startY = 0, isEdgeSwipe = false;
  function openChatList() {
    chatRightWrap?.classList.remove('mobile-show');
    chatListEl.classList.remove('mobile-hide');
    if (sidebar) sidebar.classList.remove('hide-nav');
  }
  chatBgEl.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startX = touch.clientX; startY = touch.clientY;
    if (startX > 30) { isEdgeSwipe = false; return; }
    if (e.target.closest('.msg-row') || e.target.closest('.bubble') || e.target.closest('.chat-input-bar')) {
      isEdgeSwipe = false; return;
    }
    isEdgeSwipe = true;
  }, { passive: true });
  chatBgEl.addEventListener('touchmove', (e) => {
    if (!isEdgeSwipe) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startX;
    const diffY = touch.clientY - startY;
    if (Math.abs(diffY) > 50) { isEdgeSwipe = false; return; }
    if (diffX < 0) { isEdgeSwipe = false; return; }
    if (diffX > 90) { isEdgeSwipe = false; openChatList(); }
  }, { passive: true });
})();

// Scroll btn position when reply preview shows
(function() {
  const replyPreview = document.querySelector('.reply-preview');
  const scrollBtn = document.querySelector('.scroll-down-btn');
  const chatBgEl = document.querySelector('.chat-background');
  if (!replyPreview || !scrollBtn) return;
  const observer = new MutationObserver(() => {
    if (replyPreview.classList.contains('show')) {
      scrollBtn.style.bottom = '138px';
      if (chatBgEl) chatBgEl.classList.add('has-reply');
    } else {
      scrollBtn.style.bottom = '80px';
      if (chatBgEl) chatBgEl.classList.remove('has-reply');
    }
  });
  observer.observe(replyPreview, { attributes: true, attributeFilter: ['class'] });
})();

// ====================================================================
// MOOD PILL - FIXED VERSION - 28PX HEIGHT, TAP ONLY, 3 STATES CYCLE
// ====================================================================
(function(){
  const moodFloat = document.getElementById('moodFloat');
  if(!moodFloat) return;
  const moodPills = moodFloat.querySelectorAll('.mood-pill-mini');
  const singlePill = document.getElementById('moodPillWrapper');
  const moodCard = document.getElementById('moodCard');
  const moodCardTitle = document.getElementById('moodCardTitle');
  const moodCardArtist = document.getElementById('moodCardArtist');
  const moodCardTime = document.getElementById('moodCardTime');
  const states = [
    { state: 'playing', text: 'Asiwaju', sub: 'Playing now', icon: 'wave', hasCard: true, cardTitle: 'Asiwaju', cardArtist: 'Ruger', cardSub: 'Playing now • Spotify' },
    { state: 'recent', text: 'Was feeling • 2h ago', sub: '', icon: 'clock', hasCard: true, cardTitle: 'Chilling', cardArtist: 'Last vibe', cardSub: 'Played 2 hours ago' },
    { state: 'typed', text: '🌙 In my feelings', sub: '', icon: 'moon', hasCard: false, cardTitle: '', cardArtist: '', cardSub: '' }
  ];
  let currentIndex = 0;
  let cycleTimer = null;
  let hideTimer = null;
  let isCardOpen = false;
  let isHidden = false;
  function enforceHeight(){
    moodFloat.style.height = '28px';
    moodFloat.style.minHeight = '28px';
    moodFloat.style.maxHeight = '28px';
    if(singlePill){
      singlePill.style.height = '28px';
      singlePill.style.minHeight = '28px';
      singlePill.style.maxHeight = '28px';
    }
    moodPills.forEach(p=>{
      p.style.height = '28px';
      p.style.minHeight = '28px';
      p.style.maxHeight = '28px';
    });
  }
  function renderState(index){
    const data = states[index];
    if(!data) return;
    if(singlePill && moodPills.length <= 1){
      singlePill.dataset.state = data.state;
      singlePill.dataset.hasCard = data.hasCard ? 'true' : 'false';
      singlePill.setAttribute('data-state', data.state);
      if(data.state === 'playing'){
        singlePill.innerHTML = `<span class="mood-wave"><span></span><span></span><span></span></span><span class="mood-text">${data.text}</span><span class="mood-dot">•</span><span class="mood-sub">${data.sub}</span>`;
      } else if(data.state === 'recent'){
        singlePill.innerHTML = `<i data-lucide="clock" class="mood-icon"></i><span class="mood-text">${data.text}</span>`;
      } else {
        singlePill.innerHTML = `<i data-lucide="moon" class="mood-icon"></i><span class="mood-text">${data.text}</span>`;
      }
      singlePill.classList.remove('hidden');
      singlePill.classList.add('active');
      moodFloat.classList.remove('hidden');
      moodFloat.style.opacity = '1';
      moodFloat.style.pointerEvents = 'auto';
    } else {
      moodPills.forEach((pill,i)=>{
        if(i===index){ pill.classList.add('active'); pill.classList.remove('hidden'); pill.style.display = 'flex'; }
        else { pill.classList.remove('active'); pill.classList.add('hidden'); pill.style.display = 'none'; }
      });
      moodFloat.classList.remove('hidden');
    }
    if(moodCardTitle) moodCardTitle.textContent = data.cardTitle;
    if(moodCardArtist) moodCardArtist.textContent = data.cardArtist;
    if(moodCardTime) moodCardTime.textContent = data.cardSub;
    enforceHeight();
    if(window.lucide) lucide.createIcons();
  }
  function hideMood(){
    moodFloat.style.opacity = '0';
    moodFloat.style.pointerEvents = 'none';
    moodFloat.classList.add('hidden');
    isHidden = true;
  }
  function showMood(){
    moodFloat.style.opacity = '1';
    moodFloat.style.pointerEvents = 'auto';
    moodFloat.classList.remove('hidden');
    isHidden = false;
  }
  function startCycle(){
    renderState(0);
    currentIndex = 0;
    cycleTimer = setInterval(()=>{
      if(isCardOpen) return;
      if(isHidden){
        isHidden = false;
        currentIndex = (currentIndex + 1) % states.length;
        showMood();
        renderState(currentIndex);
        return;
      }
      currentIndex++;
      if(currentIndex >= states.length){
        hideMood();
        currentIndex = states.length - 1;
        hideTimer = setTimeout(()=>{ currentIndex = 0; showMood(); renderState(0); }, 1000);
      } else {
        renderState(currentIndex);
      }
    }, 3000);
  }
  moodFloat.addEventListener('click', (e)=>{
    e.stopPropagation();
    enforceHeight();
    const activePill = moodFloat.querySelector('.mood-pill-mini.active') || singlePill;
    if(!activePill) return;
    const state = activePill.dataset.state || activePill.getAttribute('data-state') || states[currentIndex].state;
    const hasCard = activePill.dataset.hasCard === 'true' || activePill.getAttribute('data-has-card') === 'true';
    if(state === 'typed') return;
    if(hasCard){
      isCardOpen = !moodFloat.classList.contains('open');
      moodFloat.classList.toggle('open');
      if(isCardOpen){
        setTimeout(()=>{ moodFloat.classList.remove('open'); isCardOpen = false; }, 3000);
      }
    }
  });
  document.addEventListener('click', (e)=>{
    if(!moodFloat.contains(e.target)){
      moodFloat.classList.remove('open');
      isCardOpen = false;
    }
  });
  window.addEventListener('resize', enforceHeight);
  enforceHeight();
  startCycle();
  window.moodPill = {
    startCycle,
    stopCycle: ()=> { clearInterval(cycleTimer); clearTimeout(hideTimer); },
    showState: (idx)=> { currentIndex = idx; renderState(idx); },
    hide: hideMood,
    show: showMood,
    states
  };
})();

// ====================================================================
// INPUT BAR - WHATSAPP STYLE GROWS WITH TEXT
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
    if(chatInputBar){
      const baseHeight = 62;
      const extra = Math.max(0, newHeight - 22);
      chatInputBar.style.minHeight = (baseHeight + extra) + 'px';
      chatInputBar.style.height = 'auto';
    }
    if(inputPill){
      const basePill = 42;
      const extra = Math.max(0, newHeight - 22);
      inputPill.style.minHeight = (basePill + extra) + 'px';
      inputPill.style.height = 'auto';
    }
    if(msgInput.value.trim().length>0){ micBtn?.classList.add('sending'); }
    else { micBtn?.classList.remove('sending'); }
  }
  msgInput.addEventListener('input', autoGrow);
  msgInput.addEventListener('focus', autoGrow);
  window.resetInputBar = function(){
    msgInput.value = '';
    msgInput.style.height = 'auto';
    if(chatInputBar){ chatInputBar.style.minHeight = '62px'; chatInputBar.style.height = 'auto'; }
    if(inputPill){ inputPill.style.minHeight = '42px'; inputPill.style.height = 'auto'; }
    micBtn?.classList.remove('sending');
  };
  autoGrow();
})();

// ==========================
// DATE SEPARATOR FLOATING ON SCROLL
// ==========================
let floatingDateTimeout = null;
function initChatScrollLogic() {
  const chatMessages = document.getElementById('chatMessages');
  const floatingDate = document.getElementById('floatingDate');
  if (!chatMessages || !floatingDate) return;
  const dateSeps = chatMessages.querySelectorAll('.date-sep');
  if (dateSeps.length === 0) return;
  chatMessages.addEventListener('scroll', () => {
    let currentDate = null;
    dateSeps.forEach(sep => {
      const rect = sep.getBoundingClientRect();
      const containerRect = chatMessages.getBoundingClientRect();
      if (rect.top <= containerRect.top + 100) {
        currentDate = sep.getAttribute('data-date');
      }
    });
    if (currentDate) {
      floatingDate.textContent = currentDate;
      floatingDate.classList.add('show');
      clearTimeout(floatingDateTimeout);
      floatingDateTimeout = setTimeout(() => {
        floatingDate.classList.remove('show');
      }, 1500);
    }
  }, { passive: true });
}

// FIX: SELECT MODE STILL SCROLLABLE
window.enableSelectModeScroll = function(){
  const cm = document.getElementById('chatMessages');
  if(cm){ cm.style.overflowY = 'auto'; cm.style.pointerEvents = 'auto'; }
  document.getElementById('chatBackground')?.classList.add('select-mode','select-mode-active');
}
window.disableSelectModeScroll = function(){
  document.getElementById('chatBackground')?.classList.remove('select-mode','select-mode-active');
}
const _origEnterSelect = window.enterSelectMode;
window.enterSelectMode = function(...args){
  if(_origEnterSelect) _origEnterSelect(...args);
  window.enableSelectModeScroll();
}
const _origExitSelect = window.exitSelectMode;
window.exitSelectMode = function(...args){
  if(_origExitSelect) _origExitSelect(...args);
  window.disableSelectModeScroll();
}

// FIX: TYPING ALWAYS SHOW
window.showTyping = function() {
  const typing = document.getElementById('typingIndicator');
  if (!typing) return;
  typing.classList.add('show','always-show');
  typing.style.display='flex';
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}
window.hideTyping = function() {
  const typing = document.getElementById('typingIndicator');
  if (!typing) return;
  typing.classList.add('show','always-show');
  typing.style.display='flex';
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
// CONTACT INFO / GROUP INFO - Open from header
// ==========================
function openContactInfo() {
  if (currentChatType === 'group') {
    document.getElementById('groupInfoBg')?.removeAttribute('hidden');
  } else {
    // Fill contact info from current header
    const name = document.getElementById('chatHeaderName')?.textContent || 'Faith Mike';
    const userEl = document.getElementById('contactUsername');
    if (userEl) userEl.textContent = '@' + name.toLowerCase().replace(/\s+/g, '_');
    document.getElementById('contactInfoBg')?.removeAttribute('hidden');
    // Mood pill: if no mood, hide whole mood wrap - handled by CSS [hidden] on parent
    // In this demo, mood exists, so show
  }
  if (window.lucide) lucide.createIcons();
}
document.getElementById('openProfilePreviewBtn')?.addEventListener('click', openContactInfo);
document.getElementById('openProfilePreviewBtn2')?.addEventListener('click', openContactInfo);

document.getElementById('contactInfoBack')?.addEventListener('click', () => {
  document.getElementById('contactInfoBg')?.setAttribute('hidden', '');
});
document.getElementById('groupInfoBack')?.addEventListener('click', () => {
  document.getElementById('groupInfoBg')?.setAttribute('hidden', '');
});

// Edit Contact Info
document.getElementById('contactEditBtn')?.addEventListener('click', () => {
  document.getElementById('editContactBg')?.removeAttribute('hidden');
});
document.getElementById('editContactBack')?.addEventListener('click', () => {
  document.getElementById('editContactBg')?.setAttribute('hidden', '');
});
document.getElementById('editContactSaveBtn')?.addEventListener('click', () => {
  document.getElementById('editContactBg')?.setAttribute('hidden', '');
});

// Add To Groups
document.getElementById('openAddToGroupsBtn')?.addEventListener('click', () => {
  document.getElementById('addToGroupsBg')?.removeAttribute('hidden');
});
document.getElementById('addToGroupsClose')?.addEventListener('click', () => {
  document.getElementById('addToGroupsBg')?.setAttribute('hidden', '');
});
document.getElementById('openCreateGroupWithContactBtn')?.addEventListener('click', () => {
  // Opens existing Create Group flow, contact pre-selected (backend will handle)
  document.getElementById('nkNewGroupRow')?.click();
});

// Group QR
document.getElementById('groupQrBtn')?.addEventListener('click', () => {
  document.getElementById('groupQrBg')?.removeAttribute('hidden');
});
document.getElementById('groupQrBack')?.addEventListener('click', () => {
  document.getElementById('groupQrBg')?.setAttribute('hidden', '');
});
document.getElementById('qrShareLinkBtn')?.addEventListener('click', () => {
  // Copy group link
  if (navigator.clipboard) navigator.clipboard.writeText('https://konnekt.app/group/DesignTeam');
});

// Group Tabs - Members / Settings - Sticky
document.querySelectorAll('.group-tab-mini').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.group-tab-mini').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.groupTab;
    const membersSec = document.getElementById('groupMembersSection');
    const settingsSec = document.getElementById('groupSettingsSection');
    if (tab === 'members') {
      if (membersSec) membersSec.hidden = false;
      if (settingsSec) settingsSec.hidden = true;
    } else {
      if (membersSec) membersSec.hidden = true;
      if (settingsSec) settingsSec.hidden = false;
      // Scroll up to show settings in same row
      document.getElementById('groupInfoScroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

// Group Actions - Exit / Delete / Report / Clear / Share / Add
document.getElementById('groupExitBtn')?.addEventListener('click', () => {
  // Normal member leaves
  addSystemMessage('You • @you left');
  document.getElementById('groupInfoBg')?.setAttribute('hidden', '');
  closeChatBg();
});
document.getElementById('groupDeleteBtn')?.addEventListener('click', () => {
  // Owner only - Delete Group for everyone
  if (confirm('Delete this group for everyone?')) {
    addSystemMessage('Owner deleted this group');
    document.getElementById('groupInfoBg')?.setAttribute('hidden', '');
    closeChatBg();
  }
});
document.getElementById('groupReportBtn')?.addEventListener('click', () => {
  document.getElementById('reportGroupBg')?.removeAttribute('hidden');
});
document.getElementById('reportGroupClose')?.addEventListener('click', () => {
  document.getElementById('reportGroupBg')?.setAttribute('hidden', '');
});
document.getElementById('groupClearBtn')?.addEventListener('click', () => {
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('groupInfoBg')?.setAttribute('hidden', '');
});
document.getElementById('groupActionShare')?.addEventListener('click', () => {
  if (navigator.clipboard) navigator.clipboard.writeText('https://konnekt.app/group/DesignTeam');
});
document.getElementById('groupActionChats')?.addEventListener('click', () => {
  document.getElementById('groupInfoBg')?.setAttribute('hidden', '');
});
document.getElementById('groupActionAdd')?.addEventListener('click', () => {
  document.getElementById('nkNewGroupRow')?.click();
});

// Contact Actions - Clear / Block / Delete
document.getElementById('contactClearChatsBtn')?.addEventListener('click', () => {
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('contactInfoBg')?.setAttribute('hidden', '');
});
document.getElementById('contactBlockBtn')?.addEventListener('click', () => {
  // Block: hide input, show takeover
  document.getElementById('chatInputBar')?.setAttribute('hidden', '');
  document.getElementById('blockedTakeover')?.removeAttribute('hidden');
  document.getElementById('contactBlockedActions')?.removeAttribute('hidden');
  document.getElementById('contactInfoBg')?.setAttribute('hidden', '');
});
document.getElementById('contactUnblockBtn')?.addEventListener('click', () => {
  document.getElementById('chatInputBar')?.removeAttribute('hidden');
  document.getElementById('blockedTakeover')?.setAttribute('hidden', '');
  document.getElementById('contactBlockedActions')?.setAttribute('hidden', '');
});
document.getElementById('unblockBtn')?.addEventListener('click', () => {
  document.getElementById('chatInputBar')?.removeAttribute('hidden');
  document.getElementById('blockedTakeover')?.setAttribute('hidden', '');
});
document.getElementById('contactDeleteBtn')?.addEventListener('click', () => {
  if (confirm('Delete this chat?')) {
    document.getElementById('contactInfoBg')?.setAttribute('hidden', '');
    closeChatBg();
  }
});

// Full Pic Preview
document.getElementById('contactPicOpen')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const img = document.getElementById('contactProfileImage');
  const full = document.getElementById('fullPicImage');
  if (full) full.src = img?.src || '';
  document.getElementById('fullPicName').textContent = document.getElementById('contactUsername')?.textContent || '@Faith_mike';
  document.getElementById('fullPicPreview')?.removeAttribute('hidden');
});
document.getElementById('groupPicOpen')?.addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('fullPicName').textContent = document.getElementById('groupInfoName')?.textContent || 'Design Team';
  document.getElementById('fullPicPreview')?.removeAttribute('hidden');
});
document.getElementById('fullPicClose')?.addEventListener('click', () => {
  document.getElementById('fullPicPreview')?.setAttribute('hidden', '');
});

// ==========================
// SYSTEM MESSAGES - Group
// ==========================
function addSystemMessage(text) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.innerHTML = `<span>${text}</span>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
window.addSystemMessage = addSystemMessage;

// ==========================
// PILL - Copy / Save / Delete - NO FORWARD
// ==========================
let currentPillRow = null;
window.setCurrentPillRow = function(row, isImage) {
  currentPillRow = row;
  const copyBtn = document.getElementById('pillCopyBtn');
  const saveBtn = document.getElementById('pillSaveBtn');
  if (copyBtn) copyBtn.hidden = !!isImage;
  if (saveBtn) saveBtn.hidden = !isImage;
};
document.getElementById('pillCopyBtn')?.addEventListener('click', () => {
  const text = currentPillRow?.querySelector('p')?.innerText || '';
  if (navigator.clipboard && text) navigator.clipboard.writeText(text);
  document.getElementById('poppedMessageContainer')?.classList.remove('active');
});
document.getElementById('pillSaveBtn')?.addEventListener('click', () => {
  // Save image - backend will download
  document.getElementById('poppedMessageContainer')?.classList.remove('active');
});

// Delete - Delete for me / Delete for everyone
document.querySelectorAll('.delete-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.delete; // me or everyone
    if (!currentPillRow) return;
    if (mode === 'me') {
      currentPillRow.remove();
    } else {
      // Delete for everyone -> placeholder
      const bubble = currentPillRow.querySelector('.bubble');
      if (bubble) {
        const time = bubble.querySelector('.msg-time')?.textContent || '';
        bubble.className = 'bubble deleted-bubble';
        bubble.innerHTML = `<i data-lucide="trash-2"></i><p>You deleted this message</p><span class="msg-meta right-meta"><span class="msg-time">${time}</span></span>`;
        currentPillRow.classList.add('deleted-row');
        // Update list last message
        const listItem = document.querySelector(`.chat-item[data-user-id="${currentChatId}"] .chat-last-message`) || document.querySelector(`.chat-item[data-group-id="${currentChatId}"] .chat-last-message`);
        if (listItem) listItem.textContent = '🚫 This message was deleted';
      }
      if (window.lucide) lucide.createIcons();
    }
    document.getElementById('deleteActionBar')?.classList.remove('show');
    document.getElementById('poppedMessageContainer')?.classList.remove('active');
  });
});

// Admin-only takeover helper - call this when group permissions change
window.setAdminOnly = function(isAdminOnly, isAdmin) {
  const takeover = document.getElementById('adminOnlyTakeover');
  const inputBar = document.getElementById('chatInputBar');
  if (isAdminOnly && !isAdmin) {
    inputBar?.setAttribute('hidden', '');
    takeover?.removeAttribute('hidden');
  } else {
    inputBar?.removeAttribute('hidden');
    takeover?.setAttribute('hidden', '');
  }
};

// Group typing helper
window.setGroupTyping = function(names) {
  const typingEl = document.getElementById('chatHeaderTyping');
  const statusEl = document.getElementById('chatHeaderStatus');
  if (!typingEl || !statusEl) return;
  if (!names || names.length === 0) {
    typingEl.hidden = true;
    statusEl.hidden = false;
    return;
  }
  let text = '';
  if (names.length === 1) text = `${names[0]} is typing...`;
  else if (names.length === 2) text = `${names[0]}, ${names[1]} are typing...`;
  else text = `${names.length} people are typing...`;
  typingEl.textContent = text;
  typingEl.hidden = false;
  statusEl.hidden = true;
};

if(window.lucide) lucide.createIcons();
initChatScrollLogic();
updateEmptyState();