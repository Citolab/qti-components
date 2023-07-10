import { html } from 'lit';
import { qtiTransform } from './qti-transform';
import { xml } from 'lit-xml';

export default {
  component: 'qti-transform'
};

export const Transformations = {
  render: args => {
    const mathml = qtiTransform(`<qti-itembody>
    <math>
        <mfrac>
            <mi>a</mi>
            <mi>b</mi>
        </mfrac>
    </math>
</qti-itembody>`)
      .mathml()
      .xml();
    const removeNamesSpaces =
      qtiTransform(`<root xmlns:foo="http://www.example.com/foo" xmlns:bar="http://www.example.com/bar">
    <foo:element1>Content</foo:element1>
    <bar:element2>Content</bar:element2>
</root>`)
        .removeNamesSpaces()
        .xml();
    const pciHooks = qtiTransform(`<qti-assessment-item>
    <qti-item-body>
        <qti-portable-custom-interaction
            response-identifier="RESPONSE" 
            module="exampleLikertScale"
            custom-interaction-type-identifier="urn:fdc:example.com:pci:likertScale">
            <qti-interaction-markup></qti-interaction-markup>
        </qti-portable-custom-interaction>
    </qti-item-body>
</qti-assessment-item>`)
      .pciHooks('http://qti-show/modules/')
      .xml();
    const assetsLocation = qtiTransform(`<qti-assessment-item>
    <qti-item-body>
        <img src="../img/picture.png" />
    </qti-item-body>
</qti-assessment-item>`)
      .assetsLocation('http://qti-show/static/')
      .xml();

    const customTypes = qtiTransform(`<qti-assessment-item>
    <qti-item-body>
        <qti-choice-interaction class="type:effect"></qti-choice-interaction>
    </qti-item-body>
</qti-assessment-item>`)
      .customTypes()
      .xml();
    const suffix = qtiTransform(`<qti-assessment-item>
    <qti-item-body>
        <qti-select-point></qti-select-point>
    </qti-item-body>
</qti-assessment-item>`)
      .suffix(['qti-select-point'], 'square')
      .xml();
    const elementNameAttributes = qtiTransform(`<qti-assessment-item>
    <qti-item-body>
        <qti-select-point></qti-select-point>
    </qti-item-body>
</qti-assessment-item>`)
      .elementNameAttributes(['qti-select-point'])
      .xml();

    const operatorDefinition = qtiTransform(`<qti-match>
      <qti-custom-operator definition="type:parse-numeric-nl">
        <qti-variable identifier="RESPONSE" />
      </qti-custom-operator>
      <qti-correct identifier="RESPONSE" />
    </qti-match>`)
      .customDefinition()
      .xml();

    return html`
      <pre>${mathml}</pre>
      <pre>${removeNamesSpaces}</pre>
      <pre>${pciHooks}</pre>
      <pre>${assetsLocation}</pre>
      <pre>${customTypes}</pre>
      <pre>${suffix}</pre>
      <pre>${elementNameAttributes}</pre>
      <pre>${operatorDefinition}</pre>
    `;
  }
};
