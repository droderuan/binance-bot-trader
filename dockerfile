FROM node:16-alpine3.17

WORKDIR /usr/src/app

COPY . .

RUN npm i

CMD ["npm", "run", "start"]
