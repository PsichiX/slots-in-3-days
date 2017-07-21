import Events from '../utils/Events';
import { className } from '../utils';

const _systems = new Map();
const _events = new Events();

export default class System {

  static get events() {
    return _events;
  }

  static register(system) {
    if (!(system instanceof System)) {
      throw new Error('`system` is not type of System!');
    }

    const typename = className(system);

    if (_systems.has(typename)) {
      throw new Error(`Given system type is already registered: ${typename}`);
    }

    _systems.set(typename, system);
    system.onRegister();
    return system;
  }

  static unregister(system) {
    let typename = className(system);

    if (typename === 'string') {
      typename = system;
      system = _systems.get(typename);
    } else if (!(system instanceof System)) {
      throw new Error('`system` is not type of either System or String!');
    }

    if (_systems.delete(typename)) {
      system.onUnregister();
      return system;
    } else {
      throw new Error(`Trying to remove non-registered system type: ${typename}`);
    }
  }

  static get(typename) {
    if (typeof typename !== 'string') {
      throw new Error('`typename` is not type of String!');
    }

    return _systems.get(typename) || null;
  }

  static dispose() {
    for (const system of _systems.values()) {
      system.dispose();
    }
    _systems.clear();
  }

  dispose() {}

  onRegister() {}

  onUnregister() {}

}
