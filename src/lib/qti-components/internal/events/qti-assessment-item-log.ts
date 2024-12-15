type QtiAssessmentItemLogEvent = CustomEvent<{ type: string; content: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-assessment-item-log': QtiAssessmentItemLogEvent;
  }
}

export default QtiAssessmentItemLogEvent;
