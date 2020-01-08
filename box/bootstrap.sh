#!/bin/bash

echo "Start NodeJS application..."

cd /vagrant

forever -a -o log/out.log -e log/err.log start -c "nodemon -L" app.js development

echo "All done!"