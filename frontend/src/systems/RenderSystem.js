import System from './System';
import Events from '../utils/Events';
import { mat4 } from 'gl-matrix';

export default class RenderSystem extends System {

  get canvas() {
    return this._canvas;
  }

  get events() {
    return this._events;
  }

  get activeShader() {
    return this._activeShader;
  }

  get useDevicePixelRatio() {
    return this._useDevicePixelRatio;
  }

  set useDevicePixelRatio(value) {
    this._useDevicePixelRatio = !!value;
  }

  get projectionMatrix() {
    return this._projectionMatrix;
  }

  get modelViewMatrix() {
    return this._modelViewMatrix;
  }

  constructor(canvas) {
    super();

    this._animationFrame = 0;
    this._lastTimestamp = null;
    this._canvas = null;
    this._context = null;
    this._shaders = new Map();
    this._textures = new Map();
    this._events = new Events();
    this._activeShader = null;
    this._useDevicePixelRatio = false;
    this._projectionMatrix = mat4.create();
    this._modelViewMatrix = mat4.create();
    this._blendingConstants = {};

    this._setup(canvas);
  }

  dispose() {
    const { _shaders, _textures, _events } = this;

    this._stopAnimation();

    for (const shader of _shaders.keys()) {
      this.unregisterShader(shader);
    }
    for (const texture of _textures.keys()) {
      this.unregisterTexture(texture);
    }
    _events.dispose();

    this._canvas = null;
    this._context = null;
  }

  registerShader(
    id,
    vertex,
    fragment,
    layoutInfo,
    uniformsInfo,
    samplersInfo,
    blendingInfo
  ) {
    if (typeof id !== 'string') {
      throw new Error('`id` is not type of String!');
    }
    if (typeof vertex !== 'string') {
      throw new Error('`vertex` is not type of String!');
    }
    if (typeof fragment !== 'string') {
      throw new Error('`fragment` is not type of String!');
    }
    if (!layoutInfo) {
      throw new Error('`layoutInfo` cannot be null!');
    }

    this.unregisterShader(id);

    const gl = this._context;

    const shader = gl.createProgram();
    const vshader = gl.createShader(gl.VERTEX_SHADER);
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);
    const deleteAll = () => {
      gl.deleteShader(vshader);
      gl.deleteShader(fshader);
      gl.deleteProgram(shader);
    };

