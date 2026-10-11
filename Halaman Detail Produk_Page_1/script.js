"use strict";

const product = {
  unitPrice: 135,
  currency: "GBP",
  locale: "en-GB",
  size: "100 ml",
  maxQuantity: 10,
  images: [
    {
      src: "assets/molecule-01-champaca-bottle.jpg",
      alt: "Botol parfum Molecule 01 + Champaca 100 ml",
      label: "botol parfum",
    },
    {
      src: "assets/molecule-01-champaca-detail.jpg",
      alt: "Detail produk Molecule 01 + Champaca",
      label: "detail parfum",
    },
    {
      src: "assets/molecule-01-champaca-box.jpg",
      alt: "Botol dan kemasan Molecule 01 + Champaca",
      label: "botol dan kemasan",
    },
  ],
};

const formatPrice = new Intl.NumberFormat(product.locale, {
  style: "currency",
  currency: product.currency,
  maximumFractionDigits: 0,
});

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

let selectedImage = 0;
let quantity = 1;

function announceChange() {
  feedback.hidden = true;
  feedback.textContent = "";
}

function setImage(index) {
  selectedImage = (index + product.images.length) % product.images.length;
  const image = product.images[selectedImage];

  mainImage.src = image.src;
  mainImage.alt = image.alt;
  imageCounter.innerHTML = `${String(selectedImage + 1).padStart(2, "0")} <span aria-hidden="true">/</span> ${String(product.images.length).padStart(2, "0")}`;

  thumbnails.forEach((thumbnail, thumbnailIndex) => {
    const isSelected = thumbnailIndex === selectedImage;
    thumbnail.classList.toggle("is-active", isSelected);
    thumbnail.setAttribute("aria-pressed", String(isSelected));
  });

  announceChange();
}

function renderQuantity() {
  const total = product.unitPrice * quantity;

  quantityOutput.value = String(quantity);
  quantityOutput.textContent = String(quantity);
  subtotalOutput.textContent = formatPrice.format(total);
  buttonTotal.textContent = formatPrice.format(total);
  decreaseButton.disabled = quantity <= 1;
  increaseButton.disabled = quantity >= product.maxQuantity;
  increaseButton.setAttribute(
    "aria-label",
    quantity >= product.maxQuantity
      ? `Maximum quantity ${product.maxQuantity}`
      : "Increase quantity for Molecule 01 + Champaca",
  );
  announceChange();
}

thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener("click", () => setImage(index));
});

gallery.querySelector(".gallery-arrow--previous").addEventListener("click", () => {
  setImage(selectedImage - 1);
});

gallery.querySelector(".gallery-arrow--next").addEventListener("click", () => {
  setImage(selectedImage + 1);
});

decreaseButton.addEventListener("click", () => {
  if (quantity > 1) {
    quantity -= 1;
    renderQuantity();
  }
});

increaseButton.addEventListener("click", () => {
  if (quantity < product.maxQuantity) {
    quantity += 1;
    renderQuantity();
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
  feedback.textContent = `${quantity} × Molecule 01 + Champaca, ${product.size} — ${formatPrice.format(product.unitPrice * quantity)}. Demo only: no item has been added to a cart and no order has been placed.`;
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
  headerWishlistButton.setAttribute(
    "aria-pressed",
    String(nextIsPressed),
  );
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
