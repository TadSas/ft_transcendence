#!/bin/bash

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

icons_latest_release=$(curl -s https://api.github.com/repos/twbs/icons/releases/latest)

icons_vversion=$(echo "$icons_latest_release" | grep -oP '"tag_name": "\K(.*?)(?=")')

icons_version="${icons_vversion:1}"

icons_download_url="https://github.com/twbs/icons/releases/download/$icons_vversion/bootstrap-icons-$icons_version.zip"

wget "$icons_download_url" -O "bootstrap-icons-$icons_version.zip"

unzip bootstrap-icons-$icons_version.zip

rm bootstrap-icons-$icons_version.zip

mv bootstrap-icons-$icons_version bootstrap/icons

echo "Bootstrap icons $icons_vversion has been downloaded and extracted."

nginx -g "daemon off;"