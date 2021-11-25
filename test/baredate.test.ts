import {
  bareDate,
  bareDateAdd,
  bareDateWith,
  isLeapYear,
  toEpochDay,
  weeksBareDuration,
  bareDuration,
  bareDateOfEpochDay,
  bareDateSubtract,
  bareDatesDistance,
  bareDateToString
} from '../src';

describe('isLeapYear', () => {
  test('Valid leap years', () => {
    expect(isLeapYear(-400)).toBe(true);
    expect(isLeapYear(-4)).toBe(true);
    expect(isLeapYear(0)).toBe(true);
    expect(isLeapYear(1600)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2004)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
  });

  test('non leap years', () => {
    expect(isLeapYear(1)).toBe(false);
    expect(isLeapYear(-1)).toBe(false);
    expect(isLeapYear(-2)).toBe(false);
    expect(isLeapYear(-100)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2021)).toBe(false);
    expect(isLeapYear(2022)).toBe(false);
  });
});

describe('creation and validation', () => {
  test('throw on invalid dates', () => {
    expect(() => bareDate(0, 0.1)).toThrowError(TypeError);
    expect(() => bareDate(0, 1, -12)).toThrowError(TypeError);
    expect(() => bareDate(0, 2, 30)).toThrowError(TypeError);
    expect(() => bareDate(1600, 2, 28)).not.toThrowError();
    expect(() => bareDate(1600, 2, 29)).not.toThrowError();
    expect(() => bareDate(1600, 2, 30)).toThrowError(TypeError);
    expect(() => bareDate(2001, 2, 28)).not.toThrowError();
    expect(() => bareDate(2001, 2, 29)).toThrowError(TypeError);
    expect(() => bareDate(2000, 2, 29)).not.toThrowError(TypeError);
    expect(() => bareDate(2000, 2, 30)).toThrowError(TypeError);
    expect(() => bareDate(2004, 2, 29)).not.toThrowError(TypeError);
    expect(() => bareDate(2004, 2, 30)).toThrowError(TypeError);
  });

  test('some valid dates', () => {
    expect(bareDate()).toMatchObject({
      year: 1970,
      month: 1,
      day: 1
    });
    expect(bareDate(0, 1, 12)).toMatchObject({
      year: 0,
      month: 1,
      day: 12
    });
    expect(bareDate(2000, 2, 29)).toMatchObject({
      year: 2000,
      month: 2,
      day: 29
    });
    expect(bareDate(1600, 2, 29)).toMatchObject({
      year: 1600,
      month: 2,
      day: 29
    });
    expect(bareDate(2100, 3, 29)).toMatchObject({
      year: 2100,
      month: 3,
      day: 29
    });
    expect(bareDate(2022, 5, 15)).toMatchObject({
      year: 2022,
      month: 5,
      day: 15
    });
  });
});

describe('bareDateWith', () => {
  test('Years only', () => {
    expect(bareDateWith(bareDate(2022, 12, 22), {})).toMatchObject({
      year: 2022,
      month: 12,
      day: 22
    });
    expect(bareDateWith(bareDate(2022, 12, 22), {year: 2020})).toMatchObject({
      year: 2020,
      month: 12,
      day: 22
    });
    expect(bareDateWith(bareDate(2022, 12, 22), {year: 3000})).toMatchObject({
      year: 3000,
      month: 12,
      day: 22
    });
    expect(bareDateWith(bareDate(2022, 12, 22), {year: 0})).toMatchObject({
      year: 0,
      month: 12,
      day: 22
    });
    expect(bareDateWith(bareDate(2022, 12, 22), {year: -1})).toMatchObject({
      year: -1,
      month: 12,
      day: 22
    });
  });

  test('Months only', () => {
    expect(bareDateWith(bareDate(2022, 12, 22), {month: 12})).toMatchObject({
      year: 2022,
      month: 12,
      day: 22
    });
    expect(bareDateWith(bareDate(2022, 12, 22), {month: 1})).toMatchObject({
      year: 2022,
      month: 1,
      day: 22
    });
    expect(bareDateWith(bareDate(2022, 12, 31), {month: 2})).toMatchObject({
      year: 2022,
      month: 2,
      day: 28
    });
    expect(bareDateWith(bareDate(2022, 12, 31), {month: 11})).toMatchObject({
      year: 2022,
      month: 11,
      day: 30
    });
    expect(bareDateWith(bareDate(2022, 12, 22), {month: 5})).toMatchObject({
      year: 2022,
      month: 5,
      day: 22
    });
  });

  test('Days only', () => {
    expect(bareDateWith(bareDate(2022, 12, 22), {day: 22})).toMatchObject({
      year: 2022,
      month: 12,
      day: 22
    });
    expect(bareDateWith(bareDate(2022, 12, 22), {day: 1})).toMatchObject({
      year: 2022,
      month: 12,
      day: 1
    });
    expect(bareDateWith(bareDate(2022, 12, 31), {day: 2})).toMatchObject({
      year: 2022,
      month: 12,
      day: 2
    });
    expect(bareDateWith(bareDate(2022, 2, 3), {day: 31})).toMatchObject({
      year: 2022,
      month: 2,
      day: 28
    });
    expect(bareDateWith(bareDate(2020, 2, 22), {day: 31})).toMatchObject({
      year: 2020,
      month: 2,
      day: 29
    });
  });

  test('Mix', () => {
    expect(
      bareDateWith(bareDate(2022, 12, 22), {year: 2000, day: 21})
    ).toMatchObject({
      year: 2000,
      month: 12,
      day: 21
    });
    expect(
      bareDateWith(bareDate(2022, 12, 22), {month: 3, day: 1})
    ).toMatchObject({
      year: 2022,
      month: 3,
      day: 1
    });
    expect(
      bareDateWith(bareDate(2022, 12, 31), {year: 2, month: 3})
    ).toMatchObject({
      year: 2,
      month: 3,
      day: 31
    });
    expect(
      bareDateWith(bareDate(2022, 12, 30), {year: 2024, month: 2})
    ).toMatchObject({
      year: 2024,
      month: 2,
      day: 29
    });
    expect(
      bareDateWith(bareDate(2020, 2, 22), {year: 2014, month: 9, day: 31})
    ).toMatchObject({
      year: 2014,
      month: 9,
      day: 30
    });
  });
});

