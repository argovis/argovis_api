FROM node:16.8.0
COPY nodejs-server /app
WORKDIR /app
RUN npm install
CMD npm start
