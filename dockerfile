FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm i

CMD ["npm", "run", "start"]
