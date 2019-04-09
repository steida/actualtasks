import { DeepReadonly } from 'utility-types';
import { ClientState } from './types';

const initialState: DeepReadonly<ClientState> = {
  viewer: {
    email: '',
    darkMode: false,
  },
  taskLists: {},
};

export default initialState;
