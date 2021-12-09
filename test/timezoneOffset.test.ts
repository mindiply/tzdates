import {
  TimeZone,
  timezoneOffsetSeconds,
  UnknownTimezoneError
} from '../src/index';

describe('timezoneOffset', () => {
  test('Throw on unknown Timezones', () => {
    // @ts-expect-error providing erroneous timezone on purpose
    expect(() => timezoneOffsetSeconds('Unkown/Timezone', 0)).toThrowError(
      UnknownTimezoneError
    );
  });

  describe('Epoch 0', () => {
    test('UTC', () => {
      expect(timezoneOffsetSeconds(TimeZone.ETC__UTC, 0)).toBe(0);
    });
    test(TimeZone.EUROPE__LONDON, () => {
      expect(timezoneOffsetSeconds(TimeZone.EUROPE__LONDON, 0)).toBe(60 * 60);
    });
    test(TimeZone.EUROPE__ROME, () => {
      expect(timezoneOffsetSeconds(TimeZone.EUROPE__ROME, 0)).toBe(60 * 60);
    });
    test(TimeZone.AMERICA__NEW_YORK, () => {
      expect(timezoneOffsetSeconds(TimeZone.AMERICA__NEW_YORK, 0)).toBe(
        -300 * 60
      );
    });
    test(TimeZone.ASIA__TOKYO, () => {
      expect(timezoneOffsetSeconds(TimeZone.ASIA__TOKYO, 0)).toBe(540 * 60);
    });
  });

  describe('Ms from epoch 1640995200000 - UTC Dec 1st 2021 at midnight', () => {
    test('UTC', () => {
      expect(timezoneOffsetSeconds(TimeZone.ETC__UTC, 1640995200000)).toBe(0);
    });
    test(TimeZone.EUROPE__LONDON, () => {
      expect(
        timezoneOffsetSeconds(TimeZone.EUROPE__LONDON, 1640995200000)
      ).toBe(0);
    });
    test(TimeZone.EUROPE__ROME, () => {
      expect(timezoneOffsetSeconds(TimeZone.EUROPE__ROME, 1640995200000)).toBe(
        60 * 60
      );
    });
    test(TimeZone.AMERICA__NEW_YORK, () => {
      expect(
        timezoneOffsetSeconds(TimeZone.AMERICA__NEW_YORK, 1640995200000)
      ).toBe(-300 * 60);
    });
    test(TimeZone.ASIA__TOKYO, () => {
      expect(timezoneOffsetSeconds(TimeZone.ASIA__TOKYO, 1640995200000)).toBe(
        540 * 60
      );
    });
  });

  describe('Ms from epoch 1625094000000 - UTC June 1st 2021 at midnight', () => {
    test('UTC', () => {
      expect(timezoneOffsetSeconds(TimeZone.ETC__UTC, 1625094000000)).toBe(0);
    });
    test(TimeZone.EUROPE__LONDON, () => {
      expect(
        timezoneOffsetSeconds(TimeZone.EUROPE__LONDON, 1625094000000)
      ).toBe(60 * 60);
    });
    test(TimeZone.EUROPE__ROME, () => {
      expect(timezoneOffsetSeconds(TimeZone.EUROPE__ROME, 1625094000000)).toBe(
        120 * 60
      );
    });
    test(TimeZone.AMERICA__NEW_YORK, () => {
      expect(
        timezoneOffsetSeconds(TimeZone.AMERICA__NEW_YORK, 1625094000000)
      ).toBe(-240 * 60);
    });
    test(TimeZone.ASIA__TOKYO, () => {
      expect(timezoneOffsetSeconds(TimeZone.ASIA__TOKYO, 1625094000000)).toBe(
        540 * 60
      );
    });
  });
});
