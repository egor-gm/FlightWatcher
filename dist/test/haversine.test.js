"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const haversine_1 = require("../src/utils/haversine");
test('haversineDistance returns correct distance in km', () => {
    // Distance between lat/lon (0,0) and (0,1) is roughly 111 km
    const d = (0, haversine_1.haversineDistance)(0, 0, 0, 1);
    expect(Math.round(d)).toBe(111);
});
