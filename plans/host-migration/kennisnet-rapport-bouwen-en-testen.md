# Toetsen-frontend lokaal bouwen en testen tegen nieuwe qti-components

_Cito / qti-components — 9 oktober 2026_

## Waarom

Wij willen nieuwe versies van qti-components al vóór een release tegen jullie frontend kunnen
bouwen en testen. Dan zien we vooraf wat er bij jullie breekt, en kunnen we migratiescripts of
pull requests aanleveren in plaats van alleen release notes. Daarvoor moeten we jullie frontend
bij ons kunnen installeren, bouwen en de tests kunnen draaien. Dat lukt nu nog niet. Hieronder
staat wat we geprobeerd hebben, wat ontbreekt en wat we van jullie nodig hebben.

## Wat we gedaan hebben

- De huidige qti-components (9.3.0 plus nog niet uitgebrachte wijzigingen) als tarball gebouwd.
- Die tarball in een kopie van jullie frontend gezet in plaats van `@kennisnet/qti-components`.
- `npm install`, en daarna een typecheck van jullie QTI-laag: `projects/shared/src/lib/qti`,
  `projects/shared/src/lib/player` en `projects/player/src/app/qti`.

Onze kopie is een momentopname van de broncode zonder git-geschiedenis (de repository bij ons heeft
geen commits).

## Resultaat

**Volledig installeren lukt niet.** `.npmrc` haalt twee scopes uit jullie Artifactory
(`artifactory.bks.kennisnet.nl`), en die is vanaf ons netwerk niet bereikbaar (time-out). Het gaat
om deze pakketten:

| Pakket                                                     | Versie    | Gebruikt in (bestanden) |
| ---------------------------------------------------------- | --------- | ----------------------- |
| `@kennisnet/ng-palet`                                      | `^21.4.0` | 56                      |
| `@kennisnet/ng-palet-experimental`                         | `^21.4.1` | 1                       |
| `@kennisnet/ngx-lasso`                                     | `^2.0.0`  | 7                       |
| `@kennisnet/palet`                                         | `^1.1.7`  | 3                       |
| `@kennisnet/qti-components`                                | `^7.28.1` | 17                      |
| `@fortawesome/pro-light-svg-icons`, `-regular-`, `-solid-` | `~5.15.4` | 16                      |

FontAwesome Pro is bovendien een licentie; die pakketten staan niet op de publieke npm.

**Zonder die pakketten is jullie QTI-laag goed te controleren.** Geen van de 17 bestanden die
qti-components gebruiken importeert een ander privépakket. Tegen de nieuwe versie geeft de
typecheck één echte fout:

- `projects/shared/src/lib/qti/qti-test.ts`: `correctResponseMode` (en
  `fullCorrectResponseOnlyWhenIncorrect`) staan niet meer in het type `ConfigContext`. Ze horen nu
  bij `CorrectionConfig`, dat ook geëxporteerd wordt. Oplossing: het object typen als
  `ConfigContext & CorrectionConfig`. Het gedrag verandert niet; de waarden worden nog op dezelfde
  plek gelezen.

De overige fouten komen alleen doordat FontAwesome Pro ontbreekt.

**De tests draaien nog niet.** `store.spec.ts` laadt via `projects/shared/src/public-api.ts` ook
`helpers/palet-default-icons.ts`, en dat importeert FontAwesome Pro. Daardoor start de spec niet,
ook al test hij zelf niets met iconen.

## Workarounds die de bibliotheek nu zelf oplost

We vonden 22 plekken waar de frontend om de bibliotheek heen werkt. Bij de meeste is dat sinds
versie 8 niet meer nodig:

