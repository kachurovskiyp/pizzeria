import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWigets() {
    this.amountPeopleWidget = new AmountWidget(this.dom.peopleAmount);
    this.amounthoursWidget = new AmountWidget(this.dom.hoursAmount);
    this.datePickerWidget = new DatePicker(this.dom.datePicker);
    this.hourPickerWidget = new HourPicker(this.dom.hourPicker);

    this.dom.peopleAmount.addEventListener('updated', () => {});
    this.dom.hoursAmount.addEventListener('updated', () => {});
  }
}

export default Booking;