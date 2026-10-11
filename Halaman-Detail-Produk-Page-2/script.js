"use strict";

import { fetchProduct, ProductApiError } from "./api/products.js";

const staticGalleryImages = [
  {
    src: "assets/molecule-01-champaca-bottle.jpg",
    alt: "Botol parfum Molecule 01 + Champaca",
    label: "botol parfum",
  },
  {
    src: "assets/molecule-01-champaca-detail.jpg",
    alt: "Detail parfum Molecule 01 + Champaca",
    label: "detail parfum",
  },
  {
    src: "assets/molecule-01-champaca-box.jpg",
    alt: "Botol dan kemasan Molecule 01 + Champaca",
    label: "botol dan kemasan",
  },
];

const mainImage = document.querySelector(".main-image");
const thumbnails = [...document.querySelectorAll(".thumbnail")];
const imageCounter = document.querySelector(".gallery-count");
const quantityOutput = document.querySelector("#quantity");
const decreaseButton = document.querySelector("#decrease-quantity");
const increaseButton = document.querySelector("#increase-quantity");
const subtotalOutput = document.querySelector("#subtotal");
const buttonTotal = document.querySelector("#button-total");
const addToBagButton = document.querySelector("#add-to-bag");
const wishlistButton = document.querySelector("#wishlist");
const wishlistLabel = wishlistButton.querySelector(".wishlist-label");
const headerWishlistButton = document.querySelector(".wishlist-header");
const feedback = document.querySelector("#action-feedback");
const menuButton = document.querySelector(".menu-button");
const menuPanel = document.querySelector("#site-navigation");
const quantityGroup = document.querySelector(".quantity-control");
const gallery = document.querySelector(".gallery");
const title = document.querySelector("#product-title");
const breadcrumbTitle = document.querySelector("#breadcrumb-product-name");
const priceOutput = document.querySelector(".price");
const sizeLabel = document.querySelector("#size-label");
const sizeValue = document.querySelector(".size-value");
const variantSelect = document.querySelector("#variant-select");
const description = document.querySelector("#product-description");
const loadStatus = document.querySelector("#product-load-status");
const retryButton = document.querySelector("#retry-product");
const product = {
  state: "loading",
  data: null,
  images: [...staticGalleryImages],
  selectedVariant: 0,
  selectedImage: 0,
  quantity: 0,
  requestId: null,
  retryCount: 0,
};

function setLoadStatus(state, message) {
  product.state = state;
  loadStatus.dataset.state = state;
  loadStatus.textContent = message;
  loadStatus.hidden = state === "ready";
  retryButton.hidden = state !== "error";
}

