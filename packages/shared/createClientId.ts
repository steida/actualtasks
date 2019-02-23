let tempId = 0;

// GUID is not needed locally. Server will provide GUID on sync.
const createClientId = (): string => {
  return String(tempId++);
};

export default createClientId;
