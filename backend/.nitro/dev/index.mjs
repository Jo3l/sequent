import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, removeResponseHeader, appendResponseHeader, setResponseHeader, getCookie, getHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, readBody, getQuery as getQuery$1, deleteCookie, setHeader, getMethod } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs';
import { Server } from 'node:http';
import { resolve, dirname, join, extname } from 'node:path';
import nodeCrypto, { createHash } from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { jwtVerify, SignJWT } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/jose@5.10.0/node_modules/jose/dist/node/esm/index.js';
import destr from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs';
import { createHooks } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/node-mock-http@1.0.4/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/ufo@1.6.4/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/unstorage@1.17.5_db0@0.3.4_better-sqlite3@11.10.0__ioredis@5.11.1/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/unstorage@1.17.5_db0@0.3.4_better-sqlite3@11.10.0__ioredis@5.11.1/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs';
import { klona } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs';
import { getContext } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/unctx@2.5.0/node_modules/unctx/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/youch-core@0.3.3/node_modules/youch-core/build/index.js';
import { Youch } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/youch@4.1.1/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/source-map@0.7.6/node_modules/source-map/source-map.js';
import { existsSync, mkdirSync, promises, readFileSync, writeFileSync, unlinkSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/index.mjs';
import { execSync } from 'node:child_process';
import Database from 'file:///home/jo3l/www/sequent/node_modules/.pnpm/better-sqlite3@11.10.0/node_modules/better-sqlite3/lib/index.js';

const serverAssets = [{"baseName":"server","dir":"/home/jo3l/www/sequent/backend/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/home/jo3l/www/sequent/backend/.nitro/cache"}));
storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/home/jo3l/www/sequent/backend"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/home/jo3l/www/sequent/backend/server"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/home/jo3l/www/sequent/backend/.nitro"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"/home/jo3l/www/sequent/backend/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {}
  },
  "jwtSecret": {
    "default": "change-me-in-production-sequent-jwt"
  },
  "comicVineApiKey": {
    "default": ""
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

getContext("nitro-app", {
  asyncContext: undefined,
  AsyncLocalStorage: void 0
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json ?? !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

function defineNitroPlugin(def) {
  return def;
}

let _db = null;
function getDataDir() {
  const cwd = process.cwd();
  if (existsSync(resolve(cwd, "data"))) {
    return resolve(cwd, "data");
  }
  const alt = resolve(cwd, "..", "data");
  if (!existsSync(alt)) mkdirSync(alt, { recursive: true });
  return alt;
}
function getDb() {
  if (!_db) {
    const dataDir = getDataDir();
    const dbPath = resolve(dataDir, "comics.db");
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      cover_path TEXT DEFAULT '',
      title TEXT DEFAULT '',
      issue_number TEXT DEFAULT '',
      volume TEXT DEFAULT '',
      year TEXT DEFAULT '',
      publisher TEXT DEFAULT '',
      page_count INTEGER DEFAULT 0,
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS library_folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      label TEXT DEFAULT '',
      type TEXT DEFAULT 'local' CHECK(type IN ('local', 'smb', 'webdav')),
      smb_host TEXT DEFAULT '',
      smb_share TEXT DEFAULT '',
      smb_username TEXT DEFAULT '',
      smb_password TEXT DEFAULT '',
      smb_domain TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

const _7uVHRI4YzlCEO4R_X0dFDDvt6O6vfifRmJQ1KxeG5Q = defineNitroPlugin(() => {
  getDb();
  console.log("\u2705 Database initialized");
});

const plugins = [
  _7uVHRI4YzlCEO4R_X0dFDDvt6O6vfifRmJQ1KxeG5Q
];

const assets = {
  "/index.mjs": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c5f6-kCYgPkJcYFJWHyUcjsanqfoQj5k\"",
    "mtime": "2026-07-22T12:52:54.021Z",
    "size": 116214,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"6a006-xy06owf0+K/bqAKYHL5guzFTWIg\"",
    "mtime": "2026-07-22T12:52:54.021Z",
    "size": 434182,
    "path": "index.mjs.map"
  }
};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _k0910D = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

function getSecret() {
  const config = useRuntimeConfig();
  return new TextEncoder().encode(config.jwtSecret || "sequent-default-secret");
}
async function createToken(payload) {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(getSecret());
}
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

const PUBLIC_PREFIXES = ["/api/auth/login", "/api/auth/setup", "/api/auth/logout", "/api/health", "/api/covers/"];
const _685Hes = defineEventHandler(async (event) => {
  const path = event.path;
  for (const prefix of PUBLIC_PREFIXES) {
    if (path.startsWith(prefix)) return;
  }
  if (!path.startsWith("/api/")) return;
  const cookieToken = getCookie(event, "sequent_token");
  const authHeader = getHeader(event, "Authorization");
  let rawToken = cookieToken != null ? cookieToken : null;
  if (!rawToken && (authHeader == null ? void 0 : authHeader.startsWith("Bearer "))) {
    rawToken = authHeader.slice(7);
  }
  if (!rawToken) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" });
  }
  const payload = await verifyToken(rawToken);
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" });
  }
  event.context.user = payload;
});

const _lazy_2ZCFzo = () => Promise.resolve().then(function () { return login_post$1; });
const _lazy_SIHFIJ = () => Promise.resolve().then(function () { return logout_post$1; });
const _lazy_xrWJai = () => Promise.resolve().then(function () { return me_get$1; });
const _lazy_XuRYHu = () => Promise.resolve().then(function () { return password_patch$1; });
const _lazy_jCSBOL = () => Promise.resolve().then(function () { return setup_get$1; });
const _lazy_iJhIs3 = () => Promise.resolve().then(function () { return setup_post$1; });
const _lazy_XmgsFS = () => Promise.resolve().then(function () { return _id_$5; });
const _lazy_VW37JE = () => Promise.resolve().then(function () { return match_post$1; });
const _lazy_qcCfk5 = () => Promise.resolve().then(function () { return _page__get$1; });
const _lazy_eI4fmk = () => Promise.resolve().then(function () { return suggestions_get$1; });
const _lazy_bUr7jW = () => Promise.resolve().then(function () { return index_get$3; });
const _lazy_3OwK9t = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_2sj5QS = () => Promise.resolve().then(function () { return health_get$1; });
const _lazy_h6TUPC = () => Promise.resolve().then(function () { return _id_$3; });
const _lazy_0Wcp55 = () => Promise.resolve().then(function () { return index$3; });
const _lazy_Toe1g1 = () => Promise.resolve().then(function () { return scan_post$1; });
const _lazy_CkpopA = () => Promise.resolve().then(function () { return index$1; });
const _lazy_k1JNzC = () => Promise.resolve().then(function () { return _id_$1; });
const _lazy_a1W4iO = () => Promise.resolve().then(function () { return index_get$1; });
const _lazy_GyKH99 = () => Promise.resolve().then(function () { return index_post$1; });

const handlers = [
  { route: '', handler: _k0910D, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _685Hes, lazy: false, middleware: true, method: undefined },
  { route: '/api/auth/login', handler: _lazy_2ZCFzo, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_SIHFIJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_xrWJai, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/password', handler: _lazy_XuRYHu, lazy: true, middleware: false, method: "patch" },
  { route: '/api/auth/setup', handler: _lazy_jCSBOL, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/setup', handler: _lazy_iJhIs3, lazy: true, middleware: false, method: "post" },
  { route: '/api/comics/:id', handler: _lazy_XmgsFS, lazy: true, middleware: false, method: undefined },
  { route: '/api/comics/:id/match', handler: _lazy_VW37JE, lazy: true, middleware: false, method: "post" },
  { route: '/api/comics/:id/pages/:page', handler: _lazy_qcCfk5, lazy: true, middleware: false, method: "get" },
  { route: '/api/comics/:id/suggestions', handler: _lazy_eI4fmk, lazy: true, middleware: false, method: "get" },
  { route: '/api/comics', handler: _lazy_bUr7jW, lazy: true, middleware: false, method: "get" },
  { route: '/api/covers/:id', handler: _lazy_3OwK9t, lazy: true, middleware: false, method: "get" },
  { route: '/api/health', handler: _lazy_2sj5QS, lazy: true, middleware: false, method: "get" },
  { route: '/api/library/:id', handler: _lazy_h6TUPC, lazy: true, middleware: false, method: undefined },
  { route: '/api/library', handler: _lazy_0Wcp55, lazy: true, middleware: false, method: undefined },
  { route: '/api/scan', handler: _lazy_Toe1g1, lazy: true, middleware: false, method: "post" },
  { route: '/api/settings', handler: _lazy_CkpopA, lazy: true, middleware: false, method: undefined },
  { route: '/api/users/:id', handler: _lazy_k1JNzC, lazy: true, middleware: false, method: undefined },
  { route: '/api/users', handler: _lazy_a1W4iO, lazy: true, middleware: false, method: "get" },
  { route: '/api/users', handler: _lazy_GyKH99, lazy: true, middleware: false, method: "post" }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body || {};
  if (!(username == null ? void 0 : username.trim()) || !(password == null ? void 0 : password.trim())) {
    throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
  }
  const db = getDb();
  const user = db.prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?").get(username.trim());
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }
  const { createHash } = await import('node:crypto');
  const hash = createHash("sha256").update(password.trim()).digest("hex");
  if (hash !== user.password_hash) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }
  const token = await createToken({
    userId: user.id,
    username: user.username,
    role: user.role
  });
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
});

const login_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: login_post
});

