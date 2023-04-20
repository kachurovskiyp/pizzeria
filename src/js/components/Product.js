import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


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
    const thisProduct = this;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: this.prepareCartProduct()
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;