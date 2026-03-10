import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },

  turbopack: {
    // recomendado para que Turbopack "reconozca" estas extensiones
    resolveExtensions: [
      '.glsl', '.vs', '.fs', '.vert', '.frag',
      '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json',
    ],

    rules: {
      // ✅ un solo glob para todos tus shaders
      '*.{glsl,vs,fs,vert,frag}': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },

  // opcional (solo si corres con --webpack)
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;