import {BareDate, BareDuration, DistanceFnOptions} from './types';
import {DAYS_0000_TO_1970, DAYS_PER_CYCLE} from './consts';
import {intDiv, intMod, roundDown} from './mathutils';
import {
  bareDuration,
  dayPriority,
  monthPriority,
  negateBareDuration,
  roundingUnitPriority,
  validateBareDateDuration,
  yearPriority
} from './bareduration';

let _cumulativeCycleYearsDays: number[] | null = null;
let _cumulativeNegativeCycleYearsDays: number[] | null = null;

export function isValidBareDate(date: any): date is BareDate {
  return Boolean(
    date && typeof date === 'object' && isBareDateValid(date as BareDate)
  );
}

function isBareDateValid(date: BareDate): boolean {
  return (
    Number.isInteger(date.year) &&
    Number.isInteger(date.month) &&
    Number.isInteger(date.day) &&
    date.month > 0 &&
    date.month < 13 &&
    date.day > 0 &&
    date.day <= isoDaysInMonth(date.year, date.month)
  );
}

export function validateBareDate(date: BareDate) {
  if (!isBareDateValid(date)) {
    throw new TypeError(`Incorrect date values`);
  }
}

export function cmpMonthDay(
  left: Omit<BareDate, 'year'>,
  right: Omit<BareDate, 'year'>
): number {
  if (left.month < right.month) {
    return -1;
  } else if (left.month > right.month) {
    return 1;
  } else if (left.day < right.day) {
    return -1;
  } else if (left.day > right.day) {
    return 1;
  }
  return 0;
}

export function cmpBareDatesToYear(left: BareDate, right: BareDate) {
  if (left.year < right.year) {
    return -1;
  } else if (left.year > right.year) {
    return 1;
  } else {
    return 0;
  }
}

export function cmpBareDatesToMonth(left: BareDate, right: BareDate) {
  return (
    cmpBareDatesToYear(left, right) ||
    (left.month < right.month ? -1 : left.month > right.month ? 1 : 0)
  );
}

export function cmpBareDates(left: BareDate, right: BareDate) {
  return cmpBareDatesToMonth(left, right) || left.day - right.day;
}

export function bareDate(year = 1970, month = 1, day = 1) {
  const out: BareDate = {year, month, day};
  validateBareDate(out);
  return out;
}

/**
 * Allows setting the date passed in input with different values for day, month and/or year.
 *
 * If the day provided is more that the number of days in the month, it will use the latter. Getting
 * the end of the month can therefore be safely done by setting the day to 31, also for months that don't
 * have 31 days.
 *
 * It's possible to mutate the input if desired.
 *
 * @param {BareDate} bareDate
 * @param {Partial<BareDate>} changes
 * @param {boolean} isMutable
 * @returns {BareDate}
 */
export function bareDateWith(
  bareDate: BareDate,
  changes: Partial<BareDate>,
  mutateInput = false
) {
  const out = mutateInput
    ? bareDate
    : _assignBareDate({} as BareDate, bareDate);
  if (typeof changes.year !== 'undefined') {
    out.year = changes.year;
  }
  if (typeof changes.month !== 'undefined') {
    out.month = changes.month;
  }
  if (typeof changes.day !== 'undefined') {
    out.day = changes.day;
  }

  const nMonthDays = isLeapYear(out.year)
    ? leapYearDaysOfMonth[out.month - 1]
    : standardDaysOfMonth[out.month - 1];
  if (out.day > nMonthDays) {
    out.day = nMonthDays;
  }
  validateBareDate(out);
  return out;
}

/**
 *
 * @param {BareDate} bareDate
 * @param {BareDuration} duration only duration members of days or more are considered
 * @param {boolean} mutateInput
 * @returns {BareDate}
 */
export function bareDateAdd(
  bareDate: BareDate,
  duration: BareDuration,
  mutateInput = false
): BareDate {
  validateBareDateDuration(duration);
  const out = mutateInput
    ? bareDate
    : _assignBareDate({} as BareDate, bareDate);
  if (duration.sign < 0) {
    return bareDateSubtract(
      bareDate,
      negateBareDuration(duration),
      mutateInput
    );
  }
  if (duration.years > 0) {
    out.year += duration.years;
  }
  if (duration.months > 0) {
    if (out.month + duration.months <= 12) {
      out.month = out.month + duration.months;
    } else {
      out.year += intDiv(out.month + duration.months - 1, 12);
      out.month = intMod(out.month + duration.months, 12);
      if (out.month === 0) {
        out.month = 12;
      }
    }
    const monthDays = isoDaysInMonth(out.year, out.month);
    if (out.day > monthDays) {
      out.day = monthDays;
    }
  }
  const totDays = duration.weeks * 7 + duration.days;
  if (totDays > 0) {
    bareDateOfEpochDay(toEpochDay(out) + totDays, out);
  }
  validateBareDate(out);
  return out;
}