describe('toEpochDate and back', () => {
  expect(toEpochDay(bareDate(0, 1, 1))).toBe(0 - (146097 * 5 - (30 * 365 + 7)));
  expect(toEpochDay(bareDate(0, 1, 2))).toBe(
    0 - (146097 * 5 - (30 * 365 + 7)) + 1
  );
  expect(toEpochDay(bareDate(-1, 12, 31))).toBe(
    0 - (146097 * 5 - (30 * 365 + 7)) - 1
  );
  expect(bareDateOfEpochDay(0 - (146097 * 5 - (30 * 365 + 7)) - 1)).toMatchObject(
    bareDate(-1, 12, 31)
  );
  expect(toEpochDay(bareDate(-1, 12, 30))).toBe(
    0 - (146097 * 5 - (30 * 365 + 7)) - 2
  );
  expect(toEpochDay(bareDate(-1, 1, 1))).toBe(
    0 - (146097 * 5 - (30 * 365 + 7)) - 365
  );
  expect(bareDateOfEpochDay(toEpochDay(bareDate(-1, 1, 1)))).toMatchObject(
    bareDate(-1, 1, 1)
  );
  expect(bareDateOfEpochDay(0 - (146097 * 5 - (30 * 365 + 7)))).toMatchObject(
    bareDate(0, 1, 1)
  );
  expect(toEpochDay(bareDate(-1, 1, 1))).toBe(
    0 - 365 - (146097 * 5 - (30 * 365 + 7))
  );
  expect(
    bareDateOfEpochDay(0 - 365 - (146097 * 5 - (30 * 365 + 7)))
  ).toMatchObject(bareDate(-1, 1, 1));
  expect(toEpochDay(bareDate(-2, 1, 1))).toBe(
    0 - 2 * 365 - (146097 * 5 - (30 * 365 + 7))
  );
  expect(
    bareDateOfEpochDay(0 - 2 * 365 - (146097 * 5 - (30 * 365 + 7)))
  ).toMatchObject(bareDate(-2, 1, 1));
  expect(toEpochDay(bareDate(-3, 1, 1))).toBe(
    0 - 3 * 365 - (146097 * 5 - (30 * 365 + 7))
  );
  expect(toEpochDay(bareDate(-4, 1, 1))).toBe(
    0 - (4 * 365 + 1) - (146097 * 5 - (30 * 365 + 7))
  );
  expect(toEpochDay(bareDate(-5, 1, 1))).toBe(
    0 - (5 * 365 + 1) - (146097 * 5 - (30 * 365 + 7))
  );
  expect(toEpochDay(bareDate(-400, 1, 1))).toBe(
    0 - 146097 - (146097 * 5 - (30 * 365 + 7))
  );
  expect(
    bareDateOfEpochDay(0 - 146097 - (146097 * 5 - (30 * 365 + 7)))
  ).toMatchObject(bareDate(-400, 1, 1));
  expect(toEpochDay(bareDate(-405, 1, 1))).toBe(
    0 - (5 * 365 + 1) - 146097 - (146097 * 5 - (30 * 365 + 7))
  );
  expect(
    bareDateOfEpochDay(
      0 - (5 * 365 + 1) - 146097 - (146097 * 5 - (30 * 365 + 7))
    )
  ).toMatchObject(bareDate(-405, 1, 1));
  expect(toEpochDay(bareDate(1970, 1, 1))).toBe(0);
  expect(bareDateOfEpochDay(0)).toMatchObject(bareDate(1970, 1, 1));
  expect(bareDateOfEpochDay(toEpochDay(bareDate(2022, 1, 1)))).toMatchObject(
    bareDate(2022, 1, 1)
  );
  expect(
    bareDateOfEpochDay(toEpochDay(bareDate(2022, 1, 1)) + 1)
  ).toMatchObject(bareDate(2022, 1, 2));
  expect(
    bareDateOfEpochDay(toEpochDay(bareDate(2020, 1, 1)) + 1)
  ).toMatchObject(bareDate(2020, 1, 2));
  expect(
    bareDateOfEpochDay(toEpochDay(bareDate(2022, 1, 1)) - 1)
  ).toMatchObject(bareDate(2021, 12, 31));
  expect(
    bareDateOfEpochDay(toEpochDay(bareDate(2023, 1, 1)) - 1)
  ).toMatchObject(bareDate(2022, 12, 31));
  expect(toEpochDay(bareDate(2021, 11, 16))).not.toBe(
    toEpochDay(bareDate(2021, 12, 16))
  );
  const nov16 = toEpochDay(bareDate(2021, 11, 16));
  expect(bareDateOfEpochDay(nov16)).toMatchObject(bareDate(2021, 11, 16));
  expect(bareDateOfEpochDay(toEpochDay(bareDate(2021, 11, 17)))).toMatchObject(
    bareDate(2021, 11, 17)
  );
  expect(bareDateOfEpochDay(toEpochDay(bareDate(2021, 11, 18)))).toMatchObject(
    bareDate(2021, 11, 18)
  );
  expect(
    bareDateOfEpochDay(toEpochDay(bareDate(2021, 11, 16)) + 1)
  ).toMatchObject(bareDate(2021, 11, 17));
});

