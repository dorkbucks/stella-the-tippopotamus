FROM node:16.13.1-slim as base
MAINTAINER rubberdork <hi@rubberdork.com>
WORKDIR /app
COPY package*.json ./
COPY . .

FROM base as production
ENV NODE_ENV=production
RUN npm install
CMD ["npm", "start"]

FROM base as development
ENV NODE_ENV=development
RUN npm install
CMD ["npm", "run", "dev"]
