/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  webpack: (config) => {
    config.resolve.alias['@'] = require('path').join(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;
