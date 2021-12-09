import {TimeZone} from './timezones';
import {BareDateTime, BareDuration, ZonedDateTime} from './types';
import {getTimezoneData, timezoneOffsetSeconds} from './tzOffset';
import {intDiv, intMod} from './mathutils';
import {
  MILLIS_PER_DAY,
  MILLIS_PER_HOUR,
  MILLIS_PER_MINUTE,
  MILLIS_PER_SECOND,
  SECS_PER_DAY
} from './consts';
import {
  _assignBareTime,
  _millisFromMidnight,
  bareTimeOfMsFromMidnight,
  cmpBareTimes,
  validateBareTime
} from './baretime';
import {
  _assignBareDate,
  bareDateAdd,
  bareDateOfEpochDay,
  bareDateSubtract,
  cmpBareDates,
  isoDaysInMonth,
  toEpochDay,
  validateBareDate
} from './baredate';
import {
  includesDateDuration,
  includesTimeDuration,
  negateBareDuration,
  validateBareDuration
} from './bareduration';

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

export function bareDateTime(
  year = 1970,
  month = 1,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): BareDateTime {
  const dt: BareDateTime = {
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond
  };
  validateBareDateTime(dt);
  return dt;
}

export function bareDateTimeFrom(
  dateOrEpochMs: Date | number,
  zone: TimeZone
): BareDateTime {
  const dateMs =
    (dateOrEpochMs instanceof Date ? dateOrEpochMs.getTime() : dateOrEpochMs) ||
    0;
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
  validateBareDateTime(dt);
  return dt;
}

export function bareDateTimeWith(
  bdt: BareDateTime,
  changes: Partial<BareDateTime>,
  isMutable = false
): BareDateTime {
  const out = isMutable
    ? bdt
    : {
        year: bdt.year,
        month: bdt.month,
        day: bdt.day,
        hour: bdt.hour,
        minute: bdt.minute,
        second: bdt.second,
        millisecond: bdt.millisecond
      };
  _assignBareDateTime(out, changes);
  const maxMonthDays = isoDaysInMonth(out.year, out.month);
  if (maxMonthDays < out.day) {
    out.day = maxMonthDays;
  }
  validateBareDateTime(out);
  return out;
}

export function bareDateTimeAdd(
  dateTime: BareDateTime,
  duration: BareDuration,
  mutateInput = false
): BareDateTime {
  validateBareDuration(duration);
  if (duration.sign === 0) {
    return dateTime;
  }
  if (duration.sign < 0) {
    return bareDateTimeSubtract(
      dateTime,
      negateBareDuration(duration),
      mutateInput
    );
  }
  const out = mutateInput ? dateTime : ({} as BareDateTime);
  if (!mutateInput) {
    _assignBareDateTime(out, dateTime);
  }
  if (includesDateDuration(duration)) {
    bareDateAdd(out, duration, true);
  }
  if (includesTimeDuration(duration)) {
    const totalMs =
      duration.hours * MILLIS_PER_HOUR +
      duration.minutes * MILLIS_PER_MINUTE +
      duration.seconds * MILLIS_PER_SECOND +
      duration.milliseconds;
    const endMs = totalMs + bareDateNonOffsetUtcMs(out);
    _assignBareDateTime(out, bareDateTimeFromUtcMs(endMs));
  }
  validateBareDateTime(out);
  return out;
}

export function bareDateTimeSubtract(
  dateTime: BareDateTime,
  duration: BareDuration,
  mutateInput = false
): BareDateTime {
  validateBareDuration(duration);
  if (duration.sign === 0) {
    return dateTime;
  }
  if (duration.sign < 0) {
    return bareDateTimeAdd(dateTime, negateBareDuration(duration), mutateInput);
  }
  const out = mutateInput ? dateTime : ({} as ZonedDateTime);
  if (!mutateInput) {
    _assignBareDateTime(out, dateTime);
  }
  if (includesDateDuration(duration)) {
    bareDateSubtract(out, duration, true);
  }
  if (includesTimeDuration(duration)) {
    const totalMs =
      duration.hours * MILLIS_PER_HOUR +
      duration.minutes * MILLIS_PER_MINUTE +
      duration.seconds * MILLIS_PER_SECOND +
      duration.milliseconds;
    const endMs = bareDateNonOffsetUtcMs(out) - totalMs;
    _assignBareDateTime(out, bareDateTimeFromUtcMs(endMs));
  }
  validateBareDateTime(out);
  return out;
}

/**
 * For each timezone stores an array that is double the size of the untils
 * array of the tzDatabase.
 *
 * For each until it stores two values: fromIncludedMs and toIncludedMs, the range of
 * DateTimes (in the zone's offset) to which the corresponding offset is applied to.
 *
 * The local datatimes are stored as utc milliseconds - we pretend the datetime is UTC
 * even if it is not, we only need it for mapping deterministically to integers.
 *
 * When a timezone moves the clock forward, there will be a gap between the toIncludesMs
 * of the period before the switch and the toIncludedMs of the following period, representing
 * invalid times in that timezone's calendar.
 *
 * @type {Map<TimeZone, number[]>}
 */
const _zonesIntervalsMap: Map<TimeZone, number[]> = new Map();

function getZoneIntervals(timezone: TimeZone): number[] {
  if (!_zonesIntervalsMap.has(timezone)) {
    _zonesIntervalsMap.set(timezone, zoneIntervalsForTimezone(timezone));
  }
  return _zonesIntervalsMap.get(timezone)!;
}

