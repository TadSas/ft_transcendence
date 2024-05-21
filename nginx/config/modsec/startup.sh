##
# ModSecurity NGINX INSTALLATION SCRIPT
##

# Install Prerequisite Packages
echo "Install Prerequisite Packages";
apt-get update -y
apt-get install -y apt-utils autoconf automake build-essential git libcurl4-openssl-dev libgeoip-dev liblmdb-dev libpcre3-dev libtool libxml2-dev libyajl-dev pkgconf wget zlib1g-dev

OPT_DIR=/opt
NGINX_DIR=/etc/nginx
MODSEC_DIR=/etc/nginx/modsec
MODULES_DIR=/etc/nginx/modules

nginx -v
NGINX_STAT=$?

# CHECKING: NGINX INSTALLED OR NOT
if [ $NGINX_STAT -ne 0 ]; then
	echo "Return code was not zero but $NGINX_STAT; Exiting setup as 'Nginx Not Found'. Please install nginx.";
	exit 1;
fi;

# CHECKING: /opt DIRECTORY EXISTS OR NOT
if [ ! -d $OPT_DIR ]; then
	echo "$OPT_DIR does not exists; Exiting setup.";
	exit 1;
fi;

echo "Welcome To ModSecurity NGINX Installation........"

echo "Enter into $OPT_DIR"
cd $OPT_DIR

# ----------------------- STEP-1: libModSecurity Installation -----------------------
echo "Cloning libModSecurity git repositry..."
git clone https://github.com/SpiderLabs/ModSecurity
echo "Cloning done..."

echo "Enter into cloned repository directory, checkout to v3/master branch..."
cd ModSecurity
git checkout v3/master

echo "Pulling couple of necessarysub-modules..."
git submodule init
git submodule update
echo "\n submodule update done, we are ready to build libModSecurity..."

echo "Compiling and installing library..."
sh build.sh
./configure
make
make install

# libModSecurity LIBRARY INSTALLATION DONE

# ----------------------- STEP-2: COMPILING Nginx Connector -----------------------
NGINX_VERSION=$(nginx -v 2>&1)
NGINX_VER_NO=${NGINX_VERSION//[^0-9.]/}

echo "Installed Nginx Version: $NGINX_VERSION"

echo "\n Entering into $OPT_DIR..."
cd $OPT_DIR

if [ ! -f "nginx-$NGINX_VER_NO.tar.gz" ]; then
  echo "Downloading source code for Nginx Version: $NGINX_VER_NO"
  wget http://nginx.org/download/nginx-$NGINX_VER_NO.tar.gz || { echo "Can't download nginx archive; Exiting setup." ; exit 1; }
fi
echo "Unpacking archive..."
tar -xvf nginx-$NGINX_VER_NO.tar.gz || { echo "Archive extracted with errors, check the source; Exiting setup." ; exit 1; }
echo "Unpacking done..."

echo "\n Entering into $OPT_DIR..."
cd $OPT_DIR

echo "Cloning ModeSecurity-nginx git repository into $OPT_DIR..."
git clone https://github.com/SpiderLabs/ModSecurity-nginx
echo "Cloning of ModeSecurity-nginx git repo done..."

echo "Entering into nginx directory that we cloned and unpacked earlier..."
cd $OPT_DIR/nginx-$NGINX_VER_NO

echo "Compiling connector ...."
./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx
make modules

echo "Compiling done, copying connector module into the nginx modules directory..."
mkdir $MODULES_DIR
cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/
echo "Compiling and copying of connector done, now lets configure nginx to use it..."

echo "Enter into nginx directory: $NGINX_DIR"
cd $NGINX_DIR
mkdir $MODSEC_DIR
cd $MODSEC_DIR

echo "Loading ModSecurity rules and configuration into $MODSEC_DIR ..."
git clone https://github.com/coreruleset/coreruleset.git

echo "Renaming ModSecurity rules configuration file to use it..."
mv $MODSEC_DIR/coreruleset/crs-setup.conf.example $MODSEC_DIR/coreruleset/crs-setup.conf

echo "Copying ModSecurity configuration file from the directory where we built libModSecurity to /etc/nginx/modsec/"
cp /opt/ModSecurity/modsecurity.conf-recommended $MODSEC_DIR/modsecurity.conf
cp -a /opt/ModSecurity/unicode.mapping $MODSEC_DIR

echo "Creating a new configuration file that loads these two configuration files and all the rules files"

cat > $MODSEC_DIR/main.conf <<EOL
Include /etc/nginx/modsec/modsecurity.conf
Include /etc/nginx/modsec/coreruleset/crs-setup.conf
Include /etc/nginx/modsec/coreruleset/rules/*.conf
EOL

echo "Replacing 'SecRuleEngine DetectionOnly' to 'SecRuleEngine On'"
sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/g' /etc/nginx/modsec/modsecurity.conf

cat > /etc/nginx/modules-available/ngx_http_modsecurity.conf <<EOL
load_module /etc/nginx/modules/ngx_http_modsecurity_module.so;
EOL
ln -s /etc/nginx/modules-available/ngx_http_modsecurity.conf /etc/nginx/modules-enabled/

# REMOVING DIRECTORIES CLONED IN /opt
echo "Removing cloned directories from $OPT_DIR"
rm -rf $OPT_DIR/ModSecurity  $OPT_DIR/ModSecurity-nginx  $OPT_DIR/nginx-$NGINX_VER_NO  $OPT_DIR/nginx-$NGINX_VER_NO.tar.gz
echo "Removed: \n1) $OPT_DIR/ModSecurity  \n2)$OPT_DIR/ModSecurity-nginx  \n3)$OPT_DIR/nginx-$NGINX_VER_NO  \n4)$OPT_DIR/nginx-$NGINX_VER_NO.tar.gz"

echo "We have now completed building and installing nginx, libModSecurity, the nginx connector and ModSecurity rules..."