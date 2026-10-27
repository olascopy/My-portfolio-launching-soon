// ======================================================
// KONNEKT MOMENTS - FINAL JS - 2026 - ALL FUNCTIONS WORK
// Delete hub + viewer fixed, Report/Block, Caption head, Play/Pause
// moments-page-right LEFT AS IS
// ======================================================

try { lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); } catch(e){}

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768;

// ========== ELEMENTS ==========
const moreBtn = document.getElementById('moreBtn');
const morePop = document.getElementById('morePop');
const plusBtn = document.getElementById('plusBtn');
const plusPop = document.getElementById('plusPop');
const galleryInput = document.getElementById('galleryInput');
const privacyPage = document.getElementById('privacyPage');
const backPrivacy = document.getElementById('backPrivacy');
const textPage = document.getElementById('textPage');
const input = document.getElementById('input');
const placeholder = document.getElementById('placeholder');
const cursor = document.getElementById('cursor');
const sendBtn = document.getElementById('sendBtn');
const centerBox = document.getElementById('centerBox');
const palWrap = document.getElementById('palWrap');
const miniPop = document.getElementById('miniPop');
const myHubPage = document.getElementById('myHubPage');
const viewerPage = document.getElementById('viewerPage');
const previewPage = document.getElementById('previewPage');
const myRow = document.getElementById('myMomentsRow');
const myProfilePop = document.getElementById('myProfilePop');
const myGalleryUnder = document.getElementById('myGalleryUnder');

// Viewer
const viewerLines = document.getElementById('viewerLines');
const viewerImage = document.getElementById('viewerImage');
const viewerVideo = document.getElementById('viewerVideo');
const viewerText = document.getElementById('viewerText');
const viewerCaption = document.getElementById('viewerCaption');
const viewerViews = document.getElementById('viewerViews');
const viewerViewsCount = document.getElementById('viewerViewsCount');
const viewerMoreBtn = document.getElementById('viewerMoreBtn');
const viewerMorePopMe = document.getElementById('viewerMorePopMe');
const viewerMorePopOther = document.getElementById('viewerMorePopOther');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');

// Sheets
const deleteSheet = document.getElementById('deleteConfirmSheet');
const reportSheet = document.getElementById('reportSheet');
const blockSheet = document.getElementById('blockSheet');
const unblockSheet = document.getElementById('unblockSheet');

// Toasts
const toastDeleted = document.getElementById('toastDeleted');
const toastBlocked = document.getElementById('toastBlocked');
const toastUnblocked = document.getElementById('toastUnblocked');
const toastReported = document.getElementById('toastReported');

// ========== DATA ==========
let myMoments = [];
let blockedUsers = [];
try { myMoments = JSON.parse(localStorage.getItem('myMoments') || '[]'); } catch(e){ myMoments=[]; }
try { blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]'); } catch(e){ blockedUsers=[]; }
let selectedFiles = [];
let currentPreviewIndex = 0;
let viewerIndex = 0;
let currentViewerUser = 'me';
let currentViewerName = 'My moments';
let viewerProgressTimer = null;
let isHolding = false;
let isPlaying = true;
let pendingDeleteIndex = null;
let pendingDeleteSource = null;
let currentBlockedTarget = null;

const fakeViewers = [
  {name:'Blessing Adeyemi', avatar:'konnect2.jfif', time:'2m ago'},
  {name:'David Okon', avatar:'konnect2.jfif', time:'5m ago'},
  {name:'Sarah Johnson', avatar:'konnect2.jfif', time:'10m ago'}
];

// ========== HELPERS ==========
function saveMyMoments(){
  localStorage.setItem('myMoments', JSON.stringify(myMoments));
  const el = document.getElementById('myAvatarBorder');
  if(el){
    if(myMoments.length>0) el.classList.add('has-moments');
    else el.classList.remove('has-moments');
  }
}
function saveBlocked(){ localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers)); }
function hasMyMoments(){ return myMoments.length>0; }
function openPhoneGallery(){ if(galleryInput) galleryInput.click(); }
function showToast(el){
  if(!el) return;
  el.classList.add('show');
  setTimeout(()=> el.classList.remove('show'), 2300);
}
function closeAllSheets(){
  document.querySelectorAll('.slide-sheet').forEach(s=> s.classList.remove('show'));
}
function closeAllPops(){
  morePop?.classList.remove('show');
  plusPop?.classList.remove('show');
  moreBtn?.classList.remove('active');
  plusBtn?.classList.remove('active');
  miniPop?.classList.remove('show');
  palWrap?.classList.remove('show');
  document.getElementById('previewMiniPop')?.classList.remove('show');
  viewerMorePopMe?.classList.remove('show');
  viewerMorePopOther?.classList.remove('show');
  document.getElementById('viewersPop')?.classList.remove('show');
}
saveMyMoments();

