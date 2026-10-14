import type { ComputedContext } from '@qti-components/base';
import type { QtiTestPluginState } from './types/qti-test-state';

/**
 * A plugin's entry in the state, typed through `QtiTestPluginState`, or `undefined` before the
 * plugin has stored anything. Read it from `computedContext`; write it by dispatching
 * `cito-test-update-plugin-state` (`dispatchPublic`).
 */
export const pluginState = <K extends keyof QtiTestPluginState & string>(
  context: Pick<ComputedContext, 'plugins'> | undefined,
  plugin: K
): QtiTestPluginState[K] | undefined => context?.plugins?.[plugin] as QtiTestPluginState[K] | undefined;
