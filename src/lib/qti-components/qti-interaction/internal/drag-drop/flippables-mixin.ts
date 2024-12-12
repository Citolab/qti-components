// THIS IS A MIXIN, THIS IS A MIXIN
// USE LIKE THIS
// ```class DropList extends Flippables(LitElement) {```
// mixin which animates children with FLIP
// a combination between this directive:
// https://ng-run.com/edit/9MGr5dYWA20AiJtpy5az?open=app%2Fapp.component.html
// and a tutorial how to make a mixin
// https://lit.dev/docs/composition/mixins/

import { LitElement } from 'lit';
import { Interaction } from '../interaction/interaction';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export declare class FlippablesInterface {
  connectedCallback(): void;
  disconnectedCallback(): void;
}

// just a conversion of a angular FLIP directive, made as a Mixin
// https://ng-run.com/edit/9MGr5dYWA20AiJtpy5az?open=app%2Fapp.component.html
export const FlippablesMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  droppablesSel: string,
  draggablesSel: string
) => {
  abstract class FlippablesElement extends superClass {
    // private state = new Map<Element, any>();
    // private observer: MutationObserver;
    // flippablesSelector: string;
    // override async firstUpdated(changedProps) {
    //   await this.updateComplete; // pk: this is the key to calculate correct proportions
    //   const draggables = Array.from(this.querySelectorAll(draggablesSel));
    //   draggables.forEach((elem) => {
    //     const { left, top, width, height } = elem.getBoundingClientRect();
    //     this.state.set(elem, { left, top, width, height });
    //   });
    //   this.observer = new MutationObserver(this.animateMe);
    //   const droppables = Array.from(this.querySelectorAll(droppablesSel));
    //   droppables.forEach((draggable) => {
    //     this.observer.observe(draggable, { childList: true });
    //   });
    //   this.observer.observe(this, { childList: true });
    //   super.firstUpdated(changedProps);
    // }
    // private animateMe = () => {
    //   this.state.forEach((value, elem) => {
    //     const { left, top, width, height } = elem.getBoundingClientRect();
    //     if (this.state.get(elem) == null) {
    //       this.state.set(elem, { left, top, width, height });
    //     }
    //     const cache = this.state.get(elem);
    //     const deltaX = cache.left - left;
    //     const deltaY = cache.top - top;
    //     const deltaW = cache.width / width;
    //     const deltaH = cache.height / height;
    //     this.state.set(elem, { left, top, width, height });
    //     const { duration, easing } = { duration: 350, easing: 'cubic-bezier(0.26, 0.86, 0.44, 0.985)' };
    //     elem.animate(
    //       [
    //         {
    //           transformOrigin: 'top left',
    //           transform: `
    // translate(${deltaX}px, ${deltaY}px)
    // scale(${deltaW}, ${deltaH})
    // `,
    //           // width: cache.width,
    //           // height: cache.height+ 'px',
    //           // opacity: cache.opacity,
    //         },
    //         {
    //           transformOrigin: 'top left',
    //           transform: 'none',
    //         },
    //       ],
    //       {
    //         duration,
    //         easing,
    //       }
    //     );
    //   });
    // };
    // override disconnectedCallback(): void {
    //   super.disconnectedCallback();
    //   this.observer.disconnect();
    // }
  }
  return FlippablesElement as Constructor<FlippablesInterface> & T;
};
