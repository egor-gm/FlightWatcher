import fetch from 'node-fetch';

/**
 * OpenSky state vector as returned by the /states/all API. Only the fields
 * we care about are included here. For details see OpenSky docs.
 */
export interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

/**
 * Fetch a live state vector for a given ICAO24 or callsign. OpenSky's API
 * supports queries by ICAO24 only, so we use the flight's ICAO24 if known,
 * otherwise we fall back to callsign which may be less precise.
 *
 * @param icao24  The ICAO24 hex code of the aircraft (lowercase)
 * @param callsign Optional flight callsign (unused currently)
 */
export async function getOpenSkyState(icao24: string, callsign?: string): Promise<OpenSkyState | null> {
  // OpenSky does not allow CORS; this request must be made server-side.
  const url = `https://opensky-network.org/api/states/all?icao24=${icao24}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data: any = await res.json();
  const states = data.states as any[];
  if (!states || !states.length) return null;
  const state = states[0];
  return {
    icao24: state[0],
    callsign: state[1] ? (state[1] as string).trim() : null,
    origin_country: state[2],
    time_position: state[3],
    last_contact: state[4],
    longitude: state[5],
    latitude: state[6],
    baro_altitude: state[7],
    on_ground: state[8],
    velocity: state[9],
    true_track: state[10],
    vertical_rate: state[11],
    sensors: state[12],
    geo_altitude: state[13],
    squawk: state[14],
    spi: state[15],
    position_source: state[16],
  };
}