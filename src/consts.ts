/**
 * The number of days in a 400 year cycle.
 */
export const  DAYS_PER_CYCLE = 146097;

/**
 * The number of days from year zero to year 1970.
 * There are five 400 year cycles from year zero to 2000.
 * There are 7 leap years from 1970 to 2000.
 */
export const  DAYS_0000_TO_1970 = (DAYS_PER_CYCLE * 5) - (30 * 365 + 7);

export const SECS_PER_MINUTE = 60;
export const SECS_PER_HOUR = 60 * SECS_PER_MINUTE;
export const SECS_PER_DAY = 24 * SECS_PER_HOUR;

export const MILLIS_PER_SECOND = 1000;
export const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;
export const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;
export const MILLIS_PER_DAY = MILLIS_PER_HOUR * 24;
