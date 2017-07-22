import System from '../System';
import Entity from './Entity';
import { mat4 } from 'gl-matrix';

const identityMatrix = mat4.create();

export default class EntitySystem extends System {

  get root() {
    return this._root;
  }

  set root(value) {
    if (!(value instanceof Entity)) {
      throw new Error('`value` is not type of Entity!');
    }

    const { _root } = this;

    if (!!_root) {
      _root.dispose();
    }

    this._root = value;
  }

  constructor() {
    super();

    this._root = new Entity();
    this._components = new Map();
  }

  dispose() {
    const { _root } = this;

    if (!!_root) {
      _root.dispose();
    }

    this._components.clear();

    this._root = null;
  }

  registerComponent(typename, componentConstructor) {
    if (typeof typename !== 'string') {
      throw new Error('`typename` is not type of String!');
    }
    if (!(componentConstructor instanceof Function)) {
      throw new Error('`componentConstructor` is not type of Function!');
    }

    const { _components } = this;

    if (_components.has(typename)) {
      throw new Error(`There is already registered component: ${typename}`);
    }

    _components.set(typename, componentConstructor);
  }

  unregisterComponent(typename) {
    if (typeof typename !== 'string') {
      throw new Error('`typename` is not type of String!');
    }
    if (!this._components.delete(typename)) {
      throw new Error(`There is no registered component: ${typename}`);
    }
  }

  createComponent(typename, properties) {
    if (typeof typename !== 'string') {
      throw new Error('`typename` is not type of String!');
    }

    const factory = this._components.get(typename);
    if (!factory) {
      throw new Error(`There is no registered component: ${typename}`);
    }

    const component = factory();
    if (!component) {
      throw new Error(`Cannot create proper component: ${typename}`);
    }

    if (!!properties) {
      for (const name in properties) {
        component.onPropertySetup(name, properties[name]);
      }
    }

    return component;
  }

  buildEntity(data) {
    if (!data) {
      throw new Error('`data` cannot be null!');
    }

    const { name, transform, components, children } = data;
    const result = new Entity();

    result.name = name;

    if (!!transform) {
      const { position, rotation, scale } = transform;

      if (typeof position === 'number') {
        result.setPosition(position, position);
      } else if (!!position && position.length >= 2) {
        result.setPosition(position[0], position[1]);
      }

      if (typeof rotation === 'number') {
        result.setRotation(rotation * Math.PI / 180);
      }

      if (typeof scale === 'number') {
        result.setScale(scale, scale);
      } else if (!!scale && scale.length >= 2) {
        result.setScale(scale[0], scale[1]);
      }
    }

    if (!!components) {
      for (const name in components) {
        result.attachComponent(this.createComponent(name, components[name]));
      }
    }

    if (!!children) {
      for (const meta of children.values()) {
        this.buildEntity(meta).parent = result;
      }
    }

    return result;
  }

  performAction(name, ...args) {
    const { _root } = this;

    if (!!_root) {
      _root.performAction(name, ...args);
    }
  }

  updateTransforms() {
    const { _root } = this;

    if (!!_root) {
      _root.updateTransforms(identityMatrix);
    }
  }

}
