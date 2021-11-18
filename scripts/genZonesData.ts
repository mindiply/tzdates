import {writeFile, readFile} from 'fs/promises';
import {Buffer} from 'buffer';
import type {TimeZoneData, UnpackedZoneBundle} from '../src/types';
import {join} from 'path';
import {packZonesData} from '../src/tzDataSerialization';

async function main() {
  const tzdnJsonStr = await readFile(
    join(__dirname, '../data/latest.json'),
    'utf-8'
  );
  const tzdbData = JSON.parse(tzdnJsonStr) as UnpackedZoneBundle;
  const timezones = tzdbData.zones.map(zone => zone.name).sort().map(zoneName => `  ${zoneName.toUpperCase().replaceAll('/', '__').replaceAll('-', '__').replaceAll('+', '_P_')} = '${zoneName}'`).join(',\n');
  const timezonesStr = `export enum TimeZone {\n${timezones}\n}\n`;
  await Promise.all([writeFile(
    join(__dirname, '../src/zonesData.ts'),
    Buffer.from(`export const tzdbPackedData = ${JSON.stringify(packZonesData(tzdbData))};\n`, 'utf-8')
  ),
    writeFile(
      join(__dirname, '../src/timezones.ts'),
      Buffer.from(timezonesStr, 'utf-8')
    )]);
}

main().then().catch();
