/* ==========================================================================
   Products — fetches product data, renders grids, wires Quick Add
   ========================================================================== */

window.SLTProducts = (function () {
  let productCache = null;

  async function getProducts() {
    if (productCache) return productCache;
    try {
      const res = await fetch('data/products.json');
      const data = await res.json();
      productCache = data.products;
      return productCache;
    } catch (err) {
      console.warn('Product data failed to load, keeping static fallback.', err);
      return null;
    }
  }

  function formatNaira(amount) {
    return '₦' + amount.toLocaleString('en-NG');
  }

  function cardTemplate(product) {
    return `
      <article class="product-card viewfinder" data-reveal>
        <a href="shop.html#${product.id}" class="product-card__image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.isNew ? '<span class="product-card__badge">New</span>' : ''}
          <button type="button" class="product-card__quick-add" data-quick-add="${product.id}">Quick Add</button>
        </a>
        <p class="product-card__category">${product.category}</p>
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">${formatNaira(product.price)}</p>
      </article>
    `;
  }

  async function renderNewArrivals() {
    const grid = document.getElementById('new-arrivals-grid');
    if (!grid) return;

    const products = await getProducts();
    if (!products) return; // keep static fallback markup

    const newItems = products.filter((p) => p.isNew).slice(0, 4);
    if (newItems.length === 0) return;

    grid.innerHTML = newItems.map(cardTemplate).join('');
    bindQuickAdd(products);

    // Re-run reveal observer on freshly injected cards
    if (window.SLTRefreshReveals) window.SLTRefreshReveals();
  }

  async function renderFullGrid(targetId, filterFn) {
    const grid = document.getElementById(targetId);
    if (!grid) return;

    const products = await getProducts();
    if (!products) return;

    const items = filterFn ? products.filter(filterFn) : products;
    grid.innerHTML = items.map(cardTemplate).join('');
    bindQuickAdd(products);

    if (window.SLTRefreshReveals) window.SLTRefreshReveals();
  }

  function bindQuickAdd(products) {
    document.querySelectorAll('[data-quick-add]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const product = products.find((p) => p.id === btn.dataset.quickAdd);
        if (product && window.SLTCart) {
          SLTCart.addItem(product, 1);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderNewArrivals();
  });

  return { getProducts, renderFullGrid, cardTemplate, formatNaira };
})();
