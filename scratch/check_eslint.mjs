import nextConfig from './node_modules/eslint-config-next/index.js';
console.log('Next Config Type:', Array.isArray(nextConfig) ? 'Array' : typeof nextConfig);
if (Array.isArray(nextConfig)) {
  console.log('Next Config Length:', nextConfig.length);
  nextConfig.forEach((cfg, i) => {
    if (cfg.plugins) {
      console.log(`Config ${i} plugins:`, Object.keys(cfg.plugins));
    }
  });
} else if (nextConfig.plugins) {
  console.log('Next Config plugins:', Object.keys(nextConfig.plugins));
}
