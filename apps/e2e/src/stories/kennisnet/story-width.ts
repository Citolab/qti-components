/**
 * Every Kennisnet story is laid out at this one width, whatever the canvas or the Vitest viewport:
 * kennisnet.stories.ts wraps each story in it, and kennisnet.legacy.spec.ts renders its Chrome 120
 * captures at it. The VRT baselines and the legacy captures then share a layout, so the toolbar
 * overlay lines up with the live story line for line.
 */
export const KENNISNET_STORY_WIDTH = '960px';