export function offsetSecondsOf(
  localDateTime: BareDateTime,
  zone: TimeZone
): number {
  const intervals = getZoneIntervals(zone);
  const ldtMsVal = bareDateNonOffsetUtcMs(localDateTime);
  const index = bsLookupOffsetForBareDateTimeMs(intervals, ldtMsVal);
  return getTimezoneData(zone).offsets[index];
}

export function epochMillisecondOf(
  localDateTime: BareDateTime,
  zone: TimeZone
): number {
  const utcOffsetSeconds = offsetSecondsOf(localDateTime, zone);
  return (
    bareDateNonOffsetUtcMs(localDateTime) - utcOffsetSeconds * MILLIS_PER_SECOND
  );
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

/**
 * Given a datetime for the zone passed as parameter, it returns the datetime itself
 * if it's in a valid datetime for the timezone's calendar, or if it is in one of the
 * gaps of the calendar (due to daylight saving or other adjustments) it goes to the
 * earliest valid date time after the datetime value provided.
 *
 * @param {TimeZone} zone
 * @param {BareDateTime} localDateTime
 */
export function nextValidDateTime(
  zone: TimeZone,
  localDateTime: BareDateTime,
  mutateInput = false
) {
  const intervals = getZoneIntervals(zone);
  const originalDtVal = bareDateNonOffsetUtcMs(localDateTime);
  let bareDtVal = originalDtVal;
  for (
    let hi = Math.floor(intervals.length / 2) - 1, lo = 0, mid = (hi + lo) >> 1;
    hi >= lo;
    mid = (hi + lo) >> 1
  ) {
    const lowVal = intervals[mid * 2];
    const highIndex = mid * 2 + 1;
    const highVal = intervals[highIndex];
    if (bareDtVal >= lowVal && bareDtVal <= highVal) {
      break;
    } else if (
      bareDtVal > highVal &&
      highIndex < intervals.length - 1 &&
      bareDtVal < intervals[highIndex + 1]
    ) {
      // The value is in a gap, we change the out value to the next period's from value
      bareDtVal = intervals[highIndex + 1];
      break;
    } else if (bareDtVal < lowVal) {
      hi = mid - 1;
    } else if (bareDtVal > highVal) {
      lo = mid + 1;
    }
  }

  return originalDtVal === bareDtVal
    ? localDateTime
    : bareDateTimeFromUtcMs(bareDtVal, mutateInput ? localDateTime : undefined);
}

function isDateTimeInDaylightSavingGap(
  zone: TimeZone,
  localDateTime: BareDateTime
) {
  const intervals = getZoneIntervals(zone);
  const ldtMsVal = bareDateNonOffsetUtcMs(localDateTime);
  const index = bsLookupOffsetForBareDateTimeMs(intervals, ldtMsVal, false);
  return index === -1;
}

function bsLookupOffsetForBareDateTimeMs(
  array: Array<number>,
  bareDtVal: number,
  throwOnNotFound = true
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
  if (throwOnNotFound) {
    throw new Error('Intended bare date time value not found');
  } else {
    return -1;
  }
}

const yearZeroEpochDay = toEpochDay(bareDateTime(0));
const yearZeroMs = Date.UTC(-1, 11, 31, 23, 59, 59, 999) + 1;

/**
 * Given a datetime, it returns the number of milliseconds since
 * the Unix epoch, by assuming the datetime is on the UTC timezone.
 *
 * @param {BareDateTime} dateTime
 * @returns {number}
 */
export function bareDateNonOffsetUtcMs(dateTime: BareDateTime) {
  return toEpochDay(dateTime) * MILLIS_PER_DAY + _millisFromMidnight(dateTime);
  if (dateTime.year >= 0 && dateTime.year < 100) {
    const nDaysSinceZero = toEpochDay(dateTime) - yearZeroEpochDay;
    return (
      yearZeroMs +
      nDaysSinceZero * MILLIS_PER_DAY +
      dateTime.hour * MILLIS_PER_HOUR +
      dateTime.minute * MILLIS_PER_MINUTE +
      dateTime.second * MILLIS_PER_SECOND +
      dateTime.millisecond
    );
  }
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

export function bareDateTimeFromUtcMs(
  utcMs: number,
  applyTo?: BareDateTime
): BareDateTime {
  const date = new Date(utcMs);
  const out = applyTo ? applyTo : emptyBareDateTime();
  out.year = date.getUTCFullYear();
  out.month = date.getUTCMonth() + 1;
  out.day = date.getUTCDate();
  out.hour = date.getUTCHours();
  out.minute = date.getUTCMinutes();
  out.second = date.getUTCSeconds();
  out.millisecond = date.getUTCMilliseconds();
  return out;
}

export function validateBareDateTime(dateTime: BareDateTime) {
  validateBareDate(dateTime);
  validateBareTime(dateTime);
}

export function _assignBareDateTime(
  copyInto: BareDateTime,
  changes: Partial<BareDateTime>
): BareDateTime {
  _assignBareDate(copyInto, changes);
  _assignBareTime(copyInto, changes);
  return copyInto;
}

/**
 * Compares two bareDateTimes assuming they are of the same
 * timezone, with no day savelight time information attached.
 *
 * @param {BareDateTime} left
 * @param {BareDateTime} right
 * @returns {number}
 */
export function cmpBareDateTimes(
  left: BareDateTime,
  right: BareDateTime
): number {
  return cmpBareDates(left, right) || cmpBareTimes(left, right);
}
