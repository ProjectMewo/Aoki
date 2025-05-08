import { build } from 'esbuild';

const envVariables = [
  'TOKEN_DEV', 'APPID_DEV', 'TOKEN', 'APPID', 'GUILD', 'MONGO_URI',
  'OSU_KEY', 'OSU_ID', 'OSU_SECRET', 'OSU_DEV_ID', 'OSU_DEV_SECRET',
  'DBL_TOKEN', 'IMG_KEY', 'WOLFRAM_KEY', 'SCREENSHOT_KEY', 'RAPID_KEY',
  'WAIFU_IT', 'PORT', 'GELBOORU_KEY', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'
];

const define = envVariables.reduce((acc: { [key: string]: string }, key) => {
  acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
  return acc;
}, {});

build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  sourcemap: false,
  keepNames: true,
  format: "esm",
  platform: 'node',
  target: 'node18',
  outfile: 'dist/main.js',
  define,
}).catch(() => process.exit(1));
