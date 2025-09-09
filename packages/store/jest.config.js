/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        babelConfig: false,
        tsconfig: "tsconfig.json",
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uint8arrays|multiformats|@walletconnect|@interchain-kit|base64-js|@noble|@cosmjs|uuid|@solana|jayson)/)",
  ],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: ["dist/*"],
  globals: {
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
  },
  moduleNameMapper: {
    "^@interchain-kit/core$": "<rootDir>/../core/src/index.ts",
    "^uint8arrays$": "<rootDir>/__mocks__/uint8arrays.js",
    "^@walletconnect/universal-provider$":
      "<rootDir>/__mocks__/walletconnect.js",
    "^@walletconnect/sign-client$": "<rootDir>/__mocks__/walletconnect.js",
    "^@walletconnect/core$": "<rootDir>/__mocks__/walletconnect.js",
    "^@walletconnect/utils$": "<rootDir>/__mocks__/walletconnect.js",
    "^base64-js$": "<rootDir>/__mocks__/base64-js.js",
    "^uuid$": "<rootDir>/__mocks__/uuid.js",
  },
};
