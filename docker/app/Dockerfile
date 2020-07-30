FROM node:10

LABEL maintainer="Tomáš Bruckner <tomas.bruckner@staff.techfides.eu>"

WORKDIR /app

EXPOSE 3333

CMD ["npm", "run", "dev"]

FROM mysql:5.7.22

COPY config-file.cnf /etc/mysql/conf.d
