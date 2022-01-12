# General Coordinates Network Web Site

This is a proposed implementation of the General Coordinates Network web site using Remix, a web framework built on React and written in TypeScript (a strongly typed superset of JavaScript). It combines the server side code (back end) and browser side code (front end) in a single codebase (sometimes called an "isomorphic application"). This project was bootstrapped using the create-remix template.

- [Remix Docs](https://remix.run/docs)

## Directory structure

- [app/components](app/components): Reusable custom React components.
- [app/lib](app/lib): Reusable TypeScript modules that are not React components.
- [app/root.tsx](app/root.tsx): Main route for the whole web site. Edit this file to customize the page template.
- [app/routes](app/routes): Put all Web pages in here. Use Markdown for static pages or TSX (TypeScript with interleaved HTML markup) for reactive pages.
- [app/routes/api](app/routes/api): Put API endpoints in here.
- [prisma/schema.prisma](prisma/schema.prisma): Back-end database schema.

## Installation

Before you begin, make sure that you have npm installed. You can get it from
[the NodeJS download site](https://nodejs.org/en/download/).

Then, clone this repository, cd into the cloned repository directory, and run
this command from your terminal:

```sh
npm install
```

## Configuration

In this directory, create a file called `.env` with the following contents.
Replace the value of `SESSION_SECRET` with a random string.

```sh
# Signing key for session cookies. Fill in with a long, random string.
# Some possible commands to generate it:
#
# With pwgen (https://linux.die.net/man/1/pwgen):
#  $ pwgen -sn 64
#
# With Python:
#  $ python -c 'import secrets; print(secrets.token_urlsafe(64))'

SESSION_SECRET=fill-me-in

# This was inserted by `prisma init`:
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#using-environment-variables

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server and MongoDB (Preview).
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="file:./dev.db"

# OIDC provider info for Cognito user pool.
# For parts of the site that require authentication,
# these lines must be uncommented and filled in.

# OIDC_PROVIDER_URL=fill-me-in
# OIDC_CLIENT_ID=fill-me-in
# OIDC_CLIENT_SECRET=fill-me-in

# Cognito user pool ID for client credential vending machine.
# The client credential vending machine will not work properly without this.

# COGNITO_USER_POOL_ID=fill-me-in
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
