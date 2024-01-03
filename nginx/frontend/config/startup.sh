#!/bin/bash

# Downloading the Bootstrap

bs_latest_release=$(curl -s https://api.github.com/repos/twbs/bootstrap/releases/latest)

bs_vversion=$(echo "$bs_latest_release" | grep -oP '"tag_name": "\K(.*?)(?=")')

bs_version="${bs_vversion:1}"

bs_download_url="https://github.com/twbs/bootstrap/releases/download/$bs_vversion/bootstrap-$bs_version-dist.zip"

wget "$bs_download_url" -O "bootstrap-$bs_version-dist.zip"

unzip bootstrap-$bs_version-dist.zip

rm bootstrap-$bs_version-dist.zip

rm -rf bootstrap

mv bootstrap-$bs_version-dist bootstrap

echo "Bootstrap $bs_vversion has been downloaded and extracted."

# Downloading the Bootstrap icons

icons_latest_release=$(curl -s https://api.github.com/repos/twbs/icons/releases/latest)

icons_vversion=$(echo "$icons_latest_release" | grep -oP '"tag_name": "\K(.*?)(?=")')

icons_version="${icons_vversion:1}"

icons_download_url="https://github.com/twbs/icons/releases/download/$icons_vversion/bootstrap-icons-$icons_version.zip"

wget "$icons_download_url" -O "bootstrap-icons-$icons_version.zip"

unzip bootstrap-icons-$icons_version.zip

rm bootstrap-icons-$icons_version.zip

mv bootstrap-icons-$icons_version bootstrap/icons

echo "Bootstrap icons $icons_vversion has been downloaded and extracted."

# Downloading the Three.js

threejs_latest_release=$(curl -s https://api.github.com/repos/mrdoob/three.js/releases/latest)

threejs_version=$(echo "$threejs_latest_release" | grep -oP '"tag_name": "\K(.*?)(?=")')

threejs_download_url="https://github.com/mrdoob/three.js/archive/refs/tags/$threejs_version.zip"

wget "$threejs_download_url" -O "three.js-$threejs_version.zip"

unzip three.js-$threejs_version.zip

rm three.js-$threejs_version.zip

rm -rf threejs

mv three.js-$threejs_version threejs

echo "Three.js $threejs_version has been downloaded and extracted."

# Starting the nginx service

nginx -g "daemon off;"
