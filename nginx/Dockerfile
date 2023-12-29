FROM nginx:latest

COPY ./config/nginx.conf /etc/nginx/conf.d
COPY ./config/ssl/cert.crt /etc/ssl/private
COPY ./config/ssl/private/cert.key /etc/ssl/private

RUN apt-get -y update --no-install-recommends && \
    apt-get install -y --no-install-recommends vim wget unzip && \
    apt-get -y purge && \
    apt -y autoremove && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/share/nginx/html

COPY ./frontend ./

CMD ["bash", "./config/startup.sh"]
