import System from '../System';
import Entity from './Entity';

export default class EntitySystem extends System {

  constructor() {
    super();

    this._root = new Entity();
  }

  dispose() {
    const { _root } = this;

    if (!!_root) {
      _root.dispose();
    }

    this._root = null;
  }

}
