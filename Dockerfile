### Builder
FROM node:12 AS builder

ARG CI_COMMIT_SHA

LABEL server-builder=$CI_COMMIT_SHA

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm i --global @adonisjs/cli

RUN npm install --production

RUN npm run build

### Release
FROM node:12-alpine

COPY --from=builder --chown=node:node /usr/src/app /usr/src/app

USER node

WORKDIR /usr/src/app

EXPOSE 3333 9229

CMD node server.js
