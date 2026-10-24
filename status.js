lucide.createIcons({ attrs: { "stroke-width": 1.8 } });

// ========== DETECT MOBILE ==========
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

// ========== DATA ==========
let myMoments = JSON.parse(localStorage.getItem('myMoments') || '[]');
let selectedFiles = [];
let currentPreviewIndex = 0;
let viewerIndex = 0;
let currentViewerUser = 'me';
let currentViewerName = 'My moments';
let viewerProgressTimer = null;
let isHolding = false;

const fakeViewers = [
  {name:'Blessing Adeyemi', avatar:'konnect2.jfif', time:'2m ago'},
  {name:'David Okon', avatar:'konnect2.jfif', time:'5m ago'},
  {name:'Sarah Johnson', avatar:'konnect2.jfif', time:'10m ago'}
];

// ========== HELPERS ==========
function saveMyMoments(){
  localStorage.setItem('myMoments', JSON.stringify(myMoments));
  updateMyProfileRing();
}
function hasMyMoments(){ return myMoments.length > 0; }
function updateMyProfileRing(){
  const el = document.getElementById('myAvatarBorder');
  if(!el) return;
  if(hasMyMoments()) el.classList.add('has-moments');
  else el.classList.remove('has-moments');
}
updateMyProfileRing();

function openPhoneGallery(){ galleryInput.click(); }

function closeAllPops(){
  morePop?.classList.remove('show');
  plusPop?.classList.remove('show');
  moreBtn?.classList.remove('active');
  plusBtn?.classList.remove('active');
  miniPop?.classList.remove('show');
  palWrap?.classList.remove('show');
  document.getElementById('previewMiniPop')?.classList.remove('show');
  document.getElementById('viewerMorePop')?.classList.remove('show');
  document.getElementById('viewersPop')?.classList.remove('show');
}

// ========== TOP ICONS ==========
if(moreBtn){
  moreBtn.onclick = e => {
    e.stopPropagation();
    const open = morePop.classList.contains('show');
    closeAllPops();
    myProfilePop?.classList.remove('show');
    myGalleryUnder?.classList.remove('show');
    if(!open){ morePop.classList.add('show'); moreBtn.classList.add('active'); }
  };
}
if(plusBtn){
  plusBtn.onclick = e => {
    e.stopPropagation();
    const open = plusPop.classList.contains('show');
    closeAllPops();
    myProfilePop?.classList.remove('show');
    myGalleryUnder?.classList.remove('show');
    if(!open){ plusPop.classList.add('show'); plusBtn.classList.add('active'); }
  };
}

// ========== PRIVACY PAGE - MARGIN LEFT FIXED ==========
if(morePop){
  morePop.querySelector('.pop-item').onclick = e => {
    e.stopPropagation();
    closeAllPops();
    privacyPage.classList.add('open');
    lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  };
}
if(backPrivacy) backPrivacy.onclick = () => privacyPage.classList.remove('open');
document.querySelectorAll('.privacy-option').forEach(opt=>{
  opt.onclick = ()=>{
    document.querySelectorAll('.privacy-option').forEach(o=>o.classList.remove('active'));
    opt.classList.add('active');
    localStorage.setItem('momentsPrivacy', opt.dataset.value);
  };
});
const savedPrivacy = localStorage.getItem('momentsPrivacy') || 'contacts';
document.querySelector(`.privacy-option[data-value="${savedPrivacy}"]`)?.classList.add('active');

// ========== PLUS POP ==========
document.getElementById('plusPhoto')?.addEventListener('click', e=>{
  e.stopPropagation(); closeAllPops(); openPhoneGallery();
});
document.getElementById('plusText')?.addEventListener('click', e=>{
  e.stopPropagation(); closeAllPops(); openTextPage();
});

// ========== MY PROFILE ROW - SAME STYLE AS PLUS POP ==========
if(myRow){
  myRow.onclick = (e) => {
    e.stopPropagation();
    if(!hasMyMoments()){
      const open = myProfilePop.classList.contains('show');
      closeAllPops();
      if(!open){
        myProfilePop.classList.add('show');
        if(isMobile && myGalleryUnder){ renderMyGalleryUnder(); }
        lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
      } else {
        myProfilePop.classList.remove('show');
        myGalleryUnder?.classList.remove('show');
      }
    } else {
      closeAllPops();
      myProfilePop?.classList.remove('show');
      myGalleryUnder?.classList.remove('show');
      openHub();
    }
  };
}

