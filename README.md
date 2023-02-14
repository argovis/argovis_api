## Build Cycle

Argovis's API is automatically templated from the OpenAPI specification in several specification files:

 - `core-spec.json`: API spec for Argovis core at University of Colorado. Serves all data products except the ones enumerated below for our partner deployments.
 - `miami-spec.json`: spec for the Global Drifter Program deployment, hosted by University of Miami.

_These specifications are the single source of truth for the definition of this API!_ By adhering to this specification, we are able to leverage the OpenAPI ecosystem of tools for automatically generating docs, server side stubs and client code. To support this, we use the following build workflow.

1. After modifying the specification documents to describe how you want to update the API, build the server stubs with:

```
bash build.sh
```

2. Commit these changes to the `templates` branch.

3. Merge these changes into the `server` branch; that way, we can merge new routes from the templates into previously-written custom logic, and have merge conflicts identify any places where updates to old routes may need attention.

4. Implement custom logic and commit to the `server` branch, which will be the build and release branch.

5. [build image]

6. [tests]
