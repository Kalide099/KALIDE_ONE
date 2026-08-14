export function serialize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    if (obj.constructor?.name === 'Decimal') return obj.toString();
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      newObj[key] = serialize((obj as Record<string, unknown>)[key]);
    }
    return newObj;
  }
  return obj;
}
