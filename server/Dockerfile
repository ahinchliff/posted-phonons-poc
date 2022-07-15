FROM node:14

# install yarn and give permissions
RUN apt-get update -qq
RUN npm install -g yarn --force
RUN chmod +x /usr/local/bin/yarn

# copy across files from each of the projects
WORKDIR /home/client
COPY ./client/package.json ./client/yarn.lock ./client/tsconfig.json ./
COPY ./client/src ./src

WORKDIR /home/core-backend
COPY ./core-backend/package.json ./core-backend/yarn.lock ./core-backend/tsconfig.json ./
COPY ./core-backend/src ./src

WORKDIR /home/data
COPY ./data/package.json ./data/yarn.lock ./data/tsconfig.json ./
COPY ./data/src ./src

WORKDIR /home/server
COPY ./server/package.json ./server/yarn.lock ./server/tsconfig.json ./
COPY ./server/src ./src

WORKDIR /home/shared-types
COPY ./shared-types/tsconfig.json ./
COPY ./shared-types/src ./src

# copy across files from root project, yarn in all projects and build all projects
WORKDIR /home
COPY ./package.json ./yarn.lock ./tsconfig.json ./

RUN yarn prepare-javascript-environment

WORKDIR /home/build/server

EXPOSE 3001
CMD [ "node", "src/index.js" ]