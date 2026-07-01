/*!
 * Eazybe slim + renamed WA-JS build config.
 *
 * Inherits the upstream webpack.config.js and overrides ONLY:
 *   - entry            -> src/index.qrp.ts (slim module surface)
 *   - output.filename  -> qrp-wa.js        (distinct from the full build)
 *   - library.name     -> QRP              (global becomes window.QRP, not window.WPP)
 *
 * Keeping this additive (inheriting the base config instead of duplicating it)
 * means upstream changes to webpack.config.js are picked up automatically and
 * merges stay clean.
 *
 * Build with:  npm run build:qrp   (output: dist/qrp-wa.js)
 */
const base = require('./webpack.config.js');

module.exports = (env, argv) => {
  const config = base(env, argv);
  config.entry = './src/index.qrp.ts';
  config.output.filename = 'qrp-wa.js';
  config.output.library.name = 'QRP';
  return config;
};
