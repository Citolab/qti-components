export const matchCorrect = `<qti-response-condition>
  <qti-response-if>
    <qti-match>
      <qti-variable identifier="RESPONSE"></qti-variable>
      <qti-correct identifier="RESPONSE"></qti-correct>
    </qti-match>
    <qti-set-outcome-value identifier="SCORE">
      <qti-base-value base-type="float">1</qti-base-value>
    </qti-set-outcome-value>
  </qti-response-if>
  <qti-response-else>
    <qti-set-outcome-value identifier="SCORE">
      <qti-base-value base-type="float">0</qti-base-value>
    </qti-set-outcome-value>
  </qti-response-else>
</qti-response-condition>`;

export const mapResponse = `<qti-response-condition>
  <qti-response-if>
    <qti-is-null>
      <qti-variable identifier="RESPONSE"></qti-variable>
    </qti-is-null>
    <qti-set-outcome-value identifier="SCORE">
      <qti-base-value base-type="float">0.0</qti-base-value>
    </qti-set-outcome-value>
  </qti-response-if>
  <qti-response-else>
    <qti-set-outcome-value identifier="SCORE">
      <qti-map-response identifier="RESPONSE"> </qti-map-response>
    </qti-set-outcome-value>
  </qti-response-else>
</qti-response-condition>`;

export const mapResponsePoint = `<qti-response-condition>
  <qti-response-if>
    <qti-is-null>
      <qti-variable identifier="RESPONSE"></qti-variable>
    </qti-is-null>
    <qti-set-outcome-value identifier="SCORE">
      <qti-base-value base-type="float">0</qti-base-value>
    </qti-set-outcome-value>
  </qti-response-if>
  <qti-response-else>
    <qti-set-outcome-value identifier="SCORE">
      <qti-map-response-point identifier="RESPONSE"></qti-map-response-point>
    </qti-set-outcome-value>
  </qti-response-else>
</qti-response-condition>`;
