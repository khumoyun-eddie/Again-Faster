class Cart {
  formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  async fetchAPI(api, formData) {
    const response = await fetch(`/cart/${api}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    return await response.json();
  }

  addItem(formData) {
    return this.fetchAPI("add.js", formData);
  }

  changeItem(formData) {
    return this.fetchAPI("change.js", formData);
  }

  async getCartDetails() {
    const response = await fetch(`/cart.js`);
    return response.json();
  }

  async getProduct(handle) {
    const response = await fetch(`/products/${handle}.js`);
    return response.json();
  }

  async updateCart() {
    const cartDetails = await this.getCartDetails();
    this.renderCartItems(cartDetails);
    // this.addCartItemCount()
  }

  closeModal() {
    const sideCart = document.querySelector(".side-cart");
    sideCart.classList.toggle("open");
    document.body.removeAttribute("style");
  }

  renderCartItems(cartDetails) {
    if (cartDetails.item_count !== 0) {
      document.querySelector(".side-cart__full").style.display = "block";
      document.querySelector(".side-cart__empty").style.display = "none";
    } else {
      document.querySelector(".side-cart__full").style.display = "none";
      document.querySelector(".side-cart__empty").style.display = "block";
      return;
    }
    const cartItemsWrapper = document.querySelector(".side-cart__products-list");

    cartItemsWrapper.innerHTML = "";
    // if(cartDetails.length === 0) return
    for (let item of cartDetails.items) {
      console.log(item);
      const template = `
      <div class="side-cart__product item" data-id="${item.id}" data-amount="${item.quantity}" >
      <a href="${item.url}" class="item__img-wrapper">
        <img src="${item.image}" class="item__img" alt="${item.title}">
      </a>
      <div class="item__details">
        <div class="details-wrapper">
          <a href="${item.url}" class="item__title">${item.product_title}</a>
          <p class="item__price">${this.formatter.format(item.price / 100)}</p>
        </div>
        <div class="details-wrapper">
          <p class="item__variant-type">${item.variant_title || ""}</p>
       
           <img data-operator="remove" class="item__remove item__control" src="https://cdn.shopify.com/s/files/1/0601/7853/0436/files/icon-remove.svg?v=1664203933" alt="" />
        
        </div>
        <div class="details-wrappe">
        <p class="item__variant-type">${item.selling_plan_allocation?.selling_plan?.name || ""}</p>
        </div>
        <div class="item__controllers">
          <img src="https://cdn.shopify.com/s/files/1/0601/7853/0436/files/icon-minus.svg?v=1664203923" data-operator="minus" class="item__minus item__control" />
          <span class="item__count">${item.quantity}</span>
          <img src="https://cdn.shopify.com/s/files/1/0601/7853/0436/files/icon-add.svg?v=1664203884" data-operator="plus" class="item__add item__control" />
        </div>
      </div>
    </div>
            `;

      cartItemsWrapper.insertAdjacentHTML("beforeend", template);
    }

    const sideCartTotalPrice = document.querySelector(".side-cart__total-price");
    sideCartTotalPrice.textContent = this.formatter.format(cartDetails.total_price / 100);

    // const headerCartLinks = document.querySelectorAll(".cart-item");
    // headerCartLinks.textContent = cartDetails.item_count;
    // console.log(headerCartLinks.textContent)
  }

  async toggleCart() {
    await this.updateCart();
    const sideCart = document.querySelector(".side-cart");

    sideCart.classList.toggle("open");
    document.body.setAttribute("style", "overflow: hidden");
  }

  addToCart(productID) {
    const formData = {
      items: [
        {
          id: productID,
          quantity: 1,
        },
      ],
    };

    this.addItem(formData).then(() => this.toggleCart());
  }

  addToCartWithSellingPlans(id, qty, sellingPlanId) {
    let formData = {
      items: [
        {
          id,
          quantity: qty,
          selling_plan: sellingPlanId,
        },
      ],
    };
    this.addItem(formData).then(() => this.toggleCart());
  }

  addCartItemCount() {
    this.getCartDetails().then((cartDetails) => {
      // const headerCartLinks = document.querySelectorAll(".cart-item");
      // headerCartLinks.textContent = cartDetails.item_count;
      // console.log(headerCartLinks.textContent)
    });
  }

  increaseItemAmount({ itemID, itemAmount }) {
    const formData = {
      id: itemID,
      quantity: Number(itemAmount) + 1,
    };

    this.changeItem(formData).then(() => this.updateCart());
  }

  decreaseItemAmount({ itemID, itemAmount }) {
    const formData = {
      id: itemID,
      quantity: Number(itemAmount) - 1,
    };

    this.changeItem(formData).then(() => this.updateCart());
  }

  deleteItem({ itemID }) {
    const formData = {
      id: itemID,
      quantity: 0,
    };
    this.changeItem(formData).then(() => this.updateCart());
  }
}

const sideCart = new Cart();
const openCartIcon = document.querySelector(".opener");
const closeIcon = document.querySelector(".side-cart__close");
const form = document.querySelector(".product-details__form");
// sideCart.addCartItemCount()
openCartIcon.addEventListener("click", () => {
  sideCart.toggleCart();
});
closeIcon.addEventListener("click", () => {
  sideCart.closeModal();
});
form?.addEventListener("submit", function (e) {
  e.preventDefault();
  if (e.target.dataset.selling_plan_id >= 1) {
    let recharge_id = form.querySelector(".recharge-input:checked").value;
    if (recharge_id == "subscribe") {
      let recharge_freq_id = form.querySelector(".recharge-frequency-option:checked").value;
      let recharge_prod_id = form.querySelector(".recharge-frequency-option:checked").id;
      sideCart.addToCartWithSellingPlans(recharge_prod_id, 1, recharge_freq_id);
    } else {
      sideCart.addToCart(recharge_id);
    }
  } else {
    let productID;
    if (e.target.dataset.novariant == "true") {
      const span = form.querySelector(".product-details__noVariant");
      productID = span.dataset.productid;
    } else {
      const variantId = document.querySelector(".product-details__variants-item-input:checked");
      productID = variantId.value;
    }
    sideCart.addToCart(productID);
  }
});

const itemWrapper = document.querySelector(".side-cart__products-list");
itemWrapper?.addEventListener("click", function (e) {
  const target = e.target.closest(".item__control");
  if (!target) return;
  const operator = target.dataset.operator;
  const cartItem = target.closest(".item");

  if (operator === "plus") {
    sideCart.increaseItemAmount({ itemID: cartItem.dataset.id, itemAmount: cartItem.dataset.amount });
  }
  if (operator === "minus") {
    sideCart.decreaseItemAmount({ itemID: cartItem.dataset.id, itemAmount: cartItem.dataset.amount });
  }
  if (operator === "remove") {
    sideCart.deleteItem({ itemID: cartItem.dataset.id });
  }
});

const cartBtns = document.querySelectorAll(".product__details--link");
for (let i = 0; i < cartBtns.length; i++) {
  const addToCartBtn2 = cartBtns[i];
  addToCartBtn2.addEventListener("click", function (e) {
    e.preventDefault();
    const variantId = addToCartBtn2.dataset.id;

    const formData = {
      items: [
        {
          id: variantId,
          quantity: 1,
        },
      ],
    };

    sideCart.addItem(formData).then(() => sideCart.toggleCart());
  });
}