| Workaround in de frontend                                                             | Nu in de bibliotheek                                                                                                                           |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Drag-icoon (`fa-grip-vertical`) in elke sleepbare keuze injecteren                    | Ingebouwd grip-icoon via de variabele `--qti-grip-mask`; eigen icoon = die variabele zetten                                                    |
| Correct/fout op sleepkeuzes: `internals.states` uitlezen, klassen en iconen toevoegen | States `:state(candidate-correct)` / `-incorrect` / `-partially-correct` en badges `::part(correction-…)`                                      |
| `span.correct-option` opmaken                                                         | Bestaat niet meer: het juiste antwoord is een kloon met het attribuut `answer-key`                                                             |
| Select point: MutationObserver die een Font Awesome-pin tekent                        | Ingebouwde marker, in te stellen met `--qti-select-point-icon`, `-marker-size`, `-marker-anchor`, `-marker-color`; correct/fout kleurt vanzelf |
| Eigen stylesheet in de shadow root van `test-container` injecteren                    | Ondersteund via `<test-container><template><style>`; eigen regels in `@layer qti-extended`                                                     |
| `correctResponseMode` en `fullCorrectResponseOnlyWhenIncorrect` in `configContext`    | Werkt nog, maar het type is nu `ConfigContext & CorrectionConfig`                                                                              |
| `cache-transform` op `test-navigation`                                                | Bestaat niet meer en deed al niets                                                                                                             |
| Store met de hand herbouwen na het terugzetten van `testContext`                      | `qtiTest.state` en het event `qti-state-changed`                                                                                               |

**De belangrijkste oorzaak:** de player laadt het thema van de bibliotheek niet. Het grip-icoon, de
correctie-badges en de states komen uit dat thema; zonder thema bouwde de frontend ze zelf na.

**Let op, sinds 8.0:** het correctiegedrag (`showCandidateCorrection`,
`test-show-candidate-correction`, de kloon met het juiste antwoord) zit in een apart pakket. Je
importeert nu `@citolab/qti-components/corrections` in plaats van de root. Doe je dat niet, dan werkt
nakijken stil niet, zonder foutmelding.

## CSS-variabelen

De frontend zet zijn eigen `--qti-*`-variabelen (`qti-vars.scss`). Een deel is sinds 8.0 hernoemd
of verdwenen:

- **Hernoemd:** `--qti-form-size` → `--qti-control-size`, `--qti-gap-size` → `--qti-gap`,
  `--qti-drop-min-width` → `--qti-dropzone-min-width`; `--qti-padding-vertical` /
  `--qti-padding-horizontal` → samen `--qti-padding-box`.
- **Verdwenen, zonder vervanging** (nu zonder effect): `--qti-hover-bg`, `--qti-disabled-bg`,
  `--qti-disabled-color`, `--qti-validation-error-bg`, `--qti-validation-text`, `--qti-order-size`,
  `--qti-drop-border-radius`, `--qti-dropzone-padding`.
- **Ongewijzigd:** de kleuren voor correct, fout en half goed (`--qti-correct`, `--qti-incorrect`,
  `--qti-partially-correct` en de `-light`-varianten), `--qti-bg`, `--qti-focus-color`,
  `--qti-border-*`, `--qti-selected-bg`, `--qti-selected-color`.
- **Nieuw en bruikbaar:** het palet `--qti-primary`, `--qti-success`, `--qti-warning`,
  `--qti-error`, `--qti-info`; de icoon-maskers `--qti-check-mask`, `--qti-times-mask`,
  `--qti-partial-mask`, `--qti-grip-mask`; `--qti-select-point-*`; `--test-button-*` voor de
  testknoppen.
- **Vaste waarden die variabelen zouden moeten zijn:** onder meer `#9b77a9` (rand) en `#bddcff7e`
  (focus) in `qti-vars.scss`, `white` op de keuzerondjes, de maten van de order-badges, en de maten
  van de select-point-pin en het extended-text-icoon die in TypeScript als inline style staan.

Variabelen moeten op `test-container` gezet worden (dat doen jullie al): `:root` alleen bereikt de
items in de shadow root niet.

## Patch en migratie-instructie

We hebben de veilige stappen al uitgevoerd op onze kopie, als zes commits (patchbestanden):

