/**
 * Flight phase enumeration used by the worker to send idempotent alerts.
 */
export type Phase =
  | 'scheduled'
  | 'departed'
  | 'airborne'
  | 'enroute'
  | 'approach'
  | 'landed'
  | 'diverted'
  | 'delayed'
  | 'canceled';

/**
 * Determine a phase based on a status string and optional live data. This is a
 * very naive implementation but works for simple cases.
 *
 * @param status Flight status text
 * @param distanceKm Distance to destination in kilometres (optional)
 * @param onGround Whether the aircraft is on the ground (optional)
 */
export function determinePhase(
  status: string,
  distanceKm?: number,
  onGround?: boolean,
): Phase {
  const st = status.toLowerCase();
  if (st.includes('cancel')) return 'canceled';
  if (st.includes('divert')) return 'diverted';
  if (st.includes('delay')) return 'delayed';
  if (st.includes('land')) return 'landed';
  if (st.includes('approach')) return 'approach';
  if (st.includes('depart')) return 'departed';
  if (st.includes('airborne') || st.includes('en route')) {
    if (distanceKm != null) {
      return distanceKm < 100 ? 'approach' : 'enroute';
    }
    return 'enroute';
  }
  return 'scheduled';
}