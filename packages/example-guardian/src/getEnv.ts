export const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw Error(`process.env.${name} is missing`);
  return value;
};
