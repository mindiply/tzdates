import {
  bareDateTimeFrom,
  zonedDateTimeOf,
  TimeZone,
  timezoneOffset,
  cmpBareZonedDateTimes,
  fromBareDateTime
} from '../src/index';
import {intMod} from '../dist/mathutils';

const iterationInterest = 1.01;

async function main() {
  let startMs = new Date().getTime();
  let i = 0;
  for (const testTimezone of Object.values(TimeZone)) {
    for (
      let epochMs = -10e10, delta = 1000;
      epochMs < 1.3e10;
      epochMs += delta, delta = delta * iterationInterest, i++
    ) {
      timezoneOffset(testTimezone, epochMs);
    }
  }
  let endMs = new Date().getTime();
  console.log(
    `Completed offsets lookup in ${endMs - startMs} ms after ${i} iterations`
  );

  startMs = new Date().getTime();
  for (const testTimezone of Object.values(TimeZone)) {
    for (
      let epochMs = -10e10, delta = 1000;
      epochMs < 1.3e10;
      epochMs += delta, delta = delta * iterationInterest
    ) {
      bareDateTimeFrom(epochMs, testTimezone);
    }
  }
  endMs = new Date().getTime();
  let microSecsPerIteration = ((endMs - startMs) * 1000) / i;
  console.log(
    `Completed creation of bareDateTimes in ${
      endMs - startMs
    } ms after ${i} iterations, ${microSecsPerIteration} microSecs per iteration`
  );

  startMs = new Date().getTime();
  for (const testTimezone of Object.values(TimeZone)) {
    for (
      let epochMs = -10e10, delta = 1000;
      epochMs < 1.3e10;
      epochMs += delta, delta = delta * iterationInterest
    ) {
      zonedDateTimeOf(new Date(epochMs), testTimezone);
    }
  }
  endMs = new Date().getTime();
  microSecsPerIteration = ((endMs - startMs) * 1000) / i;
  console.log(
    `Completed creation of bareZonedDateTimes v2 in ${
      endMs - startMs
    } ms after ${i} iterations, ${microSecsPerIteration} microSecs per iteration`
  );
  startMs = new Date().getTime();
  let j = 0;
  for (const testTimezone of Object.values(TimeZone)) {
    for (let i = -10000; i < 10000; i += 1, j++) {
      const val = {
        year: i,
        month: intMod(Math.abs(i), 12) || 12,
        day: intMod(Math.abs(i), 28) || 28,
        hour: 12,
        minute: intMod(Math.abs(i), 60),
        second: intMod(Math.abs(i), 60),
        millisecond: intMod(Math.abs(i), 1000)
      };
      try {
        fromBareDateTime(val, testTimezone);
      } catch (err) {
        // console.log(`Invalid bare date time value in timezone ${testTimezone}`);
        // console.log(val);
      }
    }
  }
  endMs = new Date().getTime();
  microSecsPerIteration = ((endMs - startMs) * 1000) / j;
  console.log(
    `Completed creation of fromBareDateTime in ${
      endMs - startMs
    } ms after ${j} iterations, ${microSecsPerIteration} microSecs per iteration`
  );
}

main().then().catch();