// ========== HEADER POPUPS ==========
if(moreBtn){
  moreBtn.onclick = (e)=>{
    e.stopPropagation();
    const open = morePop?.classList.contains('show');
    closeAllPops(); closeAllSheets();
    myProfilePop?.classList.remove('show');
    myGalleryUnder?.classList.remove('show');
    if(!open){ morePop?.classList.add('show'); moreBtn.classList.add('active'); }
  };
}
if(plusBtn){
  plusBtn.onclick = (e)=>{
    e.stopPropagation();
    const open = plusPop?.classList.contains('show');
    closeAllPops(); closeAllSheets();
    myProfilePop?.classList.remove('show');
    myGalleryUnder?.classList.remove('show');
    if(!open){ plusPop?.classList.add('show'); plusBtn.classList.add('active'); }
  };
}

// ========== PRIVACY ==========
morePop?.querySelector('.pop-item')?.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAllPops();
  privacyPage?.classList.add('open');
});
if(backPrivacy) backPrivacy.onclick = ()=> privacyPage?.classList.remove('open');
document.querySelectorAll('.privacy-option').forEach(opt=>{
  opt.onclick = ()=>{
    document.querySelectorAll('.privacy-option').forEach(o=>o.classList.remove('active'));
    opt.classList.add('active');
    localStorage.setItem('momentsPrivacy', opt.dataset.value);
  };
});
const savedPrivacy = localStorage.getItem('momentsPrivacy') || 'contacts';
document.querySelector(`.privacy-option[data-value="${savedPrivacy}"]`)?.classList.add('active');
document.getElementById('plusPhoto')?.addEventListener('click', e=>{ e.stopPropagation(); closeAllPops(); openPhoneGallery(); });
document.getElementById('plusText')?.addEventListener('click', e=>{ e.stopPropagation(); closeAllPops(); openTextPage(); });

// ========== MY ROW ==========
if(myRow){
  myRow.onclick = (e)=>{
    e.stopPropagation();
    if(!hasMyMoments()){
      const open = myProfilePop?.classList.contains('show');
      closeAllPops(); closeAllSheets();
      if(!open){
        myProfilePop?.classList.add('show');
        if(isMobile) renderMyRealGalleryUnder();
      }else{
        myProfilePop?.classList.remove('show');
        myGalleryUnder?.classList.remove('show');
      }
    }else{
      closeAllPops(); closeAllSheets();
      myProfilePop?.classList.remove('show');
      myGalleryUnder?.classList.remove('show');
      openHub();
    }
  };
}
function renderMyRealGalleryUnder(){
  if(!myGalleryUnder) return;
  const realSrc = document.querySelector('#myAvatarBorder img')?.src || 'konnect2.jfif';
  myGalleryUnder.innerHTML=''; myGalleryUnder.classList.add('show');
  for(let i=0;i<6;i++){
    const wrap=document.createElement('div'); wrap.className='gallery-thumb';
    const img=document.createElement('img'); img.src=realSrc;
    wrap.appendChild(img);
    wrap.onclick=(ev)=>{ ev.stopPropagation(); openPhoneGallery(); };
    myGalleryUnder.appendChild(wrap);
  }
}
document.getElementById('myProfilePhoto')?.addEventListener('click', e=>{ e.stopPropagation(); closeAllPops(); myProfilePop?.classList.remove('show'); openPhoneGallery(); });
document.getElementById('myProfileText')?.addEventListener('click', e=>{ e.stopPropagation(); closeAllPops(); myProfilePop?.classList.remove('show'); myGalleryUnder?.classList.remove('show'); openTextPage(); });

// ========== HUB ==========
function openHub(){
  if(!myHubPage) return;
  myHubPage.classList.add('open');
  document.body.classList.add('hub-open');
  renderHub();
}
function closeHub(){
  myHubPage?.classList.remove('open');
  document.body.classList.remove('hub-open');
}
document.getElementById('closeHub')?.addEventListener('click', closeHub);
document.getElementById('hubPlus')?.addEventListener('click', openPhoneGallery);

