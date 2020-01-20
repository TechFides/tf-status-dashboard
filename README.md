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

## Deployment
* Login to the application is possible via google accounts. For this is necessary several steps.
* At first create project in your [google cloud console](https://console.cloud.google.com/cloud-resource-manager)
and configure it.
* In addition, in the newly created project set your authorized Javascript origin and authorized redirect URI.
* For example: 
    - localhost:3333
    - localhost:3333/authenticated/google  
* Finally set SECRET and CLIENT_ID keys to env file. This keys can be find in google console too. 
* Example of this keys:
    - GOOGLE_CLIENT_ID=53044...apps.googleusercontent.com
    - GOOGLE_CLIENT_SECRET=w6Xac...
* More detailed guide can be find [here](https://cloud.google.com/resource-manager/docs/creating-managing-projects).

- Accounts in Dashboard can be synchronize with Gsuite via script `GoogleAccountsSyncScript.js`. This script
use G Suite Domain-Wide Delegation of Authority and for this is needed create service account and credentials. It is possible from [here](https://console.cloud.google.com/iam-admin/serviceaccounts).
- Next is necessary to delegate domain-wide authority to newly created service account. In the `One or More API Scopes` field set this scope `https://www.googleapis.com/auth/admin.directory.user.readonly`.
 More information about this can be find [here](https://developers.google.com/admin-sdk/directory/v1/guides/delegation).
- Finally set variables in your env file from credential file. You need to set GOOGLE_SERVICE_EMAIL, GOOGLE_ADMIN_EMAIL (it is email of person who has admin privileges in your domain) and GOOGLE_PRIVATE_KEY.
