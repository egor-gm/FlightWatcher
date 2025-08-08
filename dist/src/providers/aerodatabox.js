"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlightStatus = getFlightStatus;
const node_fetch_1 = __importDefault(require("node-fetch"));
const API_KEY = process.env.AERODATABOX_API_KEY || '';
/**
 * Fetch a flight status from AeroDataBox. The API returns an array of matches
 * which may include codeshares; we simply return the first result. You must
 * supply a RapidAPI key via the AERODATABOX_API_KEY env variable.
 *
 * @param flight Flight number (IATA or ICAO)
 * @param date   Date in YYYY-MM-DD format
 */
async function getFlightStatus(flight, date) {
    if (!API_KEY)
        return null;
    const url = `https://aerodatabox.p.rapidapi.com/flights/${encodeURIComponent(flight)}/${encodeURIComponent(date)}`;
    const res = await (0, node_fetch_1.default)(url, {
        headers: {
            'X-RapidAPI-Key': API_KEY,
        },
    });
    if (!res.ok)
        return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0)
        return null;
    return data[0];
}
