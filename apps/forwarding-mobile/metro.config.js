const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so Metro picks up changes in apps/mobile and
// packages/shared when they're imported via the @receipt-radar/mobile/*
// alias (see babel.config.js + tsconfig.json).
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules")
];

module.exports = config;
