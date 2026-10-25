// ========== BOOST.JS - CLEAN - 3 TIER FLOW - BOTTOM SHEET ==========

// Elements
const boostPage = document.getElementById('boostPage');
const boostMomentsList = document.getElementById('boostMomentsList');
const boostEmpty = document.getElementById('boostEmpty');
const boostStep1 = document.getElementById('boostStep1');
const boostStep2 = document.getElementById('boostStep2');
const boostStep3 = document.getElementById('boostStep3');
const boostContinueBtn = document.getElementById('boostContinueBtn');
const boostTotalPrice = document.getElementById('boostTotalPrice');
const closeBoostBtn = document.getElementById('closeBoost');
const boostSuccess = document.getElementById('boostSuccess');
const boostDoneBtn = document.getElementById('boostDoneBtn');
const boostPreviewInner = document.getElementById('boostPreviewInner');

// Bill elements
const billAudience = document.getElementById('billAudience');
const billDuration = document.getElementById('billDuration');
const billPlacement = document.getElementById('billPlacement');
const billViews = document.getElementById('billViews');
const billTotal = document.getElementById('billTotal');
const successAudience = document.getElementById('successAudience');

// State
let selectedBoostMomentIndex = null; // Which moment selected
let selectedAudience = {
  id: 'contacts_campus',
  name: 'Contacts & Campus',
  placement: 'Contacts + Campus feed',
  price: 300,
  views: '~300-500'
};
let selectedDuration = {
  days: 1,
  label: '24 hours',
  multi: 1
};

// ========== HELPERS ==========
function getMyMoments(){
  try{
    return JSON.parse(localStorage.getItem('myMoments') || '[]');
  }catch(e){ return []; }
}

function calculateTotal(){
  const total = selectedAudience.price * selectedDuration.multi;
  return Math.round(total);
}

function updateTotalUI(){
  const total = calculateTotal();
  if(selectedBoostMomentIndex === null){
    boostTotalPrice.innerText = 'Select a moment';
    boostContinueBtn.disabled = true;
  }else{
    boostTotalPrice.innerText = `₦${total.toLocaleString()}`;
    billTotal.innerText = `₦${total.toLocaleString()}`;
    boostContinueBtn.disabled = false;
  }
}

// ========== STEP 1: RENDER MOMENTS LIST WITH BORDER ==========
function renderBoostMomentsList(){
  const moments = getMyMoments();
  boostMomentsList.innerHTML = '';

  if(moments.length === 0){
    boostEmpty.style.display = 'block';
    boostMomentsList.style.display = 'none';
    boostContinueBtn.disabled = true;
    boostTotalPrice.innerText = 'No moments to boost';
    return;
  }

  boostEmpty.style.display = 'none';
  boostMomentsList.style.display = 'flex';

  moments.forEach((m, idx)=>{
    const item = document.createElement('div');
    item.className = 'boost-moment-item' + (idx === selectedBoostMomentIndex ? ' active' : '');
    
    let thumbHtml = '';
    if(m.type === 'image'){
      thumbHtml = `<img src="${m.src}" class="boost-moment-thumb">`;
    }else if(m.type === 'video'){
      thumbHtml = `<video src="${m.src}" class="boost-moment-thumb" muted></video>`;
    }else{
      thumbHtml = `<div class="boost-moment-thumb" style="background:${m.bg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">Text</div>`;
    }

    const caption = (m.caption || m.text || 'No caption').slice(0, 30);
    const time = new Date(m.time).toLocaleDateString();

    item.innerHTML = `
      ${thumbHtml}
      <div class="boost-moment-info">
        <h5>${caption}</h5>
        <p>${time} • ${m.privacy || 'Everyone'}</p>
      </div>
      <div class="boost-radio"></div>
    `;

    item.onclick = ()=>{
      selectedBoostMomentIndex = idx;
      document.querySelectorAll('.boost-moment-item').forEach(el=>el.classList.remove('active'));
      item.classList.add('active');
      updateTotalUI();
      updatePreview();
      // Auto enable continue
      boostContinueBtn.disabled = false;
      boostContinueBtn.innerText = 'Continue';
    };

    boostMomentsList.appendChild(item);
  });
}

