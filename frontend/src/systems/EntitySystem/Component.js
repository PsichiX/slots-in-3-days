export default class Component {

  get entity() {
    return this._owner;
  }

  constructor() {
    this._owner = null;
  }

  dispose() {
    const { _owner } = this;

    if (!!_owner) {
      _owner.detachComponent(this);
    }

    this._owner = null;
  }

  onAttach() {}

  onDetach() {}

  onAction(name, ...args) {}

  onPropertySetup(name, value) {
    this[name] = value;
  }

}
