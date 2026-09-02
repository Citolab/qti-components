/*
 * Compiled from OUTSIDE the workspace, against an npm install of the packed tarball.
 * That is the whole point: the `@qti-components/*` packages are devDependencies of
 * @citolab/qti-components, so a real consumer never receives them, and any declaration
 * that imports one is unresolvable there while resolving fine in the monorepo.
 *
 * Keep this exercising the PUBLIC surface a consumer actually touches, not obscure corners.
 */
import { QtiChoiceInteractionCorrection } from '@citolab/qti-components/corrections';
import { QtiChoiceInteraction, QtiHotspotInteraction } from '@citolab/qti-components';
import type { QtiTest, TestContainer } from '@citolab/qti-components/qti-test';
import type { LitElement } from 'lit';

// Registering a correction subclass under the standard tag is the documented way to opt in.
customElements.define('qti-choice-interaction', QtiChoiceInteractionCorrection);
const plain: CustomElementConstructor = QtiChoiceInteraction;

// Interactions must satisfy the standard Lit mixin constraint.
type Constructor<T = object> = new (...args: never[]) => T;
declare function SomeMixin<T extends Constructor<LitElement>>(Base: T): T;
SomeMixin(QtiHotspotInteraction);

// A URL-bearing attribute has to accept `null` — React drops the attribute for it.
declare const maybeUrl: string | null;
const container: Partial<TestContainer> = { testURL: maybeUrl };

// The element type must carry what its mixins add.
declare const test: QtiTest;
const cb = test.postLoadTransformCallback;

void plain;
void container;
void cb;
