---
handle:
  breadcrumb: Feature Flags
---

# Feature Flags

The GCN project uses [feature flags](https://www.atlassian.com/continuous-delivery/principles/feature-flags) to turn on parts of the web site that are under development. Feature flags allow us to merge new capabilities into the Git main branch without exposing them immediately to end users.

## Configuration

On the production web site (https://gcn.nasa.gov), all feature flags are disabled by default.

Turn feature flags on in your local development environment by adding them to the `GCN_FEATURES` [environment variable in your `.env` file](configuration). The format of this environment variable is a comma-separated list.

For example, if you set `GCN_FEATURES=ANTIGRAVITY,TIME_TRAVEL,PYROKINESIS`, then the features `ANTIGRAVITY`, `TIME_TRAVEL`, and `PYROKINESIS` are enabled.

## Usage in Server Code

To customize the server-side behavior of the code, use the `feature()` function. For example, to make a page return a 404 Not Found error if a feature is off, add the following code:

```text
import { feature } from '~/lib/env.server'

export function loader() {
  if (feature('PYROKINESIS')) return null
  else throw new Response(null, { status: 404 })
}

# Pyrokinesis

Fwoosh!
```

## Usage in Client Side Code

In client-side code (Markdown documents and React components), use the `useFeature()` [React hook](https://react.dev/learn/reusing-logic-with-custom-hooks) to add content that is displayed conditionally if a feature flag is enabled.

```text
import { useFeature } from '~/root'

# Superpowers

## X-ray vision

GCN can see through walls!

## Antigravity

It's a bird! It's a plane! It's GCN! {
  // Display text if the feature is ON
  useFeature('ANTIGRAVITY') && 'Now with less gravity.'
}

## Time Travel

GCN can travel through time. {
  // Display text if the feature is OFF
  useFeature('TIME_TRAVEL') || 'Time travel is coming soon.'
}

## Pyrokinesis

GCN can light things on fire with its mind! {
  // Display different text whether the feature is ON or OFF
  useFeature('PYROKINESIS') ? 'Fwoosh!' : 'Pyrokinesis is coming soon!'
}
```

**_Important_**: Although you can use the `useFeature()` method above in Markdown files, it does not render Markdown that is inside the conditionally displayed text. If you need conditionally rendered Markdown, then use the `<WithFeature>` or `<WithoutFeature>` React component.

```text
import { WithFeature, WithoutFeature } from '~/root'

# Superpowers

## X-ray vision

GCN can see through walls!

<WithFeature pyrokinesis>
  ## Pyrokinesis

  Fwoosh!
</WithFeature>

<WithoutFeature walkThroughWalls>
  ## Walking through walls

  GCN cannot currently walk through walls, although this feature is in development.
</WithoutFeature>
```
