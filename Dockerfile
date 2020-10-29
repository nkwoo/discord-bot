FROM node:10.23-alpine

MAINTAINER NamKyoungWoo
LABEL title="Discord Bot"
LABEL version="1.5.14"

WORKDIR /app

COPY package*.json ./

RUN npm install typescript -g
RUN npm install ts-node -g
RUN npm install

COPY . .

ENV NODE_ENV prod
COPY .env.prod .env.prod

CMD npm run start

#ENTRYPOINT ["git", "clone", "https://github.com/nkwoo/discord-bot.git", "bot"]








