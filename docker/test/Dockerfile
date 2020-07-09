FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . .

ENV PATH /usr/src/app/node_modules/.bin:$PATH

CMD npm install -g nodemon forever \
 && npm install --no-optional > log/ins.log \
 && npm cache clean --force \
 && forever -a -o log/out.log -e log/err.log -c "nodemon -L" app.js test