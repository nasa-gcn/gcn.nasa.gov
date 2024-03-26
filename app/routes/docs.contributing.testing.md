---
handle:
  breadcrumb: Testing
---

# Testing

## Our Philosophy

GCN has evolved into a polyglot project. We are actively working to increase test coverage on the project as a whole.

Our tests currently exist in a few places:

- `\__tests__\` in the project root contains some tests for the circulars library functions and the cognito server, as well as some component tests.
- Some tests are defined in a `__tests__` folder in the same directory as their definitions, for example, `\app\lib\headers.server.ts` and `\app\lib\__tests__\headers.server.ts`
- `\python\tests` for the python portion

## Testing Tools

We use a combination of tools including [Jest](https://jestjs.io/) and [aws-sdk-mock](https://www.npmjs.com/package/aws-sdk-mock) for the Typescript code, and [pytest](https://docs.pytest.org/en/8.0.x/) and [moto3](https://docs.getmoto.org/en/latest/index.html) for the Python section.

## Guidelines

We currently have approximately 5% coverage. While we don't have a specific percentage goal, we are hoping to increase this in future updates. Testing has been focused on features we think most needed it.

We do not want to decrease test coverage. New PR's should have tests as appropriate.

When contributing to new features and bug fixes, consider whetheror not the change decrease test coverage, include them with your contribution if possible.

Any tests that set up a DB or other shared resource should be self-cleaning to keep from polluting the environment for other tests.

Python tests reside in a parallel directory so they don't end up in the installation.