describe('barTimeAdd', () => {
  test('Simple additions', () => {
    expect(bareDateAdd(bareDate(2021, 11, 16), bareDuration(1))).toMatchObject(
      bareDate(2021, 11, 16)
    );
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 1))
    ).toMatchObject(bareDate(2022, 11, 16));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 0, 1))
    ).toMatchObject(bareDate(2021, 12, 16));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 1))
    ).toMatchObject(bareDate(2021, 11, 17));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), weeksBareDuration(1, 1))
    ).toMatchObject(bareDate(2021, 11, 23));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 1, 1, 1))
    ).toMatchObject(bareDate(2022, 12, 17));
  });
  test('Overflowing additions', () => {
    expect(
      bareDateAdd(bareDate(2019, 12), bareDuration(1, 0, 1))
    ).toMatchObject(bareDate(2020, 1, 1));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 12, 22, 10))
    ).toMatchObject(bareDate(2035, 9, 26));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 42))
    ).toMatchObject(bareDate(2021, 12, 28));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 52))
    ).toMatchObject(bareDate(2022, 1, 7));
    expect(
      bareDateAdd(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 365))
    ).toMatchObject(bareDate(2022, 11, 16));
    expect(
      bareDateAdd(bareDate(2023, 11, 16), bareDuration(1, 0, 0, 365))
    ).toMatchObject(bareDate(2024, 11, 15));
  });
  test('Adding negative ranges', () => {
    expect(
      bareDateAdd(bareDate(2024, 11, 16), bareDuration(-1, 0, 0, 365))
    ).toMatchObject(bareDate(2023, 11, 17));
  });
});

describe('barTimeSubtract', () => {
  test('Simple subtractions', () => {
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1))
    ).toMatchObject(bareDate(2021, 11, 16));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 1))
    ).toMatchObject(bareDate(2020, 11, 16));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 0, 1))
    ).toMatchObject(bareDate(2021, 10, 16));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 1))
    ).toMatchObject(bareDate(2021, 11, 15));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), weeksBareDuration(1, 1))
    ).toMatchObject(bareDate(2021, 11, 9));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 1, 1, 1))
    ).toMatchObject(bareDate(2020, 10, 15));
  });
  test('Overflowing subtractions', () => {
    expect(
      bareDateSubtract(bareDate(2021), bareDuration(1, 0, 1))
    ).toMatchObject(bareDate(2020, 12, 1));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 12, 22, 10))
    ).toMatchObject(bareDate(2008, 1, 6));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 42))
    ).toMatchObject(bareDate(2021, 10, 5));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 52))
    ).toMatchObject(bareDate(2021, 9, 25));
    expect(
      bareDateSubtract(bareDate(2021, 11, 16), bareDuration(1, 0, 0, 365))
    ).toMatchObject(bareDate(2020, 11, 16));
    expect(
      bareDateSubtract(bareDate(2024, 11, 16), bareDuration(1, 0, 0, 365))
    ).toMatchObject(bareDate(2023, 11, 17));
  });
  test('Subtracting negative ranges', () => {
    expect(
      bareDateSubtract(bareDate(2024, 11, 16), bareDuration(-1, 0, 0, 365))
    ).toMatchObject(bareDate(2025, 11, 16));
  });
});

