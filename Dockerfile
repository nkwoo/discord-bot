FROM node:14-alpine

MAINTAINER NamKyoungWoo
LABEL title="Discord Bot"
LABEL version="2.0.2"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV prod

CMD npm run start

#ENTRYPOINT ["git", "clone", "https://github.com/nkwoo/discord-bot.git", "bot"]








