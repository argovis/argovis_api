FROM node:16.8.0
COPY nodejs-server /app
WORKDIR /app
RUN npm install
RUN cp mods/express.app.config.js /app/node_modules/oas3-tools/dist/middleware/express.app.config.js
CMD npm start
