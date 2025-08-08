import { haversineDistance } from '../src/utils/haversine';

test('haversineDistance returns correct distance in km', () => {
  // Distance between lat/lon (0,0) and (0,1) is roughly 111 km
  const d = haversineDistance(0, 0, 0, 1);
  expect(Math.round(d)).toBe(111);
});