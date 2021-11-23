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
  bareDateNonOffsetUtcMs, emptyBareDateTime, epochMillisecondOf,
  nextValidDateTime,
  offsetSecondsOf,
  validateBareDateTime
} from './baredatetime'
import {bareTimeOfMsFromMidnight, validateBareTime} from './baretime';
import {
  bareDate,
  bareDateAdd,
  bareDateOfEpochDay, bareDateSubtract,
  isoDaysInMonth
} from './baredate'
import {
  includesDateDuration,
  includesTimeDuration,
  validateBareDuration,negateBareDuration
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

export function zonedDateTimeOf(
  dateOrEpochMs: Date | number,
  zone: TimeZone,
  applyTo? : ZonedDateTime
): ZonedDateTime {
  const dateMs =
    dateOrEpochMs instanceof Date ? dateOrEpochMs.getTime() : dateOrEpochMs;
  const offsetSecs = timezoneOffsetSeconds(zone, dateMs);
  const dateSecs = intDiv(dateMs, 1000);
  const dateMsRest = intMod(dateMs, 1000);
  const localSecs = dateSecs + offsetSecs;
  const localEpochDay = Math.floor(localSecs / SECS_PER_DAY);
  const secsOfDay = localSecs - localEpochDay * SECS_PER_DAY;
  const zdt: ZonedDateTime = applyTo ? applyTo : {
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
  _updateOffsetAndEpochMilli(out);
  validateZonedDateTime(out);
  return out;
}

function _updateOffsetAndEpochMilli(zdt: ZonedDateTime) {
  zdt.utcOffsetSeconds = offsetSecondsOf(zdt, zdt.timezone);
  zdt.epochMilli = bareDateNonOffsetUtcMs(zdt) - zdt.utcOffsetSeconds * MILLIS_PER_SECOND;
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
    return zonedDateTimeSubtract(zdt, negateBareDuration(duration), mutateInput)
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

export function zonedDateTimeSubtract(zdt: ZonedDateTime,
                                     duration: BareDuration,
                                     mutateInput = false
): ZonedDateTime {
  validateBareDuration(duration);
  if (duration.sign === 0) {
    return zdt;
  }
  if (duration.sign < 0) {
    return zonedDateTimeAdd(zdt, negateBareDuration(duration), mutateInput)
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
