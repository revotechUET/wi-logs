FROM node:8.12.0-alpine

WORKDIR /app

COPY . /app

RUN npm install

ENV NODE_ENV=kubernetes

EXPOSE 5011

CMD ["node", "app.js"]