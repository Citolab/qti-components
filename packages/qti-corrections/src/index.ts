// Re-exported so consumers of qti-corrections have a single import point
// for all formative-assessment concerns — both the mixin protocol and
// the concrete correction classes.
export { CorrectResponseMixin, Correctness } from './mixins/correct-response.mixin';
export type { CorrectResponseInterface } from './mixins/correct-response.mixin';
export { correctionPart } from './styles/correction.styles';
export { CandidateCorrectionMixin } from './mixins/candidate-correction.mixin';
export { ChoiceCorrectionMixin } from './mixins/choice-correction.mixin';
export * from './context/correction-config';
export * from './elements/index';
export * from './components/qti-assessment-item-correction';
export * from './components/qti-item-correction';
export * from './components/test-correction-elements';
export * from './components/item-correct-response-mode/item-correct-response-mode';
export * from './components/item-show-candidate-correction/item-show-candidate-correction';
export * from './components/item-show-correct-response/item-show-correct-response';
export * from './components/test-show-correct-response/test-show-correct-response';

export * from './interactions';
