import {BareDateTime, BareDuration, ZonedDateTime} from './types';
import {TimeZone} from './timezones';
import {isValidTimezone, timezoneOffsetSeconds} from './tzOffset';
import {intDiv, intMod} from './mathutils';
import {
  MAX_UTC_NEG_OFFSET_SECONDS,
  MAX_UTC_POS_OFFSET_SECONDS,
  MILLIS_PER_DAY,
  MILLIS_PER_HOUR,
  MILLIS_PER_MINUTE,
  MILLIS_PER_SECOND,
  SECS_PER_DAY
} from './consts';
import {
  bareDateNonOffsetUtcMs,
  bareDateTimeWith,
  emptyBareDateTime,
  epochMillisecondOf,
  nextValidDateTime,
  offsetSecondsOf,
  validateBareDateTime
} from './baredatetime';
import {
  bareTimeOfMsFromMidnight,
  cmpBareTimes,
  validateBareTime
} from './baretime';
import {
  bareDate,
  bareDateAdd,
  bareDateOfEpochDay,
  bareDateSubtract,
  isoDaysInMonth,
  toEpochDay
} from './baredate';
import {
  includesDateDuration,
  includesTimeDuration,
  validateBareDuration,
  negateBareDuration,
  bareDuration
} from './bareduration';

