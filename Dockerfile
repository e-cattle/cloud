FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . .

ENV PATH /usr/src/app/node_modules/.bin:$PATH

CMD npm install -g nodemon forever \
 && npm install \
 && npm cache clean --force \
 && forever -a -o out.log -e err.log -c "nodemon -L" app.js