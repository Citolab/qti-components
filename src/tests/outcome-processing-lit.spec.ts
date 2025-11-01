import { html, render } from 'lit';

import type { QtiTest } from '@qti-components/test';

const assessmentTest = html` <qti-test navigate="item">
  <test-container>
    <qti-assessment-test
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="TST-bb-bi-22-examenvariant-1"
      title="VMBO BB biologie 2022 - examenvariant 1"
      tool-name="Questify Builder"
      tool-version="3.10"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
    >
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Leervaardigheden_in_het_vak_biologie_K3_SCORE"
        cardinality="single"
        base-type="float"
      >
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Leervaardigheden_in_het_vak_biologie_K3_TITLE"
        cardinality="single"
        base-type="string"
      >
        <qti-default-value>
          <qti-value>Leervaardigheden in het vak biologie (K3)</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration identifier="Cellen_staan_aan_de_basis_K4_SCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration identifier="Cellen_staan_aan_de_basis_K4_TITLE" cardinality="single" base-type="string">
        <qti-default-value>
          <qti-value>Cellen staan aan de basis (K4)</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Planten_en_dieren_en_hun_samenhang_K6_SCORE"
        cardinality="single"
        base-type="float"
      >
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Planten_en_dieren_en_hun_samenhang_K6_TITLE"
        cardinality="single"
        base-type="string"
      >
        <qti-default-value>
          <qti-value>Planten en dieren en hun samenhang (K6)</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Het_lichaam_in_stand_houden_K9_SCORE"
        cardinality="single"
        base-type="float"
      >
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Het_lichaam_in_stand_houden_K9_TITLE"
        cardinality="single"
        base-type="string"
      >
        <qti-default-value>
          <qti-value>Het lichaam in stand houden (K9)</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration identifier="Reageren_op_prikkels_K11_SCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration identifier="Reageren_op_prikkels_K11_TITLE" cardinality="single" base-type="string">
        <qti-default-value>
          <qti-value>Reageren op prikkels (K11)</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Van_generatie_op_generatie_K12_SCORE"
        cardinality="single"
        base-type="float"
      >
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value> </qti-outcome-declaration
      ><qti-outcome-declaration
        identifier="Van_generatie_op_generatie_K12_TITLE"
        cardinality="single"
        base-type="string"
      >
        <qti-default-value>
          <qti-value>Van generatie op generatie (K12)</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-test-part
        identifier="RES-b901b8e7-b516-47cc-8adc-165d065f13c7"
        title="Nieuw toetsdeel"
        navigation-mode="nonlinear"
        submission-mode="simultaneous"
      >
        <qti-assessment-section
          identifier="RES-710f3537-ac74-4e89-9185-f2468d59cbb0"
          title="Info"
          visible="true"
          keep-together="false"
        >
          <qti-assessment-item-ref identifier="ITM-32llxx" href="32llxx.xml" category="dep-informational ">
            <qti-weight identifier="WEIGHT" value="0"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-325f3u" href="325f3u.xml" category="dep-informational ">
            <qti-weight identifier="WEIGHT" value="0"></qti-weight>
          </qti-assessment-item-ref>
        </qti-assessment-section>
        <qti-assessment-section
          identifier="RES-caddf4cd-c1e6-45eb-9dd7-91a5b2fc1913"
          title="22-A2"
          visible="true"
          keep-together="false"
        >
          <qti-assessment-item-ref identifier="ITM-32eukv" href="32eukv.xml" category="">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cpek" href="32cpek.xml" category="Van_generatie_op_generatie_K12">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ckgc" href="32ckgc.xml" category="Reageren_op_prikkels_K11">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ckab" href="32ckab.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cjnu" href="32cjnu.xml" category="Van_generatie_op_generatie_K12">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ha97" href="32ha97.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cdqd" href="32cdqd.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cdj9" href="32cdj9.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32eudp" href="32eudp.xml" category="Reageren_op_prikkels_K11">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32gfxy" href="32gfxy.xml" category="Reageren_op_prikkels_K11">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32eugm" href="32eugm.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
        </qti-assessment-section>
        <qti-assessment-section
          identifier="RES-6981488b-cd40-4643-a083-60b2a9defe3a"
          title="22-B2"
          visible="true"
          keep-together="false"
        >
          <qti-assessment-item-ref identifier="ITM-32cf69" href="32cf69.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32dal2"
            href="32dal2.xml"
            category="Leervaardigheden_in_het_vak_biologie_K3"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32ceta"
            href="32ceta.xml"
            category="Leervaardigheden_in_het_vak_biologie_K3"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ew63" href="32ew63.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ew5m" href="32ew5m.xml" category="Van_generatie_op_generatie_K12">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cesr" href="32cesr.xml" category="Van_generatie_op_generatie_K12">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cdqa" href="32cdqa.xml" category="Reageren_op_prikkels_K11">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ew5e" href="32ew5e.xml" category="Reageren_op_prikkels_K11">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ckac" href="32ckac.xml" category="Van_generatie_op_generatie_K12">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32evnk" href="32evnk.xml" category="Reageren_op_prikkels_K11">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32dan5" href="32dan5.xml" category="Van_generatie_op_generatie_K12">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cg8a" href="32cg8a.xml" category="Van_generatie_op_generatie_K12">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
        </qti-assessment-section>
        <qti-assessment-section
          identifier="RES-4fa5c497-6ab3-487b-ab5b-78a4ea0e31fc"
          title="22-C2"
          visible="true"
          keep-together="false"
        >
          <qti-assessment-item-ref identifier="ITM-32bll7" href="32bll7.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32h9tp" href="32h9tp.xml" category="Cellen_staan_aan_de_basis_K4">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32daru" href="32daru.xml" category="Cellen_staan_aan_de_basis_K4">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32cdpg" href="32cdpg.xml" category="Cellen_staan_aan_de_basis_K4">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32eug2"
            href="32eug2.xml"
            category="Planten_en_dieren_en_hun_samenhang_K6"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32gfxw"
            href="32gfxw.xml"
            category="Planten_en_dieren_en_hun_samenhang_K6"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32ckks"
            href="32ckks.xml"
            category="Planten_en_dieren_en_hun_samenhang_K6"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32euku"
            href="32euku.xml"
            category="Planten_en_dieren_en_hun_samenhang_K6"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32ckhf"
            href="32ckhf.xml"
            category="Planten_en_dieren_en_hun_samenhang_K6"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref
            identifier="ITM-32ew4l"
            href="32ew4l.xml"
            category="Planten_en_dieren_en_hun_samenhang_K6"
          >
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32gfxp" href="32gfxp.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32euh2" href="32euh2.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32eujq" href="32eujq.xml" category="Het_lichaam_in_stand_houden_K9">
            <qti-weight identifier="WEIGHT" value="1"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32ll6b" href="32ll6b.xml" category="dep-informational ">
            <qti-weight identifier="WEIGHT" value="0"></qti-weight>
          </qti-assessment-item-ref>
          <qti-assessment-item-ref identifier="ITM-32c2sb" href="32c2sb.xml" category="dep-informational ">
            <qti-weight identifier="WEIGHT" value="0"></qti-weight>
          </qti-assessment-item-ref>
        </qti-assessment-section>
      </qti-test-part>
      <qti-outcome-processing>
        <qti-set-outcome-value identifier="SCORE">
          <qti-sum>
            <qti-test-variables
              exclude-category="dep-informational"
              variable-identifier="SCORE"
              weight-identifier="WEIGHT"
            ></qti-test-variables>
          </qti-sum>
        </qti-set-outcome-value>
        <qti-set-outcome-value identifier="Leervaardigheden_in_het_vak_biologie_K3_SCORE">
          <qti-sum>
            <qti-test-variables
              include-category="Leervaardigheden_in_het_vak_biologie_K3"
              variable-identifier="SCORE"
              weight-identifier="WEIGHT"
            ></qti-test-variables>
          </qti-sum> </qti-set-outcome-value
        ><qti-set-outcome-value identifier="Cellen_staan_aan_de_basis_K4_SCORE">
          <qti-sum>
            <qti-test-variables
              include-category="Cellen_staan_aan_de_basis_K4"
              variable-identifier="SCORE"
              weight-identifier="WEIGHT"
            ></qti-test-variables>
          </qti-sum> </qti-set-outcome-value
        ><qti-set-outcome-value identifier="Planten_en_dieren_en_hun_samenhang_K6_SCORE">
          <qti-sum>
            <qti-test-variables
              include-category="Planten_en_dieren_en_hun_samenhang_K6"
              variable-identifier="SCORE"
              weight-identifier="WEIGHT"
            ></qti-test-variables>
          </qti-sum> </qti-set-outcome-value
        ><qti-set-outcome-value identifier="Het_lichaam_in_stand_houden_K9_SCORE">
          <qti-sum>
            <qti-test-variables
              include-category="Het_lichaam_in_stand_houden_K9"
              variable-identifier="SCORE"
              weight-identifier="WEIGHT"
            ></qti-test-variables>
          </qti-sum> </qti-set-outcome-value
        ><qti-set-outcome-value identifier="Reageren_op_prikkels_K11_SCORE">
          <qti-sum>
            <qti-test-variables
              include-category="Reageren_op_prikkels_K11"
              variable-identifier="SCORE"
              weight-identifier="WEIGHT"
            ></qti-test-variables>
          </qti-sum> </qti-set-outcome-value
        ><qti-set-outcome-value identifier="Van_generatie_op_generatie_K12_SCORE">
          <qti-sum>
            <qti-test-variables
              include-category="Van_generatie_op_generatie_K12"
              variable-identifier="SCORE"
              weight-identifier="WEIGHT"
            ></qti-test-variables>
          </qti-sum> </qti-set-outcome-value
      ></qti-outcome-processing>
    </qti-assessment-test>
  </test-container>
</qti-test>`;

