// @ts-ignore
import simpleRandom from 'simple-random';

const createClientId = (): string => {
  return simpleRandom();
};

export default createClientId;
