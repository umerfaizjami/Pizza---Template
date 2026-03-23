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

/* ─── SCROLL REVEAL ─── */
const srObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.sr').forEach(el => srObs.observe(el));

/* ─────────────────────────────────────────────────────
   CART STATE
───────────────────────────────────────────────────── */
let cart = [];
const DELIVERY_FEE = 3.99;

const cartBtn     = document.getElementById('cartBtn');
const cartBadge   = document.getElementById('cartBadge');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartEmptyEl = document.getElementById('cartEmpty');
const cartFooterEl= document.getElementById('cartFooter');
const cartSubEl   = document.getElementById('cartSubtotal');
const cartTaxEl   = document.getElementById('cartTax');
const cartTotalEl = document.getElementById('cartGrandTotal');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function updateBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  cartBadge.textContent = total;
  cartBadge.classList.toggle('show', total > 0);
}

function calcTotals() {
  const sub  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax  = sub * 0.08;
  const grand = sub + tax + (cart.length ? DELIVERY_FEE : 0);
  return { sub, tax, grand };
}

function renderCart() {
  cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
  const isEmpty = cart.length === 0;
  cartEmptyEl.style.display = isEmpty ? 'flex' : 'none';
  cartFooterEl.style.display = isEmpty ? 'none' : 'block';

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.dataset.id = item.id;
    row.innerHTML = `
      <div style="flex:1">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-sub">$${item.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn qty-dec" aria-label="Decrease">&#8722;</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn qty-inc" aria-label="Increase">+</button>
      </div>
      <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      <button class="cart-item-remove" aria-label="Remove item">&#x2715;</button>
    `;
    row.querySelector('.qty-dec').addEventListener('click', () => changeQty(item.id, -1));
    row.querySelector('.qty-inc').addEventListener('click', () => changeQty(item.id, +1));
    row.querySelector('.cart-item-remove').addEventListener('click', () => removeItem(item.id));
    cartItemsEl.appendChild(row);
  });

  const { sub, tax, grand } = calcTotals();
  cartSubEl.textContent  = '$' + sub.toFixed(2);
  cartTaxEl.textContent  = '$' + tax.toFixed(2);
  cartTotalEl.textContent= '$' + grand.toFixed(2);
  updateBadge();
}

function addToCart(name, price) {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id, name, price, qty: 1 }); }
  renderCart();
  cartBtn.classList.remove('bounce');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('bounce');
  showToast('&#127829; ' + name + ' added — $' + price);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

document.getElementById('cartClearBtn').addEventListener('click', () => { cart = []; renderCart(); });
cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('bounce'));

/* ─── TOAST ─── */
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
  t.innerHTML = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateY(20px)';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

/* ─── MENU ADD TO CART ─── */
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(btn.dataset.name, parseInt(btn.dataset.price));
  });
});

/* ─── MENU FILTER ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
const menuCards  = document.querySelectorAll('.menu-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    menuCards.forEach(card => {
      card.style.display = (f === 'all' || card.dataset.category === f) ? 'flex' : 'none';
    });
  });
});

/* ─── PIZZA CUSTOMIZER ─── */
const BASE_PRICE = 18;
let custExtras = 0;
const custTotal    = document.getElementById('custTotal');
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
      item.querySelector('.topping-toggle').textContent = '\u2713';
      custExtras += price;
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
  const selected = [...document.querySelectorAll('.topping-item.selected')].map(i => i.dataset.name).join(', ');
  const name = selected ? 'Custom Pizza (' + selected + ')' : 'Custom Pizza';
  addToCart(name, BASE_PRICE + custExtras);
});

/* ─── MAGNETIC BUTTONS ─── */
document.querySelectorAll('[data-mag]').forEach(wrap => {
  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width/2) * 0.35;
    const dy = (e.clientY - rect.top  - rect.height/2) * 0.35;
    wrap.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  });
  wrap.addEventListener('mouseleave', () => { wrap.style.transform = ''; });
});

const navMagBtn = document.getElementById('navMagBtn');
if (navMagBtn) {
  navMagBtn.addEventListener('mousemove', e => {
    const rect = navMagBtn.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width/2) * 0.4;
    const dy = (e.clientY - rect.top  - rect.height/2) * 0.4;
    navMagBtn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  });
  navMagBtn.addEventListener('mouseleave', () => { navMagBtn.style.transform = ''; });
}

/* ─── SPECIALS CAROUSEL ─── */
const specTrack = document.getElementById('specTrack');
const carDots   = document.querySelectorAll('.car-dot');
let carIdx = 0;
const slides = specTrack.querySelectorAll('.special-slide');
function getSlideWidth() { return slides[0].offsetWidth + 24; }
function updateCarousel() {
  specTrack.style.transform = 'translateX(-' + (carIdx * getSlideWidth()) + 'px)';
  carDots.forEach((d, i) => d.classList.toggle('active', i === carIdx));
}
document.getElementById('carNext').addEventListener('click', () => { carIdx = Math.min(carIdx+1, slides.length-1); updateCarousel(); });
document.getElementById('carPrev').addEventListener('click', () => { carIdx = Math.max(carIdx-1, 0); updateCarousel(); });

let touchStartX = 0;
const carEl = document.getElementById('specialsCar');
carEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
carEl.addEventListener('touchend', e => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 50) {
    if (dx > 0) carIdx = Math.min(carIdx+1, slides.length-1);
    else carIdx = Math.max(carIdx-1, 0);
    updateCarousel();
  }
}, { passive: true });

/* ─── TRACKING ─── */
setTimeout(() => {
  const line = document.getElementById('trackLine');
  if (line) { line.style.transition = 'width 2s var(--ease-silk)'; line.style.width = '62%'; }
}, 1200);

