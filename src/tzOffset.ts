import {tzdbPackedData} from './zonesData';
import {unpackZonesData} from './tzDataSerialization'
import {TimeZoneData, UnknownTimezoneError} from './types'
import {TimeZone} from './timezones'
import {roundDown} from './mathutils'

const timezonesOffsets = unpackZonesData(tzdbPackedData);

export function getTimezoneData(ianaTimezone: TimeZone): TimeZoneData {
  const timezoneData = timezonesOffsets.get(ianaTimezone.toUpperCase());
  if (!timezoneData) {
    throw new UnknownTimezoneError(`Timezone ${ianaTimezone} not recognized`)
  }
  return timezoneData;
}

/**
 * Given a timezone and a numbers of milliseconds from the Unix epoch,
 * return the number of minutes the timezone is ahead or behind UTC at that instant,
 * e.g. for Asia x seconds ahead of UTC, America x seconds behind UTC (negative).
 *
 * For timezones that are not recognized, we throw an exception. Calling code may decide to
 * use a default value of 0 instead, but the library prefers signaling incorrect values.
 *
 * @param {string} ianaTimezone
 * @param {number} millisFromEpoch
 * @returns {number}
 */
export function timezoneOffset(ianaTimezone: TimeZone, millisFromEpoch: number): number {
  const timezoneData = getTimezoneData(ianaTimezone);
  if (typeof millisFromEpoch !== 'number' || millisFromEpoch === NaN) {
    throw new TypeError('Expecting a valid number of milliseconds from epoch');
  }
  const index = bsUntilIndex(timezoneData.untils, millisFromEpoch);
  if (index < 0 || index >= timezoneData.offsets.length) {
    throw new Error('Unable to find offset for time stamp');
  }
  return timezoneData.offsets[index];
}

export function timezoneOffsetSeconds(ianaTimezone: TimeZone, millisFromEpoch: number): number {
  return fractionalMinutesToSeconds(timezoneOffset(ianaTimezone, millisFromEpoch));
}

export function fractionalMinutesToSeconds(fractionalMinutes: number): number {
  const intMinutes = roundDown(fractionalMinutes);
  if (intMinutes === fractionalMinutes) {
    return intMinutes * 60;
  }
  return roundDown(60 * intMinutes + Math.round(60 * (fractionalMinutes - intMinutes)));
}

// modified bin-search, to always find existing indices for non-empty arrays
// value in array at index is larger than input value (or last index of array)
function bsUntilIndex(array: Array<number>, value: number) {
  let hi = array.length - 1, lo = -1, mid;
  while (hi - lo > 1) {
    if (array[mid = hi + lo >> 1] <= value) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return hi;
}

const validTimeZones = new Set(Object.values(TimeZone));

export function isValidTimezone(timezone: TimeZone): boolean {
  return validTimeZones.has(timezone);
}
