/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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

      this.dom.productList.addEventListener('updated', () => {this.update();});
      this.dom.productList.addEventListener('remove', (event) => {this.remove(event.detail.cartProduct);});
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

      for (let product of this.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      totalNumber == 0 ?
        this.totalPrice = subtotalPrice
        :
        this.totalPrice = subtotalPrice + settings.cart.defaultDeliveryFee;

      // DOM update

      this.dom.totalNumber.innerHTML = totalNumber;
      this.dom.subtotalPrice.innerHTML = subtotalPrice;

      this.dom.totalPrices.forEach((totalPriceElem) => {
        totalPriceElem.innerHTML = this.totalPrice;
      });

      totalNumber == 0 ?
        this.dom.deliveryFee.innerHTML = 0
        :
        this.dom.deliveryFee.innerHTML = settings.cart.defaultDeliveryFee;
    }

    remove(cartProduct) {
      cartProduct.dom.wrapper.remove();
      this.products.splice(this.products.indexOf(cartProduct), 1);
      this.update();
    }
  }

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

  const app = {
    initMenu: function() {
      for(let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },

    initData: function() {
      this.data = dataSource;
    },

    initCart: function() {
      this.cart = new Cart(document.querySelector(select.containerOf.cart));
    },

    init: function() {
      this.initData();
      this.initMenu();
      this.initCart();
    },
  };

  class Product {
    constructor(id, data) {
      this.id = id;
      this.data = data;

      this.renderInMenu();
      this.getElements();
      this.initAccordion(this);
      this.initOrderForm();
      this.initAmountWidget();
      this.processOrder();
    }

    getElements() {
      this.accordionTrigger = this.element.querySelector(select.menuProduct.clickable);
      this.form = this.element.querySelector(select.menuProduct.form);
      this.formInputs = this.form.querySelectorAll(select.all.formInputs);
      this.cartButton = this.element.querySelector(select.menuProduct.cartButton);
      this.priceElem = this.element.querySelector(select.menuProduct.priceElem);
      this.imageWrapper = this.element.querySelector(select.menuProduct.imageWrapper);
      this.amountWidgetElem = this.element.querySelector(select.menuProduct.amountWidget);
    }

    renderInMenu() {
      this.element = utils.createDOMFromHTML(templates.menuProduct(this.data));
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
    }

    initAccordion(thisProduct) {
      this.accordionTrigger.addEventListener('click', function(event) {
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

    initOrderForm() {
      const thisProduct = this;

      this.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of this.formInputs){
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }

      this.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    initAmountWidget() {
      this.amountWidget = new AmountWidget(this.amountWidgetElem);
      this.amountWidgetElem.addEventListener('updated', () => {this.processOrder();});
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);

      let price = thisProduct.data.price;

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for(let optionId in param.options) {
          const option = param.options[optionId];
          const image = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if(formData[paramId] && formData[paramId].includes(optionId)) {
            if(!option.default) {
              price += option.price;
            }

            if(image) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            if(option.default) {
              price -= option.price;
            }

            if(image) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price;
      thisProduct.price = price * thisProduct.amountWidget.value;

      thisProduct.priceElem.innerHTML = thisProduct.price;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {}
        };

        for(let optionId in param.options) {
          const option = param.options[optionId];

          if(formData[paramId] && formData[paramId].includes(optionId)) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.price = thisProduct.price;
      productSummary.priceSingle = thisProduct.priceSingle;

      productSummary.params = thisProduct.prepareCartProductParams();

      return productSummary;
    }


    addToCart() {
      app.cart.add(this.prepareCartProduct());
    }
  }

  class AmountWidget {
    constructor(element) {
      this.getElements(element);
      this.setValue(this.input.value);
      this.initActions();
    }

    getElements(element) {
      this.element = element;
      this.input = this.element.querySelector(select.widgets.amount.input);
      this.linkDecrease = this.element.querySelector(select.widgets.amount.linkDecrease);
      this.linkIncrease = this.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const newValue = parseInt(value);

      if(newValue !== this.value && !isNaN(newValue)) {
        if(newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
          this.value = newValue;
          this.announce();
        }
      }

      this.input.value = this.value;
    }

    initActions() {
      this.input.addEventListener('change', () => {this.setValue(this.input.value);});
      this.linkDecrease.addEventListener('click', () => {this.setValue(this.input.value - 1);});
      this.linkIncrease.addEventListener('click', () => {this.setValue(parseInt(this.input.value) + 1);});
    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {bubbles: true});
      thisWidget.element.dispatchEvent(event);
    }
  }

  app.init();
}