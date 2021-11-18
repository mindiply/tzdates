import {BareDuration, BareTime, BareTimeDuration} from './types'
import {intDiv, intMod} from './mathutils';
import {
  negateBareDuration,
  timeDurationMillis,
  validateBareDuration, validateBareTimeDuration
} from './duration'
import {
  MILLIS_PER_DAY,
  MILLIS_PER_HOUR,
  MILLIS_PER_MINUTE,
  MILLIS_PER_SECOND
} from './consts';

export function bareTime(
  hour = 0,
  minute = 0,
  second = 0,
  milli = 0
): BareTime {
  const time = {
    hour,
    minute,
    second,
    millisecond: milli
  };
  validateBareTime(time);
  return time;
}

export function cmpBareTimes(left: BareTime, right: BareTime): number {
  validateBareTime(left);
  validateBareTime(right);
  if (left.hour < right.hour) {
    return -1;
  } else if (left.hour > right.hour) {
    return 1;
  } else if (left.minute < right.minute) {
    return -1;
  } else if (left.minute > right.minute) {
    return 1;
  } else if (left.second < right.second) {
    return -1;
  } else if (left.second > right.second) {
    return 1;
  } else if (left.millisecond < right.millisecond) {
    return -1;
  } else if (left.millisecond > right.millisecond) {
    return 1;
  } else {
    return 0;
  }
}

export function bareTimeWith(
  time: BareTime,
  values: Partial<BareTime>,
  isMutable = false
): BareTime {
  validateBareTime(time);
  const out = isMutable
    ? Object.assign(time, values)
    : {
        ...time,
        ...values
      };
  validateBareTime(out);
  return out;
}

export function bareTimeAdd(
  time: BareTime,
  inpDuration: Partial<BareTimeDuration>,
  isMutable = false
): BareTime {
  const duration = Object.assign({sign: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0}, inpDuration);
  validateBareTime(time);
  validateBareTimeDuration(duration);
  if (duration.sign < 0) {
    return bareTimeSubtract(time, negateBareDuration(duration), isMutable);
  }
  const outMillis = millisFromMidnight(time) + timeDurationMillis(duration);
  const modMillis = intMod(outMillis, MILLIS_PER_DAY);
  const modTime = bareTimeFromMillisFromMidnight(modMillis);
  const out = isMutable ? Object.assign(time, modTime) : modTime;
  validateBareTime(out);
  return out;
}

export function bareTimeSubtract(
  time: BareTime,
  inpDuration: Partial<BareTimeDuration>,
  isMutable = false
): BareTime {
  const duration = Object.assign({sign: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0}, inpDuration);
  validateBareTime(time);
  validateBareTimeDuration(duration);
  if (duration.sign < 0) {
    return bareTimeAdd(time, negateBareDuration(duration), isMutable);
  }
  const timeMs = millisFromMidnight(time);
  const durationMs = timeDurationMillis(duration);
  const outMillis =
    timeMs < durationMs
      ? MILLIS_PER_DAY - intMod(durationMs - timeMs, MILLIS_PER_DAY)
      : timeMs - durationMs;
  const modMillis = intMod(outMillis, MILLIS_PER_DAY);
  const modTime = bareTimeFromMillisFromMidnight(modMillis);
  const out = isMutable ? Object.assign(time, modTime) : modTime;
  validateBareTime(out);
  return out;
}

function millisFromMidnight(time: BareTime): number {
  return (
    time.hour * MILLIS_PER_HOUR +
    time.minute * MILLIS_PER_MINUTE +
    time.second * MILLIS_PER_SECOND +
    time.millisecond
  );
}

function validateBareTime({hour, minute, second, millisecond}: BareTime) {
  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59 ||
    millisecond < 0 ||
    millisecond > 999
  ) {
    throw new RangeError('Incorrect values within BareTime');
  }
}

function bareTimeFromMillisFromMidnight(millisFromMidnight: number): BareTime {
  let intMillis = Math.floor(millisFromMidnight);
  if (intMillis >= MILLIS_PER_DAY) {
    throw new RangeError('Too many milliseconds from midnight');
  }
  const out: BareTime = {
    hour: Math.floor(millisFromMidnight / MILLIS_PER_HOUR),
    minute: 0,
    second: 0,
    millisecond: 0
  };
  intMillis -= out.hour * MILLIS_PER_HOUR;
  if (intMillis > 0) {
    out.minute = Math.floor(intMillis / MILLIS_PER_MINUTE);
    intMillis -= out.minute * MILLIS_PER_MINUTE;
    if (intMillis > 0) {
      out.second = Math.floor(intMillis / MILLIS_PER_SECOND);
      out.millisecond = Math.max(0, intMillis - out.second * MILLIS_PER_SECOND);
    }
  }
  validateBareTime(out);
  return out;
}

export function bareTimeOfMsFromMidnight(
  msFromMidnight: number,
  bareTime?: BareTime
): BareTime {
  if (msFromMidnight < 0) {
    throw new RangeError('Milliseconds from midnight should be positive');
  }
  if (msFromMidnight >= MILLIS_PER_DAY) {
    throw new RangeError(
      'Millis since midnight should be less than 24hours worth'
    );
  }
  const hour = intDiv(msFromMidnight, MILLIS_PER_HOUR);
  msFromMidnight -= hour * MILLIS_PER_HOUR;
  const minute = intDiv(msFromMidnight, MILLIS_PER_MINUTE);
  msFromMidnight -= minute * MILLIS_PER_MINUTE;
  const second = intDiv(msFromMidnight, MILLIS_PER_SECOND);
  const millisecond = msFromMidnight - second * MILLIS_PER_SECOND;
  if (bareTime) {
    bareTime.hour = hour;
    bareTime.minute = minute;
    bareTime.second = second;
    bareTime.millisecond = millisecond;
    validateBareTime(bareTime);
    return bareTime;
  }
  const out: BareTime = {
    hour,
    minute,
    second,
    millisecond
  };
  validateBareTime(out);
  return out;
}