function logProductError(error) {
  const diagnostics = {
    code: error instanceof ProductApiError ? error.code : "UNEXPECTED_ERROR",
    requestId: error instanceof ProductApiError ? error.requestId : null,
  };
  console.error("Product detail could not be loaded.", diagnostics);
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: product.data.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getSelectedVariantLabel() {
  return product.data.variants.colorOrSize[product.selectedVariant];
}

function resolveImageSource(source) {
  return new URL(source.replace(/^\/+/, ""), document.baseURI).href;
}

function announceChange() {
  feedback.hidden = true;
  feedback.textContent = "";
}

function setImage(index) {
  product.selectedImage =
    (index + product.images.length) % product.images.length;
  const image = product.images[product.selectedImage];

  mainImage.dataset.fallback = "false";
  mainImage.src = image.src;
  mainImage.alt = image.alt;
  imageCounter.textContent =
    `${String(product.selectedImage + 1).padStart(2, "0")} / ` +
    `${String(product.images.length).padStart(2, "0")}`;

  thumbnails.forEach((thumbnail, thumbnailIndex) => {
    const isSelected = thumbnailIndex === product.selectedImage;
    thumbnail.classList.toggle("is-active", isSelected);
    thumbnail.setAttribute("aria-pressed", String(isSelected));
  });

  announceChange();
}

function updatePurchaseControls() {
  const hasProduct = ["ready", "outOfStock"].includes(product.state) &&
    Boolean(product.data);
  const available = hasProduct && product.data.variants.quantity > 0;
  const maxQuantity = available ? product.data.variants.quantity : 0;
  if (!available) product.quantity = 0;
  else if (product.quantity < 1) product.quantity = 1;
  else product.quantity = Math.min(product.quantity, maxQuantity);

  const selectedLabel = available ? getSelectedVariantLabel() : "";
  quantityOutput.value = String(product.quantity);
  quantityOutput.textContent = String(product.quantity);
  const total = available ? product.data.price * product.quantity : 0;
  subtotalOutput.textContent = available ? formatPrice(total) : "—";
  buttonTotal.textContent = available ? formatPrice(total) : "";
  decreaseButton.disabled = !available || product.quantity <= 1;
  increaseButton.disabled = !available || product.quantity >= maxQuantity;
  variantSelect.disabled = !available;
  addToBagButton.disabled = !available;
  decreaseButton.setAttribute(
    "aria-label",
    `Decrease quantity for ${product.data?.name ?? "product"}`,
  );
  increaseButton.setAttribute(
    "aria-label",
    !available
      ? "Product unavailable"
      : product.quantity >= maxQuantity
        ? `Maximum quantity ${maxQuantity}`
        : `Increase quantity for ${product.data.name}`,
  );
  addToBagButton.setAttribute(
    "aria-label",
    available
      ? `Add ${product.quantity} ${selectedLabel} ${product.data.name} to bag for ${formatPrice(total)}`
      : "Product unavailable",
  );
  loadStatus.dataset.stock = available ? "in-stock" : "out-of-stock";
  if (product.data && product.data.variants.quantity === 0) {
    product.state = "outOfStock";
  } else if (hasProduct) {
    product.state = "ready";
  }
  loadStatus.textContent = available ? "" : "Tidak tersedia";
  loadStatus.hidden = available;
}

function renderProduct(data) {
  const restoreFocusToTitle = document.activeElement === loadStatus;
  product.data = data;
  product.selectedVariant = 0;
  product.quantity = data.variants.quantity > 0 ? 1 : 0;
  product.images = [
    {
      src: resolveImageSource(data.image),
      alt: data.name,
      label: "foto utama",
    },
    ...staticGalleryImages.slice(1),
  ];

  title.textContent = data.name;
  breadcrumbTitle.textContent = data.name;
  document.title = `${data.name} — Escentric Molecules`;
  document.querySelector(".gallery").setAttribute(
    "aria-label",
    `Galeri ${data.name}`,
  );
  priceOutput.textContent = formatPrice(data.price);
  sizeLabel.textContent =
    data.variants.colorOrSize.length > 1 ? "Size / color" : "Size";
  sizeValue.textContent = data.variants.colorOrSize[0];
  description.textContent = data.description;
  variantSelect.replaceChildren();
  data.variants.colorOrSize.forEach((variant, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = variant;
    variantSelect.append(option);
  });
  variantSelect.hidden = data.variants.colorOrSize.length <= 1;
  sizeValue.hidden = !variantSelect.hidden;

  thumbnails.forEach((thumbnail, index) => {
    const image = product.images[index];
    const thumbnailImage = thumbnail.querySelector("img");
    thumbnail.setAttribute(
      "aria-label",
      `Foto ${index + 1}: ${image.label}`,
    );
    if (index === 0) thumbnailImage.src = image.src;
    thumbnailImage.alt = "";
  });

  setLoadStatus("ready", "");
  setImage(0);
  updatePurchaseControls();
  if (restoreFocusToTitle) title.focus();
}

async function loadProduct() {
  setLoadStatus(
    "loading",
    product.retryCount > 0 ? "Mencoba memuat ulang produk…" : "Memuat detail produk…",
  );
  addToBagButton.disabled = true;
  decreaseButton.disabled = true;
  increaseButton.disabled = true;
  variantSelect.disabled = true;
  try {
    const result = await fetchProduct(1);
    product.requestId = result.requestId;
    product.retryCount = 0;
    renderProduct(result.product);
  } catch (error) {
    logProductError(error);
    setLoadStatus(
      "error",
      error instanceof ProductApiError && error.code === "PRODUCT_NOT_FOUND"
        ? "Produk tidak ditemukan. Silakan coba lagi."
        : "Detail produk tidak dapat dimuat. Periksa koneksi lalu coba lagi.",
    );
    if (document.activeElement === loadStatus) retryButton.focus();
    product.data = null;
    product.quantity = 0;
    quantityOutput.value = "0";
    quantityOutput.textContent = "0";
    subtotalOutput.textContent = "—";
    buttonTotal.textContent = "";
    variantSelect.disabled = true;
    addToBagButton.disabled = true;
    decreaseButton.disabled = true;
    increaseButton.disabled = true;
  }
}

function onMainImageError() {
  if (mainImage.dataset.fallback === "true") return;
  mainImage.dataset.fallback = "true";
  mainImage.src = "assets/molecule-01-champaca-bottle.jpg";
  mainImage.alt = "Foto produk tidak dapat dimuat.";
  logProductError(new ProductApiError("Product image failed to load.", {
    code: "IMAGE_LOAD_ERROR",
    requestId: product.requestId,
  }));
  setLoadStatus("error", "Foto produk tidak dapat dimuat. Silakan coba lagi.");
  addToBagButton.disabled = true;
  variantSelect.disabled = true;
  increaseButton.disabled = true;
  decreaseButton.disabled = true;
}

thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener("click", () => setImage(index));
});

