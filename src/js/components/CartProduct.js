import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    for (let property in menuProduct) {
      this[property] = menuProduct[property];
    }

    this.getElements(element);
    this.initAmountWidget();
    this.initActions();
  }

  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;

    this.dom.amountWidget = this.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    this.dom.price = this.dom.wrapper.querySelector(select.cartProduct.price);
    this.dom.edit = this.dom.wrapper.querySelector(select.cartProduct.edit);
    this.dom.remove = this.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  getData() {
    const preparedData = {};
    const neededData = ['id', 'amount', 'price', 'priceSingle', 'name', 'params'];

    neededData.forEach((option) => {
      preparedData[option] = this[option];
    });

    return preparedData;
  }

  initAmountWidget() {
    this.amountWidget = new AmountWidget(this.dom.amountWidget);
    this.dom.amountWidget.addEventListener('updated', () => {this.recountPrice();});
  }

  initActions() {
    this.dom.edit.addEventListener('click', (event) => {
      event.preventDefault();
    });

    this.dom.remove.addEventListener('click', (event) => {
      event.preventDefault();
      this.remove();
    });
  }

  recountPrice() {
    this.amount = Number(this.amountWidget.value);
    this.price = this.priceSingle * this.amount;
    this.dom.price.innerHTML = this.price;
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct
      }
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
}

export default CartProduct;