function renderHub(){
  const big=document.getElementById('hubBigCircle');
  const list=document.getElementById('hubList');
  if(!big||!list) return;
  if(myMoments.length===0){ big.innerHTML='<div style="font-size:12px;opacity:.6">No moments</div>'; list.innerHTML=''; return; }
  let selected = myMoments.length-1;
  if(typeof renderHub.selectedIndex!=='undefined') selected=renderHub.selectedIndex;
  else renderHub.selectedIndex=selected;
  const current=myMoments[selected];
  if(!current){ return; }
  if(current.type==='image') big.innerHTML=`<img src="${current.src}">`;
  else if(current.type==='video') big.innerHTML=`<video src="${current.src}" muted loop autoplay playsinline></video>`;
  else big.innerHTML=`<div style="width:100%;height:100%;border-radius:50%;background:${current.bg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px">${(current.text||'').slice(0,20)}</div>`;
  big.onclick=()=>openViewer('me',selected,'My moments');
  list.innerHTML='';
  [...myMoments].reverse().forEach((m,revIdx)=>{
    const idx=myMoments.length-1-revIdx;
    const item=document.createElement('div'); item.className='hub-item';
    const statusClass=m.status==='posting'?'posting':'posted';
    const statusText=m.status==='posting'?'Adding...':'Added';
    let mediaHtml='';
    if(m.type==='image') mediaHtml=`<img src="${m.src}">`;
    else if(m.type==='video') mediaHtml=`<video src="${m.src}" muted playsinline></video>`;
    else mediaHtml=`<div style="width:48px;height:48px;border-radius:10px;background:${m.bg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;flex-shrink:0">Text</div>`;
    item.innerHTML=`${mediaHtml}<div class="hub-item-info"><div class="s">${new Date(m.time).toLocaleTimeString()} • ${m.privacy||'Everyone'}</div><div style="font-size:12px;color:#fff;margin-top:2px;word-break:break-word;font-weight:500">${m.caption?m.caption:(m.text||'No caption')}</div><div class="hub-status ${statusClass}">${statusText}</div></div><button class="hub-delete-btn" data-idx="${idx}"><i data-lucide="trash-2" style="width:14px"></i></button>`;
    const mediaEl = item.querySelector('img, video');
    if(mediaEl) mediaEl.addEventListener('click', ()=> openViewer('me', idx, 'My moments'));
    const delBtn = item.querySelector('.hub-delete-btn');
    delBtn?.addEventListener('click', (e)=>{
      e.stopPropagation();
      pendingDeleteIndex = idx;
      pendingDeleteSource = 'hub';
      openDeleteSheet();
    });
    list.appendChild(item);
  });
  try{ lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }catch(e){}
}

