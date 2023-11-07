type QtiChoiceElementSelected = CustomEvent<{ identifier: string; checked: boolean }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-choice-element-selected': QtiChoiceElementSelected;
  }
}

export default QtiChoiceElementSelected;
