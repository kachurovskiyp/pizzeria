import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWigets();
    this.getData();

    this.selectedTable = false;
  }

  render(element) {
    this.dom = {};

    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.bookingWidget();

    this.dom.form = this.dom.wrapper.querySelector(select.booking.form);

    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    this.dom.florPlan = this.dom.wrapper.querySelector(select.containerOf.tables);
    this.dom.tables = this.dom.florPlan.querySelectorAll(select.booking.tables);
  }

  initWigets() {
    this.amountPeopleWidget = new AmountWidget(this.dom.peopleAmount);
    this.amounthoursWidget = new AmountWidget(this.dom.hoursAmount);
    this.datePickerWidget = new DatePicker(this.dom.datePicker);
    this.hourPickerWidget = new HourPicker(this.dom.hourPicker);

    this.dom.peopleAmount.addEventListener('updated', () => { });
    this.dom.hoursAmount.addEventListener('updated', () => { });

    this.dom.wrapper.addEventListener('updated', () => {
      this.updateDom();
      this.resetSelectTable();
    });

    this.dom.florPlan,addEventListener('click', (event) => { this.selectTable(event); });
    this.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.sendBooking();
    });
  }

  getData() {
    const thisBooking = this;

    const strartDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      booking: [
        strartDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        strartDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&')
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then((allResopnses => {
        const bookingResponce = allResopnses[0];
        const eventsCurrent = allResopnses[1];
        const eventsRepeat = allResopnses[2];
        return Promise.all([
          bookingResponce.json(),
          eventsCurrent.json(),
          eventsRepeat.json(),
        ]);
      }))
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDom();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock <= startHour + duration; hourBlock += 0.5) {
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }

    this.updateDom();
  }

  updateDom() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  selectTable(event) {
    const isTable = event.target.classList.contains(classNames.booking.table);
    const isBooked = event.target.classList.contains(classNames.booking.tableBooked);
    const tableId = parseInt(event.target.getAttribute(settings.booking.tableIdAttribute));

    if(this.selectedTable === tableId) {
      this.resetSelectTable();
    } else {
      if(isTable && !isBooked) {
        this.resetSelectTable();
        this.selectedTable = tableId;
        event.target.classList.add(classNames.booking.tableSelected);
      }
    }
  }

  resetSelectTable() {
    this.selectedTable = false;

    this.dom.tables.forEach((table) => {
      table.classList.remove(classNames.booking.tableSelected);
    });
  }

  prepairData(formData) {
    const payload = {};
    payload.starters = [];

    for(let option in formData) {
      if(option == 'hour') {
        payload[option] = utils.numberToHour(formData[option]);
      }
      else if(option == 'hours') {
        payload.duration = parseInt(formData[option][0]);
      }
      else if(option == 'people') {
        payload.ppl = parseInt(formData[option][0]);
      }
      else if(option == 'starter') {
        payload.starters = formData[option];
      }
      else {
        payload[option] = formData[option][0];
      }
    }

    payload.table = this.selectedTable;

    return payload;
  }

  sendBooking() {
    const formData = utils.serializeFormToObject(this.dom.form);
    const payload = this.prepairData(formData);

    // send data

    const url = settings.db.url + '/' + settings.db.booking;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options).then((response) => {
      if(response.ok) {
        this.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        this.resetSelectTable();
      }
    });
  }
}

export default Booking;