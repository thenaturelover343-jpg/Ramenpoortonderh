/* shop.js – Winkelwagen & checkout logica */

(function () {

  const products = {
    1: { id: 1, name: 'Aluminium Renovator Pro', price: 39.95, unit: '500ml' },
    2: { id: 2, name: 'PVC Opfrisser Intensief',  price: 29.95, unit: '750ml' },
    3: { id: 3, name: 'Inox Polijstmiddel',        price: 24.95, unit: '400ml' },
    4: { id: 4, name: 'Universele Beschermcoating', price: 49.95, unit: '1L'   },
  };

  const FREE_SHIPPING_THRESHOLD = 75;
  const SHIPPING_COST = 6.95;
  const STORAGE_KEY = 'rpo_cart';

  let cart = {};

  /* ── Persistence ── */
  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { cart = {}; }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  /* ── Cart count badge ── */
  function updateCartCount() {
    const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('#cartCount, .cart-count').forEach(el => {
      el.textContent = total;
    });
  }

  /* ── Subtotal calculation ── */
  function calcSubtotal() {
    return Object.values(cart).reduce((s, i) => s + i.qty * products[i.id].price, 0);
  }

  function fmtPrice(n) {
    return '€' + n.toFixed(2).replace('.', ',');
  }

  /* ── Add / remove / update qty ── */
  function addToCart(id) {
    id = Number(id);
    if (!products[id]) return;
    if (cart[id]) {
      cart[id].qty += 1;
    } else {
      cart[id] = { id, qty: 1 };
    }
    saveCart();
    updateCartCount();
    renderCart();
    openCart();
  }

  function removeFromCart(id) {
    delete cart[id];
    saveCart();
    updateCartCount();
    renderCart();
  }

  function updateQty(id, delta) {
    id = Number(id);
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart();
    updateCartCount();
    renderCart();
  }

  /* ── Render cart sidebar ── */
  function renderCart() {
    const itemsEl   = document.getElementById('cartItems');
    const footerEl  = document.getElementById('cartFooter');
    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingEl = document.getElementById('cartShippingNote');
    if (!itemsEl) return;

    const entries = Object.values(cart);

    if (entries.length === 0) {
      itemsEl.innerHTML = '<p class="cart-empty">Uw mandje is leeg.</p>';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    const productIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>`;

    itemsEl.innerHTML = entries.map(item => {
      const p = products[item.id];
      return `<div class="cart-item">
        <div class="cart-item__icon">${productIconSvg}</div>
        <div class="cart-item__info">
          <p class="cart-item__name">${p.name}</p>
          <p class="cart-item__price">${fmtPrice(p.price * item.qty)}</p>
          <div class="cart-item__controls">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Minder">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Meer">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-id="${item.id}" aria-label="${p.name} verwijderen">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>`;
    }).join('');

    const sub = calcSubtotal();
    if (subtotalEl) subtotalEl.textContent = fmtPrice(sub);
    if (shippingEl) {
      shippingEl.textContent = sub >= FREE_SHIPPING_THRESHOLD
        ? '✓ Gratis levering van toepassing!'
        : `Nog ${fmtPrice(FREE_SHIPPING_THRESHOLD - sub)} tot gratis levering.`;
    }
    if (footerEl) footerEl.style.display = 'flex';
  }

  /* ── Open / close cart ── */
  function openCart() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Checkout modal ── */
  function openCheckout() {
    closeCart();
    showStep('stepAddress');
    document.getElementById('checkoutOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    document.getElementById('checkoutOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showStep(id) {
    ['stepAddress', 'stepOverview', 'stepConfirm'].forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = s === id ? '' : 'none';
    });
  }

  /* ── Render order summary (step 2) ── */
  function renderOrderSummary() {
    const addr = {
      firstName: document.getElementById('coFirstName')?.value || '',
      lastName:  document.getElementById('coLastName')?.value  || '',
      email:     document.getElementById('coEmail')?.value     || '',
      street:    document.getElementById('coStreet')?.value    || '',
      number:    document.getElementById('coNumber')?.value    || '',
      zip:       document.getElementById('coZip')?.value       || '',
      city:      document.getElementById('coCity')?.value      || '',
      country:   document.getElementById('coCountry')?.value   || 'BE',
    };

    const countryNames = { BE: 'België', NL: 'Nederland', LU: 'Luxemburg' };

    const addrEl = document.getElementById('overviewAddress');
    if (addrEl) {
      addrEl.innerHTML = `<strong>Bezorgadres</strong>${addr.firstName} ${addr.lastName}<br>${addr.street} ${addr.number}<br>${addr.zip} ${addr.city}<br>${countryNames[addr.country] || addr.country}`;
    }

    const itemsEl = document.getElementById('overviewItems');
    if (itemsEl) {
      itemsEl.innerHTML = Object.values(cart).map(item => {
        const p = products[item.id];
        return `<div class="overview-item"><span>${p.name} × ${item.qty}</span><span>${fmtPrice(p.price * item.qty)}</span></div>`;
      }).join('');
    }

    const sub      = calcSubtotal();
    const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total    = sub + shipping;

    const ovSub      = document.getElementById('ovSubtotal');
    const ovShipping = document.getElementById('ovShipping');
    const ovTotal    = document.getElementById('ovTotal');
    if (ovSub)      ovSub.textContent      = fmtPrice(sub);
    if (ovShipping) ovShipping.textContent = shipping === 0 ? 'Gratis' : fmtPrice(shipping);
    if (ovTotal)    ovTotal.textContent    = fmtPrice(total);
  }

  /* ── Render confirmation (step 3) ── */
  function renderConfirmation() {
    const email    = document.getElementById('coEmail')?.value || '';
    const orderRef = 'RPO-' + Date.now().toString(36).toUpperCase().slice(-6);

    const confirmEmailEl = document.getElementById('confirmEmail');
    if (confirmEmailEl) confirmEmailEl.textContent = `Een bevestigingsmail wordt verzonden naar ${email}.`;

    const orderRefEl = document.getElementById('orderRef');
    if (orderRefEl) orderRefEl.textContent = orderRef;

    cart = {};
    saveCart();
    updateCartCount();
  }

  /* ── Form validation ── */
  function validateAddress() {
    const required = ['coFirstName', 'coLastName', 'coEmail', 'coStreet', 'coNumber', 'coZip', 'coCity'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const empty = !el.value.trim();
      el.classList.toggle('error', empty);
      if (empty) valid = false;
    });
    return valid;
  }

  /* ── DOM wiring ── */
  document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();
    renderCart();

    /* "In mandje" buttons */
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn.dataset.id));
    });

    /* Cart toggle buttons */
    document.querySelectorAll('.cart-toggle-btn').forEach(btn => {
      btn.addEventListener('click', openCart);
    });

    /* Close cart */
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

    /* Qty and remove in cart (delegated) */
    document.getElementById('cartItems')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      const rem = e.target.closest('.cart-item__remove');
      if (btn) updateQty(btn.dataset.id, btn.dataset.action === 'inc' ? 1 : -1);
      if (rem) removeFromCart(rem.dataset.id);
    });

    /* Go to checkout */
    document.getElementById('toCheckoutBtn')?.addEventListener('click', openCheckout);

    /* Address form submit → go to step 2 */
    document.getElementById('addressForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateAddress()) return;
      renderOrderSummary();
      showStep('stepOverview');
    });

    /* Back to address */
    document.getElementById('backToAddressBtn')?.addEventListener('click', () => showStep('stepAddress'));

    /* Place order → step 3 */
    document.getElementById('placeOrderBtn')?.addEventListener('click', () => {
      renderConfirmation();
      showStep('stepConfirm');
    });

    /* Close checkout */
    ['checkoutClose', 'checkoutClose2', 'checkoutClose3'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', closeCheckout);
    });

    document.getElementById('confirmCloseBtn')?.addEventListener('click', closeCheckout);

    /* Close checkout on overlay click */
    document.getElementById('checkoutOverlay')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('checkoutOverlay')) closeCheckout();
    });

    /* Close cart/checkout on Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeCart();
      closeCheckout();
    });
  });

})();
