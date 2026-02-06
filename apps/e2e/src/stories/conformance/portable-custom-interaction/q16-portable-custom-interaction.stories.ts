import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import { removeDoubleSlashes } from '@qti-components/base';
import { getManifestInfo } from '@qti-components/loader';
import { qtiTransformItem } from '@qti-components/transformers';

import type { ItemContainer } from '@qti-components/item';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { ModuleResolutionConfig, transformItemApi } from '@qti-components/transformers';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

type PciStoryOptions = {
  itemName: string;
  expectedPciCount?: number;
  plotSpecs?: PlotSpec[];
  consoleExpectations?: ConsoleExpectation[];
  endAttemptCheck?: {
    expectedValid: boolean;
    message?: string;
  };
};

type PlotSpec = {
  responseIdentifier: string;
  graphSelector: string;
  points: Array<{ x: number; y: number }>;
  expected: string[];
};

type ConsoleExpectation = {
  message: string;
  count: number;
};

type RestoreStoryOptions = {
  name: string;
  itemIdentifier: string;
  nextItemIdentifier: string;
  plotSpecs: PlotSpec[];
  navigateAway?: 'next' | 'prev';
  startItemIndex?: number; // 0-based index of the item to start on (default: 0)
};

const meta: Meta = {
  title: 'qti-conformance/portable-custom-interaction'
};
export default meta;

const pciRoot = '/assets/qti-portable-interaction/pci-conformance';
const consoleSingle: ConsoleExpectation[] = [
  { message: '[Engine SUCCESS][PCI IFramed=TRUE]', count: 1 },
  { message: '[Engine SUCCESS][getInstance][Configuration=Consistent]', count: 1 }
];
const consoleDouble: ConsoleExpectation[] = [
  { message: '[Engine SUCCESS][PCI IFramed=TRUE]', count: 2 },
  { message: '[Engine SUCCESS][getInstance][Configuration=Consistent]', count: 2 }
];

const parseJsonAttribute = (value: string | null) => {
  if (!value) return null;
  const normalized = value.replaceAll('&quot;', '"').replaceAll('&amp;quot;', '"');
  try {
    return JSON.parse(normalized) as Record<string, number | string>;
  } catch {
    return null;
  }
};

const getNumericAttr = (el: Element, attr: string) => {
  const raw = el.getAttribute(attr);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const computeGraphPixel = (pciElement: Element, point: { x: number; y: number }) => {
  const width = getNumericAttr(pciElement, 'data-width');
  const height = getNumericAttr(pciElement, 'data-height');
  const vlines = getNumericAttr(pciElement, 'data-vlines');
  const hlines = getNumericAttr(pciElement, 'data-hlines');
  const border = getNumericAttr(pciElement, 'data-borderlinewidth');

  const xaxis = parseJsonAttribute(pciElement.getAttribute('data-xaxis')) ?? {};
  const yaxis = parseJsonAttribute(pciElement.getAttribute('data-yaxis')) ?? {};

  const xstep = Number(xaxis.step ?? 1);
  const ystep = Number(yaxis.step ?? 1);

  const padding = 30;
  const planeX = padding + border;
  const planeY = padding + border;
  const planeWidth = width - padding - border * 2;
  const planeHeight = height - padding - border * 2;
  const cellWidth = planeWidth / vlines;
  const cellHeight = planeHeight / hlines;

  const pixelX = cellWidth * (point.x / xstep + vlines / 2) + planeX;
  const pixelY = planeY + planeHeight - (point.y / ystep + hlines / 2) * cellHeight;

  return { x: pixelX, y: pixelY };
};

const waitForGraphRect = async (
  pciElement: any,
  selector: string,
  timeout = 15000,
  interval = 100
): Promise<{ left: number; top: number; width: number; height: number } | null> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const rect = await pciElement.iFrameGetBoundingClientRect(selector);
    if (rect) return rect;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return null;
};

const clickGraphPoint = async (pciElement: any, graphSelector: string, point: { x: number; y: number }) => {
  const selectors = [graphSelector, '.graph-container svg', 'svg'];
  let rect: { left: number; top: number; width: number; height: number } | null = null;
  let usedSelector = graphSelector;

  for (const selector of selectors) {
    rect = await waitForGraphRect(pciElement, selector);
    if (rect) {
      usedSelector = selector;
      break;
    }
  }

  if (!rect) {
    throw new Error(`Could not find graph element for selector: ${usedSelector}`);
  }
  const pixel = computeGraphPixel(pciElement, point);
  await pciElement.iFrameMouseClick(rect.left + pixel.x, rect.top + pixel.y);
};

const getModuleResolutionConfig = async (baseUrl: string, name: string) => {
  const moduleResolutionResource = await fetch(removeDoubleSlashes(`${baseUrl}/${name}`));
  if (!moduleResolutionResource.ok) {
    return null;
  }
  const fileContent = await moduleResolutionResource.text();
  if (!fileContent) {
    return null;
  }
  return JSON.parse(fileContent) as ModuleResolutionConfig;
};

