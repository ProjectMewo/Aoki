// save build means no token or secret is included in the distribution file
// after a safe build, the built file in dist folder must be paired with a .env file to use
// to disable safe build aka build so that you don't have to include a .env file (NOT RECOMMENDED),
// add `env: 'inline'` to the Bun.build options.
// https://bun.sh/docs/bundler#env
Bun.build({
  entrypoints: ['src/main.js'],
  minify: true,
  sourcemap: 'none',
  format: 'esm',
  target: 'bun',
  outdir: 'dist',
  external: ['bun'],
  drop: ['debugger'],
}).catch(() => process.exit(1));