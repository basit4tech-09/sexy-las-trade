/* ==========================================================================
   Order — checkout modal, FormSubmit capture + WhatsApp handoff
   ========================================================================== */

window.SLTOrder = (function () {
  // TODO: replace with the real seller WhatsApp number (international format, no + or spaces)
  const SELLER_WHATSAPP = '2347038376072';
  // TODO: replace with the real seller email — this is where FormSubmit sends order records
  const FORMSUBMIT_EMAIL = 'Hellosexylas@gmail.com';

  function buildModal() {
    if (document.getElementById('checkout-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'checkout-overlay';
    overlay.id = 'checkout-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'checkout-modal-title');
    overlay.innerHTML = `
      <div class="checkout-modal">
        <div class="checkout-modal__header">
          <h3 id="checkout-modal-title">Confirm Your Order</h3>
          <button type="button" id="checkout-close" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <p class="checkout-modal__summary" id="checkout-summary"></p>
        <form id="checkout-form" action="https://formsubmit.co/${FORMSUBMIT_EMAIL}" method="POST">
          <input type="hidden" name="_subject" value="New order — Sexy Las Trade">
          <input type="hidden" name="_captcha" value="false">
          <input type="hidden" name="_template" value="table">
          <input type="hidden" name="order_summary" id="order-summary-field">

          <div class="form-group">
            <label for="customer-name">Full Name</label>
            <input type="text" id="customer-name" name="Full Name" required>
          </div>
          <div class="form-group">
            <label for="customer-phone">Phone Number</label>
            <input type="tel" id="customer-phone" name="Phone Number" required>
          </div>
          <div class="form-group">
            <label for="customer-address">Delivery Address</label>
            <textarea id="customer-address" name="Delivery Address" required></textarea>
          </div>
          <button type="submit" class="btn btn--primary btn--full">Send Order &amp; Open WhatsApp</button>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('checkout-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    document.getElementById('checkout-form').addEventListener('submit', handleSubmit);
  }

  function openModal() {
    const cart = SLTCart.getCart();
    if (cart.length === 0) return;

    buildModal();

    const summaryEl = document.getElementById('checkout-summary');
    const itemLines = cart.map((i) => `${i.qty}× ${i.name} — ${SLTCart.formatNaira(i.price * i.qty)}`);
    summaryEl.innerHTML = `${itemLines.join('<br>')}<br><strong>Total: ${SLTCart.formatNaira(SLTCart.getSubtotal())}</strong>`;

    document.getElementById('checkout-overlay').classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('checkout-overlay');
    if (overlay) overlay.classList.remove('is-open');

    // Only release the scroll lock if the cart drawer isn't also open behind it
    const cartDrawer = document.getElementById('cart-drawer');
    const cartStillOpen = cartDrawer && cartDrawer.classList.contains('is-open');
    if (!cartStillOpen) {
      document.body.style.overflow = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const cart = SLTCart.getCart();
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();

    if (!name || !phone || !address || cart.length === 0) return;

    const itemLines = cart.map((i) => `• ${i.qty}x ${i.name} (${SLTCart.formatNaira(i.price)} each)`).join('\n');
    const summaryText = `New Order\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nItems:\n${itemLines}\n\nTotal: ${SLTCart.formatNaira(SLTCart.getSubtotal())}`;

    document.getElementById('order-summary-field').value = summaryText;

    const form = e.target;
    const formData = new FormData(form);

    // Submit order record to FormSubmit in the background
    fetch(form.action, { method: 'POST', body: formData })
      .catch((err) => console.warn('Order record submission failed:', err))
      .finally(() => {
        const whatsappMessage = encodeURIComponent(summaryText);
        window.open(`https://wa.me/${SELLER_WHATSAPP}?text=${whatsappMessage}`, '_blank');
        SLTCart.clearCart();
        closeModal();
        form.reset();
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', openModal);
  });

  return { openModal, closeModal };
})();
