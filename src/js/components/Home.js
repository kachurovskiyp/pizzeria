import { select, templates } from '../settings.js';

class Home {
  constructor(element) {
    this.render(element);
    this.initLinks();
    this.initCarousel();
  }

  render(element) {
    this.dom = {};

    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.homePage();

    this.dom.subMenu = this.dom.wrapper.querySelector(select.containerOf.subMenu);
    this.dom.carousel = this.dom.wrapper.querySelector(select.containerOf.carousel);
  }

  initLinks() {
    this.dom.subMenu.addEventListener('click', (event) => {
      event.preventDefault();
      this.activatePage(event);
    });
  }

  initCarousel() {
    // eslint-disable-next-line no-undef
    this.carousel = new Flickity(this.dom.carousel, {
      cellAlign: 'left',
      contain: true,
      prevNextButtons: false
    });
  }

  activatePage(event) {
    const pageId = this.getParentLink(event.target).getAttribute('href').replace('#', '');

    const custEvent = new CustomEvent('active-page', {
      bubbles: true,
      detail: {
        pageId: pageId
      }
    });

    this.dom.subMenu.dispatchEvent(custEvent);
  }

  getParentLink(element) {
    while (element.tagName !== 'A') {
      element = element.parentNode;
    }
    return element;
  }
}

export default Home;