## Development Cycle

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

5. Image can be built from the local `Dockerfile`

6. API endpoint testing is handled by supertest, mocha and chai, and is performed from an external test container that issues requests to a build of the main api container. See `.travis.yml` for a detailed description of how to set these tests up and run them locally.

## Build & Release Cycle

When all tests on the `server` branch are passing, releases may be made with the following procedures, assuming the base image hasn't changed (see below for when base images need an update, ie when node or package dep versions change)

1. Choose a release tag; this should typically be a standard semver, possibly suffixed with `-rc-x` for release candidates if necessary.

2. Stamp a release of the `server` branch on GitHub, using the release tag you chose.

3. Build the API container: `docker image build -t argovis/api:<release tag> .`

4. Push to Docker Hub: `docker image push argovis/api:<release tag>`

### Base Image Builds

In general, the base image for the API shouldn't change often; it is meant to capture package dependencies, and should be as stable as possible. But, when dependencies need an update (most typically after `package.json` changes), follow this procedure.

1. Build a new base image, tagged with the build date:  `docker image build -f Dockerfile-base -t argovis/api:base-yymmdd .`

2. Update `Dockerfile` to build from your new base image (very first `FROM` line).

3. Build and test per the `.travis.yml` to make sure tests still pass with this new base.

2. Push to Docker Hub: `docker image push argovis/api:base-yymmdd`, and push the updates to the `server` branch to GitHub.