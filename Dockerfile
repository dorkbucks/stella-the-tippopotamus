FROM node:16.13.1-slim as base
MAINTAINER rubberdork <hi@rubberdork.com>

RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

FROM base as production
ENV NODE_ENV=production
RUN npm install && npm cache clean --force
CMD ["npm", "start"]

FROM base as development
ENV NODE_ENV=development
RUN npm install && npm cache clean --force
CMD ["npm", "run", "dev"]
