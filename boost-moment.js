// ========== BOOST MOMENTS - FULL JS - 3-TIER FLOW ==========
let boostState = {
  selectedMoment: null,
  audience: 'contacts_campus', // default tier 1
  audiencePrice: 300,
  audienceViews: '~300-500',
  placement: 'Contacts + Campus feed',
  placementKey: 'contacts_campus',
  days: 1,
  multi: 1
};

const boostTiers = {
  contacts_campus: {
    price: 300,
    views: '~300-500',
    placement: 'Contacts + Campus feed',
    showIn: ['contacts', 'campus_only'],
    label: 'your contacts & campus'
  },
  campus_anon: {
    price: 700,
    views: '~1k',
    placement: 'Campus feed and Anonymous feed',
    showIn: ['campus_feed', 'anonymous_feed'],
    label: 'campus + anonymous feed'
  },
  everyone: {
    price: 1500,
    views: '~5k+',
    placement: 'Everyone u get',
    showIn: ['everywhere'],
    label: 'everyone'
  }
};

// DOM
const boostPage = document.getElementById('boostPage');
const boostStep1 = document.getElementById('boostStep1');
const boostStep2 = document.getElementById('boostStep2');
const boostStep3 = document.getElementById('boostStep3');
const boostList = document.getElementById('boostMomentsList');
const boostEmpty = document.getElementById('boostEmpty');
const boostTotalPrice = document.getElementById('boostTotalPrice');
const boostContinueBtn = document.getElementById('boostContinueBtn');
const boostPreviewInner = document.getElementById('boostPreviewInner');

// Bill
const billAudience = document.getElementById('billAudience');
const billDuration = document.getElementById('billDuration');
const billPlacement = document.getElementById('billPlacement');
const billViews = document.getElementById('billViews');
const billTotal = document.getElementById('billTotal');

// Success
const boostSuccess = document.getElementById('boostSuccess');
const successAudience = document.getElementById('successAudience');

// ========== 1. RENDER YOUR MOMENTS ==========
function renderBoostMoments(moments){ // moments = your array from DB [{id, type, src, text}]
  boostList.innerHTML = '';
  if(!moments || moments.length === 0){
    boostEmpty.style.display = 'block';
    boostContinueBtn.disabled = true;
    boostTotalPrice.innerText = 'No moments';
    return;
  }
  boostEmpty.style.display = 'none';
  moments.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'boost-moment-item';
    div.dataset.id = m.id;
    div.innerHTML = `
      ${m.type === 'video' ? `<video src="${m.src}" class="boost-moment-thumb" muted></video>` : 
        m.type === 'image' ? `<img src="${m.src}" class="boost-moment-thumb"/>` : 
        `<div class="boost-moment-thumb" style="display:flex;align-items:center;justify-content:center;font-size:12px;padding:4px;background:#f0f0f0">${(m.text||'').substring(0,30)}</div>`}
      <div class="boost-moment-info">
        <h5>${m.text ? m.text.substring(0,35) : m.type}</h5>
        <p>${new Date(m.createdAt).toLocaleDateString()} • ${m.type}</p>
      </div>
      <div class="boost-radio"></div>
    `;
    div.onclick = ()=> selectBoostMoment(m, div);
    boostList.appendChild(div);
  });
}

