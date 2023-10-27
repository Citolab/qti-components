import { html } from 'lit';
import { qtiTransform } from './qti-transform';
import { xml } from 'lit-xml';

const mathmlString = xml`<qti-itembody>
<math>
    <mfrac>
        <mi>a</mi>
        <mi>b</mi>
    </mfrac>
</math>
</qti-itembody>`.toString();

const removeNamesSpacesString = xml`<root xmlns:foo="http://www.example.com/foo" xmlns:bar="http://www.example.com/bar">
<foo:element1>Content</foo:element1>
<bar:element2>Content</bar:element2>
</root>`.toString();

const pciHooksString = xml`<qti-assessment-item>
<qti-item-body>
    <qti-portable-custom-interaction
        response-identifier="RESPONSE" 
        module="exampleLikertScale"
        custom-interaction-type-identifier="urn:fdc:example.com:pci:likertScale">
        <qti-interaction-markup></qti-interaction-markup>
    </qti-portable-custom-interaction>
</qti-item-body>
</qti-assessment-item>`.toString();

const assetsLocationString = xml`<qti-assessment-item>
<qti-item-body>
    <img src="../img/picture.png" />
</qti-item-body>
</qti-assessment-item>`.toString();

const customTypesString = xml`<qti-assessment-item>
<qti-item-body>
    <qti-choice-interaction class="type:effect"></qti-choice-interaction>
</qti-item-body>
</qti-assessment-item>`.toString();

const suffixString = xml`<qti-assessment-item>
<qti-item-body>
    <qti-select-point></qti-select-point>
</qti-item-body>
</qti-assessment-item>`.toString();

const elementNameAttributesString = xml`<qti-assessment-item>
    <qti-item-body>
        <qti-select-point></qti-select-point>
    </qti-item-body>
</qti-assessment-item>`.toString();

const operatorDefinitionString = xml`<qti-match>
<qti-custom-operator definition="type:parse-numeric-nl">
  <qti-variable identifier="RESPONSE" />
</qti-custom-operator>
<qti-correct identifier="RESPONSE" />
</qti-match>`.toString();

const cDataToCommentString = xml`<qti-match><![CDATA[
  this should be transformed to commented CDATA
]]>
</qti-match>`.toString();

// export const Default = {
//   render: args => {
const mathml = qtiTransform(mathmlString).mathml().xml();
const removeNamesSpaces = qtiTransform(removeNamesSpacesString).removeNamesSpaces().xml();
const pciHooks = qtiTransform(pciHooksString).pciHooks('http://qti-show/modules/').xml();
const assetsLocation = qtiTransform(assetsLocationString).assetsLocation('http://qti-show/static/').xml();
const customTypes = qtiTransform(customTypesString).customTypes().xml();
const suffix = qtiTransform(suffixString).suffix(['qti-select-point'], 'square').xml();
const elementNameAttributes = qtiTransform(elementNameAttributesString)
  .elementNameAttributes(['qti-select-point'])
  .xml();
const operatorDefinition = qtiTransform(operatorDefinitionString).customDefinition().xml();
const cDataToComment = qtiTransform(cDataToCommentString).cDataToComment().xml();

export const transforms = {
  mathml,
  removeNamesSpaces,
  pciHooks,
  assetsLocation,
  customTypes,
  suffix,
  elementNameAttributes,
  operatorDefinition,
  cDataToComment
};

export const transformStrings = {
  mathmlString,
  removeNamesSpacesString,
  pciHooksString,
  assetsLocationString,
  customTypesString,
  suffixString,
  elementNameAttributesString,
  operatorDefinitionString,
  cDataToCommentString
};
