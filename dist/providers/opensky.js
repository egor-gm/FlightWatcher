"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenSkyState = getOpenSkyState;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Fetch a live state vector for a given ICAO24 or callsign. OpenSky's API
 * supports queries by ICAO24 only, so we use the flight's ICAO24 if known,
 * otherwise we fall back to callsign which may be less precise.
 *
 * @param icao24  The ICAO24 hex code of the aircraft (lowercase)
 * @param callsign Optional flight callsign (unused currently)
 */
async function getOpenSkyState(icao24, callsign) {
    // OpenSky does not allow CORS; this request must be made server-side.
    const url = `https://opensky-network.org/api/states/all?icao24=${icao24}`;
    const res = await (0, node_fetch_1.default)(url);
    if (!res.ok)
        return null;
    const data = await res.json();
    const states = data.states;
    if (!states || !states.length)
        return null;
    const state = states[0];
    return {
        icao24: state[0],
        callsign: state[1] ? state[1].trim() : null,
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