window.addEventListener('resize', updateCarousel, { passive: true });

/* ─────────────────────────────────────────────────────
   CHECKOUT FLOW
───────────────────────────────────────────────────── */
const checkoutModal   = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
let currentStep = 1;
let selectedPayMethod = 'card';

function openCheckout() {
  if (cart.length === 0) { showToast('Add items to your cart first!'); return; }
  closeCart();
  goToStep(1);
  checkoutModal.classList.add('open');
  checkoutOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCheckout() {
  checkoutModal.classList.remove('open');
  checkoutOverlay.classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('placeOrderBtn').textContent = 'Place Order \uD83D\uDD25';
  document.getElementById('placeOrderBtn').disabled = false;
}

document.getElementById('cartCheckoutBtn').addEventListener('click', openCheckout);
document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
checkoutOverlay.addEventListener('click', closeCheckout);

function goToStep(n) {
  currentStep = n;
  ['checkoutStep1','checkoutStep2','checkoutStep3'].forEach((id, i) => {
    document.getElementById(id).classList.toggle('hidden', i+1 !== n);
  });
  document.querySelectorAll('.checkout-step').forEach((s, i) => {
    s.classList.remove('active','done');
    if (i+1 === n) s.classList.add('active');
    else if (i+1 < n) s.classList.add('done');
  });
  checkoutModal.scrollTo(0, 0);
}

/* Step 1 validation */
document.getElementById('step1Next').addEventListener('click', () => {
  const required = ['firstName','lastName','address','city','zip','phone'];
  let valid = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add('error'); valid = false; }
    else el.classList.remove('error');
  });
  document.getElementById('step1Error').classList.toggle('hidden', valid);
  if (valid) goToStep(2);
});

/* Step 2 validation */
document.getElementById('step2Next').addEventListener('click', () => {
  const errEl = document.getElementById('step2Error');
  if (selectedPayMethod === 'card') {
    const required = ['cardName','cardNumber','cardExpiry','cardCvv'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) { el.classList.add('error'); valid = false; }
      else el.classList.remove('error');
    });
    errEl.classList.toggle('hidden', valid);
    if (!valid) return;
  } else {
    errEl.classList.add('hidden');
  }
  populateConfirm();
  goToStep(3);
});

document.getElementById('step2Back').addEventListener('click', () => goToStep(1));
document.getElementById('step3Back').addEventListener('click', () => goToStep(2));

/* Payment tabs */
document.querySelectorAll('.pay-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    selectedPayMethod = tab.dataset.pay;
    document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('payCard').classList.toggle('hidden', selectedPayMethod !== 'card');
    document.getElementById('payPaypal').classList.toggle('hidden', selectedPayMethod !== 'paypal');
    document.getElementById('payApple').classList.toggle('hidden', selectedPayMethod !== 'apple');
  });
});

/* Card number formatting */
document.getElementById('cardNumber').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'').substring(0,16);
  this.value = v.replace(/(.{4})/g,'$1 ').trim();
});
document.getElementById('cardExpiry').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'').substring(0,4);
  if (v.length >= 2) v = v.slice(0,2) + ' / ' + v.slice(2);
  this.value = v;
});

/* Populate confirm */
function populateConfirm() {
  const fn    = document.getElementById('firstName').value;
  const ln    = document.getElementById('lastName').value;
  const addr  = document.getElementById('address').value;
  const city  = document.getElementById('city').value;
  const zip   = document.getElementById('zip').value;
  const notes = document.getElementById('deliveryNotes').value;
  document.getElementById('confirmAddress').innerHTML =
    fn + ' ' + ln + '<br>' + addr + '<br>' + city + ', ' + zip +
    (notes ? '<br><em style="color:var(--smoke);font-size:.9em">' + notes + '</em>' : '');

  const payLabels = { card: 'Credit/Debit Card', paypal: 'PayPal', apple: 'Apple Pay' };
  let payDetail = payLabels[selectedPayMethod];
  if (selectedPayMethod === 'card') {
    const num = document.getElementById('cardNumber').value.replace(/\s/g,'');
    if (num.length >= 4) payDetail += ' \u2022\u2022\u2022\u2022 ' + num.slice(-4);
  }
  document.getElementById('confirmPayment').textContent = payDetail;

  const itemsEl = document.getElementById('confirmItems');
  itemsEl.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'confirm-item-row';
    row.innerHTML = '<span>' + item.name + ' \u00d7 ' + item.qty + '</span><span>$' + (item.price * item.qty).toFixed(2) + '</span>';
    itemsEl.appendChild(row);
  });

  const { sub, tax, grand } = calcTotals();
  document.getElementById('confirmSubtotal').textContent = '$' + sub.toFixed(2);
  document.getElementById('confirmTax').textContent      = '$' + tax.toFixed(2);
  document.getElementById('confirmTotal').textContent    = '$' + grand.toFixed(2);
}

/* Place order */
document.getElementById('placeOrderBtn').addEventListener('click', () => {
  const btn = document.getElementById('placeOrderBtn');
  btn.textContent = 'Processing\u2026';
  btn.disabled = true;
  setTimeout(() => {
    closeCheckout();
    openSuccess();
  }, 1400);
});

/* ─────────────────────────────────────────────────────
   SUCCESS MODAL
───────────────────────────────────────────────────── */
const successModal   = document.getElementById('successModal');
const successOverlay = document.getElementById('successOverlay');

function openSuccess() {
  const orderId = 'FN-' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('successOrderId').textContent = 'Order #' + orderId;
  successModal.classList.add('open');
  successOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  cart = [];
  renderCart();
}

document.getElementById('successDoneBtn').addEventListener('click', () => {
  successModal.classList.remove('open');
  successOverlay.classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('tracking').scrollIntoView({ behavior: 'smooth' });
});
