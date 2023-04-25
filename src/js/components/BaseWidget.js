class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value() {
    return this.correctValue;
  }

  set value(value) {
    const newValue = this.parseValue(value);

    if (newValue !== this.correctValue && this.isValid(value)) {
      this.correctValue = newValue;
      this.announce();
    }

    this.renderValue();
  }

  setValue(value) {
    this.value = value;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() {
    this.dom.wrapper.innerHTML = this.value;
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', { bubbles: true });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;