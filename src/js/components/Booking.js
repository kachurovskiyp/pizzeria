import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWigets();
  }

  render(element) {
    this.dom = {};

    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.bookingWidget();

    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWigets() {
    this.amountPeopleWidget = new AmountWidget(this.dom.peopleAmount);
    this.amounthoursWidget = new AmountWidget(this.dom.hoursAmount);


    this.dom.peopleAmount.addEventListener('updated', () => {});
    this.dom.hoursAmount.addEventListener('updated', () => {});
  }
}

export default Booking;