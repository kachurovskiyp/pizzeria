/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = { // eslint-disable-line no-unused-vars
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  const app = {
    initMenu: function() {
      for(let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },

    initData: function() {
      this.data = dataSource;
    },

    init: function() {
      this.initData();
      this.initMenu();
    },
  };

  class Product {
    constructor(id, data) {
      this.id = id;
      this.data = data;

      this.renderInMenu();
      this.initAccordion(this);
    }

    renderInMenu() {
      this.element = utils.createDOMFromHTML(templates.menuProduct(this.data));
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
    }

    initAccordion(thisProduct) {
      const clickableTrigger = this.element.querySelector(select.menuProduct.clickable);

      clickableTrigger.addEventListener('click', function(event) {
        event.preventDefault();

        const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);

        if(allActiveProducts.length > 0) {
          for(let activeProduct of allActiveProducts) {
            if(activeProduct !== thisProduct.element) {
              activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
            }
          }
        }

        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
  }

  app.init();
}
