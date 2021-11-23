import {
  bareTime,
  bareTimeAdd,
  bareTimeSubtract,
  bareTimeToString,
  bareTimeWith,
  bareTimesDistance,
  bareDuration
} from '../src';

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

describe('bareTimeToString', () => {
  test('Some examples', () => {
    expect(bareTimeToString(bareTime())).toBe('T00:00:00');
    expect(bareTimeToString(bareTime(23, 59, 59, 999))).toBe('T23:59:59.999');
    expect(bareTimeToString(bareTime(1, 9, 9, 79))).toBe('T01:09:09.079');
  });
});

describe('bareTimesDistance', () => {
  test('Zero and limits', () => {
    expect(bareTimesDistance(bareTime(), bareTime())).toMatchObject(
      bareDuration(0)
    );
    expect(
      bareTimesDistance(bareTime(23, 59, 59, 999), bareTime(23, 59, 59, 999))
    ).toMatchObject(bareDuration(0));
    expect(
      bareTimesDistance(bareTime(), bareTime(23, 59, 59, 999))
    ).toMatchObject(bareDuration(1, 0, 0, 0, 23, 59, 59, 999));
    expect(
      bareTimesDistance(bareTime(23, 59, 59, 999), bareTime())
    ).toMatchObject(bareDuration(-1, 0, 0, 0, 23, 59, 59, 999));
  });

  test('One component at a time', () => {
    expect(bareTimesDistance(bareTime(), bareTime(4))).toMatchObject(
      bareDuration(1, 0, 0, 0, 4)
    );
    expect(bareTimesDistance(bareTime(8), bareTime(4))).toMatchObject(
      bareDuration(-1, 0, 0, 0, 4)
    );
    expect(bareTimesDistance(bareTime(4, 12), bareTime(4, 45))).toMatchObject(
      bareDuration(1, 0, 0, 0, 0, 33)
    );
    expect(bareTimesDistance(bareTime(19), bareTime(18, 1))).toMatchObject(
      bareDuration(-1, 0, 0, 0, 0, 59)
    );
    expect(bareTimesDistance(bareTime(1, 4, 12), bareTime(1, 4, 45))).toMatchObject(
      bareDuration(1, 0, 0, 0, 0, 0, 33)
    );
    expect(bareTimesDistance(bareTime(19), bareTime(18, 59, 1))).toMatchObject(
      bareDuration(-1, 0, 0, 0, 0, 0, 59)
    );
    expect(bareTimesDistance(bareTime(1, 4, 45, 12), bareTime(1, 4, 45, 450))).toMatchObject(
      bareDuration(1, 0, 0, 0, 0, 0, 0, 438)
    );
    expect(bareTimesDistance(bareTime(19), bareTime(18, 59, 59, 122))).toMatchObject(
      bareDuration(-1, 0, 0, 0, 0, 0, 0, 878)
    );
  });

  test('Some examples', () => {
    expect(bareTimesDistance(bareTime(1, 4, 56, 12), bareTime(3))).toMatchObject(
      bareDuration(1, 0, 0, 0, 1, 55, 3, 988)
    );
    expect(bareTimesDistance(bareTime(19), bareTime(17, 19, 29, 122))).toMatchObject(
      bareDuration(-1, 0, 0, 0, 1, 40, 30, 878)
    );
  });
});
