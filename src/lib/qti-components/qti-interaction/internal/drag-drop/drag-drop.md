qti-match-interaction
'qti-simple-match-set:first-of-type qti-simple-associable-choice',
false,
'qti-simple-match-set:last-of-type qti-simple-associable-choice'

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<slot part="slot">
  ↳
  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice> <-- drag
    <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice> <-- drag
  </qti-simple-match-set>

  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="M">A Midsummer-Night's</qti-simple-associable-choice> <-- drop
    <qti-simple-associable-choice identifier="R">Romeo and Juliet</qti-simple-associable-choice> <-- drop
  </qti-simple-match-set>
</slot>
```

qti-order-interaction
`qti-simple-choice`,
true,
'drop-list'

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<div part="container">
  <slot part="drags">
    ↳
    <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice> <-- drag
    <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice> <-- drag
    <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice> <-- drag
  </slot>
  <div part="drops">
    {
    <drop-list part="drop-list"></drop-list> <-- drop
    <span part="correct-response">correctResponse</span>
    }
  </div>
</div>
```

qti-gap-match-interaction
'qti-gap-text',
false,
'qti-gap'

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<slot part="drags" name="qti-gap-text">
  ↳
  <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text> <-- drag
  <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text> <-- drag
  <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text> <-- drag
  <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text> <-- drag
</slot>
<slot part="drops">
  ↳
  <blockquote>
    <p>
      Now is the <qti-gap identifier="G1"></qti-gap> of our discontent<br />
      Made glorious <qti-gap identifier="G2"></qti-gap> by this sun of York;<br />
      And all the clouds that lour'd upon our house<br />
      In the deep bosom of the ocean buried.
    </p>
  </blockquote>
</slot>
```

qti-associate-interaction
'qti-simple-associable-choice',
true,
'.dl'

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>

<slot name="qti-simple-associable-choice">
  ↳
  <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
  <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
  <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
</slot>
<div part="drop-container">
  {
  <div part="associables-container">
    <div name="left${index}" part="drop-list" class="dl" identifier="droplist${index}_left"></div>
    <div name="right${index}" part="drop-list" class="dl" identifier="droplist${index}_right"></div>
  </div>
  }
</div>
```

qti-graphic-gap-match-interaction
'qti-gap-img',
false,
'qti-associable-hotspot'

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<slot
  >↳
  <qti-associable-hotspot coords="55,256,133,319" identifier="A" match-max="1" shape="rect"></qti-associable-hotspot>
</slot>
<slot part="drags" name="drags"></slot>
  ↳
  <qti-gap-img identifier="DraggerD" match-max="1">
    <img src="qti-graphic-gap-match-interaction/d-bay.png" alt="Choice D, Bay of Pigs" height="63" width="78" />
  </qti-gap-img>
</slot>
```

'qti-simple-match-set:first-of-type qti-simple-associable-choice',
false,
'qti-simple-match-set:last-of-type qti-simple-associable-choice' ->
<slot part="slot"></slot>
<slot part="dropslot" name="qti-simple-associable-choice"></slot>

`qti-simple-choice`,
true,
'drop-list'

'qti-gap-text',
false,
'qti-gap' -> <slot name="qti-gap-text"></slot>

'qti-simple-associable-choice',
true,
'.dl'

'qti-gap-img',
false,
'qti-associable-hotspot' -> <slot part="drags" name="drags"></slot>
