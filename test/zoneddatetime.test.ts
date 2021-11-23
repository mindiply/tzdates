import {
  bareDateTime,
  fromBareDateTime,
  TimeZone,
  zonedDateTimeAdd,
  zonedDateTimeOf,
  zonedDateTimeSubtract,
  MILLIS_PER_SECOND,
  bareDuration
} from '../src';

describe('constructors', () => {
  describe('fromBareDateTime', () => {
    test('UTC construction', () => {
      expect(fromBareDateTime(bareDateTime(0), TimeZone.UTC)).toMatchObject({
        ...bareDateTime(0),
        timezone: TimeZone.UTC,
        utcOffsetSeconds: 0,
        epochMilli: Date.UTC(-1, 11, 31, 23, 59, 59, 999) + 1
      });
      expect(fromBareDateTime(bareDateTime(), TimeZone.UTC)).toMatchObject({
        ...bareDateTime(),
        timezone: TimeZone.UTC,
        utcOffsetSeconds: 0,
        epochMilli: 0
      });
      expect(
        fromBareDateTime(bareDateTime(2022, 1, 1), TimeZone.UTC)
      ).toMatchObject({
        ...bareDateTime(2022, 1, 1),
        timezone: TimeZone.UTC,
        utcOffsetSeconds: 0,
        epochMilli: Date.UTC(2022, 0, 1)
      });
    });
    test('Europe/Rome construction', () => {
      expect(
        fromBareDateTime(bareDateTime(0), TimeZone.EUROPE__ROME)
      ).toMatchObject({
        ...bareDateTime(0),
        timezone: TimeZone.EUROPE__ROME,
        utcOffsetSeconds: 60 * 60,
        epochMilli:
          Date.UTC(-1, 11, 31, 23, 59, 59, 999) +
          1 -
          60 * 60 * MILLIS_PER_SECOND
      });
      expect(
        fromBareDateTime(bareDateTime(), TimeZone.EUROPE__ROME)
      ).toMatchObject({
        ...bareDateTime(),
        timezone: TimeZone.EUROPE__ROME,
        utcOffsetSeconds: 60 * 60,
        epochMilli: 0 - 60 * 60 * MILLIS_PER_SECOND
      });
      expect(
        fromBareDateTime(bareDateTime(2022, 1, 1), TimeZone.EUROPE__ROME)
      ).toMatchObject({
        ...bareDateTime(2022, 1, 1),
        timezone: TimeZone.EUROPE__ROME,
        utcOffsetSeconds: 60 * 60,
        epochMilli: Date.UTC(2022, 0, 1) - 60 * 60 * MILLIS_PER_SECOND
      });
      expect(
        fromBareDateTime(bareDateTime(2022, 8, 1), TimeZone.EUROPE__ROME)
      ).toMatchObject({
        ...bareDateTime(2022, 8, 1),
        timezone: TimeZone.EUROPE__ROME,
        utcOffsetSeconds: 2 * 60 * 60,
        epochMilli: Date.UTC(2022, 7, 1) - 2 * 60 * 60 * MILLIS_PER_SECOND
      });
    });
    test('America/New_York construction', () => {
      expect(
        fromBareDateTime(bareDateTime(0), TimeZone.AMERICA__NEW_YORK)
      ).toMatchObject({
        ...bareDateTime(0),
        timezone: TimeZone.AMERICA__NEW_YORK,
        utcOffsetSeconds: -5 * 60 * 60,
        epochMilli:
          Date.UTC(-1, 11, 31, 23, 59, 59, 999) +
          1 +
          5 * 60 * 60 * MILLIS_PER_SECOND
      });
      expect(
        fromBareDateTime(bareDateTime(), TimeZone.AMERICA__NEW_YORK)
      ).toMatchObject({
        ...bareDateTime(),
        timezone: TimeZone.AMERICA__NEW_YORK,
        utcOffsetSeconds: -5 * 60 * 60,
        epochMilli: 0 + 5 * 60 * 60 * MILLIS_PER_SECOND
      });
      expect(
        fromBareDateTime(bareDateTime(2022, 1, 1), TimeZone.AMERICA__NEW_YORK)
      ).toMatchObject({
        ...bareDateTime(2022, 1, 1),
        timezone: TimeZone.AMERICA__NEW_YORK,
        utcOffsetSeconds: -5 * 60 * 60,
        epochMilli: Date.UTC(2022, 0, 1) + 5 * 60 * 60 * MILLIS_PER_SECOND
      });
      expect(
        fromBareDateTime(bareDateTime(2022, 8, 1), TimeZone.AMERICA__NEW_YORK)
      ).toMatchObject({
        ...bareDateTime(2022, 8, 1),
        timezone: TimeZone.AMERICA__NEW_YORK,
        utcOffsetSeconds: -4 * 60 * 60,
        epochMilli: Date.UTC(2022, 7, 1) + 4 * 60 * 60 * MILLIS_PER_SECOND
      });
    });
  });

  describe('zonedDateTimeOf', function () {
    test('Boundaries and zeros checks', () => {
      expect(
        zonedDateTimeOf(
          (0 - (146097 * 5 - (30 * 365 + 7)) - 1) * 24 * 3600 * 1000,
          TimeZone.UTC
        )
      ).toMatchObject(fromBareDateTime(bareDateTime(-1, 12, 31), TimeZone.UTC));
    });
  });
});

