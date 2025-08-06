const { TestEnvironment } = require('jest-environment-jsdom');

class CustomTestEnvironment extends TestEnvironment {
  constructor(...args) {
    super(...args);

    // Set React 19 act environment flag
    this.global.IS_REACT_ACT_ENVIRONMENT = true;
    this.global.globalThis = this.global;
  }
}

module.exports = CustomTestEnvironment;
