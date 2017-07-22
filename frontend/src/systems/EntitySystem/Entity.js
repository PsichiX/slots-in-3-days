import Component from './Component';
import { className } from '../../utils';
import { mat4, quat, vec3 } from 'gl-matrix';

const zVector = vec3.fromValues(0, 0, 1);

export default class Entity {

  get name() {
    return this._name;
  }

  set name(value) {
    if (typeof value != 'string') {
      throw new Error('`value` is not type of String!');
    }

    this._name = value;
  }

  get parent() {
    return this._parent;
  }

  set parent(value) {
    this.reparent(value);
  }

  get componentsCount() {
    return this._components.size;
  }

  get transform() {
    return this._transform;
  }

  get position() {
    return this._position;
  }

  get rotation() {
    return this._rotation;
  }

  get scale() {
    return this._scale;
  }

  constructor() {
    this._name = '';
    this._children = [];
    this._parent = null;
    this._components = new Map();
    this._transform = mat4.create();
    this._transformLocal = mat4.create();
    this._position = vec3.create();
    this._rotation = quat.create();
    this._scale = vec3.fromValues(1, 1, 1);
    this._dirty = true;
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

  setPosition(x, y) {
    if (typeof x !== 'number') {
      throw new Error('`x` is not type of Number!');
    }
    if (typeof y !== 'number') {
      throw new Error('`y` is not type of Number!');
    }

    vec3.set(this._position, x, y, 0);
    this._dirty = true;
  }

  setRotation(rad) {
    if (typeof rad !== 'number') {
      throw new Error('`rad` is not type of Number!');
    }

    quat.setAxisAngle(this._rotation, zVector, rad);
    this._dirty = true;
  }

  setScale(x, y) {
    if (typeof x !== 'number') {
      throw new Error('`x` is not type of Number!');
    }
    if (typeof y !== 'number') {
      throw new Error('`y` is not type of Number!');
    }

    vec3.set(this._scale, x, y, 0);
    this._dirty = true;
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

  performAction(name, ...args) {
    if (typeof name !== 'string') {
      throw new Error('`name` is not type of String!');
    }

    const { _components, _children } = this;

    for (const component of _components.values()) {
      component.onAction(name, ...args);
    }

    for (let i = 0, c = _children.length; i < c; ++i) {
      _children[i].performAction(name, ...args);
    }
  }

  updateTransforms(parentTransform) {
    const {
      _children,
      _transform,
      _transformLocal,
      _position,
      _rotation,
      _scale
    } = this;

    if (this._dirty) {
      mat4.fromRotationTranslationScale(
        _transformLocal,
        _rotation,
        _position,
        _scale
      );

      mat4.multiply(_transform, _transformLocal, parentTransform);

      this._dirty = false;
    }

    for (let i = 0, c = _children.length; i < c; ++i) {
      _children[i].updateTransforms(_transform);
    }
  }

}
