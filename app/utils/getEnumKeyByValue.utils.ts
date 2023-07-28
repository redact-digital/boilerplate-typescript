export default (value: string, enumType: any): string => {
  const key = Object.keys(enumType)[Object.values(enumType).findIndex((v) => v === value)];
  if (!key) throw new Error('Invalid enum value');
  return key;
};
