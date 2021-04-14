# Flakecss

A minimalist css in javascript renderer.

## Installation

```shell
$ npm install flakecss
or
$ yarn add flakecss
```

## Usage

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
      bo
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
