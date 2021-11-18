import {TimeZone} from './timezones';

export interface TimeZoneData {
  /** The uniquely identifying name of the time zone. */
  name: string;
  /** (measured in milliseconds) */
  untils: Array<number>;
  /** (measured in minutes) */
  offsets: Array<number>;
}

export interface UnpackedZone extends TimeZoneData {
  /** zone abbreviations */
  abbrs: Array<string>;
}

export interface UnpackedZoneBundle {
  version: string;
  zones: Array<UnpackedZone>;
  links: Array<string>;
}

export class UnknownTimezoneError extends Error {}

export class IncorrectTimezoneData extends Error {}

export type DurationSign = 0 | 1 | -1;

export interface BareSignedDuration {
  sign: DurationSign;
}

export interface BareTimeDuration extends BareSignedDuration {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface BareDateDuration extends BareSignedDuration {
  years: number;
  weeks: number;
  months: number;
  days: number;
}

export interface BareDuration extends BareTimeDuration, BareDateDuration {}

export interface BareTime {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export interface BareDate {
  year: number;
  month: number;
  day: number;
}

export interface BareDateTime extends BareTime, BareDate {}

export interface BareZonedDateTime extends BareDateTime {
  timezone: TimeZone;
  utcOffsetSeconds: number;
  epochMilli: number;
}