const logout_post = defineEventHandler(async (event) => {
  deleteCookie(event, "sequent_token");
  return { ok: true };
});

const logout_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: logout_post
});

const me_get = defineEventHandler(async (event) => {
  const ctxUser = event.context.user;
  if (!ctxUser) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  return {
    user: {
      id: ctxUser.userId,
      username: ctxUser.username,
      role: ctxUser.role
    }
  };
});

const me_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: me_get
});

const password_patch = defineEventHandler(async (event) => {
  const currentUser = event.context.user;
  if (!currentUser) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  const body = await readBody(event);
  const { currentPassword, newPassword } = body || {};
  if (!(currentPassword == null ? void 0 : currentPassword.trim()) || !(newPassword == null ? void 0 : newPassword.trim())) {
    throw createError({ statusCode: 400, statusMessage: "Current and new password are required" });
  }
  if (newPassword.trim().length < 6) {
    throw createError({ statusCode: 400, statusMessage: "New password must be at least 6 characters" });
  }
  const db = getDb();
  const user = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(currentUser.userId);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }
  const currentHash = createHash("sha256").update(currentPassword.trim()).digest("hex");
  if (currentHash !== user.password_hash) {
    throw createError({ statusCode: 401, statusMessage: "Current password is incorrect" });
  }
  const newHash = createHash("sha256").update(newPassword.trim()).digest("hex");
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, currentUser.userId);
  return { ok: true };
});

const password_patch$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: password_patch
});

const setup_get = defineEventHandler(async () => {
  const db = getDb();
  const admin = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
  return { needsSetup: admin.count === 0 };
});

const setup_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: setup_get
});

const setup_post = defineEventHandler(async (event) => {
  const db = getDb();
  const existing = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
  if (existing.count > 0) {
    throw createError({ statusCode: 400, statusMessage: "Setup already completed" });
  }
  const body = await readBody(event);
  const { username, password } = body || {};
  if (!(username == null ? void 0 : username.trim()) || !(password == null ? void 0 : password.trim())) {
    throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
  }
  const hash = createHash("sha256").update(password.trim()).digest("hex");
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username.trim(), hash);
  const user = db.prepare("SELECT id, username, role FROM users WHERE username = ?").get(username.trim());
  const token = await createToken({ userId: user.id, username: user.username, role: "admin" });
  return { token, user: { id: user.id, username: user.username, role: "admin" } };
});

const setup_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: setup_post
});

const _id_$4 = defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid comic ID" });
  }
  const db = getDb();
  const row = db.prepare(`
    SELECT id, file_path, file_name, cover_path, title, issue_number,
           volume, year, publisher, page_count, slug, metadata_json, created_at, updated_at
    FROM comics WHERE id = ?
  `).get(id);
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "Comic not found" });
  }
  return {
    comic: {
      ...row,
      metadata: JSON.parse(row.metadata_json || "{}"),
      metadata_json: void 0
    }
  };
});

const _id_$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id_$4
});

function getDefaultDbPath() {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, "../localcvdb/localcvdb_20260109/localcv.db"),
    resolve(cwd, "../../localcvdb/localcvdb_20260109/localcv.db"),
    resolve(cwd, "localcvdb/localcvdb_20260109/localcv.db")
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
}
const DEFAULT_DB_PATH = getDefaultDbPath();
let _cvDb = null;
function getCvDb() {
  if (_cvDb) return _cvDb;
  const dbPath = process.env.LOCALCVDB_PATH || DEFAULT_DB_PATH;
  if (!existsSync(dbPath)) return null;
  try {
    _cvDb = new Database(dbPath, { readonly: true });
    return _cvDb;
  } catch {
    return null;
  }
}
const ARTICLES = /* @__PURE__ */ new Set(["the", "a", "an", "and", "of", "for", "in", "on", "at", "to", "by", "with", "is", "it", "its"]);
function sanitizeTitle(title) {
  let s = title.toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s.split(" ").filter((w) => !ARTICLES.has(w)).join(" ");
}
function buildFtsQuery(text) {
  const words = [...new Set(
    text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !ARTICLES.has(w))
  )];
  if (words.length === 0) return text.replace(/[^\w\s]/g, " ").trim();
  return words.map((w) => `"${w}"`).join(" OR ");
}
function searchVolumes(seriesName) {
  const db = getCvDb();
  if (!db || !seriesName) return [];
  try {
    const ftsQuery = buildFtsQuery(seriesName);
    const rows = db.prepare(`
      SELECT v.id, v.name, v.start_year, p.name as publisher_name, v.count_of_issues
      FROM volume_fts fts
      JOIN cv_volume v ON v.id = fts.rowid
      LEFT JOIN cv_publisher p ON v.publisher_id = p.id
      WHERE volume_fts MATCH ?
      ORDER BY rank
      LIMIT 30
    `).all(ftsQuery);
    return rows.map((r) => ({
      id: r.id,
      name: r.name || "",
      start_year: r.start_year || "",
      publisher_name: r.publisher_name || "",
      count_of_issues: r.count_of_issues || 0
    }));
  } catch {
    try {
      const rows = db.prepare(`
        SELECT v.id, v.name, v.start_year, p.name as publisher_name, v.count_of_issues
        FROM cv_volume v
        LEFT JOIN cv_publisher p ON v.publisher_id = p.id
        WHERE v.name LIKE ?
        ORDER BY v.start_year DESC
        LIMIT 30
      `).all(`%${seriesName}%`);
      return rows.map((r) => ({
        id: r.id,
        name: r.name || "",
        start_year: r.start_year || "",
        publisher_name: r.publisher_name || "",
        count_of_issues: r.count_of_issues || 0
      }));
    } catch {
      return [];
    }
  }
}
function searchIssues(volumeIds, issueNumber, year) {
  const db = getCvDb();
  if (!db || volumeIds.length === 0) return [];
  const placeholders = volumeIds.map(() => "?").join(",");
  let query = `
    SELECT i.id, i.name, i.issue_number, i.volume_id, v.name as volume_name,
           p.name as publisher_name, i.cover_date, i.image_url, i.description,
           i.site_detail_url, i.person_credits, i.character_credits, i.story_arc_credits
    FROM cv_issue i
    JOIN cv_volume v ON i.volume_id = v.id
    LEFT JOIN cv_publisher p ON v.publisher_id = p.id
    WHERE i.volume_id IN (${placeholders})
      AND (i.issue_number = ? OR i.issue_number = ?)
  `;
  const params = [...volumeIds, issueNumber, String(parseFloat(issueNumber) || issueNumber)];
  if (year) {
    query += " ORDER BY ABS(CAST(SUBSTR(i.cover_date,1,4) AS INTEGER) - ?) ASC";
    params.push(parseInt(year, 10));
  }
  query += " LIMIT 20";
  try {
    return db.prepare(query).all(...params);
  } catch {
    return [];
  }
}
function searchCoversByHash(phashHex) {
  const db = getCvDb();
  if (!db || !phashHex) return [];
  try {
    const rows = db.prepare(`
      SELECT DISTINCT cvid FROM comic_covers
      WHERE ct_phash = ?
      LIMIT 20
    `).all(phashHex);
    return rows.map((r) => r.cvid);
  } catch {
    return [];
  }
}
function getIssue(issueId) {
  const db = getCvDb();
  if (!db) return null;
  try {
    const row = db.prepare(`
      SELECT i.id, i.name, i.issue_number, i.volume_id, v.name as volume_name,
             p.name as publisher_name, i.cover_date, i.image_url, i.description,
             i.site_detail_url, i.person_credits, i.character_credits, i.story_arc_credits
      FROM cv_issue i
      JOIN cv_volume v ON i.volume_id = v.id
      LEFT JOIN cv_publisher p ON v.publisher_id = p.id
      WHERE i.id = ?
    `).get(issueId);
    return row || null;
  } catch {
    return null;
  }
}
function matchByFilename(seriesName, issueNumber, year) {
  if (!seriesName) return null;
  const volumes = searchVolumes(seriesName);
  if (volumes.length === 0) return null;
  const scored = volumes.map((v) => {
    const bookWords = sanitizeTitle(seriesName).split(" ").filter(Boolean);
    const seriesWords = sanitizeTitle(v.name).split(" ").filter(Boolean);
    const remaining = [...seriesWords];
    let score = 0;
    for (const w of bookWords) {
      const idx = remaining.indexOf(w);
      if (idx !== -1) {
        score += 5;
        remaining.splice(idx, 1);
      } else {
        score -= 3;
      }
    }
    score -= remaining.length * 3;
    const maxScore = bookWords.length * 5 + 50;
    const minScore = -(bookWords.length * 3 + remaining.length * 3 + 50);
    const ratio = (score - minScore) / (maxScore - minScore);
    return { volume: v, ratio };
  }).filter((s) => s.ratio >= 0.5).sort((a, b) => b.ratio - a.ratio);
  if (scored.length === 0) return null;
  const bestRatio = scored[0].ratio;
  const topVolumes = scored.filter((s) => s.ratio >= bestRatio - 0.1).slice(0, 5);
  const volumeIds = topVolumes.map((s) => s.volume.id);
  const issues = issueNumber ? searchIssues(volumeIds, issueNumber, year) : [];
  if (issues.length === 0) return null;
  return { issue: issues[0], method: "filename" };
}
let _sharp$1 = null;
async function getSharp$1() {
  if (!_sharp$1) {
    const m = await import('file:///home/jo3l/www/sequent/node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js');
    _sharp$1 = m.default || m;
  }
  return _sharp$1;
}
async function computePHash(imageBuffer) {
  const s = await getSharp$1();
  const meta = await s(imageBuffer).metadata();
  const topHalf = await s(imageBuffer).extract({ left: 0, top: 0, width: meta.width || 1, height: Math.floor((meta.height || 1) / 2) }).toBuffer();
  const pixels = await s(topHalf).resize(8, 8, { fit: "fill" }).greyscale().raw().toBuffer();
  const arr = Array.from(pixels);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  let hash = BigInt(0);
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > avg) hash |= BigInt(1) << BigInt(i);
  }
  return hash.toString(16).padStart(16, "0");
}
function matchIssueByCoverHash(phashHex, volumeIds) {
  const db = getCvDb();
  if (!db || !phashHex || volumeIds.length === 0) return null;
  const placeholders = volumeIds.map(() => "?").join(",");
  try {
    const matchingCvids = db.prepare(`
      SELECT DISTINCT cvid FROM comic_covers
      WHERE ct_phash = ?
      LIMIT 100
    `).all(phashHex);
    if (matchingCvids.length === 0) return null;
    const cvidPlaceholders = matchingCvids.map(() => "?").join(",");
    const rows = db.prepare(`
      SELECT i.id, i.name, i.issue_number, i.volume_id, v.name as volume_name,
             p.name as publisher_name, i.cover_date, i.image_url, i.description,
             i.site_detail_url, i.person_credits, i.character_credits, i.story_arc_credits
      FROM cv_issue i
      JOIN cv_volume v ON i.volume_id = v.id
      LEFT JOIN cv_publisher p ON v.publisher_id = p.id
      WHERE i.id IN (${cvidPlaceholders})
        AND i.volume_id IN (${placeholders})
      LIMIT 10
    `).all(...matchingCvids.map((r) => r.cvid), ...volumeIds);
    return rows[0] || null;
  } catch {
    return null;
  }
}

