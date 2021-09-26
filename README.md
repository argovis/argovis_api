## Build Cycle

Argovis's API is automatically templated from the OpenAPI specification in `spec.yaml`. _This specification is the single source of truth for the definition of this API!_ By adhering to this specification, we are able to leverage the OpenAPI ecosystem of tools for automatically generating docs, server side stubs and client code. To support this, we use the following build workflow.

1. After modifying `spec.yaml` to describe how you want to update the API, build the server stubs with:

```
docker container run --rm -v ${PWD}:/local \
    swaggerapi/swagger-codegen-cli-v3 generate \
    -i /local/spec.json \
    -l nodejs-server \
    -o /local/nodejs-server
```

2. Commit these changes to the `templates` branch.

3. Merge these changes into the `server` branch; that way, we can merge new routes from the templates into previously-written custom logic, and have merge conflicts identify any places where updates to old routes may need attention.

4. Implement custom logic and commit to the `server` branch, which will be the build and release branch.

5. [build image]

6. [tests]
