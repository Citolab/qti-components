import { ResponseVariable } from '../../../qti-utilities/Variables';
import { ScoringHelper } from '../../utilities/scoring-helper';
import { QtiExpression } from '../qti-expression';

export class QtiMatch extends QtiExpression<boolean> {
  //PK : FIXME.
  // This was a little experiment if we could call the match function as a static function,
  // This can be used for all kind of things, but now especially for use in
  // qti-response-condition-script
  // in which we pass the expressions as pure functions, and hope for the best.
  // SADLY, the getVariables throws roet in de eten.. weet nog niet precies hoe deze werkt.
  // Maar ik ga erin duiken.
  public override calculate() {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const valueToMap = values[0];
      const correctValueInfo = values[1];
      this._result = QtiMatch.match(valueToMap, correctValueInfo);
      return this._result;
    }

    console.error('unexpected number of children in match');
    return null;
  }

  public static match(valueToMap: ResponseVariable, correctValueInfo: ResponseVariable) {
    if (correctValueInfo.cardinality === 'single') {
      if (valueToMap.value === null) return false;
      if (Array.isArray(valueToMap.value) || Array.isArray(correctValueInfo.value)) {
        console.error('unexpected cardinality in qti match');
        return false;
      }
      return ScoringHelper.compareSingleValues(
        valueToMap.value?.toString(),
        correctValueInfo.value.toString(),
        correctValueInfo.baseType
      );
    } else {
      if (!Array.isArray(valueToMap.value) || !Array.isArray(correctValueInfo.value)) {
        console.error('unexpected cardinality in qti match');
        return false;
      }
      // if length is not equal, don't check, it's incorrect.
      if (valueToMap.value.length !== correctValueInfo.value.length) {
        return false;
      }
      let answerIndex = 0;
      for (const correctAnswer of correctValueInfo.value) {
        if (correctValueInfo.cardinality === 'ordered') {
          const currentValueToMap = valueToMap[answerIndex];
          const result = ScoringHelper.compareSingleValues(correctAnswer, currentValueToMap, correctValueInfo.baseType);
          if (!result) {
            return false;
          }
        } else {
          // sequence does not matter, find value somewhere in the array
          // and remove when found.
          let matchingValue: string | null = null;
          for (const mv of valueToMap.value) {
            const result = ScoringHelper.compareSingleValues(correctAnswer, mv, correctValueInfo.baseType);
            if (result) {
              matchingValue = mv;
              break;
            }
          }
          if (matchingValue !== null) {
            (valueToMap.value as string[]).splice(valueToMap.value.indexOf(matchingValue), 1);
          } else {
            return false;
          }
        }
        answerIndex++;
      }
      return true; // if everything matches it's correct;
    }
  }
}

customElements.define('qti-match', QtiMatch);
