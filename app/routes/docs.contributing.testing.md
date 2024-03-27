---
handle:
  breadcrumb: Testing
---

# Testing

Adding both unit and integration tests offers numerous benefits. Unit tests allow us to verify the correctness of individual components or units of code, ensuring they function as expected in isolation. This promotes reliability, simplifies debugging, and facilitates maintenance by catching regressions early in the development process. Integration tests evaluate the interactions between different components or modules, ensuring that they work together seamlessly. By detecting integration issues early, it enhances system stability and reduces the likelihood of bugs in production.

Our tests currently exist in a few places:

- `\__tests__\` in the project root contains some tests for the circulars library functions and the cognito server, as well as some component tests.
- Some tests are defined in a `__tests__` folder in the same directory as the subject of the test, for example, `\app\lib\headers.server.ts` and `\app\lib\__tests__\headers.server.ts`
<!-- - TODO:yet to be listed integration tests location -->

## Testing Tools

We are using [Jest](https://jestjs.io/) for unit testing and [Playwright](https://playwright.dev/) for integration tests.

To execute the Jest unit tests, run `npm run test` or `npm test` in a terminal. Jest will automatically find and execute all of the tests defined in `__test__` folders.

<!-- TODO: To run the integration tests, run a command I forgot off the top of my head. -->

It is helpful to install the **Playwright Test for VSCode** extension by Microsoft.

See Playwright's [getting started guide](https://playwright.dev/docs/getting-started-vscode) for more information.

## Guidelines

We currently have approximately 5% coverage. While we don't have a specific percentage goal, we are hoping to increase this in future updates. Existing tests and upcoming additions will be focused on features we think most need it.

In general, we do not want to decrease test coverage. New PR's should have tests as appropriate. When contributing new features and bug fixes, consider whether or not the change decreases test coverage. If so, please include tests with your contribution if possible.

Any tests that set up a DB or other shared resource should be self-cleaning to keep from polluting the environment for other tests.
