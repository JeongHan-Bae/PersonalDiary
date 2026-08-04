import {
  createPersonalDataCrudUseCases,
  type PersonalDataCrudUseCases,
} from '@/application/personalDataCrudUseCases';
import {
  createPersonalDataFileUseCases,
  type PersonalDataFileUseCases,
} from '@/application/personalDataFileUseCases';
import type { PersonalDataRepository } from '@/ports/personalDataRepository';
import type { IdAndClockPort } from '@/ports/idAndClockPort';

export type PersonalDataUseCases = PersonalDataCrudUseCases &
  PersonalDataFileUseCases;

export const createPersonalDataUseCases = (
  persistence: PersonalDataRepository,
  idAndClock: IdAndClockPort,
): PersonalDataUseCases => ({
  ...createPersonalDataCrudUseCases(persistence, idAndClock),
  ...createPersonalDataFileUseCases(persistence, idAndClock),
});
