// ==========================
// konnekt-main.js - MAIN + REACTION + CONTACT + GROUP - CLEAN - NO CUT
// FIX: Contact / Group Info MUST open when you click chat background profile
// CSS done. New Chat JS separate. Reaction JS separate.
// ==========================
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
const chatLoadList = $('#chatLoadList');
const chatRightWrap = $('#chatRightWrap');
const chatBg = $('#chatBackground');
const chatContainer = $('#chatContainer');
const chatMessages = $('#chatMessages');
const chatEmptyState = $('#chatEmptyState');
const chatEmptyMobile = $('#chatEmptyStateMobile');
const searchInput = $('#searchChatInput');
const titleEl = $('#chatListTitle');
const midChatsText = $('#midChatsText');
const backBtn = $('.arrow-icon');
const tabs = $$('.tab-btn');
const msgInput = $('#msgInput');
const micBtn = $('#micSendBtn');
const chatInputBar = $('#chatInputBar');
const floatingDate = $('#floatingDate');
const scrollBtn = $('#scrollDownBtn');
const replyPreview = $('#replyPreview');
const poppedContainer = $('#poppedMessageContainer');
const poppedClone = $('#poppedClone');
const focusOverlay = $('#messageFocusOverlay');
const emojiReactBar = $('#emojiReactBar');
const emojiPickerPanel = $('#emojiPickerPanel');
const emojiPickerGrid = $('#emojiPickerGrid');
const reactionPopup = $('#reactionActionPopup');
const deleteBar = $('#deleteActionBar');
const selectedPill = $('#selectedPill');
const selectedCount = $('#selectedCount');
const headerCancelBtn = $('#headerCancelBtn');
const toastEl = $('#toast');
const iosNotify = $('#iosNotifyPreview');
const moodFloat = $('#moodFloat');
const moodCard = $('#moodCard');

const IMG = 'konnekt-10-img.png';
const avatarGradients = ["linear-gradient(135deg,#FF6B6B,#EE5A24)","linear-gradient(135deg,#70A1FF,#1E90FF)","linear-gradient(135deg,#7BED9F,#2ED573)","linear-gradient(135deg,#FFA502,#FF7F50)","linear-gradient(135deg,#A29BFE,#6C5CE7)","linear-gradient(135deg,#7ED6DF,#0984E3)","linear-gradient(135deg,#FD79A8,#E84393)","linear-gradient(135deg,#55EFC4,#00B894)"];
let currentChat = null;
let selectedIds = new Set();
let currentHoldRow = null;
let currentReactionRow = null;
let longPressTimer = null;
let isHolding = false;
let floatingTimeout = null;
let moodTimer = null, moodHideTimer = null, moodIndex = 0, moodCardOpen = false;
let hasSeenList = localStorage.getItem('konnekt_has_chats') === '1';
let currentMemberRow = null;
let currentMemberName = '';

// ---------- HELPERS - Info Show / Hide FIX ----------
function refreshIcons(){ if(window.lucide) lucide.createIcons(); }
function showToast(text){ if(!toastEl) return; const s = toastEl.querySelector('span'); if(s) s.textContent = text; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'),2200); }
function isMobile(){ return window.innerWidth <= 768; }
// FIX: Show must clear hidden attr + .hidden class + inline display + bring to front
function nkShow(el){
  if(!el) return;
  el.hidden = false;
  el.classList.remove('hidden');
  el.style.display = '';
  el.style.visibility = 'visible';
  el.style.opacity = '1';
  el.style.pointerEvents = 'auto';
  el.style.zIndex = '100';
}
function nkHide(el){
  if(!el) return;
  el.hidden = true;
  el.classList.add('hidden');
  el.style.display = 'none';
}
function nkHideAllInfo(){
  $$('.contact-info-bg,.edit-contact-bg,.add-to-groups-bg,.group-info-bg,.group-qr-bg,.group-edit-bg,#contactInfoBg,#editContactBg,#addToGroupsBg,#groupInfoBg,#groupQrBg,#groupEditBg,#reportGroupBg,#fullPicBg').forEach(el=>{ el.hidden = true; el.classList.add('hidden'); });
}
function nkShowPopup(id){ const el = $(id); if(el){ el.classList.remove('hidden'); el.classList.add('show'); el.style.display=''; } }
function nkHidePopup(id){ const el = $(id); if(el){ el.classList.add('hidden'); el.classList.remove('show'); } }
function nkIsGroup(){ return !!chatBg?.classList.contains('is-group'); }
function nkGetIsAdmin(){
  const meRow = $('.group-member-row.is-me, .group-member-row[data-is-me="true"]');
  if(meRow){ const role = meRow.querySelector('.group-member-role')?.textContent.toLowerCase() || ''; return role.includes('admin'); }
  return true;
}
window.nkIsAdmin = nkGetIsAdmin;

// ---------- DRAFT ----------
let drafts = {};
try{ drafts = JSON.parse(localStorage.getItem('konnekt_drafts') || '{}') || {}; }catch(e){ drafts = {}; }
function saveDrafts(){ try{ localStorage.setItem('konnekt_drafts', JSON.stringify(drafts)); }catch(e){} }
function saveCurrentDraft(){
  if(!currentChat) return;
  const v = msgInput ? msgInput.value : '';
  if(v.trim()) drafts[currentChat] = v; else delete drafts[currentChat];
  saveDrafts(); updateDraftInList(currentChat);
}
function updateDraftInList(chatId){
  const item = $(`.chat-item[data-chat="${chatId}"]`); if(!item) return;
  const lastEl = item.querySelector('.chat-last-message'); if(!lastEl) return;
  const d = drafts[chatId];
  if(d){ item.classList.add('has-draft'); lastEl.classList.add('is-draft'); lastEl.textContent = 'Draft: ' + (d.length > 40 ? d.slice(0,40)+'...' : d); }
  else { item.classList.remove('has-draft'); lastEl.classList.remove('is-draft'); }
}
function restoreDraft(chatId){
  const d = drafts[chatId] || '';
  if(msgInput){ msgInput.value = d; msgInput.classList.toggle('has-draft', !!d.trim()); autoGrow(); }
}
function clearDraft(chatId){ delete drafts[chatId]; saveDrafts(); updateDraftInList(chatId); }
Object.keys(drafts).forEach(updateDraftInList);

// ---------- 1. AVATAR ----------
$$('.chat-avatar').forEach(el=>{
  if(el.classList.contains('has-image')) return;
  const name = (el.dataset.name || 'User').trim();
  const parts = name.split(/\s+/);
  let initials = parts.length===1 ? parts[0][0] : parts[0][0]+parts[parts.length-1][0];
  const span = el.querySelector('.avatar-initials') || document.createElement('span');
  span.className='avatar-initials'; span.textContent = initials.toUpperCase().slice(0,2);
  if(!el.querySelector('.avatar-initials')) el.appendChild(span);
  let h=0; for(let i=0;i<name.length;i++) h+=name.charCodeAt(i);
  el.style.background = avatarGradients[h%avatarGradients.length];
});
$$('img').forEach(img=>{ if(img.src.includes('pravatar')||img.src.includes('konnekt.jfif')||img.src.includes('knnockt')) img.src = IMG; });

// ---------- 2. TOP BAR ----------
function applyTopBar(){ if(midChatsText) midChatsText.style.display = isMobile() ? 'flex' : 'none'; }
window.addEventListener('resize', applyTopBar); applyTopBar();

// ---------- 3. EMPTY STATE ----------
function applyEmptyState(){
  const isFirst = !hasSeenList;
  if(chatEmptyMobile) chatEmptyMobile.classList.toggle('show', isFirst && isMobile());
  if(chatContainer) chatContainer.style.display = (isFirst && isMobile()) ? 'none' : 'flex';
  if(chatLoadList) chatLoadList.classList.toggle('is-empty-mobile', isFirst && isMobile());
}
applyEmptyState();
$$('#emptyStartChatMobile, #emptyStartChatDesktop, #startChatBtn').forEach(b=>b?.addEventListener('click', ()=>{ if(window.openNewChat) window.openNewChat(); else $('#nkNewChatOverlay')?.classList.add('open'); }));

// ---------- 4. SEARCH + TABS ----------
function applyFilters(){
  const q = (searchInput?.value||'').toLowerCase().trim();
  const active = $('.tab-btn.active')?.dataset.tab || 'all';
  $$('.chat-item', chatContainer).forEach(item=>{
    const name = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
    const type = item.dataset.type;
    const matchSearch = !q || name.includes(q);
    const matchTab = active==='all' || (active==='chats' && type==='chat') || (active==='groups' && type==='group');
    item.classList.toggle('hidden-by-search', !matchSearch);
    item.classList.toggle('hidden-by-tab', !matchTab);
  });
  if(titleEl) titleEl.textContent = active==='all'?'All Chats':active==='chats'?'Chats':'Groups';
}
searchInput?.addEventListener('input', applyFilters);
tabs.forEach(btn=>btn.addEventListener('click', ()=>{ if(btn.dataset.tab==='random') return; tabs.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); applyFilters(); }));
applyFilters();

