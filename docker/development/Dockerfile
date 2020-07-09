FROM node:lts-alpine

WORKDIR /usr/src/app

RUN npm install -g nodemon forever

COPY package.json ./

RUN npm install --no-optional && npm cache clean --force

ENV PATH /usr/src/app/node_modules/.bin:$PATH

CMD forever -a -o log/out.log -e log/err.log -c "nodemon -L" app.js development
