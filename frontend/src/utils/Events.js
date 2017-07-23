export default class Events {

  get delayedDispatch() {
    return this._delayedDispatch;
  }

  set delayedDispatch(value) {
    if (typeof value !== 'boolean') {
      throw new Error('`value` is not type of Boolean!');
    }

    this._delayedDispatch = value;
  }

  constructor() {
    this._events = new Map();
    this._onQueue = [];
    this._offQueue = [];
    this._delayedQueue = [];
    this._triggerDepth = 0;
    this._delayedDispatch = false;
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

    const { _events, _triggerDepth, _onQueue } = this;
    if (_triggerDepth > 0) {
      _onQueue.push({ name, callback });
      return;
    }

    if (!_events.has(name)) {
     _events.set(name, []);
    }

    _events.get(name).push(callback);
  }

  off(name, callback) {
    if (typeof name !== 'string') {
      throw new Error('`name` is not type of String!');
    }

    const { _events, _triggerDepth, _offQueue } = this;

    if (!callback) {
      _events.delete(name);
      return;
    }

    if (!(callback instanceof Function)) {
      throw new Error('`callback` is not type of Function!');
    }

    if (_triggerDepth > 0) {
      _offQueue.push({ name, callback });
      return;
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

    const {
      _delayedDispatch,
      _events,
      _onQueue,
      _offQueue,
      _delayedQueue
    } = this;

    if (_delayedDispatch) {
      this._delayedQueue.push({
        name,
        args
      });
      return;
    }

    if (this._triggerDepth <= 0) {
      for (let i = 0, c = _onQueue.length; i < c; ++i) {
        const { name, callback } = _onQueue[i];

        this.on(name, callback);
      }

      for (let i = 0, c = _offQueue.length; i < c; ++i) {
        const { name, callback } = _offQueue[i];

        this.off(name, callback);
      }

      this._onQueue = [];
      this._offQueue = [];
    }

    const callbacks = _events.get(name);
    if (!callbacks) {
      return;
    }

    ++this._triggerDepth;
    for (let i = 0, c = callbacks.length; i < c; ++i) {
      try {
        callbacks[i](...args);
      } catch (error) {
        console.error(error);
      }
    }
    --this._triggerDepth;
  }

  dispatch() {
    const { _delayedQueue } = this;

    for (let i = 0, c = _delayedQueue.length; i < c; ++i) {
      const { name, args } = _delayedQueue[i];

      this.trigger(name, ...args);
    }

    this._delayedQueue = [];
  }

}
