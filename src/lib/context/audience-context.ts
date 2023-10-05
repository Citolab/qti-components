import { createContext } from '@lit-labs/context';

export interface AudienceContext {
  view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';
}

export const audienceContext = createContext<AudienceContext>('audience');
