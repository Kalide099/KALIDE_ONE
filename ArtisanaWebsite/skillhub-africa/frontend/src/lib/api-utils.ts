export function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    if (obj.constructor?.name === 'Decimal') return obj.toString();
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serialize(obj[key]);
    }
    return newObj;
  }
  return obj;
}
