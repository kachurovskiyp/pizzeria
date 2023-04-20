import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function () {
    for (let productData in this.data) {
      new Product(this.data[productData].id, this.data[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponce) {
        return rawResponce.json();
      })
      .then(function (parsedResponce) {
        thisApp.data = parsedResponce;
        thisApp.initMenu();
      });
  },

  initCart: function () {
    this.cart = new Cart(document.querySelector(select.containerOf.cart));

    this.productList = document.querySelector(select.containerOf.menu);

    this.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail.product);
    });
  },

  init: function () {
    this.initData();
    this.initCart();
  },
};

app.init();
