### Builder
FROM node:12 AS builder

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm i --global @adonisjs/cli

RUN npm i

RUN ENV_SILENT=true npm run build

### Release
FROM node:12-alpine

COPY --from=builder --chown=node:node /usr/src/app /usr/src/app

USER node

WORKDIR /usr/src/app

EXPOSE 3333 9229

ENV ENV_SILENT=true

CMD node ./ace migration:run && node server.js
