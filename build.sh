docker container run --rm -v ${PWD}:/local swaggerapi/swagger-codegen-cli-v3 generate -i /local/core-spec.json -l nodejs-server -o /local/nodejs-server
mv nodejs-server/api/openapi.yaml nodejs-server/api/openapi.core.yaml
docker container run --rm -v ${PWD}:/local swaggerapi/swagger-codegen-cli-v3 generate -i /local/miami-spec.json -l nodejs-server -o /local/nodejs-server
mv nodejs-server/api/openapi.yaml nodejs-server/api/openapi.miami.yaml
docker container run --rm -v ${PWD}:/local swaggerapi/swagger-codegen-cli-v3 generate -i /local/satellite-spec.json -l nodejs-server -o /local/nodejs-server
mv nodejs-server/api/openapi.yaml nodejs-server/api/openapi.satellite.yaml