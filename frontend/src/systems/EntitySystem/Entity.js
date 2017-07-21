import Component from './Component';
import { className } from '../../utils';

export default class Entity {

  get parent() {
    return this._parent;
  }

  get componentsCount() {
    return this._components.size;
  }

  constructor() {
    this._children = [];
    this._parent = null;
    this._components = new Map();
  }

  dispose() {
    const { _children, _components } = this;

    // this could be replaced with for..of
    // (on Chrome Array iterators are optimized to be faster than indexing):
    //  for (let child of _children) {
    //    child.dispose();
    //  }
    for (let i = 0, c = _children.length; i < c; ++i) {
      _children[i].dispose();
    }

    for (const component of _components.values()) {
      component.dispose();
    }

    this.reparent(null);
  }

  reparent(entity) {
    if (!!entity && !(entity instanceof Entity)) {
      throw new Error('`entity` is not type of `Entity`!');
    }

    const { _parent } = this;

    if (entity === _parent) {
      return;
    }

    if (!!_parent) {
      const found = _parent._children.indexOf(this);
      if (found >= 0) {
        _parent._children.splice(found, 1);
      }
    }

    if (!!entity) {
      entity._children.push(this);
    }

    this._parent = entity;
  }

  attachComponent(component) {
    if (!(component instanceof Component)) {
      throw new Error('`component` is not type of Component!');
    }

    const typename = className(component);
    const { _components } = this;

    if (_components.has(typename)) {
      throw new Error(
        `Given component type is already attached to entity: ${typename}`
      );
    }

    _components.set(typename, component);
    component._owner = this;
    component.onAttach();
  }

  detachComponent(component) {
    const { _components } = this;
    let typename = className(component);

    if (typename === 'string') {
      typename = component;
      component = _components.get(typename);
    } else if (!(component instanceof Component)) {
      throw new Error('`component` is not type of either Component or String!');
    }

    if (_components.delete(typename)) {
      component._owner = null;
      component.onDetach();
    } else {
      throw new Error(`Trying to remove non-attached component type: ${typename}`);
    }
  }

  getComponent(typename) {
    if (typeof typename !== 'string') {
      throw new Error('`typename` is not type of String!');
    }

    return this._components.get(typename) || null;
  }

}
