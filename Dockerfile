FROM node:10.23-alpine

MAINTAINER NamKyoungWoo
LABEL title="Discord Bot"
LABEL version="1.6.2"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV prod
COPY .env.prod .env.prod

CMD npm run start

#ENTRYPOINT ["git", "clone", "https://github.com/nkwoo/discord-bot.git", "bot"]







