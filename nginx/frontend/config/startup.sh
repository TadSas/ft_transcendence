#!/bin/bash

latest_release=$(curl -s https://api.github.com/repos/twbs/bootstrap/releases/latest)

vversion=$(echo "$latest_release" | grep -oP '"tag_name": "\K(.*?)(?=")')

version="${vversion:1}"

download_url="https://github.com/twbs/bootstrap/releases/download/$vversion/bootstrap-$version-dist.zip"

wget "$download_url" -O "bootstrap-$version-dist.zip"

unzip bootstrap-$version-dist.zip

rm bootstrap-$version-dist.zip

mv bootstrap-$version-dist bootstrap

echo "Bootstrap $vversion has been downloaded and extracted."

nginx -g "daemon off;"