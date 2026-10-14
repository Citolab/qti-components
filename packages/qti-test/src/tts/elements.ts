import {
  TestItemToSpeech,
  TestTtsNext,
  TestTtsPause,
  TestTtsPick,
  TestTtsPlay,
  TestTtsPrev,
  TestTtsResume,
  TestTtsStop
} from './test-item-to-speech';

export {
  TestItemToSpeech,
  TestTtsNext,
  TestTtsPause,
  TestTtsPick,
  TestTtsPlay,
  TestTtsPrev,
  TestTtsResume,
  TestTtsStop
};

/** The text-to-speech elements, for registering them yourself (e.g. in a scoped registry). Defines nothing. */
export const ttsElements = [
  { tag: 'test-item-to-speech', ctor: TestItemToSpeech },
  { tag: 'test-tts-next', ctor: TestTtsNext },
  { tag: 'test-tts-pause', ctor: TestTtsPause },
  { tag: 'test-tts-pick', ctor: TestTtsPick },
  { tag: 'test-tts-play', ctor: TestTtsPlay },
  { tag: 'test-tts-prev', ctor: TestTtsPrev },
  { tag: 'test-tts-resume', ctor: TestTtsResume },
  { tag: 'test-tts-stop', ctor: TestTtsStop }
] as const;