gallery.querySelector(".gallery-arrow--previous").addEventListener("click", () => {
  setImage(product.selectedImage - 1);
});

gallery.querySelector(".gallery-arrow--next").addEventListener("click", () => {
  setImage(product.selectedImage + 1);
});

mainImage.addEventListener("error", onMainImageError);
retryButton.addEventListener("click", () => {
  product.retryCount += 1;
  loadStatus.tabIndex = -1;
  loadStatus.focus();
  loadProduct();
});

variantSelect.addEventListener("change", () => {
  product.selectedVariant = Number(variantSelect.value);
  sizeValue.textContent = getSelectedVariantLabel();
  product.quantity = product.data.variants.quantity > 0 ? 1 : 0;
  updatePurchaseControls();
  announceChange();
});

decreaseButton.addEventListener("click", () => {
  if (product.quantity > 1) {
    product.quantity -= 1;
    updatePurchaseControls();
    announceChange();
  }
});

increaseButton.addEventListener("click", () => {
  if (
    product.data &&
    product.quantity < product.data.variants.quantity
  ) {
    product.quantity += 1;
    updatePurchaseControls();
    announceChange();
  }
});

quantityGroup.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    increaseButton.click();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    decreaseButton.click();
  }
});

addToBagButton.addEventListener("click", () => {
  if (
    product.state !== "ready" ||
    !product.data ||
    product.quantity < 1 ||
    product.quantity > product.data.variants.quantity
  ) {
    return;
  }
  feedback.textContent =
    `${product.quantity} × ${getSelectedVariantLabel()} ${product.data.name} — ` +
    `${formatPrice(product.data.price * product.quantity)}. ` +
    "Demo only: no item has been added to a cart and no order has been placed.";
  feedback.hidden = false;
});

wishlistButton.addEventListener("click", () => {
  const isPressed = wishlistButton.getAttribute("aria-pressed") === "true";
  const nextIsPressed = !isPressed;

  wishlistButton.setAttribute("aria-pressed", String(nextIsPressed));
  wishlistButton.setAttribute(
    "aria-label",
    nextIsPressed ? "Remove from wishlist" : "Add to wishlist",
  );
  wishlistLabel.textContent = nextIsPressed
    ? "Added to wishlist"
    : "Add to wishlist";
  headerWishlistButton.setAttribute("aria-pressed", String(nextIsPressed));
  headerWishlistButton.setAttribute(
    "aria-label",
    nextIsPressed ? "Remove from wishlist" : "Add to wishlist",
  );
  announceChange();
  feedback.textContent = nextIsPressed
    ? "Added to your wishlist for this demo. Your selection will not be saved."
    : "Removed from your wishlist.";
  feedback.hidden = false;
});

headerWishlistButton.addEventListener("click", () => {
  wishlistButton.click();
});

menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  menuPanel.hidden = isExpanded;
});

menuPanel.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuButton.setAttribute("aria-expanded", "false");
    menuPanel.hidden = true;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menuPanel.hidden) {
    menuButton.setAttribute("aria-expanded", "false");
    menuPanel.hidden = true;
    menuButton.focus();
  }
});

document.querySelector("#current-year").textContent = String(
  new Date().getFullYear(),
);

loadProduct();