function slugify(title, issueNumber) {
  let base = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  if (issueNumber) {
    const num = String(parseInt(issueNumber, 10) || issueNumber);
    base = `${base}-${num}`;
  }
  return base || "comic";
}

const match_post = defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const body = await readBody(event);
  const cvIssueId = parseInt(String((body == null ? void 0 : body.cv_issue_id) || ""), 10);
  if (isNaN(cvIssueId)) throw createError({ statusCode: 400, statusMessage: "cv_issue_id required" });
  const cvIssue = getIssue(cvIssueId);
  if (!cvIssue) throw createError({ statusCode: 404, statusMessage: "CV issue not found" });
  const db = getDb();
  const comic = db.prepare("SELECT id, title, issue_number, metadata_json FROM comics WHERE id = ?").get(id);
  if (!comic) throw createError({ statusCode: 404, statusMessage: "Comic not found" });
  const existingMeta = JSON.parse(comic.metadata_json || "{}");
  const cvTitle = cvIssue.volume_name || cvIssue.name || "";
  const meta = {
    ...existingMeta,
    title: cvTitle || existingMeta.title,
    issue_number: cvIssue.issue_number || existingMeta.issue_number,
    volume: cvIssue.volume_name || existingMeta.volume,
    publisher: cvIssue.publisher_name || existingMeta.publisher,
    year: cvIssue.cover_date ? cvIssue.cover_date.slice(0, 4) : existingMeta.year,
    summary: cvIssue.description || existingMeta.summary,
    cv_id: cvIssue.id,
    cv_volume_name: cvIssue.volume_name,
    cv_cover_date: cvIssue.cover_date,
    cv_url: cvIssue.site_detail_url,
    cv_cover_url: cvIssue.image_url,
    cv_description: cvIssue.description,
    cv_person_credits: cvIssue.person_credits,
    cv_character_credits: cvIssue.character_credits,
    cv_story_arc_credits: cvIssue.story_arc_credits,
    cv_match_method: "manual"
  };
  const slug = slugify(cvTitle, cvIssue.issue_number);
  db.prepare(`
    UPDATE comics SET
      title = ?, issue_number = ?, volume = ?, publisher = ?, year = ?,
      metadata_json = ?, slug = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    cvTitle,
    cvIssue.issue_number || existingMeta.issue_number || "",
    cvIssue.volume_name || existingMeta.volume || "",
    cvIssue.publisher_name || existingMeta.publisher || "",
    cvIssue.cover_date ? cvIssue.cover_date.slice(0, 4) : existingMeta.year || "",
    JSON.stringify(meta),
    slug,
    id
  );
  return { ok: true, comic: { ...comic, title: cvTitle, slug, metadata: meta } };
});

const match_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: match_post
});

const IMAGE_EXTS = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif"]);
function getArchiveType(filePath) {
  var _a;
  const ext = ((_a = filePath.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
  if (ext === "cbz" || ext === "zip") return "cbz";
  if (ext === "cbr" || ext === "rar") return "cbr";
  if (ext === "pdf") return "pdf";
  if (ext === "cbt" || ext === "tar") return "cbr";
  return "unknown";
}
function isComicFile(filePath) {
  var _a;
  const ext = ((_a = filePath.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
  return ["cbz", "cbr", "cbt", "pdf", "zip", "rar"].includes(ext);
}
function extractComicInfoXml(archivePath) {
  const workDir = join(tmpdir(), `sequent-ci-${Date.now()}`);
  try {
    mkdirSync(workDir, { recursive: true });
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}" "ComicInfo.xml"`, {
        stdio: "pipe",
        timeout: 15e3
      });
    } catch {
    }
    const xmlPath = join(workDir, "ComicInfo.xml");
    if (existsSync(xmlPath)) return readFileSync(xmlPath, "utf-8");
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}"`, {
        stdio: "pipe",
        timeout: 6e4
      });
    } catch {
    }
    const findOut = execSync(
      `find "${workDir}" -iname "ComicInfo.xml" -type f 2>/dev/null | head -1`,
      { stdio: "pipe", encoding: "utf-8", timeout: 5e3 }
    );
    const foundPath = findOut.trim();
    if (foundPath && existsSync(foundPath)) return readFileSync(foundPath, "utf-8");
    return null;
  } catch {
    return null;
  } finally {
    try {
      if (existsSync(workDir)) execSync(`rm -rf "${workDir}"`, { stdio: "pipe" });
    } catch {
    }
  }
}
async function parseComicInfoXml(xml) {
  const { XMLParser } = await import('file:///home/jo3l/www/sequent/node_modules/.pnpm/fast-xml-parser@4.5.7/node_modules/fast-xml-parser/src/fxp.js');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    trimValues: true,
    parseTagValue: false
  });
  const parsed = parser.parse(xml);
  const root = parsed == null ? void 0 : parsed.ComicInfo;
  if (!root || typeof root !== "object") return {};
  function str(val) {
    if (val === null || val === void 0) return void 0;
    return String(val).trim() || void 0;
  }
  return {
    title: str(root.Title),
    series: str(root.Series),
    number: str(root.Number),
    volume: str(root.Volume),
    summary: str(root.Summary),
    year: str(root.Year),
    month: str(root.Month),
    day: str(root.Day),
    writer: str(root.Writer),
    penciller: str(root.Penciller),
    inker: str(root.Inker),
    colorist: str(root.Colorist),
    letterer: str(root.Letterer),
    cover_artist: str(root.CoverArtist),
    editor: str(root.Editor),
    publisher: str(root.Publisher),
    imprint: str(root.Imprint),
    format: str(root.Format),
    age_rating: str(root.AgeRating),
    page_count: str(root.PageCount),
    genre: str(root.Genre),
    characters: str(root.Characters),
    teams: str(root.Teams),
    locations: str(root.Locations),
    series_group: str(root.SeriesGroup),
    story_arc: str(root.StoryArc),
    web: str(root.Web),
    language_iso: str(root.LanguageISO),
    community_rating: str(root.CommunityRating),
    count: str(root.Count),
    scan_information: str(root.ScanInformation)
  };
}
async function getComicInfo(archivePath) {
  const xml = extractComicInfoXml(archivePath);
  if (!xml) return null;
  return parseComicInfoXml(xml);
}
function extractFirstPageImage(archivePath) {
  const ext = archivePath.slice(archivePath.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") {
    return extractPdfFirstPage(archivePath);
  }
  return extractArchiveFirstImage(archivePath);
}
function extractPdfFirstPage(pdfPath) {
  const workDir = join(tmpdir(), `sequent-pdf-cover-${Date.now()}`);
  try {
    mkdirSync(workDir, { recursive: true });
    execSync(`pdftoppm -f 1 -l 1 -r 200 -png "${pdfPath}" "${workDir}/cover"`, {
      stdio: "pipe",
      timeout: 15e3
    });
    const generated = join(workDir, "cover-1.png");
    if (existsSync(generated)) return readFileSync(generated);
    return null;
  } catch {
    return null;
  } finally {
    try {
      execSync(`rm -rf "${workDir}"`, { stdio: "pipe" });
    } catch {
    }
  }
}
function extractArchiveFirstImage(archivePath) {
  const workDir = join(tmpdir(), `sequent-cover-${Date.now()}`);
  try {
    mkdirSync(workDir, { recursive: true });
    const lsarOut = execSync(`lsar -j "${archivePath}"`, {
      stdio: "pipe",
      encoding: "utf-8",
      timeout: 1e4
    });
    const listing = JSON.parse(lsarOut);
    const entries = (listing == null ? void 0 : listing.lsarContents) || [];
    let firstImage = null;
    for (const entry of entries) {
      const fileName = entry.XADFileName || entry.name || entry.filename;
      if (!fileName || fileName === "ComicInfo.xml") continue;
      const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        firstImage = fileName;
        break;
      }
    }
    if (!firstImage) return null;
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}" "${firstImage}"`, {
        stdio: "pipe",
        timeout: 15e3
      });
    } catch {
    }
    let found = findFile(workDir);
    if (found) return readFileSync(found);
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}"`, {
        stdio: "pipe",
        timeout: 6e4
      });
    } catch {
    }
    found = findFile(workDir);
    if (!found) return null;
    return readFileSync(found);
  } catch {
    return null;
  } finally {
    try {
      if (existsSync(workDir)) execSync(`rm -rf "${workDir}"`, { stdio: "pipe" });
    } catch {
    }
  }
}
function findFile(dir) {
  const out = execSync(`find "${dir}" -type f 2>/dev/null | LC_ALL=C sort | head -1`, {
    stdio: "pipe",
    encoding: "utf-8",
    timeout: 5e3
  });
  const path = out.trim();
  return path && existsSync(path) ? path : null;
}
function listArchiveImages(archivePath) {
  try {
    const lsarOut = execSync(`lsar -j "${archivePath}"`, {
      stdio: "pipe",
      encoding: "utf-8",
      timeout: 1e4
    });
    const listing = JSON.parse(lsarOut);
    const entries = (listing == null ? void 0 : listing.lsarContents) || [];
    return entries.filter((e) => {
      const fn = e.XADFileName || e.name || e.filename || "";
      if (fn === "ComicInfo.xml") return false;
      const ext = fn.slice(fn.lastIndexOf(".")).toLowerCase();
      return IMAGE_EXTS.has(ext);
    }).map((e) => e.XADFileName || e.name || e.filename || "").sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
  } catch {
    return [];
  }
}
function extractImageFromArchive(archivePath, imageName, destDir) {
  const destPath = join(destDir, imageName.replace(/\//g, "_"));
  if (existsSync(destPath)) return destPath;
  try {
    mkdirSync(destDir, { recursive: true });
    try {
      execSync(`unar -q -o "${destDir}" "${archivePath}" "${imageName}"`, {
        stdio: "pipe",
        timeout: 15e3
      });
    } catch {
    }
    if (existsSync(destPath)) return destPath;
    const found = findFile(destDir);
    if (found) {
      try {
        execSync(`mv "${found}" "${destPath}"`, { stdio: "pipe" });
      } catch {
        return found;
      }
      return destPath;
    }
    try {
      execSync(`unar -q -o "${destDir}" "${archivePath}"`, {
        stdio: "pipe",
        timeout: 6e4
      });
    } catch {
    }
    const found2 = findFile(destDir);
    if (found2) {
      try {
        execSync(`mv "${found2}" "${destPath}"`, { stdio: "pipe" });
      } catch {
        return found2;
      }
      return destPath;
    }
    return null;
  } catch {
    return null;
  }
}

const CACHE_DIR = resolve(process.cwd(), "cache", "extracted");
const CACHE_TTL = 60 * 60 * 1e3;
const _page__get = defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const rawPage = getRouterParam(event, "page");
  const id = parseInt(rawId || "", 10);
  const pageNum = parseInt(rawPage || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid comic ID" });
  if (isNaN(pageNum) || pageNum < 1) throw createError({ statusCode: 400, statusMessage: "Invalid page number" });
  const db = getDb();
  const comic = db.prepare("SELECT file_path, file_name FROM comics WHERE id = ?").get(id);
  if (!comic) throw createError({ statusCode: 404, statusMessage: "Comic not found" });
  let physicalPath = comic.file_path;
  if (!physicalPath.startsWith("/")) {
    const folders = db.prepare("SELECT path FROM library_folders WHERE active = 1").all();
    for (const folder of folders) {
      const candidate = join(folder.path, comic.file_path);
      if (existsSync(candidate)) {
        physicalPath = candidate;
        break;
      }
    }
  }
  if (!existsSync(physicalPath)) {
    throw createError({ statusCode: 404, statusMessage: "Comic file not found on disk" });
  }
  const archiveType = getArchiveType(physicalPath);
  if (archiveType === "pdf") {
    return servePdfPage(event, physicalPath, id, pageNum);
  }
  return serveArchivePage(event, physicalPath, id, pageNum);
});
function serveArchivePage(event, archivePath, comicId, pageNum) {
  var _a;
  const cacheDir = join(CACHE_DIR, String(comicId));
  mkdirSync(cacheDir, { recursive: true });
  cleanStaleCache(cacheDir);
  const images = listArchiveImages(archivePath);
  const idx = pageNum - 1;
  if (idx < 0 || idx >= images.length) {
    throw createError({ statusCode: 404, statusMessage: `Page ${pageNum} not found (total: ${images.length})` });
  }
  const extracted = extractImageFromArchive(archivePath, images[idx], cacheDir);
  if (!extracted) throw createError({ statusCode: 500, statusMessage: "Failed to extract page" });
  const data = readFileSync(extracted);
  const ext = ((_a = extracted.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "jpeg";
  setHeader(event, "Content-Type", getMimeType(ext));
  setHeader(event, "Cache-Control", "public, max-age=86400, immutable");
  return data;
}
async function servePdfPage(event, pdfPath, comicId, pageNum) {
  const cacheDir = join(CACHE_DIR, `pdf_${comicId}`);
  mkdirSync(cacheDir, { recursive: true });
  const cacheFile = join(cacheDir, `page_${pageNum}.webp`);
  if (!existsSync(cacheFile)) {
    const prefix = join(cacheDir, `_tmp`);
    try {
      execSync(`pdftoppm -f ${pageNum} -l ${pageNum} -r 200 -png "${pdfPath}" "${prefix}"`, {
        stdio: "pipe",
        timeout: 15e3
      });
    } catch {
      throw createError({ statusCode: 500, statusMessage: "PDF render failed. Install poppler-utils: sudo apt install poppler-utils" });
    }
    const generated = join(cacheDir, `_tmp-${pageNum}.png`);
    if (!existsSync(generated)) {
      throw createError({ statusCode: 404, statusMessage: `Page ${pageNum} not found in PDF` });
    }
    try {
      const sharp = await import('file:///home/jo3l/www/sequent/node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js');
      const webp = await sharp.default(generated).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      writeFileSync(cacheFile, webp);
      unlinkSync(generated);
    } catch {
      const data2 = readFileSync(generated);
      setHeader(event, "Content-Type", "image/png");
      setHeader(event, "Cache-Control", "public, max-age=3600");
      unlinkSync(generated);
      return data2;
    }
  }
  const data = readFileSync(cacheFile);
  setHeader(event, "Content-Type", "image/webp");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  return data;
}
function getMimeType(ext) {
  const m = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", bmp: "image/bmp", tiff: "image/tiff", tif: "image/tiff" };
  return m[ext] || "image/jpeg";
}
function cleanStaleCache(cacheDir) {
  try {
    const now = Date.now();
    const { readdirSync } = require("node:fs");
    for (const entry of readdirSync(cacheDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const full = join(cacheDir, entry.name);
      try {
        if (now - statSync(full).mtimeMs > CACHE_TTL) unlinkSync(full);
      } catch {
      }
    }
  } catch {
  }
}

const _page__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _page__get
});

const TAGS = [
  "Minutemen-Faessla",
  "Mastodon",
  "Digital-Empire",
  "Minutemen-InnerDemons",
  "Minutemen-Midas",
  "Minutemen-PhD",
  "Darkness-Empire",
  "JK-Empire",
  "Zoombie-Empire",
  "Nahga-Empire",
  "Zone-Empire",
  "Oroboros-DCP",
  "RedResin-Minutemen-Novus-HD",
  "Dr.Vink",
  "Sticky Oak"
];
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function parseFilename(rawFilename) {
  let name = rawFilename.replace(/\.[^.]+$/, "").trim();
  const raw = name;
  for (const tag of TAGS) {
    const re = new RegExp(`\\s*[\\[\\(]${escapeRegex(tag)}[\\]\\)]`, "gi");
    name = name.replace(re, "");
  }
  const yearMatch = name.match(/\((\d{4})(?:-\d{4})?\)/);
  const year = yearMatch ? yearMatch[1] : "";
  name = name.replace(/\s*\(\d{4}(?:-\d{4})?\)\s*/g, " ");
  name = name.replace(/[\\(][^)]*[\\)]/g, " ");
  let issueNumber = "";
  const issueMatch = name.match(/#\s*(\d+[A-Za-z]?)/);
  if (issueMatch) {
    issueNumber = issueMatch[1].replace(/^0+/, "") || "0";
    name = name.replace(issueMatch[0], " ");
  } else {
    const altMatch = name.match(/(?:No|Issue|Iss|Num|Ch|Chapter)\.?\s*#?\s*(\d+[A-Za-z]?)/i);
    if (altMatch) {
      issueNumber = altMatch[1].replace(/^0+/, "") || "0";
      name = name.replace(altMatch[0], " ");
    }
  }
  let volume = "";
  const volMatch = name.match(/\b(?:[Vv](?:ol(?:ume)?)?\.?\s*)(\d+)\b/);
  if (volMatch) {
    volume = volMatch[1].replace(/^0+/, "") || "0";
    name = name.replace(volMatch[0], " ");
  }
  if (!issueNumber && !volume) {
    const parts = name.replace(/[\\(\\)]/g, " ").split(/[\s\-_]+/).filter(Boolean);
    const nums = [];
    parts.forEach((p, i) => {
      const n = parseInt(p, 10);
      if (!isNaN(n) && n > 0 && n < 1e3 && (n < 1900 || n > 2099)) {
        nums.push({ value: n, idx: i });
      }
    });
    if (nums.length > 0) {
      const last = nums[nums.length - 1];
      issueNumber = String(last.value);
      parts.splice(last.idx, 1);
      name = parts.join(" ");
    }
  }
  if (!issueNumber && volume) {
    issueNumber = volume;
  }
  name = name.replace(/[\[\]]/g, " ");
  name = name.replace(/\s+/g, " ").trim();
  name = name.replace(/[-–—]\s*$/, "").trim();
  const issueNumInt = parseInt(issueNumber || "0", 10) || 0;
  return {
    title: name || raw,
    issueNumber,
    issueNumInt,
    volume,
    year,
    extra: "",
    raw
  };
}

const suggestions_get = defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const db = getDb();
  const comic = db.prepare("SELECT id, file_name, file_path, cover_path, title, issue_number, volume, year FROM comics WHERE id = ?").get(id);
  if (!comic) throw createError({ statusCode: 404, statusMessage: "Comic not found" });
  const parsed = parseFilename(comic.file_name);
  const seriesName = comic.title && comic.title !== parsed.raw ? comic.title : parsed.title;
  const issueNumber = comic.issue_number || parsed.issueNumber;
  const year = comic.year || parsed.year;
  const candidates = [];
  const seen = /* @__PURE__ */ new Set();
  const volumes = searchVolumes(seriesName);
  if (volumes.length > 0) {
    const scored = volumes.map((v) => {
      const bookWords = sanitize(seriesName).split(" ").filter(Boolean);
      const seriesWords = sanitize(v.name).split(" ").filter(Boolean);
      const remaining = [...seriesWords];
      let score = 0;
      for (const w of bookWords) {
        const idx = remaining.indexOf(w);
        if (idx !== -1) {
          score += 5;
          remaining.splice(idx, 1);
        } else {
          score -= 3;
        }
      }
      score -= remaining.length * 3;
      return { volume: v, score };
    }).sort((a, b) => b.score - a.score);
    const topVolumes = scored.slice(0, 8);
    for (const sv of topVolumes) {
      const issues = searchIssues([sv.volume.id], issueNumber, year);
      for (const issue of issues) {
        if (seen.has(issue.id)) continue;
        seen.add(issue.id);
        candidates.push({
          issue_id: issue.id,
          name: issue.name || issue.volume_name,
          issue_number: issue.issue_number,
          volume_name: issue.volume_name,
          publisher_name: issue.publisher_name,
          cover_date: issue.cover_date,
          description: issue.description,
          image_url: issue.image_url,
          match_type: "filename",
          score: sv.score
        });
      }
    }
  }
  if (comic.cover_path) {
    try {
      const coverBuf = readFileSync(comic.cover_path);
      const phash = await computePHash(coverBuf);
      const cvids = searchCoversByHash(phash);
      for (const cvid of cvids.slice(0, 10)) {
        if (seen.has(cvid)) continue;
        seen.add(cvid);
        const issue = getIssue(cvid);
        if (issue) {
          candidates.push({
            issue_id: issue.id,
            name: issue.name || issue.volume_name,
            issue_number: issue.issue_number,
            volume_name: issue.volume_name,
            publisher_name: issue.publisher_name,
            cover_date: issue.cover_date,
            description: issue.description,
            image_url: issue.image_url,
            match_type: "hash",
            score: 80
          });
        }
      }
    } catch {
    }
  }
  return { candidates: candidates.slice(0, 20) };
});
function sanitize(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

const suggestions_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: suggestions_get
});

