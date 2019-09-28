module.exports = {
  "env": {
      "browser": true,
      "es6": true,
      "amd": true,
      "node": true
  },
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "parser": "babel-eslint",
  "parserOptions": {
      "ecmaFeatures": {
          "experimentalObjectRestSpread": true,
          "jsx": true
      },
      "sourceType": "module"
  },
  "plugins": [
      "react",
      "node"
  ],
  "rules": {
      "eqeqeq": ["warn", "never"],    // 不允许使用 ==
      "indent": ["warn", 2],           // 缩进2个空格
      "quotes": ["warn", "single"],    // 使用单引号
      "semi": ["warn", "never"],      // 不使用分号
      "no-console": ["warn", { allow: ["warn", "error"] }]    // 不允许console
  }
};