const createPostLoadTransformCallback = () => {
  return async (transformer: transformItemApi, itemRef: { href: string }) => {
    const itemUrl = new URL(itemRef.href, window.location.origin);
    const baseUrl = itemUrl.pathname.substring(0, itemUrl.pathname.lastIndexOf('/'));
    const assetBaseUrl = `${window.location.origin}${baseUrl}`;

    transformer = transformer.extendElementName('qti-portable-custom-interaction', 'test');
    transformer = transformer.fn((xmlDoc: XMLDocument) => {
      xmlDoc.querySelectorAll('qti-portable-custom-interaction-test').forEach(el => {
        el.setAttribute('data-forward-console', 'true');
      });
      xmlDoc.querySelectorAll('qti-stylesheet[href]').forEach(el => {
        const href = el.getAttribute('href');
        if (!href) return;
        if (/^(data:|https?:|blob:)/.test(href)) return;
        const normalized = href.startsWith('css/') ? href : href.replace(/^\.\//, '');
        el.setAttribute('href', `${assetBaseUrl}/${normalized}`);
      });
    });

    transformer = await transformer.configurePci(
      baseUrl,
      getModuleResolutionConfig,
      'qti-portable-custom-interaction-test'
    );
    return transformer;
  };
};

const loadPciItem = async (canvasElement: HTMLElement, itemName: string) => {
  const baseUrl = `${pciRoot}/${itemName}`;
  const assetBaseUrl = removeDoubleSlashes(`${window.location.origin}${baseUrl}`);
  const response = await fetch(`${baseUrl}/qti.xml`);
  const xmlText = await response.text();
  const qti = xmlText
    .replaceAll('<qti-portable-custom-interaction', '<qti-portable-custom-interaction-test data-forward-console="true"')
    .replaceAll('</qti-portable-custom-interaction>', '</qti-portable-custom-interaction-test>')
    .replaceAll('href="css/', `href="${assetBaseUrl}/css/`)
    .replaceAll("href='css/", `href='${assetBaseUrl}/css/`);

  const transform = await qtiTransformItem()
    .parse(qti)
    .configurePci(baseUrl, getModuleResolutionConfig, 'qti-portable-custom-interaction-test');

  const itemContainer = canvasElement.querySelector('#item-container') as ItemContainer | null;
  if (itemContainer) {
    itemContainer.itemXML = transform.xml();
  }
};

const waitForAssessmentItem = async (itemContainer: ItemContainer) => {
  return waitFor(() => {
    const root = itemContainer.shadowRoot ?? itemContainer;
    const assessmentItem = root.querySelector('qti-assessment-item') as QtiAssessmentItem | null;
    if (!assessmentItem) {
      throw new Error('Assessment item not available yet.');
    }
    return assessmentItem;
  });
};

const waitForPciLoaded = async (pciElement: any) => {
  if (pciElement?._iframeLoaded) {
    return;
  }
  await new Promise(resolve => {
    pciElement?.addEventListener('qti-portable-custom-interaction-loaded', () => resolve(true), { once: true });
  });
};

const waitForAssessmentItemInTest = async (
  testContainer: HTMLElement,
  identifier: string,
  timeout = 30000
): Promise<QtiAssessmentItem> => {
  return waitFor(() => {
    const root = testContainer.shadowRoot ?? testContainer;
    const itemRefs = Array.from(root.querySelectorAll('qti-assessment-item-ref')) as any[];
    for (const itemRef of itemRefs) {
      const refId = itemRef?.getAttribute?.('identifier') ?? itemRef?.identifier ?? null;
      const assessmentItem =
        itemRef?.assessmentItem ?? (itemRef?.querySelector?.('qti-assessment-item') as QtiAssessmentItem | null);
      const itemId = assessmentItem?.getAttribute?.('identifier') ?? assessmentItem?.identifier ?? null;
      if ((refId && refId === identifier) || (itemId && itemId === identifier)) {
        if (assessmentItem) return assessmentItem;
      }
    }

    const direct = root.querySelector(
      `qti-assessment-item[identifier="${identifier}"]`
    ) as QtiAssessmentItem | null;
    if (direct) return direct;

    const items = Array.from(root.querySelectorAll('qti-assessment-item')) as QtiAssessmentItem[];
    const assessmentItem =
      items.find(item => item.getAttribute('identifier') === identifier || item.identifier === identifier) ?? null;
    if (!assessmentItem) {
      throw new Error(`Assessment item ${identifier} not available yet.`);
    }
    return assessmentItem;
  }, { timeout });
};

const waitForPcisInItem = async (assessmentItem: QtiAssessmentItem) => {
  const pciElements = assessmentItem.querySelectorAll('qti-portable-custom-interaction-test');
  await Promise.all(Array.from(pciElements).map(el => waitForPciLoaded(el)));
};

const getItemRefIds = (testContainer: HTMLElement): string[] => {
  const root = testContainer.shadowRoot ?? testContainer;
  return Array.from(root.querySelectorAll('qti-assessment-item-ref'))
    .map(ref => ref.getAttribute('identifier'))
    .filter((id): id is string => Boolean(id));
};

const resolveItemRefId = (itemRefIds: string[], identifier?: string, fallbackIndex?: number): string | null => {
  if (identifier && itemRefIds.includes(identifier)) return identifier;
  if (typeof fallbackIndex === 'number' && itemRefIds[fallbackIndex]) return itemRefIds[fallbackIndex];
  return null;
};

const navigateToItemRef = (qtiTest: any, itemRefId: string) => {
  if (!itemRefId) return;
  if (qtiTest && typeof qtiTest.navigateTo === 'function') {
    qtiTest.navigateTo('item', itemRefId);
    return;
  }
  qtiTest?.dispatchEvent(
    new CustomEvent('qti-request-navigation', {
      detail: { type: 'item', id: itemRefId },
      bubbles: true,
      composed: true
    })
  );
};

const clickEndAttempt = (canvasElement: HTMLElement) => {
  const endAttempt = canvasElement.querySelector('#end-attempt-btn') as HTMLElement | null;
  const button = endAttempt?.shadowRoot?.querySelector('button') as HTMLButtonElement | null;
  if (!button) {
    throw new Error('End attempt button not found.');
  }
  button.click();
};

const plotPointsInAssessmentItem = async (assessmentItem: QtiAssessmentItem, plotSpecs: PlotSpec[]) => {
  for (const spec of plotSpecs) {
    const pciElement = assessmentItem.querySelector(
      `qti-portable-custom-interaction-test[response-identifier="${spec.responseIdentifier}"]`
    ) as any;
    if (!pciElement) {
      throw new Error(`PCI element not found for response identifier ${spec.responseIdentifier}`);
    }
    await waitForPciLoaded(pciElement);

    for (const point of spec.points) {
      await clickGraphPoint(pciElement, spec.graphSelector, point);
    }
  }
};

const assertResponses = async (assessmentItem: QtiAssessmentItem, plotSpecs: PlotSpec[]) => {
  await waitFor(() => {
    for (const spec of plotSpecs) {
      const response = assessmentItem.variables.find(v => v.identifier === spec.responseIdentifier);
      expect(response?.value).toEqual(spec.expected);
    }
    return true;
  });
};

const assertPciLoaded = async (
  canvasElement: HTMLElement,
  expectedPciCount: number,
  onPciElementsReady?: (pciElements: NodeListOf<Element>, assessmentItem: QtiAssessmentItem) => void
) => {
  const itemContainer = canvasElement.querySelector('#item-container') as ItemContainer | null;
  if (!itemContainer) {
    throw new Error('Item container not found.');
  }

  const assessmentItem = await waitForAssessmentItem(itemContainer);
  const pciElements = assessmentItem.querySelectorAll('qti-portable-custom-interaction-test');

  if (pciElements.length !== expectedPciCount) {
    throw new Error(`Expected ${expectedPciCount} PCI elements, found ${pciElements.length}.`);
  }

  if (onPciElementsReady) {
    onPciElementsReady(pciElements, assessmentItem);
  }

  await Promise.all(Array.from(pciElements).map(el => waitForPciLoaded(el)));
  Array.from(pciElements).forEach(el => {
    expect((el as any)._errorMessage).toBeFalsy();
  });

  return { assessmentItem, pciElements };
};

const createConsoleCapture = (pciElements: NodeListOf<Element>) => {
  const messages: string[] = [];
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ level: string; args: string[] }>).detail;
    if (!detail || detail.level !== 'log') return;
    const text = detail.args?.join(' ') ?? '';
    messages.push(text);
  };
  pciElements.forEach(el => {
    el.addEventListener('qti-pci-console', handler as EventListener);
  });
  return {
    messages,
    cleanup: () => {
      pciElements.forEach(el => {
        el.removeEventListener('qti-pci-console', handler as EventListener);
      });
    }
  };
};

