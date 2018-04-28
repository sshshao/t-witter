FROM node:carbon

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install

COPY ./app /app

EXPOSE 5000

CMD ["npm", "start"]

