document.addEventListener('DOMContentLoaded', () => {
  const pages = {
    loops: document.getElementById('pageLoops'),
    chats: document.getElementById('pageChats'), // wrapper, not chatLoadList
    moments: document.getElementById('pageMoments'),
    profile: document.getElementById('pageProfile'),
    settings: document.getElementById('pageSettings')
  };

  const btns = document.querySelectorAll('[data-page]');

  // make empty pages visible when shown
  ['loops','profile','settings'].forEach(k => {
    if(pages[k]){
      pages[k].style.width = '100%';
      pages[k].style.height = '100%';
      // temporary text so you know e dey work
      if(!pages[k].innerHTML.trim()){
        pages[k].innerHTML = '';
      }
    }
  });

  function switchPage(to){
    to = to.toLowerCase();

    // hide all pages
    Object.values(pages).forEach(p => {
      if(p) p.style.display = 'none';
    });

    // show target
    if(pages[to]){
      pages[to].style.display = to === 'moments' ? 'flex' : 'block';
    }

    // nav active
    btns.forEach(b => {
      b.classList.remove('active');
      b.querySelector('.home-icon')?.classList.remove('active');
      b.querySelector('.nav-label')?.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-page="${to}"]`);
    if(activeBtn){
      activeBtn.classList.add('active');
      activeBtn.querySelector('.home-icon')?.classList.add('active');
      activeBtn.querySelector('.nav-label')?.classList.add('active');
    }

    try{ lucide.createIcons(); }catch(e){}
  }

  // clicks - auto
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchPage(btn.dataset.page);
    });
  });

  // start
  switchPage('chats');
});