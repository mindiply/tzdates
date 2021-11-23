import {
  DurationSign,
  BareDuration,
  BareTimeDuration,
  BareDateDuration,
  BareSignedDuration
} from './types';
import {MILLIS_PER_HOUR, MILLIS_PER_MINUTE, MILLIS_PER_SECOND} from './consts';

export function weeksBareDuration(
  sign: DurationSign,
  weeks: number
): BareDuration {
  const out: BareDuration = {
    sign,
    years: 0,
    months: 0,
    weeks: Math.round(weeks),
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  };
  validateBareDuration(out);
  return out;
}

export function validateBareTimeDuration(duration: BareTimeDuration) {
  if (
    duration.hours < 0 ||
    duration.minutes < 0 ||
    duration.seconds < 0 ||
    duration.milliseconds < 0
  ) {
    throw new TypeError('All duration components should be positive');
  }
}

/**
 * Checks if the duration has a non-zero time-only duration - e.g.
 * with hours the highest unit being more than zero.
 *
 * It returns false also if the duration is zero.
 *
 * @param {BareDuration} duration
 * @returns {Boolean}
 */
export function isTimeOnlyDuration(duration: BareDuration): Boolean {
  if (duration.sign === 0) return false;
  if (
    duration.years > 0 ||
    duration.months > 0 ||
    duration.weeks > 0 ||
    duration.days > 0
  ) {
    return false;
  }
  return includesTimeDuration(duration);
}

export function includesTimeDuration(duration: BareDuration): Boolean {
  return (
    duration.sign !== 0 &&
    (duration.hours > 0 ||
      duration.minutes > 0 ||
      duration.seconds > 0 ||
      duration.milliseconds > 0)
  );
}

/**
 * Checks if the duration has a non-zero date-only duration - e.g.
 * with days the lowest unit being more than zero.
 *
 * It returns false also if the duration is zero.
 *
 * @param {BareDuration} duration
 * @returns {Boolean}
 */
export function isDateOnlyDuration(duration: BareDuration): Boolean {
  if (duration.sign === 0) return false;
  if (
    duration.hours > 0 ||
    duration.minutes > 0 ||
    duration.seconds > 0 ||
    duration.milliseconds > 0
  ) {
    return false;
  }
  return includesDateDuration(duration);
}

export function includesDateDuration(duration: BareDuration): Boolean {
  return duration.sign !== 0 && (
    duration.years > 0 ||
    duration.months > 0 ||
    duration.weeks > 0 ||
    duration.days > 0
  );
}

export function validateBareDateDuration(duration: BareDateDuration) {
  if (
    duration.years < 0 ||
    duration.months < 0 ||
    duration.days < 0 ||
    duration.weeks < 0
  ) {
    throw new TypeError('All duration components should be positive');
  }
  if (
    duration.weeks > 0 &&
    (duration.years > 0 || duration.months > 0 || duration.days > 0)
  ) {
    throw new TypeError('Weeks durations cannot be mixed with other parts');
  }
}

export function validateBareDuration(duration: BareDuration) {
  if (
    duration.years < 0 ||
    duration.months < 0 ||
    duration.days < 0 ||
    duration.weeks < 0 ||
    duration.hours < 0 ||
    duration.minutes < 0 ||
    duration.seconds < 0 ||
    duration.milliseconds < 0
  ) {
    throw new TypeError('All duration components should be positive');
  }
  if (
    duration.weeks > 0 &&
    (duration.years > 0 ||
      duration.months > 0 ||
      duration.days > 0 ||
      duration.hours > 0 ||
      duration.minutes > 0 ||
      duration.seconds > 0 ||
      duration.milliseconds > 0)
  ) {
    throw new TypeError('Weeks durations cannot be mixed with other parts');
  }
}

export function bareDuration(
  sign: DurationSign,
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
) {
  const out: BareDuration = {
    sign,
    years: Math.round(years),
    months: Math.round(months),
    weeks: 0,
    days: Math.round(days),
    hours: Math.round(hours),
    minutes: Math.round(minutes),
    seconds: Math.round(seconds),
    milliseconds: Math.round(milliseconds)
  };
  validateBareDuration(out);
  return out;
}

export function fromDuration(duration: BareDuration): BareDuration {
  return {...duration};
}

function isNonWeeksDuration(duration: BareDuration): boolean {
  return duration.weeks === 0;
}

function isWeeksDuration(duration: BareDuration): boolean {
  return (
    duration.weeks > 0 &&
    duration.years === 0 &&
    duration.months === 0 &&
    duration.days === 0 &&
    duration.hours === 0 &&
    duration.minutes === 0 &&
    duration.seconds === 0 &&
    duration.milliseconds === 0
  );
}

export function timeDurationMillis(duration: BareTimeDuration) {
  return (
    duration.milliseconds +
    duration.seconds * MILLIS_PER_SECOND +
    duration.minutes * MILLIS_PER_MINUTE +
    duration.hours * MILLIS_PER_HOUR
  );
}

export function absBareDuration(duration: BareDuration): BareDuration {
  return duration.sign >= 0 ? duration : {...duration, sign: 1};
}

export function negateBareDuration<T extends BareSignedDuration>(
  duration: T
): T {
  return duration.sign === 0
    ? duration
    : {
        ...duration,
        sign: duration.sign === 1 ? -1 : 1
      };
}

export function cmpBareDurations(left: BareDuration, right: BareDuration) {
  const l = isWeeksDuration(left)
    ? {
        sign: left.sign,
        years: 0,
        months: 0,
        days: 7 * left.weeks,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      }
    : left;
  const r = isWeeksDuration(right)
    ? {
        sign: right.sign,
        years: 0,
        months: 0,
        days: 7 * right.weeks,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      }
    : right;
  const signDiff = l.sign === r.sign ? 0 : l.sign < r.sign ? -1 : 1;
  if (signDiff !== 0) return signDiff;
  const yearsDiff = l.sign > 0 ? l.years - r.years : r.years - l.years;
  if (yearsDiff !== 0) return yearsDiff;
  const monthsDiff = l.sign > 0 ? l.months - r.months : r.months - l.months;
  if (monthsDiff !== 0) return monthsDiff;
  const daysDiff = l.sign > 0 ? l.days - r.days : r.days - l.days;
  if (daysDiff !== 0) return daysDiff;
  const lMillis =
    l.hours * MILLIS_PER_HOUR +
    l.minutes * MILLIS_PER_MINUTE +
    l.seconds * MILLIS_PER_SECOND +
    l.milliseconds;
  const rMillis =
    r.hours * MILLIS_PER_HOUR +
    r.minutes * MILLIS_PER_MINUTE +
    r.seconds * MILLIS_PER_SECOND +
    r.milliseconds;
  return l.sign > 0 ? lMillis - rMillis : rMillis - lMillis;
}
