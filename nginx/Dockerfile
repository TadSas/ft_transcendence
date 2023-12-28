FROM nginx:latest

COPY ./frontend ./
COPY ./config/nginx.conf /etc/nginx/conf.d
COPY ./config/ssl/cert.crt /etc/ssl/private
COPY ./config/ssl/private/cert.key /etc/ssl/private

RUN apt-get -y update --no-install-recommends && \
    apt-get install -y --no-install-recommends vim wget unzip && \
    wget https://github.com/twbs/bootstrap/releases/download/v5.3.2/bootstrap-5.3.2-dist.zip && \
    unzip bootstrap-5.3.2-dist.zip && \
    mv bootstrap-5.3.2-dist bootstrap && \
    mkdir /usr/share/nginx/html/bootstrap && \
    cp -R bootstrap/* /usr/share/nginx/html/bootstrap/ && \
    rm -rf bootstrap-5.3.2-dist.zip && \
    # rm -rf bootstrap && \
    apt-get -y purge && \
    apt -y autoremove && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.cache/pip/*

WORKDIR /usr/share/nginx/html
