import {
  BareDateTime,
  BareDuration,
  DistanceFnOptions,
  RoundingTimeUnit,
  ZonedDateTime
} from './types';
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
import {bareTimeOfMsFromMidnight, cmpBareTimes} from './baretime';
import {
  bareDateAdd,
  bareDateOfEpochDay,
  bareDateSubtract,
  bareDateWith,
  cmpBareDates,
  cmpMonthDay,
  isoDaysInMonth,
  toEpochDay
} from './baredate';
import {
  bareDuration,
  dayPriority,
  hourPriority,
  includesDateDuration,
  includesTimeDuration,
  minPriority,
  monthPriority,
  msPriority,
  negateBareDuration,
  roundingUnitPriority,
  secsPriority,
  validateBareDuration,
  yearPriority
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

export function cmpZonedDateTimes(
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
  const out = mutateInput
    ? Object.assign(zdt, withValues)
    : Object.assign({}, zdt, withValues);
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

function cmpTimeUnits(left: RoundingTimeUnit, right: RoundingTimeUnit) {
  return roundingUnitPriority(left) - roundingUnitPriority(right);
}

export function zonedDateTimesDistance(
  left: ZonedDateTime,
  right: ZonedDateTime,
  options: DistanceFnOptions = {}
): BareDuration {
  const {
    roundingMode = 'trunc',
    smallestUnit = 'millisecond',
    largestUnit = 'day'
  } = options;
  const smallestUnitPriority = roundingUnitPriority(smallestUnit);
  const largestUnitPriority = roundingUnitPriority(largestUnit);
  if (largestUnitPriority < smallestUnitPriority) {
    throw new RangeError('Largest unit is lower than smallest unit');
  }
  validateZonedDateTime(left);
  validateZonedDateTime(right);
  const sameZoneRight = zonedDateTimeToTimezone(right, left.timezone);
  const cmpLeftRight = cmpZonedDateTimes(left, sameZoneRight);
  if (cmpLeftRight === 0) {
    return bareDuration(0);
  }
  let earlier = cmpLeftRight < 0 ? left : sameZoneRight;
  const later = cmpLeftRight < 0 ? sameZoneRight : left;
  let timeMsDistance = 0,
    fullDays = 0,
    years = 0,
    months = 0,
    days = 0;
  if (largestUnitPriority <= hourPriority) {
    // Time only comparison, let's use epochMilli only
    timeMsDistance = later.epochMilli - earlier.epochMilli;
  } else {
    if (largestUnitPriority >= yearPriority) {
      years = later.year - earlier.year;
      if (cmpMonthDay(earlier, later) > 0 && years > 0) {
        years--;
      }
      earlier =
        years > 0
          ? withZonedDateTime(earlier, {year: earlier.year + years})
          : earlier;
      if (
        smallestUnitPriority === yearPriority &&
        cmpBareDates(earlier, later) < 0 &&
        (roundingMode === 'ceil' ||
          (roundingMode === 'halfExpand' &&
            toEpochDay(later) - toEpochDay(earlier) >= 365 / 2))
      ) {
        years++;
      }
    }
    if (
      largestUnitPriority >= monthPriority &&
      smallestUnitPriority <= monthPriority
    ) {
      months =
        later.year * 12 + later.month - (earlier.year * 12 + earlier.month);
      if (later.day < earlier.day && months > 0) {
        months--;
      }
      earlier =
        months > 0
          ? zonedDateTimeAdd(earlier, bareDuration(1, 0, months))
          : earlier;
      if (
        smallestUnitPriority === monthPriority &&
        cmpBareDates(earlier, later) < 0 &&
        (roundingMode === 'ceil' ||
          (roundingMode === 'halfExpand' &&
            toEpochDay(later) - toEpochDay(earlier) >= 15))
      ) {
        months++;
      }
    }
    fullDays = toEpochDay(later) - toEpochDay(earlier);
    if (cmpBareTimes(earlier, later) > 0) {
      fullDays = Math.max(0, fullDays - 1);
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
        fullDays > 0
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
  }
  let hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0;

  if (smallestUnitPriority >= dayPriority) {
    if (
      timeMsDistance > 0 &&
      (roundingMode === 'ceil' ||
        (roundingMode === 'halfExpand' && timeMsDistance >= MILLIS_PER_DAY / 2))
    ) {
      fullDays++;
    }
  } else {
    if (
      largestUnitPriority >= hourPriority &&
      smallestUnitPriority <= hourPriority
    ) {
      hours = intDiv(timeMsDistance, MILLIS_PER_HOUR);
      timeMsDistance -= hours * MILLIS_PER_HOUR;
      if (
        smallestUnitPriority === hourPriority &&
        timeMsDistance > 0 &&
        (roundingMode === 'ceil' ||
          (roundingMode === 'halfExpand' &&
            timeMsDistance >= MILLIS_PER_HOUR / 2))
      ) {
        hours++;
      }
    }
    if (
      largestUnitPriority >= minPriority &&
      smallestUnitPriority <= minPriority
    ) {
      minutes = intDiv(timeMsDistance, MILLIS_PER_MINUTE);
      timeMsDistance -= minutes * MILLIS_PER_MINUTE;
      if (
        smallestUnitPriority === minPriority &&
        timeMsDistance > 0 &&
        (roundingMode === 'ceil' ||
          (roundingMode === 'halfExpand' &&
            timeMsDistance >= MILLIS_PER_MINUTE / 2))
      ) {
        minutes++;
      }
    }
    if (
      largestUnitPriority >= secsPriority &&
      smallestUnitPriority <= secsPriority
    ) {
      seconds = intDiv(timeMsDistance, MILLIS_PER_SECOND);
      timeMsDistance -= seconds * MILLIS_PER_SECOND;
      if (
        smallestUnitPriority === secsPriority &&
        timeMsDistance > 0 &&
        (roundingMode === 'ceil' ||
          (roundingMode === 'halfExpand' &&
            timeMsDistance >= MILLIS_PER_SECOND / 2))
      ) {
        minutes++;
      }
    }
    if (smallestUnitPriority <= msPriority) {
      milliseconds = Math.round(timeMsDistance);
    }
  }
  if (smallestUnitPriority <= dayPriority) {
    // We do days at the end, because they may have been modified by
    // rounding after dealing with the time part
    days = fullDays;
  }

  return bareDuration(
    cmpLeftRight < 0 ? 1 : -1,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    Math.max(0, milliseconds)
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
