import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    this.products = [];
    this.getElements(element);
    this.initActions();
    this.update();
  }

  getElements(element) {
    this.dom = {};

    this.dom.wrapper = element;
    this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
    this.dom.productList = this.dom.wrapper.querySelector(select.cart.productList);
    this.dom.deliveryFee = this.dom.wrapper.querySelector(select.cart.deliveryFee);
    this.dom.subtotalPrice = this.dom.wrapper.querySelector(select.cart.subtotalPrice);
    this.dom.totalNumber = this.dom.wrapper.querySelector(select.cart.totalNumber);

    this.dom.totalPrices = this.dom.wrapper.querySelectorAll(select.cart.totalPrice);
  }

  initActions() {
    this.dom.toggleTrigger.addEventListener('click', () => {
      this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    this.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.sendOrder();
    });

    this.dom.productList.addEventListener('updated', () => {
      this.update();
    });

    this.dom.productList.addEventListener('remove', (event) => {
      this.remove(event.detail.cartProduct);
    });
  }

  add(menuProduct) {
    const productElement = utils.createDOMFromHTML(templates.cartProduct(menuProduct));
    this.dom.productList.appendChild(productElement);
    this.products.push(new CartProduct(menuProduct, productElement));
    this.update();
  }

  update() {
    let totalNumber = 0;
    let subtotalPrice = 0;

    this.orderDetails = {};

    for (let product of this.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    if(totalNumber == 0) {
      this.orderDetails.totalPrice = subtotalPrice;
      this.orderDetails.deliveryFee = 0;
    } else {
      this.orderDetails.totalPrice = subtotalPrice + settings.cart.defaultDeliveryFee;
      this.orderDetails.deliveryFee = settings.cart.defaultDeliveryFee;
    }

    this.orderDetails.subtotalPrice = subtotalPrice;
    this.orderDetails.totalNumber = totalNumber;

    // DOM update

    this.dom.totalNumber.innerHTML = this.orderDetails.totalNumber;
    this.dom.subtotalPrice.innerHTML = this.orderDetails.subtotalPrice;

    this.dom.totalPrices.forEach((totalPriceElem) => {
      totalPriceElem.innerHTML = this.orderDetails.totalPrice;
    });

    totalNumber == 0 ?
      this.dom.deliveryFee.innerHTML = 0
      :
      this.dom.deliveryFee.innerHTML = this.orderDetails.deliveryFee;
  }

  remove(cartProduct) {
    cartProduct.dom.wrapper.remove();
    this.products.splice(this.products.indexOf(cartProduct), 1);
    this.update();
  }

  sendOrder() {
    const thisCart = this;

    const payload = {};
    payload.products = [];
    const formData = utils.serializeFormToObject(thisCart.dom.form);

    for(let option in formData) {
      payload[option] = formData[option];
    }

    for(let option in thisCart.orderDetails) {
      payload[option] = thisCart.orderDetails[option];
    }

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    // send data

    const url = settings.db.url + '/' + settings.db.orders;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;