import { createContext } from 'react';
import { ClientDB } from './types';

export default createContext<ClientDB | null>(null);