1. `@kennisnet/qti-components` wijst via een npm-alias naar `@citolab/qti-components@^9.3.0`.
2. Elementen registreren via de corrections-entry.
3. De config getypeerd als `ConfigContext & CorrectionConfig`; `disableAfterMaxReached`.
4. `cache-transform` weg.
5. De hernoemde states en variabelen in de SCSS.
6. `docs/qti-components-migration.md`: per workaround wat er vervangen kan worden, waar en hoe je
   het controleert. Geschreven voor een ontwikkelaar of een AI-codeeragent.

De QTI-laag typecheckt daarna tegen de nieuwe versie; alleen FontAwesome Pro ontbreekt bij ons.
In de browser hebben we niets kunnen draaien. De vervanging van de workarounds (deel 2 van de
instructie) hebben we bewust niet uitgevoerd: dat verandert de weergave en moet visueel bekeken
worden. Zodra we toegang hebben, maken we er een echte pull request van en draaien we de tests.

## Wat we van jullie nodig hebben

1. **De privépakketten**, op een van deze manieren:
   - een read-only token voor de Artifactory-repositories `bks-npm` en `fontawesome`, plus
     bereikbaarheid (VPN of IP-whitelist); of
   - tarballs (`npm pack`) van de vier `@kennisnet`-pakketten in de versies uit jullie
     `package-lock.json`. Die zetten we lokaal in een vendor-map en verspreiden we niet verder.
2. **FontAwesome Pro**: een token onder jullie licentie, of een manier om lokaal en in CI zonder Pro
   te bouwen (bijvoorbeeld een alias naar gratis iconen of een stub). Met dat laatste kunnen ook
   anderen jullie QTI-laag testen.
3. **Git-toegang** tot de frontend-repository, met de branch waar wij pull requests op mogen
   openen.
4. **De checks die moeten slagen**: welke `ng build`-projecten, welke testcommando's (`ng test` /
   Vitest in de browser, Playwright), en welke Node-versie jullie gebruiken. Wij bouwden met
   Node 26; Angular 21 vraagt Node 20.19, 22.12 of nieuwer.
5. **Voor end-to-end-tests** (later): hoe de Symfony-backend in Docker lokaal draait, of een set
   testpakketten en mocks waarmee de player zonder backend start.

## Twee voorstellen die het makkelijker maken

- **Gebruik `@citolab/qti-components` direct.** `@kennisnet/qti-components` lijkt een herpublicatie
  van ons pakket. Met een npm-alias
  (`"@kennisnet/qti-components": "npm:@citolab/qti-components@^9"`) blijven al jullie imports
  werken, valt één privépakket weg, en kunnen jullie ook onze testbuilds (per pull request)
  installeren.
- **Haal de iconen uit het pad van de QTI-laag.** Als `store.spec.ts` en de QTI-bestanden niet via
  de barrel `public-api.ts` FontAwesome Pro laden, kunnen die specs overal draaien, ook bij ons.

## Wat er bij een upgrade naar 9.x speelt

Naast de typefout hierboven:

- `state` en het event `qti-state-changed` vervangen het heen-en-weer met `testContext`;
  `qti-test-context-updated` blijft tot de volgende major werken.
- `updateItemVariables` vuurt nu betrouwbaar, dus de workaround daarvoor kan weg.
- Het attribuut `cache-transform` bestaat niet meer en doet niets.
- Feedback en `disabled` volgen nu de context van het item; controleer de vergrendeling na het
  inleveren en de modale feedback.
- **Aangekondigd:** publieke events krijgen het voorvoegsel `cito-` (bijvoorbeeld
  `cito-test-navigate`). De huidige namen blijven tot de volgende major werken, naast de nieuwe.

De volledige lijst per wijziging staat in
[plans/host-migration/kennisnet.md](https://github.com/Citolab/qti-components/blob/main/plans/host-migration/kennisnet.md).
