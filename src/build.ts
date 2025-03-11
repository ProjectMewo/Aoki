Bun.build({
  entrypoints: ['src/main.ts'],
  minify: true,
  sourcemap: 'none',
  format: 'esm',
  target: 'bun',
  outdir: 'dist',
  packages: "external",
  // this will replace ALL `process.env` calls
  // in your code with the RAW STRINGS you set in .env
  // make sure you DO NOT distribute the built file publicly!
  // you risk exposing all of the keys in .env to the internet!
  env: 'inline',
  drop: ['debugger']
}).catch(() => process.exit(1));