"use strict";

// ======================================================
// Configuracion de empresa (usada en interfaz y factura)
// ======================================================
const companyInfo = {
  name: "Pinturas Tech Color, S.A.",
  nit: "889922-1",
  address: "Zona 10, Ciudad de Guatemala",
  phone: "+502 2456-7788",
  email: "facturacion@pinturastechcolor.com"
};

// ======================================================
// Cuentas predefinidas: el usuario solo selecciona
// ======================================================
const accounts = [
  { username: "cliente1", password: "1234", label: "Cliente Minorista" },
  { username: "cliente2", password: "abcd", label: "Cliente Frecuente" },
  { username: "empresaGT", password: "compra2026", label: "Cuenta Empresarial" }
];

// ======================================================
// Catalogo de productos (imagenes relacionadas, no paisajes)
// ======================================================
const products = [
  {
    id: "laptop-gamer",
    name: "Laptop Gamer RTX",
    emoji: "💻",
    keywords: ["laptop", "gamer", "rtx"],
    price: 8450,
    stock: 5,
    image: "assets/products/laptop-gamer.svg"
  },
  {
    id: "iphone-pro",
    name: "iPhone Pro",
    emoji: "📱",
    keywords: ["iphone", "smartphone", "apple"],
    price: 9200,
    stock: 4,
    image: "assets/products/iphone-pro.svg"
  },
  {
    id: "teclado-rgb",
    name: "Teclado Mecanico RGB",
    emoji: "⌨️",
    keywords: ["teclado", "keyboard", "rgb"],
    price: 680,
    stock: 10,
    image: "assets/products/teclado-rgb.svg"
  },
  {
    id: "mouse-pro",
    name: "Mouse Pro Wireless",
    emoji: "🖱️",
    keywords: ["mouse", "wireless", "gaming"],
    price: 390,
    stock: 12,
    image: "assets/products/mouse-pro.svg"
  },
  {
    id: "monitor-4k",
    name: "Monitor 4K 27",
    emoji: "🖥️",
    keywords: ["monitor", "4k", "pantalla"],
    price: 2750,
    stock: 6,
    image: "assets/products/monitor-4k.svg"
  },
  {
    id: "audifonos",
    name: "Audifonos Gamer 7.1",
    emoji: "🎧",
    keywords: ["audifonos", "headphones", "gamer"],
    price: 520,
    stock: 8,
    image: "assets/products/audifonos.svg"
  },
  {
    id: "tablet",
    name: "Tablet 11",
    emoji: "📲",
    keywords: ["tablet", "screen", "touch"],
    price: 3340,
    stock: 7,
    image: "assets/products/tablet.svg"
  },
  {
    id: "camara-web",
    name: "Camara Web HD",
    emoji: "📷",
    keywords: ["camara", "webcam", "stream"],
    price: 310,
    stock: 15,
    image: "assets/products/camara-web.svg"
  }
];

// ======================================================
// Estado principal de la app
// ======================================================
const state = {
  cart: {},
  searchTerm: "",
  currency: localStorage.getItem("currency") || "GTQ",
  exchangeRate: Number(localStorage.getItem("exchangeRate")) || 7.8,
  theme: localStorage.getItem("theme") || "light",
  volume: Number(localStorage.getItem("volume")) || 0.55,
  lastReceipt: null
};

