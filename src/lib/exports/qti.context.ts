import { createContext } from '@lit/context';

export type QtiContextType = {
  testIdentifier: string;
  candidateIdentifier: string;
  environmentIdentifier: string;
  [key: string]: string | string[]; // Allow for additional context variables
};

export interface QtiContext {
  QTI_CONTEXT: QtiContextType;
}

export const qtiContext = createContext<Readonly<QtiContext>>(Symbol('qtiContext'));