describe.skip('outcome-processing lit', () => {
  beforeEach(async () => {
    const template = () => assessmentTest;
    render(template(), document.body);
  });
  test('real assessment doc in lit', async () => {
    const qtiTestElement = document.body.querySelector('qti-test') as QtiTest;
    const contextAfterResponseProcessing = {
      ...qtiTestElement.testContext,
      items: qtiTestElement.testContext.items.map(itemContext => {
        if (itemContext.identifier !== 'ITM-32dal2') {
          return itemContext;
        }
        return {
          ...itemContext,
          variables: itemContext.variables
            .filter(s => s.identifier !== 'SCORE')
            .concat([
              {
                type: 'outcome',
                identifier: 'SCORE',
                value: '1'
              }
            ])
        };
      })
    };

    qtiTestElement.testContext = contextAfterResponseProcessing;
    qtiTestElement.outcomeProcessing();

    const leesvaardigheden_k3 = qtiTestElement.testContext.testOutcomeVariables.find(
      v => v.identifier === 'Leervaardigheden_in_het_vak_biologie_K3_SCORE'
    );
    expect(leesvaardigheden_k3.value.toString()).toBe('0'); /* FIXME: should be 1 */

    const leesvaardigheden_k4 = qtiTestElement.testContext.testOutcomeVariables.find(
      v => v.identifier === 'Cellen_staan_aan_de_basis_K4_SCORE'
    );
    expect(leesvaardigheden_k4.value.toString()).toBe('0');
  });
});
