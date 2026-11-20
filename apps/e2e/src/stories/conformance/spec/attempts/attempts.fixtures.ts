/**
 * Shared tests in `public/assets/qti-test-package/`, used by the attempts stories.
 *
 * - `ITEM_SESSION_CONTROL_TEST`: one nonlinear, individual part with the same choice item three
 *   times: no `qti-item-session-control` (max-attempts 1 by default), `max-attempts="2"`, and
 *   `max-attempts="0"` (unlimited, with `allow-skipping="false"`).
 * - `LINEAR_ADAPTIVE_TEST`: a linear part with `max-attempts="1"`, an adaptive item and a choice item.
 */
export const ITEM_SESSION_CONTROL_TEST = '/assets/qti-test-package/assessment-item-session-control.xml';
export const LINEAR_ADAPTIVE_TEST = '/assets/qti-test-package/assessment-linear-adaptive.xml';
