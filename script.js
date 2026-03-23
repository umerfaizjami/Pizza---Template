'use strict';
/* ─── LOADER ─── */
let pct = 0;
const loaderEl = document.getElementById('loader');
const iv = setInterval(() => {
  pct += Math.floor(Math.random() * 18) + 6;
  if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(() => loaderEl.classList.add('out'), 300); }
}, 100);

/* ─── CURSOR ─── */
const cDot = document.getElementById('cursor-dot');
const cRing = document.getElementById('cursor-ring');
let cx = 0, cy = 0;
document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cDot.style.left = cx + 'px'; cDot.style.top = cy + 'px';
  setTimeout(() => { cRing.style.left = cx + 'px'; cRing.style.top = cy + 'px'; }, 80);
});
document.querySelectorAll('a,button,.menu-card,.topping-item').forEach(el => {
  el.addEventListener('mouseenter', () => cRing.classList.add('active'));
  el.addEventListener('mouseleave', () => cRing.classList.remove('active'));
});

/* ─── NAV SCROLL ─── */
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── MOBILE MENU ─── */
const mobMenu = document.getElementById('mobMenu');
document.getElementById('navHam').addEventListener('click', () => mobMenu.classList.add('open'));
document.getElementById('mobClose').addEventListener('click', () => mobMenu.classList.remove('open'));
function closeMob() { mobMenu.classList.remove('open'); }

/* ─── EMBER PARTICLES ─── */
const embers = document.getElementById('embers');
function spawnEmber() {
  const e = document.createElement('div');
  e.className = 'ember';
  e.style.cssText = `
    left:${10 + Math.random() * 80}%;
    bottom:${Math.random() * 20}%;
    --drift:${(Math.random() - .5) * 80}px;
    animation-duration:${3 + Math.random() * 5}s;
    animation-delay:${Math.random() * 2}s;
    width:${2 + Math.random() * 3}px;
    height:${2 + Math.random() * 3}px;
  `;
  embers.appendChild(e);
  setTimeout(() => e.remove(), 9000);
}
setInterval(spawnEmber, 400);

/* ─── HERO PIZZA PARALLAX ROTATION ─── */
const heroPizzaImg = document.getElementById('heroPizzaImg');
let pizzaRotation = 0;
window.addEventListener('scroll', () => {
  pizzaRotation = window.scrollY * 0.08;
  if (heroPizzaImg) heroPizzaImg.style.transform = `rotate(${pizzaRotation}deg)`;
}, { passive: true });

/* ─── SCROLL REVEAL (Intersection Observer) ─── */
const srObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.sr').forEach(el => srObs.observe(el));

/* ─── CART STATE ─── */
let cartCount = 0;
let cartTotal = 0;
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');

function addToCart(name, price) {
  cartCount++;
  cartTotal += price;
  cartBadge.textContent = cartCount;
  cartBadge.classList.add('show');
  cartBtn.classList.remove('bounce');
  void cartBtn.offsetWidth; // reflow
  cartBtn.classList.add('bounce');
  showToast(`🍕 ${name} added — $${price}`);
}
cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('bounce'));

/* ─── TOAST NOTIFICATION ─── */
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;z-index:9990;
    background:var(--charcoal);border:1px solid var(--gold-20);
    padding:1rem 1.5rem;font-size:.72rem;font-weight:300;
    color:var(--cream);font-family:var(--font-body);
    transform:translateY(20px);opacity:0;
    transition:all .4s var(--ease-fire);
    box-shadow:0 8px 30px rgba(0,0,0,.5);
    border-left:3px solid var(--gold);
    max-width:300px;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateY(20px)';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

/* ─── MENU ADD TO CART BUTTONS ─── */
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(btn.dataset.name, parseInt(btn.dataset.price));
  });
});

