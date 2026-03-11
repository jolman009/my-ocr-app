module.exports = {
  preset: "jest-expo",
  testMatch: ["**/test/**/*.test.ts?(x)"],
  roots: ["<rootDir>", "<rootDir>/../../packages/shared/src"],
  moduleNameMapper: {
    "^@receipt-ocr/shared$": "<rootDir>/../../packages/shared/src/index.ts",
    "^@receipt-ocr/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1"
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
  ],
  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"]
};
