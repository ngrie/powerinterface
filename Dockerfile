FROM node:15-alpine

LABEL org.opencontainers.image.source=https://github.com/ngrie/powerinterface

COPY . /app
WORKDIR /app

RUN npm install

ENV TZ=Europe/Berlin

EXPOSE 80

CMD ["node", "server.js"]