// Referencias del DOM para evitar buscar nodos repetidamente.
const dom = {
  productGrid: document.getElementById("productGrid"),
  productSearch: document.getElementById("productSearch"),
  cartItems: document.getElementById("cartItems"),
  subtotalText: document.getElementById("subtotalText"),
  extrasText: document.getElementById("extrasText"),
  ivaText: document.getElementById("ivaText"),
  totalText: document.getElementById("totalText"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  pdfBtn: document.getElementById("pdfBtn"),
  openPayBtn: document.getElementById("openPayBtn"),
  paymentDetails: document.getElementById("paymentDetails"),
  currencySelect: document.getElementById("currencySelect"),
  exchangeRateInput: document.getElementById("exchangeRateInput"),
  themeToggle: document.getElementById("themeToggle"),
  clockText: document.getElementById("clockText"),
  stockAvailable: document.getElementById("stockAvailable"),
  stockCart: document.getElementById("stockCart"),
  registerTotal: document.getElementById("registerTotal"),
  volumeRange: document.getElementById("volumeRange"),
  paymentForm: document.getElementById("paymentForm"),
  buyerName: document.getElementById("buyerName"),
  buyerAccount: document.getElementById("buyerAccount"),
  accountInfo: document.getElementById("accountInfo"),
  paymentMethod: document.getElementById("paymentMethod"),
  deliveryOption: document.getElementById("deliveryOption"),
  giftWrapOption: document.getElementById("giftWrapOption"),
  prioritySupportOption: document.getElementById("prioritySupportOption"),
  invoiceCopyOption: document.getElementById("invoiceCopyOption"),
  orderNote: document.getElementById("orderNote"),
  paymentMessage: document.getElementById("paymentMessage"),
  receiptInfo: document.getElementById("receiptInfo"),
  previewModal: document.getElementById("previewModal"),
  closePreviewBtn: document.getElementById("closePreviewBtn"),
  previewImage: document.getElementById("previewImage"),
  previewTitle: document.getElementById("previewTitle"),
  previewPrice: document.getElementById("previewPrice"),
  previewStock: document.getElementById("previewStock"),
  cartFly: document.getElementById("cartFly")
};

let audioContext = null;

function ensureAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

// ======================================================
// Utilidades de formato de moneda
// ======================================================
function formatMoneyByCurrency(gtqValue, currency = "GTQ", exchangeRate = 7.8) {
  if (currency === "USD") {
    const usdValue = gtqValue / exchangeRate;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(usdValue);
  }

  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ"
  }).format(gtqValue);
}

function formatMoney(gtqValue) {
  return formatMoneyByCurrency(gtqValue, state.currency, state.exchangeRate);
}

function formatSecondaryMoney(gtqValue) {
  if (state.currency === "USD") {
    return formatMoneyByCurrency(gtqValue, "GTQ", state.exchangeRate);
  }

  return formatMoneyByCurrency(gtqValue, "USD", state.exchangeRate);
}

// ======================================================
// Utilidades de datos
// ======================================================
function getProductById(productId) {
  return products.find((product) => product.id === productId);
}

function getAccountByUsername(username) {
  return accounts.find((account) => account.username === username) || null;
}

function getCartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function getSubtotalGtq() {
  return Object.entries(state.cart).reduce((subtotal, [productId, qty]) => {
    const product = getProductById(productId);
    return product ? subtotal + product.price * qty : subtotal;
  }, 0);
}

// Lee y calcula recargos de las opciones extra desplegables.
function getExtraOptionsSnapshot() {
  const delivery = dom.deliveryOption ? dom.deliveryOption.value : "standard";
  const giftWrap = Boolean(dom.giftWrapOption && dom.giftWrapOption.checked);
  const prioritySupport = Boolean(dom.prioritySupportOption && dom.prioritySupportOption.checked);
  const invoiceCopy = Boolean(dom.invoiceCopyOption && dom.invoiceCopyOption.checked);
  const note = dom.orderNote ? dom.orderNote.value.trim() : "";

  const deliveryFee = delivery === "express" ? 45 : 0;
  const giftWrapFee = giftWrap ? 20 : 0;
  const priorityFee = prioritySupport ? 35 : 0;
  const extrasGtq = deliveryFee + giftWrapFee + priorityFee;

  return {
    delivery,
    giftWrap,
    prioritySupport,
    invoiceCopy,
    note,
    deliveryFee,
    giftWrapFee,
    priorityFee,
    extrasGtq
  };
}

