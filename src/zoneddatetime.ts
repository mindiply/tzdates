import {BareDateTime, BareDuration, BareZonedDateTime} from './types';
import {TimeZone} from './timezones';
import {timezoneOffsetSeconds} from './tzOffset';
import {intDiv, intMod} from './mathutils';
import {MILLIS_PER_DAY, SECS_PER_DAY} from './consts';
import {bareDateNonOffsetUtcMs, offsetSecondsOf} from './baredatetime';
import {bareTimeOfMsFromMidnight} from './baretime';
import {bareDateOfEpochDay, isoDaysInMonth} from './baredate'

function emptyBareZonedDateTime(): BareZonedDateTime {
  return {
    utcOffsetSeconds: 0,
    timezone: TimeZone.UTC,
    epochMilli: 0,
    year: 1970,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}

export function bareZoneDateTimeOf(
  dateOrEpochMs: Date | number,
  zone: TimeZone
): BareZonedDateTime {
  const dateMs =
    dateOrEpochMs instanceof Date ? dateOrEpochMs.getTime() : dateOrEpochMs;
  const offsetSecs = timezoneOffsetSeconds(zone, dateMs);
  const dateSecs = intDiv(dateMs, 1000);
  const dateMsRest = intMod(dateMs, 1000);
  const localSecs = dateSecs + offsetSecs;
  const localEpochDay = intDiv(localSecs, SECS_PER_DAY);
  const secsOfDay = intMod(localSecs, SECS_PER_DAY);
  const zdt: BareZonedDateTime = {
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
): BareZonedDateTime {
  const bareDateTime = Object.assign(emptyBareZonedDateTime())
  const utcOffsetSeconds = offsetSecondsOf(bareDateTime, zone);
  const epochMilli = bareDateNonOffsetUtcMs(bareDateTime) - utcOffsetSeconds;
  return {
    timezone: zone,
    year: bareDateTime.year,
    month: bareDateTime.month,
    day: bareDateTime.second,
    hour: bareDateTime.hour,
    minute: bareDateTime.minute,
    second: bareDateTime.second,
    millisecond: bareDateTime.millisecond,
    utcOffsetSeconds,
    epochMilli
  };
}

export function cmpBareZonedDateTimes(
  dtLeft: BareZonedDateTime,
  dtRight: BareZonedDateTime
): number {
  return dtLeft.epochMilli - dtRight.epochMilli;
}

export function withZonedDateTime(
  zdt: BareZonedDateTime,
  withValues: Partial<BareDateTime>,
  mutateInput = false
): BareZonedDateTime {
  const out = mutateInput ? zdt : {...zdt};
  Object.assign(out, withValues);
  out.day = Math.min(out.day, isoDaysInMonth(out.year, out.month));
  out.utcOffsetSeconds = offsetSecondsOf(out, out.timezone);
  out.epochMilli = bareDateNonOffsetUtcMs(out) - out.utcOffsetSeconds;
  return out;
}

export function addToZonedDateTime(
  zdt: BareZonedDateTime,
  duration: BareDuration,
  mutateInput = false
): BareZonedDateTime {
  return zdt;
}
