/* ==========================================================================
   Cart — add/remove/update items, persisted in localStorage
   Exposes window.SLTCart for use by products.js and order.js
   ========================================================================== */

window.SLTCart = (function () {
  const STORAGE_KEY = 'slt_cart';

  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Cart read failed, starting fresh.', err);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn('Cart save failed.', err);
    }
    renderCart();
    updateCartCount();
  }

  function addItem(product, qty = 1) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        qty,
      });
    }
    saveCart(cart);
    showToast(`${product.name} added to bag`);
  }

  function removeItem(id) {
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
  }

  function updateQty(id, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    item.qty = qty;
    const updated = item.qty <= 0 ? cart.filter((i) => i.id !== id) : cart;
    saveCart(updated);
  }

  function clearCart() {
    saveCart([]);
  }

  function getSubtotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function formatNaira(amount) {
    return '₦' + amount.toLocaleString('en-NG');
  }

  function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;
    const totalQty = getCart().reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = String(totalQty);
    countEl.hidden = totalQty === 0;
  }

  function renderCart() {
    const itemsEl = document.getElementById('cart-items');
    const footerEl = document.getElementById('cart-footer');
    const subtotalEl = document.getElementById('cart-subtotal');
    if (!itemsEl) return;

    const cart = getCart();

    if (cart.length === 0) {
      itemsEl.innerHTML = '<div class="cart-drawer__empty">Your bag is empty.<br>Start exploring the shop.</div>';
      if (footerEl) footerEl.hidden = true;
      return;
    }

    itemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item__image">
        <div class="cart-item__details">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__meta">${item.category}</p>
          <div class="cart-item__row">
            <div class="qty-control">
              <button type="button" data-action="decrease" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button type="button" data-action="increase" aria-label="Increase quantity">+</button>
            </div>
            <span class="product-card__price">${formatNaira(item.price * item.qty)}</span>
          </div>
          <button type="button" class="cart-item__remove" data-action="remove">Remove</button>
        </div>
      </div>
    `
      )
      .join('');

    if (footerEl) footerEl.hidden = false;
    if (subtotalEl) subtotalEl.textContent = formatNaira(getSubtotal());
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  // Delegate quantity/remove clicks inside the cart drawer
  document.addEventListener('click', (e) => {
    const cartItem = e.target.closest('.cart-item');
    if (!cartItem) return;

    const id = cartItem.dataset.id;
    const action = e.target.dataset.action;
    if (!action) return;

    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (action === 'increase') updateQty(id, item.qty + 1);
    if (action === 'decrease') updateQty(id, item.qty - 1);
    if (action === 'remove') removeItem(id);
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartCount();
  });

  return {
    getCart,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    getSubtotal,
    formatNaira,
    renderCart,
    updateCartCount,
  };
})();
