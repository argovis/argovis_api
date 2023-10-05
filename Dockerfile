FROM argovis/api:base-231005
COPY nodejs-server /app
RUN cp mods/express.app.config.js /app/node_modules/oas3-tools/dist/middleware/express.app.config.js
ENV ARGOCORE=here
CMD npm start