function emptyBareZonedDateTime(): ZonedDateTime {
  return {
    utcOffsetSeconds: 1970,
    timezone: TimeZone.UTC,
    epochMilli: 0,
    year: 0,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}

export function cloneZonedDateTime(zdt: ZonedDateTime): ZonedDateTime {
  validateZonedDateTime(zdt);
  return {
    year: zdt.year,
    month: zdt.month,
    day: zdt.day,
    hour: zdt.hour,
    minute: zdt.minute,
    second: zdt.second,
    millisecond: zdt.millisecond,
    utcOffsetSeconds: zdt.utcOffsetSeconds,
    timezone: zdt.timezone,
    epochMilli: zdt.epochMilli
  };
}

export function zonedDateTimeOf(
  dateOrEpochMs: Date | number,
  zone: TimeZone,
  applyTo?: ZonedDateTime
): ZonedDateTime {
  const dateMs =
    dateOrEpochMs instanceof Date ? dateOrEpochMs.getTime() : dateOrEpochMs;
  const offsetSecs = timezoneOffsetSeconds(zone, dateMs);
  const dateSecs = intDiv(dateMs, 1000);
  const dateMsRest = intMod(dateMs, 1000);
  const localSecs = dateSecs + offsetSecs;
  const localEpochDay = Math.floor(localSecs / SECS_PER_DAY);
  const secsOfDay = localSecs - localEpochDay * SECS_PER_DAY;
  const zdt: ZonedDateTime = applyTo
    ? applyTo
    : {
        utcOffsetSeconds: offsetSecs,
        timezone: zone,
        epochMilli: dateMs,
        year: 0,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      };
  zdt.utcOffsetSeconds = offsetSecs;
  zdt.epochMilli = dateMs;
  zdt.timezone = zone;
  bareDateOfEpochDay(localEpochDay, zdt);
  bareTimeOfMsFromMidnight(
    (secsOfDay + dateMsRest < 0 ? MILLIS_PER_DAY : 0) +
      secsOfDay * 1000 +
      dateMsRest,
    zdt
  );
  return zdt;
}

export function fromBareDateTime(
  bareDateTimeLike: Partial<BareDateTime>,
  zone: TimeZone
): ZonedDateTime {
  const bareDateTime = Object.assign(emptyBareDateTime(), bareDateTimeLike);
  const out: ZonedDateTime = {
    timezone: zone,
    year: bareDateTime.year,
    month: bareDateTime.month,
    day: bareDateTime.day,
    hour: bareDateTime.hour,
    minute: bareDateTime.minute,
    second: bareDateTime.second,
    millisecond: bareDateTime.millisecond,
    utcOffsetSeconds: 0,
    epochMilli: 0
  };
  _updateOffsetAndEpochMilli(out);
  return out;
}

export function cmpBareZonedDateTimes(
  dtLeft: ZonedDateTime,
  dtRight: ZonedDateTime
): number {
  return dtLeft.epochMilli - dtRight.epochMilli;
}

export function withZonedDateTime(
  zdt: ZonedDateTime,
  withValues: Partial<BareDateTime>,
  mutateInput = false
): ZonedDateTime {
  const out = mutateInput ? zdt : {...zdt};
  Object.assign(out, withValues);
  out.day = Math.min(out.day, isoDaysInMonth(out.year, out.month));
  nextValidDateTime(out.timezone, out, true);
  _updateOffsetAndEpochMilli(out);
  validateZonedDateTime(out);
  return out;
}

function _updateOffsetAndEpochMilli(zdt: ZonedDateTime) {
  zdt.utcOffsetSeconds = offsetSecondsOf(zdt, zdt.timezone);
  zdt.epochMilli =
    bareDateNonOffsetUtcMs(zdt) - zdt.utcOffsetSeconds * MILLIS_PER_SECOND;
}

export function zonedDateTimeAdd(
  zdt: ZonedDateTime,
  duration: BareDuration,
  mutateInput = false
): ZonedDateTime {
  validateBareDuration(duration);
  if (duration.sign === 0) {
    return zdt;
  }
  if (duration.sign < 0) {
    return zonedDateTimeSubtract(
      zdt,
      negateBareDuration(duration),
      mutateInput
    );
  }
  validateZonedDateTime(zdt);
  const out = mutateInput ? zdt : Object.assign({}, zdt);
  if (includesDateDuration(duration)) {
    bareDateAdd(out, duration, true);
    nextValidDateTime(zdt.timezone, out, true);
    _updateOffsetAndEpochMilli(out);
  }
  if (includesTimeDuration(duration)) {
    const totalMs =
      duration.hours * MILLIS_PER_HOUR +
      duration.minutes * MILLIS_PER_MINUTE +
      duration.seconds * MILLIS_PER_SECOND +
      duration.milliseconds;
    const endMs = totalMs + zdt.epochMilli;
    zonedDateTimeOf(endMs, zdt.timezone, out);
  }
  validateZonedDateTime(out);
  return out;
}

export function zonedDateTimeSubtract(
  zdt: ZonedDateTime,
  duration: BareDuration,
  mutateInput = false
): ZonedDateTime {
  validateBareDuration(duration);
  if (duration.sign === 0) {
    return zdt;
  }
  if (duration.sign < 0) {
    return zonedDateTimeAdd(zdt, negateBareDuration(duration), mutateInput);
  }
  validateZonedDateTime(zdt);
  const out = mutateInput ? zdt : Object.assign({}, zdt);
  if (includesDateDuration(duration)) {
    bareDateSubtract(out, duration, true);
    nextValidDateTime(zdt.timezone, out, true);
    _updateOffsetAndEpochMilli(out);
  }
  if (includesTimeDuration(duration)) {
    const totalMs =
      duration.hours * MILLIS_PER_HOUR +
      duration.minutes * MILLIS_PER_MINUTE +
      duration.seconds * MILLIS_PER_SECOND +
      duration.milliseconds;
    const endMs = epochMillisecondOf(out, zdt.timezone) - totalMs;
    zonedDateTimeOf(endMs, zdt.timezone, out);
  }
  validateZonedDateTime(out);
  return out;
}

export function validateZonedDateTime(zdt: ZonedDateTime) {
  validateBareDateTime(zdt);
  if (!isValidTimezone(zdt.timezone)) {
    throw new TypeError('Timezone not recognized');
  }
  if (
    zdt.utcOffsetSeconds < MAX_UTC_NEG_OFFSET_SECONDS ||
    zdt.utcOffsetSeconds > MAX_UTC_POS_OFFSET_SECONDS
  ) {
    throw new RangeError('Invalid offset seconds from UTC');
  }
  if (typeof zdt.epochMilli !== 'number' || Number.isNaN(zdt.epochMilli)) {
    throw new TypeError('Incorrect ms from epoch field');
  }
}

export function zonedDateTimesDistance(
  left: ZonedDateTime,
  right: ZonedDateTime
): BareDuration {
  validateZonedDateTime(left);
  validateZonedDateTime(right);
  const sameZoneRight = zonedDateTimeToTimezone(right, left.timezone);
  const cmpLeftRight = cmpBareZonedDateTimes(left, sameZoneRight);
  if (cmpLeftRight === 0) {
    return bareDuration(0);
  }
  const earlier = cmpLeftRight < 0 ? left : sameZoneRight;
  let timeMsDistance = 0;
  const later = cmpLeftRight < 0 ? sameZoneRight : left;
  let fullDaysDistance = toEpochDay(later) - toEpochDay(earlier);
  if (cmpBareTimes(earlier, later) > 0) {
    fullDaysDistance = Math.max(0, fullDaysDistance - 1);
    const dayAfterFirstMidnight = withZonedDateTime(
      zonedDateTimeAdd(earlier, bareDuration(1, 0, 0, 1)),
      {hour: 0, minute: 0, second: 0, millisecond: 0},
      true
    );
    timeMsDistance += dayAfterFirstMidnight.epochMilli - earlier.epochMilli;
    const lastDayMidnight = withZonedDateTime(later, {
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    });
    timeMsDistance += later.epochMilli - lastDayMidnight.epochMilli;
  } else {
    const lastDaySameStartDayTime =
      fullDaysDistance > 0
        ? fromBareDateTime(
            nextValidDateTime(
              later.timezone,
              bareDateTimeWith(later, {
                hour: earlier.hour,
                minute: earlier.minute,
                second: earlier.second,
                millisecond: earlier.millisecond
              }),
              true
            ),
            later.timezone
          )
        : earlier;
    timeMsDistance += later.epochMilli - lastDaySameStartDayTime.epochMilli;
  }
  const hours = intDiv(timeMsDistance, MILLIS_PER_HOUR);
  timeMsDistance -= hours * MILLIS_PER_HOUR;
  const minutes = intDiv(timeMsDistance, MILLIS_PER_MINUTE);
  timeMsDistance -= minutes * MILLIS_PER_MINUTE;
  const seconds = intDiv(timeMsDistance, MILLIS_PER_SECOND);
  timeMsDistance -= seconds * MILLIS_PER_SECOND;
  return bareDuration(
    cmpLeftRight < 0 ? 1 : -1,
    0,
    0,
    fullDaysDistance,
    hours,
    minutes,
    seconds,
    Math.min(999, Math.max(0, Math.round(timeMsDistance)))
  );
}

/**
 * Returns the instant represented by the zoned date time passed in input,
 * as a zoned date time with the desired timezone.
 *
 * If the original zoned date time is already in the desired timezone, it returns
 * it as is.
 *
 * @param {ZonedDateTime} zdt
 * @param {TimeZone} timezone
 * @returns {ZonedDateTime}
 */
export function zonedDateTimeToTimezone(
  zdt: ZonedDateTime,
  timezone: TimeZone
): ZonedDateTime {
  if (zdt.timezone === timezone) {
    return zdt;
  }
  return zonedDateTimeOf(zdt.epochMilli, timezone);
}
