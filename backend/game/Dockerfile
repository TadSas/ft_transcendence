FROM python:slim-bullseye

# remove this before deployment
ENV PYTHONUNBUFFERED 1

WORKDIR /var/www

COPY . /

RUN apt-get -y update --no-install-recommends && \
    apt-get install -y --no-install-recommends vim wget && \
    pip install --upgrade pip && \
    pip install -r /config/requirements.txt && \
    apt -y autoremove && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.cache/pip/* && \
    rm -f Dockerfile

CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]