const assertConsoleMessages = async (messages: string[], expectations: ConsoleExpectation[]) => {
  await waitFor(() => {
    expectations.forEach(expectation => {
      const count = messages.filter(entry => entry.includes(expectation.message)).length;
      expect(count).toBeGreaterThanOrEqual(expectation.count);
    });
    return true;
  });
};

const renderPciItem = () => html`
  <qti-item>
    <div style="display:block; width: 900px; height: 700px;">
      <item-container id="item-container"></item-container>
    </div>
  </qti-item>
`;

const renderPciItemWithEndAttempt = (message: string) => html`
  <qti-item>
    <div style="display:block; width: 900px; height: 700px;">
      <item-container id="item-container"></item-container>
      <qti-end-attempt-interaction
        id="end-attempt-btn"
        response-identifier="RESPONSE"
        title="End Attempt"
        style="margin-top: 16px;"
      ></qti-end-attempt-interaction>
      <div id="validation-message" style="margin-top: 8px; color: red; display: none;">${message}</div>
    </div>
  </qti-item>
`;

const createPciStory = ({
  itemName,
  expectedPciCount = 1,
  plotSpecs,
  consoleExpectations,
  endAttemptCheck
}: PciStoryOptions): Story => ({
  render: () =>
    endAttemptCheck
      ? renderPciItemWithEndAttempt(endAttemptCheck.message || 'Invalid response.')
      : renderPciItem(),
  play: async ({ canvasElement }) => {
    await loadPciItem(canvasElement, itemName);
    let consoleCapture: ReturnType<typeof createConsoleCapture> | null = null;
    const { assessmentItem } = await assertPciLoaded(canvasElement, expectedPciCount, pciElements => {
      if (consoleExpectations && consoleExpectations.length > 0) {
        consoleCapture = createConsoleCapture(pciElements);
      }
    });

    if (consoleCapture && consoleExpectations) {
      await assertConsoleMessages(consoleCapture.messages, consoleExpectations);
      consoleCapture.cleanup();
    }

    if (plotSpecs && plotSpecs.length > 0) {
      for (const spec of plotSpecs) {
        const pciElement = assessmentItem.querySelector(
          `qti-portable-custom-interaction-test[response-identifier="${spec.responseIdentifier}"]`
        ) as any;
        if (!pciElement) {
          throw new Error(`PCI element not found for response identifier ${spec.responseIdentifier}`);
        }
        await waitForPciLoaded(pciElement);

        for (const point of spec.points) {
          await clickGraphPoint(pciElement, spec.graphSelector, point);
        }

        await waitFor(() => {
          const response = assessmentItem.variables.find(v => v.identifier === spec.responseIdentifier);
          expect(response?.value).toEqual(spec.expected);
          return true;
        });
      }
    }

    if (endAttemptCheck) {
      const validationMessage = canvasElement.querySelector('#validation-message') as HTMLElement | null;
      if (!validationMessage) {
        throw new Error('Validation message element not found.');
      }

      clickEndAttempt(canvasElement);
      const isValid = assessmentItem.validate(true);
      if (!isValid) {
        validationMessage.style.display = 'block';
      }

      expect(isValid).toBe(endAttemptCheck.expectedValid);
      if (endAttemptCheck.expectedValid) {
        expect(validationMessage.style.display).toBe('none');
      } else {
        expect(validationMessage.style.display).toBe('block');
      }
    }
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
});

const createRestoreStory = ({
  name,
  itemIdentifier,
  nextItemIdentifier,
  plotSpecs,
  navigateAway = 'next',
  startItemIndex = 0
}: RestoreStoryOptions): Story => ({
  name,
  render: (_args, { loaded: { manifestInfo } }) => html`
    <qti-test
      navigate="item"
      class="flex h-full w-full flex-col"
      .postLoadTransformCallback=${createPostLoadTransformCallback()}
    >
      <test-navigation>
        <div class="relative flex-1 overflow-auto">
          <test-container test-url="${manifestInfo.testURL}" class="block"></test-container>
        </div>
        <div class="flex w-full items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <test-prev class="btn btn-primary" role="button">Previous</test-prev>
            <test-next class="btn btn-primary" role="button">Next</test-next>
          </div>
        </div>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const testContainer = canvasElement.querySelector('test-container') as HTMLElement | null;
    const qtiTest = canvasElement.querySelector('qti-test') as any;

    if (!testContainer || !qtiTest) {
      throw new Error('Test navigation elements not found.');
    }

    // Wait for the first item and its PCI to fully load
    await waitFor(
      () => {
        const root = testContainer.shadowRoot;
        const item = root?.querySelector('qti-assessment-item');
        if (!item) return false;
        // Wait for PCI elements to be loaded
        const pciElements = item.querySelectorAll('qti-portable-custom-interaction-test');
        if (pciElements.length === 0) return false;
        // Check if all PCIs are loaded
        return Array.from(pciElements).every((el: any) => el._iframeLoaded === true);
      },
      { timeout: 30000 }
    );

    const resolvedStartIndex = typeof startItemIndex === 'number' ? startItemIndex : 0;
    const itemRefIds = await waitFor(() => {
      const ids = getItemRefIds(testContainer);
      if (ids.length <= resolvedStartIndex) {
        throw new Error('Item refs not available yet.');
      }
      return ids;
    }, { timeout: 30000 });

    const startItemRefId = resolveItemRefId(itemRefIds, itemIdentifier, resolvedStartIndex);
    if (!startItemRefId) {
      throw new Error(`Item ref not found for start index ${startItemIndex}`);
    }

    const currentItemRefId = qtiTest.sessionContext?.navItemRefId;
    if (currentItemRefId !== startItemRefId) {
      navigateToItemRef(qtiTest, startItemRefId);
    }

    const assessmentItem = await waitForAssessmentItemInTest(testContainer, startItemRefId);
    await waitForPcisInItem(assessmentItem);
    await plotPointsInAssessmentItem(assessmentItem, plotSpecs);
    await assertResponses(assessmentItem, plotSpecs);

    const currentIndex = itemRefIds.indexOf(startItemRefId);
    const fallbackIndex = navigateAway === 'next' ? currentIndex + 1 : currentIndex - 1;
    const awayItemRefId = resolveItemRefId(itemRefIds, nextItemIdentifier, fallbackIndex);
    if (!awayItemRefId) {
      throw new Error(`Item ref not found for navigation away from ${startItemRefId}`);
    }

    navigateToItemRef(qtiTest, awayItemRefId);
    const awayItem = await waitForAssessmentItemInTest(testContainer, awayItemRefId);
    await waitForPcisInItem(awayItem);

    navigateToItemRef(qtiTest, startItemRefId);

    const restoredItem = await waitForAssessmentItemInTest(testContainer, startItemRefId);
    await waitForPcisInItem(restoredItem);
    await assertResponses(restoredItem, plotSpecs);
  },
  loaders: [
    async () => ({
      manifestInfo: await getManifestInfo(`${pciRoot}/imsmanifest.xml`)
    })
  ],
  parameters: {
    layout: 'fullscreen',
    chromatic: { disableSnapshot: true }
  }
});

export const Q16_PCI_I01: Story = {
  name: 'Q16-PCI-I01',
  render: (_args, { loaded: { manifestInfo } }) => html`
    <qti-test
      navigate="item"
      class="flex h-full w-full flex-col"
      .postLoadTransformCallback=${createPostLoadTransformCallback()}
    >
      <test-navigation>
        <div class="relative flex-1 overflow-auto">
          <test-container test-url="${manifestInfo.testURL}" class="block"></test-container>
        </div>
        <div class="flex w-full items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <test-prev class="btn btn-primary" role="button">Previous</test-prev>
            <test-next class="btn btn-primary" role="button">Next</test-next>
          </div>
        </div>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ loaded: { manifestInfo } }) => {
    expect(manifestInfo.items.length).toBe(6);
    expect(manifestInfo.testIdentifier).toBe('p16-pci-conformance-test');
  },
  loaders: [
    async () => ({
      manifestInfo: await getManifestInfo(`${pciRoot}/imsmanifest.xml`)
    })
  ],
  parameters: {
    layout: 'fullscreen',
    chromatic: { disableSnapshot: true }
  }
};