// ========== GALLERY ==========
if(galleryInput){
  galleryInput.onchange = (e)=>{
    const files=Array.from(e.target.files||[]);
    if(files.length===0) return;
    files.forEach(file=>{
      selectedFiles.push({ type:file.type.startsWith('video')?'video':'image', src:URL.createObjectURL(file), caption:'', duration:0 });
    });
    currentPreviewIndex = selectedFiles.length - files.length;
    if(currentPreviewIndex<0) currentPreviewIndex=0;
    openPreview();
    e.target.value='';
  };
}
function openPreview(){
  previewPage?.classList.add('open');
  document.body.classList.add('preview-open');
  renderPreview();
}
function closePreview(){
  const oldV=document.querySelector('#previewBg video');
  if(oldV){ oldV.pause(); try{ oldV.removeAttribute('src'); oldV.load(); }catch(e){} }
  previewPage?.classList.remove('open');
  document.body.classList.remove('preview-open');
  selectedFiles=[];
  if(galleryInput) galleryInput.value='';
  const bg=document.getElementById('previewBg');
  if(bg) bg.innerHTML='';
}
document.getElementById('closePreview')?.addEventListener('click', closePreview);
document.getElementById('previewAddMore')?.addEventListener('click', openPhoneGallery);
document.getElementById('previewNext')?.addEventListener('click', ()=>{
  saveCurrentCaption();
  if(currentPreviewIndex < selectedFiles.length-1){ currentPreviewIndex++; renderPreview(); }
});
function renderPreview(){
  if(selectedFiles.length===0) return;
  const m=selectedFiles[currentPreviewIndex];
  const bg=document.getElementById('previewBg');
  const capCenter=document.getElementById('previewCenterCaption');
  const captionInput=document.getElementById('captionInput');
  const loading=document.getElementById('previewLoading');
  if(!bg||!capCenter||!captionInput) return;
  const oldVideo=bg.querySelector('video');
  if(oldVideo){ oldVideo.pause(); try{ oldVideo.removeAttribute('src'); oldVideo.load(); }catch(e){} }
  if(m.type==='image'){ bg.innerHTML=`<img src="${m.src}">`; if(loading) loading.style.display='none'; }
  else if(m.type==='video'){
    bg.innerHTML=`<video src="${m.src}" muted loop playsinline preload="metadata"></video>`;
    if(loading) loading.style.display='flex';
    const v=bg.querySelector('video');
    if(v){ v.onloadedmetadata=()=>{ m.duration=v.duration; if(loading) loading.style.display='none'; v.play().catch(()=>{}); }; v.onloadeddata=()=>{ if(loading) loading.style.display='none'; }; }
  }
  capCenter.innerText=m.caption||''; capCenter.style.display=m.caption?'block':'none';
  captionInput.value=m.caption||'';
  captionInput.placeholder=`Write caption... (${currentPreviewIndex+1}/${selectedFiles.length})`;
  const wrap=document.getElementById('previewBorders');
  if(wrap){
    wrap.innerHTML='';
    selectedFiles.forEach((f,i)=>{
      const d=document.createElement('div');
      d.className='preview-border-item'+(i===currentPreviewIndex?' active':'')+(f.caption?' has-caption':'');
      if(f.type==='image') d.innerHTML=`<img src="${f.src}">`;
      else if(f.type==='video') d.innerHTML=`<video src="${f.src}" muted playsinline></video>`;
      else d.innerHTML=`<div style="background:${f.bg};width:100%;height:100%"></div>`;
      d.onclick=()=>{ saveCurrentCaption(); currentPreviewIndex=i; renderPreview(); };
      wrap.appendChild(d);
    });
  }
}
function saveCurrentCaption(){
  if(selectedFiles[currentPreviewIndex]){
    const val=document.getElementById('captionInput')?.value||'';
    selectedFiles[currentPreviewIndex].caption=val;
    const cc=document.getElementById('previewCenterCaption');
    if(cc){ cc.innerText=val; cc.style.display=val?'block':'none'; }
  }
}
document.getElementById('captionInput')?.addEventListener('input', saveCurrentCaption);
document.getElementById('previewSend')?.addEventListener('click', ()=>{
  saveCurrentCaption();
  selectedFiles.forEach(f=>{
    myMoments.push({ id:Date.now()+Math.random(), type:f.type, src:f.src, text:f.text||'', bg:f.bg||'', caption:f.caption, privacy:document.getElementById('previewPillText')?.innerText.replace('Moments - ','')||'Everyone', time:Date.now(), views:Math.floor(Math.random()*10), status:'posting', duration:f.duration||0 });
    setTimeout(()=>{ const last=myMoments[myMoments.length-1]; if(last){ last.status='posted'; saveMyMoments(); renderHub(); } },1200);
  });
  saveMyMoments();
  closePreview();
  renderHub.selectedIndex=myMoments.length-1;
  openHub();
});
document.getElementById('previewPill')?.addEventListener('click', e=>{
  e.stopPropagation();
  document.getElementById('previewMiniPop')?.classList.toggle('show');
});
document.querySelectorAll('#previewMiniPop .pop-item').forEach(it=>{
  it.addEventListener('click', ()=>{
    document.querySelectorAll('#previewMiniPop .pop-item').forEach(i=>i.classList.remove('active'));
    it.classList.add('active');
    const txt=document.getElementById('previewPillText');
    if(txt) txt.innerText=it.dataset.v==='My contacts'?'Moments - My contacts':'Moments - Everyone';
    document.getElementById('previewMiniPop')?.classList.remove('show');
  });
});

