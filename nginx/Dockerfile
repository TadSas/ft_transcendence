FROM nginx:alpine

COPY ./config/nginx.conf /etc/nginx/conf.d
COPY ./config/ssl/cert.crt /etc/ssl/private
COPY ./config/ssl/private/cert.key /etc/ssl/private

WORKDIR /usr/share/nginx/html

COPY ./frontend ./
