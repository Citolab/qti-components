import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { html, render } from 'lit';

import '@citolab/qti-components';

import type { QtiTest } from '@qti-components/test';

const navigationTest = html` <qti-test navigate="item">
  <test-navigation>
    <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
    <test-prev id="prev-btn">Prev</test-prev>
    <test-next id="next-btn">Next</test-next>
  </test-navigation>
</qti-test>`;

const linearNavigationTest = html` <qti-test navigate="item">
  <test-navigation>
    <test-container test-url="/assets/qti-test-package/assessment-linear.xml"></test-container>
    <test-prev id="prev-btn">Prev</test-prev>
    <test-end-attempt id="end-attempt-btn">End Attempt</test-end-attempt>
    <test-next id="next-btn">Next</test-next>
  </test-navigation>
</qti-test>`;

async function expectNavTo(qtiTest: QtiTest, navItemRefId: string) {
  await expect.poll(() => qtiTest.sessionContext.navItemRefId).toBe(navItemRefId);

  // wait for the item to be loaded
  await new Promise(resolve => setTimeout(resolve, 100));
}

describe('navigation-mode', () => {
  describe('Nonlinear', () => {
    let container: HTMLDivElement;
    beforeEach(async () => {
      container = document.createElement('div');
      document.body.appendChild(container);
      render(navigationTest, container);
      // Ensure we're showing the first question before proceeding
      const qtiTest = container.querySelector('qti-test');
      await expectNavTo(qtiTest, 'ITM-info_start');
    });

    afterEach(() => {
      container.remove();
    });

    test('should initially be on the first item and disable Prev button', async () => {
      expect(container.querySelector('#prev-btn')).toBeDisabled();
      expect(container.querySelector('#next-btn')).toBeEnabled();
    });

    test('should allow moving to next item and enable Prev button in nonlinear mode', async () => {
      const qtiTest = container.querySelector('qti-test');
      const nextBtn = container.querySelector<HTMLAnchorElement>('#next-btn');
      const prevBtn = container.querySelector<HTMLAnchorElement>('#prev-btn');

      // Next should be enabled
      expect(nextBtn).toBeEnabled();

      // Click next
      nextBtn.click();

      // After the next question is loaded
      await expectNavTo(qtiTest, 'ITM-text_entry');

      // In nonlinear mode, Prev should be enabled on item 2
      expect(prevBtn).toBeEnabled();
    });

    test('should allow jumping to item 3 from item 1', async () => {
      const qtiTest = container.querySelector('qti-test');

      // Manually request navigation to ITM-choice
      qtiTest.dispatchEvent(
        new CustomEvent('qti-request-navigation', {
          bubbles: true,
          composed: true,
          detail: { type: 'item', id: 'ITM-choice' }
        })
      );

      // Should be on ITM-choice because jumping is allowed in nonlinear
      await expectNavTo(qtiTest, 'ITM-choice');
    });

    test('should respect section-level linear mode when test-part is nonlinear', async () => {
      const sectionOverrideTest = html` <qti-test navigate="item">
        <test-navigation>
          <qti-assessment-test identifier="test-override" title="Section Override Test">
            <qti-test-part identifier="part-1" navigation-mode="nonlinear">
              <qti-assessment-section identifier="section-1" title="Section 1" navigation-mode="linear">
                <qti-assessment-item-ref identifier="item-1" href="item-1.xml"></qti-assessment-item-ref>
                <qti-assessment-item-ref identifier="item-2" href="item-2.xml"></qti-assessment-item-ref>
                <qti-assessment-item-ref identifier="item-3" href="item-3.xml"></qti-assessment-item-ref>
              </qti-assessment-section>
            </qti-test-part>
          </qti-assessment-test>
          <test-prev id="prev-btn-override">Prev</test-prev>
        </test-navigation>
      </qti-test>`;

      const overrideContainer = document.createElement('div');
      document.body.appendChild(overrideContainer);
      render(sectionOverrideTest, overrideContainer);

      const qtiTest = overrideContainer.querySelector('qti-test');
      const prevBtn = overrideContainer.querySelector('#prev-btn-override');

      // Wait for it to load
      await expectNavTo(qtiTest, 'item-1');

      // Move to item-2
      qtiTest.dispatchEvent(
        new CustomEvent('qti-request-navigation', {
          bubbles: true,
          composed: true,
          detail: { type: 'item', id: 'item-2' }
        })
      );

      await expectNavTo(qtiTest, 'item-2');

      // Even though the test-part is nonlinear, the section is linear, so Prev should be disabled
      expect(prevBtn).toBeDisabled();

      overrideContainer.remove();
    });
  });

  describe('Linear', () => {
    let container: HTMLDivElement;
    beforeEach(async () => {
      container = document.createElement('div');
      document.body.appendChild(container);
      render(linearNavigationTest, container);
      // Ensure we're showing the first question before proceeding
      const qtiTest = container.querySelector('qti-test');
      await expectNavTo(qtiTest, 'ITM-info_start');
    });

    afterEach(() => {
      container.remove();
    });

    test('should initially be on the first item with disabled Nav buttons', () => {
      expect(container.querySelector('#prev-btn')).toBeDisabled();
      // The item should be in the interaction/response state, so Next should be disabled until the submission
      expect(container.querySelector('#next-btn')).toBeDisabled();
    });

    test('should allow moving to next item but still disable Prev button', async () => {
      const qtiTest = container.querySelector('qti-test');
      const nextBtn = container.querySelector<HTMLAnchorElement>('#next-btn');
      const prevBtn = container.querySelector<HTMLAnchorElement>('#prev-btn');
      const endAttemptBtn = container.querySelector<HTMLAnchorElement>('#end-attempt-btn');

      // 1. In linear/individual mode, Next should be disabled until end-attempt
      expect(nextBtn).toBeDisabled();

      endAttemptBtn.click();
      await expect.poll(() => nextBtn, { timeout: 5000 }).toBeEnabled();

      nextBtn.click();
      await expectNavTo(qtiTest, 'ITM-text_entry');

      expect(prevBtn).toBeDisabled();
      expect(nextBtn).toBeDisabled();

      // answer the question
      qtiTest.testContext.items[1].variables['RESPONSE'] = 'York';
      endAttemptBtn.click();

      expect(prevBtn).toBeDisabled();
      await expect.poll(() => nextBtn, { timeout: 5000 }).toBeEnabled();
    });

    test('should restrict jumping to item 3 from item 1 and dispatch navigation-error', async () => {
      const qtiTest = container.querySelector('qti-test');
      let errorReceived = false;
      qtiTest.addEventListener('qti-navigation-error', () => {
        errorReceived = true;
      });

      // Manually request navigation to ITM-choice
      qtiTest.dispatchEvent(
        new CustomEvent('qti-request-navigation', {
          bubbles: true,
          composed: true,
          detail: { type: 'item', id: 'ITM-choice' }
        })
      );

      // Ensure it DOES NOT change from ITM-info_start
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(qtiTest.sessionContext.navItemRefId).toBe('ITM-info_start');
      expect(errorReceived).toBe(true);
    });
  });
});
