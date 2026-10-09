"use strict";

const CART_STORAGE_KEY = "carrito";
const currency = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
});

function loadCart() {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (!storedCart) return [];

        const parsedCart = JSON.parse(storedCart);
        if (!Array.isArray(parsedCart)) {
            throw new TypeError("El contenido guardado del carrito no es una lista.");
        }

        return parsedCart.filter((product) =>
            product &&
            typeof product.id === "string" &&
            typeof product.nombre === "string" &&
            Number.isFinite(Number(product.precio)) &&
            Number(product.precio) >= 0 &&
            Number.isInteger(Number(product.cantidad)) &&
            Number(product.cantidad) > 0
        ).map((product) => ({
            id: product.id,
            nombre: product.nombre,
            precio: Number(product.precio),
            cantidad: Number(product.cantidad)
        }));
    } catch (error) {
        console.error("No se pudo recuperar el carrito guardado.", error);
        return [];
    }
}

let carrito = loadCart();
let noticeTimeout;

function announce(message) {
    let notice = document.querySelector(".site-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.className = "site-notice";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");
        document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.classList.add("is-visible");
    window.clearTimeout(noticeTimeout);
    noticeTimeout = window.setTimeout(() => notice.classList.remove("is-visible"), 3200);
}

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
    } catch (error) {
        console.error("No se pudo guardar el carrito en este dispositivo.", error);
        announce("No se pudo guardar el carrito en este dispositivo.");
    }
}

function updateCartCount() {
    const count = carrito.reduce((sum, product) => sum + product.cantidad, 0);
    document.querySelectorAll("#cart-count").forEach((counter) => {
        counter.textContent = String(count);
    });
}

function updateCatalogueQuantities() {
    document.querySelectorAll(".product-card[data-id]").forEach((card) => {
        const product = carrito.find((item) => item.id === card.dataset.id);
        const display = card.querySelector(".quantity-display");
        if (display) display.textContent = String(product ? product.cantidad : 0);
    });
}

function formatMoney(amount) {
    return currency.format(amount);
}

function addProduct(id, name, price) {
    if (!id || !name || !Number.isFinite(price) || price < 0) {
        console.error("No se puede añadir un producto con datos inválidos.");
        announce("No se pudo añadir el producto. Inténtalo de nuevo.");
        return;
    }

    const product = carrito.find((item) => item.id === id);
    if (product) {
        product.cantidad += 1;
    } else {
        carrito.push({ id, nombre: name, precio: price, cantidad: 1 });
    }

    saveCart();
    refreshCart();
    announce(`${name} añadido a la cesta.`);
}

function removeProduct(id) {
    const product = carrito.find((item) => item.id === id);
    if (!product) return;

    product.cantidad -= 1;
    if (product.cantidad <= 0) {
        carrito = carrito.filter((item) => item.id !== id);
    }

    saveCart();
    refreshCart();
}

function createCartItem(product) {
    const item = document.createElement("article");
    item.className = "cart-item";

    const details = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = product.nombre;
    const unitPrice = document.createElement("p");
    unitPrice.textContent = `${formatMoney(product.precio)} por unidad`;
    details.append(name, unitPrice);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls quantity-buttons";

    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.type = "button";
    removeButton.dataset.cartAction = "remove";
    removeButton.dataset.id = product.id;
    removeButton.setAttribute("aria-label", `Quitar una unidad de ${product.nombre}`);
    removeButton.textContent = "−";

    const quantity = document.createElement("span");
    quantity.className = "quantity-display";
    quantity.textContent = String(product.cantidad);

    const addButton = document.createElement("button");
    addButton.className = "icon-button";
    addButton.type = "button";
    addButton.dataset.cartAction = "add";
    addButton.dataset.id = product.id;
    addButton.setAttribute("aria-label", `Añadir una unidad de ${product.nombre}`);
    addButton.textContent = "+";
    controls.append(removeButton, quantity, addButton);

    const subtotal = document.createElement("strong");
    subtotal.textContent = formatMoney(product.precio * product.cantidad);
    item.append(details, controls, subtotal);
    return item;
}