function getFilteredProducts() {
  const term = state.searchTerm.trim().toLowerCase();
  if (!term) {
    return products;
  }

  return products.filter((product) => {
    const text = `${product.name} ${product.keywords.join(" ")}`.toLowerCase();
    return text.includes(term);
  });
}

// ======================================================
// Render de catalogo
// ======================================================
function renderProducts() {
  dom.productGrid.innerHTML = "";
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    dom.productGrid.innerHTML = '<div class="cart-empty">No se encontraron productos con ese termino.</div>';
    return;
  }

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <div class="product-image-box">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="stock-pill">Stock: ${product.stock}</span>
      </div>
      <div class="product-body">
        <p class="product-name">${product.emoji} ${product.name}</p>
        <span class="price">${formatMoney(product.price)}</span>
        <p class="price-sub">Equivale a ${formatSecondaryMoney(product.price)}</p>
        <div class="product-actions">
          <button class="btn primary" data-action="add" data-id="${product.id}" ${product.stock === 0 ? "disabled" : ""}>
            Agregar
          </button>
          <button class="btn secondary" data-action="preview" data-id="${product.id}">
            Vista previa
          </button>
        </div>
      </div>
    `;

    // Si una imagen falla, usar una imagen de respaldo.
    const imageEl = card.querySelector("img");
    imageEl.addEventListener("error", () => {
      imageEl.src = "assets/products/generic-tech.svg";
    });

    dom.productGrid.appendChild(card);
  });
}

// ======================================================
// Render del carrito y totales
// ======================================================
function renderCart() {
  const entries = Object.entries(state.cart);

  if (entries.length === 0) {
    dom.cartItems.innerHTML = '<div class="cart-empty">Tu carrito esta vacio. Agrega productos. 🛍️</div>';
  } else {
    dom.cartItems.innerHTML = "";

    entries.forEach(([productId, qty]) => {
      const product = getProductById(productId);
      if (!product) {
        return;
      }

      const lineTotal = product.price * qty;
      const item = document.createElement("article");
      item.className = "cart-item";
      item.innerHTML = `
        <div>
          <h4>${product.emoji} ${product.name}</h4>
          <p>${formatMoney(product.price)} c/u | Linea: ${formatMoney(lineTotal)}</p>
        </div>
        <div class="qty-tools">
          <button class="btn ghost icon" data-action="dec" data-id="${product.id}" title="Restar">-</button>
          <span class="qty-number">${qty}</span>
          <button class="btn ghost icon" data-action="inc" data-id="${product.id}" title="Sumar" ${product.stock === 0 ? "disabled" : ""}>+</button>
          <button class="btn danger icon" data-action="remove" data-id="${product.id}" title="Eliminar">x</button>
        </div>
      `;
      dom.cartItems.appendChild(item);
    });
  }

  const subtotal = getSubtotalGtq();
  const extraOptions = getExtraOptionsSnapshot();
  const taxableBase = subtotal + extraOptions.extrasGtq;
  const iva = taxableBase * 0.12;
  const total = taxableBase + iva;

  dom.subtotalText.textContent = formatMoney(subtotal);
  dom.extrasText.textContent = formatMoney(extraOptions.extrasGtq);
  dom.ivaText.textContent = formatMoney(iva);
  dom.totalText.textContent = formatMoney(total);
  dom.registerTotal.textContent = formatMoney(total);
}

function renderCounters() {
  const totalAvailable = products.reduce((sum, product) => sum + product.stock, 0);
  dom.stockAvailable.textContent = String(totalAvailable);
  dom.stockCart.textContent = String(getCartCount());
}

function renderReceiptInfo() {
  if (!state.lastReceipt) {
    dom.receiptInfo.innerHTML = "Aun no hay pagos registrados.";
    return;
  }

  const receipt = state.lastReceipt;
  dom.receiptInfo.innerHTML = `
    <p><strong>Empresa:</strong> ${companyInfo.name}</p>
    <p><strong>Factura:</strong> ${receipt.id}</p>
    <p><strong>Cliente:</strong> ${receipt.buyerName}</p>
    <p><strong>Usuario:</strong> ${receipt.buyerUser}</p>
    <p><strong>Metodo:</strong> ${receipt.methodLabel}</p>
    <p><strong>Extras:</strong> ${formatMoneyByCurrency(receipt.extrasGtq, receipt.currency, receipt.exchangeRate)}</p>
    <p><strong>Fecha:</strong> ${receipt.dateText}</p>
    <p><strong>Total:</strong> ${formatMoneyByCurrency(receipt.totalGtq, receipt.currency, receipt.exchangeRate)}</p>
  `;
}

function renderAll() {
  renderProducts();
  renderCart();
  renderCounters();
  renderReceiptInfo();
}

// ======================================================
// Sonido de caja (mejorado)
// ======================================================
function playRegisterBeep() {
  if (state.volume <= 0) {
    return;
  }

  try {
    const ctx = ensureAudioContext();
    const now = ctx.currentTime;

    // Tono 1: campaneo agudo de la caja.
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "square";
    osc1.frequency.setValueAtTime(1280, now);
    osc1.frequency.exponentialRampToValueAtTime(820, now + 0.07);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(Math.max(0.001, state.volume * 0.14), now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    // Tono 2: refuerzo grave para que suene mas "caja".
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(460, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(280, now + 0.13);
    gain2.gain.setValueAtTime(0.0001, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(Math.max(0.001, state.volume * 0.1), now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc1.connect(gain1).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.1);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.16);
  } catch (error) {
    // Si un navegador bloquea audio sin interaccion, la app sigue funcionando.
  }
}

// Sonido adicional corto para confirmar "producto agregado".
function playAddSparkSound() {
  if (state.volume <= 0) {
    return;
  }

  try {
    const ctx = ensureAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(780, now);
    osc.frequency.exponentialRampToValueAtTime(1120, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(930, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, state.volume * 0.09), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (error) {
    // Ignora errores de audio para no afectar el flujo de compra.
  }
}

// ======================================================
// Acciones de carrito
// ======================================================
function addToCart(productId) {
  const product = getProductById(productId);
  if (!product || product.stock <= 0) {
    setPaymentMessage("No hay inventario disponible para este producto.", "error");
    return;
  }

  product.stock -= 1;
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  playRegisterBeep();
  setTimeout(playAddSparkSound, 55);
  renderAll();
}

function decreaseFromCart(productId) {
  const product = getProductById(productId);
  const qty = state.cart[productId];

  if (!product || !qty) {
    return;
  }

  product.stock += 1;
  if (qty === 1) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = qty - 1;
  }

  renderAll();
}

function removeLineFromCart(productId) {
  const product = getProductById(productId);
  const qty = state.cart[productId];

  if (!product || !qty) {
    return;
  }

  product.stock += qty;
  delete state.cart[productId];
  renderAll();
}

function clearCart(restoreStock = true) {
  if (restoreStock) {
    Object.entries(state.cart).forEach(([productId, qty]) => {
      const product = getProductById(productId);
      if (product) {
        product.stock += qty;
      }
    });
  }

  state.cart = {};
  renderAll();
}

// ======================================================
// Vista previa de producto
// ======================================================
function openPreview(productId) {
  const product = getProductById(productId);
  if (!product) {
    return;
  }

  dom.previewImage.src = product.image;
  dom.previewImage.alt = product.name;
  dom.previewImage.onerror = () => {
    dom.previewImage.src = "assets/products/generic-tech.svg";
    dom.previewImage.onerror = null;
  };
  dom.previewTitle.textContent = `${product.emoji} ${product.name}`;
  dom.previewPrice.textContent = `Precio: ${formatMoney(product.price)} (${formatSecondaryMoney(product.price)})`;
  dom.previewStock.textContent = `Stock actual: ${product.stock}`;
  dom.previewModal.classList.remove("hidden");
}

function closePreview() {
  dom.previewModal.classList.add("hidden");
}

// ======================================================
// Fecha/hora y mensajes
// ======================================================
function updateClock() {
  const now = new Date();
  const text = now.toLocaleString("es-GT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  dom.clockText.textContent = `Fecha y hora: ${text}`;
}

function setPaymentMessage(text, status = "") {
  dom.paymentMessage.textContent = text;
  dom.paymentMessage.classList.remove("ok", "error");
  if (status) {
    dom.paymentMessage.classList.add(status);
  }
}

// ======================================================
// Validaciones
// ======================================================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeName(value) {
  return value.replace(/\d+/g, "").replace(/\s{2,}/g, " ").trimStart();
}

function isValidName(name) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ.'\-\s]{3,}$/.test(name) && !/\d/.test(name);
}

// ======================================================
// Factura (snapshot)
// ======================================================
function createInvoiceId() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const seq = String(date.getTime()).slice(-5);
  return `FAC-${yy}${mm}${dd}-${seq}`;
}

function buildReceiptSnapshot(customerData) {
  const items = Object.entries(state.cart).map(([productId, qty]) => {
    const product = getProductById(productId);
    return {
      name: product ? product.name : productId,
      emoji: product ? product.emoji : "🧩",
      qty,
      priceGtq: product ? product.price : 0,
      lineTotalGtq: product ? product.price * qty : 0
    };
  });

  const extraOptions = getExtraOptionsSnapshot();
  const subtotalGtq = getSubtotalGtq();
  const taxableBaseGtq = subtotalGtq + extraOptions.extrasGtq;
  const ivaGtq = taxableBaseGtq * 0.12;
  const totalGtq = taxableBaseGtq + ivaGtq;
  const methodMap = {
    card: "Tarjeta",
    transfer: "Transferencia",
    cash: "Efectivo"
  };

  return {
    id: createInvoiceId(),
    dateIso: new Date().toISOString(),
    dateText: new Date().toLocaleString("es-GT"),
    buyerName: customerData.buyerName,
    buyerUser: customerData.buyerUser,
    method: customerData.method,
    methodLabel: methodMap[customerData.method] || customerData.method,
    currency: state.currency,
    exchangeRate: state.exchangeRate,
    items,
    extras: extraOptions,
    extrasGtq: extraOptions.extrasGtq,
    subtotalGtq,
    ivaGtq,
    totalGtq
  };
}

// ======================================================
// Comportamiento de pago
// ======================================================
function updateAccountInfo() {
  const selected = getAccountByUsername(dom.buyerAccount.value);

  if (!selected) {
    dom.accountInfo.textContent = "Selecciona un usuario para ver usuario y clave.";
    return;
  }

  dom.accountInfo.textContent = `Usuario: ${selected.username} | Clave: ${selected.password} | Tipo: ${selected.label}`;
}

function animateCartFly() {
  dom.cartFly.classList.remove("hidden");
  dom.cartFly.classList.remove("show");

  // Forzar reflow para reiniciar animacion si se repite.
  void dom.cartFly.offsetWidth;

  dom.cartFly.classList.add("show");

  setTimeout(() => {
    dom.cartFly.classList.remove("show");
    dom.cartFly.classList.add("hidden");
  }, 1200);
}

function openPaymentPanel() {
  if (Object.keys(state.cart).length === 0) {
    setPaymentMessage("Primero agrega productos al carrito para pagar.", "error");
    return;
  }

  dom.paymentDetails.open = true;
  animateCartFly();
  playRegisterBeep();
  dom.paymentDetails.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handlePaymentSubmit(event) {
  event.preventDefault();

  if (Object.keys(state.cart).length === 0) {
    setPaymentMessage("No puedes pagar con el carrito vacio.", "error");
    return;
  }

  const buyerName = sanitizeName(document.getElementById("buyerName").value.trim());
  dom.buyerName.value = buyerName;
  const buyerEmail = document.getElementById("buyerEmail").value.trim();
  const selectedAccount = getAccountByUsername(dom.buyerAccount.value);
  const method = dom.paymentMethod.value;

  if (!isValidName(buyerName)) {
    setPaymentMessage("Ingresa un nombre valido sin digitos (solo letras y espacios).", "error");
    return;
  }

  if (!isValidEmail(buyerEmail)) {
    setPaymentMessage("El correo no tiene formato valido.", "error");
    return;
  }

  if (!selectedAccount) {
    setPaymentMessage("Debes seleccionar un usuario predefinido.", "error");
    return;
  }

  // Genera y guarda factura de la compra validada.
  const receipt = buildReceiptSnapshot({
    buyerName,
    buyerUser: selectedAccount.username,
    method
  });

  state.lastReceipt = receipt;

  // Compra finalizada: no se devuelve inventario.
  clearCart(false);
  renderReceiptInfo();

  dom.paymentForm.reset();
  dom.paymentMethod.value = "card";
  updateAccountInfo();

  setPaymentMessage(
    `Pago validado. Factura ${receipt.id} generada para ${buyerName}.`,
    "ok"
  );
}

// ======================================================
// PDF: formato de factura mas formal
// ======================================================
function drawInvoiceLogo(doc) {
  // Paleta principal.
  doc.setFillColor(255, 236, 200);
  doc.setDrawColor(255, 221, 174);
  doc.circle(178, 15, 7, "FD");

  // Hueco de la paleta.
  doc.setFillColor(23, 42, 70);
  doc.circle(181, 17, 1.1, "F");

  // Manchas de color en la paleta.
  doc.setFillColor(255, 115, 130);
  doc.circle(175.5, 12.4, 0.9, "F");
  doc.setFillColor(88, 203, 255);
  doc.circle(178.8, 11.5, 0.9, "F");
  doc.setFillColor(103, 236, 190);
  doc.circle(181.2, 13.4, 0.9, "F");
  doc.setFillColor(255, 192, 92);
  doc.circle(175.9, 16.5, 0.9, "F");

  // Dos pinceles cruzados.
  doc.setDrawColor(255, 247, 225);
  doc.setLineWidth(1.3);
  doc.line(188.6, 9.8, 198, 20.2);
  doc.line(187.4, 20.2, 197.6, 10.4);

  // Cerdas de los pinceles.
  doc.setDrawColor(239, 167, 80);
  doc.line(198, 20.2, 200.1, 22.5);
  doc.setDrawColor(120, 198, 255);
  doc.line(197.6, 10.4, 199.9, 8.1);
}

function drawInvoiceHeader(doc, receipt) {
  // Banda superior de titulo.
  doc.setFillColor(23, 42, 70);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FACTURA ELECTRONICA", 14, 14);

  doc.setFontSize(11);
  doc.text(companyInfo.name, 14, 22);
  drawInvoiceLogo(doc);

  doc.setTextColor(20, 30, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`NIT: ${companyInfo.nit}`, 14, 38);
  doc.text(`Direccion: ${companyInfo.address}`, 14, 44);
  doc.text(`Telefono: ${companyInfo.phone}`, 14, 50);
  doc.text(`Email: ${companyInfo.email}`, 14, 56);

  doc.setFont("helvetica", "bold");
  doc.text(`No. Factura: ${receipt.id}`, 130, 38);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${receipt.dateText}`, 130, 44);
  doc.text(`Metodo: ${receipt.methodLabel}`, 130, 50);
}

