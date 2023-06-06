import { VariableDeclaration } from '../VariableDeclaration';

type QtiRegisterVariable = CustomEvent<{
  variable: VariableDeclaration<number | string|string[]>;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    "qti-register-variable": QtiRegisterVariable;
  }
}

export default QtiRegisterVariable;
