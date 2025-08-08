import fetch from 'node-fetch';

/**
 * Simple definition of the flight status returned by AeroDataBox.
 * See https://rapidapi.com/aedbx-aerodatabox/api/aerodatabox for more.
 */
export interface FlightStatus {
  status: string;
  departure: {
    scheduledTimeUtc: string;
    estimatedTimeUtc?: string;
  };
  arrival: {
    scheduledTimeUtc: string;
    estimatedTimeUtc?: string;
  };
}

const API_KEY = process.env.AERODATABOX_API_KEY || '';

/**
 * Fetch a flight status from AeroDataBox. The API returns an array of matches
 * which may include codeshares; we simply return the first result. You must
 * supply a RapidAPI key via the AERODATABOX_API_KEY env variable.
 *
 * @param flight Flight number (IATA or ICAO)
 * @param date   Date in YYYY-MM-DD format
 */
export async function getFlightStatus(flight: string, date: string): Promise<FlightStatus | null> {
  if (!API_KEY) return null;
  const url = `https://aerodatabox.p.rapidapi.com/flights/${encodeURIComponent(flight)}/${encodeURIComponent(date)}`;
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0] as FlightStatus;
}