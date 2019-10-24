FROM node:8.12.0-alpine

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 5011

CMD ["node", "app.js"]