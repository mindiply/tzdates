import {IncorrectTimezoneData, TimeZoneData, UnpackedZoneBundle} from './types'

const BASE60 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX';
const EPSILON = 0.000001; // Used to fix floating point rounding errors

function packBase60Fraction(fraction: number, precision: number) {
  let buffer = '.',
    output = '',
    current;

  while (precision > 0) {
    precision -= 1;
    fraction *= 60;
    current = Math.floor(fraction + EPSILON);
    buffer += BASE60[current];
    fraction -= current;

    // Only add buffer to output once we have a non-zero value.
    // This makes '.000' output '', and '.100' output '.1'
    if (current) {
      output += buffer;
      buffer = '';
    }
  }

  return output;
}

function packBase60(number: number, precision: number): string {
  let output = '',
    absolute = Math.abs(number),
    whole = Math.floor(absolute),
    fraction = packBase60Fraction(absolute - whole, Math.min(~~precision, 10));

  while (whole > 0) {
    output = BASE60[whole % 60] + output;
    whole = Math.floor(whole / 60);
  }

  if (number < 0) {
    output = '-' + output;
  }

  if (output && fraction) {
    return output + fraction;
  }

  if (!fraction && output === '-') {
    return '0';
  }

  return output || fraction || '0';
}

/************************************
 Pack
 ************************************/

function packUntils(untils: Array<number | null>): string {
  const out: string[] = [];
  let last = 0;

  for (let i = 0; i < untils.length - 1; i++) {
    out[i] = packBase60(
      Math.round(((untils[i] as number) - last) / 1000) / 60,
      1
    );
    last = untils[i] as number;
  }

  return out.join(' ');
}

let maxNOffsets = 0;
function packOffsets(offsets: Array<number>): string {
  const allOffsets: Map<number, number> = new Map();
  const offsetsList: number[] = [];
  const offsetsIndexes: number[] = [];
  for (const offset of offsets) {
    if (!allOffsets.has(offset)) {
      allOffsets.set(offset, offsetsList.length);
      offsetsList.push(offset);
    }
    const offsetIndex = allOffsets.get(offset)!;
    offsetsIndexes.push(offsetIndex);
  }

  if (maxNOffsets < offsetsList.length) {
    maxNOffsets = offsetsList.length;
  }

  if (offsetsIndexes.length > allOffsets.size && allOffsets.size < 60) {
    return allOffsets.size <= 10
      ? `a${offsetsList
          .map(offsetVal => packBase60(Math.round(offsetVal * 60) / 60, 1))
          .join(' ')}*${offsetsIndexes.join('')}`
      : `b${offsetsList
          .map(offsetVal => packBase60(Math.round(offsetVal * 60) / 60, 1))
          .join(' ')}*${offsetsIndexes
          .map(offsetIndex => packBase60(Math.round(offsetIndex * 60) / 60, 1))
          .join('')}`;
  }
  return `c${offsets
    .map(offset => packBase60(Math.round(offset * 60) / 60, 1))
    .join(' ')}`;
}

export function packZonesData(zonesData: UnpackedZoneBundle): string {
  const data = zonesData.zones
    .map(zoneData => [
      zoneData.name,
      packOffsets(zoneData.offsets),
      packUntils(zoneData.untils)
    ])
    .join('|');
  console.log(`Max offsets list in zone ${maxNOffsets}`);
  return data;
}

function unpackBase60(string: string): number {
  var i = 0,
    parts = string.split('.'),
    whole = parts[0],
    fractional = parts[1] || '',
    multiplier = 1,
    num,
    out = 0,
    sign = 1;

  // handle negative numbers
  if (string.charCodeAt(0) === 45) {
    i = 1;
    sign = -1;
  }

  // handle digits before the decimal
  for (i; i < whole.length; i++) {
    num = charCodeToInt(whole.charCodeAt(i));
    out = 60 * out + num;
  }

  // handle digits after the decimal
  for (i = 0; i < fractional.length; i++) {
    multiplier = multiplier / 60;
    num = charCodeToInt(fractional.charCodeAt(i));
    out += num * multiplier;
  }

  return out * sign;
}

function charCodeToInt(charCode: number): number {
  if (charCode > 96) {
    return charCode - 87;
  } else if (charCode > 64) {
    return charCode - 29;
  }
  return charCode - 48;
}

const offsetsPartsRe = /a([0-9a-zA-Z-\.\s]+)\*([0-9a-zA-Z]+)/;
function unpackOffsets(packedOffsetsStr: string): number[] {
  const offsets: number[] = [];
  if (packedOffsetsStr[0] === 'a' || packedOffsetsStr[0] === 'b') {
    const parts = offsetsPartsRe.exec(packedOffsetsStr);
    if (parts) {
      const offsetsList = parts[1]
        .split(' ')
        .map(offsetStr => unpackBase60(offsetStr));
      for (const indexStr of parts[2]) {
        const index =
          offsetsList.length <= 10
            ? parseInt(indexStr)
            : unpackBase60(indexStr);
        offsets.push(offsetsList[index]);
      }
    }
  } else {
    return packedOffsetsStr
      .substr(1)
      .split(' ')
      .map(offsetStr => unpackBase60(offsetStr));
  }
  for (let i = 0; i < offsets.length; i++) {
    offsets[i] = offsets[i] === 0 ? 0 : 0 - offsets[i];
  }
  return offsets;
}

function unpackUntils(packedUntilsStr: string): Array<number> {
  const untilsVals = packedUntilsStr ? packedUntilsStr
    .split(' ')
    .map(untilStr => unpackBase60(untilStr)) : [];
  for (let i = 0; i < untilsVals.length; i++) {
    untilsVals[i] = Math.round(
      (untilsVals[i - 1] || 0) + untilsVals[i] * 60000
    ); // minutes to milliseconds
  }
  untilsVals.push(Infinity);
  return untilsVals;
}

function unpackZoneStr(zoneStr: string): TimeZoneData {
  const [zoneName, offsetsStr, untilsStr] = zoneStr.split(',');
  return {
    name: zoneName,
    untils: unpackUntils(untilsStr),
    offsets: unpackOffsets(offsetsStr)
  };
}

export function unpackZonesData(packedData: string): Map<string, TimeZoneData> {
  const zones = packedData.split('|').map(unpackZoneStr);
  for (const zone of zones) {
    if (zone.untils.length !== zone.offsets.length) {
      throw new IncorrectTimezoneData(`Incorrect data for zone ${zone.name}`);
    }
  }
  return new Map(zones.map(zone => [zone.name.toUpperCase(), zone]));
}
