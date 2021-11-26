# tzdates

Compact timezone conscious date library build for speed.
If you don't need to compute hundreds/thousand of date operations
in a second, you are probably better of with date-fns or js-joda.


## Timezone Offsets

Provides a single function to know the offset (in minutes) of a certain timezone at an instant in time,
represented as number of milliseconds since the epoch:


        timezoneOffset(ianaTimezone: string, millisFromEpoch: number): number

For Asia x minutes ahead of UTC, for America x seconds behind UTC (negative).

For timezones that are not recognized, we throw an exception.

The library uses the IANA datasets as published by [moment-timezone](https://www.npmjs.com/package/moment-timezone).

## Licence
MIT
