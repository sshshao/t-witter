FROM node:carbon

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY ./ /app

CMD ["npm", "start"]
