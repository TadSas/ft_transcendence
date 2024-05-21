FROM nginx:latest

COPY ./config/modsec /etc/nginx/conf.d/modsec
COPY ./config/nginx.conf /etc/nginx/conf.d
COPY ./config/ssl/cert.crt /etc/ssl/private
COPY ./config/ssl/private/cert.key /etc/ssl/private

RUN apt-get -y update --no-install-recommends && \
    apt-get install -y --no-install-recommends vim wget curl git make && \
    apt -y autoremove && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.cache/pip/*

RUN chmod +x /etc/nginx/conf.d/modsec/startup.sh && /etc/nginx/conf.d/modsec/startup.sh

WORKDIR /usr/share/nginx/html

COPY ./frontend ./
