#!/bin/bash

echo "Start provisioner script..."

echo "Changing root password to 'vagrant'..."

passwd <<EOF
vagrant
vagrant
EOF

echo "Done!"

echo "Updating, upgrading and dist upgrading..."

apt-get -y update
DEBIAN_FRONTEND=noninteractive  apt-get -o Dpkg::Options::="--force-confold" -y upgrade

echo "Done!"

echo "Install a lot of dependencies..."

echo "postfix postfix/mailname string localhost" | debconf-set-selections
echo "postfix postfix/main_mailer_type string 'Internet Site'" | debconf-set-selections

DEBIAN_FRONTEND=noninteractive apt-get install -o Dpkg::Options::="--force-confold" -y aptitude build-essential bzip2 curl default-jdk git gnupg locales locate mailutils ntpdate postfix unzip vim wget

echo "Done!"

echo "Configuring locales..."

locale-gen "en_US.UTF-8"
locale-gen "es_ES.UTF-8"
locale-gen "pt_BR.UTF-8"

echo -e 'LANG="en_US.UTF-8"\nLANGUAGE="en_US:en"\n' > /etc/default/locale

dpkg-reconfigure --frontend=noninteractive locales

echo "Done!"

echo "Install MongoDB..."

wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -

echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.2 main" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list

apt-get -y update

DEBIAN_FRONTEND=noninteractive apt-get install -o Dpkg::Options::="--force-confold" -y mongodb-org

echo "Done!"

echo "Install NodeJS..."

curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

DEBIAN_FRONTEND=noninteractive apt-get install -o Dpkg::Options::="--force-confold" -y nodejs

echo "Done!"

echo "Cleaning apt-get..."

apt-get autoremove
apt-get clean -y
apt-get autoclean -y

find /var/lib/apt -type f | xargs rm -f

find /var/lib/doc -type f | xargs rm -f

echo "Done!"

echo "SSH..."

cp -f /vagrant/box/settings/sshd_config /etc/ssh/sshd_config

/etc/init.d/ssh restart

echo "Done!"

echo "Configuring MongoDB..."

cp -f /vagrant/box/settings/mongodb.conf /etc/

service mongodb stop

service mongod start

echo "Done!"

echo "Installing MailHog..."

wget --quiet -O /usr/local/bin/mailhog https://github.com/mailhog/MailHog/releases/download/v1.0.0/MailHog_linux_amd64

chmod +x /usr/local/bin/mailhog

cp -f /vagrant/box/settings/mailhog /etc/init.d/

chmod +x /etc/init.d/mailhog

update-rc.d mailhog defaults

service mailhog start

echo "Done!"

echo "Installing application's dependencies..."

npm install -g npm

npm install -g nodemon forever

cd /vagrant

npm cache clean -f

npm install --no-bin-link

mkdir -p /vagrant/log

echo "Done!"

echo "Runnig 'updatedb' command (for locate)..."

updatedb

echo "Done!"

echo "Renaming machine to 'backend'..."

echo "cloud" > /etc/hostname

sed -i -- 's/stretch/cloud/g' /etc/hosts

echo "Done!"

echo ""

echo "########## SUMMARY ############"

echo "All done! See above for possible errors."

echo "To access your new environment use a SSH client to localhost:9022 with login 'root' and password 'vagrant'."

echo "The NodeJS is running at http://localhost:9080/ and MongoDB at localhost:8017 (without authentication)."

echo "All e-mail messages are catched and can be accessed at http://localhost:9025/"

echo "###############################"

echo ""

echo "One last thing: is necessary reboot VM to reload network settings..."

echo "Please, wait another few seconds!"

echo ""

echo "Rebooting..."
