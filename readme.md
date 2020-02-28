Discord-Bot
===

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
    echo $NODE_ENV

How To Use Bot
---
    1. you must invite bot on your discord server
    2. make .env.prod file (Reference .env.example source code) with your bot api key
    3. use command
        npm install -g forever
        ex) linux command(window command)
           
        npm run-script build(npm run-script win-build)
        npm run-script start(npm run-script win-start)

        -linux only
        npm run-script stop
    
        (After Add)