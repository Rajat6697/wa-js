/*!
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Eazybe slim entry point.
 *
 * Exposes only the WA-JS namespaces the Eazybe extension actually calls, built
 * under the global `QRP` (see webpack.qrp.config.js).
 *
 * This file is ADDITIVE — it does not modify upstream src/index.ts, so merging
 * new wa-js releases stays conflict-free. On each upstream merge, diff this file
 * against src/index.ts and re-sync the export list if upstream renamed/moved a
 * namespace we keep.
 *
 * Dropped vs upstream src/index.ts:
 *   blocklist, lists, call, cart, catalog, community, newsletter, order,
 *   privacy, status, and the `gtag` telemetry side-effect import.
 */

/* eslint-disable simple-import-sort/exports */
import './config';
import './deviceName';

// NOTE: upstream `import './gtag';` is intentionally dropped here to remove
// WA-JS's Google Analytics telemetry ping.
import * as loader from './loader';

export { isFullReady, isInjected, isReady } from './loader';
export { loader };

export { config, Config } from './config';

// ── Only the namespaces the Eazybe extension uses on window.QRP ──
export * as chat from './chat';
export * as conn from './conn';
export * as contact from './contact';
export * as ev from './eventEmitter';
export * as group from './group';
export * as labels from './labels';
export * as profile from './profile';
export * as util from './util';
export * as whatsapp from './whatsapp';

export {
  emit,
  emitAsync,
  eventNames,
  getMaxListeners,
  hasListeners,
  listenerCount,
  listeners,
  listenersAny,
  listenTo,
  many,
  off,
  offAny,
  on,
  onAny,
  once,
  prependAny,
  prependListener,
  prependMany,
  prependOnceListener,
  removeAllListeners,
  removeListener,
  setMaxListeners,
  stopListeningTo,
  waitFor,
} from './eventEmitter';

declare const __VERSION__: string;
declare const __SUPPORTED_WHATSAPP_WEB__: string;
export const version = __VERSION__;
export const supportedWhatsappWeb = __SUPPORTED_WHATSAPP_WEB__;
export const license = 'Apache-2.0';

loader.injectLoader();
