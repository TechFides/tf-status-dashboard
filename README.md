# TF-HUB

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

- Accounts in TF-Hub can be synchronize with Gsuite via script `app/Services/GoogleAccountsSyncScript.js`. This script
use G Suite Domain-Wide Delegation of Authority and for this is needed create service account and credentials. It is possible from [here](https://console.cloud.google.com/iam-admin/serviceaccounts).
- Next is necessary to delegate domain-wide authority to newly created service account. In the `One or More API Scopes` field set this scope `https://www.googleapis.com/auth/admin.directory.user.readonly`.
 More information about this can be find [here](https://developers.google.com/admin-sdk/directory/v1/guides/delegation).
- Finally set variables in your env file from credential file. You need to set GOOGLE_SERVICE_EMAIL, GOOGLE_ADMIN_EMAIL (it is email of person who has admin privileges in your domain) and GOOGLE_PRIVATE_KEY.

- All users statistic are obtained from JIRA worklogs. For this create API token [here](https://id.atlassian.com/manage/api-tokens) and then
set this token into env file to the variable JIRA_KEY and set JIRA_ADMIN_EMAIL (email of person who generated token). More info is possible find [here](https://support.siteimprove.com/hc/en-gb/articles/360004317332-How-to-create-an-API-token-from-your-Atlassian-account).

- TF-Hub can send informations to your Slack workspace. For this create [slack app](https://api.slack.com/apps) with your
workspace name. Next set scopes. It is possible in section OAuth & Permissions->Scopes->Bot Token Scopes. Here chose this scopes:
`chat:write, groups:write, im:write, mpim:write, users:read, users:read.email`. After that save changes a click on Install App.

- Next save generated Bot User OAuth Access Token and set it into env file to the variable SLACK_TOKEN.

- For sending information about worked hours for each employee is implemented script `app/Services/SlackBot.js`. This script
should be run at the beginning of each month.

- To send a notification about the start of the sitdown use script `app/Services/MessageScheduler.js` and set name of
channel to which you want receive notification into settings of TF-Hub app. This script should be run every morning.

- TF-Hub can send value of sitdown to the project channel. For this is necessarily to each project has a channel 
that exists in your workspace. Also, each channel must have invited bot to the conversation. 
This is possible by sending this message to the channel: `/invite @nazev_bota`.

- If you want to get error messages when something get wrong then create channel in your workspace for errors and set it into TF-Hub app settings. 

- TF-Hub is integrated with google calendar. For this set variable GOOGLE_CALENDAR_ID in env file (you can find it in settings of calendar
in section Integrate calendar->Calendar ID). Then under "Share with specific people" section, grant permissions
to the created service account (variable GOOGLE_SERVICE_EMAIL in Env) (<service_account>@<project_name>.iam.gserviceaccount.com) to make changes/read events.
Don't forget you have to set it up GOOGLE_SERVICE_EMAIL and GOOGLE_PRIVATE_KEY in env file.

- App is integrated with TF-ERP system to get cost categories. For that set env variables NUXT_ENV_TF_ERP_API_URL and NUXT_ENV_TF_ERP_API_TOKEN