describe('bareDatesDistance', () => {
  test('Various distances', () => {
    expect(
      bareDatesDistance(bareDate(2022, 1, 1), bareDate(2022, 1, 1))
    ).toMatchObject(bareDuration(0));
    expect(
      bareDatesDistance(bareDate(2022, 1, 1), bareDate(2022, 1, 2))
    ).toMatchObject(bareDuration(1, 0, 0, 1));
    expect(
      bareDatesDistance(bareDate(2022, 1, 1), bareDate(2021, 12, 31))
    ).toMatchObject(bareDuration(-1, 0, 0, 1));
    expect(
      bareDatesDistance(bareDate(2021, 12, 1), bareDate(2021, 12, 31))
    ).toMatchObject(bareDuration(1, 0, 0, 30));
    expect(
      bareDatesDistance(bareDate(2021, 12, 31), bareDate(2021, 12, 1))
    ).toMatchObject(bareDuration(-1, 0, 0, 30));
    expect(
      bareDatesDistance(bareDate(2021, 12, 1), bareDate(2022, 12, 31))
    ).toMatchObject(bareDuration(1, 0, 0, 365 + 30));
    expect(
      bareDatesDistance(bareDate(2022, 12, 31), bareDate(2021, 12, 1))
    ).toMatchObject(bareDuration(-1, 0, 0, 365 + 30));
  });

  test('Using rounding options', () => {
    expect(
      bareDatesDistance(bareDate(2020, 11, 5), bareDate(2021, 12, 31), {
        largestUnit: 'year',
        smallestUnit: 'day'
      })
    ).toMatchObject(bareDuration(1, 1, 1, 26));
    expect(
      bareDatesDistance(bareDate(2020, 11, 26), bareDate(2021, 12, 5), {
        largestUnit: 'year',
        smallestUnit: 'day'
      })
    ).toMatchObject(bareDuration(1, 1, 0, 9));
    expect(
      bareDatesDistance(bareDate(2020, 11, 5), bareDate(2021, 12, 31), {
        largestUnit: 'year',
        smallestUnit: 'month'
      })
    ).toMatchObject(bareDuration(1, 1, 1));
    expect(
      bareDatesDistance(bareDate(2020, 11, 26), bareDate(2021, 12, 5), {
        largestUnit: 'year',
        smallestUnit: 'month',
        roundingMode: 'ceil'
      })
    ).toMatchObject(bareDuration(1, 1, 1));
    expect(
      bareDatesDistance(bareDate(2020, 11, 26), bareDate(2021, 12, 5), {
        largestUnit: 'year',
        smallestUnit: 'month',
        roundingMode: 'halfExpand'
      })
    ).toMatchObject(bareDuration(1, 1, 0));
    expect(
      bareDatesDistance(bareDate(2020, 11, 5), bareDate(2021, 12, 31), {
        largestUnit: 'year',
        smallestUnit: 'month'
      })
    ).toMatchObject(bareDuration(1, 1, 1));
    expect(
      bareDatesDistance(bareDate(2021, 9, 26), bareDate(2020, 10, 5), {
        largestUnit: 'year',
        smallestUnit: 'year',
      })
    ).toMatchObject(bareDuration(0));
    expect(
      bareDatesDistance(bareDate(2021, 9, 26), bareDate(2020, 10, 5), {
        largestUnit: 'year',
        smallestUnit: 'year',
        roundingMode: 'halfExpand'
      })
    ).toMatchObject(bareDuration(-1, 1));
  })
});

describe('bareDateToString', () => {
  test('A few examples', () => {
    expect(bareDateToString(bareDate(0))).toBe('0000-01-01');
    expect(bareDateToString(bareDate())).toBe('1970-01-01');
    expect(bareDateToString(bareDate(2100, 12, 31))).toBe('2100-12-31');
    expect(bareDateToString(bareDate(21001, 10, 21))).toBe('21001-10-21');
    expect(bareDateToString(bareDate(-102, 1, 1))).toBe('-0102-01-01');
  });
});