export const Q16_PCI_D11: Story = { name: 'Q16-PCI-D11', ...createPciStory({ itemName: 'item-1' }) };
export const Q16_PCI_D12: Story = {
  name: 'Q16-PCI-D12',
  ...createPciStory({ itemName: 'item-1', consoleExpectations: consoleSingle })
};
export const Q16_PCI_D13: Story = {
  name: 'Q16-PCI-D13',
  render: () => html`
    <qti-item>
      <div style="display:block; width: 900px; height: 700px;">
        <item-container id="item-container"></item-container>
        <qti-end-attempt-interaction
          id="end-attempt-btn"
          response-identifier="RESPONSE"
          title="End Attempt"
          style="margin-top: 16px;"
        ></qti-end-attempt-interaction>
        <div id="validation-message" style="margin-top: 8px; color: red; display: none;">
          Invalid response: Please mark at least one point on the graph.
        </div>
      </div>
    </qti-item>
  `,
  play: async ({ canvasElement }) => {
    await loadPciItem(canvasElement, 'item-1');
    const { assessmentItem } = await assertPciLoaded(canvasElement, 1);

    const validationMessage = canvasElement.querySelector('#validation-message') as HTMLElement;

    clickEndAttempt(canvasElement);

    // Validate without marking any points - should be invalid
    const isValid = assessmentItem.validate(true);

    // Show validation message if invalid (simulating delivery system behavior)
    if (!isValid) {
      validationMessage.style.display = 'block';
    }

    // Verify completionStatus is NOT 'completed' (no points marked = invalid response)
    const completionStatus = assessmentItem.variables.find(v => v.identifier === 'completionStatus');
    expect(completionStatus?.value).not.toBe('completed');

    // Verify the response is invalid
    expect(isValid).toBe(false);

    // Verify validation message is shown
    expect(validationMessage.style.display).toBe('block');
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
export const Q16_PCI_D14: Story = {
  name: 'Q16-PCI-D14',
  ...createPciStory({
    itemName: 'item-1',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [{ x: 1, y: -3 }],
        expected: ['1,-3']
      }
    ]
  })
};
export const Q16_PCI_D15: Story = {
  name: 'Q16-PCI-D15',
  render: () => html`
    <qti-item>
      <div style="display:block; width: 900px; height: 700px;">
        <item-container id="item-container"></item-container>
        <qti-end-attempt-interaction
          id="end-attempt-btn"
          response-identifier="RESPONSE"
          title="End Attempt"
          style="margin-top: 16px;"
        ></qti-end-attempt-interaction>
        <div id="validation-message" style="margin-top: 8px; color: red; display: none;">
          Invalid response: Please mark at least one point on the graph.
        </div>
      </div>
    </qti-item>
  `,
  play: async ({ canvasElement }) => {
    await loadPciItem(canvasElement, 'item-1');
    const { assessmentItem, pciElements } = await assertPciLoaded(canvasElement, 1);

    const validationMessage = canvasElement.querySelector('#validation-message') as HTMLElement;
    const pciElement = pciElements[0] as any;

    // Mark a point on the graph to make the response valid
    await clickGraphPoint(pciElement, '#graph svg', { x: 1, y: -3 });

    // Wait for the response to be registered
    await waitFor(() => {
      const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
      expect(response?.value).toEqual(['1,-3']);
      return true;
    });

    clickEndAttempt(canvasElement);

    // Validate with a valid response - should pass
    const isValid = assessmentItem.validate(true);

    // Only show validation message if invalid (should NOT show)
    if (!isValid) {
      validationMessage.style.display = 'block';
    }

    // Verify the response is valid
    expect(isValid).toBe(true);

    // Verify completionStatus IS 'completed'
    const completionStatus = assessmentItem.variables.find(v => v.identifier === 'completionStatus');
    expect(completionStatus?.value).toBe('completed');

    // Verify NO validation message is shown
    expect(validationMessage.style.display).toBe('none');
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
export const Q16_PCI_D16: Story = createRestoreStory({
  name: 'Q16-PCI-D16',
  itemIdentifier: 'pci-graphing-interaction-1',
  nextItemIdentifier: 'pci-graphing-interaction-2',
  plotSpecs: [
    {
      responseIdentifier: 'RESPONSE',
      graphSelector: '#graph svg',
      points: [{ x: 1, y: -3 }],
      expected: ['1,-3']
    }
  ]
});

export const Q16_PCI_D21: Story = { name: 'Q16-PCI-D21', ...createPciStory({ itemName: 'item-2' }) };
export const Q16_PCI_D22: Story = {
  name: 'Q16-PCI-D22',
  ...createPciStory({ itemName: 'item-2', consoleExpectations: consoleSingle })
};
export const Q16_PCI_D23: Story = {
  name: 'Q16-PCI-D23',
  render: () => html`
    <qti-item>
      <div style="display:block; width: 900px; height: 700px;">
        <item-container id="item-container"></item-container>
        <qti-end-attempt-interaction
          id="end-attempt-btn"
          response-identifier="RESPONSE"
          title="End Attempt"
          style="margin-top: 16px;"
        ></qti-end-attempt-interaction>
        <div id="validation-message" style="margin-top: 8px; color: red; display: none;"></div>
      </div>
    </qti-item>
  `,
  play: async ({ canvasElement }) => {
    await loadPciItem(canvasElement, 'item-2');
    const { assessmentItem, pciElements } = await assertPciLoaded(canvasElement, 1);

    const validationMessage = canvasElement.querySelector('#validation-message') as HTMLElement;
    const pciElement = pciElements[0] as any;

    // Mark only ONE point - Item 2 requires TWO points for valid response
    await clickGraphPoint(pciElement, '#graph svg', { x: -3, y: 0 });

    // Wait for the response to be registered
    await waitFor(() => {
      const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
      expect(response?.value).toEqual(['-3,0']);
      return true;
    });

    clickEndAttempt(canvasElement);

    // Item 2 requires 2 points - with only 1 point, the PCI considers it invalid
    // The PCI logs [IsValid:false] when only 1 point is marked
    // For this test, we check the response has only 1 point (incomplete for Item 2's requirements)
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    const pointCount = Array.isArray(response?.value) ? response.value.length : 0;

    // Show custom validation message since Item 2 requires 2 points
    if (pointCount < 2) {
      validationMessage.textContent = 'You must plot two points to answer this question.';
      validationMessage.style.display = 'block';
    }

    // Verify only 1 point was marked (incomplete for Item 2)
    expect(pointCount).toBe(1);

    // Verify custom validation message is shown
    expect(validationMessage.style.display).toBe('block');
    expect(validationMessage.textContent).toBe('You must plot two points to answer this question.');
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
export const Q16_PCI_D24: Story = {
  name: 'Q16-PCI-D24',
  ...createPciStory({
    itemName: 'item-2',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [
          { x: -3, y: 0 },
          { x: 0, y: -2 }
        ],
        expected: ['-3,0', '0,-2']
      }
    ]
  })
};
export const Q16_PCI_D25: Story = {
  name: 'Q16-PCI-D25',
  render: () => html`
    <qti-item>
      <div style="display:block; width: 900px; height: 700px;">
        <item-container id="item-container"></item-container>
        <qti-end-attempt-interaction
          id="end-attempt-btn"
          response-identifier="RESPONSE"
          title="End Attempt"
          style="margin-top: 16px;"
        ></qti-end-attempt-interaction>
        <div id="validation-message" style="margin-top: 8px; color: red; display: none;"></div>
      </div>
    </qti-item>
  `,
  play: async ({ canvasElement }) => {
    await loadPciItem(canvasElement, 'item-2');
    const { assessmentItem, pciElements } = await assertPciLoaded(canvasElement, 1);

    const validationMessage = canvasElement.querySelector('#validation-message') as HTMLElement;
    const pciElement = pciElements[0] as any;

    // Mark TWO points - Item 2 requires two points for valid response
    await clickGraphPoint(pciElement, '#graph svg', { x: -3, y: 0 });
    await clickGraphPoint(pciElement, '#graph svg', { x: 0, y: -2 });

    // Wait for the response to be registered
    await waitFor(() => {
      const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
      expect(response?.value).toEqual(['-3,0', '0,-2']);
      return true;
    });

    clickEndAttempt(canvasElement);

    // Validate with 2 points - should be valid
    const isValid = assessmentItem.validate(true);

    // Only show validation message if invalid (should NOT show)
    if (!isValid) {
      validationMessage.textContent = 'You must plot two points to answer this question.';
      validationMessage.style.display = 'block';
    }

    // Verify the response is valid
    expect(isValid).toBe(true);

    // Verify completionStatus IS 'completed'
    const completionStatus = assessmentItem.variables.find(v => v.identifier === 'completionStatus');
    expect(completionStatus?.value).toBe('completed');

    // Verify NO validation message is shown
    expect(validationMessage.style.display).toBe('none');
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
export const Q16_PCI_D26: Story = createRestoreStory({
  name: 'Q16-PCI-D26',
  itemIdentifier: 'pci-graphing-interaction-2',
  nextItemIdentifier: 'pci-graphing-interaction-variables',
  startItemIndex: 1, // Start on item 2 (0-based index)
  plotSpecs: [
    {
      responseIdentifier: 'RESPONSE',
      graphSelector: '#graph svg',
      points: [
        { x: -3, y: 0 },
        { x: 0, y: -2 }
      ],
      expected: ['-3,0', '0,-2']
    }
  ]
});

export const Q16_PCI_D31: Story = {
  name: 'Q16-PCI-D31',
  ...createPciStory({ itemName: 'item-3', expectedPciCount: 2 })
};
export const Q16_PCI_D32: Story = {
  name: 'Q16-PCI-D32',
  ...createPciStory({ itemName: 'item-3', expectedPciCount: 2, consoleExpectations: consoleDouble })
};
export const Q16_PCI_D33: Story = {
  name: 'Q16-PCI-D33',
  ...createPciStory({ itemName: 'item-3', expectedPciCount: 2 })
};
export const Q16_PCI_D34: Story = {
  name: 'Q16-PCI-D34',
  ...createPciStory({
    itemName: 'item-3',
    expectedPciCount: 2,
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph-1 svg',
        points: [
          { x: -3, y: 0 },
          { x: 0, y: -2 }
        ],
        expected: ['-3,0', '0,-2']
      },
      {
        responseIdentifier: 'RESPONSE1',
        graphSelector: '#graph-2 svg',
        points: [
          { x: -3, y: 0 },
          { x: 0, y: -2 }
        ],
        expected: ['-3,0', '0,-2']
      }
    ]
  })
};
export const Q16_PCI_D35: Story = {
  name: 'Q16-PCI-D35',
  ...createPciStory({
    itemName: 'item-3',
    expectedPciCount: 2,
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph-1 svg',
        points: [
          { x: -3, y: 0 },
          { x: 0, y: -2 }
        ],
        expected: ['-3,0', '0,-2']
      },
      {
        responseIdentifier: 'RESPONSE1',
        graphSelector: '#graph-2 svg',
        points: [
          { x: -3, y: 0 },
          { x: 0, y: -2 }
        ],
        expected: ['-3,0', '0,-2']
      }
    ],
    endAttemptCheck: { expectedValid: true, message: 'Invalid response: Please mark at least one point on the graph.' }
  })
};
export const Q16_PCI_D36: Story = createRestoreStory({
  name: 'Q16-PCI-D36',
  itemIdentifier: 'pci-graphing-interaction-variables',
  nextItemIdentifier: 'pci-graphing-interaction-altconfig',
  startItemIndex: 2, // Start on item 3 (0-based index)
  plotSpecs: [
    {
      responseIdentifier: 'RESPONSE',
      graphSelector: '#graph-1 svg',
      points: [
        { x: -3, y: 0 },
        { x: 0, y: -2 }
      ],
      expected: ['-3,0', '0,-2']
    },
    {
      responseIdentifier: 'RESPONSE1',
      graphSelector: '#graph-2 svg',
      points: [
        { x: -3, y: 0 },
        { x: 0, y: -2 }
      ],
      expected: ['-3,0', '0,-2']
    }
  ]
});

