#!/bin/bash

set -e

npx adonis migration:run --force
npx adonis seed --files='TruncateSeeder.js' --force
npx adonis seed --files='ProjectExpModifierSeeder.js' --force
npx adonis seed --files='ProjectSeeder.js' --force
npx adonis seed --files='SitdownProjectRatingEnumSeeder.js' --force
npx adonis seed --files='SitdownSeeder.js' --force
npx adonis seed --files='UserSeeder.js' --force

npx adonis seed --files='SitdownProjectRatingSeeder.js' --force
npx adonis seed --files='MeetingTimeSeeder.js' --force
