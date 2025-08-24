/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "jsdom", // 还是 jsdom
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: false, // 明确告诉 ts-jest 用 CommonJS 输出
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!multiformats|uint8arrays|libsodium-wrappers)/",
  ],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: ["dist/*"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["__tests__/helpers/*"],
  moduleNameMapper: {
    "@interchain-ui/react/styles": "jest-transform-stub",
  },
};