    gl.shaderSource(vshader, vertex);
    gl.shaderSource(fshader, fragment);
    gl.compileShader(vshader);
    gl.compileShader(fshader);

    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(vshader);
      deleteAll();
      throw new Error(`Cannot compile vertex shader: ${id}\nLog: ${log}`);
    }
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(fshader);
      deleteAll();
      throw new Error(`Cannot compile fragment shader: ${id}\nLog: ${log}`);
    }

    gl.attachShader(shader, vshader);
    gl.attachShader(shader, fshader);
    gl.linkProgram(shader);

    if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(shader);
      deleteAll();
      throw new Error(`Cannot link shader program: ${id}\nLog: ${log}`);
    }

    const layout = new Map();
    const uniforms = new Map();
    const samplers = new Map();
    let blending = null;

    for (const name in layoutInfo) {
      const { size, stride, offset } = layoutInfo[name];

      if (typeof size !== 'number' ||
          typeof stride !== 'number' ||
          typeof offset !== 'number'
      ) {
        deleteAll();
        throw new Error(
          `Shader layout does not have proper settings: ${id} (${name})`
        );
      }

      const location = gl.getAttribLocation(shader, name);
      if (location < 0) {
        deleteAll();
        throw new Error(
          `Shader does not have attribute: ${id} (${name})`
        );
      }

      layout.set(name, {
        location,
        size,
        stride,
        offset
      });
    }

    if (layout.size === 0) {
      deleteAll();
      throw new Error(`Shader layout cannot be empty: ${id}`);
    }

    if (!!uniformsInfo) {
      for (const name in uniformsInfo) {
        const mapping = uniformsInfo[name];

        if (typeof mapping !== 'string' && !(mapping instanceof Array)) {
          deleteAll();
          throw new Error(
            `Shader uniform does not have proper settings: ${id} (${name})`
          );
        }

        const location = gl.getUniformLocation(shader, name);
        if (!location) {
          deleteAll();
          throw new Error(
            `Shader does not have uniform: ${id} (${name})`
          );
        }

        uniforms.set(name, {
          location,
          mapping
        });
      }
    }

    if (!!samplersInfo) {
      for (const name in samplersInfo) {
        const { channel, texture, filtering } = samplersInfo[name];

        if (typeof channel !== 'number' ||
          (!!texture && typeof texture !== 'string') ||
          (!!filtering  && typeof filtering !== 'string')
        ) {
          deleteAll();
          throw new Error(
            `Shader sampler does not have proper settings: ${id} (${name})`
          );
        }

        const location = gl.getUniformLocation(shader, name);
        if (!location) {
          deleteAll();
          throw new Error(
            `Shader does not have sampler: ${id} (${name})`
          );
        }

        samplers.set(name, {
          location,
          channel,
          texture,
          filtering
        });
      }
    }

    if (!!blendingInfo) {
      const { source, destination } = blendingInfo;
      if (typeof source !== 'string' || typeof destination !== 'string') {
        throw new Error(`Shader blending does not have proper settings: ${id}`);
      }

      blending = {
        source: this._getBlendingFromName(source),
        destination: this._getBlendingFromName(destination)
      };
    }

    this._shaders.set(id, { shader, layout, uniforms, samplers, blending });
  }

  unregisterShader(id) {
    const { _shaders } = this;
    const gl = this._context;
    const meta = _shaders.get(id);

    if (!meta) {
      return;
    }

    const { shader } = meta;
    const shaders = gl.getAttachedShaders(shader);

    for (let i = 0, c = shaders.length; i < c; ++i) {
      gl.deleteShader(shaders[i]);
    }
    gl.deleteProgram(shader);
    _shaders.delete(id);
  }

  enableShader(id, forced = false) {
    const {
      _shaders,
      _textures,
      _activeShader,
      _projectionMatrix,
      _modelViewMatrix
    } = this;

    if (!_activeShader === id && !forced) {
      return;
    }

    const gl = this._context;
    const meta = _shaders.get(id);

    if (!meta) {
      console.warn(`Trying to enable non-existing shader: ${id}`);
      return;
    }

    const { shader, layout, uniforms, samplers, blending } = meta;

    gl.useProgram(shader);
    this._activeShader = id;

    for (const { location, size, stride, offset } of layout.values()) {
      gl.vertexAttribPointer(
        location,
        size,
        gl.FLOAT,
        false,
        stride * 4,
        offset * 4
      );
      gl.enableVertexAttribArray(location);
    }

    for (const { location, mapping } of uniforms.values()) {
      const { length } = mapping;

      if (mapping === 'projection-matrix') {
        gl.uniformMatrix4fv(location, false, _projectionMatrix);

      } else if (mapping === 'model-view-matrix') {
        gl.uniformMatrix4fv(location, false, _modelViewMatrix);

      } else if (mapping === 'time') {
        gl.uniform1f(location, performance.now() * 0.001);

      } else if (mapping === 'viewport-size') {
        gl.uniform2f(location, this._canvas.width, this._canvas.height);

      } else if (mapping === 'inverse-viewport-size') {
        const { width, height } = this._canvas;

        gl.uniform2f(
          location,
          width === 0 ? 1 : 1 / width,
          height === 0 ? 1 : 1 / height
        );

      } else if (typeof mapping === 'number') {
        gl.uniform1f(location, mapping);

      } else if (length === 2) {
        gl.uniform2fv(location, mapping);

      } else if (length === 3) {
        gl.uniform3fv(location, mapping);

      } else if (length === 4) {
        gl.uniform4fv(location, mapping);

      } else if (length === 9) {
        gl.uniformMatrix3fv(location, false, mapping);

      } else if (length === 16) {
        gl.uniformMatrix4fv(location, false, mapping);

      } else {
        console.warn(`Trying to set non-proper uniform: ${name} (${id})`);
      }
    }

    for (const { location, channel, texture, filtering } of samplers.values()) {
      const tex = _textures.get(texture);
      if (!tex) {
        console.warn(`Trying to enable non-existing texture: ${texture} (${id})`);
        continue;
      }

      const mode = filtering === 'linear'
        ? gl.LINEAR
        : gl.NEAREST;

      gl.activeTexture(gl.TEXTURE0 + channel | 0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mode);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mode);
      gl.uniform1i(location, channel | 0);
    }

    if (!!blending) {
      gl.enable(gl.BLEND);
      gl.blendFunc(blending.source, blending.destination);
    } else {
      gl.disable(gl.BLEND);
    }
  }

  setShaderValue(id, name, value) {
    const { _shaders } = this;
    const gl = this._context;
    const meta = _shaders.get(id);

    if (!meta) {
      console.warn(`Trying to set uniform of non-existing shader: ${id}`);
      return;
    }

    const { uniforms } = meta;
    const uniform = uniforms.get(name);

    if (!uniform) {
      console.warn(`Trying to set value of non-existing uniform: ${id} (${name})`);
      return;
    }

    const { location } = uniform;
    const { length } = value;

    if (typeof value === 'number') {
      gl.uniform1f(location, value);

    } else if (length === 2) {
      gl.uniform2fv(location, value);

    } else if (length === 3) {
      gl.uniform3fv(location, value);

    } else if (length === 4) {
      gl.uniform4fv(location, value);

    } else if (length === 9) {
      gl.uniformMatrix3fv(location, false, value);

    } else if (length === 16) {
      gl.uniformMatrix4fv(location, false, value);

    }
  }

  registerTexture(id, image) {
    this.unregisterTexture(id);

    const gl = this._context;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this._textures.set(id, texture);
  }

  unregisterTexture(id) {
    const { _textures } = this;
    const gl = this._context;
    const texture = _textures.get(id);

    if (!!texture) {
      gl.deleteTexture(texture);
      _textures.delete(id);
    }
  }

  onRegister() {
    this._startAnimation();
  }

  onUnregister() {
    this._stopAnimation();
  }

  _setup(canvas) {
    if (typeof canvas !== 'string') {
      throw new Error('`canvas` is not type of String!');
    }

    canvas = this._canvas = document.getElementById('screen-0');

    const options = { alpha: false };
    const gl = this._context =
      canvas.getContext('webgl', options) ||
      canvas.getContext('experimental-webgl', options);

    if (!gl) {
      throw new Error('Cannot create WebGL context!');
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this._blendingConstants = {
      'zero': gl.ZERO,
      'one': gl.ONE,
      'src-color': gl.SRC_COLOR,
      'one-minus-src-color': gl.ONE_MINUS_SRC_COLOR,
      'dst-color': gl.DST_COLOR,
      'one-minus-dst-color': gl.ONE_MINUS_DST_COLOR,
      'src-alpha': gl.SRC_ALPHA,
      'one-minus-src-alpha': gl.ONE_MINUS_SRC_ALPHA,
      'dst-alpha': gl.DST_ALPHA,
      'one-minus-dst-alpha': gl.ONE_MINUS_DST_ALPHA,
      'constant-color': gl.CONSTANT_COLOR,
      'one-minus-constant-color': gl.ONE_MINUS_CONSTANT_COLOR,
      'constant-alpha': gl.CONSTANT_ALPHA,
      'one-minus-constant-alpha': gl.ONE_MINUS_CONSTANT_ALPHA,
      'src-alpha-saturate': gl.SRC_ALPHA_SATURATE
    };
  }

  _startAnimation() {
    this._stopAnimation();

    this._lastTimestamp = performance.now();
    this._requestFrame();
  }

  _stopAnimation() {
    cancelAnimationFrame(this._animationFrame);
    this._lastTimestamp = null;
  }

  _requestFrame() {
    // wrap in arrow function to keep `this` context of `_onFrame` method
    this._animationFrame = requestAnimationFrame(
      timestamp => this._onFrame(timestamp)
    );
  }

  _resize() {
    const { _canvas, _context } = this;
    let { width, height, clientWidth, clientHeight } = _canvas;

    if (this._useDevicePixelRatio) {
      const { devicePixelRatio } = window;

      clientWidth = (clientWidth * devicePixelRatio) | 0;
      clientHeight = (clientHeight * devicePixelRatio) | 0;
    }

    if (width !== clientWidth || height !== clientHeight) {
      _canvas.width = clientWidth;
      _canvas.height = clientHeight;
      _context.viewport(0, 0, clientWidth, clientHeight);
    }
  }

  _onFrame(timestamp) {
    this._resize();

    const gl = this._context;
    const deltaTime = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;

    gl.clear(gl.COLOR_BUFFER_BIT);
    this.events.trigger('render', gl, this, deltaTime);

    this._requestFrame();
  }

  _getBlendingFromName(name) {
    const { _blendingConstants } = this;

    if (!(name in _blendingConstants)) {
      throw new Error(`There is no blending function: ${name}`);
    }

    return _blendingConstants[name];
  }

}
