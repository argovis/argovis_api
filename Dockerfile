FROM argovis/api:base-211130
COPY nodejs-server /app
RUN cp mods/express.app.config.js /app/node_modules/oas3-tools/dist/middleware/express.app.config.js
CMD npm start
