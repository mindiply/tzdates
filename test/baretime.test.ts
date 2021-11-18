import {bareTime, bareTimeAdd, bareTimeSubtract, bareTimeWith} from '../src';

describe('baretime', () => {
  describe('Add', () => {
    test('from midnight', () => {
      expect(bareTimeAdd(bareTime(), {})).toEqual(bareTime(0, 0, 0, 0));
      expect(bareTimeAdd(bareTime(), {sign: 1, milliseconds: 1})).toEqual(
        bareTime(0, 0, 0, 1)
      );
      expect(bareTimeAdd(bareTime(), {sign: -1, milliseconds: 1})).toEqual(
        bareTime(23, 59, 59, 999)
      );
      expect(bareTimeAdd(bareTime(), {seconds: 1})).toEqual(
        bareTime(0, 0, 1, 0)
      );
      expect(bareTimeAdd(bareTime(), {sign: -1, seconds: 1})).toEqual(
        bareTime(23, 59, 59, 0)
      );
      expect(bareTimeAdd(bareTime(), {minutes: 1})).toEqual(
        bareTime(0, 1, 0, 0)
      );
      expect(bareTimeAdd(bareTime(), {sign: -1, minutes: 1})).toEqual(
        bareTime(23, 59, 0, 0)
      );
      expect(bareTimeAdd(bareTime(), {sign: 1, hours: 1})).toEqual(
        bareTime(1, 0, 0, 0)
      );
      expect(bareTimeAdd(bareTime(), {sign: -1, hours: 1})).toEqual(
        bareTime(23)
      );
      expect(
        bareTimeAdd(bareTime(), {
          sign: 1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(13, 50, 12, 565));
      expect(
        bareTimeAdd(bareTime(), {
          sign: -1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(10, 9, 47, 435));
    });

    test('From midday', () => {
      expect(
        bareTimeAdd(bareTime(12), {
          sign: 1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(1, 50, 12, 565));
      expect(
        bareTimeAdd(bareTime(12), {
          sign: -1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(22, 9, 47, 435));
    });

    test('overflow', () => {
      expect(bareTimeAdd(bareTime(), {sign: 1, hours: 48})).toEqual(bareTime());
      expect(bareTimeAdd(bareTime(), {sign: -1, hours: 48})).toEqual(
        bareTime()
      );
      expect(
        bareTimeAdd(bareTime(), {
          sign: 1,
          hours: 49,
          minutes: 12,
          milliseconds: 223
        })
      ).toEqual(bareTime(1, 12, 0, 223));
      expect(
        bareTimeAdd(bareTime(), {
          sign: -1,
          hours: 49,
          minutes: 12,
          milliseconds: 223
        })
      ).toEqual(bareTime(22, 47, 59, 777));
    });
  });

  describe('Sunbract', () => {
    test('from midnight', () => {
      expect(bareTimeSubtract(bareTime(), {})).toEqual(bareTime(0, 0, 0, 0));
      expect(bareTimeSubtract(bareTime(), {sign: -1, milliseconds: 1})).toEqual(
        bareTime(0, 0, 0, 1)
      );
      expect(bareTimeSubtract(bareTime(), {sign: 1, milliseconds: 1})).toEqual(
        bareTime(23, 59, 59, 999)
      );
      expect(bareTimeSubtract(bareTime(), {sign: -1, seconds: 1})).toEqual(
        bareTime(0, 0, 1, 0)
      );
      expect(bareTimeSubtract(bareTime(), {seconds: 1})).toEqual(
        bareTime(23, 59, 59, 0)
      );
      expect(bareTimeSubtract(bareTime(), {sign: -1, minutes: 1})).toEqual(
        bareTime(0, 1, 0, 0)
      );
      expect(bareTimeSubtract(bareTime(), {minutes: 1})).toEqual(
        bareTime(23, 59, 0, 0)
      );
      expect(bareTimeSubtract(bareTime(), {sign: -1, hours: 1})).toEqual(
        bareTime(1, 0, 0, 0)
      );
      expect(bareTimeSubtract(bareTime(), {sign: 1, hours: 1})).toEqual(
        bareTime(23)
      );
      expect(
        bareTimeSubtract(bareTime(), {
          sign: -1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(13, 50, 12, 565));
      expect(
        bareTimeSubtract(bareTime(), {
          sign: 1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(10, 9, 47, 435));
    });

    test('From midday', () => {
      expect(
        bareTimeSubtract(bareTime(12), {
          sign: -1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(1, 50, 12, 565));
      expect(
        bareTimeSubtract(bareTime(12), {
          sign: 1,
          hours: 13,
          minutes: 50,
          seconds: 12,
          milliseconds: 565
        })
      ).toEqual(bareTime(22, 9, 47, 435));
    });

    test('overflow', () => {
      expect(bareTimeSubtract(bareTime(), {sign: 1, hours: 48})).toEqual(
        bareTime()
      );
      expect(bareTimeSubtract(bareTime(), {sign: -1, hours: 48})).toEqual(
        bareTime()
      );
      expect(
        bareTimeSubtract(bareTime(), {
          sign: -1,
          hours: 49,
          minutes: 12,
          milliseconds: 223
        })
      ).toEqual(bareTime(1, 12, 0, 223));
      expect(
        bareTimeSubtract(bareTime(), {
          sign: 1,
          hours: 49,
          minutes: 12,
          milliseconds: 223
        })
      ).toEqual(bareTime(22, 47, 59, 777));
    });
  });

  describe('bareTimeWith', () => {
    test('Invalid values', () => {
      expect(() => bareTimeWith(bareTime(), {millisecond: 1000})).toThrow();
      expect(() => bareTimeWith(bareTime(), {second: 60})).toThrow();
      expect(() => bareTimeWith(bareTime(), {minute: -1})).toThrow();
      expect(() => bareTimeWith(bareTime(), {hour: 24})).toThrow();
    });

    test('From midnight', () => {
      expect(bareTimeWith(bareTime(), {})).toMatchObject(bareTime());
      expect(bareTimeWith(bareTime(), {millisecond: 1})).toMatchObject(
        bareTime(0, 0, 0, 1)
      );
      expect(bareTimeWith(bareTime(), {millisecond: 59})).toMatchObject(
        bareTime(0, 0, 0, 59)
      );
      expect(bareTimeWith(bareTime(), {second: 1})).toMatchObject(
        bareTime(0, 0, 1)
      );
      expect(bareTimeWith(bareTime(), {second: 59})).toMatchObject(
        bareTime(0, 0, 59)
      );
      expect(bareTimeWith(bareTime(), {minute: 1})).toMatchObject(
        bareTime(0, 1)
      );
      expect(bareTimeWith(bareTime(), {minute: 59})).toMatchObject(
        bareTime(0, 59)
      );
      expect(
        bareTimeWith(bareTime(), {
          hour: 15,
          minute: 33,
          second: 57,
          millisecond: 123
        })
      ).toMatchObject(bareTime(15, 33, 57, 123));
    });

    test('From end of day', () => {
      expect(bareTimeWith(bareTime(23, 59, 59, 999), {})).toMatchObject(
        bareTime(23, 59, 59, 999)
      );
      expect(
        bareTimeWith(bareTime(23, 59, 59, 999), {millisecond: 1})
      ).toMatchObject(bareTime(23, 59, 59, 1));
      expect(
        bareTimeWith(bareTime(23, 59, 59, 999), {millisecond: 59})
      ).toMatchObject(bareTime(23, 59, 59, 59));
      expect(
        bareTimeWith(bareTime(23, 59, 59, 999), {second: 1})
      ).toMatchObject(bareTime(23, 59, 1, 999));
      expect(
        bareTimeWith(bareTime(23, 59, 59, 999), {second: 59})
      ).toMatchObject(bareTime(23, 59, 59, 999));
      expect(
        bareTimeWith(bareTime(23, 59, 59, 999), {minute: 1})
      ).toMatchObject(bareTime(23, 1, 59, 999));
      expect(
        bareTimeWith(bareTime(23, 59, 59, 999), {minute: 59})
      ).toMatchObject(bareTime(23, 59, 59, 999));
      expect(
        bareTimeWith(bareTime(23, 59, 59, 999), {
          hour: 15,
          minute: 33,
          second: 57,
          millisecond: 123
        })
      ).toMatchObject(bareTime(15, 33, 57, 123));
    });

    test('From during the day', () => {
      expect(bareTimeWith(bareTime(18, 47, 33, 714), {})).toMatchObject(
        bareTime(18, 47, 33, 714)
      );
      expect(
        bareTimeWith(bareTime(18, 47, 33, 714), {millisecond: 1})
      ).toMatchObject(bareTime(18, 47, 33, 1));
      expect(
        bareTimeWith(bareTime(18, 47, 33, 714), {millisecond: 59})
      ).toMatchObject(bareTime(18, 47, 33, 59));
      expect(
        bareTimeWith(bareTime(18, 47, 33, 714), {second: 1})
      ).toMatchObject(bareTime(18, 47, 1, 714));
      expect(
        bareTimeWith(bareTime(18, 47, 33, 714), {second: 59})
      ).toMatchObject(bareTime(18, 47, 59, 714));
      expect(
        bareTimeWith(bareTime(18, 47, 33, 714), {minute: 1})
      ).toMatchObject(bareTime(18, 1, 33, 714));
      expect(
        bareTimeWith(bareTime(18, 47, 33, 714), {minute: 59})
      ).toMatchObject(bareTime(18, 59, 33, 714));
      expect(
        bareTimeWith(bareTime(18, 47, 33, 714), {
          hour: 15,
          minute: 33,
          second: 57,
          millisecond: 123
        })
      ).toMatchObject(bareTime(15, 33, 57, 123));
    });
  });
});