// ========== TEXT PAGE ==========
function openTextPage(){
  if(!textPage) return;
  textPage.classList.add('open');
  document.body.classList.add('text-open');
  setTimeout(()=>input?.focus(),50);
  checkText();
}
function closeTextPage(){
  textPage?.classList.remove('open');
  document.body.classList.remove('text-open');
}
document.getElementById('closeText')?.addEventListener('click', closeTextPage);
function checkText(){
  if(!input) return;
  const t=input.innerText.trim();
  if(t.length>0){ if(placeholder) placeholder.style.display='none'; if(cursor) cursor.style.display='none'; sendBtn?.classList.add('on'); }
  else{ if(placeholder) placeholder.style.display='block'; if(cursor) cursor.style.display='block'; sendBtn?.classList.remove('on'); }
}
input?.addEventListener('input', checkText);
centerBox?.addEventListener('click', ()=>input?.focus());
const fonts=[{f:'-apple-system, sans-serif',w:'700',s:'36px'},{f:'Georgia, serif',w:'800',s:'40px'},{f:'Impact, sans-serif',w:'900',s:'44px'}];
let fi=0; let currentFont=fonts[0];
document.getElementById('aaBtn')?.addEventListener('click', e=>{
  e.stopPropagation();
  fi=(fi+1)%fonts.length; currentFont=fonts[fi];
  if(input){ input.style.fontFamily=currentFont.f; input.style.fontWeight=currentFont.w; input.style.fontSize=currentFont.s; }
});
const colors=['#000000','#1C1C1E','#0A84FF','#FF3B30','#34C759','linear-gradient(135deg,#667eea,#764ba2)'];
if(palWrap){
  palWrap.innerHTML='';
  colors.forEach(c=>{
    const d=document.createElement('div'); d.className='dot'; d.style.background=c;
    d.onclick=e=>{ e.stopPropagation(); if(textPage) textPage.style.background=c; palWrap.classList.remove('show'); };
    palWrap.appendChild(d);
  });
}
document.getElementById('palBtn')?.addEventListener('click', e=>{ e.stopPropagation(); palWrap?.classList.toggle('show'); });
document.getElementById('pill')?.addEventListener('click', e=>{ e.stopPropagation(); miniPop?.classList.toggle('show'); });
miniPop?.querySelectorAll('.mini-item').forEach(it=>{
  it.onclick=()=>{
    miniPop.querySelectorAll('.mini-item').forEach(i=>i.classList.remove('active'));
    it.classList.add('active');
    const pillText=document.getElementById('pillText');
    if(pillText) pillText.innerText=it.dataset.v==='My contacts'?'Moments - My contacts':'Moments - Everyone';
    miniPop.classList.remove('show');
  };
});
sendBtn?.addEventListener('click', ()=>{
  if(!input) return;
  const text=input.innerText.trim(); if(!text) return;
  const bg=textPage?.style.background||'#0A84FF';
  const privacy=document.getElementById('pillText')?.innerText.replace('Moments - ','')||'Everyone';
  myMoments.push({id:Date.now()+Math.random(),type:'text',text:text,bg:bg,fontF:currentFont.f,fontW:currentFont.w,fontS:currentFont.s,caption:'',privacy:privacy,time:Date.now(),views:0,status:'posting',duration:5});
  saveMyMoments(); input.innerText=''; checkText(); closeTextPage();
  setTimeout(()=>{ const last=myMoments[myMoments.length-1]; if(last){ last.status='posted'; saveMyMoments(); renderHub(); } },1000);
  renderHub.selectedIndex=myMoments.length-1; openHub();
});