function renderMyGalleryUnder(){
  if(!myGalleryUnder) return;
  myGalleryUnder.innerHTML = '';
  myGalleryUnder.classList.add('show');
  for(let i=0;i<9;i++){
    const img = document.createElement('img');
    img.src = 'konnect2.jfif';
    img.onclick = (ev)=>{ ev.stopPropagation(); openPhoneGallery(); };
    myGalleryUnder.appendChild(img);
  }
}

document.getElementById('myProfilePhoto')?.addEventListener('click', e=>{
  e.stopPropagation(); closeAllPops(); myProfilePop.classList.remove('show'); openPhoneGallery();
});
document.getElementById('myProfileText')?.addEventListener('click', e=>{
  e.stopPropagation(); closeAllPops(); myProfilePop.classList.remove('show'); myGalleryUnder?.classList.remove('show'); openTextPage();
});

// ========== MY HUB - VIDEO SAME HEIGHT - NOT BIG ==========
function openHub(){
  myHubPage.classList.add('open');
  document.body.classList.add('hub-open');
  renderHub();
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}
function closeHub(){
  myHubPage.classList.remove('open');
  document.body.classList.remove('hub-open');
}
document.getElementById('closeHub').onclick = closeHub;
document.getElementById('hubPlus').onclick = () => openPhoneGallery();

