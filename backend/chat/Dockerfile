FROM python:slim-bullseye

# remove this before deployment
ENV PYTHONUNBUFFERED 1

WORKDIR /var/www/chat

COPY . /

RUN apt-get -y update --no-install-recommends && \
    apt-get install -y --no-install-recommends vim wget && \
    pip install --upgrade pip && \
    pip install -r /config/requirements.txt && \
    apt -y autoremove && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.cache/pip/*

RUN chmod +x /config/startup.sh

ENTRYPOINT ["/config/startup.sh"]
