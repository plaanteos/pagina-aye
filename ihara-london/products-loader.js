/**
 * Products Loader for Netlify CMS
 * Carga productos dinámicamente desde archivos JSON generados por Netlify CMS
 */

(function() {
  'use strict';

  // Cache de productos
  let productsCache = null;
  let configCache = null;

  /**
   * Carga todos los productos desde el directorio _products
   */
  async function loadProducts() {
    if (productsCache) {
      return productsCache;
    }

    try {
      // En producción, los archivos JSON estarán en _products/
      // Netlify CMS los genera automáticamente
      const response = await fetch('/_products/index.json');
      
      if (!response.ok) {
        console.warn('No se pudo cargar el índice de productos, usando productos de ejemplo');
        return loadFallbackProducts();
      }

      const productFiles = await response.json();
      const products = [];

      // Cargar cada archivo de producto
      for (const file of productFiles) {
        try {
          const productResponse = await fetch(`/_products/${file}`);
          const product = await productResponse.json();
          
          // Solo incluir productos activos
          if (product.activo !== false) {
            products.push(product);
          }
        } catch (error) {
          console.error(`Error cargando producto ${file}:`, error);
        }
      }

      productsCache = products;
      return products;
    } catch (error) {
      console.error('Error cargando productos:', error);
      return loadFallbackProducts();
    }
  }

  /**
   * Sin productos de respaldo - La tienda inicia vacía
   * Los productos se agregan solo desde el panel admin
   */
  function loadFallbackProducts() {
    console.log('No hay productos cargados aún. Agregar productos desde el panel admin.');
    return [];
  }

  /**
   * Carga la configuración general
   */
  async function loadConfig() {
    if (configCache) {
      return configCache;
    }

    try {
      const response = await fetch('/_config/general.json');
      const config = await response.json();
      configCache = config;
      return config;
    } catch (error) {
      console.error('Error cargando configuración:', error);
      return {
        nombre_tienda: "Ihara & London",
        moneda: "EUR",
        iva: 21,
        envio_gratis_desde: 50
      };
    }
  }

  /**
   * Renderiza los productos en el HTML
   */
  async function renderProducts() {
    const products = await loadProducts();
    const productGrid = document.querySelector('.product-grid');
    
    if (!productGrid) {
      console.warn('No se encontró el contenedor de productos');
      return;
    }

    // Limpiar productos existentes si es necesario
    // productGrid.innerHTML = '';

    products.forEach(product => {
      const productCard = createProductCard(product);
      productGrid.appendChild(productCard);
    });

    // Triggear evento para que store.js procese los nuevos productos
    window.dispatchEvent(new CustomEvent('productsLoaded', { detail: { products } }));
  }

  /**
   * Crea una tarjeta de producto
   */
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.dataset.category = product.categoria;
    card.dataset.price = product.precio;
    card.dataset.material = product.material;
    card.dataset.rating = product.rating;

    const imagen = product.fotos && product.fotos[0] ? product.fotos[0] : '/public/images/products/placeholder.jpg';
    const precio = formatPrice(product.precio);

    // Colores
    let coloresHTML = '';
    if (product.colores && product.colores.length > 0) {
      coloresHTML = '<div class="product-colors">';
      product.colores.forEach(color => {
        coloresHTML += `<div class="color-option color-${color}" data-label="${color}"></div>`;
      });
      coloresHTML += '</div>';
    }

    // Badge de oferta
    let badgeHTML = '';
    if (product.en_oferta && product.precio_original) {
      const descuento = Math.round(((product.precio_original - product.precio) / product.precio_original) * 100);
      badgeHTML = `<span class="badge-oferta">-${descuento}%</span>`;
    } else if (product.nuevo) {
      badgeHTML = '<span class="badge-nuevo">Nuevo</span>';
    }

    card.innerHTML = `
      <div class="product-image">
        ${badgeHTML}
        <img src="${imagen}" alt="${product.nombre}" loading="lazy" />
      </div>
      <div class="product-info">
        <h3>${product.nombre}</h3>
        <p class="product-description">${product.descripcion_corta}</p>
        <div class="product-price">${precio}</div>
        ${coloresHTML}
        <button class="add-to-cart">
          <span>Agregar al Carrito</span>
        </button>
      </div>
    `;

    return card;
  }

  /**
   * Formatea el precio según la configuración
   */
  function formatPrice(price) {
    const config = configCache || { moneda: 'EUR' };
    const symbol = config.moneda === 'EUR' ? '€' : '$';
    return `${symbol}${Number(price).toFixed(2)}`;
  }

  /**
   * Exporta funciones para uso global
   */
  window.ProductsLoader = {
    loadProducts,
    loadConfig,
    renderProducts
  };

  /**
   * Auto-inicializar si el DOM está listo
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Solo renderizar si existe el contenedor
      if (document.querySelector('.product-grid')) {
        // Comentado para no duplicar productos existentes
        // Descomentar cuando quieras usar solo productos del CMS
        // renderProducts();
      }
    });
  }

})();
