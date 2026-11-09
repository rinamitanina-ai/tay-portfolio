// Mobile navigation
document.querySelectorAll('.menu-toggle').forEach(toggle => {
  const nav = toggle.parentElement.querySelector('.nav');
  if (!nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    toggle.textContent = open ? '×' : '☰';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  }));
});

// Language switcher: updates every element with paired translations.
document.querySelectorAll('.lang-switch').forEach(button => {
  let currentLang = 'ru';
  button.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-ru][data-en]').forEach(element => {
      element.innerHTML = element.dataset[currentLang];
    });
    button.textContent = currentLang === 'ru' ? 'RU / EN' : 'EN / RU';
    const search = document.querySelector('#work-search');
    if (search) search.placeholder = currentLang === 'ru' ? 'Найти проект / Search projects' : 'Search projects / Найти проект';
  });
});

// Archive filters and search
const archiveGrid = document.querySelector('#archive-grid');
if (archiveGrid) {
  const cards = [...archiveGrid.querySelectorAll('.archive-card')];
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const searchInput = document.querySelector('#work-search');
  const emptyState = document.querySelector('.archive-empty');
  let activeFilter = 'all';

  function updateArchive() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
      const searchable = `${card.dataset.search || ''} ${card.innerText}`.toLowerCase();
      const categoryMatch = activeFilter === 'all' || categories.includes(activeFilter);
      const queryMatch = !query || searchable.includes(query);
      const show = categoryMatch && queryMatch;
      card.hidden = !show;
      if (show) visible++;
    });
    if (emptyState) emptyState.hidden = visible !== 0;
  }

  filterButtons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    updateArchive();
  }));
  searchInput?.addEventListener('input', updateArchive);
  updateArchive();
}


// Motion and image lightbox shared by all portfolio pages.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal content as it enters the viewport.
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
      '.section, .featured-card, .archive-card, .case-section, .case-gallery, .small-case-about, .small-case-gallery, .case-visual-break, .case-outcome, .mur-packaging-grid, .oskolki-editorial-grid'
    );
    revealTargets.forEach((element, index) => {
      element.classList.add('reveal-ready');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 65}ms`);
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(element => observer.observe(element));
  }

  // Full-screen image viewer. Works for small project galleries and case-study visuals.
  const images = [...document.querySelectorAll(
    '.small-case-images a[href], .gallery-item img, .mur-packaging-grid img, .case-visual-break img, .case-hero-image img'
  )].filter(node => node.tagName === 'IMG' || node.querySelector('img'));

  if (!images.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'tay-lightbox';
  dialog.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Закрыть">×</button>
    <button class="lightbox-prev" type="button" aria-label="Предыдущее изображение">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lightbox-next" type="button" aria-label="Следующее изображение">›</button>
    <span class="lightbox-counter"></span>`;
  document.body.appendChild(dialog);

  const entries = images.map(node => {
    const img = node.tagName === 'IMG' ? node : node.querySelector('img');
    const href = node.tagName === 'A' ? node.getAttribute('href') : (img.currentSrc || img.src);
    return { src: href || img.src, alt: img.alt || '', caption: img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || img.alt || '' };
  });
  let current = 0;
  const lightboxImage = dialog.querySelector('figure img');
  const caption = dialog.querySelector('figcaption');
  const counter = dialog.querySelector('.lightbox-counter');

  function show(index) {
    current = (index + entries.length) % entries.length;
    const item = entries[current];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    caption.textContent = item.caption;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(entries.length).padStart(2, '0')}`;
  }

  images.forEach((node, index) => {
    node.classList.add('lightbox-trigger');
    node.addEventListener('click', event => {
      event.preventDefault();
      show(index);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });

  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
})();


// Shared motion and full-screen image viewer.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.section,.featured-card,.archive-card,.case-section,.case-gallery,.small-case-about,.small-case-gallery,.case-visual-break,.case-outcome,.mur-packaging-grid,.oskolki-editorial-grid');
    targets.forEach((el,i) => {
      el.classList.add('reveal-ready');
      el.style.setProperty('--reveal-delay', `${(i % 4) * 65}ms`);
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:.08,rootMargin:'0px 0px -35px 0px'});
    targets.forEach(el => observer.observe(el));
  }
  const nodes = [...document.querySelectorAll('.small-case-images a[href],.gallery-item img,.mur-packaging-grid img,.case-visual-break img,.case-hero-image img')];
  if (!nodes.length) return;
  const items = nodes.map(node => {
    const img = node.tagName === 'IMG' ? node : node.querySelector('img');
    return {src:node.tagName === 'A' ? node.href : (img.currentSrc || img.src),alt:img.alt || '',caption:img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || img.alt || ''};
  });
  const dialog = document.createElement('dialog');
  dialog.className='tay-lightbox';
  dialog.innerHTML='<button class="lightbox-close" aria-label="Close">×</button><button class="lightbox-prev" aria-label="Previous">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" aria-label="Next">›</button><span class="lightbox-counter"></span>';
  document.body.appendChild(dialog);
  let current=0;
  const image=dialog.querySelector('figure img'), caption=dialog.querySelector('figcaption'), counter=dialog.querySelector('.lightbox-counter');
  const show=i=>{current=(i+items.length)%items.length;const item=items[current];image.src=item.src;image.alt=item.alt;caption.textContent=item.caption;counter.textContent=`${String(current+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;};
  nodes.forEach((node,i)=>{node.classList.add('lightbox-trigger');node.addEventListener('click',e=>{e.preventDefault();show(i);dialog.showModal();});});
  dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click',()=>show(current-1));
  dialog.querySelector('.lightbox-next').addEventListener('click',()=>show(current+1));
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  document.addEventListener('keydown',e=>{if(dialog.open&&e.key==='ArrowLeft')show(current-1);if(dialog.open&&e.key==='ArrowRight')show(current+1);});
})();
