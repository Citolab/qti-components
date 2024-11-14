import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { Meta, StoryObj } from '@storybook/web-components';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'Theme',
  parameters: {
    cssprops: {
      "qti-primary-light": {
        value: "hsl(120deg 100% 25% / 49%)",
        description: "Optional description",
      },
      "qti-border-thickness": {
        value: "2px",
        description: "Optional description",
      },
      "qti-gap-size": {
        value: "0.5rem",
        description: "Optional description",
      },
    }
  },
};
export default meta;

class ButtonComponent extends LitElement {
  @property({ type: String }) ch: string;
  @property({ type: String }) cha: string;
  private placeChild = this.firstChild;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  constructor() {
    super();
    this.placeChild?.remove();
  }

  render() {
    return html`<div class=${this.ch}><div class=${`check-size ${this.cha}`}></div></div>
      <div>${this.placeChild}</div>
      <div part="drop"></div>`;
  }
}
window.customElements.define('button-component', ButtonComponent);

// grid grid-cols-6 gap-4
export const Theme = (mod: string) => html`
<css-variable-editor></css-variable-editor>
  <div style="display:grid;grid-template-columns: repeat(7, minmax(0, 1fr));gap:2rem;">
    <style>
      button-component {
        display: flex;
        align-items: center;
      }
      @scope {
        [clip] {
          width: 100%;
          height: 50px;
          clip-path: polygon(50% 0, 0% 100%, 100% 100%);
        }
      }
    </style>

    <div>button</div>
    <div>hover</div>
    <div>focus</div>
    <div>active</div>
    <div>active+focus</div>
    <div>disabled</div>
    <div>dragging</div>

    <button-component ch="check-radio" cha="" class="check">check</button-component>
    <button-component ch="check-radio" cha="" class="check hov">check</button-component>
    <button-component ch="check-radio" cha="" class="check foc">check</button-component>
    <button-component ch="check-radio" cha="check-radio-checked" class="check act">check</button-component>
    <button-component ch="check-radio" cha="check-radio-checked" class="check foc act">check</button-component>
    <button-component ch="check-radio" cha="check-radio-checked dis" class="check dis">check</button-component>
    <div></div>

    <button-component ch="check-checkbox" cha="" class="check">check</button-component>
    <button-component ch="check-checkbox" cha="" class="check hov">check</button-component>
    <button-component ch="check-checkbox" cha="" class="check foc">check</button-component>
    <button-component ch="check-checkbox" cha="check-checkbox-checked" class="check act">check</button-component>
    <button-component ch="check-checkbox" cha="check-checkbox-checked" class="check foc act"
      >check</button-component
    >
    <button-component ch="check-checkbox" cha="check-checkbox-checked dis" class="check dis"
      >check</button-component
    >
    <div></div>

    <div class="button">button</div>
    <div class="button hov ">button</div>
    <div class="button foc ">button</div>
    <div class="button act ">button</div>
    <div class="button foc act ">button</div>
    <div class="button dis ">button</div>
    <div></div>

    <div class="spot"></div>
    <div class="spot hov "></div>
    <div class="spot foc "></div>
    <div class="spot act "></div>
    <div class="spot foc act "></div>
    <div class="spot dis "></div>
    <div>&#x200B;</div>

    <div clip class="spot"></div>
    <div clip class="spot hov "></div>
    <div clip class="spot foc "></div>
    <div clip class="spot act "></div>
    <div clip class="spot foc act "></div>
    <div clip class="spot dis "></div>
    <div>&#x200B;</div>

    <div class="order">1</div>
    <div class="order hov">1</div>
    <div class="order foc">1</div>
    <div class="order act">1</div>
    <div class="order foc act">1</div>
    <div class="order dis">1</div>
    <div class=""></div>

    <div class="drag">drag</div>
    <div class="drag hov">drag</div>
    <div class="drag foc">drag</div>
    <div class="drag act">drag</div>
    <div class="drag foc act">drag</div>
    <div class="drag dis">drag</div>
    <div class="drag dragging">drag</div>

    <div class="drop"></div>
    <div class="drop hov"></div>
    <div class="drop foc"></div>
    <div class="drop act"></div>
    <div class="drop foc act"></div>
    <div class="drop dis"></div>
    <div class="drop dropping">drop</div>

    <div class="drop"><div class="drag">drag</div></div>
    <div class="drop hov"><div class="drag">drag</div></div>
    <div class="drop foc"><div class="drag">drag</div></div>
    <div class="drop act"><div class="drag">drag</div></div>
    <div class="drop foc act"><div class="drag">drag</div></div>
    <div class="drop dis"><div class="drag">drag</div></div>
    <div></div>

    <div class="drop">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop hov">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop foc">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop act">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop foc act">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop dis">
      With text
      <div class="drag">drag</div>
    </div>
    <div></div>

    <input type="text" class="text" value="Button text" />
    <input type="text" class="text hov" value="Button text" />
    <input type="text" class="text foc" value="Button text" />
    <input type="text" class="text act" value="Button text" />
    <input type="text" class="text foc act" value="Button text" />
    <input type="text" class="text dis" value="Button text" />
    <div></div>

    <select class="select">
      <option>Button text</option>
    </select>
    <select class="select hov">
      <option>Button text</option>
    </select>
    <select class="select foc">
      <option>Button text</option>
    </select>
    <select class="select act">
      <option>Button text</option>
    </select>
    <select class="select foc act">
      <option>Button text</option>
    </select>
    <select class="select dis">
      <option>Button text</option>
    </select>
    <div></div>
  </div>

  <h1>Header 1</h1>
  <h2>Header 2</h2>
  <h3>Header 3</h3>
  <h4>Header 4</h4>
  <p>
    Until now, trying to style an article, document, or blog post with Tailwind has been a tedious task that required a
    keen eye for typography and a lot of complex custom CSS.
  </p>
  <p>
    By default, Tailwind removes all of the default browser styling from paragraphs, headings, lists and more. This ends
    up being really useful for building application UIs because you spend less time undoing user-agent styles, but when
    you <em>really are</em> just trying to style some content that came from a rich-text editor in a CMS or a markdown
    file, it can be surprising and unintuitive.
  </p>
  <p>We get lots of complaints about it actually, with people regularly asking us things like:</p>
  <blockquote>
    <p>
      Why is Tailwind removing the default styles on my <code>h1</code> elements? How do I disable this? What do you
      mean I lose all the other base styles too?
    </p>
  </blockquote>

  <hr />
  <h2>What to expect from here on out</h2>
  <p>It's important to cover all of these use cases for a few reasons:</p>
  <ol>
    <li>We want everything to look good out of the box.</li>
    <li>Really just the first reason, that's the whole point of the plugin.</li>
    <li>
      Here's a third pretend reason though a list with three items looks more realistic than a list with two items.
    </li>
  </ol>
  <p>Now we're going to try out another header style.</p>
  <h3>Typography should be easy</h3>
  <p>So that's a header for you — with any luck if we've done our job correctly that will look pretty reasonable.</p>

  <figure>
    <img
      src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1000&amp;q=80"
      alt=""
    />
    <figcaption>
      Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin
      literature from 45 BC, making it over 2000 years old.
    </figcaption>
  </figure>
  <p>Now I'm going to show you an example of an unordered list to make sure that looks good, too:</p>
  <ul>
    <li>So here is the first item in this list.</li>
    <li>In this example we're keeping the items short.</li>
    <li>Later, we'll use longer, more complex list items.</li>
  </ul>

  <ul>
    <li>
      <p><strong>I often do this thing where list items have headings.</strong></p>
      <p>
        For some reason I think this looks cool which is unfortunate because it's pretty annoying to get the styles
        right.
      </p>
      <p>
        I often have two or three paragraphs in these list items, too, so the hard part is getting the spacing between
        the paragraphs, list item heading, and separate list items to all make sense. Pretty tough honestly, you could
        make a strong argument that you just shouldn't write this way.
      </p>
    </li>
    <li>
      <p><strong>Since this is a list, I need at least two items.</strong></p>
      <p>
        I explained what I'm doing already in the previous list item, but a list wouldn't be a list if it only had one
        item, and we really want this to look realistic. That's why I've added this second list item so I actually have
        something to look at when writing the styles.
      </p>
    </li>
    <li>
      <p><strong>It's not a bad idea to add a third item either.</strong></p>
      <p>
        I think it probably would've been fine to just use two items but three is definitely not worse, and since I seem
        to be having no trouble making up arbitrary things to type, I might as well include it.
      </p>
    </li>
  </ul>
  <p>
    After this sort of list I usually have a closing statement or paragraph, because it kinda looks weird jumping right
    to a heading.
  </p>

  <h3>What about nested lists?</h3>
  <p>
    Nested lists basically always look bad which is why editors like Medium don't even let you do it, but I guess since
    some of you goofballs are going to do it we have to carry the burden of at least making it work.
  </p>
  <ol>
    <li>
      <strong>Nested lists are rarely a good idea.</strong>
      <ul>
        <li>
          You might feel like you are being really "organized" or something but you are just creating a gross shape on
          the screen that is hard to read.
        </li>
        <li>Nested navigation in UIs is a bad idea too, keep things as flat as possible.</li>
        <li>Nesting tons of folders in your source code is also not helpful.</li>
      </ul>
    </li>
    <li>
      <strong>Since we need to have more items, here's another one.</strong>
      <ul>
        <li>I'm not sure if we'll bother styling more than two levels deep.</li>
        <li>Two is already too much, three is guaranteed to be a bad idea.</li>
        <li>If you nest four levels deep you belong in prison.</li>
      </ul>
    </li>
    <li>
      <strong>Two items isn't really a list, three is good though.</strong>
      <ul>
        <li>Again please don't nest lists if you want people to actually read your content.</li>
        <li>Nobody wants to look at this.</li>
        <li>I'm upset that we even have to bother styling this.</li>
      </ul>
    </li>
  </ol>
  <p>
    The most annoying thing about lists in Markdown is that <code>&lt;li&gt;</code> elements aren't given a child
    <code>&lt;p&gt;</code> tag unless there are multiple paragraphs in the list item. That means I have to worry about
    styling that annoying situation too.
  </p>
  <ul>
    <li>
      <p><strong>For example, here's another nested list.</strong></p>
      <p>But this time with a second paragraph.</p>
      <ul>
        <li>These list items won't have <code>&lt;p&gt;</code> tags</li>
        <li>Because they are only one line each</li>
      </ul>
    </li>
    <li>
      <p><strong>But in this second top-level list item, they will.</strong></p>
      <p>This is especially annoying because of the spacing on this paragraph.</p>
      <ul>
        <li>
          <p>
            As you can see here, because I've added a second line, this list item now has a
            <code>&lt;p&gt;</code> tag.
          </p>
          <p>This is the second line I'm talking about by the way.</p>
        </li>
        <li><p>Finally here's another list item so it's more like a list.</p></li>
      </ul>
    </li>
    <li><p>A closing list item, but with no nested list, because why not?</p></li>
  </ul>
  <p>And finally a sentence to close off this section.</p>
  <h2>There are other elements we need to style</h2>
  <p>
    I almost forgot to mention links, like
    <a href="https://tailwindcss.com">this link to the Tailwind CSS website</a>. We almost made them blue but that's so
    yesterday, so we went with dark gray, feels edgier.
  </p>
  <p>We even included table styles, check it out:</p>
  <table>
    <thead>
      <tr>
        <th>Wrestler</th>
        <th>Origin</th>
        <th>Finisher</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bret "The Hitman" Hart</td>
        <td>Calgary, AB</td>
        <td>Sharpshooter</td>
      </tr>
      <tr>
        <td>Stone Cold Steve Austin</td>
        <td>Austin, TX</td>
        <td>Stone Cold Stunner</td>
      </tr>
      <tr>
        <td>Randy Savage</td>
        <td>Sarasota, FL</td>
        <td>Elbow Drop</td>
      </tr>
      <tr>
        <td>Vader</td>
        <td>Boulder, CO</td>
        <td>Vader Bomb</td>
      </tr>
      <tr>
        <td>Razor Ramon</td>
        <td>Chuluota, FL</td>
        <td>Razor's Edge</td>
      </tr>
    </tbody>
  </table>
  <p>
    We also need to make sure inline code looks good, like if I wanted to talk about
    <code>&lt;span&gt;</code> elements or tell you the good news about <code>@tailwindcss/typography</code>.
  </p>
  <h3>Sometimes I even use <code>code</code> in headings</h3>
  <p>
    Even though it's probably a bad idea, and historically I've had a hard time making it look good. This
    <em>"wrap the code blocks in backticks"</em> trick works pretty well though really.
  </p>
  <p>
    Another thing I've done in the past is put a <code>code</code> tag inside of a link, like if I wanted to tell you
    about the <a href="https://github.com/tailwindcss/docs"><code>tailwindcss/docs</code></a> repository. I don't love
    that there is an underline below the backticks but it is absolutely not worth the madness it would require to avoid
    it.
  </p>
  <h4>We haven't used an <code>h4</code> yet</h4>
  <p>
    But now we have. Please don't use <code>h5</code> or <code>h6</code> in your content, Medium only supports two
    heading levels for a reason, you animals. I honestly considered using a <code>before</code> pseudo-element to scream
    at you if you use an <code>h5</code> or <code>h6</code>.
  </p>
  <p>
    We don't style them at all out of the box because <code>h4</code> elements are already so small that they are the
    same size as the body copy. What are we supposed to do with an <code>h5</code>, make it <em>smaller</em> than the
    body copy? No thanks.
  </p>
  <h3>We still need to think about stacked headings though.</h3>
  <h4>Let's make sure we don't screw that up with <code>h4</code> elements, either.</h4>
  <p>Phew, with any luck we have styled the headings above this text and they look pretty good.</p>
  <p>
    Let's add a closing paragraph here so things end with a decently sized block of text. I can't explain why I want
    things to end that way but I have to assume it's because I think things will look weird or unbalanced if there is a
    heading too close to the end of the document.
  </p>
  <p>What I've written here is probably long enough, but adding this final sentence can't hurt.</p>
`;

// ${components('sm')}
// export const Components = args => html`<button class="button">asasd</button> <button class="button-in">asasd</button>`;


/*
      [class] {
          position: relative;
          &:hover::before {
            content: attr(class);
            font-size: 0.8rem;
            color: #666;
            position: absolute;
            text-transform: lowercase;
            white-space: nowrap;
            left: 0;
            top: 0;
            z-index: 1000;
            transform: translateY(-150%);
            top: anchor(--myAnchor bottom);
          }
        }
        */