export function bareDateSubtract(
  bareDate: BareDate,
  duration: BareDuration,
  mutateInput = false
): BareDate {
  validateBareDateDuration(duration);
  const out = mutateInput
    ? bareDate
    : _assignBareDate({} as BareDate, bareDate);
  if (duration.sign < 0) {
    return bareDateAdd(bareDate, negateBareDuration(duration), mutateInput);
  }
  if (duration.years > 0) {
    out.year -= duration.years;
  }
  if (duration.months > 0) {
    if (out.month > duration.months) {
      out.month = out.month - duration.months;
    } else {
      out.year -= Math.ceil(Math.abs(duration.months - (out.month - 1)) / 12);
      out.month = 12 + intMod(out.month - duration.months, 12);
    }
    const monthDays = isoDaysInMonth(out.year, out.month);
    if (out.day > monthDays) {
      out.day = monthDays;
    }
  }
  const totDays = duration.weeks * 7 + duration.days;
  if (totDays > 0) {
    bareDateOfEpochDay(toEpochDay(out) - totDays, out);
  }
  validateBareDate(out);
  return out;
}

export function isLeapYear(year: number) {
  if (undefined === year) return false;
  if (year % 4 !== 0) {
    return false;
  }
  return year % 100 !== 0 || year % 400 === 0;
}

const standardDaysOfMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const leapYearDaysOfMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const cumulativeStdDaysOfMonth = standardDaysOfMonth.map(
  (monthDays, index) =>
    monthDays +
    standardDaysOfMonth
      .slice(0, index)
      .reduce((cumulDays, prevMonthDays) => prevMonthDays + cumulDays, 0)
);
const cumulativeLeapYearDaysOfMonth = leapYearDaysOfMonth.map(
  (monthDays, index) =>
    monthDays +
    leapYearDaysOfMonth
      .slice(0, index)
      .reduce((cumulDays, prevMonthDays) => prevMonthDays + cumulDays, 0)
);

/**
 * Given a date, it returns what day in the year the date was.
 * 1st Jan is day 1, 2nd Jan day 2 and so on. Takes into account if the year is a leap year
 * or not.
 *
 * @param {BareDate} date
 * @returns {number}
 */
export function dayOfYear(date: BareDate) {
  validateBareDate(date);
  const lastFullMonthIndex = date.month - 2;
  return (
    date.day +
    (lastFullMonthIndex >= 0
      ? (isLeapYear(date.year)
          ? cumulativeLeapYearDaysOfMonth
          : cumulativeStdDaysOfMonth)[lastFullMonthIndex]
      : 0)
  );
}

function monthAndDayOfYearNthDay<
  T extends Omit<BareDate, 'year'> = Omit<BareDate, 'year'>
