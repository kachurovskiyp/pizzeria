import { settings, select } from '../settings.js';

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

export default AmountWidget;