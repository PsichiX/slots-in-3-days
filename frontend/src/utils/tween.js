import System from '../systems/System';

export function tween(target, propertyName, toValue, seconds, easeFunc = easeLinear) {
  if (!target) {
    throw new Error('`target` cannot be null!');
  }
  if (typeof propertyName !== 'string') {
    throw new Error('`propertyName` is not type of String!');
  }
  if (typeof toValue !== 'number') {
    throw new Error('`toValue` is not type of Number!');
  }
  if (typeof seconds !== 'number') {
    throw new Error('`seconds` is not type of Number!');
  }
  if (!(easeFunc instanceof Function)) {
    throw new Error('`easeFunc` is not type of Function!');
  }

  return new Promise((resolve, reject) => {
    const start = performance.now();
    const fromValue = target[propertyName];

    if (typeof fromValue !== 'number') {
      throw new Error('Current property value is not type of Number!');
    }

    if (seconds <= 0) {
      try {
        target[propertyName] = toValue;
        resolve();
      } catch(error) {
        reject(error);
      }
      return;
    }

    const onFrame = () => {
      const time = (performance.now() - start) * 0.001;
      const value = time > seconds ? toValue : easeFunc(
        time,
        fromValue,
        toValue - fromValue,
        seconds
      );

      try {
        target[propertyName] = value;
      } catch(error) {
        reject(error);
      }

      if (time >= seconds) {
        System.events.off('tween-update', onFrame);
        resolve(toValue);
      }
    };

    System.events.on('tween-update', onFrame);
  });
}

export function tweenProgress(target, callback, seconds, easeFunc = easeLinear) {
  if (!target) {
    throw new Error('`target` cannot be null!');
  }
  if (!(callback instanceof Function)) {
    throw new Error('`callback` is not type of Function!');
  }
  if (typeof seconds !== 'number') {
    throw new Error('`seconds` is not type of Number!');
  }
  if (!(easeFunc instanceof Function)) {
    throw new Error('`easeFunc` is not type of Function!');
  }

  return new Promise((resolve, reject) => {
    const start = performance.now();

    if (seconds <= 0) {
      try {
        callback.call(target, 1)
        resolve();
      } catch(error) {
        reject(error);
      }
      return;
    }

    const onFrame = () => {
      const time = (performance.now() - start) * 0.001;
      const value = time > seconds ? 1 : easeFunc(
        time,
        0,
        1,
        seconds
      );

      try {
        callback.call(target, value)
      } catch(error) {
        reject(error);
      }

      if (time >= seconds) {
        System.events.off('tween-update', onFrame);
        resolve();
      }
    };

    System.events.on('tween-update', onFrame);
  });
}

// Penner's easing functions:

export const easeLinear = (t, b, c, d) => c * t / d + b;

export const easeInOutQuad = (t, b, c, d) => (t /= d / 2) < 1
  ? c / 2 * t * t + b
  : -c / 2 * ((--t) * (t - 2) - 1) + b;

export const easeInOutCubic = (t, b, c, d) => (t /= d / 2) < 1
  ? c / 2 * t * t * t + b
  : c / 2 * ((t -= 2) * t * t + 2) + b;

export const easeInBounce = (t, b, c, d) => c - easeOutBounce(d - t, 0, c, d) + b;

export const easeOutBounce = (t, b, c, d) => {
  if ((t /= d) < (1 / 2.75)) {
		return c * (7.5625 * t * t) + b;
	} else if (t < (2 / 2.75)) {
		const postFix = t -= (1.5 / 2.75);
		return c * (7.5625 * postFix * t + 0.75) + b;
	} else if (t < (2.5 / 2.75)) {
		const postFix = t -= (2.25 / 2.75);
		return c * (7.5625 * postFix * t + 0.9375) + b;
	} else {
		const postFix = t -= (2.625 / 2.75);
		return c * (7.5625 * postFix * t + 0.984375) + b;
  }
};

export const easeInOutBounce = (t, b, c, d) => t < (d / 2)
  ? easeInBounce(t * 2, 0, c, d) * 0.5 + b
  : easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;

export const easeOutElastic = (t, b, c, d) => {
  if (t == 0) {
    return b;
  } else if ((t /= d) == 1) {
    return b+c;
  }

	const p = d * 0.3;
	const a = c;
	const s = p / 4;

  return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * ( 2 * Math.PI) / p) + c + b);
};
