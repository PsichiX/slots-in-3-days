export function className(instance) {
   return !instance
    ? null
    : (!instance.constructor ? typeof instance : instance.constructor.name);
}

export function waitForSeconds(seconds) {
  return new Promise((resolve, reject) => setInterval(resolve, seconds * 1000));
}

export function getBlendingFromName(name) {
  if (!(name in blendingConstants)) {
    throw new Error(`There is no blending function: ${name}`);
  }

  return blendingConstants[name];
}
