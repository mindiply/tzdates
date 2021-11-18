import {bareDateTimeFrom, bareZoneDateTimeOf, bareZonedDateTimeFrom, TimeZone, timezoneOffset} from '../dist/index.js'
import {cmpBareZonedDateTimes} from '../dist/zoneddatetime.js'

const iterationInterest = 1.001;

async function main() {
  let startMs = (new Date()).getTime();
  let i = 0
  for (const testTimezone of Object.values(TimeZone)) {
    for (let epochMs = -10e10, delta = 1000; epochMs < 1.3e10; epochMs += delta, delta = delta * iterationInterest, i++) {
      timezoneOffset(testTimezone, epochMs);
    }
  }
  let endMs = (new Date()).getTime();
  console.log(`Completed offsets lookup in ${endMs - startMs} ms after ${i} iterations`);

  startMs = (new Date()).getTime();
  for (const testTimezone of Object.values(TimeZone)) {
    for (let epochMs = -10e10, delta = 1000; epochMs < 1.3e10; epochMs += delta, delta = delta * iterationInterest) {
      bareDateTimeFrom(new Date(epochMs), testTimezone);
    }
  }
  endMs = (new Date()).getTime();
  let microSecsPerIteration = (endMs - startMs) * 1000 / i;
  console.log(`Completed creation of bareDateTimes in ${endMs - startMs} ms after ${i} iterations, ${microSecsPerIteration} microSecs per iteration`);

  startMs = (new Date()).getTime();
  for (const testTimezone of Object.values(TimeZone)) {
    for (let epochMs = -10e10, delta = 1000; epochMs < 1.3e10; epochMs += delta, delta = delta * iterationInterest) {
      bareZonedDateTimeFrom(new Date(epochMs), testTimezone);
    }
  }
  endMs = (new Date()).getTime();
  microSecsPerIteration = (endMs - startMs) * 1000 / i;
  console.log(`Completed creation of bareZonedDateTimes in ${endMs - startMs} ms after ${i} iterations, ${microSecsPerIteration} microSecs per iteration`);

  startMs = (new Date()).getTime();
  for (const testTimezone of Object.values(TimeZone)) {
    for (let epochMs = -10e10, delta = 1000; epochMs < 1.3e10; epochMs += delta, delta = delta * iterationInterest) {
      bareZoneDateTimeOf(new Date(epochMs), testTimezone);
    }
  }
  endMs = (new Date()).getTime();
  microSecsPerIteration = (endMs - startMs) * 1000 / i;
  console.log(`Completed creation of bareZonedDateTimes v2 in ${endMs - startMs} ms after ${i} iterations, ${microSecsPerIteration} microSecs per iteration`);

  for (const testTimezone of Object.values(TimeZone)) {
    for (let epochMs = -10e10, delta = 1000; epochMs < 1.3e10; epochMs += delta, delta = delta * iterationInterest) {
      const v1 = bareZonedDateTimeFrom(new Date(epochMs), testTimezone);
      const v2 = bareZoneDateTimeOf(new Date(epochMs), testTimezone);
      if (cmpBareZonedDateTimes(v1, v2) !== 0) {
        throw new Error('Should return the same value');
      }
    }
  }
}

main().then().catch();
