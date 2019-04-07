import { DeepReadonly } from 'utility-types';
import { Queries } from './types';

const initialQueries: DeepReadonly<Queries> = {
  viewer: {
    email: '',
    darkMode: false,
  },
  taskLists: {},
};

export default initialQueries;
