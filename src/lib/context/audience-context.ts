import { createContext } from '@lit-labs/context';

export interface Audience {
  view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';
}

export const audienceContext = createContext<Audience>('logger');
