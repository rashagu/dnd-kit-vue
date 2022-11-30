# This is a Vue adaptation based on [@dnd-kit](https://github.com/clauderic/dnd-kit)

---
<p align="center">
  <a href="https://dndkit.com">
    <img alt="@dnd-kit – the modern drag & drop toolkit for React" src=".github/assets/dnd-kit-hero-banner.svg">
  </a>
</p>

<p align="left">
  <a href="https://www.npmjs.com/package/@dnd-kit-vue/core"><img src="https://img.shields.io/npm/v/@dnd-kit-vue/core.svg" alt="Stable Release" /></a>
  <a href="https://github.com/rashagu/dnd-kit-vue/actions"><img src="https://badgen.net/github/checks/kousum/dnd-kit-vue" alt="Build status" /></a>
</p>

## Documentation

To learn how to get started with **dnd kit**, visit the official documentation website. You'll find in-depth API documentation, tips and guides to help you build drag and drop interfaces.

<p>
<a href="https://docs.dndkit.com">
<img alt="Visit @dnd-kit documentation" src=".github/assets/documentation.svg" width="200" />
</a>
</p>

#### Synthetic events

**dnd kit** also uses [SyntheticEvent listeners](https://reactjs.org/docs/events.html) for the activator events of all sensors, which leads to improved performance over manually adding event listeners to each individual draggable node.

<p align="center">
<img alt="Playful illustration of draggable and droppable concepts. A robot picks up a draggable card and moves it over a droppable container." src=".github/assets/concepts-illustration.svg" width="75%" />
</p>

## Working in the `@dnd-kit-vue` repository

### Packages contained within this repository

- `@dnd-kit-vue/core`
- `@dnd-kit-vue/accessibility`
- `@dnd-kit-vue/sortable`
- `@dnd-kit-vue/modifiers`
- `@dnd-kit-vue/utilities`

### Installing dependencies

You'll need to install all the dependencies in the root directory.

```sh
pnpm install && pnpm build:all
```

This will install all dependencies in each project, build them, and symlink them via Lerna

### Development workflow

In one terminal, run `pnpm dev` in parallel:

```sh
pnpm dev
```
