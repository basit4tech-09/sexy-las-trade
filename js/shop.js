/* ==========================================================================
   Shop — category filtering, sorting, result rendering
   ========================================================================== */

(function initShopPage() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return; // Not on the shop page

  let allProducts = [];
  let activeFilter = 'all';
  let activeSort = 'featured';

  async function init() {
    allProducts = (await SLTProducts.getProducts()) || [];
    applyUrlFilter();
    render();
    bindFilterChips();
    bindSort();
  }

  function applyUrlFilter() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (!category) return;

    const chip = document.querySelector(`.filter-chip[data-filter="${category}"]`);
    if (chip) {
      document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = category;
    }
  }

  function bindFilterChips() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeFilter = chip.dataset.filter;
        render();
      });
    });
  }

  function bindSort() {
    const select = document.getElementById('sort-select');
    if (!select) return;
    select.addEventListener('change', () => {
      activeSort = select.value;
      render();
    });
  }

  function getFilteredSorted() {
    let items = activeFilter === 'all'
      ? [...allProducts]
      : allProducts.filter((p) => p.category === activeFilter);

    switch (activeSort) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        items.sort((a, b) => (b.isNew === true) - (a.isNew === true));
        break;
      default:
        break; // 'featured' keeps data-file order
    }
    return items;
  }

  function render() {
    const items = getFilteredSorted();
    const emptyState = document.getElementById('shop-empty');
    const countEl = document.getElementById('result-count');

    if (items.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      if (countEl) countEl.textContent = '';
      return;
    }

    if (emptyState) emptyState.hidden = true;
    if (countEl) {
      countEl.textContent = `${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`;
    }

    grid.innerHTML = items.map(SLTProducts.cardTemplate).join('');
    bindQuickAddOnGrid(items);

    if (window.SLTRefreshReveals) window.SLTRefreshReveals();
  }

  function bindQuickAddOnGrid(items) {
    grid.querySelectorAll('[data-quick-add]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const product = items.find((p) => p.id === btn.dataset.quickAdd);
        if (product && window.SLTCart) {
          SLTCart.addItem(product, 1);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
