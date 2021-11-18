import {
  bareDuration,
  weeksBareDuration,
  absBareDuration,
  negateBareDuration,
  cmpBareDurations
} from '../src';

describe('duration', () => {
  test('Invalid durations', () => {
    expect(() => bareDuration(1, 25, -13)).toThrowError(TypeError);
    expect(() => bareDuration(-1, 25, 15, -1)).toThrowError(TypeError);
    expect(() => weeksBareDuration(1, -12)).toThrowError(TypeError);
    expect(() => weeksBareDuration(-1, -12)).toThrowError(TypeError);
  });

  test('non-week constructor', () => {
    expect(bareDuration(1)).toMatchObject({
      sign: 1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(-1)).toMatchObject({
      sign: -1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(0)).toMatchObject({
      sign: 0,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(1, 1000)).toMatchObject({
      sign: 1,
      years: 1000,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(-1, 0, 20)).toMatchObject({
      sign: -1,
      years: 0,
      months: 20,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(1, 0, 0, 12)).toMatchObject({
      sign: 1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 12,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(-1, 0, 0, 0, 12)).toMatchObject({
      sign: -1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(1, 0, 0, 0, 0, 12)).toMatchObject({
      sign: 1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 12,
      seconds: 0,
      milliseconds: 0
    });
    expect(bareDuration(1, 0, 0, 0, 0, 0, 12)).toMatchObject({
      sign: 1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 12,
      milliseconds: 0
    });
    expect(bareDuration(-1, 0, 0, 0, 0, 0, 0, 12)).toMatchObject({
      sign: -1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 12
    });
    expect(bareDuration(1, 1, 1, 12, 5, 42, 12, 989)).toMatchObject({
      sign: 1,
      years: 1,
      months: 1,
      weeks: 0,
      days: 12,
      hours: 5,
      minutes: 42,
      seconds: 12,
      milliseconds: 989
    });
  });

  test('Week constructor', () => {
    expect(weeksBareDuration(1, 0)).toMatchObject({
      sign: 1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(weeksBareDuration(0, 0)).toMatchObject({
      sign: 0,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(weeksBareDuration(-1, 0)).toMatchObject({
      sign: -1,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(weeksBareDuration(-1, 45)).toMatchObject({
      sign: -1,
      years: 0,
      months: 0,
      weeks: 45,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
    expect(weeksBareDuration(1, 8)).toMatchObject({
      sign: 1,
      years: 0,
      months: 0,
      weeks: 8,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    });
  });


});
