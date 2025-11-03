import { ScoringHelper } from '@qti-components/shared';
import { QtiExpression } from '@qti-components/shared';

import type { ResponseVariable } from '@qti-components/shared';

export class QtiMatch extends QtiExpression<boolean> {
  //PK : FIXME.
  // This was a little experiment if we could call the match function as a static function,
  // This can be used for all kind of things, but now especially for use in
  // qti-response-condition-script
  // in which we pass the expressions as pure functions, and hope for the best.
  // SADLY, the getVariables throws roet in de eten.. weet nog niet precies hoe deze werkt.
  // Maar ik ga erin duiken.
  public override getResult() {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const valueToMap = values[0];
      const correctValueInfo = values[1];
      return QtiMatch.match(valueToMap, correctValueInfo);
    }

    console.error('unexpected number of children in match');
    return null;
  }

  public static match(valueToMap: ResponseVariable, correctValueInfo: ResponseVariable) {
    if (valueToMap.value === null) return false;
    switch (correctValueInfo.cardinality) {
      case 'single': {
        if (Array.isArray(valueToMap.value) || Array.isArray(correctValueInfo.value)) {
          console.error('unexpected cardinality in qti match');
          return false;
        }
        return ScoringHelper.compareSingleValues(
          valueToMap.value?.toString(),
          correctValueInfo.value.toString(),
          correctValueInfo.baseType
        );
      }

      case 'ordered': {
        if (!Array.isArray(valueToMap.value) || !Array.isArray(correctValueInfo.value)) {
          console.error('unexpected cardinality in qti match');
          return false;
        }
        if (valueToMap.value.length !== correctValueInfo.value.length) {
          return false;
        }
        for (let i = 0; i < valueToMap.value.length; i++) {
          const result = ScoringHelper.compareSingleValues(
            correctValueInfo.value[i],
            valueToMap.value[i],
            correctValueInfo.baseType
          );
          if (!result) {
            return false;
          }
        }
        return true;
      }

      case 'multiple': {
        if (!Array.isArray(valueToMap.value) || !Array.isArray(correctValueInfo.value)) {
          console.error('unexpected cardinality in qti match');
          return false;
        }
        if (valueToMap.value.length !== correctValueInfo.value.length) {
          return false;
        }
        let answerIndex = 0;
        for (const correctAnswer of correctValueInfo.value) {
          let matchingValue: string | null = null;
          const arr = [...valueToMap.value];
          for (const mv of arr) {
            const result = ScoringHelper.compareSingleValues(correctAnswer, mv, correctValueInfo.baseType);
            if (result) {
              matchingValue = mv;
              break;
            }
          }
          if (matchingValue !== null) {
            (arr as string[]).splice(arr.indexOf(matchingValue), 1);
          } else {
            return false;
          }
          answerIndex++;
        }
        return true;
      }

      default:
        console.error('unexpected cardinality in qti match');
        return false;
    }
  }
}

customElements.define('qti-match', QtiMatch);
