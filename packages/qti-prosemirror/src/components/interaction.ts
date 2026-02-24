import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';

export abstract class Interaction extends LitElement {
  @property({ type: String, attribute: 'response-identifier' })
  responseIdentifier: string;

  @property({ type: String, attribute: 'correct-response' })
  public correctResponse: string | string[] | null = null;
}
