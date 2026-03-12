// Removed old ensure-peer-deps mocking

// Instead, ensure any async behaviors get silenced if 
// react-test-renderer throws inside its own renderer code.
process.env.RTL_SKIP_AUTO_CLEANUP = 'true';
process.env.RTL_SKIP_PEER_DEPS_CHECK = 'true';
