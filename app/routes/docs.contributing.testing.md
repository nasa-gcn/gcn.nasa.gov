---
handle:
  breadcrumb: Testing
---

# Testing

Adding both unit and integration tests offers numerous benefits. Unit tests allow us to verify the correctness of individual components or units of code, ensuring they function as expected in isolation. This promotes reliability, simplifies debugging, and facilitates maintenance by catching regressions early in the development process. Integration tests evaluate the interactions between different components or modules, ensuring that they work together seamlessly. By detecting integration issues early, it enhances system stability and reduces the likelihood of bugs in production.

## Testing Tools

We are using [Jest](https://jestjs.io/) for unit testing and [Playwright](https://playwright.dev/) for integration tests.

To execute the Jest unit tests, run `npm run test` or `npm test` in a terminal. Jest will automatically find and execute all of the tests defined in `__test__` folders.

The Playwright tests are excluded from the Jest tests by including their directory in the `modulePathIgnorePatterns` property of the `package.json` file.

It is helpful to install the [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension by Microsoft for running Playwright tests. These can be run through the terminal with `npx playwright test` or through the Testing tab in VSCode.

Our tests currently exist in a few places:

- [\_\_tests\_\_](https://github.com/nasa-gcn/gcn.nasa.gov/tree/main/__tests__) in the project root contains some unit tests for the circulars library functions and the cognito server, as well as some component tests.
- Some tests are defined in a `__tests__` folder in the same directory as the subject of the test, for example, [/app/lib/headers.server.ts](https://github.com/nasa-gcn/gcn.nasa.gov/blob/main/app/lib/headers.server.ts) and [/app/lib/\_\_tests\_\_/headers.server.ts](https://github.com/nasa-gcn/gcn.nasa.gov/blob/main/app/lib/__tests__/headers.server.ts)
- [\_\_playwright\_\_](https://github.com/nasa-gcn/gcn.nasa.gov/tree/main/__playwright__) in the project root contains the integration tests. Tests in the folder are ignored by jest.

## Generating Integration Tests

Playwright can record actions in your browser which can then be saved as an integration test.

To start the recording browser, run the following command:

```sh
npx playwright codegen localhost:3333
```

See the [Playwright codegen intro](https://playwright.dev/docs/codegen-intro) for more infomation on codegen.

## Guidelines

We currently have approximately 5% coverage. While we don't have a specific percentage goal, we are hoping to increase this in future updates. Existing tests and upcoming additions will be focused on features we think most need it.

New PRs should have tests as appropriate. When contributing new features and bug fixes, consider whether or not the change decreases test coverage. If so, please include tests with your contribution if possible.

Any tests that set up a database or other shared resource should be self-cleaning to keep from polluting the environment for other tests.
