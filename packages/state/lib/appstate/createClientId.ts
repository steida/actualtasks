// @ts-ignore
import simpleRandom from 'simple-random';

// OMG! https://github.com/ai/nanoid

const createClientId = (): string => {
  return simpleRandom({ secure: true });
};

export default createClientId;