function renderHub(){
  const big = document.getElementById('hubBigCircle');
  const list = document.getElementById('hubList');
  if(!big || !list) return;

  if(myMoments.length===0){
    big.innerHTML='<div style="font-size:12px;opacity:.6">No moments</div>';
    list.innerHTML='';
    return;
  }

  let selected = myMoments.length-1;
  if(typeof renderHub.selectedIndex !== 'undefined') selected = renderHub.selectedIndex;
  else renderHub.selectedIndex = selected;

  const current = myMoments[selected];
  if(current.type==='image'){
    big.innerHTML=`<img src="${current.src}">`;
  } else if(current.type==='video'){
    big.innerHTML=`<video src="${current.src}" muted loop autoplay playsinline></video>`;
  } else {
    big.innerHTML=`<div style="width:100%;height:100%;border-radius:50%;background:${current.bg};display:flex;align-items:center;justify-content:center;font-family:${current.fontF||'inherit'};font-weight:${current.fontW||'700'};font-size:10px;color:#fff;padding:4px;text-align:center">${(current.text||'').slice(0,20)}</div>`;
  }
  big.onclick = ()=> openViewer('me', selected, 'My moments');

  list.innerHTML='';
  [...myMoments].reverse().forEach((m,revIdx)=>{
    const idx=myMoments.length-1-revIdx;
    const item=document.createElement('div');
    item.className='hub-item';
    const statusClass = m.status==='posting' ? 'posting' : 'posted';
    const statusText = m.status==='posting' ? 'Adding to moment...' : 'Added';
    
    // FIX - VIDEO SAME HEIGHT AS IMAGE 48x48
    let mediaHtml = '';
    if(m.type==='image'){
      mediaHtml = `<img src="${m.src}">`;
    } else if(m.type==='video'){
      mediaHtml = `<video src="${m.src}" muted playsinline></video>`;
    } else {
      mediaHtml = `<div style="width:48px;height:48px;border-radius:10px;background:${m.bg};display:flex;align-items:center;justify-content:center;font-family:${m.fontF||'inherit'};font-weight:${m.fontW||'700'};font-size:10px;color:#fff;flex-shrink:0">Text</div>`;
    }
    
    item.innerHTML=`
      ${mediaHtml}
      <div class="hub-item-info">
        <div class="s">${new Date(m.time).toLocaleTimeString()} • ${m.privacy||'Everyone'}</div>
        <div style="font-size:12px;color:#fff;margin-top:2px;word-break:break-word">${m.caption || m.text || ''}</div>
        <div class="hub-status ${statusClass}">${statusText}</div>
      </div>
      <button class="hub-delete-btn"><i data-lucide="trash-2" style="width:14px"></i></button>
    `;
    item.querySelector('img,video,div').onclick=()=> openViewer('me', idx, 'My moments');
    item.querySelector('.hub-delete-btn').onclick=(e)=>{ e.stopPropagation(); deleteMoment(idx); };
    list.appendChild(item);
  });
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function deleteMoment(idx){
  myMoments.splice(idx,1);
  saveMyMoments();
  renderHub.selectedIndex=myMoments.length-1;
  renderHub();
  if(myMoments.length===0) closeHub();
}

// ========== GALLERY PICK -> PREVIEW ==========
galleryInput.onchange = (e)=>{
  const files=Array.from(e.target.files);
  if(files.length===0) return;
  files.forEach(file=>{
    const url=URL.createObjectURL(file);
    selectedFiles.push({type:file.type.startsWith('video')?'video':'image', src:url, caption:'', file, bg:''});
  });
  currentPreviewIndex = selectedFiles.length - files.length;
  if(currentPreviewIndex < 0) currentPreviewIndex = 0;
  openPreview();
  e.target.value = '';
};

function openPreview(){
  previewPage.classList.add('open');
  document.body.classList.add('preview-open');
  renderPreview();
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}
function closePreview(){
  previewPage.classList.remove('open');
  document.body.classList.remove('preview-open');
  selectedFiles=[];
  galleryInput.value='';
  document.getElementById('previewBg').innerHTML='';
}
document.getElementById('closePreview').onclick=closePreview;
document.getElementById('previewAddMore').onclick=()=> openPhoneGallery();

document.getElementById('previewNext').onclick=()=>{
  savePreviewCaption();
  if(currentPreviewIndex < selectedFiles.length-1){
    currentPreviewIndex++;
    renderPreview();
  }
};

function renderPreview(){
  if(selectedFiles.length===0) return;
  const m=selectedFiles[currentPreviewIndex];
  const bg=document.getElementById('previewBg');
  const txtFull=document.getElementById('previewTextFull');
  const capCenter=document.getElementById('previewCenterCaption');
  const captionInput=document.getElementById('captionInput');
  const loading=document.getElementById('previewLoading');
  const nextBtn=document.getElementById('previewNext');

  txtFull.style.display='none';
  if(m.type==='image'){
    bg.innerHTML=`<img src="${m.src}">`;
    loading.style.display='none';
  } else if(m.type==='video'){
    bg.innerHTML=`<video src="${m.src}" muted loop autoplay playsinline></video>`;
    loading.style.display='flex';
    const v=bg.querySelector('video');
    if(v){ v.onloadeddata=()=> loading.style.display='none'; }
  } else {
    bg.innerHTML='';
    txtFull.style.display='flex';
    txtFull.innerText=m.text;
    txtFull.style.background=m.bg;
    loading.style.display='none';
  }

  capCenter.innerText=m.caption||'';
  capCenter.style.display = m.caption ? 'block' : 'none';
  captionInput.value=m.caption||'';

  const wrap=document.getElementById('previewBorders');
  wrap.innerHTML='';
  selectedFiles.forEach((f,i)=>{
    const d=document.createElement('div');
    d.className='preview-border-item' + (i===currentPreviewIndex?' active':'');
    if(f.type==='image') d.innerHTML=`<img src="${f.src}">`;
    else if(f.type==='video') d.innerHTML=`<video src="${f.src}" muted></video>`;
    else d.innerHTML=`<div style="background:${f.bg};width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff">${(f.text||'').slice(0,10)}</div>`;
    d.onclick=()=>{ savePreviewCaption(); currentPreviewIndex=i; renderPreview(); };
    wrap.appendChild(d);
  });

  nextBtn.style.display = selectedFiles.length>1 ? 'flex' : 'none';
}

function savePreviewCaption(){
  if(selectedFiles[currentPreviewIndex]){
    const val=document.getElementById('captionInput').value;
    selectedFiles[currentPreviewIndex].caption=val;
    document.getElementById('previewCenterCaption').innerText=val;
    document.getElementById('previewCenterCaption').style.display = val ? 'block' : 'none';
  }
}
document.getElementById('captionInput')?.addEventListener('input', savePreviewCaption);

document.getElementById('previewSend').onclick=()=>{
  savePreviewCaption();
  selectedFiles.forEach(f=>{
    const newMoment={
      id:Date.now()+Math.random(),
      type:f.type, src:f.src, text:f.text||'', bg:f.bg||'',
      caption:f.caption,
      privacy:document.getElementById('previewPillText').innerText.replace('Moments - ',''),
      time:Date.now(), views:Math.floor(Math.random()*10),
      status:'posting'
    };
    myMoments.push(newMoment);
    setTimeout(()=>{
      newMoment.status='posted';
      saveMyMoments();
      renderHub();
    },1200);
  });
  saveMyMoments();
  closePreview();
  renderHub.selectedIndex=myMoments.length-1;
  openHub();
};

// Privacy pill preview
const previewPill=document.getElementById('previewPill');
const previewMiniPop=document.getElementById('previewMiniPop');
if(previewPill){
  previewPill.onclick=e=>{ e.stopPropagation(); previewMiniPop.classList.toggle('show'); };
  previewMiniPop.querySelectorAll('.pop-item').forEach(it=>{
    it.onclick=()=>{
      previewMiniPop.querySelectorAll('.pop-item').forEach(i=>{ i.classList.remove('active'); });
      it.classList.add('active');
      document.getElementById('previewPillText').innerText = it.dataset.v==='My contacts' ? 'Moments - My contacts' : 'Moments - Everyone';
      previewMiniPop.classList.remove('show');
    };
  });
}

// ========== TEXT PAGE ==========
function openTextPage(){
  textPage.classList.add('open');
  document.body.classList.add('text-open');
  setTimeout(()=>input.focus(),50);
  checkText();
}
function closeTextPage(){
  textPage.classList.remove('open');
  document.body.classList.remove('text-open');
}
document.getElementById('closeText').onclick=closeTextPage;

function checkText(){
  const t=input.innerText.trim();
  if(t.length>0){
    placeholder.style.display='none';
    cursor.style.display='none';
    sendBtn.classList.add('on');
  }else{
    placeholder.style.display='block';
    cursor.style.display='block';
    sendBtn.classList.remove('on');
  }
}
if(input){
  input.addEventListener('input', checkText);
  centerBox.addEventListener('click', ()=>input.focus());
}

const fonts=[
  {f:'-apple-system, sans-serif', w:'700', s:'36px'},
  {f:'Georgia, serif', w:'800', s:'40px'},
  {f:'Impact, sans-serif', w:'900', s:'44px'},
];
let fi=0;
let currentFont = fonts[0];
document.getElementById('aaBtn').onclick=e=>{
  e.stopPropagation();
  fi=(fi+1)%fonts.length;
  currentFont = fonts[fi];
  input.style.fontFamily=currentFont.f;
  input.style.fontWeight=currentFont.w;
  input.style.fontSize=currentFont.s;
};

const colors=[
  '#000000','#1C1C1E','#0A84FF','#FF3B30','#34C759',
  'linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)',
];
if(palWrap){
  palWrap.innerHTML='';
  colors.forEach(c=>{
    const d=document.createElement('div');
    d.className='dot';
    d.style.background=c;
    d.onclick=e=>{ e.stopPropagation(); textPage.style.background=c; palWrap.classList.remove('show'); };
    palWrap.appendChild(d);
  });
}
document.getElementById('palBtn').onclick=e=>{ e.stopPropagation(); palWrap.classList.toggle('show'); };
document.getElementById('pill').onclick=e=>{ e.stopPropagation(); miniPop.classList.toggle('show'); };
miniPop?.querySelectorAll('.mini-item').forEach(it=>{
  it.onclick=()=>{
    miniPop.querySelectorAll('.mini-item').forEach(i=>i.classList.remove('active'));
    it.classList.add('active');
    document.getElementById('pillText').innerText = it.dataset.v==='My contacts' ? 'Moments - My contacts' : 'Moments - Everyone';
    miniPop.classList.remove('show');
  };
});

sendBtn.onclick=()=>{
  const text=input.innerText.trim();
  if(!text) return;
  const bg=textPage.style.background || '#0A84FF';
  const privacy=document.getElementById('pillText')?.innerText.replace('Moments - ','') || 'Everyone';
  const newMoment={
    id:Date.now()+Math.random(),
    type:'text', text:text, bg:bg,
    fontF: currentFont.f, fontW: currentFont.w, fontS: currentFont.s,
    caption:'', privacy:privacy,
    time:Date.now(), views:0, status:'posting'
  };
  myMoments.push(newMoment);
  saveMyMoments();
  input.innerText='';
  checkText();
  closeTextPage();
  setTimeout(()=>{ newMoment.status='posted'; saveMyMoments(); renderHub(); },1000);
  renderHub.selectedIndex=myMoments.length-1;
  openHub();
};

// ========== VIEWER - VIDEO LOADING TILL FINISH + HOLD TO PAUSE + OTHER PROFILE ==========
function openViewer(user, index, name){
  currentViewerUser=user;
  viewerIndex=index;
  currentViewerName = name || (user==='me' ? 'My moments' : 'blessing adeyemi');
  viewerPage.classList.add('open');
  document.body.classList.add('viewer-open');
  renderViewer();
  startProgress();
}

function renderViewer(){
  const list=myMoments;
  if(list.length===0) return;
  const m=list[viewerIndex];
  if(!m) return;

  const lines=document.getElementById('viewerLines');
  lines.innerHTML='';
  list.forEach((_,i)=>{
    const d=document.createElement('div');
    d.className='line ' + (i===viewerIndex?'active': i<viewerIndex?'filled':'');
    const fill = document.createElement('div');
    fill.className = 'fill';
    if(i < viewerIndex) fill.style.width = '100%';
    d.appendChild(fill);
    lines.appendChild(d);
  });

  document.getElementById('viewerName').innerText = currentViewerName;
  document.getElementById('viewerTime').innerText=new Date(m.time).toLocaleString();

  const imgEl=document.getElementById('viewerImage');
  const vidEl=document.getElementById('viewerVideo');
  const txtEl=document.getElementById('viewerText');
  const capEl=document.getElementById('viewerCaption');
  const viewsEl=document.getElementById('viewerViews');
  const viewsCount=document.getElementById('viewerViewsCount');
  const loading=document.getElementById('viewerLoading');

  imgEl.style.display='none'; vidEl.style.display='none'; txtEl.style.display='none';
  document.getElementById('muteBtn').style.display='none';
  document.getElementById('playPauseBtn').style.display='none';
  loading.style.display='none';

  if(m.type==='image'){ 
    imgEl.src=m.src; imgEl.style.display='block'; 
  }
  else if(m.type==='video'){
    vidEl.src=m.src; 
    vidEl.style.display='block'; 
    vidEl.play();
    document.getElementById('muteBtn').style.display='flex';
    document.getElementById('playPauseBtn').style.display='flex';
    // Loading till video finish loading - show till can play
    loading.style.display='flex';
    vidEl.oncanplay = ()=> loading.style.display='none';
    vidEl.onwaiting = ()=> loading.style.display='flex';
    vidEl.onplaying = ()=> loading.style.display='none';
  }
  else { 
    txtEl.style.display='flex'; 
    txtEl.innerText=m.text; 
    txtEl.style.background=m.bg||'#0A84FF';
    txtEl.style.fontFamily = m.fontF || 'inherit';
    txtEl.style.fontWeight = m.fontW || '700';
    txtEl.style.fontSize = m.fontS || '36px';
  }

  capEl.innerText=m.caption||'';

  // Other person profile - no eye stuff, show my own post but their name
  if(currentViewerUser==='me'){
    viewsEl.style.display='flex';
    viewsCount.innerText=m.views||0;
  } else {
    viewsEl.style.display='none'; // No eye for others
  }
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function startProgress(){
  clearInterval(viewerProgressTimer);
  const activeFill = document.querySelector('#viewerLines .line.active .fill');
  if(!activeFill) return;
  
  let width = parseFloat(activeFill.style.width) || 0;
  const duration = myMoments[viewerIndex]?.type === 'video' ? 8000 : 5000;
  
  viewerProgressTimer = setInterval(()=>{
    if(isHolding) return; // Hold to pause - continue when leave
    width += 100 / (duration / 100);
    activeFill.style.width = width + '%';
    if(width >= 100){
      clearInterval(viewerProgressTimer);
      nextViewer();
    }
  }, 100);
}

function closeViewer(){
  clearInterval(viewerProgressTimer);
  viewerPage.classList.remove('open');
  document.body.classList.remove('viewer-open');
  document.getElementById('viewerVideo').pause();
  document.getElementById('viewersPop')?.classList.remove('show');
}
document.getElementById('closeViewer').onclick=closeViewer;

function nextViewer(){
  clearInterval(viewerProgressTimer);
  if(viewerIndex < myMoments.length-1){ viewerIndex++; renderViewer(); startProgress(); }
  else closeViewer();
}
function prevViewer(){ 
  clearInterval(viewerProgressTimer);
  if(viewerIndex>0){ viewerIndex--; renderViewer(); startProgress(); } 
}

document.getElementById('nextMoment').onclick=nextViewer;
document.getElementById('prevMoment').onclick=prevViewer;
document.getElementById('tapRight').onclick=nextViewer;
document.getElementById('tapLeft').onclick=prevViewer;

// Mute Pause
const vVideo=document.getElementById('viewerVideo');
document.getElementById('playPauseBtn').onclick=()=>{
  if(!vVideo) return;
  if(vVideo.paused){ vVideo.play(); document.getElementById('playPauseBtn').innerHTML='<i data-lucide="pause"></i>'; startProgress(); }
  else { vVideo.pause(); document.getElementById('playPauseBtn').innerHTML='<i data-lucide="play"></i>'; clearInterval(viewerProgressTimer); }
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
};
document.getElementById('muteBtn').onclick=()=>{
  if(!vVideo) return;
  vVideo.muted=!vVideo.muted;
  document.getElementById('muteBtn').innerHTML=vVideo.muted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
};

// Viewers pop
const viewerMoreBtn=document.getElementById('viewerMoreBtn');
const viewerMorePop=document.getElementById('viewerMorePop');
if(viewerMoreBtn){ viewerMoreBtn.onclick=e=>{ e.stopPropagation(); viewerMorePop.classList.toggle('show'); }; }

const viewerViews=document.getElementById('viewerViews');
const viewersPop=document.getElementById('viewersPop');
const viewersList=document.getElementById('viewersList');
if(viewerViews){
  viewerViews.onclick = (e)=>{
    e.stopPropagation();
    viewersList.innerHTML='';
    fakeViewers.forEach(v=>{
      const div=document.createElement('div');
      div.style.cssText='display:flex;gap:10px;align-items:center;padding:10px 0';
      div.innerHTML=`<img src="${v.avatar}" style="width:36px;height:36px;border-radius:50%"><div><div style="font-size:13px;color:#fff">${v.name}</div><div style="font-size:11px;opacity:.6;color:#fff">${v.time}</div></div>`;
      viewersList.appendChild(div);
    });
    viewersPop.classList.add('show');
  };
}
document.getElementById('closeViewersPop').onclick = ()=> viewersPop.classList.remove('show');

// ========== HOLD TO PAUSE - LEAVE CONTINUE + SWIPE + OTHER PERSON PROFILE ==========
const viewerCenter=document.getElementById('viewerCenter');
if(viewerCenter){
  let startX=0, startY=0;
  
  // Hold to pause
  viewerCenter.addEventListener('touchstart', e=>{ 
    startX=e.touches[0].clientX; startY=e.touches[0].clientY;
    isHolding = true;
    clearInterval(viewerProgressTimer);
    vVideo?.pause();
  }, {passive:true});
  
  viewerCenter.addEventListener('touchend', e=>{
    const diffX=e.changedTouches[0].clientX-startX;
    const diffY=e.changedTouches[0].clientY-startY;
    isHolding = false;
    vVideo?.play();
    startProgress();
    
    if(Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60){
      if(diffX < 0) nextViewer();
      else prevViewer();
    }
  }, {passive:true});
  
  // Desktop hold
  viewerCenter.addEventListener('mousedown', ()=>{ isHolding=true; clearInterval(viewerProgressTimer); });
  viewerCenter.addEventListener('mouseup', ()=>{ isHolding=false; startProgress(); });
  viewerCenter.addEventListener('mouseleave', ()=>{ isHolding=false; startProgress(); });
}

// ========== OTHER PERSON PROFILE CLICK - SHOW MY OWN POST BUT THEIR NAME, NO EYE ==========
document.querySelectorAll('.moments-scroll .row').forEach(row=>{
  row.addEventListener('click', ()=>{
    const nameEl = row.querySelector('.name');
    const otherName = nameEl ? nameEl.innerText : 'blessing adeyemi';
    if(!hasMyMoments()){
      // No my moments - show demo with my own post style but their name - for preview how look like
      // Create temp moment to show
      const tempMoment = {
        type:'image', src:'konnect2.jfif', text:'', bg:'',
        caption:'This is how it will look', time:Date.now(), views:0, status:'posted',
        fontF:'inherit', fontW:'700', fontS:'36px'
      };
      const backup = [...myMoments];
      myMoments = [tempMoment];
      viewerIndex = 0;
      openViewer('other', 0, otherName);
      // Restore after close
      const originalClose = closeViewer;
      const checkClose = setInterval(()=>{
        if(!viewerPage.classList.contains('open')){
          myMoments = backup;
          clearInterval(checkClose);
        }
      }, 500);
    } else {
      // Has my moments - show my own post but their name, no eye
      openViewer('other', 0, otherName);
    }
  });
});

// ========== GLOBAL CLOSE ==========
document.addEventListener('click', (e)=>{
  if(!myRow?.contains(e.target) && !myProfilePop?.contains(e.target)){
    myProfilePop?.classList.remove('show');
    myGalleryUnder?.classList.remove('show');
  }
  if(!moreBtn?.contains(e.target) && !morePop?.contains(e.target) &&
     !plusBtn?.contains(e.target) && !plusPop?.contains(e.target)){
    closeAllPops();
  }
});