// ========== STEP 2: AUDIENCE - 3 TIERS - PROPER ENGLISH ==========
function initAudience(){
  const cards = document.querySelectorAll('.boost-audience-card');
  cards.forEach(card=>{
    card.onclick = ()=>{
      cards.forEach(c=>c.classList.remove('active'));
      card.classList.add('active');

      selectedAudience = {
        id: card.dataset.audience,
        name: card.querySelector('h4').innerText,
        placement: card.querySelector('p').innerText,
        price: parseInt(card.dataset.price),
        views: card.dataset.views
      };

      // Update bill
      billAudience.innerText = selectedAudience.name;
      billPlacement.innerText = selectedAudience.placement;
      billViews.innerText = selectedAudience.views;

      updateTotalUI();
    };
  });

  // Set initial
  const activeCard = document.querySelector('.boost-audience-card.active');
  if(activeCard){
    selectedAudience.price = parseInt(activeCard.dataset.price);
    selectedAudience.views = activeCard.dataset.views;
    selectedAudience.name = activeCard.querySelector('h4').innerText;
    selectedAudience.placement = activeCard.querySelector('p').innerText;
  }
}

// ========== DURATION ==========
function initDuration(){
  const items = document.querySelectorAll('.boost-duration-item');
  items.forEach(item=>{
    item.onclick = ()=>{
      items.forEach(i=>i.classList.remove('active'));
      item.classList.add('active');

      selectedDuration = {
        days: parseInt(item.dataset.days),
        label: item.querySelector('.boost-duration-name').innerText,
        multi: parseFloat(item.dataset.multi)
      };

      billDuration.innerText = selectedDuration.label;
      updateTotalUI();
    };
  });

  const active = document.querySelector('.boost-duration-item.active');
  if(active){
    selectedDuration.days = parseInt(active.dataset.days);
    selectedDuration.label = active.querySelector('.boost-duration-name').innerText;
    selectedDuration.multi = parseFloat(active.dataset.multi);
  }
}

// ========== PREVIEW - HOW OTHERS WILL SEE IT ==========
function updatePreview(){
  if(selectedBoostMomentIndex === null) return;
  const moments = getMyMoments();
  const m = moments[selectedBoostMomentIndex];
  if(!m || !boostPreviewInner) return;

  boostPreviewInner.innerHTML = '';

  if(m.type === 'image'){
    boostPreviewInner.innerHTML = `<img src="${m.src}" style="width:100%;height:100%;object-fit:cover;">`;
  }else if(m.type === 'video'){
    boostPreviewInner.innerHTML = `<video src="${m.src}" style="width:100%;height:100%;object-fit:cover;" muted autoplay loop playsinline></video>`;
  }else{
    const div = document.createElement('div');
    div.style.cssText = `width:100%;height:100%;background:${m.bg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;text-align:center;padding:12px;`;
    div.innerText = m.text || 'Text moment';
    div.style.fontFamily = m.fontF || 'inherit';
    boostPreviewInner.appendChild(div);
  }
}

// ========== STEPS FLOW - STEP 1 -> 2 -> 3 -> PAY ==========
let currentBoostStep = 1;

function showBoostStep(step){
  currentBoostStep = step;
  boostStep1.style.display = step === 1 ? 'block' : 'none';
  boostStep2.style.display = step === 2 ? 'block' : 'none';
  boostStep3.style.display = step === 3 ? 'block' : 'none';

  if(step === 1){
    boostContinueBtn.innerText = 'Continue';
    boostTotalPrice.innerText = selectedBoostMomentIndex === null ? 'Select a moment' : `₦${calculateTotal().toLocaleString()}`;
  }else if(step === 2){
    boostContinueBtn.innerText = 'Continue to checkout';
  }else if(step === 3){
    boostContinueBtn.innerText = `Pay ₦${calculateTotal().toLocaleString()}`;
    updatePreview();
    // Update bill for step 3
    billAudience.innerText = selectedAudience.name;
    billDuration.innerText = selectedDuration.label;
    billPlacement.innerText = selectedAudience.placement;
    billViews.innerText = selectedAudience.views;
    billTotal.innerText = `₦${calculateTotal().toLocaleString()}`;
  }
}

if(boostContinueBtn){
  boostContinueBtn.onclick = ()=>{
    if(currentBoostStep === 1){
      if(selectedBoostMomentIndex === null){
        alert('Please select a moment to boost');
        return;
      }
      showBoostStep(2);
    }else if(currentBoostStep === 2){
      showBoostStep(3);
    }else if(currentBoostStep === 3){
      // PAY - simulate payment
      boostContinueBtn.innerText = 'Processing...';
      boostContinueBtn.disabled = true;

      setTimeout(()=>{
        onBoostSuccess();
      }, 1500);
    }
  };
}

