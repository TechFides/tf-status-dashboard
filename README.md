# From zero to hero

## Introduction
Little project tracking app that I made for fun at home. I use it to track progress on projects with several people.
It lets you define projects, score them from 1 to 5 rank, define sticky notes that you can use to track goals for your projects etc. It is not production-ready, but it can be useful as an internal tool.

Dev stack is Adonis with Nuxt and MySQL.

## Get started
1. Run `npm i --global @adonisjs/cli`.
2. Copy `.env.example` to `.env` and setup proper values.
3. Run `npm install`.

## Database
* Run `init_database.sh` inside docker (otherwise it will fail).
* If you need to refresh database, you can run `npx adonis migration:refresh`.
* Default dev application account is `admin` / `admin`

## Weekly feedback emails
* Application sends a feedback email to every user that has an email once a week. The day of the week and the time are specified
using SystemParam entity with the `feedbackCrontab` key in the database. Emails are sent via https://sendgrid.com/ and the job is scheduled using 
the `node-schedule` library. The value of the feedback's crontab can be changed by admin on the settings page of the application.
* Email template is located in the `./assets/email-templates` folder and is written using Handlebars syntax.
* Here you can read more about [node-schedule](https://www.npmjs.com/package/node-schedule).
