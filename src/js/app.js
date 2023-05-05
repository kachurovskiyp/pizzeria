import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initPages() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    thisApp.activatePage(select.containerOf.home.replace('#', ''));

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', (event) => {
        event.preventDefault();

        const id = event.target.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage(pageId) {
    const thisApp = this;

    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu() {
    for (let productData in this.data) {
      new Product(this.data[productData].id, this.data[productData]);
    }

  },

  initData() {
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

  initHomePage() {
    this.home = new Home (document.querySelector(select.containerOf.home));
    this.subMenu = document.querySelector(select.containerOf.subMenu);

    this.subMenu.addEventListener('active-page', (event) => {
      this.activatePage(event.detail.pageId);
    });
  },

  initCart() {
    this.cart = new Cart(document.querySelector(select.containerOf.cart));

    this.productList = document.querySelector(select.containerOf.menu);

    this.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail.product);
    });
  },

  initBooking() {
    this.booking = new Booking(document.querySelector(select.containerOf.booking));
  },

  init: function () {
    this.initData();
    this.initPages();
    this.initHomePage();
    this.initCart();
    this.initBooking();
  },
};

app.init();
