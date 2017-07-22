export default class Events {

  constructor() {
    this._events = new Map();
  }

  dispose() {
    this._events.clear();
  }

  on(name, callback) {
    if (typeof name !== 'string') {
      throw new Error('`name` is not type of String!');
    }
    if (!(callback instanceof Function)) {
      throw new Error('`callback` is not type of Function!');
    }

    const { _events } = this;

    if (!_events.has(name)) {
     _events.set(name, []);
    }

    _events.get(name).push(callback);
  }

  off(name, callback) {
    if (typeof name !== 'string') {
      throw new Error('`name` is not type of String!');
    }

    const { _events } = this;

    if (!callback) {
      _events.delete(name);
      return;
    }

    if (!(callback instanceof Function)) {
      throw new Error('`callback` is not type of Function!');
    }

    const callbacks = _events.get(name);
    if (!callbacks) {
      return;
    }

    const found = callbacks.indexOf(callback);
    if (found >= 0) {
      callbacks.splice(found, 1);

      if (callbacks.length === 0) {
        _events.delete(name);
      }
    }
  }

  trigger(name, ...args) {
    if (typeof name !== 'string') {
      throw new Error('`name` is not type of String!');
    }

    const { _events } = this;
    const callbacks = _events.get(name);
    if (!callbacks) {
      return;
    }

    for (let i = 0, c = callbacks.length; i < c; ++i) {
      try {
        callbacks[i](...args);
      } catch (error) {
        console.error(error);
      }
    }
  }

}