// ========== BOOST SUCCESS - ADD GOLD BORDER UNDER PROFILE ==========
function onBoostSuccess(){
  // Save boosted state
  localStorage.setItem('momentsBoosted', 'true');
  localStorage.setItem('boostedMomentIndex', selectedBoostMomentIndex);
  localStorage.setItem('boostInfo', JSON.stringify({
    audience: selectedAudience,
    duration: selectedDuration,
    total: calculateTotal(),
    time: Date.now()
  }));

  // Add gold border under my profile
  const myAvatar = document.getElementById('myAvatarBorder');
  const boostFirstBorder = document.getElementById('boostFirstBorder');
  const boostMomentsBtn = document.getElementById('boostMoments');

  if(myAvatar){
    myAvatar.classList.add('boosted');
    myAvatar.classList.add('boost-has-border');
    myAvatar.classList.add('has-moments');
  }
  if(boostFirstBorder){
    boostFirstBorder.classList.add('boosted');
  }
  if(boostMomentsBtn){
    boostMomentsBtn.classList.add('boosted');
  }

  // Show success pop with proper English
  successAudience.innerText = selectedAudience.name.toLowerCase();
  boostSuccess.style.display = 'flex';
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });

  boostContinueBtn.innerText = `Pay ₦${calculateTotal().toLocaleString()}`;
  boostContinueBtn.disabled = false;
}

// Close success
if(boostDoneBtn){
  boostDoneBtn.onclick = ()=>{
    boostSuccess.style.display = 'none';
    boostPage.classList.remove('active');
    document.body.classList.remove('boost-open');
    // Reset to step 1
    selectedBoostMomentIndex = null;
    showBoostStep(1);
    renderBoostMomentsList();
    updateTotalUI();
  };
}

// ========== OPEN BOOST PAGE - FROM FIRST BORDER UNDER PROFILE ==========
const boostFirstBorder = document.getElementById('boostFirstBorder');

function openBoostPage(){
  const moments = getMyMoments();
  if(moments.length === 0){
    alert('Post a moment first to boost it');
    // Open gallery
    document.getElementById('galleryInput')?.click();
    return;
  }

  boostPage.classList.add('active');
  document.body.classList.add('boost-open');
  showBoostStep(1);
  renderBoostMomentsList();
  updateTotalUI();
  lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

if(boostFirstBorder){
  boostFirstBorder.onclick = (e)=>{
    e.stopPropagation();
    openBoostPage();
  };
}

// Also allow old boost button if exists
document.getElementById('boostMoments')?.addEventListener('click', openBoostPage);

// ========== CLOSE BOOST PAGE - CAN GO BACK - SWIPE DOWN ==========
if(closeBoostBtn){
  closeBoostBtn.onclick = ()=>{
    boostPage.classList.remove('active');
    document.body.classList.remove('boost-open');
    // If success is open, close it too
    boostSuccess.style.display = 'none';
  };
}

// Click outside to close (bottom sheet behavior)
boostPage.addEventListener('click', (e)=>{
  if(e.target === boostPage){
    boostPage.classList.remove('active');
    document.body.classList.remove('boost-open');
  }
});

// Swipe down to close - mobile
let boostStartY = 0;
boostPage.addEventListener('touchstart', (e)=>{
  boostStartY = e.touches[0].clientY;
}, {passive:true});

boostPage.addEventListener('touchend', (e)=>{
  const diff = e.changedTouches[0].clientY - boostStartY;
  if(diff > 120){ // Swipe down > 120px = close
    boostPage.classList.remove('active');
    document.body.classList.remove('boost-open');
  }
}, {passive:true});

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', ()=>{
  initAudience();
  initDuration();
  updateTotalUI();
  // If already boosted, show border
  if(localStorage.getItem('momentsBoosted') === 'true'){
    document.getElementById('myAvatarBorder')?.classList.add('boosted');
    document.getElementById('myAvatarBorder')?.classList.add('boost-has-border');
    document.getElementById('boostFirstBorder')?.classList.add('boosted');
  }
  showBoostStep(1);
});


function openBoostPage(){
  const moments = getMyMoments();
  if(moments.length === 0){
    document.getElementById('boostNoMomentsPopup').classList.add('show');
    lucide.createIcons();
    return;
  }
  boostPage.classList.add('active');
}
// Also init when page loaded (in case DOMContentLoaded already fired)
initAudience();
initDuration();
showBoostStep(1);
renderBoostMomentsList();
updateTotalUI();