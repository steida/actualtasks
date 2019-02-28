// I believe this is unique enough for client usage.
// It's used only for syncing among known entities.
const createClientId = (): string => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const id = array[0].toString(36);
  return id;
};

export default createClientId;