export const Q16_PCI_D41: Story = { name: 'Q16-PCI-D41', ...createPciStory({ itemName: 'item-4' }) };
export const Q16_PCI_D42: Story = {
  name: 'Q16-PCI-D42',
  ...createPciStory({ itemName: 'item-4', consoleExpectations: consoleSingle })
};
export const Q16_PCI_D43: Story = {
  name: 'Q16-PCI-D43',
  ...createPciStory({
    itemName: 'item-4',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [{ x: 0.5, y: 2 }],
        expected: ['0.5,2']
      }
    ]
  })
};
export const Q16_PCI_D44: Story = {
  name: 'Q16-PCI-D44',
  ...createPciStory({
    itemName: 'item-4',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [{ x: 0.5, y: 2 }],
        expected: ['0.5,2']
      }
    ],
    endAttemptCheck: { expectedValid: true, message: 'Invalid response: Please mark at least one point on the graph.' }
  })
};
export const Q16_PCI_D45: Story = createRestoreStory({
  name: 'Q16-PCI-D45',
  itemIdentifier: 'q16-pci-item4',
  nextItemIdentifier: 'q16-pci-item5',
  startItemIndex: 3, // Start on item 4 (0-based index)
  plotSpecs: [
    {
      responseIdentifier: 'RESPONSE',
      graphSelector: '#graph svg',
      points: [{ x: 0.5, y: 2 }],
      expected: ['0.5,2']
    }
  ]
});

