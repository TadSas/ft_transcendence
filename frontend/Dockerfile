FROM node:latest

RUN apt-get update && apt-get install -y vim

COPY ./frontend/package.json /tmp/package.json

COPY ./frontend/package-lock.json /tmp/package-lock.json

# RUN cd /tmp && npm install

# RUN mkdir -p /var/www/frontend && cp -a /tmp/node_modules /var/www/frontend

WORKDIR /var/www/frontend

COPY frontend/ ./

# RUN npm install

CMD ["npm", "start"]
