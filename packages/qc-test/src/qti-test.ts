import type { PostLoadTransformCallback, PostLoadTestTransformCallback } from './core/mixins/test-navigation.mixin';
import type { LitElement } from 'lit';
import type { TestContext } from '@qti-components/shared';
import type { SessionContext } from '@qti-components/shared';
import type { OutcomeVariable, VariableDeclaration, VariableValue } from '@qti-components/shared';

export interface QtiTest extends LitElement, ITestNavigationMixin, ITestProcessingMixin, IQtiTest {}

export interface IQtiTest {
  // Properties from TestBase
  testContext: Readonly<TestContext>;
  sessionContext: Readonly<SessionContext>;

  // Methods from TestBase
  updateItemVariables(itemRefID: string, variables: VariableValue<string | string[] | null>[]): void;
}

export interface ITestNavigationMixin {
  navigate: 'item' | 'section' | null;
  cacheTransform: boolean;
  requestTimeout: number;
  showLoadingIndicators: boolean;

  postLoadTransformCallback: PostLoadTransformCallback | null;
  postLoadTestTransformCallback: PostLoadTestTransformCallback | null;
  navigateTo(type: 'item' | 'section', id?: string): void;
  retryNavigation(): void;
}

export interface ITestProcessingMixin {
  // Methods from TestProcessingMixin
  updateOutcomeVariable(identifier: string, value: string | string[] | undefined): void;
  getOutcome(identifier: string): Readonly<OutcomeVariable>;
  getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>>;
  outcomeProcessing(): boolean;
}