const index_get$2 = defineEventHandler(async (event) => {
  const query = getQuery$1(event);
  const page = Math.max(1, parseInt(String(query.page || "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || "24"), 10)));
  const search = String(query.search || "").trim();
  const publisher = String(query.publisher || "").trim();
  const sort = String(query.sort || "created_at").trim();
  const db = getDb();
  const offset = (page - 1) * limit;
  let whereClause = "";
  const params = [];
  if (search) {
    whereClause = "WHERE (title LIKE ? OR file_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (publisher) {
    whereClause += whereClause ? " AND publisher = ?" : "WHERE publisher = ?";
    params.push(publisher);
  }
  const allowedSorts = ["title", "created_at", "updated_at", "year", "publisher", "issue_number"];
  const sortCol = allowedSorts.includes(sort) ? sort : "created_at";
  const countRow = db.prepare(`SELECT COUNT(*) as total FROM comics ${whereClause}`).get(...params);
  const total = (countRow == null ? void 0 : countRow.total) || 0;
  const rows = db.prepare(`
    SELECT id, file_path, file_name, cover_path, title, issue_number,
           volume, year, publisher, page_count, slug, metadata_json, created_at, updated_at
    FROM comics
    ${whereClause}
    ORDER BY ${sortCol} DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  const comics = rows.map((row) => ({
    ...row,
    metadata: safeJsonParse(row.metadata_json),
    metadata_json: void 0
  }));
  return {
    comics,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
});
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

const index_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get$2
});

const _id__get = defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const coversDir = resolve(process.cwd(), "covers");
  for (const ext of ["webp", "jpg", "jpeg", "png"]) {
    const p = resolve(coversDir, `${id}.${ext}`);
    if (existsSync(p)) {
      setHeader(event, "Content-Type", ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
      setHeader(event, "Cache-Control", "public, max-age=604800, immutable");
      return readFileSync(p);
    }
  }
  try {
    const db = getDb();
    const row = db.prepare("SELECT cover_path FROM comics WHERE id = ?").get(id);
    if ((row == null ? void 0 : row.cover_path) && existsSync(row.cover_path)) {
      const ct = row.cover_path.endsWith(".webp") ? "image/webp" : row.cover_path.endsWith(".png") ? "image/png" : "image/jpeg";
      setHeader(event, "Content-Type", ct);
      setHeader(event, "Cache-Control", "public, max-age=604800, immutable");
      return readFileSync(row.cover_path);
    }
  } catch {
  }
  throw createError({ statusCode: 404, statusMessage: "Cover not found" });
});

const _id__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get
});

const health_get = defineEventHandler(() => {
  return {
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime()
  };
});

const health_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: health_get
});

const MOUNT_BASE = "/mnt/sequent";
function mountSmbShare(mount) {
  var _a;
  const mountPoint = resolve(MOUNT_BASE, `smb_${mount.id}`);
  if (isMounted(mountPoint)) return mountPoint;
  mkdirSync(mountPoint, { recursive: true });
  const username = mount.smb_username || "guest";
  const password = mount.smb_password || "";
  let cmd = `mount -t cifs`;
  if (mount.smb_host && mount.smb_share) {
    cmd += ` //${mount.smb_host}/${mount.smb_share}`;
  }
  cmd += ` "${mountPoint}" -o username="${username}",password="${password}"`;
  if (mount.smb_domain) cmd += `,domain=${mount.smb_domain}`;
  cmd += `,iocharset=utf8,uid=$(id -u),gid=$(id -g),file_mode=0644,dir_mode=0755`;
  try {
    execSync(cmd, { stdio: "pipe", timeout: 15e3 });
  } catch (e) {
    console.error("SMB mount failed:", ((_a = e.stderr) == null ? void 0 : _a.toString()) || e.message);
    try {
      execSync(`umount "${mountPoint}" 2>/dev/null`, { stdio: "pipe" });
    } catch {
    }
    throw new Error(`Failed to mount SMB share: ${mount.label}`);
  }
  return mountPoint;
}
function unmountSmbShare(mount) {
  const mountPoint = resolve(MOUNT_BASE, `smb_${mount.id}`);
  if (isMounted(mountPoint)) {
    try {
      execSync(`umount "${mountPoint}"`, { stdio: "pipe" });
    } catch {
    }
  }
}
function isMounted(mountPoint) {
  try {
    const out = execSync(`mountpoint -q "${mountPoint}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
function testSmbConnection(host, share, username, password, domain) {
  const testPoint = resolve(MOUNT_BASE, `_test_${Date.now()}`);
  try {
    mkdirSync(testPoint, { recursive: true });
    let cmd = `mount -t cifs //${host}/${share} "${testPoint}" -o username="${username}",password="${password}"`;
    if (domain) cmd += `,domain=${domain}`;
    execSync(cmd, { stdio: "pipe", timeout: 1e4 });
    execSync(`umount "${testPoint}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  } finally {
    try {
      execSync(`rmdir "${testPoint}" 2>/dev/null`, { stdio: "pipe" });
    } catch {
    }
  }
}

const _id_$2 = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid folder ID" });
  const db = getDb();
  const method = getMethod(event);
  if (method === "GET") {
    const folder = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id);
    if (!folder) throw createError({ statusCode: 404, statusMessage: "Folder not found" });
    return { folder };
  }
  if (method === "PATCH" || method === "PUT") {
    const body = await readBody(event);
    const existing = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id);
    if (!existing) throw createError({ statusCode: 404, statusMessage: "Folder not found" });
    db.prepare(`
      UPDATE library_folders SET
        path = ?, label = ?, type = ?, smb_host = ?, smb_share = ?,
        smb_username = ?, smb_password = ?, smb_domain = ?,
        active = ?
      WHERE id = ?
    `).run(
      (_a = body.path) != null ? _a : existing.path,
      (_b = body.label) != null ? _b : existing.label,
      (_c = body.type) != null ? _c : existing.type,
      (_d = body.smb_host) != null ? _d : existing.smb_host,
      (_e = body.smb_share) != null ? _e : existing.smb_share,
      (_f = body.smb_username) != null ? _f : existing.smb_username,
      (_g = body.smb_password) != null ? _g : existing.smb_password,
      (_h = body.smb_domain) != null ? _h : existing.smb_domain,
      body.active !== void 0 ? body.active : existing.active,
      id
    );
    const updated = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id);
    return { folder: updated };
  }
  if (method === "DELETE") {
    db.prepare("DELETE FROM library_folders WHERE id = ?").run(id);
    return { ok: true };
  }
  if (method === "POST") {
    const action = getQuery$1(event).action;
    if (action === "test") {
      const folder = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id);
      if (!folder) throw createError({ statusCode: 404, statusMessage: "Folder not found" });
      if (folder.type === "smb") {
        const ok = testSmbConnection(
          folder.smb_host,
          folder.smb_share,
          folder.smb_username,
          folder.smb_password,
          folder.smb_domain
        );
        return { success: ok };
      }
      const { existsSync } = await import('node:fs');
      return { success: existsSync(folder.path) };
    }
    throw createError({ statusCode: 400, statusMessage: "Unknown action" });
  }
  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});

const _id_$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id_$2
});

const index$2 = defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }
  const db = getDb();
  const method = getMethod(event);
  if (method === "GET") {
    const folders = db.prepare("SELECT * FROM library_folders ORDER BY created_at DESC").all();
    return { folders };
  }
  if (method === "POST") {
    const body = await readBody(event);
    const { path, label, type, smb_host, smb_share, smb_username, smb_password, smb_domain } = body || {};
    if (!path && type === "local") {
      throw createError({ statusCode: 400, statusMessage: "Path is required for local folders" });
    }
    const result = db.prepare(`
      INSERT INTO library_folders (path, label, type, smb_host, smb_share, smb_username, smb_password, smb_domain)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      path || `//${smb_host}/${smb_share}`,
      label || path || smb_share || "",
      type || "local",
      smb_host || "",
      smb_share || "",
      smb_username || "",
      smb_password || "",
      smb_domain || ""
    );
    const folder = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(result.lastInsertRowid);
    return { folder };
  }
  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});

const index$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index$2
});

const TARGET_WIDTH = 800;
let _sharp = null;
async function getSharp() {
  if (!_sharp) {
    const mod = await import('file:///home/jo3l/www/sequent/node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js');
    _sharp = mod.default || mod;
  }
  return _sharp;
}
async function generateCover(imageBuffer, metadata, coverPath) {
  try {
    const s = await getSharp();
    const resized = await s(imageBuffer).resize({ width: TARGET_WIDTH, withoutEnlargement: true }).webp({ quality: 85, effort: 4 }).toBuffer();
    const xmpXml = buildXmp(metadata);
    const withXmp = embedXMP(resized, xmpXml);
    writeFileSync(coverPath, withXmp);
    return true;
  } catch {
    return false;
  }
}
function buildXmp(meta) {
  const esc = (s) => {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  };
  return `<?xpacket begin="\\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>\\n<x:xmpmeta xmlns:x="adobe:ns:meta/">\\n  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\\n    <rdf:Description rdf:about=""\\n      xmlns:dc="http://purl.org/dc/elements/1.1/"\\n      xmlns:comic="http://ns.sequent.app/comic/"\\n      xmlns:xmp="http://ns.adobe.com/xap/1.0/">\\n      <dc:title>${esc(meta.title)}</dc:title>\\n      <dc:description>${esc(meta.summary)}</dc:description>\\n` + (meta.writer ? `      <dc:creator><rdf:Seq><rdf:li>${esc(meta.writer)}</rdf:li></rdf:Seq></dc:creator>\\n` : "") + `      <comic:series>${esc(meta.series)}</comic:series>\\n      <comic:number>${esc(meta.number)}</comic:number>\\n      <comic:volume>${esc(meta.volume)}</comic:volume>\\n      <comic:publisher>${esc(meta.publisher)}</comic:publisher>\\n      <comic:year>${esc(meta.year)}</comic:year>\\n    </rdf:Description>\\n  </rdf:RDF>\\n</x:xmpmeta>\\n<?xpacket end="w"?>`;
}
function findXMPOffset(buffer) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const fourCC = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    if (chunkSize > buffer.length - offset - 8) break;
    if (fourCC === "XMP ") return { offset, size: chunkSize };
    offset += 8 + chunkSize + chunkSize % 2;
  }
  return null;
}
function embedXMP(webpBuf, xmpXml) {
  const xmpBytes = Buffer.from(xmpXml, "utf-8");
  const chunkDataSize = xmpBytes.length;
  const paddedSize = chunkDataSize + chunkDataSize % 2;
  const xmpChunk = Buffer.alloc(8 + paddedSize);
  xmpChunk.write("XMP ", 0, 4, "ascii");
  xmpChunk.writeUInt32LE(chunkDataSize, 4);
  xmpBytes.copy(xmpChunk, 8);
  const existing = findXMPOffset(webpBuf);
  let result;
  if (existing) {
    const paddedOld = existing.size + existing.size % 2;
    result = Buffer.concat([
      webpBuf.subarray(0, existing.offset),
      xmpChunk,
      webpBuf.subarray(existing.offset + 8 + paddedOld)
    ]);
  } else {
    result = Buffer.concat([webpBuf, xmpChunk]);
  }
  result.writeUInt32LE(result.length - 8, 4);
  return result;
}
function coverPathFor(comicPath) {
  const ext = extname(comicPath);
  return comicPath.slice(0, -ext.length) + ".webp";
}
function extractXMP(buffer) {
  const xmp = findXMPOffset(buffer);
  if (!xmp) return null;
  return buffer.toString("utf-8", xmp.offset + 8, xmp.offset + 8 + xmp.size);
}
async function readCoverMetadata(coverPath) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  try {
    let str = function(val) {
      if (val === null || val === void 0) return void 0;
      return String(val).trim() || void 0;
    };
    if (!existsSync(coverPath)) return null;
    const buf = readFileSync(coverPath);
    const xmp = extractXMP(buf);
    if (!xmp) return null;
    const { XMLParser } = await import('file:///home/jo3l/www/sequent/node_modules/.pnpm/fast-xml-parser@4.5.7/node_modules/fast-xml-parser/src/fxp.js');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      trimValues: true,
      parseTagValue: false
    });
    const parsed = parser.parse(xmp);
    const desc = ((_b = (_a = parsed == null ? void 0 : parsed["x:xmpmeta"]) == null ? void 0 : _a["rdf:RDF"]) == null ? void 0 : _b["rdf:Description"]) || ((_d = (_c = parsed == null ? void 0 : parsed.xmpmeta) == null ? void 0 : _c["rdf:RDF"]) == null ? void 0 : _d["rdf:Description"]);
    if (!desc || typeof desc !== "object") return null;
    let writer;
    const creator = desc["dc:creator"] || ((_e = desc["dc"]) == null ? void 0 : _e["creator"]);
    if (creator) {
      if (typeof creator === "string") {
        writer = creator;
      } else if ((_f = creator["rdf:Seq"]) == null ? void 0 : _f["rdf:li"]) {
        const li = creator["rdf:Seq"]["rdf:li"];
        writer = Array.isArray(li) ? li[0] : li;
      }
    }
    return {
      title: str(desc["dc:title"] || ((_g = desc["dc"]) == null ? void 0 : _g["title"])),
      series: str(desc["comic:series"] || ((_h = desc["comic"]) == null ? void 0 : _h["series"])),
      number: str(desc["comic:number"] || ((_i = desc["comic"]) == null ? void 0 : _i["number"])),
      volume: str(desc["comic:volume"] || ((_j = desc["comic"]) == null ? void 0 : _j["volume"])),
      summary: str(desc["dc:description"] || ((_k = desc["dc"]) == null ? void 0 : _k["description"])),
      writer,
      publisher: str(desc["comic:publisher"] || ((_l = desc["comic"]) == null ? void 0 : _l["publisher"])),
      year: str(desc["comic:year"] || ((_m = desc["comic"]) == null ? void 0 : _m["year"]))
    };
  } catch {
    return null;
  }
}

