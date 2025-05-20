Bun.build({
  entrypoints: ['src/main.ts'],
  minify: true,
  target: 'bun',
  sourcemap: 'none',
  format: 'esm',
  outdir: 'dist',
  // be very careful with the output file
  // your environment variables are in the built file
  env: 'inline'
}).catch((err) => {
  console.log(err);
  process.exit(1);
});