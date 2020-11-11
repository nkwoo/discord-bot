Discord-Bot
===

Discord Bot (Iru Bot)

How To Use Bot
---
    1. you must invite bot on your discord server
    2. make .env.prod file (Reference .env.example source code) with your bot api key
    3. use command
      - Run Command
        npm run start (Typescript)
        npm run build (Javascript)
        
      - Run in Docker
        docker build -t discord-bot:1.5.14 .
        docker run --name bot discord-bot:1.5.14
        
      - Docker None Images Remove
        docker rmi $(docker images -f "dangling=true" -q)
      
ENV command
---
* window cmd

    set NODE_ENV=prod
    echo %NODE_ENV%

* window powershell

    $env:NODE_ENV='prod'
    echo $env:NODE_ENV

* linux

    edit /etc/profile

    export NODE_ENV=prod
    echo $NODE_ENV\
    
NOTICE
--
해당 봇은 .env.<option> 파일이 존재해야 빌드할 수 있습니다.

https://log-laboratory.tistory.com/190

서버 버전 업데이트시 하단 파일들을 모두 버전 업데이트 해주셔야합니다.

```
.env.dev
.env.example
.env.prod
Dockerfile
package.json
package-lock.json
```