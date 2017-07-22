import System from './System';
import Events from '../utils/Events';
import { vec2 } from 'gl-matrix';

const cachedUnitsVector = vec2.create();
const cachedScreenVector = vec2.create();

export default class InputSystem extends System {

  get events() {
    return this._events;
  }

  constructor(canvas) {
    super();

    this._canvas = canvas;
    this._events = new Events();
  }

  onRegister() {
    this._canvas.onmousedown = event => this.onMouseDown(event);
    document.onmouseup = event => this.onMouseUp(event);
    document.onmousemove = event => this.onMouseUp(event);
  }

  onUnregister() {
    this._canvas.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
  }

  onMouseDown(...args) {
    this._canvasToUnitCoords(
      cachedUnitsVector,
      cachedScreenVector,
      ...args
    );
    this._events.trigger('mouse-down', cachedUnitsVector, cachedScreenVector);
  }

  onMouseUp(...args) {
    this._canvasToUnitCoords(
      cachedUnitsVector,
      cachedScreenVector,
      ...args
    );
    this._events.trigger('mouse-up', cachedUnitsVector, cachedScreenVector);
  }

  onMouseMove(...args) {
    this._canvasToUnitCoords(
      cachedUnitsVector,
      cachedScreenVector,
      ...args
    );
    this._events.trigger('mouse-move', cachedUnitsVector, cachedScreenVector);
  }

  _canvasToUnitCoords(outUnits, outScreen, event, target) {
    target = target || event.target;

    const { width, height } = this._canvas;
    const bounds = target.getBoundingClientRect();
    let x = event.clientX - bounds.left;
    let y = event.clientY - bounds.top;

    outScreen[0] = x = x * target.width / target.clientWidth;
    outScreen[1] = y = y * target.height / target.clientHeight;
    outUnits[0] = x / width * 2 - 1;
    outUnits[1] = y / height * -2 + 1;
  }

}
