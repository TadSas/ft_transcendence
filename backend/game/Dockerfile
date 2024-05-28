FROM python:slim-bullseye

# remove this before deployment
ENV PYTHONUNBUFFERED 1

WORKDIR /var/www/game

COPY . /

RUN apt-get -y update && apt-get install -y --no-install-recommends vim wget curl gpg curl lsb-release ca-certificates openssl && \
    pip install --upgrade pip && \
    pip install -r /config/requirements.txt

RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list
RUN apt update && apt install vlt -y --no-install-recommends && \
    apt -y autoremove && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.cache/pip/*

RUN chmod +x /config/startup.sh

ENTRYPOINT ["/config/startup.sh"]
