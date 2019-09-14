import { UiUtils } from '../utils';

const { getElement } = UiUtils;

export abstract class ComponentBase extends HTMLElement {
  private _hookedEvents: Function[] = [];
  protected _isConnected = false;
  protected _subComponents?: ComponentBase[];
  protected _handleInputBound: any;
  protected _handleChangeBound: any;
  protected _handleSubComponentsConnectedBound: any;

  constructor() {
    super();

    this._handleInputBound = this.handleInput.bind(this);
    this._handleChangeBound = this.handleChange.bind(this);
    this._handleSubComponentsConnectedBound = this.handleSubComponentConnected.bind(this);
  }

  protected _isAllConnected = false;
  get isAllConnected() { return this._isAllConnected; }

  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) {
    if (value)
      this.setAttribute("disabled", "");
    else
      this.removeAttribute("disabled");
  }

  protected _userData: any;
  get userData() { return this._userData; }
  set userData(value) { this._userData = value; }

  protected get subComponents(): ComponentBase[] { return []; }
  protected get propertyNames() { return ["disabled"]; }

  static get observedAttributes() {
    return ["disabled"];
  }

  update() { this.updateVisibility(); }

  connectedCallback() {
    // this.addAttribute("tabindex", "0");

    this.processPropertyUpgrades();

    this.connectedCore();
    this._isConnected = true;

    this.updateVisibility();
    this.hookEvents();
    this.raiseConnect();

    this.processSubComponents();

    if (!this._subComponents && !this._isAllConnected) {
      // this.log("calling raiseConnectAll from connectedCallback");
      this.raiseConnectAll();
    }
  }

  disconnectedCallback() {
    this.disconnectedCore();
    this._isConnected = false;

    this.hookEvents();
    this.raiseDisconnect();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    const hasValue = newValue !== null;

    switch (name) {
      case "disabled":
        if (hasValue) {
          this.removeAttribute("tabindex");
          this.blur();
        } else {
          this.setAttribute("tabindex", "0");
        }
        break;
    }

    this.attributeChangedCore(name, oldValue, newValue);
    // this.log("***attribute changed");
    this.updateVisibility();
  }

  protected connectedCore() { }
  protected disconnectedCore() { }
  // @ts-ignore - unused param.
  protected attributeChangedCore(name: string, oldValue: string, newValue: string) { }
  protected updateVisibility() { }

  protected addAttribute(name: string, value: string) {
    if (this.hasAttribute(name)) return;

    this.setAttribute(name, value);
  }

  get isDebug() { return false; }

  log(msg: any) {
    const name = this.constructor.name;

    if (!this.isDebug) return;

    console.log(`${name}:`, msg);
  }

  protected raiseCustomEvent(event: CustomEvent) { this.dispatchEvent(event); }

  protected raiseEvent(name: string, bubble: boolean = true) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: bubble }));
  }

  protected raiseInput() {
    // this.log("input");
    // this.log("&&&&&&&&input");
    this.raiseEvent("input");
  }
  protected raiseChange() {
    // this.log("change");
    // this.log("&&&&&&&&change");
    this.raiseEvent("change");
  }
  protected raiseConnect() {
    this.log("connect");
    this.raiseEvent("connect");
  }
  protected raiseConnectAll() {
    // console.log(`${this.constructor.name}: connectall`);

    if (!this._isAllConnected) {
      this._isAllConnected = true;
      this.processConnectQueue();
      this.allConnected();
    }

    this.raiseEvent("connectall");
  }
  protected raiseDisconnect() { this.raiseEvent("disconnect"); }

  protected hookEvents() { }

  protected unhookEvents() {
    const hookedEvents = this._hookedEvents;

    for (let i = hookedEvents.length - 1; i >= 0; i--) {
      this.unhookEvent(hookedEvents[i]);
    }
  }

  protected allConnected() { }

  protected handleInput() {
    // input events continue bubbling.
    // this.raiseInput();
  }

  // @ts-ignore - unused param.
  protected handleChange(e: Event) {
    this.updateVisibility();
    // For some strange reason, change events stop bubbling.
    this.raiseChange();
  }

  protected processConnectedSubComponents(component: ComponentBase) {
    //   if (this.isDebug)
    // console.log(`processConnectedChild: ${component.constructor.name} - ${component instanceof ComponentBase}`, component);
    if (!component || !(component instanceof ComponentBase)) return;
    // this.log(`${component.constructor.name} CONNECTED`);

    component.removeEventListener("connectall", this._handleSubComponentsConnectedBound);

    if (!this._subComponents || this._subComponents.length === 0) return;
    if (!this._subComponents.remove(component)) return;
    if (this._subComponents.length !== 0) return;
    if (!this._isConnected) return;

    // this.log("calling raiseConnectAll from processConnectedChild");
    this._subComponents = undefined;
    this.raiseConnectAll();
  }

  protected handleSubComponentConnected(e: Event) { this.processConnectedSubComponents(e.target as ComponentBase); }

  protected processSubComponents() {
    const components = this.subComponents;

    if (components.length === 0) return;

    // this.log(`adding chidren ${components.map(child => child.constructor.name)}`);
    // if (this.isDebug)
    //   console.log(`adding chidren `, components);
    this._subComponents = [...components];

    for (const component of components) {
      if (component._isAllConnected)
        this.processConnectedSubComponents(component);
      else
        component.addEventListener("connectall", this._handleSubComponentsConnectedBound);
    }
  }

  protected hookBoundEvent(event: string, listener: EventListenerOrEventListenerObject, ...elements: HTMLElement[]) {
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener(event, listener);
    }

    const result = () => {
      for (let i = 0; i < elements.length; i++) {
        elements[i].removeEventListener(event, listener);
      }
    };

    this._hookedEvents.push(result);
    return <any>result;
  }

  protected hookEvent(event: string, listener: EventListenerOrEventListenerObject, ...elements: HTMLElement[]) {
    if (typeof listener === "function") {
      const boundListener = listener.bind(this);
      return this.hookBoundEvent(event, boundListener, ...elements);
    }

    return this.hookBoundEvent(event, listener, ...elements);
  }

  protected unhookEvent(token: any) {
    (<Function>token)();
    this._hookedEvents.remove(token);
  }

  protected hookInput(element: HTMLElement) { return this.hookBoundEvent("input", this._handleInputBound, element); }
  protected hookChange(element: HTMLElement) { return this.hookBoundEvent("change", this._handleChangeBound, element); }

  // https://developers.google.com/web/fundamentals/web-components/best-practices
  // @ts-ignore - unused param.
  protected upgradeProperties(...properties: string[]) {
    // this.log(`upgradeProperties: ${properties}`);
    // this.log(`upgradeProperties - keys: ${Object.keys(this)}`);
    // this.log(Object.getOwnPropertyDescriptors(this));
    // TODO: Investigate. Calling delete causes values set before connected to be removed.
    // for (const property of properties) {
    //   if (this.constructor.prototype.hasOwnProperty(property)) {
    //     let value = this[property];
    //     // this.log(`((((( deleting ${property}: ${value}`);
    //     delete this[property];
    //     // this.log(`((((( deleted ${property}: ${this[property]}`);
    //     this[property] = value;
    //   }
    // }
    // this.log(Object.getOwnPropertyDescriptors(this.constructor.prototype));
    // this.log(this.constructor.prototype);
  }

  protected processPropertyUpgrades() { this.upgradeProperties(...this.propertyNames); }

  protected getElement<T extends HTMLElement>(id: string) { return getElement<T>(id, this.shadowRoot); }
  protected getInputElement(id: string) { return this.getElement<HTMLInputElement>(id); }
  protected getSelectElement(id: string) { return this.getElement<HTMLSelectElement>(id); }

  protected centerElement(source: HTMLElement, dest: HTMLElement) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var sourceRect = source.getBoundingClientRect();
    var destRect = dest.getBoundingClientRect();

    let top = (destRect.top + destRect.height * 0.5) - sourceRect.height * 0.5;
    let left = (destRect.left + destRect.width * 0.5) - sourceRect.width * 0.5;

    if (top < 0) top = 0;
    if (left < 0) left = 0;
    if (top + sourceRect.height > h) top = h - sourceRect.height;
    if (left + sourceRect.width > w) left = w - sourceRect.width;

    source.style.top = top + "px";
    source.style.left = left + "px";
  }

  // HACK: Investigate. Setting the value of TransformElement before connection causes
  // it to not accept further changes. Cache any pre-connection updates and apply them after connection.
  private _connectQueue: Function[] = [];
  protected queueConnectAction(action: Function) { this._connectQueue.push(action); }

  protected processConnectQueue() {
    while (this._connectQueue.length > 0) {
      const action = this._connectQueue.shift();
      action!();
    }
  }
}
