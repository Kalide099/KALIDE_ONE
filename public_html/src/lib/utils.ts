/**
 * Recursively converts BigInt values to Numbers or Strings to allow JSON serialization.
 */
export function serialize(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'bigint') {
    return Number(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(serialize);
  }
  
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      serialized[key] = serialize(data[key]);
    }
    return serialized;
  }
  
  return data;
}
