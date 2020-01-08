FROM node:dubnium-alpine

WORKDIR /usr/src/app

RUN npm install -g nodemon forever

COPY . /usr/src/app

RUN mkdir -p log
RUN mkdir -p db/backup
RUN mkdir -p db/restore

EXPOSE 3000

CMD npm install > log/ins.log ; forever -a -o log/out.log -e log/err.log -c "nodemon -L" app.js production