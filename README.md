# rout3r

An open source web3 based project that routes users via user defined short cuts.

This is a [React](https://reactjs.org) + [TypeScript](https://www.typescriptlang.org/) + [Chakra UI](https://chakra-ui.com) boilerplate to be built with [Vite](https://vitejs.dev). It also includes [Husky](https://typicode.github.io/husk) and a pre-commit hook that runs `yarn format`.

## What's inside?

- [ReactJS](https://reactjs.org)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Chakra UI](https://chakra-ui.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Jest](https://jestjs.io)
- [Testing Library](https://testing-library.com)
- [Eslint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Husky](https://typicode.github.io/husky)

\+ other smaller dependencies

## Getting started

1. Install yarn dependencies

   ```bash
   ## install yarn dependencies
   yarn
   ```

2. Install forge by following instructions here: https://book.getfoundry.sh/getting-started/installation

3. Serve with hot reload at http://localhost:5173.

   ```bash
   yarn dev
   ```

4. (Optionally) run in with local chain

   ```bash
   yarn dev --full
   ```

## Develop the Contracts

All contract logic is located in the `contracts` directory. To compile and deploy the contracts see the [README](./contracts/README.md) in the `contracts` directory.

## Recommended VS Code extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [vscode-styled-components](https://marketplace.visualstudio.com/items?itemName=jpoissonnier.vscode-styled-components)

## Other commands

### Lint commands

- Run eslint
  ```bash
  yarn lint
  ```
- Run eslint with fixing
  ```bash
  yarn lint:fix
  ```

### Build commands

```bash
yarn build
```

### Test commands

- Run tests with coverage (will open the coverage if all tests succeed)
  ```bash
  yarn test
  ```
- Watch tests
  ```bash
  yarn test:watch
  ```

### Deploy command

```bash
yarn deploy
```

## License

This project is licensed under the GPL License.