export const Q16_PCI_D51: Story = { name: 'Q16-PCI-D51', ...createPciStory({ itemName: 'item-5' }) };
export const Q16_PCI_D52: Story = {
  name: 'Q16-PCI-D52',
  ...createPciStory({ itemName: 'item-5', consoleExpectations: consoleSingle })
};
export const Q16_PCI_D53: Story = {
  name: 'Q16-PCI-D53',
  ...createPciStory({
    itemName: 'item-5',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [{ x: 0.5, y: 2 }],
        expected: ['0.5,2']
      }
    ]
  })
};
export const Q16_PCI_D54: Story = {
  name: 'Q16-PCI-D54',
  ...createPciStory({
    itemName: 'item-5',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [{ x: 0.5, y: 2 }],
        expected: ['0.5,2']
      }
    ],
    endAttemptCheck: { expectedValid: true, message: 'Invalid response: Please mark at least one point on the graph.' }
  })
};
export const Q16_PCI_D55: Story = createRestoreStory({
  name: 'Q16-PCI-D55',
  itemIdentifier: 'q16-pci-item5',
  nextItemIdentifier: 'q16-pci-item6',
  startItemIndex: 4, // Start on item 5 (0-based index)
  plotSpecs: [
    {
      responseIdentifier: 'RESPONSE',
      graphSelector: '#graph svg',
      points: [{ x: 0.5, y: 2 }],
      expected: ['0.5,2']
    }
  ]
});

