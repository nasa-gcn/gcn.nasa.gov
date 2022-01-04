# General Coordinates Network Web Site

This is a proposed implementation of the General Coordinates Network web site using Remix, a web framework built on React and written in TypeScript (a strongly typed superset of JavaScript). It combines the server side code (back end) and browser side code (front end) in a single codebase (sometimes called an "isomorphic application"). This project was bootstrapped using the create-remix template.

- [Remix Docs](https://remix.run/docs)

## Directory structure

app/components
: Custom React components

app/lib
: TypeScript modules that are not React components

app/routes
: Put all Web pages in here. Use Markdown for static pages or TSX (TypeScript with JSX) for reactive pages.

app/root.tsx
: Main route for the whole web site. Edit this file to customize the page template.

prisma/schema.prisma
: Back-end database schema.

## Installation

Before you begin, make sure that you have npm installed. You can get it from
[the NodeJS download site](https://nodejs.org/en/download/).

Then, clone this repository, cd into the cloned repository directory, and run
this command from your terminal:

```sh
npm install
```

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
