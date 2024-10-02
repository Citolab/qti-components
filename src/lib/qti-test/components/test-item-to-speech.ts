import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext, type QtiAssessmentTest } from '..';

@customElement('test-item-to-speech')
export class TestItemToSpeech extends LitElement {
  @property({ type: String }) language = 'en-EN';
  @property({ type: String }) utteranceText = '';
  @property({ type: String }) speakingWord = '';
  @property({ type: Number }) wordIndex = 0;
  @property({ type: Array }) globalWords: string[] = [];

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  render() {
    return html`
      <button id="playbtn" part="button" @click=${this.playSpeech}>Play</button>
      <div id="panel"></div>
      <div id="word">${this.speakingWord}</div>
    `;
  }

  playSpeech() {
    // const text = this.shadowRoot!.getElementById('textarea')!.value;
    // const qtiExtTest: QtiExtTest = this.closest('qti-ext-test')!;
    const qtiAssessmentTest: QtiAssessmentTest = this.closest('qti-ext-test')!;
    const text = qtiAssessmentTest!
      .querySelector(`qti-assessment-item-ref[identifier=${this._sessionContext.identifier}]`)!
      .shadowRoot!.querySelector('qti-item-body').textContent;
    const words = text.split(' ');
    this.globalWords = words;
    // this.drawTextInPanel(words);
    this.utteranceText = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language;
    utterance.rate = 1;

    // utterance.onboundary = (event: SpeechSynthesisEvent) => {
    //   const word = this.getWordAt(text, event.charIndex);
    //   this.speakingWord = `Speaking word: ${word}`;
    //   this.highlightWord(this.wordIndex);
    //   this.wordIndex++;
    // };

    // utterance.onend = () => {
    //   this.speakingWord = '';
    //   this.wordIndex = 0;
    //   this.shadowRoot!.getElementById('panel')!.innerHTML = '';
    // };

    speechSynthesis.speak(utterance);
  }

  drawTextInPanel(wordsArray: string[]) {
    const panel = this.shadowRoot!.getElementById('panel');
    for (let i = 0; i < wordsArray.length; i++) {
      const span = document.createElement('span');
      span.id = `word_span_${i}`;
      span.textContent = wordsArray[i];
      panel!.appendChild(span);
      panel!.appendChild(document.createTextNode('\u00A0'));
    }
  }

  getWordAt(str: string, pos: number): string {
    str = String(str);
    pos = Number(pos) >>> 0;

    const left = str.slice(0, pos + 1).search(/\S+$/);
    const right = str.slice(pos).search(/\s/);

    if (right < 0) {
      return str.slice(left);
    }
    return str.slice(left, right + pos);
  }

  highlightWord(index: number) {
    const wordSpan = this.shadowRoot!.getElementById(`word_span_${index}`);
    if (wordSpan) {
      wordSpan.style.color = 'blue';
    }
  }
}
