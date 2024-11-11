module.exports = {
  env: {
    browser: true, // Enables browser globals like `window` and `document`
    node: true, // Enables Node.js global variables and Node.js scoping
    es2021: true, // Supports modern ECMAScript features
  },
  extends: [
    "airbnb", // Airbnb's base style guide
    "prettier", // Turns off ESLint rules that might conflict with Prettier
    "plugin:prettier/recommended", // Enables Prettier as an ESLint rule
  ],
  parserOptions: {
    ecmaVersion: 12, // ECMAScript 2021 syntax support
    sourceType: "commonjs", // Uses ES Modules (or change to "commonjs" if needed)
  },
  rules: {
    "prettier/prettier": "warn",
    "no-param-reassign": "off",
    "no-unused-vars": "warn",
    "no-console": "warn", // Allows `console.log` for debugging
    "no-underscore-dangle": "off", // Allows underscores in variable names
    radix: "off",
    "func-names": "off",
    "consistent-return": "off",
    "object-shorthand": "off",
  },
};
