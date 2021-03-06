import Component from './Component';
import EntitySystem from '.';
import { className } from '../../utils';
import { mat4, quat, vec3 } from 'gl-matrix';

const zVector = vec3.fromValues(0, 0, 1);

export default class Entity {

  get owner() {
    return this._owner;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    if (typeof value != 'string') {
      throw new Error('`value` is not type of String!');
    }

    this._name = value;
  }

  get path() {
    let result = `/${this._name}`;
    let current = this._parent;
    while (!!current) {
      result = `/${current.name}${result}`;
      current = current._parent;
    }
    return result;
  }

  get parent() {
    return this._parent;
  }

  set parent(value) {
    this.reparent(value);
  }

  get childrenCount() {
    return this._children.length;
  }

  get transform() {
    return this._transform;
  }

  get inverseTransform() {
    return this._inverseTransform;
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
    this._owner = null;
    this._name = '';
    this._children = [];
    this._parent = null;
    this._components = new Map();
    this._transform = mat4.create();
    this._inverseTransform = mat4.create();
    this._transformLocal = mat4.create();
    this._position = vec3.create();
    this._rotation = quat.create();
    this._scale = vec3.fromValues(1, 1, 1);
    this._dirty = true;
  }

  dispose() {
    const { _children, _components } = this;

    this.reparent(null);

    for (let i = _children.length - 1; i >= 0; --i) {
      _children[i].dispose();
    }

    for (const component of _components.values()) {
      component.dispose();
    }
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

  getChild(index) {
    if (typeof index !== 'number') {
      throw new Error('`index` is not type of Number!');
    }

    const { _children } = this;

    if (index < 0 || index >= _children.length) {
      throw new Error('`index` is out of bounds!');
    }

    return _children[index];
  }

  killChildren() {
    const { _children } = this;
    const container = new Set(_children);

    for (const child of container) {
      child.dispose();
    }
    container.clear();
  }

  reparent(entity) {
    if (!!entity && !(entity instanceof Entity)) {
      throw new Error('`entity` is not type of `Entity`!');
    }

    const { _parent } = this;

    if (entity === _parent) {
      return;
    }

    this._parent = entity;

    if (!!_parent) {
      const { _children } = _parent;
      const found = _children.indexOf(this);

      if (found >= 0) {
        this._setOwner(null);
        _children.splice(found, 1);
      }
    }

    if (!!entity) {
      entity._children.push(this);
      this._setOwner(entity.owner);
    }
  }

  findEntity(name) {
    if (typeof name !== 'string') {
      throw new Error('`name` is not type of String!');
    }

    let current = this;
    while (!!current && name.length > 0) {
      const found = name.indexOf('/');

      if (found === 0) {
        while (!!current._parent) {
          current = current._parent;
        }

        name = name.substr(found + 1);
      } else {
        const part = found > 0 ? name.substr(0, found) : name;

        if (part === '.') {
          // do nothing

        } else if (part === '..') {
          current = current._parent;

        } else {
          const { _children } = current;
          let found = false;

          for (let i = 0, c = _children.length; i < c; ++i) {
            const child = _children[i];

            if (child.name === part) {
              current = child;
              found = true;
              break;
            }
          }

          if (!found) {
            return null;
          }

        }

        if (found < 0) {
          return current;
        }

        name = name.substr(found + 1);
      }
    }

    return current;
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
    if (!!this._owner) {
      component.onAttach();
    }
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
      if (!!this._owner) {
        component.onDetach();
      }
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

  updateTransforms(parentTransform, forced = false) {
    const {
      _children,
      _transform,
      _inverseTransform,
      _transformLocal,
      _position,
      _rotation,
      _scale
    } = this;

    if (!!forced || this._dirty) {
      mat4.fromRotationTranslationScale(
        _transformLocal,
        _rotation,
        _position,
        _scale
      );

      mat4.multiply(_transform, parentTransform, _transformLocal);
      mat4.invert(_inverseTransform, _transform);

      forced = true;
      this._dirty = false;
    }

    for (let i = 0, c = _children.length; i < c; ++i) {
      _children[i].updateTransforms(_transform, forced);
    }
  }

  _setOwner(owner) {
    const { _owner, _components, _children } = this;

    if (!!owner === !!_owner) {
      return;
    }

    this._owner = owner;

    for (const component of _components.values()) {
      if (!!owner) {
        component.onAttach();
      } else {
        component.onDetach();
      }
    }

    for (let i = 0, c = _children.length; i < c; ++i) {
      _children[i]._setOwner(owner);
    }
  }

}