// ========== VIEWER ==========
function openViewer(user,index,name){
  currentViewerUser=user; viewerIndex=index; currentViewerName=name||(user==='me'?'My moments':'blessing adeyemi');
  if(!viewerPage) return;
  viewerPage.classList.add('open'); document.body.classList.add('viewer-open'); renderViewer(); startProgress();
}
function renderViewer(){
  if(myMoments.length===0) return;
  const m=myMoments[viewerIndex]; if(!m) return;
  const lines=document.getElementById('viewerLines');
  if(lines){
    lines.innerHTML='';
    myMoments.forEach((_,i)=>{
      const d=document.createElement('div'); d.className='line '+(i===viewerIndex?'active':i<viewerIndex?'filled':'');
      const fill=document.createElement('div'); fill.className='fill'; if(i<viewerIndex) fill.style.width='100%';
      d.appendChild(fill); lines.appendChild(d);
    });
  }
  const nameEl=document.getElementById('viewerName');
  const timeEl=document.getElementById('viewerTime');
  if(nameEl) nameEl.innerText=currentViewerName;
  if(timeEl) timeEl.innerText=new Date(m.time).toLocaleString();
  if(viewerVideo){ viewerVideo.pause(); try{ viewerVideo.removeAttribute('src'); viewerVideo.load(); }catch(e){} }
  if(viewerImage) viewerImage.style.display='none';
  if(viewerVideo) viewerVideo.style.display='none';
  if(viewerText) viewerText.style.display='none';
  document.getElementById('muteBtn')?.style.setProperty('display','none');
  document.getElementById('playPauseBtn')?.style.setProperty('display','none');
  document.getElementById('viewerLoading')?.style.setProperty('display','none');
  if(m.type==='image'){ if(viewerImage){ viewerImage.src=m.src; viewerImage.style.display='block'; } }
  else if(m.type==='video'){
    if(viewerVideo){
      viewerVideo.src=m.src; viewerVideo.style.display='block'; viewerVideo.muted=false;
      const mute=document.getElementById('muteBtn'); const play=document.getElementById('playPauseBtn'); const load=document.getElementById('viewerLoading');
      if(mute) mute.style.display='flex'; if(play) play.style.display='flex'; if(load) load.style.display='flex';
      isPlaying=true; viewerVideo.play().catch(()=>{});
      viewerVideo.oncanplay=()=>{ const l=document.getElementById('viewerLoading'); if(l) l.style.display='none'; };
      viewerVideo.onloadedmetadata=()=>{ m.duration=viewerVideo.duration; };
    }
  }else{ if(viewerText){ viewerText.style.display='flex'; viewerText.innerText=m.text; viewerText.style.background=m.bg||'#0A84FF'; } }
  if(viewerCaption){
    if(m.caption && m.caption.trim()!==''){ viewerCaption.innerText=m.caption; viewerCaption.style.display='inline-block'; }
    else{ viewerCaption.innerText=''; viewerCaption.style.display='none'; }
  }
  if(viewerViews){
    if(currentViewerUser==='me'){ viewerViews.style.display='flex'; viewerViews.classList.remove('hidden'); if(viewerViewsCount) viewerViewsCount.innerText=m.views||0; }
    else{ viewerViews.style.display='none'; viewerViews.classList.add('hidden'); }
  }
  try{ lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }catch(e){}
}
function startProgress(){
  clearInterval(viewerProgressTimer);
  const activeFill=document.querySelector('#viewerLines .line.active .fill'); if(!activeFill) return;
  const m=myMoments[viewerIndex]; let duration=5000;
  if(m.type==='video'){ const v=document.getElementById('viewerVideo'); duration=(v&&v.duration&&!isNaN(v.duration)?v.duration*1000:(m.duration*1000||8000)); if(duration<1000) duration=8000; }
  let width=parseFloat(activeFill.style.width)||0;
  viewerProgressTimer=setInterval(()=>{
    if(isHolding) return;
    const v=document.getElementById('viewerVideo');
    if(m.type==='video'&&v&&v.paused) return;
    width+=100/(duration/100); activeFill.style.width=width+'%';
    if(width>=100){ clearInterval(viewerProgressTimer); nextViewer(); }
  },100);
}
function closeViewer(){
  clearInterval(viewerProgressTimer); isHolding=false;
  viewerPage?.classList.remove('open'); document.body.classList.remove('viewer-open');
  const v=document.getElementById('viewerVideo'); if(v){ v.pause(); try{ v.removeAttribute('src'); v.load(); }catch(e){} }
  document.getElementById('viewersPop')?.classList.remove('show');
  closeAllPops(); closeAllSheets();
}
document.getElementById('closeViewer')?.addEventListener('click', closeViewer);
function nextViewer(){
  clearInterval(viewerProgressTimer);
  const v=document.getElementById('viewerVideo'); if(v){ v.pause(); try{ v.removeAttribute('src'); v.load(); }catch(e){} }
  if(viewerIndex<myMoments.length-1){ viewerIndex++; renderViewer(); startProgress(); } else closeViewer();
}
function prevViewer(){
  clearInterval(viewerProgressTimer);
  const v=document.getElementById('viewerVideo'); if(v){ v.pause(); try{ v.removeAttribute('src'); v.load(); }catch(e){} }
  if(viewerIndex>0){ viewerIndex--; renderViewer(); startProgress(); }
}
document.getElementById('nextMoment')?.addEventListener('click', nextViewer);
document.getElementById('prevMoment')?.addEventListener('click', prevViewer);
document.getElementById('tapRight')?.addEventListener('click', nextViewer);
document.getElementById('tapLeft')?.addEventListener('click', prevViewer);

playPauseBtn?.addEventListener('click', (e)=>{
  e.stopPropagation();
  const vid=viewerVideo; if(!vid) return;
  const pauseIcon=document.getElementById('pauseIcon'); const playIcon=document.getElementById('playIcon');
  if(vid.paused){ vid.play().then(()=>{ isPlaying=true; if(pauseIcon) pauseIcon.style.display='block'; if(playIcon) playIcon.style.display='none'; startProgress(); }).catch(()=>{}); }
  else{ vid.pause(); isPlaying=false; if(pauseIcon) pauseIcon.style.display='none'; if(playIcon) playIcon.style.display='block'; clearInterval(viewerProgressTimer); }
  try{ lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }catch(e){}
});
muteBtn?.addEventListener('click', (e)=>{
  e.stopPropagation();
  if(!viewerVideo) return;
  viewerVideo.muted=!viewerVideo.muted;
  muteBtn.innerHTML=viewerVideo.muted?'<i data-lucide="volume-x"></i>':'<i data-lucide="volume-2"></i>';
  try{ lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }catch(e){}
});