function renderCart() {
    const itemList = document.getElementById("cart-products");
    const summary = document.getElementById("cart-summary");
    const total = document.getElementById("cart-total");
    const checkout = document.getElementById("checkout");
    if (!itemList || !summary || !total || !checkout) return;

    itemList.replaceChildren();
    summary.replaceChildren();

    if (carrito.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-cart";
        const heading = document.createElement("h3");
        heading.textContent = "Tu cesta está vacía";
        const description = document.createElement("p");
        description.textContent = "Elige algo rico y lo encontrarás aquí.";
        const link = document.createElement("a");
        link.className = "button button-small";
        link.href = "catalogo.html";
        link.textContent = "Explorar el catálogo";
        empty.append(heading, description, link);
        itemList.appendChild(empty);
        total.textContent = formatMoney(0);
        checkout.disabled = true;
        return;
    }

    let cartTotal = 0;
    carrito.forEach((product) => {
        const subtotal = product.precio * product.cantidad;
        cartTotal += subtotal;
        itemList.appendChild(createCartItem(product));

        const row = document.createElement("div");
        row.className = "summary-row";
        const label = document.createElement("span");
        label.textContent = `${product.nombre} × ${product.cantidad}`;
        const amount = document.createElement("strong");
        amount.textContent = formatMoney(subtotal);
        row.append(label, amount);
        summary.appendChild(row);
    });

    total.textContent = formatMoney(cartTotal);
    checkout.disabled = false;
}

function refreshCart() {
    updateCartCount();
    updateCatalogueQuantities();
    renderCart();
}

function setupNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (!toggle || !nav) return;

    const closeMenu = () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
        nav.classList.remove("is-open");
    };

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
        nav.classList.toggle("is-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".header")) closeMenu();
    });
}

function setupProductButtons() {
    document.querySelectorAll(".product-card[data-id]").forEach((card) => {
        const minus = card.querySelector(".minus");
        const plus = card.querySelector(".plus");
        const quickAdd = card.querySelector(".quick-add");
        const addLink = card.querySelector('a.text-button[href="carrito.html"]');
        if (plus) {
            plus.addEventListener("click", () => {
                addProduct(card.dataset.id, card.dataset.name, Number(card.dataset.price));
            });
        }
        if (quickAdd) {
            quickAdd.addEventListener("click", () => {
                addProduct(card.dataset.id, card.dataset.name, Number(card.dataset.price));
            });
        }
        if (addLink) {
            addLink.addEventListener("click", () => {
                addProduct(card.dataset.id, card.dataset.name, Number(card.dataset.price));
            });
        }
        if (minus) minus.addEventListener("click", () => removeProduct(card.dataset.id));
    });

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-cart-action]");
        if (!button) return;
        const product = carrito.find((item) => item.id === button.dataset.id);
        if (!product) return;
        if (button.dataset.cartAction === "add") {
            addProduct(product.id, product.nombre, product.precio);
        } else if (button.dataset.cartAction === "remove") {
            removeProduct(product.id);
        }
    });
}

function setupCartActions() {
    const clearButton = document.getElementById("clear-cart");
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            if (carrito.length === 0) return;
            carrito = [];
            saveCart();
            refreshCart();
            announce("Has vaciado la cesta.");
        });
    }

    const checkout = document.getElementById("checkout");
    if (checkout) {
        checkout.addEventListener("click", () => {
            if (carrito.length === 0) return;
            const total = carrito.reduce((sum, product) => sum + product.precio * product.cantidad, 0);
            const lines = carrito.map((product) =>
                `${product.nombre} x ${product.cantidad}: ${formatMoney(product.precio * product.cantidad)}`
            );
            lines.push("", `Total: ${formatMoney(total)}`);
            const subject = encodeURIComponent("Pedido | Panadería de Marco");
            const body = encodeURIComponent(`Hola, quisiera realizar este pedido:\n\n${lines.join("\n")}`);
            window.location.href = `mailto:panaderiademarco@gmail.com?subject=${subject}&body=${body}`;
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupProductButtons();
    setupCartActions();
    refreshCart();
});
