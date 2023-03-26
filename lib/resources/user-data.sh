#!/bin/bash
yum update -y
timedatectl set-timezone Asia/Tokyo
localectl set-locale LANG=ja_JP.utf8
source /etc/locale.conf
amazon-linux-extras install -y nginx1
yum install -y gcc-c++ make patch git openssl-devel readline-devel zlib-devel ImageMagick-devel curl libffi-devel libicu-devel libxml2-devel libxslt-devel libyaml
yum remove -y mariadb-*
yum localinstall -y https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
yum install -y --enablerepo=mysql80-community mysql-community-server
yum install -y --enablerepo=mysql80-community mysql-community-devel
#pass=$(cat /var/log/mysqld.log | grep -E "root@localhost: .+" | sed -E 's/.+root@localhost: (.+)$/\1/g')
systemctl start mysqld
systemctl enable mysqld
mkdir /usr/local/rbenv
git clone https://github.com/rbenv/rbenv.git /usr/local/rbenv
echo 'export RBENV_ROOT="/usr/local/rbenv"' >> ~/.bashrc
echo 'export PATH="$RBENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init --no-rehash -)"' >> ~/.bashrc
git clone https://github.com/rbenv/ruby-build.git /usr/local/rbenv/plugins/ruby-build
source ~/.bashrc
rbenv install 3.1.3
rbenv global 3.1.3
gem install bundler
mkdir -p /var/www/encodingRails
git clone https://github.com/fumtas1k/encodingRails.git /var/www/encodingRails
mv /var/www/encodingRails/nginx/encodingRails.conf /etc/nginx/conf.d/encodingRails.conf
echo skip-grant-tables >> /etc/my.cnf
systemctl restart mysqld
cd /var/www/encodingRails
echo DB_SOCKET=/var/lib/mysql/mysql.sock >> .env
sudo systemctl start nginx
sudo systemctl enable nginx
bundle
bundle exec rails db:create
bundle exec rails s