>(year: number, nthDay: number, monthDay?: T): T {
  const yearMonthsDays = isLeapYear(year)
    ? cumulativeLeapYearDaysOfMonth
    : cumulativeStdDaysOfMonth;
  const yearDays = yearMonthsDays[yearMonthsDays.length - 1];
  if (nthDay < 1 || nthDay > yearDays) {
    throw new RangeError('nth day can only be 1 to 365/366 only');
  }
  let low = 0,
    high = yearMonthsDays.length - 1,
    mid = (high + low) >> 1,
    month = 1;
  for (; low <= high; mid = (high + low) >> 1) {
    if (
      nthDay <= yearMonthsDays[mid] &&
      nthDay > (mid > 0 ? yearMonthsDays[mid - 1] : 0)
    ) {
      month = mid + 1;
      break;
    } else if (nthDay <= yearMonthsDays[mid]) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  const day = nthDay - (month > 1 ? yearMonthsDays[month - 2] : 0);
  let out: T;
  if (monthDay) {
    out = monthDay;
    out.month = month;
    out.day = day;
  } else {
    out = {month, day} as T;
  }
  return out;
}

/**
 * Given a date, it returns the week number it falls into following the ISO 8601 calendar.
 * @param {BareDate} date
 * @returns {number}
 */
export function isoWeekOfYear(date: BareDate) {
  const doy = dayOfYear(date);
  const dow = isoDayOfWeek(date);
  const doj = isoDayOfWeek({year: date.year, month: 1, day: 1});

  const week = roundDown((doy - dow + 10) / 7);

  if (week < 1) {
    if (doj === 5 || (doj === 6 && isLeapYear(date.year - 1))) {
      return 53;
    } else {
      return 52;
    }
  }
  if (week === 53) {
    if ((isLeapYear(date.year) ? 366 : 365) - doy < 4 - dow) {
      return 1;
    }
  }
  return week;
}

/**
 * Given a year and month, returns the number of days for that month on that year.
 *
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export function isoDaysInMonth(year: number, month: number) {
  return (isLeapYear(year) ? leapYearDaysOfMonth : standardDaysOfMonth)[
    month - 1
  ];
}

const sun1970Jan04EpochDay = toEpochDay({year: 1970, month: 1, day: 4});

/**
 * Given a bare date, it returns the iso day of the Week, with Monday 1 and
 * Sunday 7;
 * @param {BareDate} bareDate
 * @returns {number}
 */
export function isoDayOfWeek(bareDate: BareDate) {
  let rest = intMod(toEpochDay(bareDate) - sun1970Jan04EpochDay, 7);
  if (rest < 0) {
    rest = 7 - rest;
  }
  return rest === 0 ? 7 : rest;
}

function cumulativeCycleYearsDays(): number[] {
  if (_cumulativeCycleYearsDays !== null) {
    return _cumulativeCycleYearsDays;
  }
  _cumulativeCycleYearsDays = [];
  for (let i = 0; i < 400; i++) {
    _cumulativeCycleYearsDays.push(isLeapYear(i) ? 366 : 365);
    if (i > 0) {
      _cumulativeCycleYearsDays[i] += _cumulativeCycleYearsDays[i - 1];
    }
  }
  return _cumulativeCycleYearsDays;
}

function cumulativeNegativeCycleYearsDays(): number[] {
  if (_cumulativeNegativeCycleYearsDays !== null) {
    return _cumulativeNegativeCycleYearsDays;
  }
  _cumulativeNegativeCycleYearsDays = [];
  for (let i = 0; i < 400; i++) {
    const year = 0 - i - 1;
    _cumulativeNegativeCycleYearsDays.push(isLeapYear(year) ? 366 : 365);
    if (i > 0) {
      _cumulativeNegativeCycleYearsDays[i] +=
        _cumulativeNegativeCycleYearsDays[i - 1];
    }
  }
  return _cumulativeNegativeCycleYearsDays;
}

/**
 * Given a bare date, it returns the number of days since the unix epoch Jan 1st 1970.
 * For dates before the unix epoch it returns negative values.
 *
 * @param {BareDate} bareDate
 * @returns {number}
 */
export function toEpochDay(bareDate: BareDate): number {
  const lastFullYear =
    bareDate.year < -1
      ? bareDate.year + 1
      : bareDate.year > 0
      ? bareDate.year
      : null;
  let totalDays = 0;
  if (lastFullYear !== null) {
    const nCycles = intDiv(lastFullYear, 400);
    totalDays += nCycles * DAYS_PER_CYCLE;
    const yearCycleIndex = Math.abs(intMod(lastFullYear, 400)) - 1;
    if (yearCycleIndex >= 0) {
      totalDays +=
        lastFullYear < 0
          ? 0 - cumulativeNegativeCycleYearsDays()[yearCycleIndex]
          : cumulativeCycleYearsDays()[yearCycleIndex];
    }
  }
  if (bareDate.year >= 0) {
    totalDays += dayOfYear(bareDate);
  } else {
    totalDays +=
      0 - (isLeapYear(bareDate.year) ? 366 : 365) + dayOfYear(bareDate);
  }
  // -1 because 1 jan 1970 should be day 0
  return totalDays - 1 - DAYS_0000_TO_1970;
}

export function bareDateOfEpochDay(
  epochDay: number,
  bareDate?: BareDate
): BareDate {
  let adjust, adjustCycles, doyEst, yearEst, zeroDay;
  zeroDay = epochDay + DAYS_0000_TO_1970 - 60;
  adjust = 0;
  if (zeroDay < 0) {
    adjustCycles = intDiv(zeroDay + 1, DAYS_PER_CYCLE) - 1;
    adjust = adjustCycles * 400;
    zeroDay += -adjustCycles * DAYS_PER_CYCLE;
  }
  yearEst = intDiv(400 * zeroDay + 591, DAYS_PER_CYCLE);
  doyEst =
    zeroDay -
    (365 * yearEst +
      intDiv(yearEst, 4) -
      intDiv(yearEst, 100) +
      intDiv(yearEst, 400));
  if (doyEst < 0) {
    yearEst--;
    doyEst =
      zeroDay -
      (365 * yearEst +
        intDiv(yearEst, 4) -
        intDiv(yearEst, 100) +
        intDiv(yearEst, 400));
  }
  yearEst += adjust;
  const marchDoy0 = doyEst;
  const marchMonth0 = intDiv(marchDoy0 * 5 + 2, 153);
  const month = ((marchMonth0 + 2) % 12) + 1;
  const dom = marchDoy0 - intDiv(marchMonth0 * 306 + 5, 10) + 1;
  yearEst += intDiv(marchMonth0, 10);
  const year = yearEst;
  let out: BareDate;
  if (bareDate) {
    out = bareDate;
    out.year = year;
    out.month = month;
    out.day = dom;
  } else {
    out = {
      year,
      month,
      day: dom
    };
  }
  validateBareDate(out);
  return out;
}

export function bareDatesDistance(
  left: BareDate,
  right: BareDate,
  options: DistanceFnOptions = {}
): BareDuration {
  const {
    largestUnit = 'day',
    smallestUnit = 'day',
    roundingMode = 'floor'
  } = options;

  const datesCmp = cmpBareDates(left, right);
  if (datesCmp === 0) {
    return bareDuration(0);
  }
  let earlier = datesCmp < 0 ? left : right;
  const later = datesCmp < 0 ? right : left;
  const largestPriority = roundingUnitPriority(largestUnit);
  const smallestPriority = roundingUnitPriority(smallestUnit);
  if (largestPriority < smallestPriority || largestPriority < dayPriority) {
    throw RangeError(
      'The lowest duration unit cannot be more than the highest one and has to be day at least'
    );
  }

  if (largestPriority === dayPriority) {
    return bareDuration(
      datesCmp < 0 ? 1 : -1,
      0,
      0,
      toEpochDay(later) - toEpochDay(earlier)
    );
  }
  let years = 0,
    months = 0,
    days = 0;
  if (largestPriority >= yearPriority) {
    years = later.year - earlier.year;
    if (cmpMonthDay(earlier, later) > 0 && years > 0) {
      years--;
    }
    earlier =
      years > 0 ? bareDateWith(earlier, {year: earlier.year + years}) : earlier;
    if (
      smallestPriority === yearPriority &&
      cmpBareDates(earlier, later) < 0 &&
      (roundingMode === 'ceil' ||
        (roundingMode === 'halfExpand' &&
          toEpochDay(later) - toEpochDay(earlier) >= 365 / 2))
    ) {
      years++;
    }
  }
  if (largestPriority >= monthPriority && smallestPriority <= monthPriority) {
    months =
      later.year * 12 + later.month - (earlier.year * 12 + earlier.month);
    if (later.day < earlier.day && months > 0) {
      months--;
    }
    earlier =
      months > 0 ? bareDateAdd(earlier, bareDuration(1, 0, months)) : earlier;
    if (
      smallestPriority === monthPriority &&
      cmpBareDates(earlier, later) < 0 &&
      (roundingMode === 'ceil' ||
        (roundingMode === 'halfExpand' &&
          toEpochDay(later) - toEpochDay(earlier) >= 15))
    ) {
      months++;
    }
  }
  if (smallestPriority <= dayPriority) {
    days = toEpochDay(later) - toEpochDay(earlier);
  }

  return bareDuration(
    years + months + days === 0 ? 0 : datesCmp < 0 ? 1 : -1,
    years,
    months,
    days
  );
}

function yearIndexInCycle(restDays: number, beforeYearZero: boolean): number {
  if (restDays < 1 || restDays > DAYS_PER_CYCLE) {
    throw new RangeError(`Outside allowed range of 400 years cycle's days`);
  }
  let low = 0,
    high = cumulativeCycleYearsDays().length - 1,
    mid = (low + high) >> 1;
  for (; low <= high; mid = (low + high) >> 1) {
    const cycle = beforeYearZero
      ? cumulativeNegativeCycleYearsDays()
      : cumulativeCycleYearsDays();
    if (restDays <= cycle[mid] && restDays > (mid > 0 ? cycle[mid - 1] : 0)) {
      return mid;
    } else if (cycle[mid] > restDays) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  throw new Error('Index not found, unexpected');
}

export function bareDateToString(bareDate: BareDate): string {
  validateBareDate(bareDate);
  const absYear = Math.abs(bareDate.year);
  return `${bareDate.year < 0 ? '-' : ''}${
    absYear < 10 ? '000' : absYear < 100 ? '00' : absYear < 1000 ? '0' : ''
  }${absYear}-${bareDate.month > 9 ? bareDate.month : `0${bareDate.month}`}-${
    bareDate.day > 9 ? bareDate.day : `0${bareDate.day}`
  }`;
}

export function _assignBareDate(
  copyInto: BareDate,
  changes: Partial<BareDate>
): BareDate {
  if (changes.year !== undefined) {
    copyInto.year = changes.year;
  }
  if (changes.month !== undefined) {
    copyInto.month = changes.month;
  }
  if (changes.day !== undefined) {
    copyInto.day = changes.day;
  }
  return copyInto;
}
