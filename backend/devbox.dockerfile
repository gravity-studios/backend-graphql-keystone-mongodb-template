# https://docs.docker.com/samples/library/node/
ARG NODE_VERSION=12.10.0

FROM node:${NODE_VERSION}-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN yarn install

COPY --chown=node:node . .

EXPOSE 3000
CMD ["yarn", "dev"]