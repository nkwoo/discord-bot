Discord Bot (Iru Bot)
===

디스코드 자동 응답 봇 입니다.

Getting Started
--

일상생활에서 사용하는 디스코드를 통해 보다 간편한 명령어로 각종 정보를 조회하기 위해 만들었습니다.

Prerequisites
--

해당 디스코드 봇에서는 OpenAPI를 사용합니다.
 
아래의 페이지에서 API KEY를 발급받아 ```env```폴더 안에 ```dev.json```과 ```prod.json``` 파일을 만들어야 합니다.

- [네이버 파파고 언어 번역(NMT)](https://developers.naver.com/docs/papago/papago-nmt-overview.md)
- [네이버 파파고 언어 감지](https://developers.naver.com/docs/papago/papago-detectlangs-overview.md)
- [디스코드 봇 키 발급 & 앱 등록](https://blog.naver.com/wpdus2694/221192640522)
- [리그 오브 레전드 API Key 발급](https://developer.riotgames.com/)

하단은 각자 발급한 key에 대해서 어떤 json 속성에 저장해야하는지 매핑정보입니다.

```
네이버 파파고 언어 번역(NMT)
    apiKey.naver.papago.nmt.clientId
    apiKey.naver.papago.nmt.clientSecret

네이버 파파고 언어 감지
    apiKey.naver.papago.detectLang.clientId
    apiKey.naver.papago.detectLang.clientSecret

디스코드 봇 키 발급 & 앱 등록
    apiKey.discord

리그 오브 레전드 API Key 발급
    apiKey.lol
```

그리고 서버 배포시에 필요한 ENV 설정이 필요합니다

해당 설정은 OS별 아래 커맨드를 이용해주세요.

```
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
```

Installing 
---

npm으로 필요한 라이브러리를 설치합니다.

```
npm install
```

Deployment
---

배포 방식에는 세가지 방식이 있습니다.

1. Javascript Server Environment

Typescript build를 통해서 js로 만들어서 배포할 수 있습니다.

```
npm run build
    tsc && node ./dist/src/index.js
```

2. Typescript Server Environment

Typescript로 실행을 하여 배포할 수 있습니다.

```
npm run start
    nodemon -x ts-node src/index.ts
```

3. Dockerfile Server Environment

Dockerfile로 docker에 배포할 수 있습니다.

```
docker build -t iru-bot:1.7.0 . 
docker run --name iru-bot -d -e TZ=Asia/Seoul iru-bot:1.7.0
```

p.s
가끔 도커 빌드도중 오류가 발생할 경우 이미지에 대한 캐시가 남습니다.

해당 캐시는 직접 삭제해야합니다.

아래 커맨드를 이용해서 none:none 이미지를 제거해주세요.

```
docker rmi $(docker images -f "dangling=true" -q)
```

ETC
--
[Intellij IDE에서 Docker 서비스 사용하기](https://log-laboratory.tistory.com/190)

서버 버전 업데이트시 하단 파일들을 모두 버전 업데이트 해주셔야합니다.

```
env/dev.json
env/prod.json
Dockerfile
package.json
package-lock.json
```