// ========== VIEWER MORE ==========
viewerMoreBtn?.addEventListener('click', e=>{
  e.stopPropagation();
  if(currentViewerUser==='me'){
    const open = viewerMorePopMe?.classList.contains('show');
    closeAllPops(); closeAllSheets();
    if(!open) viewerMorePopMe?.classList.add('show');
  }else{
    const open = viewerMorePopOther?.classList.contains('show');
    closeAllPops(); closeAllSheets();
    if(!open) viewerMorePopOther?.classList.add('show');
  }
});

// ========== DELETE SHEET - NOW FROM BOTTOM ==========
function openDeleteSheet(){
  closeAllPops();
  if(deleteSheet) deleteSheet.classList.add('show');
  try{ lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }catch(e){}
}
function closeDeleteSheet(){
  deleteSheet?.classList.remove('show');
  pendingDeleteIndex=null; pendingDeleteSource=null;
}
document.getElementById('viewerDeleteBtn')?.addEventListener('click', (e)=>{
  e.stopPropagation();
  pendingDeleteIndex=viewerIndex;
  pendingDeleteSource='viewer';
  openDeleteSheet();
});
document.getElementById('closeDeleteSheet')?.addEventListener('click', closeDeleteSheet);
document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteSheet);
document.getElementById('deleteSheetOverlay')?.addEventListener('click', closeDeleteSheet);
document.getElementById('confirmDeleteBtn')?.addEventListener('click', ()=>{
  if(pendingDeleteIndex===null) return;
  if(myMoments[pendingDeleteIndex]) myMoments.splice(pendingDeleteIndex,1);
  saveMyMoments();
  closeDeleteSheet();
  if(pendingDeleteSource==='viewer') closeViewer();
  showToast(toastDeleted);
  if(myMoments.length>0) renderHub(); else closeHub();
});

// ========== REPORT SHEET ==========
function openReportSheet(userName){
  closeAllPops();
  currentBlockedTarget=userName;
  const nameEl=document.getElementById('reportUserName');
  if(nameEl) nameEl.innerText=userName;
  if(reportSheet) reportSheet.classList.add('show');
}
function closeReportSheet(){ reportSheet?.classList.remove('show'); }
document.getElementById('viewerReportBtn')?.addEventListener('click', e=>{ e.stopPropagation(); openReportSheet(currentViewerName); });
document.getElementById('closeReportSheet')?.addEventListener('click', closeReportSheet);
document.getElementById('reportSheetOverlay')?.addEventListener('click', closeReportSheet);
document.querySelectorAll('#reportReasonsList .sheet-list-item').forEach(item=>{
  item.addEventListener('click', ()=>{ closeReportSheet(); showToast(toastReported); });
});

// ========== BLOCK SHEET ==========
function openBlockSheet(userName){
  closeAllPops();
  currentBlockedTarget=userName;
  const nameEl=document.getElementById('blockUserName');
  if(nameEl) nameEl.innerText=userName;
  if(blockSheet) blockSheet.classList.add('show');
}
function closeBlockSheet(){ blockSheet?.classList.remove('show'); }
document.getElementById('viewerBlockBtn')?.addEventListener('click', e=>{ e.stopPropagation(); openBlockSheet(currentViewerName); });
document.getElementById('closeBlockSheet')?.addEventListener('click', closeBlockSheet);
document.getElementById('cancelBlockBtn')?.addEventListener('click', closeBlockSheet);
document.getElementById('blockSheetOverlay')?.addEventListener('click', closeBlockSheet);
document.getElementById('confirmBlockBtn')?.addEventListener('click', ()=>{
  if(currentBlockedTarget && !blockedUsers.includes(currentBlockedTarget.toLowerCase())){
    blockedUsers.push(currentBlockedTarget.toLowerCase()); saveBlocked();
  }
  closeBlockSheet(); closeViewer(); showToast(toastBlocked);
  applyBlockedBadges();
});

