module.exports = {
  preset: "jest-expo",
  testMatch: ["**/test/**/*.test.ts?(x)"],
  roots: ["<rootDir>", "<rootDir>/../../packages/shared/src"],
  moduleNameMapper: {
    "^@receipt-ocr/shared$": "<rootDir>/../../packages/shared/src/index.ts",
    "^@receipt-ocr/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1"
  }
};
