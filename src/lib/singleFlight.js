/**
 * Single-Flight / Request Coalescing (Cache Stampede / Thundering Herd Defense)
 * Guarantees that concurrent cache-miss requests for the exact same key wait for 
 * a single ongoing fetch operation instead of executing parallel disk/DB queries.
 */

const inFlightPromises = new Map();

export async function singleFlight(key, fetchFn) {
  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key);
  }

  const promise = (async () => {
    try {
      return await fetchFn();
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, promise);
  return promise;
}

export function getInFlightCount() {
  return inFlightPromises.size;
}
