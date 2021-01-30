FROM node:15-alpine

COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 80

CMD ["node", "server.js"]
