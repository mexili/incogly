# Use the official image as a parent image.
FROM node:alpine

RUN mkdir -p /app
COPY . /app
WORKDIR /app
RUN yarn

EXPOSE 3000/tcp
CMD ["node", "server.js"]