function countPages(physicalPath) {
  const archiveType = getArchiveType(physicalPath);
  if (archiveType === "pdf") return 0;
  const pages = listArchiveImages(physicalPath);
  return pages.length;
}
function isGenericIssueName(name) {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return /^(vol(?:ume)?\.?\s*\d+|tpb|collected\s*edition|hc|sc|gn|omnibus)$/i.test(n);
}
const scan_post = defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery$1(event);
  const force = query.force === "true" || query.force === "1";
  const library = db.prepare("SELECT * FROM library_folders WHERE active = 1").all();
  if (library.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No library folders configured. Add one in admin settings." });
  }
  const stats = {
    foldersScanned: 0,
    filesFound: 0,
    newComics: 0,
    updatedComics: 0,
    errors: []
  };
  const coversDir = resolve(process.cwd(), "covers");
  const { mkdirSync } = await import('node:fs');
  mkdirSync(coversDir, { recursive: true });
  for (const folder of library) {
    try {
      let scanPath = folder.path;
      if (folder.type === "smb" && folder.smb_host) {
        try {
          scanPath = mountSmbShare(folder);
        } catch (e) {
          stats.errors.push(`Failed to mount ${folder.label}: ${e.message}`);
          continue;
        }
      }
      if (!existsSync(scanPath)) {
        stats.errors.push(`Path not found: ${scanPath}`);
        continue;
      }
      await scanDirectory(scanPath, folder.path, db, coversDir, stats, force);
      stats.foldersScanned++;
      if (folder.type === "smb") {
        unmountSmbShare(folder);
      }
    } catch (e) {
      stats.errors.push(`Error scanning ${folder.label}: ${e.message}`);
    }
  }
  return { success: true, stats };
});
async function scanDirectory(physicalPath, logicalPath, db, coversDir, stats, force) {
  try {
    const entries = readdirSync(physicalPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPhysical = join(physicalPath, entry.name);
      const fullLogical = join(logicalPath, entry.name);
      if (entry.isDirectory()) {
        await scanDirectory(fullPhysical, fullLogical, db, coversDir, stats, force);
        continue;
      }
      if (!isComicFile(entry.name)) continue;
      stats.filesFound++;
      try {
        const stat = statSync(fullPhysical);
        const coverFile = coverPathFor(fullPhysical);
        if (!force && existsSync(coverFile)) {
          const existing2 = db.prepare("SELECT id FROM comics WHERE file_path = ?").get(fullLogical);
          if (!existing2) {
            const pageCount = countPages(fullPhysical);
            const meta = readCoverMetadata(coverFile);
            const parsed = parseFilename(entry.name);
            db.prepare(`
              INSERT INTO comics (file_path, file_name, cover_path, title, issue_number,
                volume, year, publisher, page_count, metadata_json, slug)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              fullLogical,
              entry.name,
              coverFile,
              (meta == null ? void 0 : meta.title) || parsed.title,
              (meta == null ? void 0 : meta.number) || parsed.issueNumber || "",
              (meta == null ? void 0 : meta.volume) || parsed.volume || "",
              (meta == null ? void 0 : meta.year) || parsed.year || "",
              (meta == null ? void 0 : meta.publisher) || "",
              pageCount,
              JSON.stringify(meta || {}),
              slugify((meta == null ? void 0 : meta.title) || parsed.title, (meta == null ? void 0 : meta.number) || parsed.issueNumber)
            );
            stats.newComics++;
          }
          continue;
        }
        const existing = db.prepare("SELECT id, cover_path, updated_at FROM comics WHERE file_path = ?").get(fullLogical);
        await processComic(fullPhysical, fullLogical, db, coversDir, existing == null ? void 0 : existing.id, stats);
      } catch (e) {
        stats.errors.push(`Error processing ${entry.name}: ${e.message}`);
      }
    }
  } catch (e) {
    stats.errors.push(`Cannot read directory: ${e.message}`);
  }
}
async function processComic(physicalPath, logicalPath, db, coversDir, existingId, stats) {
  const fileName = physicalPath.split("/").pop() || logicalPath;
  const parsed = parseFilename(fileName);
  let metadata = {};
  const comicInfo = await getComicInfo(physicalPath);
  if (comicInfo) {
    metadata = {
      title: comicInfo.title || comicInfo.series || parsed.title,
      issue_number: comicInfo.number || parsed.issueNumber,
      volume: comicInfo.volume || parsed.volume,
      year: comicInfo.year || parsed.year,
      publisher: comicInfo.publisher || "",
      summary: comicInfo.summary || "",
      writer: comicInfo.writer || ""
    };
  }
  let coverPath = "";
  const coverBuffer = extractFirstPageImage(physicalPath);
  let isNew = false;
  if (!existingId) {
    const pageCount2 = countPages(physicalPath);
    const result = db.prepare(`
      INSERT INTO comics (file_path, file_name, cover_path, title, issue_number,
        volume, year, publisher, page_count, metadata_json, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logicalPath,
      fileName,
      "",
      parsed.title,
      parsed.issueNumber || "",
      parsed.volume || "",
      parsed.year || "",
      "",
      pageCount2,
      "{}",
      slugify(parsed.title, parsed.issueNumber)
    );
    existingId = result.lastInsertRowid;
    isNew = true;
  }
  if (coverBuffer) {
    const coverFile = coverPathFor(physicalPath);
    const success = await generateCover(coverBuffer, {
      title: metadata.title || parsed.title,
      series: metadata.title || parsed.title,
      number: metadata.issue_number || parsed.issueNumber,
      volume: metadata.volume || parsed.volume,
      publisher: metadata.publisher,
      year: metadata.year || parsed.year,
      summary: metadata.summary,
      writer: metadata.writer
    }, coverFile);
    if (success) coverPath = coverFile;
  }
  const cvResult = matchByFilename(parsed.title, parsed.issueNumber, parsed.year);
  let hashIssue = null;
  if (coverBuffer && cvResult) {
    try {
      const phash = await computePHash(coverBuffer);
      const volumes = searchVolumes(parsed.title);
      if (volumes.length > 0) {
        const scored = volumes.map((v) => {
          const bookWords = sanitizeTitle(parsed.title).split(" ").filter(Boolean);
          const seriesWords = sanitizeTitle(v.name).split(" ").filter(Boolean);
          const remaining = [...seriesWords];
          let score = 0;
          for (const w of bookWords) {
            const idx = remaining.indexOf(w);
            if (idx !== -1) {
              score += 5;
              remaining.splice(idx, 1);
            } else {
              score -= 3;
            }
          }
          score -= remaining.length * 3;
          const maxScore = bookWords.length * 5 + 50;
          const minScore = -(bookWords.length * 3 + remaining.length * 3 + 50);
          return { volume: v, ratio: (score - minScore) / (maxScore - minScore) };
        }).filter((s) => s.ratio >= 0.5).sort((a, b) => b.ratio - a.ratio);
        if (scored.length > 0) {
          const bestRatio = scored[0].ratio;
          const topIds = scored.filter((s) => s.ratio >= bestRatio - 0.1).slice(0, 5).map((s) => s.volume.id);
          hashIssue = matchIssueByCoverHash(phash, topIds);
        }
      }
    } catch {
    }
  }
  if (hashIssue) {
    metadata = {
      title: metadata.title || hashIssue.volume_name || parsed.title,
      issue_number: hashIssue.issue_number || metadata.issue_number || parsed.issueNumber,
      volume: hashIssue.volume_name || metadata.volume || "",
      publisher: hashIssue.publisher_name || metadata.publisher || "",
      year: hashIssue.cover_date ? hashIssue.cover_date.slice(0, 4) : metadata.year || parsed.year || "",
      summary: metadata.summary || hashIssue.description || "",
      cv_id: hashIssue.id,
      cv_volume_name: hashIssue.volume_name,
      cv_cover_date: hashIssue.cover_date,
      cv_url: hashIssue.site_detail_url,
      cv_cover_url: hashIssue.image_url,
      cv_description: hashIssue.description,
      cv_person_credits: hashIssue.person_credits,
      cv_character_credits: hashIssue.character_credits,
      cv_story_arc_credits: hashIssue.story_arc_credits,
      cv_match_method: "hash"
    };
  } else if (cvResult) {
    const i = cvResult.issue;
    const cvTitle = i.volume_name || (isGenericIssueName(i.name) ? "" : i.name);
    metadata = {
      title: metadata.title || cvTitle || parsed.title,
      issue_number: metadata.issue_number || i.issue_number || parsed.issueNumber,
      volume: metadata.volume || i.volume_name || "",
      publisher: metadata.publisher || i.publisher_name || "",
      year: metadata.year || (i.cover_date ? i.cover_date.slice(0, 4) : parsed.year) || "",
      summary: metadata.summary || i.description || "",
      cv_id: i.id,
      cv_volume_name: i.volume_name,
      cv_cover_date: i.cover_date,
      cv_url: i.site_detail_url,
      cv_cover_url: i.image_url,
      cv_description: i.description,
      cv_person_credits: i.person_credits,
      cv_character_credits: i.character_credits,
      cv_story_arc_credits: i.story_arc_credits,
      cv_match_method: cvResult.method
    };
  }
  const archiveType = getArchiveType(physicalPath);
  let pageCount = 0;
  if (archiveType !== "pdf") {
    const pages = listArchiveImages(physicalPath);
    pageCount = pages.length;
  }
  const metadataJson = JSON.stringify(metadata);
  const slug = slugify(metadata.title || parsed.title, metadata.issue_number || parsed.issueNumber);
  db.prepare(`
    UPDATE comics SET
      file_name = ?, cover_path = ?, title = ?, issue_number = ?,
      volume = ?, year = ?, publisher = ?, page_count = ?,
      metadata_json = ?, slug = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    fileName,
    coverPath,
    metadata.title || parsed.title,
    metadata.issue_number || parsed.issueNumber,
    metadata.volume || parsed.volume || "",
    metadata.year || parsed.year || "",
    metadata.publisher || "",
    pageCount,
    metadataJson,
    slug,
    existingId
  );
  if (isNew) stats.newComics++;
  else stats.updatedComics++;
}

const scan_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: scan_post
});

const index = defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }
  const method = getMethod(event);
  if (method === "GET") {
    const db = getDb();
    const rows = db.prepare("SELECT key, value FROM settings").all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return { settings };
  }
  if (method === "PUT" || method === "PATCH") {
    const body = await readBody(event);
    const db = getDb();
    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    for (const [key, value] of Object.entries(body)) {
      upsert.run(key, String(value));
    }
    return { ok: true };
  }
  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});

const index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index
});

const _id_ = defineEventHandler(async (event) => {
  const currentUser = event.context.user;
  if (!currentUser || currentUser.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }
  const db = getDb();
  const method = getMethod(event);
  if (method === "GET") {
    const user = db.prepare("SELECT id, username, role, created_at FROM users WHERE id = ?").get(id);
    if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });
    return { user };
  }
  if (method === "PATCH" || method === "PUT") {
    const body = await readBody(event);
    const targetUser = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (!targetUser) throw createError({ statusCode: 404, statusMessage: "User not found" });
    if (id === currentUser.userId && body.role && body.role !== "admin") {
      throw createError({ statusCode: 400, statusMessage: "Cannot change your own role" });
    }
    if (body.password) {
      const hash = createHash("sha256").update(body.password).digest("hex");
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, id);
    }
    if (body.role) {
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(body.role, id);
    }
    if (body.username) {
      const existing = db.prepare("SELECT id FROM users WHERE username = ? AND id != ?").get(body.username, id);
      if (existing) throw createError({ statusCode: 409, statusMessage: "Username already exists" });
      db.prepare("UPDATE users SET username = ? WHERE id = ?").run(body.username, id);
    }
    const updated = db.prepare("SELECT id, username, role, created_at FROM users WHERE id = ?").get(id);
    return { user: updated };
  }
  if (method === "DELETE") {
    if (id === currentUser.userId) {
      throw createError({ statusCode: 400, statusMessage: "Cannot delete yourself" });
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return { ok: true };
  }
  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});

const _id_$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id_
});

const index_get = defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }
  const db = getDb();
  const users = db.prepare("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC").all();
  return { users };
});

const index_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get
});

const index_post = defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }
  const body = await readBody(event);
  const { username, password, role } = body || {};
  if (!(username == null ? void 0 : username.trim()) || !(password == null ? void 0 : password.trim())) {
    throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
  }
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username.trim());
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "Username already exists" });
  }
  const hash = createHash("sha256").update(password.trim()).digest("hex");
  const validRole = role === "admin" ? "admin" : "user";
  const result = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run(username.trim(), hash, validRole);
  const newUser = db.prepare("SELECT id, username, role, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
  return { user: newUser };
});

const index_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_post
});
//# sourceMappingURL=index.mjs.map
