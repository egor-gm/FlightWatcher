import { determinePhase } from '../src/state';

test('determinePhase returns scheduled by default', () => {
  expect(determinePhase('scheduled')).toBe('scheduled');
});

test('determinePhase detects landed', () => {
  expect(determinePhase('Landed')).toBe('landed');
});

test('determinePhase distinguishes enroute and approach by distance', () => {
  expect(determinePhase('en route', 50)).toBe('approach');
  expect(determinePhase('en route', 150)).toBe('enroute');
});