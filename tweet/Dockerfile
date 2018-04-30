FROM node:carbon

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install

COPY ./app /app

CMD ["npm", "start"]
