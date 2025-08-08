"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("../src/state");
test('determinePhase returns scheduled by default', () => {
    expect((0, state_1.determinePhase)('scheduled')).toBe('scheduled');
});
test('determinePhase detects landed', () => {
    expect((0, state_1.determinePhase)('Landed')).toBe('landed');
});
test('determinePhase distinguishes enroute and approach by distance', () => {
    expect((0, state_1.determinePhase)('en route', 50)).toBe('approach');
    expect((0, state_1.determinePhase)('en route', 150)).toBe('enroute');
});
