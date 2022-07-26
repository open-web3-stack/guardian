export const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(undefined), duration);
  });
