import {describe, expect, test} from 'vitest';
import {
  bareDuration,
  bareDateTime,
  bareDateTimeAdd,
  bareDateTimeSubtract,
  now
} from '../src/index.js';

describe('bareDateTimeAdd', () => {
  test('Zero additions', () => {
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 23), bareDuration(0))
    ).toMatchObject(bareDateTime(2022, 5, 23));
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 23), bareDuration(1, 0))
    ).toMatchObject(bareDateTime(2022, 5, 23));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 23),
        bareDuration(-1, 0, 0, 0, 0, 0, 0, 0)
      )
    ).toMatchObject(bareDateTime(2022, 5, 23));
  });

  test('Date Only additions', () => {
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 23), bareDuration(1, 1))
    ).toMatchObject(bareDateTime(2023, 5, 23));
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 23), bareDuration(1, 1, 2))
    ).toMatchObject(bareDateTime(2023, 7, 23));
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 31), bareDuration(1, 1, 4))
    ).toMatchObject(bareDateTime(2023, 9, 30));
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 31), bareDuration(1, 1, 4, 3))
    ).toMatchObject(bareDateTime(2023, 10, 3));
  });

  test('Time Only additions', () => {
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 23), bareDuration(1, 0, 0, 0, 36))
    ).toMatchObject(bareDateTime(2022, 5, 24, 12));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 0, 0, 0, 36, 30)
      )
    ).toMatchObject(bareDateTime(2022, 6, 1, 12, 30));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 0, 0, 0, 37, 30, 55)
      )
    ).toMatchObject(bareDateTime(2022, 6, 1, 13, 30, 55));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 0, 0, 0, 0, 30, 30, 999)
      )
    ).toMatchObject(bareDateTime(2022, 5, 31, 0, 30, 30, 999));
  });

  test('Mixed day/time durations additions', () => {
    expect(
      bareDateTimeAdd(bareDateTime(2022, 5, 23), bareDuration(1, 1, 1, 1, 36))
    ).toMatchObject(bareDateTime(2023, 6, 25, 12));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 2, 2, 2, 36, 30)
      )
    ).toMatchObject(bareDateTime(2024, 8, 3, 12, 30));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 0, 4, 1, 37, 30, 55)
      )
    ).toMatchObject(bareDateTime(2022, 10, 2, 13, 30, 55));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 31, 23, 50),
        bareDuration(1, 1, 0, 1, 0, 30, 30, 999)
      )
    ).toMatchObject(bareDateTime(2023, 6, 2, 0, 20, 30, 999));
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 5, 31, 23, 50),
        bareDuration(-1, 1, 0, 1, 0, 30, 30, 999)
      )
    ).toMatchObject(bareDateTime(2021, 5, 30, 23, 19, 29, 1));
  });

  test("Adding milliseconds that cause overflows", () => {
    expect(
      bareDateTimeAdd(
        bareDateTime(2022, 12, 31, 23, 59, 59, 999),
        bareDuration(1, 0, 0, 0, 0, 0, 0, 1)
      )
    ).toMatchObject(bareDateTime(2023, 1, 1, 0, 0, 0, 0));
  });
});

describe('bareDateTimeSubtract', () => {
  test('Zero subtractions', () => {
    expect(
      bareDateTimeSubtract(bareDateTime(2022, 5, 23), bareDuration(0))
    ).toMatchObject(bareDateTime(2022, 5, 23));
    expect(
      bareDateTimeSubtract(bareDateTime(2022, 5, 23), bareDuration(1, 0))
    ).toMatchObject(bareDateTime(2022, 5, 23));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 23),
        bareDuration(-1, 0, 0, 0, 0, 0, 0, 0)
      )
    ).toMatchObject(bareDateTime(2022, 5, 23));
  });

  test('Date Only subtractions', () => {
    expect(
      bareDateTimeSubtract(bareDateTime(2022, 5, 23), bareDuration(1, 1))
    ).toMatchObject(bareDateTime(2021, 5, 23));
    expect(
      bareDateTimeSubtract(bareDateTime(2022, 5, 23), bareDuration(1, 1, 8))
    ).toMatchObject(bareDateTime(2020, 9, 23));
    expect(
      bareDateTimeSubtract(bareDateTime(2022, 5, 31), bareDuration(1, 1, 3))
    ).toMatchObject(bareDateTime(2021, 2, 28));
    expect(
      bareDateTimeSubtract(bareDateTime(2022, 5, 31), bareDuration(1, 1, 4, 3))
    ).toMatchObject(bareDateTime(2021, 1, 28));
  });

  test('Time Only subtractions', () => {
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 23),
        bareDuration(1, 0, 0, 0, 36)
      )
    ).toMatchObject(bareDateTime(2022, 5, 21, 12));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 6, 1),
        bareDuration(1, 0, 0, 0, 36, 30)
      )
    ).toMatchObject(bareDateTime(2022, 5, 30, 11, 30));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 1, 1, 12),
        bareDuration(1, 0, 0, 0, 37, 30, 55)
      )
    ).toMatchObject(bareDateTime(2021, 12, 30, 22, 29, 5));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 0, 0, 0, 0, 30, 30, 999)
      )
    ).toMatchObject(bareDateTime(2022, 5, 30, 23, 29, 29, 1));
  });

  test('Mixed day/time durations subtractions', () => {
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 23),
        bareDuration(1, 1, 1, 1, 36)
      )
    ).toMatchObject(bareDateTime(2021, 4, 20, 12));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 2, 2, 2, 36, 30)
      )
    ).toMatchObject(bareDateTime(2020, 3, 27, 11, 30));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 31),
        bareDuration(1, 0, 4, 1, 37, 30, 55)
      )
    ).toMatchObject(bareDateTime(2022, 1, 28, 10, 29, 5));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 31, 23, 50),
        bareDuration(1, 1, 0, 1, 0, 30, 30, 999)
      )
    ).toMatchObject(bareDateTime(2021, 5, 30, 23, 19, 29, 1));
    expect(
      bareDateTimeSubtract(
        bareDateTime(2022, 5, 31, 23, 50),
        bareDuration(-1, 1, 0, 1, 0, 30, 30, 999)
      )
    ).toMatchObject(bareDateTime(2023, 6, 2, 0, 20, 30, 999));
  });
});

describe('now', () => {
  test('Current date time', () => {

    const bdt = now();
    const ref = new Date();
    const dt = now();
    const bd = new Date(bdt.year, bdt.month - 1, bdt.day, bdt.hour, bdt.minute, bdt.second, bdt.millisecond);
    const ad = new Date(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second, dt.millisecond);
    if (ad.getTime() - bd.getTime() < 100 && (bdt.hour !== dt.hour || bdt.minute !== dt.minute || bdt.second !== dt.second)) {
      // All good, within 100ms and at least one of hour, minute, second is different
      return;
    }
    expect(ad.getTime() - bd.getTime()).toBeLessThan(100);
    expect(ref.getHours()).toBe(dt.hour);
    expect(ref.getMinutes()).toBe(dt.minute);
    expect(ref.getSeconds()).toBe(dt.second);
    expect(ref.getFullYear()).toBe(dt.year);
    expect(ref.getMonth() + 1).toBe(dt.month);
    expect(ref.getDate()).toBe(dt.day);
  });
})
