# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

# [0.0.9] - 2026-01-04

## Added
- Added isValidBareDate, isValidBareTime, isValidBareDateTime functions to validate BareDate, BareTime and BareDateTime objects

# [0.0.8] - 2025-10-03

## Added
- Added today function that returns today's BareDate according to the system local time
- Added now function that returns current date and time as a BareDateTime according to the system local time

## Fixes
- Fixed bug in isoDayOfWeek of days before Jan 4th 1970 returning outside the 1-7 range

# [0.0.7] - 2025-09-24

## Fixes
- Fixed order of exports with types at the beginning of the exports list in package.json

# [0.0.6] - 2025-09-24

## Changes
- Updated timezone data to moment-timezone set 2025b
- Output is now in either cjs or esm, using the "exports" field in package.json
