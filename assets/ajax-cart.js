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

  deleteItem(line) {
    this.changeItem({ line: line, quantity: 0 }).then((res) => this.renderCartItems(res));
  }

  async getProduct(handle) {
    const response = await fetch(`/products/${handle}.js`);
    return response.json();
  }

  async updateCart() {
    const cartDetails = await this.getCartDetails();
    this.renderCartItems(cartDetails);
  }

  closeModal() {
    const sideCart = document.querySelector(".side-cart");
    sideCart.classList.toggle("open");
    document.body.removeAttribute("style");
  }

  renderCartItems(cartDetails) {
    const cartItemsWrapper = document.querySelector(".side-cart__products-list");
    cartItemsWrapper.innerHTML = "";
 
    for (let item of cartDetails.items) {
      const template = `
      <div class="side-cart__product item">
      <a href="${ item.url}" class="item__img-wrapper">
        <img src="${item.image}" class="item__img" alt="${ item.title }">
      </a>
      <div class="item__details">
        <div class="details-wrapper">
          <a href="${ item.url }" class="item__title">${ item.product_title }</a>
          <p class="item__price">${ this.formatter.format(item.price / 100) }</p>
        </div>
        <div class="details-wrapper">
          <p class="item__variant-type">${item.variant_title }</p>
          <a href="/cart/change?line={{ forloop.index }}&amp;quantity=0" class="item__remove">
           <img src="https://cdn.shopify.com/s/files/1/0601/7853/0436/files/icon-remove.svg?v=1664203933" alt="" />
          </a>
        </div>
        <div class="item__controllers">
          <span class="item__minus item__control">-</span>
          <span class="item__count">${item.quantity}</span>
          <span class="item__add item__control">+</span>
        </div>
      </div>
    </div>
            `;

      cartItemsWrapper.insertAdjacentHTML("beforeend", template);
    }

    const sideCartTotalPrice = document.querySelector(".side-cart__total-price");
    sideCartTotalPrice.textContent = this.formatter.format(cartDetails.total_price / 100);

    // const sideCartItemCart = document.querySelector(".side-cart__item-cart");
    // sideCartItemCart.textContent = '(' + cartDetails.item_count + ')'
  }

  async toggleCart() {
    await this.updateCart();
    const sideCart = document.querySelector(".side-cart");

    sideCart.classList.toggle("open");
    document.body.setAttribute("style", "overflow: hidden");
  }

  addToCart() {
    const variantId = document.querySelector(".product-details__variants-item-input:checked");
    console.log(variantId);
    const formData = {
      items: [
        {
          id: variantId.value,
          quantity: 1,
        },
      ],
    };

    this.addItem(formData).then(() => this.toggleCart());
  }

  addCartItemCount() {
    this.getCartDetails().then((cartDetails) => {
      const headerCartLinks = document.querySelectorAll(".header-cart-link");
      headerCartLinks.forEach((link) => {
        link.innerHTML += " (" + cartDetails.item_count + ")";
      });
    });
  }
}

const sideCart = new Cart();
const openCartIcon = document.querySelector(".opener");
const closeIcon = document.querySelector(".side-cart__close");
const addToCartBtn = document.querySelector(".product-details__add-cart");

openCartIcon.addEventListener("click", () => {
  sideCart.toggleCart();

});
closeIcon.addEventListener("click", () => {
  sideCart.closeModal();
});
addToCartBtn.addEventListener("click", function (e) {
  e.preventDefault();
  sideCart.addToCart();
});

const itemWrapper = document.querySelector('.side-cart__products-list')
itemWrapper.addEventListener('click', function(e){
  const plusBtn = e.target.closest('.item__add')
  const minusBtn = e.target.closest('.item__minus')
  plusBtn.addEventListener('click',()=>{
    sideCart.addToCart()
  })
})