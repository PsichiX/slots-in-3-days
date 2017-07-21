export function className(instance) {
   return !instance
    ? null
    : (!instance.constructor ? typeof instance : instance.constructor.name);
}
