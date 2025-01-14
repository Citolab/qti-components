import type { VariableDeclaration } from '../../../exports/variables';

type QtiRegisterVariable = CustomEvent<{
  variable: VariableDeclaration<string | string[]>;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-register-variable': QtiRegisterVariable;
  }
}

export default QtiRegisterVariable;
