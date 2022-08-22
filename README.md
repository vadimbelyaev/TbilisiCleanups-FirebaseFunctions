# TbilisiCleanups-FirebaseFunctions
Firebase Cloud Functions for the [TbilisiCleanups app](https://github.com/vadimbelyaev/TbilisiCleanups).

## Development environment setup

1. Install nvm (https://github.com/nvm-sh/nvm)
2. Using nvm, install Node.js v16.
3. Install Firebase CLI:
```shell
npm install -g firebase-tools
```

## How to change and deploy cloud functions

1. Edit the file `functions/index.js`.
2. Deploy the updated functions to Firebase:
```shell
firebase deploy --only functions
```
3. In case of a successful deployment, commit and push.
