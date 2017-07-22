import Component from '../systems/EntitySystem/Component';
import { mat4 } from 'gl-matrix';

export default class VerticesRenderer extends Component {

  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (typeof value !== 'boolean') {
      throw new Error('`value` is not type of Boolean!');
    }

    this._visible = value;
  }

  get shader() {
    return this._shader;
  }

  set shader(value) {
    if (typeof value !== 'string') {
      throw new Error('`value` is not type of String!');
    }

    this._shader = value;
  }

  get vertices() {
    return this._vertices;
  }

  set vertices(value) {
    if (!value) {
      throw new Error('`value` cannot be null!');
    }

    if (value instanceof Array) {
      value = new Float32Array(value);
    }

    if (!(value instanceof Float32Array)) {
      throw new Error('`value` is not type of either Array or Float32Array!');
    }

    this._vertices = value;
    this._dirty = true;
  }

  get indiced() {
    return this._indices;
  }

  set indices(value) {
    if (!value) {
      throw new Error('`value` cannot be null!');
    }

    if (value instanceof Array) {
      value = new Uint16Array(value);
    }

    if (!(value instanceof Uint16Array)) {
      throw new Error('`value` is not type of either Array or Uint16Array!');
    }
    if ((value.length % 3) | 0 !== 0) {
      throw new Error('`value` array size is not multiplication of 3!');
    }

    this._indices = value;
    this._dirty = true;
  }

  get overrideUniforms() {
    return this._overrideUniforms;
  }

  set overrideUniforms(value) {
    const { _overrideUniforms } = this;

    _overrideUniforms.clear();

    if (!value) {
      return;
    }

    for (const name in value) {
      _overrideUniforms.set(name, value[name]);
    }
  }

  get overrideSamplers() {
    return this._overrideSamplers;
  }

  set overrideSamplers(value) {
    const { _overrideSamplers } = this;

    _overrideSamplers.clear();

    if (!value) {
      return;
    }

    for (const name in value) {
      _overrideSamplers.set(name, value[name]);
    }
  }

  constructor() {
    super();

    this._visible = true;
    this._context = null;
    this._vertexBuffer = null;
    this._indexBuffer = null;
    this._shader = null;
    this._vertices = null;
    this._indices = null;
    this._dirty = true;
    this._overrideUniforms = new Map();
    this._overrideSamplers = new Map();
  }

  dispose() {
    const { _context, _vertexBuffer, _indexBuffer } = this;

    if (!!_context) {
      if (!!_vertexBuffer) {
        _context.deleteBuffer(_vertexBuffer);
      }
      if (!!_indexBuffer) {
        _context.deleteBuffer(_indexBuffer);
      }
    }

    this._overrideUniforms.clear();
    this._overrideSamplers.clear();

    this._context = null;
    this._vertexBuffer = null;
    this._indexBuffer = null;
    this._vertices = null;
    this._indices = null;
  }

  onAction(name, ...args) {
    if (name === 'render') {
      return this.onRender(...args);
    }
  }

  onRender(gl, renderer, deltaTime) {
    const {
      _visible,
      _shader,
      _vertices,
      _indices,
      _overrideUniforms,
      _overrideSamplers
    } = this;

    if (!_visible) {
      return;
    }

    if (!_shader) {
      console.warn('Trying to render TrianglesRenderer2D without shader!');
      return;
    }
    if (!_vertices) {
      console.warn('Trying to render TrianglesRenderer2D without vertices!');
      return;
    }
    if (!_vertices) {
      console.warn('Trying to render TrianglesRenderer2D without indices!');
      return;
    }

    this._ensureState(gl);
    mat4.copy(renderer.modelViewMatrix, this.entity.transform);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

    if (this._dirty) {
      this._dirty = false;

      gl.bufferData(gl.ARRAY_BUFFER, _vertices, gl.STATIC_DRAW);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _indices, gl.STATIC_DRAW);
    }

    renderer.enableShader(_shader);

    if (_overrideUniforms.size > 0) {
      for (const [ name, value ] of _overrideUniforms) {
        renderer.overrideShaderUniform(name, value);
      }
    }

    if (_overrideSamplers.size > 0) {
      for (const [ name, { texture, filtering } ] of _overrideSamplers) {
        if (texture !== '') {
          renderer.overrideShaderSampler(name, texture, filtering);
        }
      }
    }

    gl.drawElements(gl.TRIANGLES, _indices.length, gl.UNSIGNED_SHORT, 0);
  }

  _ensureState(gl) {
    this._context = gl;

    if (!this._vertexBuffer) {
      this._vertexBuffer = gl.createBuffer();
      this._dirty = true;
    }

    if (!this._indexBuffer) {
      this._indexBuffer = gl.createBuffer();
      this._dirty = true;
    }
  }

}
