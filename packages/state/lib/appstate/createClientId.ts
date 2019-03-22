// @ts-ignore
import simpleRandom from 'simple-random';

const createClientId = (): string => {
  return simpleRandom({ secure: true });
};

export default createClientId;
