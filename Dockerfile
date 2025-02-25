FROM node:23-alpine

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY src ./src

EXPOSE 3000

ENTRYPOINT [ "npm" ]
CMD [ "run", "prod" ]