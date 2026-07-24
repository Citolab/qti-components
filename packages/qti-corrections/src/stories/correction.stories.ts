import {
  Combineervraag as CombineervraagShared,
  Dropdownvraag as DropdownvraagShared,
  Gatentekst as GatentekstShared,
  Hotspotvraag as HotspotvraagShared,
  Matrixvraag as MatrixvraagShared,
  MeerkeuzevraagEenAntwoord as MeerkeuzevraagEenAntwoordShared,
  MeerkeuzevraagMeerdereAntwoorden as MeerkeuzevraagMeerdereAntwoordenShared,
  OpenTekstvraag as OpenTekstvraagShared,
  PuntSelecteren as PuntSelecterenShared,
  Schuifbalk as SchuifbalkShared,
  SleepvraagAfbeeldingenKoppelen as SleepvraagAfbeeldingenKoppelenShared,
  SleepvraagMeerdereAntwoordenPerCategorie as SleepvraagMeerdereAntwoordenPerCategorieShared,
  SleepvraagOptiesBoven as SleepvraagOptiesBovenShared,
  SleepvraagOptiesRechts as SleepvraagOptiesRechtsShared,
  TekstvraagExacteMatch as TekstvraagExacteMatchShared,
  TekstvraagHoofdletterongevoelig as TekstvraagHoofdletterongevoeligShared,
  VerbindDePunten as VerbindDePuntenShared,
  VolgordeOpAfbeelding as VolgordeOpAfbeeldingShared,
  VolgordevraagHorizontaal as VolgordevraagHorizontaalShared,
  VolgordevraagVerticaal as VolgordevraagVerticaalShared,
  WoordenSelecteren as WoordenSelecterenShared,
  WoordenSelecterenNietHerkenbaar as WoordenSelecterenNietHerkenbaarShared,
  kennisnetMetaBase
} from '../../../../apps/e2e/src/stories/kennisnet-all-items.shared';
import { withCorrectionRegistry } from './with-correction-registry.decorator';

import type { Meta } from '@storybook/web-components-vite';

const inheritedDecorators = kennisnetMetaBase.decorators
  ? Array.isArray(kennisnetMetaBase.decorators)
    ? kennisnetMetaBase.decorators
    : [kennisnetMetaBase.decorators]
  : [];

const meta: Meta = {
  title: 'qti-corrections/Kennisnet All Items',
  ...kennisnetMetaBase,
  tags: ['autodocs', 'vrt'],
  decorators: [...inheritedDecorators, withCorrectionRegistry]
};

export default meta;

export const MeerkeuzevraagEenAntwoord = { ...MeerkeuzevraagEenAntwoordShared };
export const MeerkeuzevraagMeerdereAntwoorden = { ...MeerkeuzevraagMeerdereAntwoordenShared };
export const TekstvraagHoofdletterongevoelig = { ...TekstvraagHoofdletterongevoeligShared };
export const TekstvraagExacteMatch = { ...TekstvraagExacteMatchShared };
export const OpenTekstvraag = { ...OpenTekstvraagShared };
export const Dropdownvraag = { ...DropdownvraagShared };
export const SleepvraagOptiesBoven = { ...SleepvraagOptiesBovenShared };
export const SleepvraagOptiesRechts = { ...SleepvraagOptiesRechtsShared };
export const SleepvraagMeerdereAntwoordenPerCategorie = { ...SleepvraagMeerdereAntwoordenPerCategorieShared };
export const SleepvraagAfbeeldingenKoppelen = { ...SleepvraagAfbeeldingenKoppelenShared };
export const Matrixvraag = { ...MatrixvraagShared };
export const WoordenSelecteren = { ...WoordenSelecterenShared };
export const WoordenSelecterenNietHerkenbaar = { ...WoordenSelecterenNietHerkenbaarShared };
export const VolgordevraagHorizontaal = { ...VolgordevraagHorizontaalShared };
export const VolgordevraagVerticaal = { ...VolgordevraagVerticaalShared };
export const Gatentekst = { ...GatentekstShared };
export const PuntSelecteren = { ...PuntSelecterenShared };
export const Combineervraag = { ...CombineervraagShared };
export const Hotspotvraag = { ...HotspotvraagShared };
export const VolgordeOpAfbeelding = { ...VolgordeOpAfbeeldingShared };
export const VerbindDePunten = { ...VerbindDePuntenShared };
export const Schuifbalk = { ...SchuifbalkShared };
