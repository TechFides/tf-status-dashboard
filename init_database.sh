#!/bin/bash

set -e

node ace migration:run --force
node ace seed --files='TruncateSeeder.js' --force
node ace seed --files='ProjectExpModifierSeeder.js' --force
node ace seed --files='ProjectSeeder.js' --force
node ace seed --files='SitdownProjectRatingEnumSeeder.js' --force
node ace seed --files='SitdownSeeder.js' --force
node ace seed --files='UserSeeder.js' --force

node ace seed --files='SitdownProjectRatingSeeder.js' --force
node ace seed --files='MeetingTimeSeeder.js' --force
