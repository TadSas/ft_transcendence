FROM node:latest

RUN apt-get update && apt-get install -y vim

RUN npm install -g @nestjs/cli

COPY ./Backend/package.json /tmp/package.json

COPY ./Backend/package-lock.json /tmp/package-lock.json

# RUN cd /tmp && npm install

# RUN mkdir -p /var/www/backend && cp -a /tmp/node_modules /var/www/backend

WORKDIR /var/www/backend

COPY Backend/ ./

# RUN npm install

CMD ["npm", "run", "start:dev"]
