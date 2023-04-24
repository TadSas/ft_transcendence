FROM nginx:latest

RUN apt-get update && apt-get install -y vim

COPY ./config/nginx.conf /etc/nginx/conf.d

COPY ./config/ssl/cert.crt /etc/ssl/private

COPY ./config/ssl/private/cert.key /etc/ssl/private
