export function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Took too long to respond, please try again later."));
    }, ms);
  });
}
