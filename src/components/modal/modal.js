class Modal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;

    // add the styling and markup for the modal component itself.
    // this styling is separate from that of the parent page
    this.shadowRoot.innerHTML = `
        <style>
            #backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.75);
                z-index: 10;
                opacity: 0;
                pointer-events: none;
            }

            :host([opened]) #backdrop,
            :host([opened]) #modal {
                opacity: 1;
                pointer-events: all;
            }

            :host([opened]) #modal {
                top: 15vh;
            }

            #modal {
                position: fixed;
                top: 10vh;
                left: 25%;
                width: 50%;
                z-index: 100;
                background: white;
                border-radius: 3px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.26);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease-out;
            }

            header {
                padding: 1rem;
                border-bottom: 1px solid #ccc;
            }

            ::slotted(h1) {
                font-size: 1.25rem;
                margin: 0;
            }

            #main {
                padding: 1rem;
            }

            #actions {
                border-top: 1px solid #ccc;
                padding: 1rem;
                display: flex;
                justify-content: flex-end;
            }

            #actions button {
                margin: 0 0.25rem;
            }
        </style>
        <div id="backdrop"></div>
        <div id="modal">
            <header>
                <slot name="title">Please Confirm Payment</slot>
            </header>
            <section id="main">
                <slot></slot>
            </section>
            <section id="actions">
                <button id="cancel-btn">Cancel</button>
                <button id="confirm-btn">Okay</button>
            </section>
        </div>
    `;
    const slots = this.shadowRoot.querySelectorAll('slot');
    slots[1].addEventListener('slotchange', event => {
      console.dir(slots[1].assignedNodes());
    });

    // get references to various elements in our web component
    const backdrop = this.shadowRoot.querySelector('#backdrop');
    const cancelButton = this.shadowRoot.querySelector('#cancel-btn');
    const confirmButton = this.shadowRoot.querySelector('#confirm-btn');

    // wire up event listeners to those elements
    backdrop.addEventListener('click', this._cancel.bind(this));
    cancelButton.addEventListener('click', this._cancel.bind(this));
    confirmButton.addEventListener('click', this._confirm.bind(this));
  }

  // this handles changes in the attributes of our web component
  // and handles the change the way we want
  // basically here, we're saying "if our component has an 'opened'
  // attribute, set the value of this.isOpen to true, otherwise
  // set it to false."  This allows the parent page to show our
  // component by doing something like this: <uc-modal opened></uc-modal>
  // or hide it by excluding the "opened" attribute: <uc-modal></uc-modal>
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.hasAttribute('opened')) {
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
  }

  // this sets up a watch for changes in the attributes of our web component.
  // specifically here, we're watching for changes in the 'opened' attribute.
  // this is an array, so if we wanted to watch multiple attributes, we would
  // simply need to specify a comma-separated list.
  // this works along with the "attributeChangedCallback" method above
  static get observedAttributes() {
    return ['opened'];
  }

  open() {
    this.setAttribute('opened', '');
    this.isOpen = true;
  }

  hide() {
    if (this.hasAttribute('opened')) {
      this.removeAttribute('opened');
    }
    this.isOpen = false;
  }

  _cancel(event) {
    this.hide();

    // setup a custom event to be raised when this method is called
    const cancelEvent = new Event('cancel', { bubbles: true, composed: true });

    // and now raise (dispatch) the event
    event.target.dispatchEvent(cancelEvent);
  }

  _confirm() {
    this.hide();

    // setup a custom event to be raised when this method is called
    const confirmEvent = new Event('confirm');

    // and now raise (dispatch) the event
    this.dispatchEvent(confirmEvent);
  }
}

customElements.define('uc-modal', Modal);
