const { peerDependencies } = require('../package.json');
const { resolve } = require('path');
const { writeFileSync } = require('fs');
const mkdirp = require("mkdirp");
const ncc = require("@zeit/ncc");

const DIST_DIR = resolve(__dirname, '..', 'dist');

async function build() {
  const entry = resolve(__dirname, '..', 'index.ts');
  const { code, assets } = await ncc(entry, {
    externals: Object.keys(peerDependencies),
    minify: true,
  });

  if (Object.keys(assets).length)
    console.error("New unexpected assets are being emitted for", entry);


  mkdirp.sync(resolve(DIST_DIR));
  writeFileSync(resolve(DIST_DIR, "index.js"), code);
}

build();
