// CARRITO COMPARTIDO - Dincolor
const CART_KEY = 'dincolor_cart';
const WHATSAPP_NUMBER = '5493413113046';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(item) {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => 
    i.id === item.id && 
    i.presentacion === item.presentacion && 
    i.base === item.base && 
    i.color === item.color
  );
  
  if (existingIndex >= 0) {
    cart[existingIndex].cantidad += item.cantidad;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  showToast('Agregado al carrito');
  bounceCartIcon();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateCartItemQty(index, delta) {
  const cart = getCart();
  cart[index].cantidad += delta;
  if (cart[index].cantidad <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
}

function getTotalItems() {
  return getCart().reduce((sum, item) => sum + item.cantidad, 0);
}

function updateCartUI() {
  const total = getTotalItems();
  const cartCount = document.getElementById('cartCount');
  const cartFloat = document.getElementById('cartFloat');
  const cartFloatCount = document.getElementById('cartFloatCount');
  const cartCheckout = document.getElementById('cartCheckout');
  const cartTotalItems = document.getElementById('cartTotalItems');
  
  if (cartCount) {
    cartCount.textContent = total;
    cartCount.classList.toggle('hidden', total === 0);
  }
  if (cartFloat) {
    cartFloat.classList.toggle('show', total > 0 && window.innerWidth <= 700);
  }
  if (cartFloatCount) cartFloatCount.textContent = total;
  if (cartCheckout) cartCheckout.disabled = total === 0;
  if (cartTotalItems) cartTotalItems.textContent = total;
  
  renderCartItems();
}

function renderCartItems() {
  const cartBody = document.getElementById('cartBody');
  if (!cartBody) return;
  
  const cart = getCart();
  if (cart.length === 0) {
    cartBody.innerHTML = '<div class="dc-cart-empty">Tu carrito está vacío</div>';
    return;
  }
  
  cartBody.innerHTML = cart.map((item, i) => {
    const colorDot = item.colorHex ? `<span class="dc-cart-item-color-dot" style="background-color: ${item.colorHex};"></span>` : '';
    const meta = [
      item.presentacion,
      item.base ? `Base: ${item.base}` : '',
      item.color ? `${colorDot}${item.color}` : ''
    ].filter(Boolean).join(' · ');
    
    return `
      <div class="dc-cart-item">
        <img src="${item.foto}" alt="${item.nombre}" class="dc-cart-item-img">
        <div class="dc-cart-item-info">
          <div class="dc-cart-item-marca">${item.marca}</div>
          <div class="dc-cart-item-nombre">${item.nombre}</div>
          <div class="dc-cart-item-meta">${meta}</div>
          <div class="dc-cart-item-qty-row">
            <div class="dc-cart-item-qty">
              <button onclick="updateCartItemQty(${i}, -1)">−</button>
              <span>${item.cantidad}</span>
              <button onclick="updateCartItemQty(${i}, 1)">+</button>
            </div>
            <button class="dc-cart-item-remove" onclick="removeFromCart(${i})">Quitar</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function sendOrderToWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) return;
  
  let msg = '🛒 *Nuevo pedido - Dincolor*%0A%0A';
  cart.forEach(item => {
    let line = `• ${item.nombre} - ${item.presentacion}`;
    if (item.base) line += ` - Base: ${item.base}`;
    if (item.color) line += ` - Color: ${item.color}`;
    line += ` x${item.cantidad}`;
    msg += line + '%0A';
  });
  msg += `%0A*Total de items:* ${getTotalItems()}`;
  
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

function showToast(text) {
  const existing = document.querySelector('.dc-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'dc-toast';
  toast.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${text}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function bounceCartIcon() {
  const btn = document.getElementById('cartBtn');
  if (!btn) return;
  btn.classList.remove('bounce');
  void btn.offsetWidth;
  btn.classList.add('bounce');
}

function openCart() {
  document.getElementById('cartPanel').classList.add('active');
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartFloat = document.getElementById('cartFloat');
  const cartCheckout = document.getElementById('cartCheckout');
  
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (cartFloat) cartFloat.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  if (cartCheckout) cartCheckout.addEventListener('click', sendOrderToWhatsApp);
  
  window.addEventListener('resize', updateCartUI);
  updateCartUI();
});