// ---------- 5. OPEN / CLOSE CHAT ----------
function openChat(item){
  if(!item) return;
  if(currentChat) saveCurrentDraft();
  currentChat = item.dataset.chat || item.dataset.username || 'joshua';
  localStorage.setItem('konnekt_has_chats','1'); hasSeenList = true; applyEmptyState();
  $$('.chat-item').forEach(i=>i.classList.remove('active')); item.classList.add('active');
  const name = item.querySelector('.chat-name')?.textContent || 'Joshua dayo';
  const headerName = $('#chatHeaderName'); if(headerName) headerName.textContent = name;
  const isGroup = item.dataset.type==='group';
  chatBg?.classList.toggle('is-group', isGroup);
  const statusEl = $('#chatHeaderStatus');
  if(statusEl){
    if(isGroup){ statusEl.textContent = '12 members • 3 online'; statusEl.classList.add('group-status'); }
    else { statusEl.textContent = 'Online'; statusEl.classList.remove('group-status'); }
  }
  const profBorder = $('.profile-border', chatBg);
  if(profBorder){ profBorder.classList.toggle('group-avatar', isGroup); }
  if(chatEmptyState) chatEmptyState.hidden = true;
  if(chatBg) chatBg.hidden = false;
  if(chatRightWrap) chatRightWrap.classList.add('open');
  if(isMobile() && chatLoadList) chatLoadList.classList.add('mobile-hide');
  nkHideAllInfo();
  restoreDraft(currentChat);
  applyGroupTabs();
  requestAnimationFrame(()=>{ if(chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight; });
  showTyping();
  refreshIcons();
}
$$('.chat-item').forEach(item=>item.addEventListener('click', ()=>openChat(item)));
function closeChat(){
  if(currentChat) saveCurrentDraft();
  if(isMobile()){ chatRightWrap?.classList.remove('open'); chatLoadList?.classList.remove('mobile-hide'); }
  else { if(chatBg) chatBg.hidden = true; if(chatEmptyState) chatEmptyState.hidden = false; }
  nkHideAllInfo();
}
window.closeChat = closeChat; window.openChat = openChat; backBtn?.addEventListener('click', closeChat);

// ---------- 6. iOS NOTIFY ----------
iosNotify?.addEventListener('click', ()=>{
  const user = iosNotify.dataset.notifyUser || 'alex';
  const item = $(`.chat-item[data-chat="${user}"]`) || $$('.chat-item')[1];
  openChat(item);
  setTimeout(()=>{ msgInput?.focus(); }, 250);
  iosNotify.classList.add('hide'); setTimeout(()=>iosNotify.classList.remove('hide'), 300);
});

// ---------- 7. MOOD PILL ----------
const moodStates = [
  {state:'playing', hasCard:true, title:'Asiwaju', artist:'Ruger', sub:'Playing now • Spotify'},
  {state:'recent', hasCard:true, title:'Chilling', artist:'Last vibe', sub:'Played 2 hours ago'},
  {state:'typed', hasCard:false, title:'', artist:'', sub:''},
];
function renderMood(i){
  const pills = $$('.mood-pill-mini', moodFloat); if(!pills.length) return;
  pills.forEach((p,idx)=>{ p.classList.toggle('active', idx===i); p.style.display = idx===i?'flex':'none'; });
  const d = moodStates[i];
  if($('#moodCardTitle')) $('#moodCardTitle').textContent = d.title;
  if($('#moodCardArtist')) $('#moodCardArtist').textContent = d.artist;
  if($('.mood-card-time', moodCard)) $('.mood-card-time', moodCard).textContent = d.sub;
  if(moodFloat){ moodFloat.style.height='28px'; moodFloat.style.minHeight='28px'; moodFloat.style.maxHeight='28px'; }
  refreshIcons();
}
function startMoodCycle(){
  if(!moodFloat) return; renderMood(0); moodIndex=0;
  moodTimer = setInterval(()=>{
    if(moodCardOpen) return;
    moodIndex++;
    if(moodIndex>=moodStates.length){
      moodFloat.style.opacity='0'; moodFloat.style.pointerEvents='none';
      moodHideTimer = setTimeout(()=>{ moodIndex=0; moodFloat.style.opacity='1'; moodFloat.style.pointerEvents='auto'; renderMood(0); },1000);
      moodIndex = moodStates.length-1;
    } else renderMood(moodIndex);
  },3000);
}
moodFloat?.addEventListener('click', e=>{
  e.stopPropagation();
  const active = $('.mood-pill-mini.active', moodFloat); if(!active) return;
  if(active.dataset.state==='typed') return;
  moodCardOpen = !moodFloat.classList.contains('open');
  moodFloat.classList.toggle('open', moodCardOpen);
  if(moodCardOpen) setTimeout(()=>{ moodFloat.classList.remove('open'); moodCardOpen=false; },3000);
});
document.addEventListener('click', e=>{ if(moodFloat && !moodFloat.contains(e.target)){ moodFloat.classList.remove('open'); moodCardOpen=false; }});
startMoodCycle();
window.moodPill = { showState: renderMood, states: moodStates };

// ---------- 8. INPUT ----------
function autoGrow(){
  if(!msgInput) return;
  msgInput.style.height='auto';
  const h = Math.min(msgInput.scrollHeight, 100);
  msgInput.style.height = h+'px';
  if(chatInputBar){ chatInputBar.style.minHeight = (62 + Math.max(0,h-22))+'px'; }
  micBtn?.classList.toggle('sending', msgInput.value.trim().length>0);
}
msgInput?.addEventListener('input', ()=>{
  if(msgInput.value.length>2000){
    const popup = $('#tooLongPopup'); if(popup) popup.classList.remove('hidden');
    $$('[data-too-long]', popup).forEach(b=>b.onclick=()=>{ msgInput.value = msgInput.value.slice(0,2000); popup.classList.add('hidden'); autoGrow(); });
  }
  msgInput.classList.toggle('has-draft', !!msgInput.value.trim());
  saveCurrentDraft();
  autoGrow();
});
msgInput?.addEventListener('focus', autoGrow);
window.resetInputBar = ()=>{ if(!msgInput) return; msgInput.value=''; msgInput.classList.remove('has-draft'); msgInput.style.height='auto'; micBtn?.classList.remove('sending'); if(currentChat) clearDraft(currentChat); };
micBtn?.addEventListener('click', ()=>{
  if(!msgInput || !msgInput.value.trim()) return;
  addMessage(msgInput.value.trim(), 'sender'); window.resetInputBar();
});

// ---------- 9. ADD MESSAGE ----------
function addMessage(text, owner, opts={}){
  if(!chatMessages) return;
  const id = 'msg'+Date.now();
  const row = document.createElement('div');
  row.className = `msg-row ${owner}`; row.dataset.messageId = id; row.dataset.owner = owner;
  const isGroup = chatBg?.classList.contains('is-group');
  const groupAva = (isGroup && owner==='receiver') ? `<div class="group-msg-ava"><span>${opts.avatar||'A'}</span></div>` : '';
  const quote = opts.quote ? `<div class="quoted-bubble"><div class="quoted-thumb"></div><div class="quoted-info"><span class="quoted-name">${opts.quote.name||'You'}</span><span class="quoted-text">${opts.quote.text||''}</span></div></div>` : '';
  row.innerHTML = `${groupAva}<div class="select-circle"><i data-lucide="check"></i></div><div class="swipe-reply-icon"><i data-lucide="reply"></i></div><div class="bubble ${owner==='sender'?'sender-bubble':'receiver-bubble'}">${quote}<p class="msg-text"></p><span class="msg-meta right-meta"><span class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span><i data-lucide="clock-3" class="tick-icon clock"></i></span><span class="msg-reaction-badge" data-reaction-for="${id}"></span></div>`;
  row.querySelector('.msg-text').textContent = text;
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  bindRow(row); refreshIcons();
  setTimeout(()=>setTick(row,'single'), 800); setTimeout(()=>setTick(row,'double-grey'), 1800); setTimeout(()=>setTick(row,'double-blue'), 3200);
  return row;
}
function setTick(row, type){
  const meta = row.querySelector('.msg-meta'); if(!meta) return;
  let icon = meta.querySelector('.tick-icon'); if(!icon){ icon=document.createElement('i'); meta.appendChild(icon); }
  icon.className='tick-icon '+(type==='single'?'single':type==='double-grey'?'grey':'blue');
  icon.setAttribute('data-lucide', type==='single'?'check':'check-check');
  refreshIcons();
}

// ---------- 10. FLOATING DATE - Only ONE ----------
function initFloating(){
  if(!chatMessages || !floatingDate) return;
  const sticky = $('#stickyDateDivider'); if(sticky) sticky.remove();
  chatMessages.addEventListener('scroll', ()=>{
    const seps = $$('.date-sep', chatMessages); let cur=null;
    seps.forEach(sep=>{ const r=sep.getBoundingClientRect(); const cr=chatMessages.getBoundingClientRect(); if(r.top <= cr.top+100) cur = sep.dataset.date; });
    if(cur){ floatingDate.textContent=cur; floatingDate.classList.add('show'); clearTimeout(floatingTimeout); floatingTimeout=setTimeout(()=>floatingDate.classList.remove('show'),1500); }
  }, {passive:true});
  chatMessages.addEventListener('scroll', ()=>{
    const nearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 120;
    scrollBtn?.classList.toggle('show', !nearBottom);
  }, {passive:true});
}
initFloating();
scrollBtn?.addEventListener('click', ()=>{ if(chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight; });

// ---------- 11. TYPING ----------
window.showTyping = ()=>{
  const isGroup = chatBg?.classList.contains('is-group');
  const one = $('#typingIndicator'); const grp = $('#groupTypingIndicator');
  if(isGroup){ if(one) one.style.display='none'; if(grp){ grp.style.display='flex'; grp.classList.add('show'); } }
  else { if(grp) grp.style.display='none'; if(one){ one.classList.add('show','always-show'); one.style.display='flex'; } }
  if(chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
};
window.hideTyping = ()=>{ const one = $('#typingIndicator'); const grp = $('#groupTypingIndicator'); if(one) one.style.display='none'; if(grp) grp.style.display='none'; };
setTimeout(()=>window.showTyping(), 300);

// ---------- 12. READ MORE ----------
document.addEventListener('click', e=>{
  const btn = e.target.closest('.read-more-btn'); if(!btn) return;
  const target = document.getElementById(btn.dataset.target); if(!target) return;
  const exp = target.classList.toggle('expanded'); btn.textContent = exp?'Read Less':'Read More';
});

// ---------- 13. HOLD PILL ----------
function positionPill(row){
  if(!poppedContainer || !row) return;
  const text = row.querySelector('p')?.innerText || '';
  const isLong = text.length>80 || row.offsetHeight>130;
  poppedContainer.classList.toggle('long-msg', isLong); poppedContainer.classList.toggle('short-msg', !isLong);
  const isMedia = !!row.querySelector('img,video');
  const copyBtn = $('[data-action="copy"]', poppedContainer); const saveBtn = $('[data-action="save"]', poppedContainer);
  if(copyBtn) copyBtn.hidden = isMedia; if(saveBtn) saveBtn.hidden = !isMedia;
  const favBtn = $('[data-action="favorite"]', poppedContainer); if(favBtn) favBtn.style.display = row.querySelector('.sticker-bubble') ? 'flex' : 'none';
}
function openHold(row){
  currentHoldRow = row; positionPill(row);
  if(poppedClone && row.querySelector('.bubble')) poppedClone.innerHTML = row.querySelector('.bubble').outerHTML;
  if(emojiReactBar) emojiReactBar.classList.add('show');
  poppedContainer?.classList.add('active'); focusOverlay?.classList.add('active');
  chatBg?.classList.add('focus-mode'); refreshIcons();
}
function closeHold(){
  poppedContainer?.classList.remove('active'); focusOverlay?.classList.remove('active'); chatBg?.classList.remove('focus-mode');
  emojiReactBar?.classList.remove('show'); emojiPickerPanel?.classList.remove('show'); currentHoldRow=null;
}
focusOverlay?.addEventListener('click', closeHold);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeHold(); });
function bindRow(row){
  row.addEventListener('click', e=>{
    if(e.target.closest('.msg-reaction-badge')) return;
    if(chatBg?.classList.contains('select-mode')){ toggleSelect(row); return; }
  });
  row.addEventListener('contextmenu', e=>{
    if(row.classList.contains('no-actions') || row.classList.contains('call-row') || row.classList.contains('deleted-row')) return;
    e.preventDefault(); openHold(row);
  });
  row.addEventListener('touchstart', e=>{
    if(row.classList.contains('no-actions')) return;
    isHolding=true; longPressTimer=setTimeout(()=>{ if(isHolding) openHold(row); },480);
  }, {passive:true});
  row.addEventListener('touchend', ()=>{ isHolding=false; clearTimeout(longPressTimer); }, {passive:true});
  row.addEventListener('touchmove', ()=>{ isHolding=false; clearTimeout(longPressTimer); }, {passive:true});
  const badge = row.querySelector('.msg-reaction-badge');
  badge?.addEventListener('click', e=>{ e.stopPropagation(); currentReactionRow=row; if(reactionPopup) reactionPopup.classList.add('show'); });
}
$$('.msg-row').forEach(bindRow);
window.positionPillSmart = positionPill;

// ---------- 14. REACTION - No prompt ----------
const EMOJIS = ['❤️','😂','😮','😢','🙏','🔥','👍','👎','😍','😡','🥺','👏','💯','😅','🤔','🎉','😭','🙌','😇','🤣','😘','😴','👀','💔','✨','🌹','👋','🤝','😎','🫡'];
function buildEmojiGrid(){
  if(!emojiPickerGrid) return; emojiPickerGrid.innerHTML='';
  EMOJIS.forEach(em=>{
    const b=document.createElement('button'); b.textContent=em; b.type='button';
    b.addEventListener('click', ()=>{
      if(currentReactionRow) setReaction(currentReactionRow, em);
      else if(currentHoldRow) setReaction(currentHoldRow, em);
      emojiPickerPanel?.classList.remove('show'); closeHold();
    });
    emojiPickerGrid.appendChild(b);
  });
}
buildEmojiGrid();
function setReaction(row, emoji){
  const badge = row.querySelector('.msg-reaction-badge'); if(!badge) return;
  badge.textContent = emoji; badge.classList.add('show'); badge.dataset.reaction = emoji;
}
function removeReaction(row){
  const badge = row.querySelector('.msg-reaction-badge'); if(!badge) return;
  badge.textContent=''; badge.classList.remove('show'); delete badge.dataset.reaction;
}
$$('.emoji-react-bar button[data-emoji]').forEach(b=>b.addEventListener('click', ()=>{ if(currentHoldRow) setReaction(currentHoldRow, b.dataset.emoji); closeHold(); }));
$('#emojiPlusBtn')?.addEventListener('click', ()=>{ emojiPickerPanel?.classList.add('show'); });
$('#emojiPickerClose')?.addEventListener('click', ()=>emojiPickerPanel?.classList.remove('show'));
$('#emojiStickerBtn')?.addEventListener('click', ()=>emojiPickerPanel?.classList.toggle('show'));
$$('[data-reaction-action]').forEach(b=>b.addEventListener('click', ()=>{
  const row = currentReactionRow || window.nkCurrentReactionRow; if(!row) return;
  if(b.dataset.reactionAction==='remove') removeReaction(row);
  else emojiPickerPanel?.classList.add('show');
  reactionPopup?.classList.remove('show');
}));
document.addEventListener('click', e=>{ if(reactionPopup && !reactionPopup.contains(e.target) && !e.target.closest('.msg-reaction-badge')) reactionPopup.classList.remove('show'); });

// ---------- 15. ACTION PILL ----------
$$('#messageActionPill button').forEach(btn=>btn.addEventListener('click', ()=>{
  const act = btn.dataset.action; const row = currentHoldRow; if(!row) return;
  if(act==='copy'){ const t=row.querySelector('.msg-text')?.innerText||''; navigator.clipboard?.writeText(t); showToast('Copied'); }
  if(act==='save'){ showToast('Saved'); }
  if(act==='reply'){
    const t=row.querySelector('.msg-text')?.innerText||'';
    const name = row.classList.contains('sender')?'You':'Joshua dayo';
    const rn = $('#replyPreviewName'); if(rn) rn.textContent=name;
    const rt = $('#replyPreviewText'); if(rt) rt.textContent=t;
    replyPreview?.classList.add('show'); if(msgInput) msgInput.focus();
  }
  if(act==='react'){ emojiPickerPanel?.classList.add('show'); return; }
  if(act==='select'){ enterSelectMode(); if(row) toggleSelect(row); }
  if(act==='favorite'){ showToast('Added to favorites'); try{ localStorage.setItem('konnekt_fav_'+row.dataset.messageId, row.querySelector('.bubble')?.outerHTML||''); }catch(e){} }
  if(act==='delete'){ openDeleteBar([row]); }
  if(act!=='react') closeHold();
}));
$('#replyPreviewClose')?.addEventListener('click', ()=>replyPreview?.classList.remove('show'));

// ---------- 16. SELECT MODE ----------
function enterSelectMode(){
  chatBg?.classList.add('select-mode','select-mode-active');
  $$('.msg-row').forEach(r=>r.classList.add('select-mode'));
  updateSelectedPill();
  const cm = $('#chatMessages'); if(cm){ cm.style.overflowY='auto'; cm.style.pointerEvents='auto'; }
}
function exitSelectMode(){
  chatBg?.classList.remove('select-mode','select-mode-active');
  $$('.msg-row').forEach(r=>{ r.classList.remove('select-mode','selected'); r.querySelector('.select-circle')?.classList.remove('selected'); });
  selectedIds.clear(); updateSelectedPill(); deleteBar?.classList.remove('show');
}
function toggleSelect(row){
  const id=row.dataset.messageId; const sel=row.classList.toggle('selected');
  row.querySelector('.select-circle')?.classList.toggle('selected', sel);
  if(sel) selectedIds.add(id); else selectedIds.delete(id);
  updateSelectedPill();
  if(selectedIds.size===0) exitSelectMode();
}
function updateSelectedPill(){
  if(!selectedPill) return;
  selectedPill.classList.toggle('show', selectedIds.size>0);
  if(selectedCount) selectedCount.textContent = selectedIds.size;
}
headerCancelBtn?.addEventListener('click', exitSelectMode);
window.enterSelectMode=enterSelectMode; window.exitSelectMode=exitSelectMode;

// ---------- 17. DELETE BAR ----------
function openDeleteBar(rows){
  const owners = rows.map(r=>r.dataset.owner); const hasSender = owners.includes('sender'); const hasReceiver = owners.includes('receiver');
  let scope='both';
  if(!hasSender) scope='receiver-only'; else if(rows.length>1 && hasSender && !hasReceiver) scope='sender-many'; else if(hasSender && hasReceiver) scope='mixed';
  if(nkGetIsAdmin() && hasSender) scope = 'both';
  if(deleteBar){ deleteBar.dataset.scope=scope; deleteBar.classList.add('show'); }
  $$('.delete-opt', deleteBar).forEach(opt=>{
    opt.onclick=()=>{
      if(opt.dataset.delete==='me'){ rows.forEach(r=>{ const b=r.querySelector('.bubble'); if(b){ b.innerHTML='<i data-lucide="trash-2"></i><p>This message was deleted</p>'; b.classList.add('deleted-bubble'); } r.classList.add('deleted-row'); }); }
      else { rows.forEach(r=>r.remove()); }
      deleteBar.classList.remove('show'); exitSelectMode(); refreshIcons();
    };
  });
}

// ---------- 18. PLUS / STICKER / PREVIEW - Plus Menu owned by Reaction JS, Main only fallback ----------
$('#inputPlusBtn')?.addEventListener('click', e=>{ e.stopPropagation(); $('#plusPillMenu')?.classList.toggle('show'); });
document.addEventListener('click', e=>{ if(!e.target.closest('#plusPillMenu') && !e.target.closest('#inputPlusBtn')) $('#plusPillMenu')?.classList.remove('show'); });
$('#stickerPanelClose')?.addEventListener('click', ()=>$('#stickerBorderPanel')?.classList.remove('show'));
$('#stickerAddBox')?.addEventListener('click', ()=>{ $('#stickerBorderPanel')?.classList.remove('show'); $('#chatStickerSelectMode')?.classList.add('active'); });
$('#stickerSelectClose')?.addEventListener('click', ()=>$('#chatStickerSelectMode')?.classList.remove('active'));
$('#addStickerCancelX')?.addEventListener('click', ()=>$('#chatStickerSelectMode')?.classList.remove('active'));
$('#addStickerConfirmBtn')?.addEventListener('click', ()=>{ showToast('Sticker added'); $('#chatStickerSelectMode')?.classList.remove('active'); });
$('#previewClose')?.addEventListener('click', ()=>$('#imagePreviewOverlay')?.classList.remove('show'));
$('#previewCancelText')?.addEventListener('click', ()=>$('#imagePreviewOverlay')?.classList.remove('show'));
$('#previewSendBtn')?.addEventListener('click', ()=>{ $('#imagePreviewOverlay')?.classList.remove('show'); showToast('Sent'); });
$('#videoFullClose')?.addEventListener('click', ()=>$('#videoFullOverlay')?.classList.remove('show'));

// ---------- 19. VOICE - Reaction JS owns recording, Main only fallback send ----------
let voiceStart=0, voiceTimerInt=null;
$('#micSendBtn')?.addEventListener('mousedown', ()=>{ if(msgInput?.value.trim()) return; voiceStart=Date.now(); $('#voiceRecordingOverlay')?.classList.add('show'); let s=0; voiceTimerInt=setInterval(()=>{ s++; const t=$('#voiceTimer'); if(t) t.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; },1000); });
document.addEventListener('mouseup', ()=>{
  const ov=$('#voiceRecordingOverlay'); if(!ov?.classList.contains('show')) return;
  clearInterval(voiceTimerInt); const dur=(Date.now()-voiceStart)/1000; ov.classList.remove('show');
  if(dur>=1){ addVoiceMessage(Math.round(dur)); }
});
$('#voiceCancelBtn')?.addEventListener('click', ()=>{ clearInterval(voiceTimerInt); $('#voiceRecordingOverlay')?.classList.remove('show'); });
$('#voiceSendBtn')?.addEventListener('click', ()=>{ clearInterval(voiceTimerInt); $('#voiceRecordingOverlay')?.classList.remove('show'); addVoiceMessage(5); });
$('#voiceStopBtn')?.addEventListener('click', ()=>{ clearInterval(voiceTimerInt); $('#voiceRecordingOverlay')?.classList.remove('show'); });
function addVoiceMessage(durSec){
  if(!chatMessages) return;
  const id='msgVoice'+Date.now();
  const row=document.createElement('div'); row.className='msg-row sender'; row.dataset.messageId=id; row.dataset.owner='sender';
  row.innerHTML=`<div class="select-circle"><i data-lucide="check"></i></div><div class="swipe-reply-icon"><i data-lucide="reply"></i></div><div class="bubble sender-bubble voice-bubble is-loading"><div class="voice-play-wrap"><button class="voice-play-btn"><i data-lucide="play"></i></button><div class="media-loading-overlay voice-loading"><div class="media-loading-circle"><i data-lucide="download" class="media-download-icon"></i><i data-lucide="rotate-ccw" class="media-retry-icon"></i><svg class="media-progress-ring" viewBox="0 0 48 48"><circle class="media-progress-bg" cx="24" cy="24" r="20"></circle><circle class="media-progress-fill" cx="24" cy="24" r="20"></circle></svg><span class="media-loading-percent">0%</span></div></div></div><div class="voice-wave"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><span class="voice-duration">0:${String(durSec).padStart(2,'0')}</span><span class="msg-meta right-meta"><span class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span><i data-lucide="clock-3" class="tick-icon clock"></i></span><span class="msg-reaction-badge" data-reaction-for="${id}"></span></div>`;
  chatMessages.appendChild(row); chatMessages.scrollTop=chatMessages.scrollHeight; bindRow(row); refreshIcons();
  if(window.nkRunLoading) window.nkRunLoading(row.querySelector('.bubble'), ()=>showToast('Voice sent'));
  else if(window.simulateMediaLoading) window.simulateMediaLoading(row.querySelector('.bubble'), ()=>showToast('Voice sent'));
  return row;
}

// ---------- 20. CONTACT / GROUP INFO - FIX: PROFILE CLICK MUST OPEN ----------
// FIX 1: Open function - decides Group vs Contact, syncs name/avatar, brings to front
function openContactOrGroupInfo(){
  if(!chatBg || chatBg.hidden) return;
  // Sync header name into info panels so it looks correct
  const headerName = $('#chatHeaderName')?.textContent || 'Joshua dayo';
  const cName = $('#contactInfoName'); if(cName) cName.textContent = headerName;
  const gName = $('#groupInfoName'); if(gName) gName.textContent = headerName;
  if(nkIsGroup()){
    nkHide($('#contactInfoBg'));
    nkShow($('#groupInfoBg'));
    applyGroupTabs();
  } else {
    nkHide($('#groupInfoBg'));
    nkShow($('#contactInfoBg'));
  }
  refreshIcons();
}
window.openContactOrGroupInfo = openContactOrGroupInfo;
// FIX 2: Direct button - if it exists
$('#profileOpenBtn')?.addEventListener('click', (e)=>{ e.stopPropagation(); openContactOrGroupInfo(); });
// FIX 3: Delegation - ANY header profile click opens info - this is the main fix
// Covers: .profile-border, .chat-header-profile, .chat-header-avatar, #chatHeaderName, #chatHeaderStatus, .header-profile, .profile-text, .chat-header-left
document.addEventListener('click', (e)=>{
  // Do NOT trigger if click is on Back, Call, Video, Menu, Mood, Select pill
  if(e.target.closest('.arrow-icon, #headerCancelBtn, [data-call], [data-video], .call-btn, .video-btn, .header-actions, .mood-float, #moodFloat, .selected-pill, #selectedPill')) return;
  // Do NOT trigger if click is inside info panels themselves
  if(e.target.closest('.contact-info-bg,.edit-contact-bg,.add-to-groups-bg,.group-info-bg,.group-qr-bg,.group-edit-bg')) return;
  // Do NOT trigger if chat not open
  if(!chatBg || chatBg.hidden || !currentChat) return;
  const profileHit = e.target.closest('#profileOpenBtn, .profile-border, .chat-header-profile, .chat-header-avatar, #chatHeaderName, #chatHeaderStatus, .header-profile, .profile-text, .chat-header-left, .chat-header-info, .chat-profile, [data-open-profile], [data-open-info]');
  if(!profileHit) return;
  // Make sure profileHit is inside chat background header, not chat list
  if(!profileHit.closest('#chatBackground')) return;
  e.preventDefault(); e.stopPropagation();
  openContactOrGroupInfo();
}, true); // capture = true, so header click wins over other handlers
// FIX 4: Close Info - every close button must work
document.addEventListener('click', (e)=>{
  const closeBtn = e.target.closest('[data-close-info]');
  if(!closeBtn) return;
  const p = closeBtn.closest('.contact-info-bg,.edit-contact-bg,.add-to-groups-bg,.group-info-bg,.group-qr-bg,.group-edit-bg');
  if(p) nkHide(p);
});
// FIX 5: Contact Actions - Call / Video / Chat / Edit / Add Groups / Block / Delete / Clear
document.addEventListener('click', (e)=>{
  const b = e.target.closest('[data-contact-action]');
  if(!b) return;
  const a = b.dataset.contactAction;
  if(a==='call'){ $('#callOverlay')?.classList.add('show'); return; }
  if(a==='video'){ $('#videoWaitlistOverlay')?.classList.add('show'); return; }
  if(a==='chat'){ nkHide($('#contactInfoBg')); if(msgInput) msgInput.focus(); return; }
  if(a==='edit'){ nkHide($('#contactInfoBg')); nkShow($('#editContactBg')); return; }
  if(a==='save'){ nkHide($('#editContactBg')); nkShow($('#contactInfoBg')); showToast('Contact saved'); return; }
  if(a==='add-groups'){ nkHide($('#contactInfoBg')); nkShow($('#addToGroupsBg')); applyAddGroupsAdmin(); return; }
  if(a==='block'){ nkShowPopup('#blockPopup'); return; }
  if(a==='delete'){ nkShowPopup('#deleteChatPopup'); return; }
  if(a==='clear'){ nkShowPopup('#clearChatsPopup'); return; }
});
// FIX 6: Edit Contact Save - both ID and data-action versions
$('#contactEditBtn')?.addEventListener('click', ()=>{ nkHide($('#contactInfoBg')); nkShow($('#editContactBg')); });
$('#editContactSave')?.addEventListener('click', ()=>{ nkHide($('#editContactBg')); nkShow($('#contactInfoBg')); showToast('Contact saved'); });
$$('[data-open-add-groups]').forEach(b=>b.addEventListener('click', ()=>{ nkHide($('#contactInfoBg')); nkShow($('#addToGroupsBg')); applyAddGroupsAdmin(); }));
$('#addToGroupsAddBtn')?.addEventListener('click', ()=>{ const btn=$('#addToGroupsAddBtn'); if(btn && btn.disabled) return; nkHide($('#addToGroupsBg')); showToast('Added to groups'); addSystemMsg('Admin Faith added John'); });
function addSystemMsg(text){
  if(!chatMessages) return; const d=document.createElement('div'); d.className='system-msg'; d.innerHTML=`<span></span>`; d.querySelector('span').textContent=text; chatMessages.appendChild(d); chatMessages.scrollTop=chatMessages.scrollHeight;
}
function applyAddGroupsAdmin(){
  const isAdmin = nkGetIsAdmin();
  const btn = $('#addToGroupsAddBtn'); const hint = $('#addToGroupsHint');
  if(btn){ btn.disabled = !isAdmin; btn.classList.toggle('is-disabled', !isAdmin); }
  if(hint){ hint.hidden = isAdmin; hint.textContent = 'Only admin can add'; }
}
function applyGroupTabs(){
  const isAdmin = nkGetIsAdmin();
  $$('.group-tab-mini').forEach(t=>{
    if(t.dataset.groupTab==='settings'){ t.style.display = isAdmin ? '' : 'none'; }
    if(t.dataset.groupTab==='members'){ t.style.display = ''; }
  });
  if(!isAdmin){
    const memTab = $('.group-tab-mini[data-group-tab="members"]'); if(memTab) memTab.click();
  }
  $$('[data-admin-only="true"]').forEach(el=>{ el.classList.toggle('hide-for-non-admin', !isAdmin); });
}
// FIX 7: Group Actions - Chat / Share QR / Add Member / Exit / Delete / Report / Clear / Edit
document.addEventListener('click', (e)=>{
  const b = e.target.closest('[data-group-action]');
  if(!b) return;
  const a = b.dataset.groupAction;
  if(a==='chat'){ nkHide($('#groupInfoBg')); if(msgInput) msgInput.focus(); return; }
  if(a==='share'){ nkHide($('#groupInfoBg')); nkShow($('#groupQrBg')); return; }
  if(a==='add'){ nkHide($('#groupInfoBg')); if(window.openAddMember) window.openAddMember(); else $('#nkNewGroupOverlay')?.classList.add('open'); return; }
  if(a==='exit'){ nkShowPopup('#exitGroupPopup'); return; }
  if(a==='delete'){ nkShowPopup('#deleteGroupPopup'); return; }
  if(a==='report'){ const r=$('#reportGroupBg'); if(r){ r.hidden=false; r.classList.remove('hidden'); } return; }
  if(a==='clear'){ nkShowPopup('#clearChatsPopup'); return; }
  if(a==='edit'){ nkHide($('#groupInfoBg')); nkShow($('#groupEditBg')); return; }
});
$('#groupEditBtn')?.addEventListener('click', ()=>{ const p=$('#groupEditPill'); if(p){ p.hidden = !p.hidden; p.classList.toggle('hidden', !!p.hidden); } });
$$('[data-group-edit]').forEach(b=>b.addEventListener('click', ()=>{ nkHide($('#groupInfoBg')); nkShow($('#groupEditBg')); }));
$$('.group-tab-mini').forEach(t=>t.addEventListener('click', ()=>{
  if(t.dataset.groupTab==='settings' && !nkGetIsAdmin()) return;
  $$('.group-tab-mini').forEach(x=>x.classList.remove('active')); t.classList.add('active');
  const tab=t.dataset.groupTab; const ms=$('#groupMembersSection'); if(ms) ms.hidden = tab!=='members'; const ss=$('#groupSettingsSection'); if(ss) ss.hidden = tab!=='settings';
}));
$('#groupSaveBtn')?.addEventListener('click', ()=>nkShowPopup('#settingsSavedPopup'));
// FIX 8: Member Row -> Member Sheet, Role filter
document.addEventListener('click', (e)=>{
  const mRow = e.target.closest('.group-member-row');
  if(!mRow) return;
  if(e.target.closest('[data-member-action]')) return; // handled below
  currentMemberRow = mRow;
  currentMemberName = mRow.querySelector('.group-member-name')?.textContent || 'Member';
  const nameEl = $('#memberSheetName'); if(nameEl) nameEl.textContent = currentMemberName;
  const sh = $('#memberSheet'); if(sh) nkShow(sh);
  $$('[data-member-action]').forEach(a=>{ a.hidden = !nkGetIsAdmin() && a.dataset.memberAction!=='view'; });
});
$$('[data-close-sheet]').forEach(b=>b.addEventListener('click', ()=>{ const s=$('#memberSheet'); if(s) nkHide(s); }));
document.addEventListener('click', (e)=>{
  const b = e.target.closest('[data-member-action]');
  if(!b) return;
  const a = b.dataset.memberAction; const s=$('#memberSheet'); if(s) nkHide(s);
  if(a==='view'){ nkHide($('#groupInfoBg')); nkShow($('#contactInfoBg')); return; }
  if(a==='make-admin'){ if(currentMemberRow){ let role=currentMemberRow.querySelector('.group-member-role'); if(!role){ role=document.createElement('span'); role.className='group-member-role'; currentMemberRow.appendChild(role); } role.textContent='Admin'; showToast(currentMemberName+' is now Admin'); } return; }
  if(a==='remove-admin'){ if(currentMemberRow){ const role=currentMemberRow.querySelector('.group-member-role'); if(role) role.textContent=''; showToast(currentMemberName+' removed as Admin'); } return; }
  if(a==='remove' || a==='remove-member'){ if(currentMemberRow){ currentMemberRow.remove(); addSystemMsg(currentMemberName+' was removed'); showToast('Member removed'); } return; }
  showToast('Done');
});
// FIX 9: QR Share, Report, Full Pic - every border
$('#qrShareBtn')?.addEventListener('click', ()=>{ navigator.clipboard?.writeText('https://konnekt.app/group/design-team'); const h=$('#qrCopiedHint'); if(h) h.hidden=false; showToast('Copied'); });
$$('.report-opt').forEach(b=>b.addEventListener('click', ()=>{ $$('.report-opt').forEach(x=>x.classList.remove('active')); b.classList.add('active'); }));
$('#reportSubmitBtn')?.addEventListener('click', ()=>{
  const rs=$('#reportSuccess'); if(rs){ rs.hidden=false; rs.classList.remove('hidden'); }
  const inp = $('#reportMoreInput'); if(inp) inp.value='';
  setTimeout(()=>{ const rg=$('#reportGroupBg'); if(rg) nkHide(rg); if(rs){ rs.hidden=true; rs.classList.add('hidden'); } },1200);
});
$$('[data-open-full-pic]').forEach(b=>b.addEventListener('click', ()=>{ const f=$('#fullPicBg'); if(f) nkShow(f); }));
// FIX 10: Add Member button by ID (in case data-attr differs)
document.addEventListener('click', (e)=>{
  if(e.target.closest('#addMemberBtn') || e.target.closest('[data-open-add-member]')){
    nkHide($('#groupInfoBg')); if(window.openAddMember) window.openAddMember(); else $('#nkNewGroupOverlay')?.classList.add('open');
  }
  if(e.target.closest('#groupSaveBtn') || e.target.closest('#saveGroupBtn')){
    nkShowPopup('#settingsSavedPopup'); showToast('Group saved');
  }
  if(e.target.closest('#qrShareBtn') || e.target.closest('#qrCopyBtn')){
    try{ navigator.clipboard?.writeText('https://konnekt.app/group/design-team'); }catch(err){}
    const h = $('#qrCopiedHint'); if(h) h.hidden = false; showToast('Copied');
  }
});

// ---------- 21. POPUPS ----------
$$('[data-close-popup]').forEach(b=>b.addEventListener('click', ()=>b.closest('.nk-popup-overlay')?.classList.add('hidden')));
$('#nkPopupBtn')?.addEventListener('click', ()=>$('#nkPopupOverlay')?.classList.add('hidden'));
$$('[data-confirm-clear]').forEach(b=>b.addEventListener('click', ()=>{
  if(chatMessages){ $$('.msg-row', chatMessages).forEach(r=>{ if(!r.id.includes('typing')) r.remove(); }); }
  nkHidePopup('#clearChatsPopup'); showToast('Chats cleared');
}));
$$('[data-confirm-block]').forEach(b=>b.addEventListener('click', ()=>{
  nkHidePopup('#blockPopup'); chatBg?.classList.add('is-blocked'); const bt=$('#blockedTakeover'); if(bt) bt.hidden=false; if(chatInputBar) chatInputBar.style.display='none'; nkHide($('#contactInfoBg'));
}));
$$('[data-confirm-delete-chat]').forEach(b=>b.addEventListener('click', ()=>{
  nkHidePopup('#deleteChatPopup'); $$('.chat-item.active').forEach(i=>i.remove()); closeChat();
}));
$$('[data-confirm-unblock]').forEach(b=>b.addEventListener('click', ()=>{
  nkHidePopup('#unblockPopup'); chatBg?.classList.remove('is-blocked'); const bt=$('#blockedTakeover'); if(bt) bt.hidden=true; if(chatInputBar) chatInputBar.style.display='flex'; showToast('Unblocked');
}));
$$('[data-confirm-exit]').forEach(b=>b.addEventListener('click', ()=>{
  nkHidePopup('#exitGroupPopup'); chatBg?.classList.add('is-group-gone'); const gt=$('#groupGoneTakeover'); if(gt){ gt.hidden=false; gt.classList.remove('hidden'); } if(chatInputBar) chatInputBar.style.display='none'; nkHide($('#groupInfoBg')); showToast('You left the group');
}));
$$('[data-confirm-delete-group]').forEach(b=>b.addEventListener('click', ()=>{
  nkHidePopup('#deleteGroupPopup'); $$('.chat-item.active').forEach(i=>i.remove()); closeChat(); showToast('Group deleted');
}));
$$('[data-action="clear"]').forEach(b=>b.addEventListener('click', ()=>nkShowPopup('#clearChatsPopup')));
$$('[data-action="block"]').forEach(b=>b.addEventListener('click', ()=>nkShowPopup('#blockPopup')));
$$('[data-action="delete"]').forEach(b=>b.addEventListener('click', ()=>nkShowPopup('#deleteChatPopup')));
$$('.blocked-action-btn.unblock').forEach(b=>b.addEventListener('click', ()=>nkShowPopup('#unblockPopup')));
$$('.blocked-action-btn.delete').forEach(b=>b.addEventListener('click', ()=>nkShowPopup('#deleteChatPopup')));

// ---------- 22. CALL UI + WAITLIST ----------
$('#startOutgoingCallBtn')?.addEventListener('click', ()=>$('#callOverlay')?.classList.add('show'));
$('#callEndBtn')?.addEventListener('click', ()=>$('#callOverlay')?.classList.remove('show'));
$('#callGoList')?.addEventListener('click', ()=>{ $('#callOverlay')?.classList.remove('show'); $('#dynamicPill')?.classList.add('show'); });
$('#dynamicPill')?.addEventListener('click', ()=>{ $('#dynamicPill')?.classList.remove('show'); $('#expandedPill')?.classList.add('show'); });
$('#expandBackToCall')?.addEventListener('click', ()=>{ $('#expandedPill')?.classList.remove('show'); $('#callOverlay')?.classList.add('show'); });
$('#pillEndBtn')?.addEventListener('click', ()=>$('#expandedPill')?.classList.remove('show'));
$('#yourVideoBtn')?.addEventListener('click', ()=>$('#videoWaitlistOverlay')?.classList.add('show'));
$('#waitlistCloseBtn')?.addEventListener('click', ()=>$('#videoWaitlistOverlay')?.classList.remove('show'));
$('#waitlistReason')?.addEventListener('input', e=>{ const c=$('#waitlistCharCount'); if(c) c.textContent = e.target.value.length; });
$('#waitlistJoinBtn')?.addEventListener('click', ()=>{
  const btn = $('#waitlistJoinBtn');
  const loader = $('.konnekt-waitlist-loader', btn); if(loader) loader.classList.remove('hidden');
  setTimeout(()=>{ if(loader) loader.classList.add('hidden'); const chk = $('.konnekt-waitlist-check', btn); if(chk) chk.classList.remove('hidden'); $('#waitlistSuccess')?.classList.add('show'); },1000);
});
$$('.konnekt-call-mini.accept').forEach(b=>b.addEventListener('click', ()=>{ const t=$('.konnekt-incoming-tile.show'); if(t) t.classList.remove('show'); $('#callOverlay')?.classList.add('show'); }));
$$('.konnekt-call-mini.decline').forEach(b=>b.addEventListener('click', ()=>{ const t=$('.konnekt-incoming-tile.show'); if(t) t.classList.remove('show'); }));

// ---------- 23. PREVENT ZOOM + EDGE SWIPE BACK ----------
document.addEventListener('touchmove', e=>{ if(e.touches.length>1) e.preventDefault(); }, {passive:false});
let lastTouch=0; document.addEventListener('touchend', e=>{ const now=Date.now(); if(now-lastTouch<=300) e.preventDefault(); lastTouch=now; }, false);
(function(){
  if(!chatBg || !chatLoadList) return; let sx=0, sy=0, edge=false;
  chatBg.addEventListener('touchstart', e=>{ if(e.touches.length!==1) return; sx=e.touches[0].clientX; sy=e.touches[0].clientY; if(sx>30) {edge=false; return;} if(e.target.closest('.msg-row')||e.target.closest('.bubble')||e.target.closest('.chat-input-bar')){edge=false;return;} edge=true; }, {passive:true});
  chatBg.addEventListener('touchmove', e=>{ if(!edge) return; const t=e.touches[0]; const dx=t.clientX-sx, dy=t.clientY-sy; if(Math.abs(dy)>50){edge=false;return;} if(dx>90){edge=false; closeChat();} }, {passive:true});
})();

// ---------- 24. SCROLL BTN POSITION ----------
if(replyPreview && scrollBtn){
  new MutationObserver(()=>{
    if(replyPreview.classList.contains('show')) scrollBtn.style.bottom='138px'; else scrollBtn.style.bottom='80px';
  }).observe(replyPreview, {attributes:true, attributeFilter:['class']});
}

// ---------- 25. MEDIA LOADING ----------
window.setMediaLoading = (bubble, percent, isRetry=false)=>{
  const ov = bubble?.querySelector('.media-loading-overlay'); if(!ov) return;
  ov.hidden = percent>=100; ov.classList.toggle('is-retry', isRetry);
  const p = ov.querySelector('.media-loading-percent'); if(p) p.textContent = percent+'%';
  const ring = ov.querySelector('.media-progress-fill'); if(ring) ring.style.strokeDashoffset = 126 - (126*percent/100);
  if(bubble.classList.contains('voice-bubble') || bubble.classList.contains('sticker-bubble')) bubble.classList.toggle('is-loading', percent<100);
  if(percent>=100) bubble.classList.remove('is-loading');
};
function simulateMediaLoading(bubble, done){
  if(!bubble) { if(done) done(); return; }
  let p=0; const iv=setInterval(()=>{
    p+=Math.floor(Math.random()*18)+8; if(p>=100){ p=100; clearInterval(iv); window.setMediaLoading(bubble,100); if(done) done(); }
    else window.setMediaLoading(bubble,p);
  },180);
  const ov=bubble.querySelector('.media-loading-overlay'); if(ov){ ov.addEventListener('click', e=>{ if(ov.classList.contains('is-retry')){ ov.classList.remove('is-retry'); simulateMediaLoading(bubble,done); } }); }
}
window.simulateMediaLoading = simulateMediaLoading;

// ---------- 26. GALLERY / CAMERA - Reaction JS owns preview, Main only fallback ----------
$('#galleryInput')?.addEventListener('change', e=>{ const f=e.target.files[0]; if(!f) return; if(window.nkGalleryHandled) return; const ov=$('#imagePreviewOverlay'); if(ov) ov.classList.add('show'); const img=$('#previewImage'); const vid=$('#previewVideo'); if(img && f.type.startsWith('image')){ img.src=URL.createObjectURL(f); img.style.display='block'; if(vid) vid.style.display='none'; } if(vid && f.type.startsWith('video')){ vid.src=URL.createObjectURL(f); vid.style.display='block'; if(img) img.style.display='none'; } });
$('#cameraInput')?.addEventListener('change', e=>{ $('#galleryInput')?.dispatchEvent(new Event('change')); });

// ---------- 27. FIX ADD - Info Borders Must Be Clickable ----------
(function(){
  // Make info panels clickable - if CSS pointer-events none, fix it
  $$('.contact-info-bg,.edit-contact-bg,.add-to-groups-bg,.group-info-bg,.group-qr-bg,.group-edit-bg,#contactInfoBg,#editContactBg,#addToGroupsBg,#groupInfoBg,#groupQrBg,#groupEditBg').forEach(el=>{
    el.style.pointerEvents = 'auto';
  });
  // Make header profile clickable - if CSS pointer-events none, fix it
  $$('#profileOpenBtn, .profile-border, .chat-header-profile, .chat-header-avatar, #chatHeaderName, #chatHeaderStatus').forEach(el=>{
    el.style.pointerEvents = 'auto'; el.style.cursor = 'pointer';
  });
})();

refreshIcons(); initFloating(); applyFilters();