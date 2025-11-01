import { LitElement } from 'lit';
import type { Cardinality } from './expression-result';
export declare abstract class QtiVariableDeclaration extends LitElement {
    render(): import("lit").TemplateResult<1>;
    protected defaultValues(cardinality: Cardinality): string | string[];
}
