# Flakecss

A minimalist css in javascript renderer. Our mission
is to be as small as possible while supporting all of the important use cases.

## Features

- media queries
- pseudo-classes/pseudo-selectors
- your favorite css properties
- SSR

## Installation

```shell
$ npm i @sightread/flakecss
or
$ yarn add @sightread/flakecss
```

## Usage

flakecss will bundle and insert all calls into a single target element.

##### In your desired target component

```javascript
import { extractCss, FLAKE_STYLE_ID } from '@sightread/flakecss'

function RootComponent() {
  // ... some react stuff

  return (
    <html>
      <head>
        ...
        <style id={FLAKE_STYLE_ID} dangerouslySetInnerHTML={{ __html: extractCss() }} />
      </head>
      ...
    </html>
  )
}
```

```javascript
import { css, mediaQuery } from 'flakecss'

const classes = css({
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingBottom: '72px',
    [mediaQuery.up(901)]: {
      width: '50%',
    },
    [mediaQuery.down(900)]: {
      width: '100%',
      padding: '0px 15px',
    },
    '& p': {
      fontSize: 18,
      color: 'lightgrey',
      transition: '300ms',
    },
    '&:hover': {
      backgroundColor: 'white',
  },
})

function MyComponent() {
    // ... react stuff

    return (
        <div>
            <div className={classes.leftSection}>
            {/* more jsx*/}
            </div>
        </div>
    )
}
```

## License

MIT
