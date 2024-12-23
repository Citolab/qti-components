import { html } from 'lit';

export default {};

export const SharedCSS1 = () => html`
  <qti-item-body>
    <h4>Underline an Element</h4>

    <p>Look at the <span class="qti-underline">underlined text</span> in this sentence.</p>

    <h4>Horizontal Alignment - Left, Center, Right <span class="muted">- table border added for effect</span></h4>

    <table class="qti-fullwidth qti-bordered">
      <tbody>
        <tr>
          <td class="qti-align-left">I am left-aligned text in a table cell.</td>
        </tr>
        <tr>
          <td class="qti-align-center">I am center-aligned text in a table cell.</td>
        </tr>
        <tr>
          <td class="qti-align-right">I am right-aligned text in a table cell.</td>
        </tr>
      </tbody>
    </table>

    <h4>
      Vertical Alignment - Top, Middle, Baseline, Bottom
      <span class="muted">- 4x28 images and paragraph borders added for effect</span>
    </h4>

    <p class="qti-bordered">
      <img
        class="qti-valign-top"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAcCAYAAABGdB6IAAAAFUlEQVR42mNkYPhfz4AEGEcFhosAAM7zKeUTvPB1AAAAAElFTkSuQmCC"
        hspace="4"
        vspace="0"
        width="4"
        height="28"
      />
      I am top-valigned.
    </p>
    <p class="qti-bordered">
      <img
        class="qti-valign-middle"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAcCAYAAABGdB6IAAAAFUlEQVR42mNkYPhfz4AEGEcFhosAAM7zKeUTvPB1AAAAAElFTkSuQmCC"
        hspace="4"
        vspace="0"
        width="4"
        height="28"
      />
      I am middle-valigned.
    </p>
    <p class="qti-bordered">
      <img
        class="qti-valign-baseline"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAcCAYAAABGdB6IAAAAFUlEQVR42mNkYPhfz4AEGEcFhosAAM7zKeUTvPB1AAAAAElFTkSuQmCC"
        hspace="4"
        vspace="0"
        width="4"
        height="28"
      />
      I am baseline-valigned.
    </p>
    <p class="qti-bordered">
      <img
        class="qti-valign-bottom"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAcCAYAAABGdB6IAAAAFUlEQVR42mNkYPhfz4AEGEcFhosAAM7zKeUTvPB1AAAAAElFTkSuQmCC"
        hspace="4"
        vspace="0"
        width="4"
        height="28"
      />
      I am bottom-valigned.
    </p>

    <h4>Make an Element Fullwidth (width=100%) <span class="muted">- table border added for effect</span></h4>

    <table class="qti-fullwidth qti-bordered">
      <tbody>
        <tr>
          <td class="qti-align-left">I am left-aligned</td>
        </tr>
        <tr>
          <td class="qti-align-center">I am center-aligned</td>
        </tr>
        <tr>
          <td class="qti-align-right">I am right-aligned</td>
        </tr>
      </tbody>
    </table>

    <h4>Add an Element Border <span class="muted">- second paragraph is bordered</span></h4>

    <div>
      <p>Ho hum. I am a non-bordered paragraph.</p>
      <p class="qti-bordered">Look at me! I am a bordered paragraph.</p>
      <p>I am yet another non-bordered paragraph.</p>
    </div>

    <h4>Place an element in a Well <span class="muted">- second paragraph is in a well</span></h4>

    <div>
      <p>Ho hum. I am a non-bordered paragraph.</p>
      <p class="qti-well">Look at me! I am in a well!</p>
      <p>I am yet another non-bordered paragraph.</p>
    </div>
  </qti-item-body>
`;