function drawClientBox(doc, receipt) {
  doc.setDrawColor(170, 184, 205);
  doc.roundedRect(14, 62, 182, 30, 2, 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Datos del cliente", 16, 69);

  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${receipt.buyerName}`, 16, 75);
  doc.text(`Usuario: ${receipt.buyerUser}`, 110, 75);
  const deliveryLabel = receipt.extras && receipt.extras.delivery === "express" ? "Express" : "Normal";
  const extrasLabel = `Entrega: ${deliveryLabel} | Regalo: ${receipt.extras && receipt.extras.giftWrap ? "Si" : "No"} | Soporte: ${receipt.extras && receipt.extras.prioritySupport ? "Si" : "No"}`;
  doc.text(extrasLabel, 16, 83);
  if (receipt.extras && receipt.extras.note) {
    const shortNote = receipt.extras.note.slice(0, 58);
    doc.text(`Nota: ${shortNote}`, 16, 89);
  }
}

function drawItemsTable(doc, receipt) {
  let y = receipt.extras && receipt.extras.note ? 100 : 94;

  // Encabezado de tabla.
  doc.setFillColor(236, 244, 255);
  doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("#", 16, y + 5.5);
  doc.text("Producto", 24, y + 5.5);
  doc.text("Cant.", 122, y + 5.5);
  doc.text("P/U", 145, y + 5.5);
  doc.text("Total", 172, y + 5.5);

  y += 10;
  doc.setFont("helvetica", "normal");

  receipt.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.text(String(index + 1), 16, y);
    doc.text(`${item.emoji} ${item.name}`, 24, y);
    doc.text(String(item.qty), 124, y);
    doc.text(
      formatMoneyByCurrency(item.priceGtq, receipt.currency, receipt.exchangeRate),
      144,
      y,
      { align: "right" }
    );
    doc.text(
      formatMoneyByCurrency(item.lineTotalGtq, receipt.currency, receipt.exchangeRate),
      194,
      y,
      { align: "right" }
    );

    y += 7;
  });

  return y;
}

function drawInvoiceTotals(doc, y, receipt) {
  const boxY = Math.min(y + 4, 240);

  doc.setDrawColor(170, 184, 205);
  doc.roundedRect(120, boxY, 76, 38, 2, 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Subtotal:", 124, boxY + 8);
  doc.text(
    formatMoneyByCurrency(receipt.subtotalGtq, receipt.currency, receipt.exchangeRate),
    194,
    boxY + 8,
    { align: "right" }
  );

  doc.text("IVA 12%:", 124, boxY + 15);
  doc.text(
    formatMoneyByCurrency(receipt.ivaGtq, receipt.currency, receipt.exchangeRate),
    194,
    boxY + 15,
    { align: "right" }
  );

  doc.text("Extras:", 124, boxY + 22);
  doc.text(
    formatMoneyByCurrency(receipt.extrasGtq || 0, receipt.currency, receipt.exchangeRate),
    194,
    boxY + 22,
    { align: "right" }
  );

  doc.setFont("helvetica", "bold");
  doc.text("Total:", 124, boxY + 31);
  doc.text(
    formatMoneyByCurrency(receipt.totalGtq, receipt.currency, receipt.exchangeRate),
    194,
    boxY + 31,
    { align: "right" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Tipo de cambio: 1 USD = GTQ ${receipt.exchangeRate.toFixed(2)}`, 14, boxY + 34);
}