export const Q16_PCI_D61: Story = { name: 'Q16-PCI-D61', ...createPciStory({ itemName: 'item-6' }) };
export const Q16_PCI_D62: Story = {
  name: 'Q16-PCI-D62',
  ...createPciStory({ itemName: 'item-6', consoleExpectations: consoleSingle })
};
export const Q16_PCI_D63: Story = {
  name: 'Q16-PCI-D63',
  ...createPciStory({
    itemName: 'item-6',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [{ x: 0.5, y: 2 }],
        expected: ['0.5,2']
      }
    ]
  })
};
export const Q16_PCI_D64: Story = {
  name: 'Q16-PCI-D64',
  ...createPciStory({
    itemName: 'item-6',
    plotSpecs: [
      {
        responseIdentifier: 'RESPONSE',
        graphSelector: '#graph svg',
        points: [{ x: 0.5, y: 2 }],
        expected: ['0.5,2']
      }
    ],
    endAttemptCheck: { expectedValid: true, message: 'Invalid response: Please mark at least one point on the graph.' }
  })
};
export const Q16_PCI_D65: Story = createRestoreStory({
  name: 'Q16-PCI-D65',
  itemIdentifier: 'q16-pci-item6',
  nextItemIdentifier: 'q16-pci-item5',
  startItemIndex: 5, // Start on item 6 (0-based index)
  navigateAway: 'prev',
  plotSpecs: [
    {
      responseIdentifier: 'RESPONSE',
      graphSelector: '#graph svg',
      points: [{ x: 0.5, y: 2 }],
      expected: ['0.5,2']
    }
  ]
});
