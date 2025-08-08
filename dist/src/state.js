"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determinePhase = determinePhase;
/**
 * Determine a phase based on a status string and optional live data. This is a
 * very naive implementation but works for simple cases.
 *
 * @param status Flight status text
 * @param distanceKm Distance to destination in kilometres (optional)
 * @param onGround Whether the aircraft is on the ground (optional)
 */
function determinePhase(status, distanceKm, onGround) {
    const st = status.toLowerCase();
    if (st.includes('cancel'))
        return 'canceled';
    if (st.includes('divert'))
        return 'diverted';
    if (st.includes('delay'))
        return 'delayed';
    if (st.includes('land'))
        return 'landed';
    if (st.includes('approach'))
        return 'approach';
    if (st.includes('depart'))
        return 'departed';
    if (st.includes('airborne') || st.includes('en route')) {
        if (distanceKm != null) {
            return distanceKm < 100 ? 'approach' : 'enroute';
        }
        return 'enroute';
    }
    return 'scheduled';
}
