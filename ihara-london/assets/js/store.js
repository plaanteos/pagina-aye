/* Ihara & London Store JS - Enhanced Version */
(function(){
  const state = { 
    cart: [], 
    favorites: [], 
    step: 1, 
    shippingMethod: null, 
    paymentMethod: null, 
    loading: false,
    searchQuery: '',
    currentFilters: {
      category: 'todos',
      priceRange: 'all',
      material: 'all',
      sortBy: 'featured'
    }
  };
  const els = {};
  let lastFocusedBeforeModal = null;
  let products = [];
  
  document.addEventListener('DOMContentLoaded', init);

  function qs(sel, ctx=document){ return ctx.querySelector(sel); }
  function qsa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }
  function money(n){ return '€'+Number(n).toFixed(2); }

  function init(){
    cacheDom();
    bindGlobal();
    enhanceProducts();
    initSmoothScroll();
    renderFavorites();
    loadPersisted();
    initColorSelection();
    initSizeSelection();
    initSizeGuide();
    initNewsletter();
    initSearch();
    initAdvancedFilters();
    initBreadcrumbs();
    updateCartUI();
    showStep(1);
    loadProductData();
    initializeFAQ();
    initializeBlog();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeMapFunctionality();
  }

  function initSearch() {
    const searchInput = qs('#searchInput');
    const searchButton = qs('#searchButton');
    
    if (searchInput) {
      searchInput.addEventListener('input', debounce(handleSearch, 300));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearch();
        }
      });
    }
    
    if (searchButton) {
      searchButton.addEventListener('click', handleSearch);
    }
  }

  function handleSearch() {
    const searchInput = qs('#searchInput');
    if (!searchInput) return;
    
    state.searchQuery = searchInput.value.toLowerCase().trim();
    filterProducts();
    
    // Update breadcrumbs
    updateBreadcrumbs(state.searchQuery ? `Búsqueda: "${state.searchQuery}"` : 'Productos');
  }

  function initAdvancedFilters() {
    const priceRange = qs('#priceRange');
    const sortBy = qs('#sortBy');
    const material = qs('#material');
    
    [priceRange, sortBy, material].forEach(select => {
      if (select) {
        select.addEventListener('change', (e) => {
          state.currentFilters[e.target.id] = e.target.value;
          filterProducts();
        });
      }
    });
  }

  function initBreadcrumbs() {
    // Show breadcrumbs when not on home section
    const observer = new IntersectionObserver((entries) => {
      const breadcrumbNav = qs('.breadcrumb-nav');
      if (!breadcrumbNav) return;
      
      const homeSection = entries.find(entry => entry.target.id === 'home');
      if (homeSection) {
        breadcrumbNav.style.display = homeSection.isIntersecting ? 'none' : 'block';
      }
    }, { threshold: 0.1 });
    
    const sections = qsa('section[id]');
    sections.forEach(section => observer.observe(section));
  }

  function updateBreadcrumbs(sectionName) {
    const currentSection = qs('#currentSection');
    if (currentSection) {
      currentSection.textContent = sectionName;
    }
  }

  function loadProductData() {
    // Simulate loading product data
    products = qsa('.product-card').map(card => ({
      element: card,
      name: qs('h3', card)?.textContent || '',
      price: parseFloat(card.dataset.price) || 0,
      category: card.dataset.category || '',
      material: card.dataset.material || '',
      rating: parseFloat(card.dataset.rating) || 0,
      description: qs('.product-description', card)?.textContent || ''
    }));
  }

  function filterProducts() {
    products.forEach(product => {
      let show = true;
      
      // Search filter
      if (state.searchQuery) {
        const searchableText = (product.name + ' ' + product.description).toLowerCase();
        show = show && searchableText.includes(state.searchQuery);
      }
      
      // Category filter
      if (state.currentFilters.category !== 'todos') {
        show = show && product.category === state.currentFilters.category;
      }
      
      // Price filter
      if (state.currentFilters.priceRange !== 'all') {
        const [min, max] = state.currentFilters.priceRange.split('-').map(Number);
        if (max) {
          show = show && product.price >= min && product.price <= max;
        } else {
          show = show && product.price >= min;
        }
      }
      
      // Material filter
      if (state.currentFilters.material !== 'all') {
        show = show && product.material === state.currentFilters.material;
      }
      
      // Show/hide product
      product.element.style.display = show ? 'block' : 'none';
      
      if (show) {
        product.element.classList.add('reveal');
      }
    });
    
    // Sort visible products
    sortProducts();
  }

  function sortProducts() {
    const grid = qs('.product-grid');
    if (!grid) return;
    
    const visibleProducts = products.filter(p => p.element.style.display !== 'none');
    
    visibleProducts.sort((a, b) => {
      switch (state.currentFilters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          // Simulate newest (could be based on data-date if available)
          return Math.random() - 0.5;
        default: // featured
          return 0;
      }
    });
    
    // Reorder DOM elements
    visibleProducts.forEach(product => {
      grid.appendChild(product.element);
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Enhanced product card interactions
  function enhanceProducts() {
    qsa('.product-card').forEach(card => {
      // Quick view functionality
      const quickViewBtn = qs('.quick-view-btn', card);
      if (quickViewBtn) {
        quickViewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openQuickView(card);
        });
      }
      
      // Favorite functionality
      const favoriteBtn = qs('.favorite-btn', card);
      if (favoriteBtn) {
        favoriteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFavorite(card);
        });
      }
      
      // Rating display enhancement
      const rating = parseFloat(card.dataset.rating);
      if (rating) {
        updateStarDisplay(card, rating);
      }
    });
  }

  function openQuickView(productCard) {
    // Create modal for quick view
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="quick-view-content">
          ${productCard.innerHTML}
          <div class="quick-view-actions">
            <button class="btn-primary">Agregar al Carrito</button>
            <button class="btn-secondary">Ver Detalles</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // Close functionality
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
        closeModal(modal);
      }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal(modal);
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }

  function toggleFavorite(productCard) {
    const favoriteBtn = qs('.favorite-btn', productCard);
    const productName = qs('h3', productCard)?.textContent;
    
    if (favoriteBtn.classList.contains('active')) {
      favoriteBtn.classList.remove('active');
      favoriteBtn.innerHTML = '♡';
      // Remove from favorites
      state.favorites = state.favorites.filter(fav => fav.name !== productName);
    } else {
      favoriteBtn.classList.add('active');
      favoriteBtn.innerHTML = '♥';
      // Add to favorites
      const productData = {
        name: productName,
        price: qs('.current-price', productCard)?.textContent,
        image: qs('.product-image', productCard)?.src
      };
      state.favorites.push(productData);
    }
    
    updateFavoritesCount();
    persistState();
  }

  function updateStarDisplay(card, rating) {
    const starsElement = qs('.stars', card);
    if (!starsElement) return;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    starsElement.innerHTML = 
      '★'.repeat(fullStars) + 
      (hasHalfStar ? '☆' : '') + 
      '☆'.repeat(emptyStars);
  }

  function updateFavoritesCount() {
    const favoritesCount = qs('.favorites-count');
    if (favoritesCount) {
      favoritesCount.textContent = state.favorites.length;
    }
  }

  function persistState() {
    localStorage.setItem('ihara-london-state', JSON.stringify({
      cart: state.cart,
      favorites: state.favorites
    }));
  }

  function loadPersisted() {
    try {
      const saved = localStorage.getItem('ihara-london-state');
      if (saved) {
        const data = JSON.parse(saved);
        state.cart = data.cart || [];
        state.favorites = data.favorites || [];
        updateFavoritesCount();
      }
    } catch (e) {
      // Silently handle storage errors
    }
  }

  function initColorSelection(){
    qsa('.product-card').forEach(card=>{
      const colorOpts = qsa('.color-option', card);
      colorOpts.forEach(opt=>{
        // Añadir data-label para tooltip si falta
        if(!opt.dataset.label){
          const cls = Array.from(opt.classList).find(c=> c.startsWith('color-')) || '';
          opt.dataset.label = cls.replace('color-','').replace(/-/g,' ').replace(/\b\w/g, m=> m.toUpperCase());
        }
        opt.addEventListener('click', ()=>{
          colorOpts.forEach(o=> o.classList.remove('active'));
            opt.classList.add('active');
        });
      });
    });
  }
  // Selección de talle
  function initSizeSelection(){
    qsa('.product-card').forEach(card=>{
      const sizeOpts = qsa('.size-option', card);
      sizeOpts.forEach(opt=>{
        opt.addEventListener('click', ()=>{
          sizeOpts.forEach(o=> o.classList.remove('active'));
          opt.classList.add('active');
        });
      });
      // Asignar activo por defecto si ninguno
      if(sizeOpts.length && !card.querySelector('.size-option.active')) sizeOpts[0].classList.add('active');
    });
  }
  function getSelectedSize(card){
    const sel = card.querySelector('.size-select-input');
    if(sel) return sel.value;
    const active = card.querySelector('.size-option.active');
    if(active) return active.textContent.trim();
    return null;
  }
  // NUEVO: obtener color seleccionado del producto
  function getSelectedColor(card){
    const active = card.querySelector('.color-option.active');
    if(!active) return null;
    const cls = Array.from(active.classList).find(c=> c.startsWith('color-')) || '';
    const label = cls ? cls.replace('color-','').replace(/-/g,' ').replace(/\b\w/g, m=> m.toUpperCase()) : 'Color';
    return { className: cls, label };
  }

  function loadPersisted(){
    try {
      const savedCart = JSON.parse(localStorage.getItem('ihara_cart')||'[]');
      const savedFavs = JSON.parse(localStorage.getItem('ihara_favorites')||'[]');
      if(Array.isArray(savedCart)) state.cart = savedCart.map(i=>({...i}));
      if(Array.isArray(savedFavs)) state.favorites = savedFavs.map(i=>({...i}));
      updateFavoritesCount();
      highlightFavoriteButtons();
      renderFavorites();
    } catch(e){ /* Silently handle */ }
  }

  function persist(){
    try {
      localStorage.setItem('ihara_cart', JSON.stringify(state.cart));
      localStorage.setItem('ihara_favorites', JSON.stringify(state.favorites));
    } catch(e){ /* ignorar cuota */ }
  }
  function persistSizesMap(map){ try { localStorage.setItem('ihara_last_sizes', JSON.stringify(map)); }catch(e){} }
  function loadSizesMap(){ try { return JSON.parse(localStorage.getItem('ihara_last_sizes')||'{}'); }catch(e){ return {}; } }

  function cacheDom(){
    els.cartButton = qs('#cartButton');
    els.cartSidebar = qs('#cartSidebar');
    els.cartItems = qs('#cartItems');
    els.cartCount = qs('.cart-count');
    els.cartTotal = qs('#cartTotalAmount');
    els.closeCart = qs('#closeCart');
    els.checkoutBtn = qs('#checkoutBtn');
    els.checkoutModal = qs('#checkoutModal');
    els.closeCheckout = qs('#closeCheckout');
    els.prevStep = qs('#prevStep');
    els.nextStep = qs('#nextStep');
    els.summaryItems = qs('#summaryItems');
    els.summarySubtotal = qs('#summarySubtotal');
    els.summaryShipping = qs('#summaryShipping');
    els.summaryTotal = qs('#summaryTotal');
    els.shippingAddress = qs('#shippingAddress');
    els.cardForm = qs('#cardForm');
    els.transferInfo = qs('#transferInfo');
    els.favoritesButton = qs('#favoritesButton');
    els.favoritesSidebar = qs('#favoritesSidebar');
    els.closeFavorites = qs('#closeFavorites');
    els.favoritesItems = qs('#favoritesItems');
    els.favoritesCount = qs('.favorites-count');
    els.stepIndicator = buildStepIndicator();
  }

  function buildStepIndicator(){
    const container = qs('.checkout-content .step-indicator');
    if(container) return container; // already exists
    const holder = document.createElement('div');
    holder.className = 'step-indicator';
    ['Entrega','Contacto','Pago','Resumen'].forEach((t,i)=>{
      const s = document.createElement('span');
      s.dataset.step = i+1; s.innerHTML = `<strong>${i+1}</strong> ${t}`; holder.appendChild(s);
    });
    qs('.checkout-content')?.insertBefore(holder, qs('.checkout-steps'));
    return holder;
  }

  function bindGlobal(){
    els.cartButton?.addEventListener('click', ()=> els.cartSidebar.classList.add('active'));
    els.closeCart?.addEventListener('click', ()=> els.cartSidebar.classList.remove('active'));
    els.favoritesButton?.addEventListener('click', ()=> els.favoritesSidebar?.classList.add('active'));
    els.closeFavorites?.addEventListener('click', ()=> els.favoritesSidebar?.classList.remove('active'));
    els.checkoutBtn?.addEventListener('click', ()=>{ if(!state.cart.length) return notify('El carrito está vacío'); openCheckout(); });
    els.closeCheckout?.addEventListener('click', closeCheckout);
    els.prevStep?.addEventListener('click', ()=>{ if(state.step>1) showStep(state.step-1); });
    els.nextStep?.addEventListener('click', ()=> advance());
    qsa('input[name="shipping"]').forEach(r=> r.addEventListener('change', e=>{ state.shippingMethod=e.target.value; toggleShippingFields(); updateSummary(); }));
    qsa('input[name="payment"]').forEach(r=> r.addEventListener('change', e=>{ state.paymentMethod=e.target.value; togglePaymentFields(); }));
    // Toggle menú móvil
    const navToggle = qs('#navToggle');
    const navLinks = qs('.nav-links');
    navToggle?.addEventListener('click', ()=>{
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', open?'true':'false');
    });
    navLinks?.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{ if(window.innerWidth<880){ navLinks.classList.remove('open'); navToggle?.classList.remove('active'); navToggle?.setAttribute('aria-expanded','false'); } }));
    // Tema (dark/light)
    const themeBtn = qs('#themeToggle');
    const savedTheme = localStorage.getItem('ihara_theme');
    if(savedTheme==='dark') document.body.classList.add('dark');
    themeBtn?.addEventListener('click', ()=>{
      document.body.classList.toggle('dark');
      localStorage.setItem('ihara_theme', document.body.classList.contains('dark')?'dark':'light');
    });
  }

  function enhanceProducts(){
    const defaultSizes = ['XS','S','M','L','XL'];
    const sizeMap = loadSizesMap();
    qsa('.product-card').forEach((card, i)=>{
      if(card.dataset.enhanced) return;
      const name = card.querySelector('h3')?.textContent?.trim()||`Producto ${i+1}`;
      const priceEl = card.querySelector('.product-price, .price');
      const price = priceEl? parseFloat(priceEl.textContent.replace(/[^0-9.,]/g,'').replace(',','.')):0;
      const img = card.querySelector('img')?.src || '';
  const info = card.querySelector('.product-info') || card;
  const imgContainer = card.querySelector('.product-image') || card;
      // Insertar selector de talles si no existe
      if(!info.querySelector('.size-select-input')){
        const sizeWrap = document.createElement('div');
        sizeWrap.className='product-size-select';
        const slug = slugify(name);
        sizeWrap.innerHTML = `<label class="size-label" style="font-size:.6rem;font-weight:600;letter-spacing:.5px;text-transform:uppercase;display:inline-flex;align-items:center;gap:.4rem;">Talle<select aria-label="Seleccionar talle para ${escapeHtml(name)}" class="size-select-input" data-product-slug="${slug}" style="padding:.4rem .55rem;border:1px solid var(--light-brown);border-radius:8px;font-size:.65rem;">${defaultSizes.map(s=>`<option value="${s}">${s}</option>`).join('')}</select><button type="button" class="size-guide-link" data-open-size-guide title="Guía de talles" style="background:none;border:none;color:var(--gold-accent);cursor:pointer;font-size:.65rem;font-weight:600;letter-spacing:.5px;">Guía</button></label>`;
        const addBtn = info.querySelector('.add-to-cart');
        if(addBtn) info.insertBefore(sizeWrap, addBtn); else info.appendChild(sizeWrap);
        // Restaurar talle previo
        const sel = sizeWrap.querySelector('.size-select-input');
        if(sizeMap[slug]) sel.value = sizeMap[slug];
        sel.addEventListener('change', ()=>{
          const map = loadSizesMap();
          map[slug] = sel.value;
          persistSizesMap(map);
        });
      }
      // Si ya existe un botón add-to-cart en el HTML, no crear otro; si existe, reutilizarlo
      let cartBtn = info.querySelector('.add-to-cart');
      if(!cartBtn){
        cartBtn = document.createElement('button');
        cartBtn.type='button';
        cartBtn.className='add-to-cart';
        cartBtn.innerHTML='<span>Agregar al Carrito</span>';
        info.appendChild(cartBtn);
      }
      cartBtn.addEventListener('click',()=> {
        const color = getSelectedColor(card);
        const size = getSelectedSize(card);
        if(card.querySelector('.size-select-input') && !size){
          notify('Selecciona un talle');
          card.querySelector('.size-select-input')?.focus();
          return;
        }
        const availableColors = qsa('.color-option', card).map(c=>{
          const cls = Array.from(c.classList).find(k=> k.startsWith('color-')) || '';
          const label = c.dataset.label || cls.replace('color-','').replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
          return { className: cls, label };
        });
        addToCart({ id: genProductId(card,i), name, price, image:img, color, size, availableColors, availableSizes: defaultSizes });
      });
      // Botón favoritos
      let favBtn = card.querySelector('.favorite-btn');
      if(!favBtn){
        favBtn = document.createElement('button');
        favBtn.type='button';
        favBtn.className='favorite-btn';
        favBtn.setAttribute('aria-label','Agregar a favoritos');
        favBtn.innerHTML='❤';
        imgContainer.appendChild(favBtn);
      } else if(!favBtn.parentElement.classList.contains('product-image')) {
        imgContainer.appendChild(favBtn);
      }
      favBtn.addEventListener('click',()=> toggleFavorite({ id: genProductId(card,i), name, price, image:img }));
      card.dataset.enhanced='1';
    });
  }

  function genProductId(card,i){
    if(card.dataset.pid) return Number(card.dataset.pid);
    const id = Date.now()+i + Math.floor(Math.random()*1000);
    card.dataset.pid = id;
    return id;
  }

  /* Favoritos */
  function toggleFavorite(prod){
    const idx = state.favorites.findIndex(f=>f.id===prod.id);
    if(idx>-1){ state.favorites.splice(idx,1); notify('Quitado de favoritos'); }
    else {
      // Capturar posibles colores del producto original
      const card = document.querySelector(`.product-card[data-pid='${prod.id}']`);
      let colors = []; let selectedColor = null;
      let sizes = []; let selectedSize = null;
      if(card){
        colors = qsa('.color-option', card).map(c=>{
          const cls = Array.from(c.classList).find(k=> k.startsWith('color-')) || '';
          const label = c.dataset.label || cls.replace('color-','').replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
          if(c.classList.contains('active')) selectedColor = { className: cls, label };
          return { className: cls, label };
        });
        sizes = qsa('.size-option', card).map(s=> s.textContent.trim());
        const sAct = card.querySelector('.size-option.active');
        if(sAct) selectedSize = sAct.textContent.trim();
      }
      state.favorites.push({...prod, colors, selectedColor, sizes, selectedSize});
      notify('Agregado a favoritos');
    }
    renderFavorites();
    highlightFavoriteButtons();
    updateFavoritesCount();
  persist();
  }
  function highlightFavoriteButtons(){
    qsa('.product-card').forEach(card=>{
      const pid = Number(card.dataset.pid);
      const isFav = state.favorites.some(f=>f.id===pid);
      const btn = card.querySelector('.favorite-btn');
      if(btn){
        const wasActive = btn.classList.contains('active');
        btn.classList.toggle('active', isFav);
        btn.style.color = isFav ? 'var(--primary-black)':'var(--gold-accent)';
        if(isFav && !wasActive){ btn.classList.add('pulse'); setTimeout(()=> btn.classList.remove('pulse'), 650); }
      }
    });
  }
  function renderFavorites(){
    if(els.favoritesItems) els.favoritesItems.innerHTML='';
    const grid = qs('#favoritesGrid'); const empty = qs('#favoritesEmpty');
    if(grid) grid.innerHTML='';
    if(!state.favorites.length){
      if(empty) empty.style.display='block';
      if(els.favoritesItems) els.favoritesItems.innerHTML='<div class="empty-cart">Sin favoritos</div>';
      return;
    } else if(empty) empty.style.display='none';
    state.favorites.forEach(item=>{
      const favRow = document.createElement('div');
      favRow.className='cart-item';
      const colorDots = (item.colors && item.colors.length) ? `<div class='favorites-color-options'>${item.colors.map(c=>`<span class="color-option ${c.className} ${item.selectedColor && item.selectedColor.className===c.className ? 'active' : ''}" data-color="${c.className}" data-label="${escapeHtml(c.label)}"></span>`).join('')}</div>` : '';
  const sizeSelect = (item.sizes && item.sizes.length) ? `<div class='favorites-size-select'><label style='font-size:.55rem;letter-spacing:.5px;font-weight:600;text-transform:uppercase;'>Talle <select class="fav-size-select" style='padding:.3rem .4rem;border:1px solid var(--light-brown);border-radius:6px;font-size:.6rem;'>${item.sizes.map(s=>`<option value="${s}" ${item.selectedSize===s?'selected':''}>${s}</option>`).join('')}</select></label></div>`:'';
  favRow.innerHTML = `<div class="cart-item-details"><div class="cart-item-title">${escapeHtml(item.name)}</div><div class="cart-item-price">${money(item.price)}</div>${colorDots}${sizeSelect}<div class="quantity-controls"><button data-act="add" title="Añadir al carrito">🛒</button><button data-act="remove" class="remove-item" title="Quitar">✕</button></div></div>`;
  favRow.querySelector('[data-act="add"]').addEventListener('click',()=> addToCart({...item, color:item.selectedColor || null, size:item.selectedSize || (favRow.querySelector('.fav-size-select')?.value)||null}));
      favRow.querySelector('[data-act="remove"]').addEventListener('click',()=> toggleFavorite(item));
      // Selección de color en favoritos
      favRow.querySelectorAll('.favorites-color-options .color-option').forEach(dot=>{
        dot.addEventListener('click',()=>{
          const cls = dot.dataset.color;
          const label = dot.dataset.label || cls;
          item.selectedColor = { className: cls, label };
          favRow.querySelectorAll('.favorites-color-options .color-option').forEach(d=> d.classList.toggle('active', d===dot));
        });
      });
  // Cambio de talle en favoritos
  favRow.querySelector('.fav-size-select')?.addEventListener('change', e=>{ item.selectedSize = e.target.value; });
      els.favoritesItems?.appendChild(favRow);
      if(grid){
        const card = document.createElement('div');
        card.className='product-card reveal'; card.dataset.pid = item.id;
        card.innerHTML = `<div class="product-image"><button class="favorite-btn active" aria-label="Quitar">❤</button>${item.image?`<img src="${item.image}" alt="${escapeHtml(item.name)}"/>`: ''}</div><div class="product-info"><h3>${escapeHtml(item.name)}</h3><div class="product-price">${money(item.price)}</div><button class="add-to-cart" title="Añadir al carrito"><span>🛒</span></button></div>`;
        card.querySelector('.add-to-cart').addEventListener('click',()=> addToCart(item));
        card.querySelector('.favorite-btn').addEventListener('click',()=> toggleFavorite(item));
        grid.appendChild(card);
      }
    });
  }

  function updateFavoritesCount(){ if(els.favoritesCount) els.favoritesCount.textContent = state.favorites.length; }

  /* Smooth Scroll */
  function initSmoothScroll(){
    qsa('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const targetId = a.getAttribute('href');
        if(targetId && targetId.startsWith('#') && targetId.length>1){
          const t = qs(targetId);
          if(t){ e.preventDefault(); t.scrollIntoView({ behavior:'smooth'}); }
        }
      });
    });
  }

  /* Cart Logic */
  function addToCart(product){
    const colorKey = product.color?.className || '';
    const sizeKey = product.size || '';
    const existing = state.cart.find(i=> i.id===product.id && (i.color?.className||'')===colorKey && (i.size||'')===sizeKey);
    if(existing) existing.quantity +=1; else state.cart.push({...product, quantity:1});
    updateCartUI();
    notify('Producto agregado');
  persist();
  }
  window.addToCart = addToCart;

  function updateCartUI(){
    if(!els.cartItems) return;
    els.cartItems.innerHTML='';
    if(!state.cart.length){
      els.cartItems.innerHTML='<div class="empty-cart">Tu carrito está vacío</div>';
    } else {
      state.cart.forEach(item=>{
        const row=document.createElement('div');
        row.className='cart-item';
        row.innerHTML=`<img class="cart-item-img" src="${item.image}" alt="${escapeHtml(item.name)}"/>
<div class="cart-item-details">
  <div class="cart-item-title">${escapeHtml(item.name)}</div>
  <div class="cart-item-price">${money(item.price)}</div>
  <div class="cart-item-variant">${item.color ? `<span class=\"color-option ${item.color.className}\" style=\"width:14px;height:14px;pointer-events:none;display:inline-block;border:1px solid #ccc;border-radius:50%;vertical-align:middle;\"></span> <span style=\"font-size:.65rem;vertical-align:middle;\">${escapeHtml(item.color.label)}</span>`:''}${item.size?` <span class=\"size-badge\" style=\"background:#eee;border-radius:6px;padding:2px 6px;font-size:.55rem;margin-left:.4rem;\">${escapeHtml(item.size)}</span>`:''}</div>
  <div class="quantity-controls">
    <button data-q="-1">-</button><span>${item.quantity}</span><button data-q="1">+</button>
    <button class="edit-item" title="Editar variantes">✎</button><button class="remove-item" title="Eliminar">✕</button>
  </div>
</div>`;
        row.querySelector('[data-q="-1"]').addEventListener('click',()=> changeQty(item.id,-1));
        row.querySelector('[data-q="1"]').addEventListener('click',()=> changeQty(item.id,1));
        row.querySelector('.remove-item').addEventListener('click',()=> removeItem(item.id));
        row.querySelector('.edit-item').addEventListener('click', (e)=>{ e.stopPropagation(); openVariantEditor(item, row); });
        row.addEventListener('click', (e)=>{ 
          // No abrir editor si se hace click en controles, botones o en el editor mismo
          if(e.target.closest('.quantity-controls, .variant-editor, .ve-colors, .ve-sizes, .ve-actions')) return; 
          openVariantEditor(item,row); 
        });
        els.cartItems.appendChild(row);
      });
    }
    const total = state.cart.reduce((s,i)=> s + i.price*i.quantity,0);
    if(els.cartCount) els.cartCount.textContent = state.cart.reduce((s,i)=> s+i.quantity,0);
    if(els.cartTotal) els.cartTotal.textContent = money(total);
    updateSummary();
  }
  function changeQty(id, delta){
    const item = state.cart.find(i=>i.id===id); if(!item) return;
    item.quantity += delta; if(item.quantity<=0) state.cart = state.cart.filter(i=>i.id!==id);
    updateCartUI();
  persist();
  }
  function removeItem(id){ state.cart = state.cart.filter(i=>i.id!==id); updateCartUI(); persist(); }
  window.updateQuantity = changeQty;

  function openVariantEditor(item, row){
    // Si ya abierto, cerrar
    if(row.querySelector('.variant-editor')){ row.querySelector('.variant-editor').remove(); return; }
    // Cerrar otros
    qsa('.variant-editor').forEach(v=> v.remove());
    const editor = document.createElement('div');
    editor.className='variant-editor';
    const colors = item.availableColors || item.availablecolors || item.availableColors || [];
    const sizes = item.availableSizes || item.sizes || [];
    const colorHtml = colors.length ? `<div class='ve-colors'>${colors.map(c=>`<span class="color-option ${c.className} ${item.color && item.color.className===c.className?'active':''}" data-color="${c.className}" title="${escapeHtml(c.label)}"></span>`).join('')}</div>`:'';
  const sizeHtml = sizes.length ? `<div class='ve-sizes'><label style='font-size:.55rem;letter-spacing:.5px;font-weight:600;text-transform:uppercase;'>Talle <select class='ve-size-select' aria-label='Editar talle' style='padding:.3rem .5rem;border:1px solid var(--light-brown);border-radius:6px;font-size:.6rem;'>${sizes.map(s=>`<option value="${s}" ${item.size===s?'selected':''}>${s}</option>`).join('')}</select></label></div>`:'';
    editor.innerHTML = `<div class='ve-inner'>${colorHtml}${sizeHtml}<div class='ve-actions'><button class='ve-save'>Guardar</button><button class='ve-cancel'>Cancelar</button></div></div>`;
    
    // Prevenir propagación en todo el editor
    editor.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    row.appendChild(editor);
    // Handlers selección
    editor.querySelectorAll('.ve-colors .color-option').forEach(opt=> {
      opt.addEventListener('click',(e)=>{
        e.preventDefault();
        e.stopPropagation();
        editor.querySelectorAll('.ve-colors .color-option').forEach(o=> o.classList.remove('active')); 
        opt.classList.add('active');
      });
    });
    
    // Prevenir que el select cierre el editor
    const sizeSelect = editor.querySelector('.ve-size-select');
    if(sizeSelect) {
      sizeSelect.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      sizeSelect.addEventListener('change', (e) => {
        e.stopPropagation();
      });
    }
    
    editor.querySelector('.ve-cancel').addEventListener('click',(e)=> {
      e.preventDefault();
      e.stopPropagation();
      editor.remove();
    });
    editor.querySelector('.ve-save').addEventListener('click',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      
      const newColorEl = editor.querySelector('.ve-colors .color-option.active');
      const newSizeSelect = editor.querySelector('.ve-size-select');
      const newColor = newColorEl ? { className: Array.from(newColorEl.classList).find(c=> c.startsWith('color-')) || '', label: (newColorEl.title||'').trim() } : null;
      const newSize = newSizeSelect ? newSizeSelect.value : null;
      const oldKey = (item.color?.className||'')+'|'+(item.size||'');
      const newKey = (newColor?.className||'')+'|'+(newSize||'');
      
      if(oldKey===newKey){ 
        editor.remove(); 
        return; 
      }
      
      // Ver si existe otra línea con mismo nuevo key
      const dup = state.cart.find(i=> i!==item && i.id===item.id && (i.color?.className||'')===(newColor?.className||'') && (i.size||'')===(newSize||''));
      if(dup){ 
        dup.quantity += item.quantity; 
        state.cart = state.cart.filter(i=> i!==item); 
      } else { 
        item.color = newColor; 
        item.size = newSize; 
      }
      
      editor.remove(); // Remover editor primero
      
      // Actualizar solo si es necesario - evitar bucle
      setTimeout(() => {
        updateCartUI(); 
        persist();
      }, 10);
    });
  }

  /* Guía de Talles */
  function initSizeGuide(){
    document.body.addEventListener('click', e=>{
      const btn = e.target.closest('[data-open-size-guide]');
      if(btn){ openSizeGuide(); }
      if(e.target.matches('.size-guide-modal [data-close-size-guide]')){ closeSizeGuide(); }
      if(e.target.classList.contains('size-guide-modal')){ closeSizeGuide(); }
    });
  }
  function openSizeGuide(){
    let modal = qs('.size-guide-modal');
    if(!modal){
      modal = document.createElement('div');
      modal.className='size-guide-modal';
      modal.innerHTML = `<div class='size-guide-dialog' role='dialog' aria-modal='true' aria-labelledby='sizeGuideTitle'>
        <button class='sg-close' data-close-size-guide aria-label='Cerrar guía'>&times;</button>
        <h3 id='sizeGuideTitle' tabindex='-1'>Guía de Talles</h3>
        <p style='font-size:.75rem;line-height:1.4;'>Selecciona el talle que mejor se ajuste. Si estás entre dos talles, recomendamos elegir el mayor para mayor comodidad.</p>
        <div class='size-guide-toolbar'>
          <button type='button' class='unit-toggle' data-unit='metric' aria-pressed='true'>CM / MM</button>
          <button type='button' class='unit-toggle' data-unit='imperial' aria-pressed='false'>INCH</button>
          <div class='ring-converter' aria-label='Conversor de circunferencia a talle'>
            <label style='font-size:.55rem;letter-spacing:.5px;font-weight:600;text-transform:uppercase;'>Circunferencia
              <input type='number' min='0' step='0.01' class='ring-circ-input' placeholder='mm o in'>
            </label>
            <select class='ring-circ-unit'>
              <option value='mm'>mm</option>
              <option value='in'>inch</option>
            </select>
            <button class='ring-calc' type='button'>Calcular</button>
            <span class='ring-result' aria-live='polite'></span>
          </div>
        </div>
        <div class='size-table-wrap'></div>
        <small style='opacity:.7;display:block;margin-top:.8rem;'>Medidas orientativas. Para precisión usa una cinta flexible.</small>
      </div>`;
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
    lastFocusedBeforeModal = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    buildSizeGuideTable('metric');
    attachSizeGuideEvents(modal);
    setTimeout(()=> qs('#sizeGuideTitle')?.focus(), 20);
    trapFocus(modal.querySelector('.size-guide-dialog'));
    document.addEventListener('keydown', escCloseHandler);
  }
  function closeSizeGuide(){ const m = qs('.size-guide-modal'); if(m){ m.classList.remove('open'); restoreFocusAfterModal(); document.removeEventListener('keydown', escCloseHandler);} }
  function escCloseHandler(e){ if(e.key==='Escape'){ if(qs('.size-guide-modal.open')) closeSizeGuide(); } }
  function restoreFocusAfterModal(){ if(lastFocusedBeforeModal){ lastFocusedBeforeModal.focus(); lastFocusedBeforeModal=null; } }
  function trapFocus(container){
    if(!container) return;
    const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const items = Array.from(container.querySelectorAll(FOCUSABLE)).filter(el=> !el.hasAttribute('disabled'));
    if(!items.length) return;
    const first = items[0]; const last = items[items.length-1];
    container.addEventListener('keydown', e=>{
      if(e.key==='Tab'){
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    });
  }

  // ---- Size guide helpers ----
  function buildSizeGuideTable(mode){
    const wrap = qs('.size-table-wrap'); if(!wrap) return;
    const rows = [
      { size:'XS', ring:[15,15.5], wrist:[13,14], collar:[38,40] },
      { size:'S',  ring:[16,16.5], wrist:[14,15.5], collar:[42,45] },
      { size:'M',  ring:[17,17.5], wrist:[15.5,17], collar:[50,55] },
      { size:'L',  ring:[18,18.5], wrist:[17,18.5], collar:[60,65] },
      { size:'XL', ring:[19,20], wrist:[18.5,20], collar:[70,75] }
    ];
    const toIn = v=> (v/2.54).toFixed(2);
    const rangeStr = (r, unit, altUnit)=>{
      if(mode==='imperial'){
        const a=toIn(r[0]); const b=toIn(r[1]);
        return `${a}-${b} in <small class='alt-unit'>(${r[0]}-${r[1]} ${unit})</small>`;
      }
      return `${r[0]}-${r[1]} ${unit} <small class='alt-unit'>(${toIn(r[0])}-${toIn(r[1])} in)</small>`;
    };
    wrap.innerHTML = `<table class='size-table'>
      <thead><tr><th>Talle</th><th>Diámetro Anillo ${mode==='imperial'?'(in)':'(mm)'} </th><th>Muñeca ${mode==='imperial'?'(in)':'(cm)'} </th><th>Collar ${mode==='imperial'?'(in)':'(cm)'} </th></tr></thead>
      <tbody>
        ${rows.map(r=>`<tr><td>${r.size}</td><td>${rangeStr(r.ring, 'mm')}</td><td>${rangeStr(r.wrist,'cm')}</td><td>${rangeStr(r.collar,'cm')}</td></tr>`).join('')}
      </tbody>
    </table>`;
    qsAll('.unit-toggle').forEach(b=> b.setAttribute('aria-pressed', b.dataset.unit === (mode==='imperial'?'imperial':'metric') ? 'true':'false'));
  }
  function attachSizeGuideEvents(modal){
    if(modal.dataset.bound) return; modal.dataset.bound='1';
    modal.addEventListener('click', e=>{
      const ut = e.target.closest('.unit-toggle');
      if(ut){ buildSizeGuideTable(ut.dataset.unit==='imperial'?'imperial':'metric'); }
      if(e.target.classList.contains('ring-calc')){ calcRingSize(); }
    });
  }
  function calcRingSize(){
    const input = qs('.ring-circ-input'); const unitSel = qs('.ring-circ-unit'); const out = qs('.ring-result');
    if(!input||!unitSel||!out) return;
    let val = parseFloat(input.value);
    if(!val){ out.textContent=''; return; }
    // Convert circumference to mm
    if(unitSel.value==='in') val = val*25.4;
    // Diameter from circumference (C=πd)
    const diameter = val/Math.PI; // mm
    // Choose size by midpoint mapping
    const sizeRanges = [
      { size:'XS', min:15, max:15.5 },
      { size:'S', min:16, max:16.5 },
      { size:'M', min:17, max:17.5 },
      { size:'L', min:18, max:18.5 },
      { size:'XL', min:19, max:20 }
    ];
    let found = sizeRanges.find(r=> diameter>=r.min && diameter<=r.max);
    if(!found){
      if(diameter<15) found=sizeRanges[0];
      else if(diameter>20) found=sizeRanges[sizeRanges.length-1];
    }
    out.textContent = `≈ diámetro ${diameter.toFixed(2)} mm → Talle sugerido: ${found?.size || '?'}`;
  }
  function qsAll(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

  function slugify(str=''){ return str.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }

  /* Checkout */
  function openCheckout(){ els.checkoutModal?.classList.add('active'); showStep(1); }
  function closeCheckout(){ els.checkoutModal?.classList.remove('active'); }
  function showStep(step){ state.step=step; qsa('.checkout-step').forEach(s=> s.classList.toggle('active', Number(s.dataset.step)===step)); updateIndicators(); toggleNav(); }
  function updateIndicators(){ if(!els.stepIndicator) return; qsa('span', els.stepIndicator).forEach(sp=> sp.classList.toggle('active', Number(sp.dataset.step)===state.step)); }
  // Barra de progreso dinámica
  function updateProgress(){
    const bar = qs('#checkoutProgress');
    if(!bar) return;
    const pct = ((state.step-1)/3)*100; // 4 pasos
    bar.style.width = pct+'%';
  }
  const _origShowStep = showStep;
  showStep = function(step){
    _origShowStep(step);
    updateProgress();
  }
  function toggleNav(){ if(!els.prevStep||!els.nextStep) return; els.prevStep.style.visibility = state.step===1? 'hidden':'visible'; els.nextStep.textContent = state.step===4? 'Confirmar Pedido':'Siguiente'; }
  function advance(){ if(!validateStep(state.step)) return; if(state.step<4) showStep(state.step+1); else confirmOrder(); }

  function validateStep(step){
    clearErrors(step);
    switch(step){
      case 1:
        if(!state.shippingMethod){ notify('Selecciona un método de entrega'); return false; }
        if(state.shippingMethod==='delivery'){
          if(!val('#address')) addError('#address','Requerido');
          if(!val('#city')) addError('#city','Requerido');
          if(!val('#postalCode')) addError('#postalCode','Requerido');
          if(qs('.checkout-step[data-step="1"] .field-error')){ notify('Completa la dirección'); return false; }
        }
        return true;
      case 2:
        if(!val('#name')) addError('#name','Requerido');
        if(!val('#email')) addError('#email','Requerido');
        if(!val('#phone')) addError('#phone','Requerido');
        if(qs('.checkout-step[data-step="2"] .field-error')){ notify('Completa tus datos'); return false; }
        return true;
      case 3:
        if(!state.paymentMethod){ notify('Selecciona método de pago'); return false; }
        if(state.paymentMethod==='card'){
          if(!val('#cardNumber')) addError('#cardNumber','Requerido');
          if(!val('#cardExpiry')) addError('#cardExpiry','Requerido');
          if(!val('#cardCVC')) addError('#cardCVC','Requerido');
          if(qs('.checkout-step[data-step="3"] .field-error')){ notify('Datos tarjeta incompletos'); return false; }
        }
        return true;
      default: return true;
    }
  }
  function val(sel){ const el = qs(sel); return el && el.value.trim(); }
  function clearErrors(step){ qsa(`.checkout-step[data-step='${step}'] .field`).forEach(f=>{ f.classList.remove('field-error'); const em=f.querySelector('.error-msg'); if(em) em.remove(); }); }
  function addError(sel,msg){ const input=qs(sel); if(!input) return; const field=input.closest('.field'); if(!field) return; field.classList.add('field-error'); if(!field.querySelector('.error-msg')){ const d=document.createElement('div'); d.className='error-msg'; d.textContent=msg; field.appendChild(d);} }

  function toggleShippingFields(){ if(!els.shippingAddress) return; els.shippingAddress.classList.toggle('hidden', state.shippingMethod !== 'delivery'); }
  function togglePaymentFields(){ if(els.cardForm) els.cardForm.classList.toggle('hidden', state.paymentMethod !== 'card'); if(els.transferInfo) els.transferInfo.classList.toggle('hidden', state.paymentMethod !== 'transfer'); }

  function updateSummary(){ if(!els.summaryItems) return; els.summaryItems.innerHTML=''; let subtotal=0; state.cart.forEach(item=>{ const lineTotal = item.price*item.quantity; subtotal+=lineTotal; const variantParts=[]; if(item.color) variantParts.push(item.color.label); if(item.size) variantParts.push('Talle '+item.size); const variantStr = variantParts.length ? ' ('+variantParts.join(' / ')+')':''; const div=document.createElement('div'); div.className='summary-line'; div.innerHTML=`<span>${escapeHtml(item.name)}${variantStr} x${item.quantity}</span><span>${money(lineTotal)}</span>`; els.summaryItems.appendChild(div); }); const shipping = state.shippingMethod==='delivery' ? 500 : 0; if(els.summarySubtotal) els.summarySubtotal.textContent = money(subtotal); if(els.summaryShipping) els.summaryShipping.textContent = money(shipping); if(els.summaryTotal) els.summaryTotal.textContent = money(subtotal+shipping); }

  function confirmOrder(){ if(!state.cart.length) return notify('Carrito vacío'); setLoading(true); setTimeout(()=>{ setLoading(false); const order = buildOrderObject(); notify('¡Pedido confirmado!'); state.cart=[]; updateCartUI(); closeCheckout(); }, 1200); }
  function buildOrderObject(){ const subtotal = state.cart.reduce((s,i)=> s+i.price*i.quantity,0); const shippingCost = state.shippingMethod==='delivery'?500:0; return { items: state.cart, shipping:{ method: state.shippingMethod, address: state.shippingMethod==='delivery'? { street: val('#address'), city: val('#city'), postalCode: val('#postalCode') }: null }, contact:{ name: val('#name'), email: val('#email'), phone: val('#phone') }, payment:{ method: state.paymentMethod, card: state.paymentMethod==='card'? { last4: (val('#cardNumber')||'').slice(-4) }: null }, totals:{ subtotal, shipping: shippingCost, total: subtotal+shippingCost }, createdAt: new Date().toISOString() }; }

  function setLoading(on){ state.loading=on; els.nextStep?.classList.toggle('loading', on); if(on){ els.nextStep.dataset.prevText = els.nextStep.textContent; els.nextStep.innerHTML = '<span class="spinner"></span>'; els.nextStep.disabled=true; } else { els.nextStep.disabled=false; els.nextStep.textContent = els.nextStep.dataset.prevText || 'Siguiente'; } }

  /* Notifications */
  let notifyTimeout; function notify(msg){ let n = qs('.notification'); if(!n){ n=document.createElement('div'); n.className='notification'; document.body.appendChild(n);} n.textContent = msg; n.classList.add('show'); clearTimeout(notifyTimeout); notifyTimeout=setTimeout(()=> n.classList.remove('show'), 3000); }
  window.__notify = notify;

  /* Utility */
  function escapeHtml(str=''){ return str.replace(/[&<>"]+/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  
  /* Newsletter */
  function initNewsletter(){
    const form = document.querySelector('.newsletter-form');
    if(!form) return;
    // Insert status region (aria-live)
    let status = form.querySelector('.newsletter-status');
    if(!status){
      status = document.createElement('div');
      status.className='newsletter-status';
      status.setAttribute('aria-live','polite');
      status.style.fontSize='.7rem';
      status.style.width='100%';
      form.appendChild(status);
    }
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if(!emailInput) return;
      const email = emailInput.value.trim();
      if(!validateEmail(email)){
        flashStatus('Ingresa un correo válido', true);
        emailInput.focus();
        return;
      }
      const subs = loadSubscribers();
      if(subs.includes(email.toLowerCase())){
        flashStatus('Ya estás suscripto', false);
        return;
      }
      const useDoubleOptIn = (window.NEWSLETTER_ENDPOINT||'').includes('/subscribe');
      if(useDoubleOptIn){
        // Sólo registrar localmente estado pendiente
        subs.push(email.toLowerCase());
        persistSubscribers(subs);
        flashStatus('Revisa tu correo para confirmar la suscripción.', false);
        const submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn){ submitBtn.disabled=true; submitBtn.textContent='Pendiente'; }
        trySendBackend(email, null, { doubleOptIn:true });
      } else {
        subs.push(email.toLowerCase());
        persistSubscribers(subs);
        flashStatus('¡Suscripción exitosa! Revisa tu bandeja.', false);
        emailInput.disabled = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn){ submitBtn.disabled=true; submitBtn.textContent='Suscripto'; }
        const template = buildWelcomeTemplate(email);
        simulateSend(template, email);
        trySendEmailJS(email, template);
        trySendBackend(email, template);
      }
    });
    function flashStatus(msg, isError){
      status.textContent = msg;
      status.style.color = isError? '#ff6b6b':'var(--gold-accent)';
    }
  }
  function validateEmail(em){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em); }
  function loadSubscribers(){ try { return JSON.parse(localStorage.getItem('ihara_subscribers')||'[]'); }catch(e){ return []; } }
  function persistSubscribers(list){ try { localStorage.setItem('ihara_subscribers', JSON.stringify(list)); }catch(e){} }
  function buildWelcomeTemplate(email){
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9._-]+/g,' ').trim();
    const prettyName = name? (name.charAt(0).toUpperCase()+name.slice(1)) : 'Cliente';
    const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Bienvenida Ihara & London</title><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#0d0d0d;color:#f5f5f5;}a{color:#d4af37;text-decoration:none;} .hero{background:linear-gradient(135deg,#111,#1d1d1d);padding:40px 25px;text-align:center;}h1{font-size:28px;margin:0;background:linear-gradient(45deg,#fff,#d4af37);-webkit-background-clip:text;color:transparent;}p{line-height:1.55;font-size:14px;margin:16px 0;} .card{max-width:620px;margin:0 auto;background:#181818;border:1px solid #2a2a2a;border-radius:18px;overflow:hidden;box-shadow:0 6px 22px -8px rgba(0,0,0,.6);} .content{padding:10px 28px 40px;} .badge{display:inline-block;background:#d4af37;color:#111;font-weight:600;padding:6px 14px;border-radius:30px;font-size:11px;letter-spacing:.5px;} .cta{display:inline-block;margin-top:22px;background:#d4af37;color:#111;padding:14px 26px;font-weight:600;border-radius:40px;font-size:13px;letter-spacing:.8px;} .grid{display:flex;flex-wrap:wrap;gap:14px;margin:28px 0 10px;} .grid-item{flex:1 1 160px;background:#202020;border:1px solid #2c2c2c;border-radius:14px;padding:14px 16px;min-width:150px;} .grid-item h3{margin:0 0 6px;font-size:15px;color:#fff;} .grid-item span{font-size:12px;opacity:.75;} footer{font-size:11px;opacity:.65;padding:24px 10px;text-align:center;} hr{border:none;border-top:1px solid #2e2e2e;margin:34px 0;} .logo{font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#d4af37;margin:0;} @media(max-width:520px){h1{font-size:24px;} .content{padding:0 22px 34px;} .grid{flex-direction:column;} .grid-item{min-width:auto;} }</style></head><body><div class="card"><div class="hero"><p class="logo">Ihara & London</p><h1>Bienvenida, ${prettyName}</h1><div class="badge">EXPERIENCIA EXCLUSIVA</div></div><div class="content"><p>Gracias por unirte a nuestra lista privada. A partir de ahora recibirás acceso temprano a lanzamientos, ediciones limitadas y recomendaciones seleccionadas para tu estilo.</p><p>Cuidamos cada detalle como si fuera único. Este es el comienzo de algo especial.</p><div class="grid"><div class="grid-item"><h3>Acceso Anticipado</h3><span>Nuevas colecciones antes que nadie.</span></div><div class="grid-item"><h3>Ediciones Limitadas</h3><span>Piezas con disponibilidad reducida.</span></div><div class="grid-item"><h3>Guías Personalizadas</h3><span>Consejos de estilo y cuidado.</span></div></div><a class="cta" href="https://www.instagram.com/ihara_calzado?igsh=MXhsaXJhcTI4djg2Mg==" target="_blank" rel="noopener">Síguenos</a><hr><p style="font-size:12px;opacity:.7;">Si no solicitaste esta suscripción puedes ignorar este correo.</p><p style="font-size:12px;opacity:.55;">&copy; ${year} Ihara & London. Todos los derechos reservados.</p></div></div><footer>Enviado automáticamente • No responder</footer></body></html>`;
  }
  function simulateSend(html, email){
    // Crea un modal de previsualización con opciones de copiar / descargar
    let modal = document.querySelector('.email-preview-modal');
    if(!modal){
      modal = document.createElement('div');
      modal.className='email-preview-modal';
      modal.innerHTML = `<div class='ep-dialog' role='dialog' aria-modal='true' aria-labelledby='epTitle'>
        <button class='ep-close' aria-label='Cerrar'>&times;</button>
        <h3 id='epTitle'>Correo de Bienvenida (Vista Previa)</h3>
        <div class='ep-actions'>
          <button type='button' data-ep-copy>Copiar HTML</button>
          <button type='button' data-ep-download>Descargar .html</button>
          <button type='button' data-ep-close>Cerrar</button>
        </div>
        <iframe class='ep-frame' title='Vista previa email'></iframe>
        <small style='display:block;margin-top:8px;opacity:.65;'>Esta es una simulación local. Para envío real configura un servicio (ej: EmailJS, SendGrid, etc.).</small>
      </div>`;
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
    const frame = modal.querySelector('.ep-frame');
    if(frame){
      const doc = frame.contentDocument || frame.contentWindow?.document;
      if(doc){ doc.open(); doc.write(html); doc.close(); }
    }
    modal.querySelector('.ep-close')?.addEventListener('click',()=> modal.classList.remove('open'));
    modal.querySelector('[data-ep-close]')?.addEventListener('click',()=> modal.classList.remove('open'));
    modal.querySelector('[data-ep-copy]')?.addEventListener('click',()=>{ navigator.clipboard?.writeText(html); notify('HTML copiado'); });
    modal.querySelector('[data-ep-download]')?.addEventListener('click',()=>{
      const blob = new Blob([html], {type:'text/html'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bienvenida-ihara-london.html';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=> URL.revokeObjectURL(a.href), 2000);
    });
  }
  function trySendEmailJS(email, html){
    // Permite integración opcional si se incluye EmailJS en la página y config global
    // Config esperada: window.NEWSLETTER_EMAILJS = { serviceId:'', templateId:'', publicKey:'', fieldMap:{ to_email:'', message_html:'' } }
    const cfg = window.NEWSLETTER_EMAILJS;
    if(!window.emailjs || !cfg) return; // no configurado
    try {
      window.emailjs.init(cfg.publicKey);
      const params = {};
      const map = cfg.fieldMap || { to_email:'to_email', message_html:'message_html' };
      params[map.to_email] = email;
      params[map.message_html] = html;
      window.emailjs.send(cfg.serviceId, cfg.templateId, params).then(()=>{
        notify('Email enviado (EmailJS)');
      }).catch(()=>{/* silencio */});
    } catch(err){ /* noop */ }
  }
  function trySendBackend(email, html, opts={}){
    const url = window.NEWSLETTER_ENDPOINT; // Defínelo en HTML: window.NEWSLETTER_ENDPOINT = 'https://tu-backend/api/newsletter';
    if(!url) return;
  const headers = { 'Content-Type':'application/json' };
  if(window.NEWSLETTER_API_TOKEN){ headers['x-api-token'] = window.NEWSLETTER_API_TOKEN; }
    const form = document.querySelector('.newsletter-form');
    const btn = form?.querySelector('button[type="submit"]');
    const originalBtnText = btn?.textContent;
    if(btn){ btn.disabled=true; btn.textContent='Enviando...'; }
    const body = opts.doubleOptIn ? { email } : { email, html };
    fetch(url, { method:'POST', headers, body: JSON.stringify(body) })
      .then(async r=>{
        let data=null; try{ data=await r.json(); }catch{}
        if(!r.ok){ throw new Error(data?.error||'Error'); }
        if(opts.doubleOptIn){
          if(data?.duplicate && data?.confirmed){ notify('Ya confirmado (backend)'); }
          else if(data?.duplicate){ notify('Pendiente de confirmación (ya solicitado)'); }
          else if(data?.pending){ notify('Correo de confirmación enviado'); }
        } else {
          if(data?.duplicate){ notify('Ya estaba suscripto (backend)'); }
          else { notify('Email enviado (backend)'); }
        }
      })
      .catch(err=>{ notify('No se pudo contactar el servidor'); })
      .finally(()=>{ if(btn){ btn.disabled=true; if(opts.doubleOptIn) btn.textContent='Pendiente'; else btn.textContent='Suscripto'; } });
  }

  // FAQ System
  function initializeFAQ() {
    // Category switching
    const categoryBtns = qsa('.faq-category-btn');
    const categoryContents = qsa('.faq-category-content');
    
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        
        // Remove active class from all buttons and contents
        categoryBtns.forEach(b => b.classList.remove('active'));
        categoryContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        const targetContent = qs(`[data-category="${category}"].faq-category-content`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
    
    // FAQ item toggle
    const faqQuestions = qsa('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items in the current category
        const currentCategory = faqItem.closest('.faq-category-content');
        if (currentCategory) {
          currentCategory.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
          });
        }
        
        // Open clicked item if it wasn't already active
        if (!isActive) {
          faqItem.classList.add('active');
        }
      });
    });
  }

  // Blog functionality
  function initializeBlog() {
    // Add click handlers for blog links
    const blogLinks = qsa('.blog-link');
    
    blogLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Show toast message for demo
        notify('Artículo completo disponible próximamente', 'info');
      });
    });
    
    // View all button
    const viewAllBtn = qs('.view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        notify('Blog completo disponible próximamente', 'info');
      });
    }
  }

  // Enhanced smooth scrolling for navigation
  function initializeSmoothScrolling() {
    const navLinks = qsa('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = qs('.header')?.offsetHeight || 80;
          const targetPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          const hamburger = qs('.hamburger');
          const navLinksContainer = qs('.nav-links');
          if (hamburger && navLinksContainer && hamburger.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
          }
        }
      });
    });
  }

  // Contact Form functionality
  function initializeContactForm() {
    const contactForm = qs('#contactForm');
    const inlineContactForm = qs('#inlineContactForm');
    
    // Handle main contact form if it exists
    if (contactForm) {
      contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Handle inline contact form
    if (inlineContactForm) {
      inlineContactForm.addEventListener('submit', handleInlineContactSubmit);
    }
  }
  
  async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.contact-submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span class="btn-text">Enviando...</span><span class="btn-icon">⏳</span>';
    submitBtn.disabled = true;
    
    try {
      // Send to real backend
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
          newsletter: formData.get('newsletter') === '1'
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Show success message
        notify('¡Mensaje enviado exitosamente! Te responderemos pronto.', 'success');
        
        // Reset form
        form.reset();
        
        // If newsletter checkbox was checked, show additional message
        if (formData.get('newsletter')) {
          setTimeout(() => {
            notify('También te has suscrito a nuestro newsletter', 'info');
          }, 1500);
        }
      } else {
        throw new Error(result.error || 'Error en el servidor');
      }
      
    } catch (error) {
      notify('Error al enviar el mensaje. Por favor intenta nuevamente.', 'error');
    } finally {
      // Restore button
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 1000);
    }
  }
  
  async function handleInlineContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.inline-submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span>Enviando...</span><span class="btn-icon">⏳</span>';
    submitBtn.disabled = true;
    
    try {
      // Send to real backend
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name') || form.querySelector('input[type="text"]').value,
          email: formData.get('email') || form.querySelector('input[type="email"]').value,
          subject: 'Consulta desde formulario inline',
          message: formData.get('message') || form.querySelector('textarea').value,
          newsletter: false
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Show success message
        notify('¡Consulta enviada! Nos pondremos en contacto contigo pronto.', 'success');
        
        // Reset form
        form.reset();
      } else {
        throw new Error(result.error || 'Error en el servidor');
      }
      
    } catch (error) {
      notify('Error al enviar la consulta. Por favor intenta nuevamente.', 'error');
    } finally {
      // Restore button
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 1000);
    }
  }

  // Map functionality
  function initializeMapFunctionality() {
    const mapPlaceholder = qs('.map-placeholder-enhanced');
    const mapLinks = qsa('.map-link-btn');
    
    // Add click handler to map placeholder
    if (mapPlaceholder) {
      mapPlaceholder.addEventListener('click', () => {
        const googleMapsUrl = 'https://www.google.com/maps/search/Ituzaingo+562,+San+Cristobal,+Santa+Fe,+Argentina';
        window.open(googleMapsUrl, '_blank');
        notify('Abriendo ubicación en Google Maps...', 'info');
      });
    }
    
    // Add click handlers to map links
    mapLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const linkText = link.textContent.trim();
        if (linkText.includes('Google Maps')) {
          notify('Abriendo en Google Maps...', 'info');
        } else if (linkText.includes('Apple Maps')) {
          notify('Abriendo en Apple Maps...', 'info');
        }
      });
    });
  }

  // Initialize map functionality when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMapFunctionality);
  } else {
    initializeMapFunctionality();
  }

  // Expose necessary functions and state to window for filter integration  
  window.state = state;
  window.filterProducts = filterProducts;
})();