function generatePdfReceipt() {
  let receipt = state.lastReceipt;

  // Si aun no hay pago validado, se permite una factura previa.
  if (!receipt && Object.keys(state.cart).length > 0) {
    receipt = buildReceiptSnapshot({
      buyerName: "Compra pendiente",
      buyerUser: "sin-validar",
      method: "card"
    });
  }

  if (!receipt) {
    setPaymentMessage("No hay datos para generar factura PDF.", "error");
    return;
  }

  const jsPdfApi = window.jspdf && window.jspdf.jsPDF;
  if (!jsPdfApi) {
    setPaymentMessage("No se pudo cargar jsPDF. Revisa tu conexion a internet.", "error");
    return;
  }

  const doc = new jsPdfApi();

  drawInvoiceHeader(doc, receipt);
  drawClientBox(doc, receipt);
  const lastY = drawItemsTable(doc, receipt);
  drawInvoiceTotals(doc, lastY, receipt);

  doc.save(`factura_${receipt.id}.pdf`);
  setPaymentMessage(`Factura PDF generada: factura_${receipt.id}.pdf`, "ok");
}

// ======================================================
// Tema
// ======================================================
function applyTheme() {
  const isDark = state.theme === "dark";
  document.body.classList.toggle("dark", isDark);

  // El texto del boton muestra hacia donde cambiara.
  dom.themeToggle.textContent = isDark ? "☀️ Cambiar a claro" : "🌙 Cambiar a oscuro";
  localStorage.setItem("theme", state.theme);
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
}

