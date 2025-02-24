FROM node:23-alpine3.20

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY src ./src

ENTRYPOINT [ "npm" ]
CMD [ "run", "prod" ]