describe('zonedDateTimeAdd', () => {
  test('Zero additions', () => {
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(0), TimeZone.UTC),
        bareDuration(0)
      )
    ).toMatchObject(fromBareDateTime(bareDateTime(0), TimeZone.UTC));
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(), TimeZone.EUROPE__ROME),
        bareDuration(1)
      )
    ).toMatchObject(fromBareDateTime(bareDateTime(), TimeZone.EUROPE__ROME));
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK),
        bareDuration(-1)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK)
    );
  });

  test('Date only additions', () => {
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(0), TimeZone.UTC),
        bareDuration(1, 1)
      )
    ).toMatchObject(fromBareDateTime(bareDateTime(1), TimeZone.UTC));
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(1970), TimeZone.EUROPE__ROME),
        bareDuration(1, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(1970, 2, 1), TimeZone.EUROPE__ROME)
    );
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK),
        bareDuration(1, 0, 0, 2)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(2025, 1, 3), TimeZone.AMERICA__NEW_YORK)
    );
  });

  test('Simple time only additions', () => {
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(0), TimeZone.UTC),
        bareDuration(1, 0, 0, 0, 1)
      )
    ).toMatchObject(fromBareDateTime(bareDateTime(0, 1, 1, 1), TimeZone.UTC));
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(1970), TimeZone.EUROPE__ROME),
        bareDuration(1, 0, 0, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(1970, 1, 1, 0, 1), TimeZone.EUROPE__ROME)
    );
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK),
        bareDuration(1, 0, 0, 0, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2025, 1, 1, 0, 0, 1),
        TimeZone.AMERICA__NEW_YORK
      )
    );
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(bareDateTime(2025), TimeZone.ASIA__TOKYO),
        bareDuration(1, 0, 0, 0, 48, 25, 31, 999)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2025, 1, 3, 0, 25, 31, 999),
        TimeZone.ASIA__TOKYO
      )
    );
  });

  test('Time and date additions, with daylight saving changes', () => {
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(
          bareDateTime(2025, 3, 8, 23, 59, 59, 998),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 2, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2025, 3, 9, 1, 59, 59, 999),
        TimeZone.AMERICA__LOS_ANGELES
      )
    );
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(
          bareDateTime(2025, 3, 8, 23, 59, 59, 999),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 2, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2025, 3, 9, 3),
        TimeZone.AMERICA__LOS_ANGELES
      )
    );
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(
          bareDateTime(2004, 10, 30, 12),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 14)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2004, 10, 31, 1),
        TimeZone.AMERICA__LOS_ANGELES
      )
    );
    expect(
      zonedDateTimeAdd(
        fromBareDateTime(
          bareDateTime(2004, 10, 30, 12),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 13, 59, 59, 999)
      )
    ).toMatchObject(bareDateTime(2004, 10, 31, 1, 59, 59, 999));
  });
});

describe('zonedDateTimeSubtract', () => {
  test('Zero subtractions', () => {
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(0), TimeZone.UTC),
        bareDuration(0)
      )
    ).toMatchObject(fromBareDateTime(bareDateTime(0), TimeZone.UTC));
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(), TimeZone.EUROPE__ROME),
        bareDuration(1)
      )
    ).toMatchObject(fromBareDateTime(bareDateTime(), TimeZone.EUROPE__ROME));
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK),
        bareDuration(-1)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK)
    );
  });

  test('Date only subtractions', () => {
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(0), TimeZone.UTC),
        bareDuration(1, 1)
      )
    ).toMatchObject(fromBareDateTime(bareDateTime(-1), TimeZone.UTC));
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(1970), TimeZone.EUROPE__ROME),
        bareDuration(1, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(1969, 12, 1), TimeZone.EUROPE__ROME)
    );
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK),
        bareDuration(1, 0, 0, 2)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(2024, 12, 30), TimeZone.AMERICA__NEW_YORK)
    );
  });

  test('Simple time only subtractions', () => {
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(0), TimeZone.UTC),
        bareDuration(1, 0, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(bareDateTime(-1, 12, 31, 23), TimeZone.UTC)
    );
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(1970), TimeZone.EUROPE__ROME),
        bareDuration(1, 0, 0, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(1969, 12, 31, 23, 59),
        TimeZone.EUROPE__ROME
      )
    );
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(2025), TimeZone.AMERICA__NEW_YORK),
        bareDuration(1, 0, 0, 0, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2024, 12, 31, 23, 59, 59),
        TimeZone.AMERICA__NEW_YORK
      )
    );
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(bareDateTime(2025), TimeZone.ASIA__TOKYO),
        bareDuration(1, 0, 0, 0, 48, 25, 31, 999)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2024, 12, 29, 23, 34, 28, 1),
        TimeZone.ASIA__TOKYO
      )
    );
  });

  test('Time and date subtractions, with daylight saving changes', () => {
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(
          bareDateTime(2025, 3, 9, 1, 59, 59, 999),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 2, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2025, 3, 8, 23, 59, 59, 998),
        TimeZone.AMERICA__LOS_ANGELES
      )
    );
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(
          bareDateTime(2025, 3, 9, 3),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 2, 0, 0, 1)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2025, 3, 8, 23, 59, 59, 999),
        TimeZone.AMERICA__LOS_ANGELES
      )
    );
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(
          bareDateTime(2004, 10, 31, 3),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 14)
      )
    ).toMatchObject(
      fromBareDateTime(
        bareDateTime(2004, 10, 30, 14),
        TimeZone.AMERICA__LOS_ANGELES
      )
    );
    expect(
      zonedDateTimeSubtract(
        fromBareDateTime(
          bareDateTime(2004, 10, 31, 1, 59, 59, 999),
          TimeZone.AMERICA__LOS_ANGELES
        ),
        bareDuration(1, 0, 0, 0, 13, 59, 59, 999)
      )
    ).toMatchObject(bareDateTime(2004, 10, 30, 13));
  });
});