// ======================================================
// Eventos sobre tarjetas/carrito
// ======================================================
function handleProductGridClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const productId = button.dataset.id;
  if (!action || !productId) {
    return;
  }

  if (action === "add") {
    addToCart(productId);
    return;
  }

  if (action === "preview") {
    openPreview(productId);
  }
}

function handleCartClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const productId = button.dataset.id;
  if (!action || !productId) {
    return;
  }

  if (action === "inc") {
    addToCart(productId);
    return;
  }

  if (action === "dec") {
    decreaseFromCart(productId);
    return;
  }

  if (action === "remove") {
    removeLineFromCart(productId);
  }
}

// ======================================================
// Inicio de la app
// ======================================================
function init() {
  dom.currencySelect.value = state.currency;
  dom.exchangeRateInput.value = state.exchangeRate.toFixed(2);
  dom.volumeRange.value = String(state.volume);

  applyTheme();
  updateAccountInfo();
  updateClock();
  setInterval(updateClock, 1000);

  dom.productGrid.addEventListener("click", handleProductGridClick);
  dom.cartItems.addEventListener("click", handleCartClick);
  dom.clearCartBtn.addEventListener("click", () => clearCart(true));
  dom.pdfBtn.addEventListener("click", generatePdfReceipt);
  dom.openPayBtn.addEventListener("click", openPaymentPanel);
  dom.themeToggle.addEventListener("click", toggleTheme);
  dom.paymentForm.addEventListener("submit", handlePaymentSubmit);
  dom.buyerAccount.addEventListener("change", updateAccountInfo);
  dom.buyerName.addEventListener("input", (event) => {
    event.target.value = sanitizeName(event.target.value);
  });

  // Recalcula totales cuando cambian opciones extra.
  [dom.deliveryOption, dom.giftWrapOption, dom.prioritySupportOption, dom.invoiceCopyOption, dom.orderNote]
    .filter(Boolean)
    .forEach((element) => {
      element.addEventListener("input", renderCart);
      element.addEventListener("change", renderCart);
    });

  // Filtro en tiempo real del catalogo.
  dom.productSearch.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderProducts();
  });

  dom.currencySelect.addEventListener("change", (event) => {
    state.currency = event.target.value;
    localStorage.setItem("currency", state.currency);
    renderAll();
  });

  dom.exchangeRateInput.addEventListener("input", (event) => {
    const nextValue = Number(event.target.value);
    if (!Number.isFinite(nextValue) || nextValue <= 0) {
      return;
    }
    state.exchangeRate = nextValue;
    localStorage.setItem("exchangeRate", String(nextValue));
    renderAll();
  });

  dom.volumeRange.addEventListener("input", (event) => {
    state.volume = Number(event.target.value);
    localStorage.setItem("volume", String(state.volume));
  });

  dom.closePreviewBtn.addEventListener("click", closePreview);
  dom.previewModal.addEventListener("click", (event) => {
    if (event.target === dom.previewModal) {
      closePreview();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePreview();
    }
  });

  renderAll();
}

init();