// ========== UNBLOCK ==========
function openUnblockSheet(userName){
  currentBlockedTarget=userName;
  const nameEl=document.getElementById('unblockUserName');
  if(nameEl) nameEl.innerText=userName;
  if(unblockSheet) unblockSheet.classList.add('show');
}
function closeUnblockSheet(){ unblockSheet?.classList.remove('show'); }
document.getElementById('closeUnblockSheet')?.addEventListener('click', closeUnblockSheet);
document.getElementById('cancelUnblockBtn')?.addEventListener('click', closeUnblockSheet);
document.getElementById('unblockSheetOverlay')?.addEventListener('click', closeUnblockSheet);
document.getElementById('confirmUnblockBtn')?.addEventListener('click', ()=>{
  if(currentBlockedTarget){ blockedUsers=blockedUsers.filter(u=>u!==currentBlockedTarget.toLowerCase()); saveBlocked(); }
  closeUnblockSheet(); showToast(toastUnblocked); applyBlockedBadges();
});
function applyBlockedBadges(){
  document.querySelectorAll('.moments-scroll .row').forEach(row=>{
    const name=(row.dataset.name||row.querySelector('.name')?.innerText||'').toLowerCase();
    const avatar=row.querySelector('.avatar'); if(!avatar) return;
    let badge=avatar.querySelector('.blocked-badge');
    if(blockedUsers.includes(name)){ if(!badge){ badge=document.createElement('span'); badge.className='blocked-badge'; badge.innerText='Blocked'; avatar.appendChild(badge); } row.style.opacity='0.5'; }
    else{ if(badge) badge.remove(); row.style.opacity='1'; }
  });
}
applyBlockedBadges();

// Viewers
document.getElementById('viewerViews')?.addEventListener('click', e=>{
  e.stopPropagation();
  if(currentViewerUser!=='me') return;
  const list=document.getElementById('viewersList');
  if(list){
    list.innerHTML='';
    fakeViewers.forEach(v=>{
      const div=document.createElement('div'); div.style.cssText='display:flex;gap:10px;align-items:center;padding:10px 0';
      div.innerHTML=`<img src="${v.avatar}" style="width:36px;height:36px;border-radius:50%"><div><div style="font-size:13px;color:#fff">${v.name}</div></div>`;
      list.appendChild(div);
    });
  }
  document.getElementById('viewersPop')?.classList.add('show');
});
document.getElementById('closeViewersPop')?.addEventListener('click', ()=> document.getElementById('viewersPop')?.classList.remove('show'));

// Hold + swipe
const viewerCenterEl=document.getElementById('viewerCenter');
if(viewerCenterEl){
  let startX=0;
  viewerCenterEl.addEventListener('touchstart', e=>{ startX=e.touches[0].clientX; isHolding=true; clearInterval(viewerProgressTimer); viewerVideo?.pause(); }, {passive:true});
  viewerCenterEl.addEventListener('touchend', e=>{
    const diffX=e.changedTouches[0].clientX-startX; isHolding=false;
    if(viewerVideo&&isPlaying) viewerVideo.play().catch(()=>{});
    startProgress();
    if(Math.abs(diffX)>60){ if(diffX<0) nextViewer(); else prevViewer(); }
  }, {passive:true});
}

// Other rows
document.querySelectorAll('.moments-scroll .row').forEach(row=>{
  row.addEventListener('click', ()=>{
    const otherName=row.dataset.name||row.querySelector('.name')?.innerText||'blessing adeyemi';
    if(blockedUsers.includes(otherName.toLowerCase())){ openUnblockSheet(otherName); return; }
    if(!hasMyMoments()){
      const tempMoment={type:'image',src:'konnect2.jfif',text:'',bg:'',caption:'This is how caption will show as head of post',time:Date.now(),views:0,status:'posted',duration:5};
      const backup=[...myMoments]; myMoments=[tempMoment]; viewerIndex=0; openViewer('other',0,otherName);
      const checkClose=setInterval(()=>{ if(!viewerPage?.classList.contains('open')){ myMoments=backup; clearInterval(checkClose); } },500);
    }else{ openViewer('other',0,otherName); }
  });
});

// Global close
document.addEventListener('click', (e)=>{
  if(!myRow?.contains(e.target) && !myProfilePop?.contains(e.target) && !myGalleryUnder?.contains(e.target)){
    myProfilePop?.classList.remove('show');
    myGalleryUnder?.classList.remove('show');
  }
  if(!moreBtn?.contains(e.target) && !morePop?.contains(e.target) &&
     !plusBtn?.contains(e.target) && !plusPop?.contains(e.target) &&
     !document.getElementById('previewPill')?.contains(e.target) && !document.getElementById('previewMiniPop')?.contains(e.target) &&
     !document.getElementById('pill')?.contains(e.target) && !miniPop?.contains(e.target) &&
     !viewerMoreBtn?.contains(e.target) && !viewerMorePopMe?.contains(e.target) && !viewerMorePopOther?.contains(e.target)){
    closeAllPops();
  }
});

// Boost helpers
function hideNoMomentsPopup(){ document.getElementById('boostNoMomentsPopup')?.classList.remove('show'); }
function doPostMomentPill(){ hideNoMomentsPopup(); openPhoneGallery(); }
window.hideNoMomentsPopup=hideNoMomentsPopup;
window.doPostMomentPill=doPostMomentPill;