function selectBoostMoment(moment, el){
  document.querySelectorAll('.boost-moment-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  boostState.selectedMoment = moment;
  
  // preview
  if(moment.type === 'image') boostPreviewInner.innerHTML = `<img src="${moment.src}" style="width:100%;border-radius:12px;max-height:200px;object-fit:cover">`;
  else if(moment.type === 'video') boostPreviewInner.innerHTML = `<video src="${moment.src}" style="width:100%;border-radius:12px;max-height:200px" controls></video>`;
  else boostPreviewInner.innerHTML = `<div style="padding:16px;font-size:14px">${moment.text}</div>`;

  boostContinueBtn.disabled = false;
  boostTotalPrice.innerText = `₦${getTotal()}`;
  boostContinueBtn.innerText = 'Continue';
}

// ========== 2. AUDIENCE SELECT ==========
document.querySelectorAll('.boost-audience-card').forEach(card=>{
  card.onclick = ()=>{
    document.querySelectorAll('.boost-audience-card').forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
    const key = card.dataset.audience;
    boostState.placementKey = key;
    boostState.audience = card.querySelector('h4').innerText;
    boostState.audiencePrice = parseInt(card.dataset.price);
    boostState.audienceViews = card.dataset.views;
    boostState.placement = boostTiers[key].placement;
    
    // update bill
    billAudience.innerText = boostState.audience;
    billPlacement.innerText = boostState.placement;
    billViews.innerText = boostState.audienceViews;
    updateTotal();
  };
});

// ========== 3. DURATION SELECT ==========
document.querySelectorAll('.boost-duration-item').forEach(item=>{
  item.onclick = ()=>{
    document.querySelectorAll('.boost-duration-item').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');
    boostState.days = parseInt(item.dataset.days);
    boostState.multi = parseFloat(item.dataset.multi);
    billDuration.innerText = item.querySelector('.boost-duration-name').innerText;
    updateTotal();
  };
});

function getTotal(){
  return Math.round(boostState.audiencePrice * boostState.multi);
}
function updateTotal(){
  const total = getTotal();
  boostTotalPrice.innerText = `₦${total.toLocaleString()}`;
  billTotal.innerText = `₦${total.toLocaleString()}`;
}

// ========== 4. STEP NAVIGATION ==========
let currentStep = 1;
boostContinueBtn.onclick = ()=>{
  if(currentStep === 1){
    if(!boostState.selectedMoment) return;
    boostStep1.style.display = 'none';
    boostStep2.style.display = 'block';
    currentStep = 2;
    boostContinueBtn.innerText = 'Continue to pay';
    updateTotal();
    return;
  }
  if(currentStep === 2){
    boostStep2.style.display = 'none';
    boostStep3.style.display = 'block';
    currentStep = 3;
    boostContinueBtn.innerText = `Pay ₦${getTotal().toLocaleString()}`;
    return;
  }
  if(currentStep === 3){
    // PAYSTACK
    payWithPaystack();
  }
};

// Back button
document.getElementById('closeBoost').onclick = closeBoostFlow;
function closeBoostFlow(){
  if(currentStep > 1){
    if(currentStep === 2){ boostStep2.style.display='none'; boostStep1.style.display='block'; currentStep=1; boostContinueBtn.innerText='Continue'; }
    else if(currentStep === 3){ boostStep3.style.display='none'; boostStep2.style.display='block'; currentStep=2; boostContinueBtn.innerText='Continue to pay'; }
    return;
  }
  boostPage.classList.remove('active');
  // reset
  currentStep = 1;
  boostStep1.style.display='block';
  boostStep2.style.display='none';
  boostStep3.style.display='none';
  boostContinueBtn.innerText='Continue';
}

// ========== 5. PAYSTACK + BOOST LOGIC ==========
function payWithPaystack(){
  const total = getTotal();
  const email = localStorage.getItem('userEmail') || 'user@example.com'; // replace with real user email

  boostContinueBtn.innerText = 'Processing...';
  boostContinueBtn.disabled = true;

  // If you have Paystack inline
  if(window.PaystackPop){
    let handler = PaystackPop.setup({
      key: 'YOUR_PAYSTACK_PUBLIC_KEY', // <-- put your key
      email: email,
      amount: total * 100, // kobo
      currency: 'NGN',
      ref: 'BOOST_'+Date.now(),
      metadata: {
        custom_fields: [
          { display_name: "Moment ID", variable_name: "moment_id", value: boostState.selectedMoment.id },
          { display_name: "Audience", variable_name: "audience", value: boostState.placementKey },
          { display_name: "Duration", variable_name: "duration", value: boostState.days+' days' }
        ]
      },
      callback: function(response){
        // payment success - now boost
        saveBoostToDB(response.reference);
      },
      onClose: function(){
        boostContinueBtn.innerText = `Pay ₦${total.toLocaleString()}`;
        boostContinueBtn.disabled = false;
      }
    });
    handler.openIframe();
  } else {
    // TEST MODE if no Paystack loaded - simulate success
    setTimeout(()=> saveBoostToDB('TEST_'+Date.now()), 1200);
  }
}

function saveBoostToDB(payRef){
  const tier = boostTiers[boostState.placementKey];
  
  // 1. Save to your DB - replace with your Firebase/Supabase call
  const boostData = {
    momentId: boostState.selectedMoment.id,
    tier: boostState.placementKey,
    showIn: tier.showIn, // WHERE TO SHOW - THIS IS YOUR CORE LOGIC
    price: getTotal(),
    days: boostState.days,
    payRef: payRef,
    status: 'active',
    createdAt: Date.now(),
    expiresAt: Date.now() + (boostState.days * 24 * 60 * 60 * 1000)
  };
  
  console.log('BOOST SAVED:', boostData);
  
  // Example Firebase:
  // db.collection('boosts').add(boostData);
  // If tier is campus_anon or everyone, also inject into anonymous feed:
  // if(tier.showIn.includes('anonymous_feed') || tier.showIn.includes('everywhere')){
  //   db.collection('anonymous_feed').doc(boostData.momentId).set({isSponsored:true, boostTier:tier}, {merge:true});
  // }

  // Show success
  successAudience.innerText = tier.label;
  boostSuccess.style.display = 'flex';
  boostContinueBtn.disabled = false;
  boostContinueBtn.innerText = 'Done';
}

document.getElementById('boostDoneBtn').onclick = ()=>{
  boostSuccess.style.display = 'none';
  closeBoostFlow();
  // optional refresh
  location.reload();
};

// ========== 6. OPEN BOOST PAGE ==========
// Call this when user clicks Boost on a moment
function openBoostPage(){
  boostPage.classList.add('active');
  currentStep = 1;
  boostStep1.style.display = 'block';
  boostStep2.style.display = 'none';
  boostStep3.style.display = 'none';
  // Load moments - replace with your real fetch
  // const myMoments = fetchMyMoments();
  // renderBoostMoments(myMoments);
}

// FOR TESTING - mock data, remove later
const mockMoments = [
  {id:'1', type:'text', text:'Party tonight at Yaba!', createdAt: Date.now()},
  {id:'2', type:'image', src:'https://picsum.photos/200', text:'My new shop', createdAt: Date.now()}
];
renderBoostMoments(mockMoments);