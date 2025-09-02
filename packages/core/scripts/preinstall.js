if (process.env.npm_execpath.indexOf('pnpm') === -1) {
  console.error('Please use pnpm to install dependencies in this repository');
  console.error('Installation using npm or yarn is not supported');
  process.exit(1);
}
