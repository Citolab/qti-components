import { createContext } from '@lit/context';

export type AudienceContext = {
  view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor' | '';
};

export const audienceContext = createContext<AudienceContext>('audience');
