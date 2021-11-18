import {TimeZone} from './timezones'
import {BareDateTime} from './types'
import {fractionalMinutesToSeconds, getTimezoneData, timezoneOffsetSeconds} from './tzOffset'
import {intDiv, intMod} from './mathutils'
import {SECS_PER_DAY} from './consts'
import {bareTimeOfMsFromMidnight} from './baretime'
import {bareDateOfEpochDay} from './baredate'

export function emptyBareDateTime(): BareDateTime {
  return {
    year: 1970,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}

export function bareDateTimeFrom(
  dateOrEpochMs: Date | number,
  zone: TimeZone
): BareDateTime {
  const dateMs =
    dateOrEpochMs instanceof Date ? dateOrEpochMs.getTime() : dateOrEpochMs;
  const offsetSecs = timezoneOffsetSeconds(zone, dateMs);
  let dateSecs = intDiv(dateMs, 1000);
  let dateMsRest = intMod(dateMs, 1000);
  if (dateMsRest < 0) {
    dateMsRest = 1000 - dateMsRest;
  }
  let localSecs = dateSecs + offsetSecs;
  const localEpochDay = intDiv(localSecs, SECS_PER_DAY);
  let secsOfDay = intMod(localSecs, SECS_PER_DAY);
  if (secsOfDay < 0) {
    secsOfDay = SECS_PER_DAY + secsOfDay;
  }
  const dt: BareDateTime = {
    year: 1970,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
  bareDateOfEpochDay(localEpochDay, dt);
  bareTimeOfMsFromMidnight(secsOfDay * 1000 + dateMsRest, dt);
  return dt;
}

const zonesIntervalsMap: Map<TimeZone, number[]> = new Map();

export function offsetSecondsOf(
  localDateTime: BareDateTime,
  zone: TimeZone
): number {
  if (!zonesIntervalsMap.has(zone)) {
    zonesIntervalsMap.set(zone, zoneIntervalsForTimezone(zone));
  }
  const intervals = zonesIntervalsMap.get(zone)!;
  const ldtMsVal = bareDateNonOffsetUtcMs(localDateTime);
  const index = bsLookupOffsetForBareDateTimeMs(intervals, ldtMsVal);
  return fractionalMinutesToSeconds(getTimezoneData(zone).offsets[index]);
}

function zoneIntervalsForTimezone(zone: TimeZone): number[] {
  const tzData = getTimezoneData(zone);
  const intervalsDataPoints: number[] = [Number.MIN_SAFE_INTEGER];
  for (let i = 0; i < tzData.untils.length - 1; i++) {
    const beforeUntilDt = bareDateTimeFrom(tzData.untils[i] - 1, zone);
    const beforeVal = bareDateNonOffsetUtcMs(beforeUntilDt);
    const fromUntilDt = bareDateTimeFrom(tzData.untils[i], zone);
    const fromVal = bareDateNonOffsetUtcMs(fromUntilDt);
    intervalsDataPoints.push(fromVal < beforeVal ? fromVal - 1 : beforeVal);
    intervalsDataPoints.push(fromVal);
  }
  intervalsDataPoints.push(Number.MAX_SAFE_INTEGER);
  return intervalsDataPoints;
}

function bsLookupOffsetForBareDateTimeMs(
  array: Array<number>,
  bareDtVal: number
) {
  for (
    let hi = Math.floor(array.length / 2) - 1, lo = 0, mid = (hi + lo) >> 1;
    hi >= lo;
    mid = (hi + lo) >> 1
  ) {
    const lowVal = array[mid * 2];
    const highVal = array[mid * 2 + 1];
    if (bareDtVal >= lowVal && bareDtVal <= highVal) {
      return mid;
    } else if (bareDtVal < lowVal) {
      hi = mid - 1;
    } else if (bareDtVal > highVal) {
      lo = mid + 1;
    }
  }
  throw new Error('Intended bare date time value not found');
}

export function bareDateNonOffsetUtcMs(dateTime: BareDateTime) {
  return Date.UTC(
    dateTime.year,
    dateTime.month - 1,
    dateTime.day,
    dateTime.hour,
    dateTime.minute,
    dateTime.second,
    dateTime.millisecond
  );
}