/* ─── MENU FILTER ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
const menuCards = document.querySelectorAll('.menu-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    menuCards.forEach(card => {
      const show = f === 'all' || card.dataset.category === f;
      card.style.display = show ? 'flex' : 'none';
    });
  });
});

/* ─── PIZZA CUSTOMIZER ─── */
const BASE_PRICE = 18;
let custExtras = 0;
const custTotal = document.getElementById('custTotal');
const toppingLayer = document.getElementById('toppingLayer');
const toppingPositions = [
  {top:'20%',left:'30%'},{top:'15%',left:'55%'},{top:'35%',left:'70%'},
  {top:'60%',left:'65%'},{top:'65%',left:'35%'},{top:'45%',left:'20%'},
  {top:'50%',left:'50%'},{top:'30%',left:'45%'}
];
let posIdx = 0;

document.querySelectorAll('.topping-item').forEach(item => {
  item.querySelector('.topping-toggle').addEventListener('click', () => {
    const isSelected = item.classList.contains('selected');
    const price = parseInt(item.dataset.price);
    const emoji = item.dataset.emoji;

    if (isSelected) {
      item.classList.remove('selected');
      item.querySelector('.topping-toggle').textContent = '+';
      custExtras -= price;
    } else {
      item.classList.add('selected');
      item.querySelector('.topping-toggle').textContent = '✓';
      custExtras += price;
      // Animate topping onto pizza
      const pos = toppingPositions[posIdx % toppingPositions.length];
      posIdx++;
      const piece = document.createElement('span');
      piece.className = 'topping-piece';
      piece.textContent = emoji;
      piece.style.top = pos.top;
      piece.style.left = pos.left;
      toppingLayer.appendChild(piece);
      requestAnimationFrame(() => piece.classList.add('placed'));
    }
    custTotal.textContent = '$' + (BASE_PRICE + custExtras).toFixed(2);
  });
});

document.getElementById('custAddBtn').addEventListener('click', () => {
  addToCart('Custom Pizza', BASE_PRICE + custExtras);
});

/* ─── MAGNETIC BUTTONS ─── */
document.querySelectorAll('[data-mag]').forEach(wrap => {
  const inner = wrap.querySelector('.magnetic-inner') || wrap;
  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    wrap.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  wrap.addEventListener('mouseleave', () => {
    wrap.style.transform = '';
  });
});

/* Nav button magnetic */
const navMagBtn = document.getElementById('navMagBtn');
if (navMagBtn) {
  navMagBtn.addEventListener('mousemove', e => {
    const rect = navMagBtn.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * 0.4;
    const dy = (e.clientY - rect.top - rect.height / 2) * 0.4;
    navMagBtn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  navMagBtn.addEventListener('mouseleave', () => { navMagBtn.style.transform = ''; });
}

/* ─── SPECIALS CAROUSEL ─── */
const specTrack = document.getElementById('specTrack');
const carDots = document.querySelectorAll('.car-dot');
let carIdx = 0;
const slides = specTrack.querySelectorAll('.special-slide');

function getSlideWidth() {
  return slides[0].offsetWidth + 24; // gap
}
function updateCarousel() {
  specTrack.style.transform = `translateX(-${carIdx * getSlideWidth()}px)`;
  carDots.forEach((d, i) => d.classList.toggle('active', i === carIdx));
}
document.getElementById('carNext').addEventListener('click', () => {
  carIdx = Math.min(carIdx + 1, slides.length - 1);
  updateCarousel();
});
document.getElementById('carPrev').addEventListener('click', () => {
  carIdx = Math.max(carIdx - 1, 0);
  updateCarousel();
});

// Touch swipe
let touchStartX = 0;
const carEl = document.getElementById('specialsCar');
carEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
carEl.addEventListener('touchend', e => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 50) {
    if (dx > 0) carIdx = Math.min(carIdx + 1, slides.length - 1);
    else carIdx = Math.max(carIdx - 1, 0);
    updateCarousel();
  }
}, { passive: true });

/* ─── TRACKING PROGRESS ANIMATION ─── */
setTimeout(() => {
  const line = document.getElementById('trackLine');
  if (line) {
    line.style.transition = 'width 2s var(--ease-silk)';
    line.style.width = '62%';
  }
}, 1200);

/* ─── DATE/TIME in footer ─── */
// subtle; could be extended

/* ─── RESIZE HANDLER ─── */
window.addEventListener('resize', updateCarousel, { passive: true });