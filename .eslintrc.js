module.exports = {
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "es6": true,
    "browser": true,
  },
  "rules": {
    "indent": ["error"],
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}]
  }
};
