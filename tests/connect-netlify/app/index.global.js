"use strict";
var Fireproof = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod2) => function __require() {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  };
  var __export = (target, all) => {
    for (var name7 in all)
      __defProp(target, name7, { get: all[name7], enumerable: true });
  };
  var __copyProps = (to, from8, except, desc) => {
    if (from8 && typeof from8 === "object" || typeof from8 === "function") {
      for (let key of __getOwnPropNames(from8))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from8[key], enumerable: !(desc = __getOwnPropDesc(from8, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
    mod2
  ));
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

  // node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-I4NUGWZ6.js
  var __defProp2, __getOwnPropSymbols, __hasOwnProp2, __propIsEnum, __typeError, __defNormalProp, __spreadValues, __export2, __accessCheck, __privateGet, __privateAdd, __privateSet;
  var init_chunk_I4NUGWZ6 = __esm({
    "node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-I4NUGWZ6.js"() {
      "use strict";
      __defProp2 = Object.defineProperty;
      __getOwnPropSymbols = Object.getOwnPropertySymbols;
      __hasOwnProp2 = Object.prototype.hasOwnProperty;
      __propIsEnum = Object.prototype.propertyIsEnumerable;
      __typeError = (msg) => {
        throw TypeError(msg);
      };
      __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
      __spreadValues = (a, b) => {
        for (var prop in b || (b = {}))
          if (__hasOwnProp2.call(b, prop))
            __defNormalProp(a, prop, b[prop]);
        if (__getOwnPropSymbols)
          for (var prop of __getOwnPropSymbols(b)) {
            if (__propIsEnum.call(b, prop))
              __defNormalProp(a, prop, b[prop]);
          }
        return a;
      };
      __export2 = (target, all) => {
        for (var name7 in all)
          __defProp2(target, name7, { get: all[name7], enumerable: true });
      };
      __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
      __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
      __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
      __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
    }
  });

  // node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-AO7BGISE.js
  function streamMap(s, sm) {
    const state = { reader: s.getReader(), streamMap: sm, idx: 0 };
    return new ReadableStream({
      async pull(controller) {
        const { done, value } = await state.reader.read();
        if (done) {
          if (state.streamMap.Close) {
            state.streamMap.Close();
          }
          controller.close();
          return;
        }
        const promiseOrU = state.streamMap.Map(value, state.idx++);
        let mapped;
        if (promiseOrU instanceof Promise || typeof promiseOrU.then === "function") {
          mapped = await promiseOrU;
        } else {
          mapped = promiseOrU;
        }
        controller.enqueue(mapped);
      }
    });
  }
  async function devnull(a) {
    const reader = a.getReader();
    let cnt = 0;
    while (true) {
      const { done } = await reader.read();
      if (done) {
        break;
      }
      cnt++;
    }
    return cnt;
  }
  function array2stream(a) {
    let i = 0;
    return new ReadableStream({
      pull(controller) {
        if (i >= a.length) {
          controller.close();
          return;
        }
        controller.enqueue(a[i]);
        i++;
      }
    });
  }
  async function stream2array(a) {
    const ret = [];
    const reader = a.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      ret.push(value);
    }
    return ret;
  }
  async function rebufferArray(a, chunkSize) {
    return stream2array(rebuffer(array2stream(a), chunkSize));
  }
  function reChunk(cs, chunkSize) {
    const len = cs.reduce((acc, v) => acc + v.length, 0);
    const last2 = cs[cs.length - 1];
    const lastOfs = len - last2.length;
    const rest = last2.subarray(chunkSize - lastOfs);
    cs[cs.length - 1] = last2.subarray(0, chunkSize - lastOfs);
    const chunk = new Uint8Array(chunkSize);
    let ofs = 0;
    for (const c of cs) {
      chunk.set(c, ofs);
      ofs += c.length;
    }
    return { rest, chunk };
  }
  function pump(ps, controller, next) {
    ps.reader.read().then(({ done, value }) => {
      if (done) {
        if (ps.tmpLen > 0) {
          controller.enqueue(reChunk(ps.tmp, ps.tmpLen).chunk);
        }
        controller.close();
        next();
        return;
      }
      if (ps.tmpLen + value.length > ps.chunkSize) {
        ps.tmp.push(value);
        const res = reChunk(ps.tmp, ps.chunkSize);
        controller.enqueue(res.chunk);
        ps.tmp = [res.rest];
        ps.tmpLen = res.rest.length;
        next();
        return;
      } else if (value.length) {
        ps.tmp.push(value);
        ps.tmpLen += value.length;
      }
      pump(ps, controller, next);
    });
  }
  function rebuffer(a, chunkSize) {
    const state = {
      reader: a.getReader(),
      tmp: [],
      tmpLen: 0,
      chunkSize
    };
    return new ReadableStream({
      async pull(controller) {
        return new Promise((resolve7) => {
          pump(state, controller, resolve7);
        });
      }
    });
  }
  async function stream2string(stream, maxSize) {
    if (!stream) {
      return Promise.resolve("");
    }
    const reader = stream.getReader();
    let res = "";
    const decoder2 = new TextDecoder();
    let rSize = 0;
    while (typeof maxSize === "undefined" || rSize < maxSize) {
      try {
        const read5 = await reader.read();
        if (read5.done) {
          break;
        }
        if (maxSize && rSize + read5.value.length > maxSize) {
          read5.value = read5.value.slice(0, maxSize - rSize);
        }
        const block = decoder2.decode(read5.value, { stream: true });
        rSize += read5.value.length;
        res += block;
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.resolve(res);
  }
  async function stream2uint8array(stream) {
    if (!stream) {
      return Promise.resolve(new Uint8Array());
    }
    const reader = stream.getReader();
    let res = new Uint8Array();
    while (1) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        res = new Uint8Array([...res, ...value]);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.resolve(res);
  }
  async function receiveFromStream(reb, state) {
    return new Promise((resolve7) => {
      let reBufferCalls = 0;
      const reader = reb.getReader();
      function pump2() {
        reader.read().then(({ done, value }) => {
          state.CollectorFn({ done, value, fillCalls: state.fillCalls, reBufferCalls });
          reBufferCalls++;
          if (done) {
            resolve7();
            return;
          }
          pump2();
        });
      }
      pump2();
    });
  }
  async function sendToStream(reb, state) {
    return new Promise((resolve7) => {
      const writer = reb.getWriter();
      function pump2(i) {
        if (i >= state.sendChunks) {
          writer.close();
          resolve7();
          return;
        }
        writer.ready.then(() => {
          state.fillCalls++;
          writer.write(new Uint8Array(Array(state.sendChunkSize).fill(i)));
          pump2(i + 1);
        });
      }
      pump2(0);
    });
  }
  function string2stream(str) {
    const encoder2 = new TextEncoder();
    return uint8array2stream(encoder2.encode(str));
  }
  function uint8array2stream(str) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(str);
        controller.close();
      }
    });
  }
  var utils_exports, ConsoleWriterStreamDefaultWriter, ConsoleWriterStream, FanoutWriteStream;
  var init_chunk_AO7BGISE = __esm({
    "node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-AO7BGISE.js"() {
      "use strict";
      init_chunk_I4NUGWZ6();
      utils_exports = {};
      __export2(utils_exports, {
        ConsoleWriterStream: () => ConsoleWriterStream,
        ConsoleWriterStreamDefaultWriter: () => ConsoleWriterStreamDefaultWriter,
        FanoutWriteStream: () => FanoutWriteStream,
        array2stream: () => array2stream,
        devnull: () => devnull,
        rebuffer: () => rebuffer,
        rebufferArray: () => rebufferArray,
        receiveFromStream: () => receiveFromStream,
        sendToStream: () => sendToStream,
        stream2array: () => stream2array,
        stream2string: () => stream2string,
        stream2uint8array: () => stream2uint8array,
        streamMap: () => streamMap,
        string2stream: () => string2stream,
        uint8array2stream: () => uint8array2stream
      });
      ConsoleWriterStreamDefaultWriter = class {
        constructor(stream) {
          this.stream = stream;
          this.desiredSize = null;
          this.decoder = new TextDecoder();
          this._stream = stream;
          this.ready = Promise.resolve(void 0);
          this.closed = Promise.resolve(void 0);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        abort(reason) {
          throw new Error("Method not implemented.");
        }
        async close() {
        }
        releaseLock() {
          this._stream.locked = false;
          this.ready = Promise.resolve(void 0);
          this.closed = Promise.resolve(void 0);
        }
        async write(chunk) {
          const str = this.decoder.decode(chunk).trimEnd();
          let output = "log";
          try {
            const decode21 = JSON.parse(str);
            output = decode21.level;
          } catch (e) {
          }
          switch (output) {
            case "error":
              console.error(str);
              break;
            case "warn":
              console.warn(str);
              break;
            default:
              console.log(str);
          }
        }
      };
      ConsoleWriterStream = class {
        constructor() {
          this.locked = false;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        abort(reason) {
          throw new Error("Method not implemented.");
        }
        async close() {
          return;
        }
        getWriter() {
          if (this.locked) {
            throw new Error("Stream is locked");
          }
          this.locked = true;
          if (!this._writer) {
            this._writer = new ConsoleWriterStreamDefaultWriter(this);
          }
          return this._writer;
        }
      };
      FanoutWriteStream = class {
        constructor(writers) {
          this.desiredSize = null;
          this._writers = writers;
          this.ready = Promise.all(this._writers.map((w) => w.ready)).then(() => void 0);
          this.closed = Promise.all(this._writers.map((w) => w.closed)).then(() => void 0);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abort(reason) {
          return Promise.all(this._writers.map((w) => w.abort(reason))).then(() => {
          });
        }
        close() {
          return Promise.all(this._writers.map((w) => w.close())).then(() => {
          });
        }
        releaseLock() {
          this._writers.map((w) => w.releaseLock());
        }
        write(chunk) {
          return Promise.all(this._writers.map((w) => w.write(chunk))).then(() => {
          });
        }
      };
    }
  });

  // node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-JYUQZNDZ.js
  function TimeFactory(timeMode) {
    switch (timeMode) {
      case "real":
        return new SysTime();
      case "const":
        return new ConstTime();
      case "step":
        return new StepTime();
    }
    return new SysTime();
  }
  function envFactory(opts = {}) {
    return _envFactory.once(() => {
      const found = [new NodeEnvActions(opts), new DenoEnvActions(opts), new BrowserEnvActions(opts)].find((env) => env.active());
      if (!found) {
        throw new Error("SysContainer:envFactory: no env available");
      }
      const ret = new EnvImpl(found, opts);
      found.register(ret);
      return ret;
    });
  }
  var Time, SysTime, ConstTime, StepTime, RandomService, IdService, decoder, BaseSysAbstraction, WrapperSysAbstraction, _promise, _resolveFn, _rejectFn, Future, ResolveSeq, ResolveOnce, Keyed, KeyedResolvOnce, _node, NodeEnvActions, _deno, DenoEnvActions, BrowserEnvActions, _envFactory, EnvImpl;
  var init_chunk_JYUQZNDZ = __esm({
    "node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-JYUQZNDZ.js"() {
      "use strict";
      init_chunk_I4NUGWZ6();
      Time = class {
        TimeSince(start) {
          const now = this.Now();
          return now.getTime() - start.getTime();
        }
      };
      SysTime = class extends Time {
        Now() {
          return /* @__PURE__ */ new Date();
        }
        Sleep(duration) {
          return new Promise((resolve7) => {
            setTimeout(() => {
              resolve7();
            }, duration);
          });
        }
      };
      ConstTime = class extends Time {
        Now() {
          return new Date(2021, 1, 1, 0, 0, 0, 0);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Sleep(duration) {
          return Promise.resolve();
        }
      };
      StepTime = class extends Time {
        constructor() {
          super();
          this._step = new ConstTime().Now();
          this._start = this._step;
        }
        Now(steps = 1) {
          for (let i = 0; steps > 0 && i < steps; i++) {
            this._step = new Date(this._step.getTime() + 1e3);
          }
          if (steps < 1) {
            this._step = new Date(this._start.getTime() + steps * -1e3);
          }
          return this._step;
        }
        Sleep(duration) {
          this._step = new Date(this._step.getTime() + duration);
          return Promise.resolve();
        }
      };
      RandomService = class {
        constructor(mode) {
          this._step = 0;
          this._mode = mode;
        }
        Random0ToValue(value) {
          switch (this._mode) {
            case "const":
              return 0.5 * value;
            case "step":
              this._step += 1e-4;
              return this._step * value;
            case "random":
              return Math.random() * value;
            default:
              throw new Error("Unknown RandomMode");
          }
        }
      };
      IdService = class {
        constructor(mode) {
          this._step = 0;
          if (!mode) {
            mode = "uuid";
          }
          this._mode = mode;
        }
        NextId() {
          switch (this._mode) {
            case "uuid":
              return crypto.randomUUID();
            case "const":
              return "VeryUniqueID";
            case "step":
              return `STEPId-${this._step++}`;
            default:
              throw new Error("Unknown IDMode");
          }
        }
      };
      decoder = new TextDecoder();
      BaseSysAbstraction = class {
        constructor(params) {
          this._time = new SysTime();
          this._stdout = new WritableStream({
            write(chunk) {
              return new Promise((resolve7) => {
                const decoded = decoder.decode(chunk);
                console.log(decoded.trimEnd());
                resolve7();
              });
            }
          });
          this._stderr = new WritableStream({
            write(chunk) {
              return new Promise((resolve7) => {
                const decoded = decoder.decode(chunk);
                console.error(decoded.trimEnd());
                resolve7();
              });
            }
          });
          this._idService = new IdService();
          this._randomService = new RandomService(
            "random"
            /* RANDOM */
          );
          this._fileSystem = params.FileSystem;
          this._systemService = params.SystemService;
        }
      };
      WrapperSysAbstraction = class {
        constructor(base4, params) {
          this._time = base4._time;
          this._stdout = base4._stdout;
          this._stderr = base4._stderr;
          this._idService = base4._idService;
          this._randomService = base4._randomService;
          this._fileSystem = base4._fileSystem;
          this._systemService = base4._systemService;
          if (params) {
            if (params.TimeMode) {
              this._time = TimeFactory(params.TimeMode);
            }
            if (params.Stdout) {
              this._stdout = params.Stdout;
            }
            if (params.Stderr) {
              this._stderr = params.Stderr;
            }
            if (params.IdMode) {
              this._idService = new IdService(params.IdMode);
            }
            if (params.RandomMode) {
              this._randomService = new RandomService(params.RandomMode);
            }
            if (params.FileSystem) {
              this._fileSystem = params.FileSystem;
            }
            if (params.SystemService) {
              this._systemService = params.SystemService;
            }
          }
        }
        Time() {
          return this._time;
        }
        NextId() {
          return this._idService.NextId();
        }
        Random0ToValue(value) {
          return this._randomService.Random0ToValue(value);
        }
        Stdout() {
          return this._stdout;
        }
        Stderr() {
          return this._stderr;
        }
        System() {
          return this._systemService;
        }
        FileSystem() {
          return this._fileSystem;
        }
      };
      Future = class {
        constructor() {
          __privateAdd(this, _promise);
          __privateAdd(this, _resolveFn, () => {
            throw new Error("This Promise is not working as expected.");
          });
          __privateAdd(this, _rejectFn, () => {
            throw new Error("This Promise is not working as expected.");
          });
          __privateSet(this, _promise, new Promise((resolve7, reject) => {
            __privateSet(this, _resolveFn, resolve7);
            __privateSet(this, _rejectFn, reject);
          }));
        }
        async asPromise() {
          return __privateGet(this, _promise);
        }
        resolve(value) {
          __privateGet(this, _resolveFn).call(this, value);
        }
        reject(reason) {
          __privateGet(this, _rejectFn).call(this, reason);
        }
      };
      _promise = /* @__PURE__ */ new WeakMap();
      _resolveFn = /* @__PURE__ */ new WeakMap();
      _rejectFn = /* @__PURE__ */ new WeakMap();
      ResolveSeq = class {
        constructor(ctx) {
          this._seqFutures = [];
          this.ctx = ctx;
        }
        reset() {
        }
        async _step(item) {
          if (!item) {
            return;
          }
          item.fn(this.ctx).then((value) => item.future.resolve(value)).catch((e) => item.future.reject(e)).finally(() => {
            this._seqFutures.shift();
            this._step(this._seqFutures[0]);
          });
        }
        async add(fn, id) {
          const future = new Future();
          this._seqFutures.push({ future, fn, id });
          if (this._seqFutures.length === 1) {
            this._step(this._seqFutures[0]);
          }
          return future.asPromise();
        }
      };
      ResolveOnce = class {
        constructor(ctx) {
          this._onceDone = false;
          this._onceFutures = [];
          this._onceOk = false;
          this._isPromise = false;
          this.ctx = ctx;
        }
        get ready() {
          return this._onceDone;
        }
        reset() {
          this._onceDone = false;
          this._onceOk = false;
          this._onceValue = void 0;
          this._onceError = void 0;
          this._onceFutures.length = 0;
        }
        // T extends Option<infer U> ? U : T
        once(fn) {
          if (this._onceDone) {
            if (this._onceError) {
              if (this._isPromise) {
                return Promise.reject(this._onceError);
              } else {
                throw this._onceError;
              }
            }
            if (this._onceOk) {
              if (this._isPromise) {
                return Promise.resolve(this._onceValue);
              } else {
                return this._onceValue;
              }
            }
            throw new Error("ResolveOnce.once impossible");
          }
          const future = new Future();
          this._onceFutures.push(future);
          if (this._onceFutures.length === 1) {
            const okFn = (value) => {
              this._onceValue = value;
              this._onceOk = true;
              this._onceDone = true;
              if (this._isPromise) {
                this._onceFutures.forEach((f) => f.resolve(this._onceValue));
              }
              this._onceFutures.length = 0;
            };
            const catchFn = (e) => {
              this._onceError = e;
              this._onceOk = false;
              this._onceValue = void 0;
              this._onceDone = true;
              if (this._isPromise) {
                this._onceFutures.forEach((f) => f.reject(this._onceError));
              }
              this._onceFutures.length = 0;
            };
            try {
              const ret = fn(this.ctx);
              if (typeof ret.then === "function") {
                this._isPromise = true;
                ret.then(okFn).catch(catchFn);
              } else {
                okFn(ret);
              }
            } catch (e) {
              catchFn(e);
            }
          }
          if (this._isPromise) {
            return future.asPromise();
          } else {
            return this.once(fn);
          }
        }
      };
      Keyed = class {
        constructor(factory) {
          this._map = /* @__PURE__ */ new Map();
          this.factory = factory;
        }
        async asyncGet(key) {
          return this.get(await key());
        }
        get(key) {
          if (typeof key === "function") {
            key = key();
          }
          let keyed = this._map.get(key);
          if (!keyed) {
            keyed = this.factory(key);
            this._map.set(key, keyed);
          }
          return keyed;
        }
        reset() {
          this._map.forEach((keyed) => keyed.reset());
          this._map.clear();
        }
      };
      KeyedResolvOnce = class extends Keyed {
        constructor() {
          super((key) => new ResolveOnce(key));
        }
      };
      NodeEnvActions = class {
        // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-unused-vars
        constructor(opts) {
          __privateAdd(this, _node, globalThis);
          this._env = this.active() ? __privateGet(this, _node).process.env : {};
        }
        register(env) {
          return env;
        }
        active() {
          return typeof __privateGet(this, _node) === "object" && typeof __privateGet(this, _node).process === "object" && typeof __privateGet(this, _node).process.env === "object";
        }
        keys() {
          return Object.keys(this._env);
        }
        get(key) {
          return this._env[key];
        }
        set(key, value) {
          if (value) {
            this._env[key] = value;
          }
        }
        delete(key) {
          delete this._env[key];
        }
      };
      _node = /* @__PURE__ */ new WeakMap();
      DenoEnvActions = class {
        // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-unused-vars
        constructor(opts) {
          __privateAdd(this, _deno, globalThis);
        }
        get _env() {
          return __privateGet(this, _deno).Deno.env;
        }
        register(env) {
          return env;
        }
        active() {
          return typeof __privateGet(this, _deno) === "object" && typeof __privateGet(this, _deno).Deno === "object" && typeof __privateGet(this, _deno).Deno.env === "object";
        }
        keys() {
          return Array.from(this._env.keys());
        }
        get(key) {
          return this._env.get(key);
        }
        set(key, value) {
          if (value) {
            this._env.set(key, value);
          }
        }
        delete(key) {
          this._env.delete(key);
        }
      };
      _deno = /* @__PURE__ */ new WeakMap();
      BrowserEnvActions = class {
        constructor(opts) {
          this.env = /* @__PURE__ */ new Map();
          this.opts = opts;
        }
        get(key) {
          return this.env.get(key);
        }
        set(key, value) {
          if (value) {
            this.env.set(key, value);
          }
        }
        delete(key) {
          this.env.delete(key);
        }
        keys() {
          return Array.from(this.env.keys());
        }
        active() {
          return true;
        }
        register(env) {
          const sym = Symbol.for(this.opts.symbol || "CP_ENV");
          const browser = globalThis;
          browser[sym] = env;
          return env;
        }
      };
      _envFactory = new ResolveOnce();
      EnvImpl = class {
        constructor(map2, opts = {}) {
          this._onSet = [];
          this._map = map2;
          this._updatePresets(opts.presetEnv);
        }
        _updatePresets(presetEnv2) {
          if (!presetEnv2) {
            return;
          }
          for (const [key, value] of presetEnv2) {
            this._map.set(key, value);
          }
        }
        _applyOnSet(onSet, key, value) {
          onSet.forEach((item) => {
            let keys = [];
            if (key) {
              keys = [key];
            } else {
              keys = this._map.keys();
            }
            keys.filter((k) => {
              if (item.filter.size === 0) {
                return true;
              }
              if (item.filter.has(k)) {
                return true;
              }
              return false;
            }).forEach((k) => {
              let v;
              if (!key && !value) {
                v = this._map.get(k);
              } else if (key && !value) {
                v = void 0;
              } else {
                v = value;
              }
              item.fn(k, v);
            });
          });
        }
        keys() {
          return this._map.keys();
        }
        // filter is not set all sets passed
        onSet(fn, ...filter2) {
          const item = { filter: new Set(filter2), fn };
          this._onSet.push(item);
          this._applyOnSet([item]);
        }
        get(key) {
          return this._map.get(key);
        }
        set(key, value) {
          if (!value) {
            return;
          }
          this._map.set(key, value);
          this._applyOnSet(this._onSet, key, value);
        }
        delete(key) {
          this._map.delete(key);
          this._applyOnSet(this._onSet, key);
        }
      };
    }
  });

  // node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-2L33RPFJ.js
  function WebSysAbstraction(param) {
    if (!my) {
      my = new BaseSysAbstraction({
        FileSystem: new WebFileService(),
        SystemService: new WebSystemService()
      });
    }
    return new WrapperSysAbstraction(my, param);
  }
  var WebFileService, WebSystemService, my;
  var init_chunk_2L33RPFJ = __esm({
    "node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/chunk-2L33RPFJ.js"() {
      "use strict";
      init_chunk_JYUQZNDZ();
      WebFileService = class {
        get baseDir() {
          throw new Error("basedir-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        create(fname) {
          throw new Error("create-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        readFileString(fname) {
          throw new Error("readFileString-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        writeFileString(fname, content) {
          throw new Error("writeFileString-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        abs(fname) {
          throw new Error("abs-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        join(...paths) {
          throw new Error("join-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        relative(from8, to) {
          throw new Error("relative-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dirname(fname) {
          throw new Error("dirname-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        basename(fname) {
          throw new Error("basename-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        nodeImport(fname) {
          throw new Error("nodeImport-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isAbsolute(fname) {
          throw new Error("isAbsolute-Method not implemented.");
        }
      };
      WebSystemService = class {
        Env() {
          return envFactory();
        }
        Args() {
          throw new Error("Args-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        OnExit(hdl) {
          throw new Error("OnExit-Method not implemented.");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Exit(code9) {
          throw new Error("Exit-Method not implemented.");
        }
      };
      my = void 0;
    }
  });

  // node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/index.js
  function removeSelfRef() {
    const cache3 = /* @__PURE__ */ new Set();
    return function(key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache3.has(value)) return "...";
        cache3.add(value);
      }
      return value;
    };
  }
  function asyncLogValue(val) {
    throw new Error("Not implemented");
  }
  function logValue(val) {
    switch (typeof val) {
      case "function":
        return new LogValue(val);
      case "string":
        return new LogValue(() => {
          try {
            const ret = JSON.parse(val);
            if (typeof ret === "object" && ret !== null) {
              return ret;
            }
          } catch (e) {
          }
          return val.toString();
        });
      case "number":
        return new LogValue(() => val);
      case "boolean":
        return new LogValue(() => val);
      case "object":
        return new LogValue(() => JSON.parse(JSON.stringify(val, removeSelfRef())));
      default:
        if (!val) {
          return new LogValue(() => "--Falsy--");
        }
        throw new Error(`Invalid type:${typeof val}`);
    }
  }
  function IsLogger(obj) {
    return typeof obj === "object" && [
      "Module",
      "EnableLevel",
      "DisableLevel",
      "SetDebug",
      "Str",
      "Error",
      "Warn",
      "Debug",
      "Log",
      "WithLevel",
      "Err",
      "Info",
      "Timestamp",
      "Any",
      "Dur",
      "Uint64"
    ].map((fn) => typeof obj[fn] === "function").reduce((a, b) => a && b, true);
  }
  function exception2Result(fn) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res.then((value) => Result.Ok(value)).catch((e) => Result.Err(e));
      }
      return Result.Ok(res);
    } catch (e) {
      return Result.Err(e);
    }
  }
  function falsy2undef(value) {
    return value === void 0 || value === null ? void 0 : value;
  }
  function ensureURLWithDefaultProto(url, defaultProtocol) {
    if (!url) {
      return new MutableURL(`${defaultProtocol}//`);
    }
    if (typeof url === "string") {
      try {
        return new MutableURL(url);
      } catch (e) {
        return new MutableURL(`${defaultProtocol}//${url}`);
      }
    } else {
      return new MutableURL(url.toString());
    }
  }
  function isURL(value) {
    return value instanceof URL || !!value && typeof value.searchParams === "object" && typeof value.searchParams.sort === "function" && typeof value.hash === "string";
  }
  function from(fac, strURLUri, defaultProtocol) {
    switch (typeof falsy2undef(strURLUri)) {
      case "undefined":
        return fac(new MutableURL(`${defaultProtocol}///`));
      case "string":
        return fac(ensureURLWithDefaultProto(strURLUri, defaultProtocol));
      case "object":
        if (BuildURI.is(strURLUri)) {
          return fac(new MutableURL(strURLUri._url.toString()));
        } else if (URI.is(strURLUri)) {
          return fac(new MutableURL(strURLUri._url.toString()));
        } else if (isURL(strURLUri)) {
          return fac(new MutableURL(strURLUri.toString()));
        }
        throw new Error(`unknown object type: ${strURLUri}`);
      default:
        throw new Error(`Invalid argument: ${typeof strURLUri}`);
    }
  }
  function isSet(value, ref = globalThis) {
    const [head, ...tail] = value.split(".");
    if (["object", "function"].includes(typeof ref) && ref && ["object", "function"].includes(typeof ref[head]) && ref[head]) {
      if (tail.length <= 1) {
        return true;
      }
      return isSet(tail.join("."), ref[head]);
    }
    return false;
  }
  function runtimeFn() {
    const isReactNative = isSet("navigator.product") && globalThis.navigator.product === "ReactNative";
    const isNodeIsh = isSet("process.versions.node") && !isReactNative;
    const isDeno = isSet("Deno") && !isReactNative;
    return {
      isNodeIsh,
      isBrowser: !(isNodeIsh || isDeno) && !isReactNative,
      isDeno,
      isReactNative
    };
  }
  function getLen(value) {
    if (Array.isArray(value)) {
      return logValue(() => value.length);
    } else if (typeof value === "string") {
      return logValue(() => value.length);
    } else if (typeof value === "object" && value !== null) {
      if (typeof value.size === "number") {
        return logValue(() => value.size);
      } else if (typeof value.length === "number") {
        return logValue(() => value.length);
      }
      return logValue(() => Object.keys(value).length);
    }
    return logValue(() => -1);
  }
  function hash(value) {
    return "not implemented";
  }
  function toLogValue(lop) {
    if (lop && typeof lop.then === "function") {
      throw new Error("async logValue Not implemented");
    }
    return lop;
  }
  function randomBytes(size) {
    const bytes = new Uint8Array(size);
    if (size > 0) {
      crypto.getRandomValues(bytes);
    }
    return bytes;
  }
  function digestSHA256(data) {
    return Promise.resolve(crypto.subtle.digest("SHA-256", data));
  }
  function toCryptoRuntime(cryptoOpts = {}) {
    const runtime = {
      importKey: cryptoOpts.importKey || crypto.subtle.importKey.bind(crypto.subtle),
      encrypt: cryptoOpts.encrypt || crypto.subtle.encrypt.bind(crypto.subtle),
      decrypt: cryptoOpts.decrypt || crypto.subtle.decrypt.bind(crypto.subtle),
      randomBytes: cryptoOpts.randomBytes || randomBytes,
      digestSHA256: cryptoOpts.digestSHA256 || digestSHA256
    };
    return runtime;
  }
  var LogValue, Result, ResultOK, ResultError, MutableURL, BuildURI, protocols, URI, encoder, LevelHandlerImpl, levelSingleton, LogWriterStream, LoggerImpl, WithLoggerBuilder;
  var init_cement = __esm({
    "node_modules/.pnpm/@adviser+cement@0.2.24/node_modules/@adviser/cement/index.js"() {
      "use strict";
      init_chunk_AO7BGISE();
      init_chunk_2L33RPFJ();
      init_chunk_JYUQZNDZ();
      init_chunk_I4NUGWZ6();
      LogValue = class {
        constructor(fn) {
          this.fn = fn;
        }
        value() {
          return this.fn();
        }
        toJSON() {
          return this.value();
        }
      };
      Result = class _Result {
        static Ok(t) {
          return new ResultOK(t);
        }
        static Err(t) {
          if (typeof t === "string") {
            return new ResultError(new Error(t));
          }
          return new ResultError(t);
        }
        static Is(t) {
          if (!t) {
            return false;
          }
          if (t instanceof _Result) {
            return true;
          }
          const rt = t;
          if ([typeof rt.is_ok, typeof rt.is_err, typeof rt.unwrap, typeof rt.unwrap_err].every((x) => x === "function")) {
            return true;
          }
          return false;
        }
        isOk() {
          return this.is_ok();
        }
        isErr() {
          return this.is_err();
        }
        Ok() {
          return this.unwrap();
        }
        Err() {
          return this.unwrap_err();
        }
      };
      ResultOK = class extends Result {
        constructor(t) {
          super();
          this._t = t;
        }
        is_ok() {
          return true;
        }
        is_err() {
          return false;
        }
        unwrap_err() {
          throw new Error("Result is Ok");
        }
        unwrap() {
          return this._t;
        }
      };
      ResultError = class extends Result {
        constructor(t) {
          super();
          this._error = t;
        }
        is_ok() {
          return false;
        }
        is_err() {
          return true;
        }
        unwrap() {
          throw new Error(`Result is Err: ${this._error}`);
        }
        unwrap_err() {
          return this._error;
        }
      };
      MutableURL = class _MutableURL extends URL {
        constructor(urlStr) {
          super("defect://does.not.exist");
          const partedURL = urlStr.split(":");
          this._hasHostpart = protocols.has(partedURL[0]);
          let hostPartUrl = ["http", ...partedURL.slice(1)].join(":");
          if (!this._hasHostpart) {
            const pathname = hostPartUrl.replace(/http:\/\/[/]*/, "").replace(/[#?].*$/, "");
            hostPartUrl = hostPartUrl.replace(/http:\/\//, `http://localhost/${pathname}`);
          }
          try {
            this._sysURL = new URL(hostPartUrl);
          } catch (ie) {
            const e = ie;
            e.message = `${e.message} for URL: ${urlStr}`;
            throw e;
          }
          this._protocol = `${partedURL[0]}:`;
          if (this._hasHostpart) {
            this._pathname = this._sysURL.pathname;
          } else {
            this._pathname = urlStr.replace(new RegExp(`^${this._protocol}//`), "").replace(/[#?].*$/, "");
          }
          this.hash = this._sysURL.hash;
        }
        clone() {
          return new _MutableURL(this.toString());
        }
        get host() {
          if (!this._hasHostpart) {
            throw new Error(
              `you can use hostname only if protocol is ${this.toString()} ${JSON.stringify(Array.from(protocols.keys()))}`
            );
          }
          return this._sysURL.host;
        }
        get port() {
          if (!this._hasHostpart) {
            throw new Error(`you can use hostname only if protocol is ${JSON.stringify(Array.from(protocols.keys()))}`);
          }
          return this._sysURL.port;
        }
        set port(p) {
          if (!this._hasHostpart) {
            throw new Error(`you can use port only if protocol is ${JSON.stringify(Array.from(protocols.keys()))}`);
          }
          this._sysURL.port = p;
        }
        get hostname() {
          if (!this._hasHostpart) {
            throw new Error(`you can use hostname only if protocol is ${JSON.stringify(Array.from(protocols.keys()))}`);
          }
          return this._sysURL.hostname;
        }
        set hostname(h) {
          if (!this._hasHostpart) {
            throw new Error(`you can use hostname only if protocol is ${JSON.stringify(Array.from(protocols.keys()))}`);
          }
          this._sysURL.hostname = h;
        }
        set pathname(p) {
          this._pathname = p;
        }
        get pathname() {
          return this._pathname;
        }
        get protocol() {
          return this._protocol;
        }
        set protocol(p) {
          if (!p.endsWith(":")) {
            p = `${p}:`;
          }
          this._protocol = p;
        }
        get searchParams() {
          return this._sysURL.searchParams;
        }
        toString() {
          let search = "";
          if (this._sysURL.searchParams.size) {
            for (const [key, value] of Array.from(this._sysURL.searchParams.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
              search += `${!search.length ? "?" : "&"}${key}=${encodeURIComponent(value)}`;
            }
          }
          let hostpart = "";
          if (this._hasHostpart) {
            hostpart = this._sysURL.hostname;
            if (this._sysURL.port) {
              hostpart += `:${this._sysURL.port}`;
            }
            if (!this._pathname.startsWith("/")) {
              hostpart += "/";
            }
          }
          return `${this._protocol}//${hostpart}${this._pathname}${search}`;
        }
      };
      BuildURI = class _BuildURI {
        // pathname needs this
        constructor(url) {
          this._url = url;
        }
        static is(value) {
          return value instanceof _BuildURI || !!value && typeof value.delParam === "function" && typeof value.setParam === "function";
        }
        static from(strURLUri, defaultProtocol = "file:") {
          return from((url) => new _BuildURI(url), strURLUri, defaultProtocol);
        }
        port(p) {
          this._url.port = p;
          return this;
        }
        hostname(h) {
          this._url.hostname = h;
          return this;
        }
        // password(p: string) {
        //   this._url.password = p;
        //   return this;
        // }
        // port(p: string) {
        //   this._url.port = p;
        //   return this;
        // }
        // username(u: string) {
        //   this._url.username = u;
        //   return this;
        // }
        // search(s: string) {
        //   this._url.search = s;
        //   return this;
        // }
        protocol(p) {
          this._url.protocol = p;
          return this;
        }
        pathname(p) {
          this._url.pathname = p;
          return this;
        }
        // hash(h: string) {
        //   this._url.hash = h;
        //   return this;
        // }
        // host(h: string) {
        //   this._url.host = h;
        //   return this;
        // }
        delParam(key) {
          this._url.searchParams.delete(key);
          return this;
        }
        defParam(key, str) {
          if (!this._url.searchParams.has(key)) {
            this._url.searchParams.set(key, str);
          }
          return this;
        }
        setParam(key, str) {
          this._url.searchParams.set(key, str);
          return this;
        }
        toString() {
          this._url.searchParams.sort();
          return this._url.toString();
        }
        toJSON() {
          return this.toString();
        }
        URI() {
          return URI.from(this._url);
        }
      };
      protocols = /* @__PURE__ */ new Map([
        ["http", true],
        ["https", true],
        ["ws", true],
        ["wss", true]
      ]);
      URI = class _URI {
        static protocolHasHostpart(protocol) {
          protocol = protocol.replace(/:$/, "");
          protocols.set(protocol, true);
          return () => {
            protocols.delete(protocol);
          };
        }
        // if no protocol is provided, default to file:
        static merge(into, from22, defaultProtocol = "file:") {
          const intoUrl = BuildURI.from(into, defaultProtocol);
          const fromUrl = _URI.from(from22, defaultProtocol);
          intoUrl.protocol(fromUrl.protocol);
          const fPath = fromUrl.pathname;
          if (!(fPath.length === 0 || fPath === "/" || fPath === "./")) {
            intoUrl.pathname(fromUrl.pathname);
          }
          for (const [key, value] of fromUrl.getParams) {
            intoUrl.setParam(key, value);
          }
          return intoUrl.URI();
        }
        static is(value) {
          return value instanceof _URI || !!value && typeof value.asURL === "function" && typeof value.getParam === "function" && typeof value.hasParam === "function";
        }
        // if no protocol is provided, default to file:
        static from(strURLUri, defaultProtocol = "file:") {
          return from((url) => new _URI(url), strURLUri, defaultProtocol);
        }
        static fromResult(strURLUri, defaultProtocol = "file:") {
          return exception2Result(() => from((url) => new _URI(url), strURLUri, defaultProtocol));
        }
        constructor(url) {
          this._url = url.clone();
        }
        build() {
          return BuildURI.from(this._url);
        }
        get hostname() {
          return this._url.hostname;
        }
        // get password(): string {
        //   return this._url.password;
        // }
        get port() {
          return this._url.port;
        }
        get host() {
          return this._url.host;
        }
        // get username(): string {
        //   return this._url.username;
        // }
        // get search(): string {
        //   return this._url.search;
        // }
        get protocol() {
          return this._url.protocol;
        }
        get pathname() {
          return this._url.pathname;
        }
        // get hash(): string {
        //   return this._url.hash;
        // }
        // get host(): string {
        //   return this._url.host;
        // }
        get getParams() {
          return this._url.searchParams.entries();
        }
        hasParam(key) {
          return this._url.searchParams.has(key);
        }
        getParam(key) {
          return falsy2undef(this._url.searchParams.get(key));
        }
        clone() {
          return new _URI(this._url);
        }
        asURL() {
          return this._url.clone();
        }
        toString() {
          return this._url.toString();
        }
        toJSON() {
          return this.toString();
        }
      };
      encoder = new TextEncoder();
      LevelHandlerImpl = class {
        constructor() {
          this._globalLevels = /* @__PURE__ */ new Set([
            "info",
            "error",
            "warn"
            /* WARN */
          ]);
          this._modules = /* @__PURE__ */ new Map();
          this.isStackExposed = false;
        }
        enableLevel(level, ...modules) {
          if (modules.length == 0) {
            this._globalLevels.add(level);
            return;
          }
          this.forModules(
            level,
            (p) => {
              this._modules.set(p, /* @__PURE__ */ new Set([...this._globalLevels, level]));
            },
            ...modules
          );
        }
        disableLevel(level, ...modules) {
          if (modules.length == 0) {
            this._globalLevels.delete(level);
            return;
          }
          this.forModules(
            level,
            (p) => {
              this._modules.delete(p);
            },
            ...modules
          );
        }
        setExposeStack(enable) {
          this.isStackExposed = !!enable;
        }
        forModules(level, fnAction, ...modules) {
          for (const m of modules.flat()) {
            if (typeof m !== "string") {
              continue;
            }
            const parts = m.split(",").map((s) => s.trim()).filter((s) => s.length);
            for (const p of parts) {
              fnAction(p);
            }
          }
        }
        setDebug(...modules) {
          this.forModules(
            "debug",
            (p) => {
              this._modules.set(p, /* @__PURE__ */ new Set([
                ...this._globalLevels,
                "debug"
                /* DEBUG */
              ]));
            },
            ...modules
          );
        }
        isEnabled(ilevel, module2) {
          const level = ilevel;
          if (typeof module2 === "string") {
            const levels = this._modules.get(module2);
            if (levels && levels.has(level)) {
              return true;
            }
          }
          const wlevel = this._modules.get("*");
          if (wlevel && typeof level === "string") {
            if (wlevel.has(level)) {
              return true;
            }
          }
          if (typeof level !== "string") {
            return true;
          }
          return this._globalLevels.has(level);
        }
      };
      levelSingleton = new LevelHandlerImpl();
      LogWriterStream = class {
        constructor(out) {
          this._toFlush = [];
          this._flushIsRunning = false;
          this._flushDoneFns = Array();
          this._out = out;
        }
        write(encoded) {
          const my2 = async () => {
            try {
              const writer = this._out.getWriter();
              await writer.ready;
              await writer.write(encoded);
              await writer.releaseLock();
            } catch (err) {
              console.error("Chunk error:", err);
            }
          };
          this._toFlush.push(my2);
          this._flush();
        }
        _flush(toFlush = void 0, done) {
          if (done) {
            this._flushDoneFns.push(done);
          }
          if (this._toFlush.length == 0) {
            this._flushIsRunning = false;
            this._flushDoneFns.forEach((fn) => fn());
            this._flushDoneFns = [];
            return;
          }
          if (!toFlush && this._toFlush.length == 1 && !this._flushIsRunning) {
            this._flushIsRunning = true;
          } else if (!toFlush) {
            return;
          }
          const my2 = this._toFlush.shift();
          my2 == null ? void 0 : my2().finally(() => {
            this._flush(this._toFlush);
          });
        }
      };
      LoggerImpl = class _LoggerImpl {
        // readonly _id: string = "logger-" + Math.random().toString(36)
        constructor(params) {
          this._attributes = {};
          if (!params) {
            params = {};
          }
          if (!params.sys) {
            this._sys = WebSysAbstraction();
          } else {
            this._sys = params.sys;
          }
          if (params.logWriter) {
            this._logWriter = params.logWriter;
          } else {
            if (!params.out) {
              const rt = runtimeFn();
              let stream;
              if (rt.isBrowser) {
                stream = new ConsoleWriterStream();
              } else {
                if (rt.isNodeIsh || rt.isReactNative) {
                  stream = this._sys.Stdout();
                } else {
                  throw new Error("No output defined for runtime");
                }
              }
              this._logWriter = new LogWriterStream(stream);
            } else {
              this._logWriter = new LogWriterStream(params.out);
            }
          }
          if (!params.withAttributes) {
            this._withAttributes = {};
          } else {
            this._withAttributes = __spreadValues({}, params.withAttributes);
          }
          this._attributes = __spreadValues({}, this._withAttributes);
          if (params.levelHandler) {
            this._levelHandler = params.levelHandler;
          } else {
            this._levelHandler = levelSingleton;
          }
        }
        Attributes() {
          return Array.from(Object.entries(this._attributes)).reduce(
            (acc, [key, value]) => {
              if (value instanceof LogValue) {
                acc[key] = value.value();
              }
              return acc;
            },
            {}
          );
        }
        SetExposeStack(enable) {
          this._levelHandler.setExposeStack(enable);
          return this;
        }
        EnableLevel(level, ...modules) {
          this._levelHandler.enableLevel(level, ...modules);
          return this;
        }
        DisableLevel(level, ...modules) {
          this._levelHandler.disableLevel(level, ...modules);
          return this;
        }
        Module(key) {
          this._attributes["module"] = logValue(key);
          this._withAttributes["module"] = logValue(key);
          return this;
        }
        // if the string is "*" it will enable for all modules
        SetDebug(...modules) {
          this._levelHandler.setDebug(...modules);
          return this;
        }
        Timestamp() {
          this._attributes["ts"] = logValue(() => this._sys.Time().Now().toISOString());
          return this;
        }
        Warn() {
          this._attributes["level"] = logValue(
            "warn"
            /* WARN */
          );
          return this;
        }
        Log() {
          return this;
        }
        Debug() {
          this._attributes["level"] = logValue(
            "debug"
            /* DEBUG */
          );
          return this;
        }
        Error() {
          this._attributes["level"] = logValue(
            "error"
            /* ERROR */
          );
          return this;
        }
        Info() {
          this._attributes["level"] = logValue(
            "info"
            /* INFO */
          );
          return this;
        }
        Err(err) {
          var _a;
          if (Result.Is(err)) {
            if (err.isOk()) {
              this.Result("noerror", err);
            } else {
              this.Result("error", err);
            }
          } else if (err instanceof Error) {
            this._attributes["error"] = logValue(err.message);
            if (this._levelHandler.isStackExposed) {
              this._attributes["stack"] = logValue((_a = err.stack) == null ? void 0 : _a.split("\n").map((s) => s.trim()));
            }
          } else {
            this._attributes["error"] = logValue("" + err);
          }
          return this;
        }
        WithLevel(l) {
          this._attributes["level"] = logValue(l);
          return this;
        }
        Ref(key, action) {
          if (typeof action === "function") {
            this._attributes[key] = logValue(action);
          } else if (typeof action.toString === "function") {
            this._attributes[key] = logValue(() => action.toString());
          } else {
            this._attributes[key] = logValue("INVALID REF");
          }
          return this;
        }
        Bool(key, value) {
          this._attributes[key] = logValue(!!value);
          return this;
        }
        Result(key, res) {
          if (res.isOk()) {
            this._attributes[key] = logValue(res.Ok());
          } else {
            this.Err(res.Err());
          }
          return this;
        }
        Len(value, key = "len") {
          this._attributes[key] = getLen(value);
          return this;
        }
        Hash(value, key = "hash") {
          this._attributes[key] = asyncLogValue(async () => `${getLen(value).value()}:${await hash(value)}`);
          return this;
        }
        Url(url, key = "url") {
          this.Ref(key, () => URI.from(url).toString());
          return this;
        }
        Str(key, value) {
          this._attributes[key] = logValue(value);
          return this;
        }
        Any(key, value) {
          this._attributes[key] = logValue(value);
          return this;
        }
        Dur(key, nsec) {
          this._attributes[key] = logValue(`${nsec}ms`);
          return this;
        }
        Uint64(key, value) {
          this._attributes[key] = logValue(value);
          return this;
        }
        Int(key, value) {
          return this.Uint64(key, value);
        }
        async Flush() {
          return new Promise((resolve7) => {
            this._logWriter._flush(void 0, resolve7);
          });
        }
        With() {
          return new WithLoggerBuilder(
            new _LoggerImpl({
              logWriter: this._logWriter,
              sys: this._sys,
              levelHandler: this._levelHandler,
              withAttributes: __spreadValues({
                module: this._attributes["module"]
              }, this._withAttributes)
            })
          );
        }
        _resetAttributes(fn) {
          const ret = fn();
          Object.keys(this._attributes).forEach((key) => {
            delete this._attributes[key];
          });
          Object.assign(this._attributes, this._withAttributes);
          return ret;
        }
        _produceError(attr, ...args) {
          attr["msg"] = logValue(args.join(" "));
          const msg = attr["msg"].value();
          if (typeof msg === "string" && !msg.trim().length) {
            delete attr["msg"];
          }
          return JSON.stringify(attr, removeSelfRef());
        }
        Msg(...args) {
          const fnError = this._resetAttributes(() => {
            var _a, _b;
            const doWrite = this._levelHandler.isEnabled(
              (_a = toLogValue(this._attributes["level"])) == null ? void 0 : _a.value(),
              (_b = toLogValue(this._attributes["module"])) == null ? void 0 : _b.value()
            );
            let fnRet = () => this._produceError(__spreadValues({}, this._attributes), ...args);
            if (doWrite) {
              const str = fnRet();
              const encoded = encoder.encode(str + "\n");
              this._logWriter.write(encoded);
              fnRet = () => str;
            }
            return fnRet;
          });
          return {
            AsError: () => new Error(fnError())
          };
        }
      };
      WithLoggerBuilder = class {
        constructor(li) {
          this._li = li;
        }
        Logger() {
          Object.assign(this._li._withAttributes, this._li._attributes);
          return this._li;
        }
        Attributes() {
          return __spreadValues({}, this._li._attributes);
        }
        SetExposeStack(enable) {
          this._li._levelHandler.setExposeStack(enable);
          return this;
        }
        EnableLevel(level, ...modules) {
          this._li._levelHandler.enableLevel(level, ...modules);
          return this;
        }
        DisableLevel(level, ...modules) {
          this._li._levelHandler.enableLevel(level, ...modules);
          return this;
        }
        Module(key) {
          this._li.Module(key);
          return this;
        }
        SetDebug(...modules) {
          this._li.SetDebug(...modules);
          return this;
        }
        Str(key, value) {
          this._li.Str(key, value);
          return this;
        }
        Len(value, key) {
          this._li.Len(value, key);
          return this;
        }
        Hash(value, key) {
          this._li.Hash(value, key);
          return this;
        }
        Ref(key, action) {
          this._li.Ref(key, action);
          return this;
        }
        Bool(key, value) {
          this._li.Bool(key, value);
          return this;
        }
        Result(key, res) {
          this._li.Result(key, res);
          return this;
        }
        Url(url, key) {
          this._li.Url(url, key);
          return this;
        }
        Int(key, value) {
          this._li.Int(key, value);
          return this;
        }
        Log() {
          this._li.Log();
          return this;
        }
        WithLevel(level) {
          this._li.WithLevel(level);
          return this;
        }
        Error() {
          this._li.Error();
          return this;
        }
        Warn() {
          this._li.Error();
          return this;
        }
        Debug() {
          this._li.Debug();
          return this;
        }
        Err(err) {
          this._li.Err(err);
          return this;
        }
        Info() {
          this._li.Info();
          return this;
        }
        Timestamp() {
          this._li.Timestamp();
          return this;
        }
        Any(key, value) {
          this._li.Any(key, value);
          return this;
        }
        Dur(key, nsec) {
          this._li.Dur(key, nsec);
          return this;
        }
        Uint64(key, value) {
          this._li.Uint64(key, value);
          return this;
        }
      };
    }
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bytes.js
  var bytes_exports = {};
  __export(bytes_exports, {
    coerce: () => coerce,
    empty: () => empty,
    equals: () => equals,
    fromHex: () => fromHex,
    fromString: () => fromString,
    isBinary: () => isBinary,
    toHex: () => toHex,
    toString: () => toString
  });
  function toHex(d) {
    return d.reduce((hex, byte) => hex + byte.toString(16).padStart(2, "0"), "");
  }
  function fromHex(hex) {
    const hexes = hex.match(/../g);
    return hexes != null ? new Uint8Array(hexes.map((b) => parseInt(b, 16))) : empty;
  }
  function equals(aa, bb) {
    if (aa === bb)
      return true;
    if (aa.byteLength !== bb.byteLength) {
      return false;
    }
    for (let ii = 0; ii < aa.byteLength; ii++) {
      if (aa[ii] !== bb[ii]) {
        return false;
      }
    }
    return true;
  }
  function coerce(o) {
    if (o instanceof Uint8Array && o.constructor.name === "Uint8Array")
      return o;
    if (o instanceof ArrayBuffer)
      return new Uint8Array(o);
    if (ArrayBuffer.isView(o)) {
      return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
    }
    throw new Error("Unknown type, must be binary type");
  }
  function isBinary(o) {
    return o instanceof ArrayBuffer || ArrayBuffer.isView(o);
  }
  function fromString(str) {
    return new TextEncoder().encode(str);
  }
  function toString(b) {
    return new TextDecoder().decode(b);
  }
  var empty;
  var init_bytes = __esm({
    "node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bytes.js"() {
      "use strict";
      empty = new Uint8Array(0);
    }
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/vendor/base-x.js
  function base(ALPHABET, name7) {
    if (ALPHABET.length >= 255) {
      throw new TypeError("Alphabet too long");
    }
    var BASE_MAP = new Uint8Array(256);
    for (var j = 0; j < BASE_MAP.length; j++) {
      BASE_MAP[j] = 255;
    }
    for (var i = 0; i < ALPHABET.length; i++) {
      var x = ALPHABET.charAt(i);
      var xc = x.charCodeAt(0);
      if (BASE_MAP[xc] !== 255) {
        throw new TypeError(x + " is ambiguous");
      }
      BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256);
    var iFACTOR = Math.log(256) / Math.log(BASE);
    function encode18(source) {
      if (source instanceof Uint8Array)
        ;
      else if (ArrayBuffer.isView(source)) {
        source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
      } else if (Array.isArray(source)) {
        source = Uint8Array.from(source);
      }
      if (!(source instanceof Uint8Array)) {
        throw new TypeError("Expected Uint8Array");
      }
      if (source.length === 0) {
        return "";
      }
      var zeroes = 0;
      var length4 = 0;
      var pbegin = 0;
      var pend = source.length;
      while (pbegin !== pend && source[pbegin] === 0) {
        pbegin++;
        zeroes++;
      }
      var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
      var b58 = new Uint8Array(size);
      while (pbegin !== pend) {
        var carry = source[pbegin];
        var i2 = 0;
        for (var it1 = size - 1; (carry !== 0 || i2 < length4) && it1 !== -1; it1--, i2++) {
          carry += 256 * b58[it1] >>> 0;
          b58[it1] = carry % BASE >>> 0;
          carry = carry / BASE >>> 0;
        }
        if (carry !== 0) {
          throw new Error("Non-zero carry");
        }
        length4 = i2;
        pbegin++;
      }
      var it2 = size - length4;
      while (it2 !== size && b58[it2] === 0) {
        it2++;
      }
      var str = LEADER.repeat(zeroes);
      for (; it2 < size; ++it2) {
        str += ALPHABET.charAt(b58[it2]);
      }
      return str;
    }
    function decodeUnsafe(source) {
      if (typeof source !== "string") {
        throw new TypeError("Expected String");
      }
      if (source.length === 0) {
        return new Uint8Array();
      }
      var psz = 0;
      if (source[psz] === " ") {
        return;
      }
      var zeroes = 0;
      var length4 = 0;
      while (source[psz] === LEADER) {
        zeroes++;
        psz++;
      }
      var size = (source.length - psz) * FACTOR + 1 >>> 0;
      var b256 = new Uint8Array(size);
      while (source[psz]) {
        var carry = BASE_MAP[source.charCodeAt(psz)];
        if (carry === 255) {
          return;
        }
        var i2 = 0;
        for (var it3 = size - 1; (carry !== 0 || i2 < length4) && it3 !== -1; it3--, i2++) {
          carry += BASE * b256[it3] >>> 0;
          b256[it3] = carry % 256 >>> 0;
          carry = carry / 256 >>> 0;
        }
        if (carry !== 0) {
          throw new Error("Non-zero carry");
        }
        length4 = i2;
        psz++;
      }
      if (source[psz] === " ") {
        return;
      }
      var it4 = size - length4;
      while (it4 !== size && b256[it4] === 0) {
        it4++;
      }
      var vch = new Uint8Array(zeroes + (size - it4));
      var j2 = zeroes;
      while (it4 !== size) {
        vch[j2++] = b256[it4++];
      }
      return vch;
    }
    function decode21(string3) {
      var buffer2 = decodeUnsafe(string3);
      if (buffer2) {
        return buffer2;
      }
      throw new Error(`Non-${name7} character`);
    }
    return {
      encode: encode18,
      decodeUnsafe,
      decode: decode21
    };
  }
  var src, _brrp__multiformats_scope_baseX, base_x_default;
  var init_base_x = __esm({
    "node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/vendor/base-x.js"() {
      "use strict";
      src = base;
      _brrp__multiformats_scope_baseX = src;
      base_x_default = _brrp__multiformats_scope_baseX;
    }
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base.js
  function or(left, right) {
    return new ComposedDecoder({
      ...left.decoders ?? { [left.prefix]: left },
      ...right.decoders ?? { [right.prefix]: right }
    });
  }
  function from2({ name: name7, prefix, encode: encode18, decode: decode21 }) {
    return new Codec(name7, prefix, encode18, decode21);
  }
  function baseX({ name: name7, prefix, alphabet: alphabet3 }) {
    const { encode: encode18, decode: decode21 } = base_x_default(alphabet3, name7);
    return from2({
      prefix,
      name: name7,
      encode: encode18,
      decode: (text) => coerce(decode21(text))
    });
  }
  function decode(string3, alphabet3, bitsPerChar, name7) {
    const codes = {};
    for (let i = 0; i < alphabet3.length; ++i) {
      codes[alphabet3[i]] = i;
    }
    let end = string3.length;
    while (string3[end - 1] === "=") {
      --end;
    }
    const out = new Uint8Array(end * bitsPerChar / 8 | 0);
    let bits = 0;
    let buffer2 = 0;
    let written = 0;
    for (let i = 0; i < end; ++i) {
      const value = codes[string3[i]];
      if (value === void 0) {
        throw new SyntaxError(`Non-${name7} character`);
      }
      buffer2 = buffer2 << bitsPerChar | value;
      bits += bitsPerChar;
      if (bits >= 8) {
        bits -= 8;
        out[written++] = 255 & buffer2 >> bits;
      }
    }
    if (bits >= bitsPerChar || (255 & buffer2 << 8 - bits) !== 0) {
      throw new SyntaxError("Unexpected end of data");
    }
    return out;
  }
  function encode(data, alphabet3, bitsPerChar) {
    const pad = alphabet3[alphabet3.length - 1] === "=";
    const mask = (1 << bitsPerChar) - 1;
    let out = "";
    let bits = 0;
    let buffer2 = 0;
    for (let i = 0; i < data.length; ++i) {
      buffer2 = buffer2 << 8 | data[i];
      bits += 8;
      while (bits > bitsPerChar) {
        bits -= bitsPerChar;
        out += alphabet3[mask & buffer2 >> bits];
      }
    }
    if (bits !== 0) {
      out += alphabet3[mask & buffer2 << bitsPerChar - bits];
    }
    if (pad) {
      while ((out.length * bitsPerChar & 7) !== 0) {
        out += "=";
      }
    }
    return out;
  }
  function rfc4648({ name: name7, prefix, bitsPerChar, alphabet: alphabet3 }) {
    return from2({
      prefix,
      name: name7,
      encode(input) {
        return encode(input, alphabet3, bitsPerChar);
      },
      decode(input) {
        return decode(input, alphabet3, bitsPerChar, name7);
      }
    });
  }
  var Encoder, Decoder, ComposedDecoder, Codec;
  var init_base = __esm({
    "node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base.js"() {
      "use strict";
      init_bytes();
      init_base_x();
      Encoder = class {
        name;
        prefix;
        baseEncode;
        constructor(name7, prefix, baseEncode) {
          this.name = name7;
          this.prefix = prefix;
          this.baseEncode = baseEncode;
        }
        encode(bytes) {
          if (bytes instanceof Uint8Array) {
            return `${this.prefix}${this.baseEncode(bytes)}`;
          } else {
            throw Error("Unknown type, must be binary type");
          }
        }
      };
      Decoder = class {
        name;
        prefix;
        baseDecode;
        prefixCodePoint;
        constructor(name7, prefix, baseDecode) {
          this.name = name7;
          this.prefix = prefix;
          if (prefix.codePointAt(0) === void 0) {
            throw new Error("Invalid prefix character");
          }
          this.prefixCodePoint = prefix.codePointAt(0);
          this.baseDecode = baseDecode;
        }
        decode(text) {
          if (typeof text === "string") {
            if (text.codePointAt(0) !== this.prefixCodePoint) {
              throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            }
            return this.baseDecode(text.slice(this.prefix.length));
          } else {
            throw Error("Can only multibase decode strings");
          }
        }
        or(decoder2) {
          return or(this, decoder2);
        }
      };
      ComposedDecoder = class {
        decoders;
        constructor(decoders) {
          this.decoders = decoders;
        }
        or(decoder2) {
          return or(this, decoder2);
        }
        decode(input) {
          const prefix = input[0];
          const decoder2 = this.decoders[prefix];
          if (decoder2 != null) {
            return decoder2.decode(input);
          } else {
            throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
          }
        }
      };
      Codec = class {
        name;
        prefix;
        baseEncode;
        baseDecode;
        encoder;
        decoder;
        constructor(name7, prefix, baseEncode, baseDecode) {
          this.name = name7;
          this.prefix = prefix;
          this.baseEncode = baseEncode;
          this.baseDecode = baseDecode;
          this.encoder = new Encoder(name7, prefix, baseEncode);
          this.decoder = new Decoder(name7, prefix, baseDecode);
        }
        encode(input) {
          return this.encoder.encode(input);
        }
        decode(input) {
          return this.decoder.decode(input);
        }
      };
    }
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base58.js
  var base58_exports = {};
  __export(base58_exports, {
    base58btc: () => base58btc,
    base58flickr: () => base58flickr
  });
  var base58btc, base58flickr;
  var init_base58 = __esm({
    "node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base58.js"() {
      "use strict";
      init_base();
      base58btc = baseX({
        name: "base58btc",
        prefix: "z",
        alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
      });
      base58flickr = baseX({
        name: "base58flickr",
        prefix: "Z",
        alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
      });
    }
  });

  // node_modules/.pnpm/@protobufjs+aspromise@1.1.2/node_modules/@protobufjs/aspromise/index.js
  var require_aspromise = __commonJS({
    "node_modules/.pnpm/@protobufjs+aspromise@1.1.2/node_modules/@protobufjs/aspromise/index.js"(exports2, module2) {
      "use strict";
      module2.exports = asPromise;
      function asPromise(fn, ctx) {
        var params = new Array(arguments.length - 1), offset = 0, index2 = 2, pending = true;
        while (index2 < arguments.length)
          params[offset++] = arguments[index2++];
        return new Promise(function executor(resolve7, reject) {
          params[offset] = function callback(err) {
            if (pending) {
              pending = false;
              if (err)
                reject(err);
              else {
                var params2 = new Array(arguments.length - 1), offset2 = 0;
                while (offset2 < params2.length)
                  params2[offset2++] = arguments[offset2];
                resolve7.apply(null, params2);
              }
            }
          };
          try {
            fn.apply(ctx || null, params);
          } catch (err) {
            if (pending) {
              pending = false;
              reject(err);
            }
          }
        });
      }
    }
  });

  // node_modules/.pnpm/@protobufjs+base64@1.1.2/node_modules/@protobufjs/base64/index.js
  var require_base64 = __commonJS({
    "node_modules/.pnpm/@protobufjs+base64@1.1.2/node_modules/@protobufjs/base64/index.js"(exports2) {
      "use strict";
      var base643 = exports2;
      base643.length = function length4(string3) {
        var p = string3.length;
        if (!p)
          return 0;
        var n = 0;
        while (--p % 4 > 1 && string3.charAt(p) === "=")
          ++n;
        return Math.ceil(string3.length * 3) / 4 - n;
      };
      var b64 = new Array(64);
      var s64 = new Array(123);
      for (i = 0; i < 64; )
        s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
      var i;
      base643.encode = function encode18(buffer2, start, end) {
        var parts = null, chunk = [];
        var i2 = 0, j = 0, t;
        while (start < end) {
          var b = buffer2[start++];
          switch (j) {
            case 0:
              chunk[i2++] = b64[b >> 2];
              t = (b & 3) << 4;
              j = 1;
              break;
            case 1:
              chunk[i2++] = b64[t | b >> 4];
              t = (b & 15) << 2;
              j = 2;
              break;
            case 2:
              chunk[i2++] = b64[t | b >> 6];
              chunk[i2++] = b64[b & 63];
              j = 0;
              break;
          }
          if (i2 > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i2 = 0;
          }
        }
        if (j) {
          chunk[i2++] = b64[t];
          chunk[i2++] = 61;
          if (j === 1)
            chunk[i2++] = 61;
        }
        if (parts) {
          if (i2)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
          return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i2));
      };
      var invalidEncoding = "invalid encoding";
      base643.decode = function decode21(string3, buffer2, offset) {
        var start = offset;
        var j = 0, t;
        for (var i2 = 0; i2 < string3.length; ) {
          var c = string3.charCodeAt(i2++);
          if (c === 61 && j > 1)
            break;
          if ((c = s64[c]) === void 0)
            throw Error(invalidEncoding);
          switch (j) {
            case 0:
              t = c;
              j = 1;
              break;
            case 1:
              buffer2[offset++] = t << 2 | (c & 48) >> 4;
              t = c;
              j = 2;
              break;
            case 2:
              buffer2[offset++] = (t & 15) << 4 | (c & 60) >> 2;
              t = c;
              j = 3;
              break;
            case 3:
              buffer2[offset++] = (t & 3) << 6 | c;
              j = 0;
              break;
          }
        }
        if (j === 1)
          throw Error(invalidEncoding);
        return offset - start;
      };
      base643.test = function test(string3) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string3);
      };
    }
  });

  // node_modules/.pnpm/@protobufjs+eventemitter@1.1.0/node_modules/@protobufjs/eventemitter/index.js
  var require_eventemitter = __commonJS({
    "node_modules/.pnpm/@protobufjs+eventemitter@1.1.0/node_modules/@protobufjs/eventemitter/index.js"(exports2, module2) {
      "use strict";
      module2.exports = EventEmitter2;
      function EventEmitter2() {
        this._listeners = {};
      }
      EventEmitter2.prototype.on = function on(evt, fn, ctx) {
        (this._listeners[evt] || (this._listeners[evt] = [])).push({
          fn,
          ctx: ctx || this
        });
        return this;
      };
      EventEmitter2.prototype.off = function off(evt, fn) {
        if (evt === void 0)
          this._listeners = {};
        else {
          if (fn === void 0)
            this._listeners[evt] = [];
          else {
            var listeners = this._listeners[evt];
            for (var i = 0; i < listeners.length; )
              if (listeners[i].fn === fn)
                listeners.splice(i, 1);
              else
                ++i;
          }
        }
        return this;
      };
      EventEmitter2.prototype.emit = function emit(evt) {
        var listeners = this._listeners[evt];
        if (listeners) {
          var args = [], i = 1;
          for (; i < arguments.length; )
            args.push(arguments[i++]);
          for (i = 0; i < listeners.length; )
            listeners[i].fn.apply(listeners[i++].ctx, args);
        }
        return this;
      };
    }
  });

  // node_modules/.pnpm/@protobufjs+float@1.0.2/node_modules/@protobufjs/float/index.js
  var require_float = __commonJS({
    "node_modules/.pnpm/@protobufjs+float@1.0.2/node_modules/@protobufjs/float/index.js"(exports2, module2) {
      "use strict";
      module2.exports = factory(factory);
      function factory(exports3) {
        if (typeof Float32Array !== "undefined") (function() {
          var f322 = new Float32Array([-0]), f8b2 = new Uint8Array(f322.buffer), le = f8b2[3] === 128;
          function writeFloat_f32_cpy(val, buf2, pos) {
            f322[0] = val;
            buf2[pos] = f8b2[0];
            buf2[pos + 1] = f8b2[1];
            buf2[pos + 2] = f8b2[2];
            buf2[pos + 3] = f8b2[3];
          }
          function writeFloat_f32_rev(val, buf2, pos) {
            f322[0] = val;
            buf2[pos] = f8b2[3];
            buf2[pos + 1] = f8b2[2];
            buf2[pos + 2] = f8b2[1];
            buf2[pos + 3] = f8b2[0];
          }
          exports3.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
          exports3.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
          function readFloat_f32_cpy(buf2, pos) {
            f8b2[0] = buf2[pos];
            f8b2[1] = buf2[pos + 1];
            f8b2[2] = buf2[pos + 2];
            f8b2[3] = buf2[pos + 3];
            return f322[0];
          }
          function readFloat_f32_rev(buf2, pos) {
            f8b2[3] = buf2[pos];
            f8b2[2] = buf2[pos + 1];
            f8b2[1] = buf2[pos + 2];
            f8b2[0] = buf2[pos + 3];
            return f322[0];
          }
          exports3.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
          exports3.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
        })();
        else (function() {
          function writeFloat_ieee754(writeUint, val, buf2, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0)
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf2, pos);
            else if (isNaN(val))
              writeUint(2143289344, buf2, pos);
            else if (val > 34028234663852886e22)
              writeUint((sign << 31 | 2139095040) >>> 0, buf2, pos);
            else if (val < 11754943508222875e-54)
              writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf2, pos);
            else {
              var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
              writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf2, pos);
            }
          }
          exports3.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
          exports3.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
          function readFloat_ieee754(readUint, buf2, pos) {
            var uint = readUint(buf2, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
            return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
          }
          exports3.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
          exports3.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
        })();
        if (typeof Float64Array !== "undefined") (function() {
          var f642 = new Float64Array([-0]), f8b2 = new Uint8Array(f642.buffer), le = f8b2[7] === 128;
          function writeDouble_f64_cpy(val, buf2, pos) {
            f642[0] = val;
            buf2[pos] = f8b2[0];
            buf2[pos + 1] = f8b2[1];
            buf2[pos + 2] = f8b2[2];
            buf2[pos + 3] = f8b2[3];
            buf2[pos + 4] = f8b2[4];
            buf2[pos + 5] = f8b2[5];
            buf2[pos + 6] = f8b2[6];
            buf2[pos + 7] = f8b2[7];
          }
          function writeDouble_f64_rev(val, buf2, pos) {
            f642[0] = val;
            buf2[pos] = f8b2[7];
            buf2[pos + 1] = f8b2[6];
            buf2[pos + 2] = f8b2[5];
            buf2[pos + 3] = f8b2[4];
            buf2[pos + 4] = f8b2[3];
            buf2[pos + 5] = f8b2[2];
            buf2[pos + 6] = f8b2[1];
            buf2[pos + 7] = f8b2[0];
          }
          exports3.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
          exports3.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
          function readDouble_f64_cpy(buf2, pos) {
            f8b2[0] = buf2[pos];
            f8b2[1] = buf2[pos + 1];
            f8b2[2] = buf2[pos + 2];
            f8b2[3] = buf2[pos + 3];
            f8b2[4] = buf2[pos + 4];
            f8b2[5] = buf2[pos + 5];
            f8b2[6] = buf2[pos + 6];
            f8b2[7] = buf2[pos + 7];
            return f642[0];
          }
          function readDouble_f64_rev(buf2, pos) {
            f8b2[7] = buf2[pos];
            f8b2[6] = buf2[pos + 1];
            f8b2[5] = buf2[pos + 2];
            f8b2[4] = buf2[pos + 3];
            f8b2[3] = buf2[pos + 4];
            f8b2[2] = buf2[pos + 5];
            f8b2[1] = buf2[pos + 6];
            f8b2[0] = buf2[pos + 7];
            return f642[0];
          }
          exports3.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
          exports3.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
        })();
        else (function() {
          function writeDouble_ieee754(writeUint, off0, off1, val, buf2, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0) {
              writeUint(0, buf2, pos + off0);
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf2, pos + off1);
            } else if (isNaN(val)) {
              writeUint(0, buf2, pos + off0);
              writeUint(2146959360, buf2, pos + off1);
            } else if (val > 17976931348623157e292) {
              writeUint(0, buf2, pos + off0);
              writeUint((sign << 31 | 2146435072) >>> 0, buf2, pos + off1);
            } else {
              var mantissa;
              if (val < 22250738585072014e-324) {
                mantissa = val / 5e-324;
                writeUint(mantissa >>> 0, buf2, pos + off0);
                writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf2, pos + off1);
              } else {
                var exponent = Math.floor(Math.log(val) / Math.LN2);
                if (exponent === 1024)
                  exponent = 1023;
                mantissa = val * Math.pow(2, -exponent);
                writeUint(mantissa * 4503599627370496 >>> 0, buf2, pos + off0);
                writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf2, pos + off1);
              }
            }
          }
          exports3.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
          exports3.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
          function readDouble_ieee754(readUint, off0, off1, buf2, pos) {
            var lo = readUint(buf2, pos + off0), hi = readUint(buf2, pos + off1);
            var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
          }
          exports3.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
          exports3.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
        })();
        return exports3;
      }
      function writeUintLE(val, buf2, pos) {
        buf2[pos] = val & 255;
        buf2[pos + 1] = val >>> 8 & 255;
        buf2[pos + 2] = val >>> 16 & 255;
        buf2[pos + 3] = val >>> 24;
      }
      function writeUintBE(val, buf2, pos) {
        buf2[pos] = val >>> 24;
        buf2[pos + 1] = val >>> 16 & 255;
        buf2[pos + 2] = val >>> 8 & 255;
        buf2[pos + 3] = val & 255;
      }
      function readUintLE(buf2, pos) {
        return (buf2[pos] | buf2[pos + 1] << 8 | buf2[pos + 2] << 16 | buf2[pos + 3] << 24) >>> 0;
      }
      function readUintBE(buf2, pos) {
        return (buf2[pos] << 24 | buf2[pos + 1] << 16 | buf2[pos + 2] << 8 | buf2[pos + 3]) >>> 0;
      }
    }
  });

  // node_modules/.pnpm/@protobufjs+inquire@1.1.0/node_modules/@protobufjs/inquire/index.js
  var require_inquire = __commonJS({
    "node_modules/.pnpm/@protobufjs+inquire@1.1.0/node_modules/@protobufjs/inquire/index.js"(exports, module) {
      "use strict";
      module.exports = inquire;
      function inquire(moduleName) {
        try {
          var mod = eval("quire".replace(/^/, "re"))(moduleName);
          if (mod && (mod.length || Object.keys(mod).length))
            return mod;
        } catch (e) {
        }
        return null;
      }
    }
  });

  // node_modules/.pnpm/@protobufjs+utf8@1.1.0/node_modules/@protobufjs/utf8/index.js
  var require_utf8 = __commonJS({
    "node_modules/.pnpm/@protobufjs+utf8@1.1.0/node_modules/@protobufjs/utf8/index.js"(exports2) {
      "use strict";
      var utf84 = exports2;
      utf84.length = function utf8_length(string3) {
        var len = 0, c = 0;
        for (var i = 0; i < string3.length; ++i) {
          c = string3.charCodeAt(i);
          if (c < 128)
            len += 1;
          else if (c < 2048)
            len += 2;
          else if ((c & 64512) === 55296 && (string3.charCodeAt(i + 1) & 64512) === 56320) {
            ++i;
            len += 4;
          } else
            len += 3;
        }
        return len;
      };
      utf84.read = function utf8_read(buffer2, start, end) {
        var len = end - start;
        if (len < 1)
          return "";
        var parts = null, chunk = [], i = 0, t;
        while (start < end) {
          t = buffer2[start++];
          if (t < 128)
            chunk[i++] = t;
          else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer2[start++] & 63;
          else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer2[start++] & 63) << 12 | (buffer2[start++] & 63) << 6 | buffer2[start++] & 63) - 65536;
            chunk[i++] = 55296 + (t >> 10);
            chunk[i++] = 56320 + (t & 1023);
          } else
            chunk[i++] = (t & 15) << 12 | (buffer2[start++] & 63) << 6 | buffer2[start++] & 63;
          if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
          }
        }
        if (parts) {
          if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
          return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i));
      };
      utf84.write = function utf8_write(string3, buffer2, offset) {
        var start = offset, c1, c2;
        for (var i = 0; i < string3.length; ++i) {
          c1 = string3.charCodeAt(i);
          if (c1 < 128) {
            buffer2[offset++] = c1;
          } else if (c1 < 2048) {
            buffer2[offset++] = c1 >> 6 | 192;
            buffer2[offset++] = c1 & 63 | 128;
          } else if ((c1 & 64512) === 55296 && ((c2 = string3.charCodeAt(i + 1)) & 64512) === 56320) {
            c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
            ++i;
            buffer2[offset++] = c1 >> 18 | 240;
            buffer2[offset++] = c1 >> 12 & 63 | 128;
            buffer2[offset++] = c1 >> 6 & 63 | 128;
            buffer2[offset++] = c1 & 63 | 128;
          } else {
            buffer2[offset++] = c1 >> 12 | 224;
            buffer2[offset++] = c1 >> 6 & 63 | 128;
            buffer2[offset++] = c1 & 63 | 128;
          }
        }
        return offset - start;
      };
    }
  });

  // node_modules/.pnpm/@protobufjs+pool@1.1.0/node_modules/@protobufjs/pool/index.js
  var require_pool = __commonJS({
    "node_modules/.pnpm/@protobufjs+pool@1.1.0/node_modules/@protobufjs/pool/index.js"(exports2, module2) {
      "use strict";
      module2.exports = pool2;
      function pool2(alloc3, slice3, size) {
        var SIZE = size || 8192;
        var MAX = SIZE >>> 1;
        var slab = null;
        var offset = SIZE;
        return function pool_alloc(size2) {
          if (size2 < 1 || size2 > MAX)
            return alloc3(size2);
          if (offset + size2 > SIZE) {
            slab = alloc3(SIZE);
            offset = 0;
          }
          var buf2 = slice3.call(slab, offset, offset += size2);
          if (offset & 7)
            offset = (offset | 7) + 1;
          return buf2;
        };
      }
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/util/longbits.js
  var require_longbits = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/util/longbits.js"(exports2, module2) {
      "use strict";
      module2.exports = LongBits2;
      var util = require_minimal();
      function LongBits2(lo, hi) {
        this.lo = lo >>> 0;
        this.hi = hi >>> 0;
      }
      var zero2 = LongBits2.zero = new LongBits2(0, 0);
      zero2.toNumber = function() {
        return 0;
      };
      zero2.zzEncode = zero2.zzDecode = function() {
        return this;
      };
      zero2.length = function() {
        return 1;
      };
      var zeroHash = LongBits2.zeroHash = "\0\0\0\0\0\0\0\0";
      LongBits2.fromNumber = function fromNumber(value) {
        if (value === 0)
          return zero2;
        var sign = value < 0;
        if (sign)
          value = -value;
        var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
        if (sign) {
          hi = ~hi >>> 0;
          lo = ~lo >>> 0;
          if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
              hi = 0;
          }
        }
        return new LongBits2(lo, hi);
      };
      LongBits2.from = function from8(value) {
        if (typeof value === "number")
          return LongBits2.fromNumber(value);
        if (util.isString(value)) {
          if (util.Long)
            value = util.Long.fromString(value);
          else
            return LongBits2.fromNumber(parseInt(value, 10));
        }
        return value.low || value.high ? new LongBits2(value.low >>> 0, value.high >>> 0) : zero2;
      };
      LongBits2.prototype.toNumber = function toNumber(unsigned) {
        if (!unsigned && this.hi >>> 31) {
          var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
          if (!lo)
            hi = hi + 1 >>> 0;
          return -(lo + hi * 4294967296);
        }
        return this.lo + this.hi * 4294967296;
      };
      LongBits2.prototype.toLong = function toLong(unsigned) {
        return util.Long ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
      };
      var charCodeAt = String.prototype.charCodeAt;
      LongBits2.fromHash = function fromHash(hash2) {
        if (hash2 === zeroHash)
          return zero2;
        return new LongBits2(
          (charCodeAt.call(hash2, 0) | charCodeAt.call(hash2, 1) << 8 | charCodeAt.call(hash2, 2) << 16 | charCodeAt.call(hash2, 3) << 24) >>> 0,
          (charCodeAt.call(hash2, 4) | charCodeAt.call(hash2, 5) << 8 | charCodeAt.call(hash2, 6) << 16 | charCodeAt.call(hash2, 7) << 24) >>> 0
        );
      };
      LongBits2.prototype.toHash = function toHash() {
        return String.fromCharCode(
          this.lo & 255,
          this.lo >>> 8 & 255,
          this.lo >>> 16 & 255,
          this.lo >>> 24,
          this.hi & 255,
          this.hi >>> 8 & 255,
          this.hi >>> 16 & 255,
          this.hi >>> 24
        );
      };
      LongBits2.prototype.zzEncode = function zzEncode() {
        var mask = this.hi >> 31;
        this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
        this.lo = (this.lo << 1 ^ mask) >>> 0;
        return this;
      };
      LongBits2.prototype.zzDecode = function zzDecode() {
        var mask = -(this.lo & 1);
        this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
        this.hi = (this.hi >>> 1 ^ mask) >>> 0;
        return this;
      };
      LongBits2.prototype.length = function length4() {
        var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
        return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
      };
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/util/minimal.js
  var require_minimal = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/util/minimal.js"(exports2) {
      "use strict";
      var util = exports2;
      util.asPromise = require_aspromise();
      util.base64 = require_base64();
      util.EventEmitter = require_eventemitter();
      util.float = require_float();
      util.inquire = require_inquire();
      util.utf8 = require_utf8();
      util.pool = require_pool();
      util.LongBits = require_longbits();
      util.isNode = Boolean(typeof global !== "undefined" && global && global.process && global.process.versions && global.process.versions.node);
      util.global = util.isNode && global || typeof window !== "undefined" && window || typeof self !== "undefined" && self || exports2;
      util.emptyArray = Object.freeze ? Object.freeze([]) : (
        /* istanbul ignore next */
        []
      );
      util.emptyObject = Object.freeze ? Object.freeze({}) : (
        /* istanbul ignore next */
        {}
      );
      util.isInteger = Number.isInteger || /* istanbul ignore next */
      function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
      };
      util.isString = function isString(value) {
        return typeof value === "string" || value instanceof String;
      };
      util.isObject = function isObject(value) {
        return value && typeof value === "object";
      };
      util.isset = /**
       * Checks if a property on a message is considered to be present.
       * @param {Object} obj Plain object or message instance
       * @param {string} prop Property name
       * @returns {boolean} `true` if considered to be present, otherwise `false`
       */
      util.isSet = function isSet2(obj, prop) {
        var value = obj[prop];
        if (value != null && obj.hasOwnProperty(prop))
          return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
        return false;
      };
      util.Buffer = function() {
        try {
          var Buffer2 = util.inquire("buffer").Buffer;
          return Buffer2.prototype.utf8Write ? Buffer2 : (
            /* istanbul ignore next */
            null
          );
        } catch (e) {
          return null;
        }
      }();
      util._Buffer_from = null;
      util._Buffer_allocUnsafe = null;
      util.newBuffer = function newBuffer(sizeOrArray) {
        return typeof sizeOrArray === "number" ? util.Buffer ? util._Buffer_allocUnsafe(sizeOrArray) : new util.Array(sizeOrArray) : util.Buffer ? util._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
      };
      util.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      util.Long = /* istanbul ignore next */
      util.global.dcodeIO && /* istanbul ignore next */
      util.global.dcodeIO.Long || /* istanbul ignore next */
      util.global.Long || util.inquire("long");
      util.key2Re = /^true|false|0|1$/;
      util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
      util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
      util.longToHash = function longToHash(value) {
        return value ? util.LongBits.from(value).toHash() : util.LongBits.zeroHash;
      };
      util.longFromHash = function longFromHash(hash2, unsigned) {
        var bits = util.LongBits.fromHash(hash2);
        if (util.Long)
          return util.Long.fromBits(bits.lo, bits.hi, unsigned);
        return bits.toNumber(Boolean(unsigned));
      };
      function merge2(dst, src3, ifNotSet) {
        for (var keys = Object.keys(src3), i = 0; i < keys.length; ++i)
          if (dst[keys[i]] === void 0 || !ifNotSet)
            dst[keys[i]] = src3[keys[i]];
        return dst;
      }
      util.merge = merge2;
      util.lcFirst = function lcFirst(str) {
        return str.charAt(0).toLowerCase() + str.substring(1);
      };
      function newError(name7) {
        function CustomError(message2, properties) {
          if (!(this instanceof CustomError))
            return new CustomError(message2, properties);
          Object.defineProperty(this, "message", { get: function() {
            return message2;
          } });
          if (Error.captureStackTrace)
            Error.captureStackTrace(this, CustomError);
          else
            Object.defineProperty(this, "stack", { value: new Error().stack || "" });
          if (properties)
            merge2(this, properties);
        }
        CustomError.prototype = Object.create(Error.prototype, {
          constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true
          },
          name: {
            get: function get7() {
              return name7;
            },
            set: void 0,
            enumerable: false,
            // configurable: false would accurately preserve the behavior of
            // the original, but I'm guessing that was not intentional.
            // For an actual error subclass, this property would
            // be configurable.
            configurable: true
          },
          toString: {
            value: function value() {
              return this.name + ": " + this.message;
            },
            writable: true,
            enumerable: false,
            configurable: true
          }
        });
        return CustomError;
      }
      util.newError = newError;
      util.ProtocolError = newError("ProtocolError");
      util.oneOfGetter = function getOneOf(fieldNames) {
        var fieldMap = {};
        for (var i = 0; i < fieldNames.length; ++i)
          fieldMap[fieldNames[i]] = 1;
        return function() {
          for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
            if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
              return keys[i2];
        };
      };
      util.oneOfSetter = function setOneOf(fieldNames) {
        return function(name7) {
          for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name7)
              delete this[fieldNames[i]];
        };
      };
      util.toJSONOptions = {
        longs: String,
        enums: String,
        bytes: String,
        json: true
      };
      util._configure = function() {
        var Buffer2 = util.Buffer;
        if (!Buffer2) {
          util._Buffer_from = util._Buffer_allocUnsafe = null;
          return;
        }
        util._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || /* istanbul ignore next */
        function Buffer_from(value, encoding) {
          return new Buffer2(value, encoding);
        };
        util._Buffer_allocUnsafe = Buffer2.allocUnsafe || /* istanbul ignore next */
        function Buffer_allocUnsafe(size) {
          return new Buffer2(size);
        };
      };
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/writer.js
  var require_writer = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/writer.js"(exports2, module2) {
      "use strict";
      module2.exports = Writer;
      var util = require_minimal();
      var BufferWriter;
      var LongBits2 = util.LongBits;
      var base643 = util.base64;
      var utf84 = util.utf8;
      function Op2(fn, len, val) {
        this.fn = fn;
        this.len = len;
        this.next = void 0;
        this.val = val;
      }
      function noop2() {
      }
      function State2(writer) {
        this.head = writer.head;
        this.tail = writer.tail;
        this.len = writer.len;
        this.next = writer.states;
      }
      function Writer() {
        this.len = 0;
        this.head = new Op2(noop2, 0, 0);
        this.tail = this.head;
        this.states = null;
      }
      var create16 = function create17() {
        return util.Buffer ? function create_buffer_setup() {
          return (Writer.create = function create_buffer() {
            return new BufferWriter();
          })();
        } : function create_array() {
          return new Writer();
        };
      };
      Writer.create = create16();
      Writer.alloc = function alloc3(size) {
        return new util.Array(size);
      };
      if (util.Array !== Array)
        Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);
      Writer.prototype._push = function push2(fn, len, val) {
        this.tail = this.tail.next = new Op2(fn, len, val);
        this.len += len;
        return this;
      };
      function writeByte2(val, buf2, pos) {
        buf2[pos] = val & 255;
      }
      function writeVarint322(val, buf2, pos) {
        while (val > 127) {
          buf2[pos++] = val & 127 | 128;
          val >>>= 7;
        }
        buf2[pos] = val;
      }
      function VarintOp2(len, val) {
        this.len = len;
        this.next = void 0;
        this.val = val;
      }
      VarintOp2.prototype = Object.create(Op2.prototype);
      VarintOp2.prototype.fn = writeVarint322;
      Writer.prototype.uint32 = function write_uint32(value) {
        this.len += (this.tail = this.tail.next = new VarintOp2(
          (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
          value
        )).len;
        return this;
      };
      Writer.prototype.int32 = function write_int32(value) {
        return value < 0 ? this._push(writeVarint642, 10, LongBits2.fromNumber(value)) : this.uint32(value);
      };
      Writer.prototype.sint32 = function write_sint32(value) {
        return this.uint32((value << 1 ^ value >> 31) >>> 0);
      };
      function writeVarint642(val, buf2, pos) {
        while (val.hi) {
          buf2[pos++] = val.lo & 127 | 128;
          val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
          val.hi >>>= 7;
        }
        while (val.lo > 127) {
          buf2[pos++] = val.lo & 127 | 128;
          val.lo = val.lo >>> 7;
        }
        buf2[pos++] = val.lo;
      }
      Writer.prototype.uint64 = function write_uint64(value) {
        var bits = LongBits2.from(value);
        return this._push(writeVarint642, bits.length(), bits);
      };
      Writer.prototype.int64 = Writer.prototype.uint64;
      Writer.prototype.sint64 = function write_sint64(value) {
        var bits = LongBits2.from(value).zzEncode();
        return this._push(writeVarint642, bits.length(), bits);
      };
      Writer.prototype.bool = function write_bool(value) {
        return this._push(writeByte2, 1, value ? 1 : 0);
      };
      function writeFixed322(val, buf2, pos) {
        buf2[pos] = val & 255;
        buf2[pos + 1] = val >>> 8 & 255;
        buf2[pos + 2] = val >>> 16 & 255;
        buf2[pos + 3] = val >>> 24;
      }
      Writer.prototype.fixed32 = function write_fixed32(value) {
        return this._push(writeFixed322, 4, value >>> 0);
      };
      Writer.prototype.sfixed32 = Writer.prototype.fixed32;
      Writer.prototype.fixed64 = function write_fixed64(value) {
        var bits = LongBits2.from(value);
        return this._push(writeFixed322, 4, bits.lo)._push(writeFixed322, 4, bits.hi);
      };
      Writer.prototype.sfixed64 = Writer.prototype.fixed64;
      Writer.prototype.float = function write_float(value) {
        return this._push(util.float.writeFloatLE, 4, value);
      };
      Writer.prototype.double = function write_double(value) {
        return this._push(util.float.writeDoubleLE, 8, value);
      };
      var writeBytes3 = util.Array.prototype.set ? function writeBytes_set(val, buf2, pos) {
        buf2.set(val, pos);
      } : function writeBytes_for(val, buf2, pos) {
        for (var i = 0; i < val.length; ++i)
          buf2[pos + i] = val[i];
      };
      Writer.prototype.bytes = function write_bytes(value) {
        var len = value.length >>> 0;
        if (!len)
          return this._push(writeByte2, 1, 0);
        if (util.isString(value)) {
          var buf2 = Writer.alloc(len = base643.length(value));
          base643.decode(value, buf2, 0);
          value = buf2;
        }
        return this.uint32(len)._push(writeBytes3, len, value);
      };
      Writer.prototype.string = function write_string(value) {
        var len = utf84.length(value);
        return len ? this.uint32(len)._push(utf84.write, len, value) : this._push(writeByte2, 1, 0);
      };
      Writer.prototype.fork = function fork4() {
        this.states = new State2(this);
        this.head = this.tail = new Op2(noop2, 0, 0);
        this.len = 0;
        return this;
      };
      Writer.prototype.reset = function reset() {
        if (this.states) {
          this.head = this.states.head;
          this.tail = this.states.tail;
          this.len = this.states.len;
          this.states = this.states.next;
        } else {
          this.head = this.tail = new Op2(noop2, 0, 0);
          this.len = 0;
        }
        return this;
      };
      Writer.prototype.ldelim = function ldelim() {
        var head = this.head, tail = this.tail, len = this.len;
        this.reset().uint32(len);
        if (len) {
          this.tail.next = head.next;
          this.tail = tail;
          this.len += len;
        }
        return this;
      };
      Writer.prototype.finish = function finish() {
        var head = this.head.next, buf2 = this.constructor.alloc(this.len), pos = 0;
        while (head) {
          head.fn(head.val, buf2, pos);
          pos += head.len;
          head = head.next;
        }
        return buf2;
      };
      Writer._configure = function(BufferWriter_) {
        BufferWriter = BufferWriter_;
        Writer.create = create16();
        BufferWriter._configure();
      };
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/writer_buffer.js
  var require_writer_buffer = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/writer_buffer.js"(exports2, module2) {
      "use strict";
      module2.exports = BufferWriter;
      var Writer = require_writer();
      (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
      var util = require_minimal();
      function BufferWriter() {
        Writer.call(this);
      }
      BufferWriter._configure = function() {
        BufferWriter.alloc = util._Buffer_allocUnsafe;
        BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf2, pos) {
          buf2.set(val, pos);
        } : function writeBytesBuffer_copy(val, buf2, pos) {
          if (val.copy)
            val.copy(buf2, pos, 0, val.length);
          else for (var i = 0; i < val.length; )
            buf2[pos++] = val[i++];
        };
      };
      BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
        if (util.isString(value))
          value = util._Buffer_from(value, "base64");
        var len = value.length >>> 0;
        this.uint32(len);
        if (len)
          this._push(BufferWriter.writeBytesBuffer, len, value);
        return this;
      };
      function writeStringBuffer2(val, buf2, pos) {
        if (val.length < 40)
          util.utf8.write(val, buf2, pos);
        else if (buf2.utf8Write)
          buf2.utf8Write(val, pos);
        else
          buf2.write(val, pos);
      }
      BufferWriter.prototype.string = function write_string_buffer(value) {
        var len = util.Buffer.byteLength(value);
        this.uint32(len);
        if (len)
          this._push(writeStringBuffer2, len, value);
        return this;
      };
      BufferWriter._configure();
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/reader.js
  var require_reader = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/reader.js"(exports2, module2) {
      "use strict";
      module2.exports = Reader;
      var util = require_minimal();
      var BufferReader;
      var LongBits2 = util.LongBits;
      var utf84 = util.utf8;
      function indexOutOfRange2(reader, writeLength) {
        return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
      }
      function Reader(buffer2) {
        this.buf = buffer2;
        this.pos = 0;
        this.len = buffer2.length;
      }
      var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer2) {
        if (buffer2 instanceof Uint8Array || Array.isArray(buffer2))
          return new Reader(buffer2);
        throw Error("illegal buffer");
      } : function create_array2(buffer2) {
        if (Array.isArray(buffer2))
          return new Reader(buffer2);
        throw Error("illegal buffer");
      };
      var create16 = function create17() {
        return util.Buffer ? function create_buffer_setup(buffer2) {
          return (Reader.create = function create_buffer(buffer3) {
            return util.Buffer.isBuffer(buffer3) ? new BufferReader(buffer3) : create_array(buffer3);
          })(buffer2);
        } : create_array;
      };
      Reader.create = create16();
      Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */
      util.Array.prototype.slice;
      Reader.prototype.uint32 = /* @__PURE__ */ function read_uint32_setup() {
        var value = 4294967295;
        return function read_uint32() {
          value = (this.buf[this.pos] & 127) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange2(this, 10);
          }
          return value;
        };
      }();
      Reader.prototype.int32 = function read_int32() {
        return this.uint32() | 0;
      };
      Reader.prototype.sint32 = function read_sint32() {
        var value = this.uint32();
        return value >>> 1 ^ -(value & 1) | 0;
      };
      function readLongVarint() {
        var bits = new LongBits2(0, 0);
        var i = 0;
        if (this.len - this.pos > 4) {
          for (; i < 4; ++i) {
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
          i = 0;
        } else {
          for (; i < 3; ++i) {
            if (this.pos >= this.len)
              throw indexOutOfRange2(this);
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
          bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
          return bits;
        }
        if (this.len - this.pos > 4) {
          for (; i < 5; ++i) {
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
        } else {
          for (; i < 5; ++i) {
            if (this.pos >= this.len)
              throw indexOutOfRange2(this);
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
        }
        throw Error("invalid varint encoding");
      }
      Reader.prototype.bool = function read_bool() {
        return this.uint32() !== 0;
      };
      function readFixed32_end(buf2, end) {
        return (buf2[end - 4] | buf2[end - 3] << 8 | buf2[end - 2] << 16 | buf2[end - 1] << 24) >>> 0;
      }
      Reader.prototype.fixed32 = function read_fixed32() {
        if (this.pos + 4 > this.len)
          throw indexOutOfRange2(this, 4);
        return readFixed32_end(this.buf, this.pos += 4);
      };
      Reader.prototype.sfixed32 = function read_sfixed32() {
        if (this.pos + 4 > this.len)
          throw indexOutOfRange2(this, 4);
        return readFixed32_end(this.buf, this.pos += 4) | 0;
      };
      function readFixed64() {
        if (this.pos + 8 > this.len)
          throw indexOutOfRange2(this, 8);
        return new LongBits2(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
      }
      Reader.prototype.float = function read_float() {
        if (this.pos + 4 > this.len)
          throw indexOutOfRange2(this, 4);
        var value = util.float.readFloatLE(this.buf, this.pos);
        this.pos += 4;
        return value;
      };
      Reader.prototype.double = function read_double() {
        if (this.pos + 8 > this.len)
          throw indexOutOfRange2(this, 4);
        var value = util.float.readDoubleLE(this.buf, this.pos);
        this.pos += 8;
        return value;
      };
      Reader.prototype.bytes = function read_bytes() {
        var length4 = this.uint32(), start = this.pos, end = this.pos + length4;
        if (end > this.len)
          throw indexOutOfRange2(this, length4);
        this.pos += length4;
        if (Array.isArray(this.buf))
          return this.buf.slice(start, end);
        if (start === end) {
          var nativeBuffer = util.Buffer;
          return nativeBuffer ? nativeBuffer.alloc(0) : new this.buf.constructor(0);
        }
        return this._slice.call(this.buf, start, end);
      };
      Reader.prototype.string = function read_string() {
        var bytes = this.bytes();
        return utf84.read(bytes, 0, bytes.length);
      };
      Reader.prototype.skip = function skip(length4) {
        if (typeof length4 === "number") {
          if (this.pos + length4 > this.len)
            throw indexOutOfRange2(this, length4);
          this.pos += length4;
        } else {
          do {
            if (this.pos >= this.len)
              throw indexOutOfRange2(this);
          } while (this.buf[this.pos++] & 128);
        }
        return this;
      };
      Reader.prototype.skipType = function(wireType) {
        switch (wireType) {
          case 0:
            this.skip();
            break;
          case 1:
            this.skip(8);
            break;
          case 2:
            this.skip(this.uint32());
            break;
          case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
              this.skipType(wireType);
            }
            break;
          case 5:
            this.skip(4);
            break;
          /* istanbul ignore next */
          default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
        }
        return this;
      };
      Reader._configure = function(BufferReader_) {
        BufferReader = BufferReader_;
        Reader.create = create16();
        BufferReader._configure();
        var fn = util.Long ? "toLong" : (
          /* istanbul ignore next */
          "toNumber"
        );
        util.merge(Reader.prototype, {
          int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
          },
          uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
          },
          sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
          },
          fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
          },
          sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
          }
        });
      };
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/reader_buffer.js
  var require_reader_buffer = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/reader_buffer.js"(exports2, module2) {
      "use strict";
      module2.exports = BufferReader;
      var Reader = require_reader();
      (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
      var util = require_minimal();
      function BufferReader(buffer2) {
        Reader.call(this, buffer2);
      }
      BufferReader._configure = function() {
        if (util.Buffer)
          BufferReader.prototype._slice = util.Buffer.prototype.slice;
      };
      BufferReader.prototype.string = function read_string_buffer() {
        var len = this.uint32();
        return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
      };
      BufferReader._configure();
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/rpc/service.js
  var require_service = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/rpc/service.js"(exports2, module2) {
      "use strict";
      module2.exports = Service;
      var util = require_minimal();
      (Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;
      function Service(rpcImpl, requestDelimited, responseDelimited) {
        if (typeof rpcImpl !== "function")
          throw TypeError("rpcImpl must be a function");
        util.EventEmitter.call(this);
        this.rpcImpl = rpcImpl;
        this.requestDelimited = Boolean(requestDelimited);
        this.responseDelimited = Boolean(responseDelimited);
      }
      Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {
        if (!request)
          throw TypeError("request must be specified");
        var self2 = this;
        if (!callback)
          return util.asPromise(rpcCall, self2, method, requestCtor, responseCtor, request);
        if (!self2.rpcImpl) {
          setTimeout(function() {
            callback(Error("already ended"));
          }, 0);
          return void 0;
        }
        try {
          return self2.rpcImpl(
            method,
            requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {
              if (err) {
                self2.emit("error", err, method);
                return callback(err);
              }
              if (response === null) {
                self2.end(
                  /* endedByRPC */
                  true
                );
                return void 0;
              }
              if (!(response instanceof responseCtor)) {
                try {
                  response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
                } catch (err2) {
                  self2.emit("error", err2, method);
                  return callback(err2);
                }
              }
              self2.emit("data", response, method);
              return callback(null, response);
            }
          );
        } catch (err) {
          self2.emit("error", err, method);
          setTimeout(function() {
            callback(err);
          }, 0);
          return void 0;
        }
      };
      Service.prototype.end = function end(endedByRPC) {
        if (this.rpcImpl) {
          if (!endedByRPC)
            this.rpcImpl(null, null, null);
          this.rpcImpl = null;
          this.emit("end").off();
        }
        return this;
      };
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/rpc.js
  var require_rpc = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/rpc.js"(exports2) {
      "use strict";
      var rpc = exports2;
      rpc.Service = require_service();
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/roots.js
  var require_roots = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/roots.js"(exports2, module2) {
      "use strict";
      module2.exports = {};
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/index-minimal.js
  var require_index_minimal = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/src/index-minimal.js"(exports2) {
      "use strict";
      var protobuf = exports2;
      protobuf.build = "minimal";
      protobuf.Writer = require_writer();
      protobuf.BufferWriter = require_writer_buffer();
      protobuf.Reader = require_reader();
      protobuf.BufferReader = require_reader_buffer();
      protobuf.util = require_minimal();
      protobuf.rpc = require_rpc();
      protobuf.roots = require_roots();
      protobuf.configure = configure6;
      function configure6() {
        protobuf.util._configure();
        protobuf.Writer._configure(protobuf.BufferWriter);
        protobuf.Reader._configure(protobuf.BufferReader);
      }
      configure6();
    }
  });

  // node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/minimal.js
  var require_minimal2 = __commonJS({
    "node_modules/.pnpm/protobufjs@7.2.5/node_modules/protobufjs/minimal.js"(exports2, module2) {
      "use strict";
      module2.exports = require_index_minimal();
    }
  });

  // node_modules/.pnpm/murmurhash3js-revisited@3.0.0/node_modules/murmurhash3js-revisited/lib/murmurHash3js.js
  var require_murmurHash3js = __commonJS({
    "node_modules/.pnpm/murmurhash3js-revisited@3.0.0/node_modules/murmurhash3js-revisited/lib/murmurHash3js.js"(exports2, module2) {
      "use strict";
      (function(root2, undefined2) {
        "use strict";
        var library = {
          "version": "3.0.0",
          "x86": {},
          "x64": {},
          "inputValidation": true
        };
        function _validBytes(bytes) {
          if (!Array.isArray(bytes) && !ArrayBuffer.isView(bytes)) {
            return false;
          }
          for (var i = 0; i < bytes.length; i++) {
            if (!Number.isInteger(bytes[i]) || bytes[i] < 0 || bytes[i] > 255) {
              return false;
            }
          }
          return true;
        }
        function _x86Multiply(m, n) {
          return (m & 65535) * n + (((m >>> 16) * n & 65535) << 16);
        }
        function _x86Rotl(m, n) {
          return m << n | m >>> 32 - n;
        }
        function _x86Fmix(h) {
          h ^= h >>> 16;
          h = _x86Multiply(h, 2246822507);
          h ^= h >>> 13;
          h = _x86Multiply(h, 3266489909);
          h ^= h >>> 16;
          return h;
        }
        function _x64Add(m, n) {
          m = [m[0] >>> 16, m[0] & 65535, m[1] >>> 16, m[1] & 65535];
          n = [n[0] >>> 16, n[0] & 65535, n[1] >>> 16, n[1] & 65535];
          var o = [0, 0, 0, 0];
          o[3] += m[3] + n[3];
          o[2] += o[3] >>> 16;
          o[3] &= 65535;
          o[2] += m[2] + n[2];
          o[1] += o[2] >>> 16;
          o[2] &= 65535;
          o[1] += m[1] + n[1];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[0] += m[0] + n[0];
          o[0] &= 65535;
          return [o[0] << 16 | o[1], o[2] << 16 | o[3]];
        }
        function _x64Multiply(m, n) {
          m = [m[0] >>> 16, m[0] & 65535, m[1] >>> 16, m[1] & 65535];
          n = [n[0] >>> 16, n[0] & 65535, n[1] >>> 16, n[1] & 65535];
          var o = [0, 0, 0, 0];
          o[3] += m[3] * n[3];
          o[2] += o[3] >>> 16;
          o[3] &= 65535;
          o[2] += m[2] * n[3];
          o[1] += o[2] >>> 16;
          o[2] &= 65535;
          o[2] += m[3] * n[2];
          o[1] += o[2] >>> 16;
          o[2] &= 65535;
          o[1] += m[1] * n[3];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[1] += m[2] * n[2];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[1] += m[3] * n[1];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
          o[0] &= 65535;
          return [o[0] << 16 | o[1], o[2] << 16 | o[3]];
        }
        function _x64Rotl(m, n) {
          n %= 64;
          if (n === 32) {
            return [m[1], m[0]];
          } else if (n < 32) {
            return [m[0] << n | m[1] >>> 32 - n, m[1] << n | m[0] >>> 32 - n];
          } else {
            n -= 32;
            return [m[1] << n | m[0] >>> 32 - n, m[0] << n | m[1] >>> 32 - n];
          }
        }
        function _x64LeftShift(m, n) {
          n %= 64;
          if (n === 0) {
            return m;
          } else if (n < 32) {
            return [m[0] << n | m[1] >>> 32 - n, m[1] << n];
          } else {
            return [m[1] << n - 32, 0];
          }
        }
        function _x64Xor(m, n) {
          return [m[0] ^ n[0], m[1] ^ n[1]];
        }
        function _x64Fmix(h) {
          h = _x64Xor(h, [0, h[0] >>> 1]);
          h = _x64Multiply(h, [4283543511, 3981806797]);
          h = _x64Xor(h, [0, h[0] >>> 1]);
          h = _x64Multiply(h, [3301882366, 444984403]);
          h = _x64Xor(h, [0, h[0] >>> 1]);
          return h;
        }
        library.x86.hash32 = function(bytes, seed) {
          if (library.inputValidation && !_validBytes(bytes)) {
            return undefined2;
          }
          seed = seed || 0;
          var remainder = bytes.length % 4;
          var blocks = bytes.length - remainder;
          var h1 = seed;
          var k1 = 0;
          var c1 = 3432918353;
          var c2 = 461845907;
          for (var i = 0; i < blocks; i = i + 4) {
            k1 = bytes[i] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | bytes[i + 3] << 24;
            k1 = _x86Multiply(k1, c1);
            k1 = _x86Rotl(k1, 15);
            k1 = _x86Multiply(k1, c2);
            h1 ^= k1;
            h1 = _x86Rotl(h1, 13);
            h1 = _x86Multiply(h1, 5) + 3864292196;
          }
          k1 = 0;
          switch (remainder) {
            case 3:
              k1 ^= bytes[i + 2] << 16;
            case 2:
              k1 ^= bytes[i + 1] << 8;
            case 1:
              k1 ^= bytes[i];
              k1 = _x86Multiply(k1, c1);
              k1 = _x86Rotl(k1, 15);
              k1 = _x86Multiply(k1, c2);
              h1 ^= k1;
          }
          h1 ^= bytes.length;
          h1 = _x86Fmix(h1);
          return h1 >>> 0;
        };
        library.x86.hash128 = function(bytes, seed) {
          if (library.inputValidation && !_validBytes(bytes)) {
            return undefined2;
          }
          seed = seed || 0;
          var remainder = bytes.length % 16;
          var blocks = bytes.length - remainder;
          var h1 = seed;
          var h2 = seed;
          var h3 = seed;
          var h4 = seed;
          var k1 = 0;
          var k2 = 0;
          var k3 = 0;
          var k4 = 0;
          var c1 = 597399067;
          var c2 = 2869860233;
          var c3 = 951274213;
          var c4 = 2716044179;
          for (var i = 0; i < blocks; i = i + 16) {
            k1 = bytes[i] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | bytes[i + 3] << 24;
            k2 = bytes[i + 4] | bytes[i + 5] << 8 | bytes[i + 6] << 16 | bytes[i + 7] << 24;
            k3 = bytes[i + 8] | bytes[i + 9] << 8 | bytes[i + 10] << 16 | bytes[i + 11] << 24;
            k4 = bytes[i + 12] | bytes[i + 13] << 8 | bytes[i + 14] << 16 | bytes[i + 15] << 24;
            k1 = _x86Multiply(k1, c1);
            k1 = _x86Rotl(k1, 15);
            k1 = _x86Multiply(k1, c2);
            h1 ^= k1;
            h1 = _x86Rotl(h1, 19);
            h1 += h2;
            h1 = _x86Multiply(h1, 5) + 1444728091;
            k2 = _x86Multiply(k2, c2);
            k2 = _x86Rotl(k2, 16);
            k2 = _x86Multiply(k2, c3);
            h2 ^= k2;
            h2 = _x86Rotl(h2, 17);
            h2 += h3;
            h2 = _x86Multiply(h2, 5) + 197830471;
            k3 = _x86Multiply(k3, c3);
            k3 = _x86Rotl(k3, 17);
            k3 = _x86Multiply(k3, c4);
            h3 ^= k3;
            h3 = _x86Rotl(h3, 15);
            h3 += h4;
            h3 = _x86Multiply(h3, 5) + 2530024501;
            k4 = _x86Multiply(k4, c4);
            k4 = _x86Rotl(k4, 18);
            k4 = _x86Multiply(k4, c1);
            h4 ^= k4;
            h4 = _x86Rotl(h4, 13);
            h4 += h1;
            h4 = _x86Multiply(h4, 5) + 850148119;
          }
          k1 = 0;
          k2 = 0;
          k3 = 0;
          k4 = 0;
          switch (remainder) {
            case 15:
              k4 ^= bytes[i + 14] << 16;
            case 14:
              k4 ^= bytes[i + 13] << 8;
            case 13:
              k4 ^= bytes[i + 12];
              k4 = _x86Multiply(k4, c4);
              k4 = _x86Rotl(k4, 18);
              k4 = _x86Multiply(k4, c1);
              h4 ^= k4;
            case 12:
              k3 ^= bytes[i + 11] << 24;
            case 11:
              k3 ^= bytes[i + 10] << 16;
            case 10:
              k3 ^= bytes[i + 9] << 8;
            case 9:
              k3 ^= bytes[i + 8];
              k3 = _x86Multiply(k3, c3);
              k3 = _x86Rotl(k3, 17);
              k3 = _x86Multiply(k3, c4);
              h3 ^= k3;
            case 8:
              k2 ^= bytes[i + 7] << 24;
            case 7:
              k2 ^= bytes[i + 6] << 16;
            case 6:
              k2 ^= bytes[i + 5] << 8;
            case 5:
              k2 ^= bytes[i + 4];
              k2 = _x86Multiply(k2, c2);
              k2 = _x86Rotl(k2, 16);
              k2 = _x86Multiply(k2, c3);
              h2 ^= k2;
            case 4:
              k1 ^= bytes[i + 3] << 24;
            case 3:
              k1 ^= bytes[i + 2] << 16;
            case 2:
              k1 ^= bytes[i + 1] << 8;
            case 1:
              k1 ^= bytes[i];
              k1 = _x86Multiply(k1, c1);
              k1 = _x86Rotl(k1, 15);
              k1 = _x86Multiply(k1, c2);
              h1 ^= k1;
          }
          h1 ^= bytes.length;
          h2 ^= bytes.length;
          h3 ^= bytes.length;
          h4 ^= bytes.length;
          h1 += h2;
          h1 += h3;
          h1 += h4;
          h2 += h1;
          h3 += h1;
          h4 += h1;
          h1 = _x86Fmix(h1);
          h2 = _x86Fmix(h2);
          h3 = _x86Fmix(h3);
          h4 = _x86Fmix(h4);
          h1 += h2;
          h1 += h3;
          h1 += h4;
          h2 += h1;
          h3 += h1;
          h4 += h1;
          return ("00000000" + (h1 >>> 0).toString(16)).slice(-8) + ("00000000" + (h2 >>> 0).toString(16)).slice(-8) + ("00000000" + (h3 >>> 0).toString(16)).slice(-8) + ("00000000" + (h4 >>> 0).toString(16)).slice(-8);
        };
        library.x64.hash128 = function(bytes, seed) {
          if (library.inputValidation && !_validBytes(bytes)) {
            return undefined2;
          }
          seed = seed || 0;
          var remainder = bytes.length % 16;
          var blocks = bytes.length - remainder;
          var h1 = [0, seed];
          var h2 = [0, seed];
          var k1 = [0, 0];
          var k2 = [0, 0];
          var c1 = [2277735313, 289559509];
          var c2 = [1291169091, 658871167];
          for (var i = 0; i < blocks; i = i + 16) {
            k1 = [bytes[i + 4] | bytes[i + 5] << 8 | bytes[i + 6] << 16 | bytes[i + 7] << 24, bytes[i] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | bytes[i + 3] << 24];
            k2 = [bytes[i + 12] | bytes[i + 13] << 8 | bytes[i + 14] << 16 | bytes[i + 15] << 24, bytes[i + 8] | bytes[i + 9] << 8 | bytes[i + 10] << 16 | bytes[i + 11] << 24];
            k1 = _x64Multiply(k1, c1);
            k1 = _x64Rotl(k1, 31);
            k1 = _x64Multiply(k1, c2);
            h1 = _x64Xor(h1, k1);
            h1 = _x64Rotl(h1, 27);
            h1 = _x64Add(h1, h2);
            h1 = _x64Add(_x64Multiply(h1, [0, 5]), [0, 1390208809]);
            k2 = _x64Multiply(k2, c2);
            k2 = _x64Rotl(k2, 33);
            k2 = _x64Multiply(k2, c1);
            h2 = _x64Xor(h2, k2);
            h2 = _x64Rotl(h2, 31);
            h2 = _x64Add(h2, h1);
            h2 = _x64Add(_x64Multiply(h2, [0, 5]), [0, 944331445]);
          }
          k1 = [0, 0];
          k2 = [0, 0];
          switch (remainder) {
            case 15:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 14]], 48));
            case 14:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 13]], 40));
            case 13:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 12]], 32));
            case 12:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 11]], 24));
            case 11:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 10]], 16));
            case 10:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 9]], 8));
            case 9:
              k2 = _x64Xor(k2, [0, bytes[i + 8]]);
              k2 = _x64Multiply(k2, c2);
              k2 = _x64Rotl(k2, 33);
              k2 = _x64Multiply(k2, c1);
              h2 = _x64Xor(h2, k2);
            case 8:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 7]], 56));
            case 7:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 6]], 48));
            case 6:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 5]], 40));
            case 5:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 4]], 32));
            case 4:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 3]], 24));
            case 3:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 2]], 16));
            case 2:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 1]], 8));
            case 1:
              k1 = _x64Xor(k1, [0, bytes[i]]);
              k1 = _x64Multiply(k1, c1);
              k1 = _x64Rotl(k1, 31);
              k1 = _x64Multiply(k1, c2);
              h1 = _x64Xor(h1, k1);
          }
          h1 = _x64Xor(h1, [0, bytes.length]);
          h2 = _x64Xor(h2, [0, bytes.length]);
          h1 = _x64Add(h1, h2);
          h2 = _x64Add(h2, h1);
          h1 = _x64Fmix(h1);
          h2 = _x64Fmix(h2);
          h1 = _x64Add(h1, h2);
          h2 = _x64Add(h2, h1);
          return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
        };
        if (typeof exports2 !== "undefined") {
          if (typeof module2 !== "undefined" && module2.exports) {
            exports2 = module2.exports = library;
          }
          exports2.murmurHash3 = library;
        } else if (typeof define === "function" && define.amd) {
          define([], function() {
            return library;
          });
        } else {
          library._murmurHash3 = root2.murmurHash3;
          library.noConflict = function() {
            root2.murmurHash3 = library._murmurHash3;
            library._murmurHash3 = undefined2;
            library.noConflict = undefined2;
            return library;
          };
          root2.murmurHash3 = library;
        }
      })(exports2);
    }
  });

  // node_modules/.pnpm/murmurhash3js-revisited@3.0.0/node_modules/murmurhash3js-revisited/index.js
  var require_murmurhash3js_revisited = __commonJS({
    "node_modules/.pnpm/murmurhash3js-revisited@3.0.0/node_modules/murmurhash3js-revisited/index.js"(exports2, module2) {
      "use strict";
      module2.exports = require_murmurHash3js();
    }
  });

  // node_modules/.pnpm/err-code@3.0.1/node_modules/err-code/index.js
  var require_err_code = __commonJS({
    "node_modules/.pnpm/err-code@3.0.1/node_modules/err-code/index.js"(exports2, module2) {
      "use strict";
      function assign2(obj, props) {
        for (const key in props) {
          Object.defineProperty(obj, key, {
            value: props[key],
            enumerable: true,
            configurable: true
          });
        }
        return obj;
      }
      function createError(err, code9, props) {
        if (!err || typeof err === "string") {
          throw new TypeError("Please pass an Error to err-code");
        }
        if (!props) {
          props = {};
        }
        if (typeof code9 === "object") {
          props = code9;
          code9 = "";
        }
        if (code9) {
          props.code = code9;
        }
        try {
          return assign2(err, props);
        } catch (_) {
          props.message = err.message;
          props.stack = err.stack;
          const ErrClass = function() {
          };
          ErrClass.prototype = Object.create(Object.getPrototypeOf(err));
          const output = assign2(new ErrClass(), props);
          return output;
        }
      }
      module2.exports = createError;
    }
  });

  // node_modules/.pnpm/sparse-array@1.3.2/node_modules/sparse-array/index.js
  var require_sparse_array = __commonJS({
    "node_modules/.pnpm/sparse-array@1.3.2/node_modules/sparse-array/index.js"(exports2, module2) {
      "use strict";
      var BITS_PER_BYTE = 7;
      module2.exports = class SparseArray {
        constructor() {
          this._bitArrays = [];
          this._data = [];
          this._length = 0;
          this._changedLength = false;
          this._changedData = false;
        }
        set(index2, value) {
          let pos = this._internalPositionFor(index2, false);
          if (value === void 0) {
            if (pos !== -1) {
              this._unsetInternalPos(pos);
              this._unsetBit(index2);
              this._changedLength = true;
              this._changedData = true;
            }
          } else {
            let needsSort = false;
            if (pos === -1) {
              pos = this._data.length;
              this._setBit(index2);
              this._changedData = true;
            } else {
              needsSort = true;
            }
            this._setInternalPos(pos, index2, value, needsSort);
            this._changedLength = true;
          }
        }
        unset(index2) {
          this.set(index2, void 0);
        }
        get(index2) {
          this._sortData();
          const pos = this._internalPositionFor(index2, true);
          if (pos === -1) {
            return void 0;
          }
          return this._data[pos][1];
        }
        push(value) {
          this.set(this.length, value);
          return this.length;
        }
        get length() {
          this._sortData();
          if (this._changedLength) {
            const last2 = this._data[this._data.length - 1];
            this._length = last2 ? last2[0] + 1 : 0;
            this._changedLength = false;
          }
          return this._length;
        }
        forEach(iterator) {
          let i = 0;
          while (i < this.length) {
            iterator(this.get(i), i, this);
            i++;
          }
        }
        map(iterator) {
          let i = 0;
          let mapped = new Array(this.length);
          while (i < this.length) {
            mapped[i] = iterator(this.get(i), i, this);
            i++;
          }
          return mapped;
        }
        reduce(reducer, initialValue) {
          let i = 0;
          let acc = initialValue;
          while (i < this.length) {
            const value = this.get(i);
            acc = reducer(acc, value, i);
            i++;
          }
          return acc;
        }
        find(finder) {
          let i = 0, found, last2;
          while (i < this.length && !found) {
            last2 = this.get(i);
            found = finder(last2);
            i++;
          }
          return found ? last2 : void 0;
        }
        _internalPositionFor(index2, noCreate) {
          const bytePos = this._bytePosFor(index2, noCreate);
          if (bytePos >= this._bitArrays.length) {
            return -1;
          }
          const byte = this._bitArrays[bytePos];
          const bitPos = index2 - bytePos * BITS_PER_BYTE;
          const exists2 = (byte & 1 << bitPos) > 0;
          if (!exists2) {
            return -1;
          }
          const previousPopCount = this._bitArrays.slice(0, bytePos).reduce(popCountReduce, 0);
          const mask = ~(4294967295 << bitPos + 1);
          const bytePopCount = popCount(byte & mask);
          const arrayPos = previousPopCount + bytePopCount - 1;
          return arrayPos;
        }
        _bytePosFor(index2, noCreate) {
          const bytePos = Math.floor(index2 / BITS_PER_BYTE);
          const targetLength = bytePos + 1;
          while (!noCreate && this._bitArrays.length < targetLength) {
            this._bitArrays.push(0);
          }
          return bytePos;
        }
        _setBit(index2) {
          const bytePos = this._bytePosFor(index2, false);
          this._bitArrays[bytePos] |= 1 << index2 - bytePos * BITS_PER_BYTE;
        }
        _unsetBit(index2) {
          const bytePos = this._bytePosFor(index2, false);
          this._bitArrays[bytePos] &= ~(1 << index2 - bytePos * BITS_PER_BYTE);
        }
        _setInternalPos(pos, index2, value, needsSort) {
          const data = this._data;
          const elem = [index2, value];
          if (needsSort) {
            this._sortData();
            data[pos] = elem;
          } else {
            if (data.length) {
              if (data[data.length - 1][0] >= index2) {
                data.push(elem);
              } else if (data[0][0] <= index2) {
                data.unshift(elem);
              } else {
                const randomIndex = Math.round(data.length / 2);
                this._data = data.slice(0, randomIndex).concat(elem).concat(data.slice(randomIndex));
              }
            } else {
              this._data.push(elem);
            }
            this._changedData = true;
            this._changedLength = true;
          }
        }
        _unsetInternalPos(pos) {
          this._data.splice(pos, 1);
        }
        _sortData() {
          if (this._changedData) {
            this._data.sort(sortInternal);
          }
          this._changedData = false;
        }
        bitField() {
          const bytes = [];
          let pendingBitsForResultingByte = 8;
          let pendingBitsForNewByte = 0;
          let resultingByte = 0;
          let newByte;
          const pending = this._bitArrays.slice();
          while (pending.length || pendingBitsForNewByte) {
            if (pendingBitsForNewByte === 0) {
              newByte = pending.shift();
              pendingBitsForNewByte = 7;
            }
            const usingBits = Math.min(pendingBitsForNewByte, pendingBitsForResultingByte);
            const mask = ~(255 << usingBits);
            const masked = newByte & mask;
            resultingByte |= masked << 8 - pendingBitsForResultingByte;
            newByte = newByte >>> usingBits;
            pendingBitsForNewByte -= usingBits;
            pendingBitsForResultingByte -= usingBits;
            if (!pendingBitsForResultingByte || !pendingBitsForNewByte && !pending.length) {
              bytes.push(resultingByte);
              resultingByte = 0;
              pendingBitsForResultingByte = 8;
            }
          }
          for (var i = bytes.length - 1; i > 0; i--) {
            const value = bytes[i];
            if (value === 0) {
              bytes.pop();
            } else {
              break;
            }
          }
          return bytes;
        }
        compactArray() {
          this._sortData();
          return this._data.map(valueOnly);
        }
      };
      function popCountReduce(count, byte) {
        return count + popCount(byte);
      }
      function popCount(_v) {
        let v = _v;
        v = v - (v >> 1 & 1431655765);
        v = (v & 858993459) + (v >> 2 & 858993459);
        return (v + (v >> 4) & 252645135) * 16843009 >> 24;
      }
      function sortInternal(a, b) {
        return a[0] - b[0];
      }
      function valueOnly(elem) {
        return elem[1];
      }
    }
  });

  // node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.js
  var require_eventemitter3 = __commonJS({
    "node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.js"(exports2, module2) {
      "use strict";
      var has2 = Object.prototype.hasOwnProperty;
      var prefix = "~";
      function Events() {
      }
      if (Object.create) {
        Events.prototype = /* @__PURE__ */ Object.create(null);
        if (!new Events().__proto__) prefix = false;
      }
      function EE(fn, context2, once) {
        this.fn = fn;
        this.context = context2;
        this.once = once || false;
      }
      function addListener(emitter, event, fn, context2, once) {
        if (typeof fn !== "function") {
          throw new TypeError("The listener must be a function");
        }
        var listener = new EE(fn, context2 || emitter, once), evt = prefix ? prefix + event : event;
        if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
        else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
        else emitter._events[evt] = [emitter._events[evt], listener];
        return emitter;
      }
      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();
        else delete emitter._events[evt];
      }
      function EventEmitter2() {
        this._events = new Events();
        this._eventsCount = 0;
      }
      EventEmitter2.prototype.eventNames = function eventNames() {
        var names = [], events, name7;
        if (this._eventsCount === 0) return names;
        for (name7 in events = this._events) {
          if (has2.call(events, name7)) names.push(prefix ? name7.slice(1) : name7);
        }
        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }
        return names;
      };
      EventEmitter2.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event, handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];
        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }
        return ee;
      };
      EventEmitter2.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event, listeners = this._events[evt];
        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };
      EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return false;
        var listeners = this._events[evt], len = arguments.length, args, i;
        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;
            case 2:
              return listeners.fn.call(listeners.context, a1), true;
            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }
          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }
          listeners.fn.apply(listeners.context, args);
        } else {
          var length4 = listeners.length, j;
          for (i = 0; i < length4; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;
              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;
              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;
              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;
              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }
        return true;
      };
      EventEmitter2.prototype.on = function on(event, fn, context2) {
        return addListener(this, event, fn, context2, false);
      };
      EventEmitter2.prototype.once = function once(event, fn, context2) {
        return addListener(this, event, fn, context2, true);
      };
      EventEmitter2.prototype.removeListener = function removeListener(event, fn, context2, once) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return this;
        if (!fn) {
          clearEvent(this, evt);
          return this;
        }
        var listeners = this._events[evt];
        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context2 || listeners.context === context2)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length4 = listeners.length; i < length4; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context2 && listeners[i].context !== context2) {
              events.push(listeners[i]);
            }
          }
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
          else clearEvent(this, evt);
        }
        return this;
      };
      EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;
        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }
        return this;
      };
      EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
      EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
      EventEmitter2.prefixed = prefix;
      EventEmitter2.EventEmitter = EventEmitter2;
      if ("undefined" !== typeof module2) {
        module2.exports = EventEmitter2;
      }
    }
  });

  // src/utils.ts
  function presetEnv() {
    const penv = new Map([
      // ["FP_DEBUG", "xxx"],
      // ["FP_ENV", "development"],
      ...Array.from(
        Object.entries(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          globalThis[Symbol.for("FP_PRESET_ENV")] || {}
        )
      )
      // .map(([k, v]) => [k, v as string])
    ]);
    return penv;
  }
  function ensureSuperThis(osthis) {
    const env = envFactory({
      symbol: osthis?.env?.symbol || "FP_ENV",
      presetEnv: osthis?.env?.presetEnv || presetEnv()
    });
    return new superThis({
      logger: osthis?.logger || globalLogger,
      env,
      crypto: osthis?.crypto || toCryptoRuntime(),
      ctx: osthis?.ctx || {},
      pathOps,
      txt: osthis?.txt || txtOps
    });
  }
  function ensureSuperLog(sthis, componentName, ctx) {
    return sthis.clone({
      logger: ensureLogger(sthis, componentName, ctx)
    });
  }
  function ensureLogger(sthis, componentName, ctx) {
    let logger = globalLogger;
    if (IsLogger(sthis)) {
      logger = sthis;
    } else if (sthis && IsLogger(sthis.logger)) {
      logger = sthis.logger;
    }
    const cLogger = logger.With().Module(componentName);
    const debug = [];
    let exposeStack = false;
    if (ctx) {
      if ("debug" in ctx) {
        if (typeof ctx.debug === "string" && ctx.debug.length > 0) {
          debug.push(ctx.debug);
        } else {
          debug.push(componentName);
        }
        delete ctx.debug;
      }
      if ("exposeStack" in ctx) {
        exposeStack = true;
        delete ctx.exposeStack;
      }
      if ("this" in ctx) {
        cLogger.Str("this", sthis.nextId(4).str);
        delete ctx.this;
      }
      for (const [key, value] of Object.entries(ctx)) {
        switch (typeof value) {
          case "string":
            cLogger.Str(key, value);
            break;
          case "number":
            cLogger.Uint64(key, value);
            break;
          default:
            if (value instanceof Date) {
              cLogger.Str(key, value.toISOString());
            } else if (isURL(value)) {
              cLogger.Str(key, value.toString());
            } else if (typeof value === "function") {
              cLogger.Ref(key, value);
            } else {
              cLogger.Any(key, value);
            }
            break;
        }
      }
    }
    registerFP_DEBUG.once(async () => {
      sthis.env.onSet(
        (key, value) => {
          switch (key) {
            case "FP_DEBUG":
              logger.SetDebug(value || []);
              break;
            case "FP_STACK":
              logger.SetExposeStack(!!value);
              break;
          }
        },
        "FP_DEBUG",
        "FP_STACK"
      );
    }).finally(() => {
    });
    if (debug.length > 0) {
      logger.SetDebug(debug);
    }
    if (exposeStack) {
      logger.SetExposeStack(true);
    }
    const out = cLogger.Logger();
    return out;
  }
  function getStore(url, sthis, joiner) {
    const store = url.getParam("store");
    switch (store) {
      case "data":
      case "wal":
      case "meta":
        break;
      default:
        throw sthis.logger.Error().Url(url).Msg(`store not found`).AsError();
    }
    let name7 = store;
    if (url.hasParam("index")) {
      name7 = joiner(url.getParam("index") || "idx", name7);
    }
    return { store, name: name7 };
  }
  function getKey(url, logger) {
    const result = url.getParam("key");
    if (!result) throw logger.Error().Str("url", url.toString()).Msg(`key not found`).AsError();
    return result;
  }
  function getName(sthis, url) {
    let result = url.getParam("name");
    if (!result) {
      result = sthis.pathOps.dirname(url.pathname);
      if (result.length === 0) {
        throw sthis.logger.Error().Str("url", url.toString()).Msg(`name not found`).AsError();
      }
    }
    return result;
  }
  async function exceptionWrapper(fn) {
    return fn().catch((e) => Result.Err(e));
  }
  function isNotFoundError(e) {
    if (Result.Is(e)) {
      if (e.isOk()) return false;
      e = e.Err();
    }
    if (e.code === "ENOENT") return true;
    return false;
  }
  function dataDir(sthis, name7, base4) {
    if (!base4) {
      if (!runtimeFn().isBrowser) {
        const home = sthis.env.get("HOME") || "./";
        base4 = sthis.env.get("FP_STORAGE_URL") || `file://${sthis.pathOps.join(home, ".fireproof")}`;
      } else {
        base4 = sthis.env.get("FP_STORAGE_URL") || `indexdb://fp`;
      }
    }
    return URI.from(base4.toString()).build().setParam("name", name7 || "").URI();
  }
  function UInt8ArrayEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  var globalLogger, registerFP_DEBUG, superThis, pathOpsImpl, pathOps, txtOps, NotFoundError;
  var init_utils = __esm({
    "src/utils.ts"() {
      "use strict";
      init_cement();
      init_base58();
      globalLogger = new LoggerImpl();
      registerFP_DEBUG = new ResolveOnce();
      superThis = class _superThis {
        constructor(opts) {
          this.logger = opts.logger;
          this.env = opts.env;
          this.crypto = opts.crypto;
          this.pathOps = opts.pathOps;
          this.txt = opts.txt;
          this.ctx = { ...opts.ctx };
        }
        nextId(bytes = 6) {
          const bin = this.crypto.randomBytes(bytes);
          return {
            str: base58btc.encode(bin),
            bin
          };
        }
        start() {
          return Promise.resolve();
        }
        clone(override) {
          return new _superThis({
            logger: override.logger || this.logger,
            env: envFactory(override.env) || this.env,
            crypto: override.crypto || this.crypto,
            pathOps: override.pathOps || this.pathOps,
            txt: override.txt || this.txt,
            ctx: { ...this.ctx, ...override.ctx }
          });
        }
      };
      pathOpsImpl = class {
        join(...paths) {
          return paths.map((i) => i.replace(/\/+$/, "")).join("/");
        }
        dirname(path) {
          return path.split("/").slice(0, -1).join("/");
        }
        // homedir() {
        //     throw new Error("SysContainer:homedir is not available in seeded state");
        //   }
      };
      pathOps = new pathOpsImpl();
      txtOps = {
        encode: (input) => new TextEncoder().encode(input),
        decode: (input) => new TextDecoder().decode(input)
      };
      NotFoundError = class extends Error {
        constructor() {
          super(...arguments);
          this.code = "ENOENT";
        }
      };
    }
  });

  // node_modules/.pnpm/varint@6.0.0/node_modules/varint/encode.js
  var require_encode = __commonJS({
    "node_modules/.pnpm/varint@6.0.0/node_modules/varint/encode.js"(exports2, module2) {
      "use strict";
      module2.exports = encode18;
      var MSB3 = 128;
      var REST3 = 127;
      var MSBALL3 = ~REST3;
      var INT3 = Math.pow(2, 31);
      function encode18(num, out, offset) {
        if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
          encode18.bytes = 0;
          throw new RangeError("Could not encode varint");
        }
        out = out || [];
        offset = offset || 0;
        var oldOffset = offset;
        while (num >= INT3) {
          out[offset++] = num & 255 | MSB3;
          num /= 128;
        }
        while (num & MSBALL3) {
          out[offset++] = num & 255 | MSB3;
          num >>>= 7;
        }
        out[offset] = num | 0;
        encode18.bytes = offset - oldOffset + 1;
        return out;
      }
    }
  });

  // node_modules/.pnpm/varint@6.0.0/node_modules/varint/decode.js
  var require_decode = __commonJS({
    "node_modules/.pnpm/varint@6.0.0/node_modules/varint/decode.js"(exports2, module2) {
      "use strict";
      module2.exports = read5;
      var MSB3 = 128;
      var REST3 = 127;
      function read5(buf2, offset) {
        var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf2.length;
        do {
          if (counter >= l || shift > 49) {
            read5.bytes = 0;
            throw new RangeError("Could not decode varint");
          }
          b = buf2[counter++];
          res += shift < 28 ? (b & REST3) << shift : (b & REST3) * Math.pow(2, shift);
          shift += 7;
        } while (b >= MSB3);
        read5.bytes = counter - offset;
        return res;
      }
    }
  });

  // node_modules/.pnpm/varint@6.0.0/node_modules/varint/length.js
  var require_length = __commonJS({
    "node_modules/.pnpm/varint@6.0.0/node_modules/varint/length.js"(exports2, module2) {
      "use strict";
      var N13 = Math.pow(2, 7);
      var N23 = Math.pow(2, 14);
      var N33 = Math.pow(2, 21);
      var N43 = Math.pow(2, 28);
      var N53 = Math.pow(2, 35);
      var N63 = Math.pow(2, 42);
      var N73 = Math.pow(2, 49);
      var N83 = Math.pow(2, 56);
      var N93 = Math.pow(2, 63);
      module2.exports = function(value) {
        return value < N13 ? 1 : value < N23 ? 2 : value < N33 ? 3 : value < N43 ? 4 : value < N53 ? 5 : value < N63 ? 6 : value < N73 ? 7 : value < N83 ? 8 : value < N93 ? 9 : 10;
      };
    }
  });

  // node_modules/.pnpm/varint@6.0.0/node_modules/varint/index.js
  var require_varint = __commonJS({
    "node_modules/.pnpm/varint@6.0.0/node_modules/varint/index.js"(exports2, module2) {
      "use strict";
      module2.exports = {
        encode: require_encode(),
        decode: require_decode(),
        encodingLength: require_length()
      };
    }
  });

  // src/bundle-not-impl.ts
  var require_bundle_not_impl = __commonJS({
    "src/bundle-not-impl.ts"() {
      "use strict";
      var err = new Error("store-file not implemented");
      console.error(err.stack);
      throw err;
    }
  });

  // node_modules/.pnpm/idb@8.0.0/node_modules/idb/build/index.js
  function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
      IDBDatabase,
      IDBObjectStore,
      IDBIndex,
      IDBCursor,
      IDBTransaction
    ]);
  }
  function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey
    ]);
  }
  function promisifyRequest(request) {
    const promise = new Promise((resolve7, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error);
      };
      const success = () => {
        resolve7(wrap(request.result));
        unlisten();
      };
      const error = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error);
    });
    reverseTransformCache.set(promise, request);
    return promise;
  }
  function cacheDonePromiseForTransaction(tx) {
    if (transactionDoneMap.has(tx))
      return;
    const done = new Promise((resolve7, reject) => {
      const unlisten = () => {
        tx.removeEventListener("complete", complete);
        tx.removeEventListener("error", error);
        tx.removeEventListener("abort", error);
      };
      const complete = () => {
        resolve7();
        unlisten();
      };
      const error = () => {
        reject(tx.error || new DOMException("AbortError", "AbortError"));
        unlisten();
      };
      tx.addEventListener("complete", complete);
      tx.addEventListener("error", error);
      tx.addEventListener("abort", error);
    });
    transactionDoneMap.set(tx, done);
  }
  function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
  }
  function wrapFunction(func) {
    if (getCursorAdvanceMethods().includes(func)) {
      return function(...args) {
        func.apply(unwrap(this), args);
        return wrap(this.request);
      };
    }
    return function(...args) {
      return wrap(func.apply(unwrap(this), args));
    };
  }
  function transformCachableValue(value) {
    if (typeof value === "function")
      return wrapFunction(value);
    if (value instanceof IDBTransaction)
      cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
      return new Proxy(value, idbProxyTraps);
    return value;
  }
  function wrap(value) {
    if (value instanceof IDBRequest)
      return promisifyRequest(value);
    if (transformCache.has(value))
      return transformCache.get(value);
    const newValue = transformCachableValue(value);
    if (newValue !== value) {
      transformCache.set(value, newValue);
      reverseTransformCache.set(newValue, value);
    }
    return newValue;
  }
  function openDB(name7, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name7, version);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event.newVersion,
        event
      ));
    }
    openPromise.then((db) => {
      if (terminated)
        db.addEventListener("close", () => terminated());
      if (blocking) {
        db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
      }
    }).catch(() => {
    });
    return openPromise;
  }
  function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
      return;
    }
    if (cachedMethods.get(prop))
      return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, "");
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
      // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
      !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
    ) {
      return;
    }
    const method = async function(storeName, ...args) {
      const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
      let target2 = tx.store;
      if (useIndex)
        target2 = target2.index(args.shift());
      return (await Promise.all([
        target2[targetFuncName](...args),
        isWrite && tx.done
      ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
  }
  async function* iterate3(...args) {
    let cursor = this;
    if (!(cursor instanceof IDBCursor)) {
      cursor = await cursor.openCursor(...args);
    }
    if (!cursor)
      return;
    cursor = cursor;
    const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
    while (cursor) {
      yield proxiedCursor;
      cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
      advanceResults.delete(proxiedCursor);
    }
  }
  function isIteratorProp(target, prop) {
    return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === "iterate" && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
  }
  var instanceOfAny, idbProxyableTypes, cursorAdvanceMethods, transactionDoneMap, transformCache, reverseTransformCache, idbProxyTraps, unwrap, readMethods, writeMethods, cachedMethods, advanceMethodProps, methodMap, advanceResults, ittrProxiedCursorToOriginalProxy, cursorIteratorTraps;
  var init_build = __esm({
    "node_modules/.pnpm/idb@8.0.0/node_modules/idb/build/index.js"() {
      "use strict";
      instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
      transactionDoneMap = /* @__PURE__ */ new WeakMap();
      transformCache = /* @__PURE__ */ new WeakMap();
      reverseTransformCache = /* @__PURE__ */ new WeakMap();
      idbProxyTraps = {
        get(target, prop, receiver) {
          if (target instanceof IDBTransaction) {
            if (prop === "done")
              return transactionDoneMap.get(target);
            if (prop === "store") {
              return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
            }
          }
          return wrap(target[prop]);
        },
        set(target, prop, value) {
          target[prop] = value;
          return true;
        },
        has(target, prop) {
          if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
            return true;
          }
          return prop in target;
        }
      };
      unwrap = (value) => reverseTransformCache.get(value);
      readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
      writeMethods = ["put", "add", "delete", "clear"];
      cachedMethods = /* @__PURE__ */ new Map();
      replaceTraps((oldTraps) => ({
        ...oldTraps,
        get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
        has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
      }));
      advanceMethodProps = ["continue", "continuePrimaryKey", "advance"];
      methodMap = {};
      advanceResults = /* @__PURE__ */ new WeakMap();
      ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
      cursorIteratorTraps = {
        get(target, prop) {
          if (!advanceMethodProps.includes(prop))
            return target[prop];
          let cachedFunc = methodMap[prop];
          if (!cachedFunc) {
            cachedFunc = methodMap[prop] = function(...args) {
              advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
            };
          }
          return cachedFunc;
        }
      };
      replaceTraps((oldTraps) => ({
        ...oldTraps,
        get(target, prop, receiver) {
          if (isIteratorProp(target, prop))
            return iterate3;
          return oldTraps.get(target, prop, receiver);
        },
        has(target, prop) {
          return isIteratorProp(target, prop) || oldTraps.has(target, prop);
        }
      }));
    }
  });

  // src/runtime/gateways/file/node-filesystem.ts
  var node_filesystem_exports = {};
  __export(node_filesystem_exports, {
    NodeFileSystem: () => NodeFileSystem
  });
  var NodeFileSystem;
  var init_node_filesystem = __esm({
    "src/runtime/gateways/file/node-filesystem.ts"() {
      "use strict";
      init_utils2();
      NodeFileSystem = class {
        async start() {
          this.fs = await Promise.resolve().then(() => __toESM(require_bundle_not_impl(), 1));
          return this;
        }
        async mkdir(path, options) {
          return this.fs?.mkdir(path, options);
        }
        async readdir(path, options) {
          return this.fs?.readdir(path, options);
        }
        async rm(path, options) {
          return this.fs?.rm(path, options);
        }
        async copyFile(source, destination) {
          return this.fs?.copyFile(source, destination);
        }
        async readfile(path, options) {
          const ret = await this.fs?.readFile(path, options);
          return toArrayBuffer(ret);
        }
        stat(path) {
          return this.fs?.stat(path);
        }
        async unlink(path) {
          return this.fs?.unlink(path);
        }
        async writefile(path, data) {
          return this.fs?.writeFile(path, Buffer.from(data));
        }
      };
    }
  });

  // src/runtime/gateways/file/utils.ts
  async function getFileSystem(url) {
    const name7 = url.getParam("fs");
    let fs;
    switch (name7) {
      case "mem":
        {
          const { MemFileSystem } = await Promise.resolve().then(() => __toESM(require_bundle_not_impl(), 1));
          fs = new MemFileSystem();
        }
        break;
      case "node":
      case "sys":
      default: {
        const { NodeFileSystem: NodeFileSystem2 } = await Promise.resolve().then(() => (init_node_filesystem(), node_filesystem_exports));
        fs = new NodeFileSystem2();
      }
    }
    return fs.start();
  }
  function getPath(url, sthis) {
    const basePath = url.pathname;
    const name7 = url.getParam("name");
    if (name7) {
      const version = url.getParam("version");
      if (!version) throw sthis.logger.Error().Url(url).Msg(`version not found`).AsError();
      return sthis.pathOps.join(basePath, version, name7);
    }
    return sthis.pathOps.join(basePath);
  }
  function getFileName(url, sthis) {
    const key = url.getParam("key");
    if (!key) throw sthis.logger.Error().Url(url).Msg(`key not found`).AsError();
    const res = getStore(url, sthis, (...a) => a.join("-"));
    switch (res.store) {
      case "data":
        return sthis.pathOps.join(res.name, key + ".car");
      case "wal":
      case "meta":
        return sthis.pathOps.join(res.name, key + ".json");
      default:
        throw sthis.logger.Error().Url(url).Msg(`unsupported store type`).AsError();
    }
  }
  function toArrayBuffer(buffer2) {
    if (typeof buffer2 === "string") {
      buffer2 = Buffer.from(buffer2);
    }
    const ab = new ArrayBuffer(buffer2.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer2.length; ++i) {
      view[i] = buffer2[i];
    }
    return view;
  }
  var init_utils2 = __esm({
    "src/runtime/gateways/file/utils.ts"() {
      "use strict";
      init_utils();
    }
  });

  // src/runtime/key-bag-indexdb.ts
  var key_bag_indexdb_exports = {};
  __export(key_bag_indexdb_exports, {
    KeyBagProviderIndexDB: () => KeyBagProviderIndexDB
  });
  var KeyBagProviderIndexDB;
  var init_key_bag_indexdb = __esm({
    "src/runtime/key-bag-indexdb.ts"() {
      "use strict";
      init_build();
      init_utils2();
      init_cement();
      KeyBagProviderIndexDB = class {
        constructor(url, sthis) {
          this._db = new ResolveOnce();
          this.sthis = sthis;
          this.logger = sthis.logger;
          this.url = url;
          this.dbName = getPath(this.url, this.sthis);
        }
        async _prepare() {
          return this._db.once(async () => {
            return await openDB(this.dbName, 1, {
              upgrade(db) {
                ["bag"].map((store) => {
                  db.createObjectStore(store, {
                    autoIncrement: false
                  });
                });
              }
            });
          });
        }
        async get(id) {
          const db = await this._prepare();
          const tx = db.transaction(["bag"], "readonly");
          const keyItem = await tx.objectStore("bag").get(id);
          await tx.done;
          if (!keyItem) {
            return void 0;
          }
          return keyItem;
        }
        async set(id, item) {
          const db = await this._prepare();
          const tx = db.transaction(["bag"], "readwrite");
          await tx.objectStore("bag").put(item, id);
          await tx.done;
        }
      };
    }
  });

  // src/runtime/gateways/indexdb/version.ts
  var INDEXDB_VERSION;
  var init_version = __esm({
    "src/runtime/gateways/indexdb/version.ts"() {
      "use strict";
      INDEXDB_VERSION = "v0.19-indexdb";
    }
  });

  // src/runtime/gateways/indexdb/gateway.ts
  var gateway_exports = {};
  __export(gateway_exports, {
    IndexDBGateway: () => IndexDBGateway,
    IndexDBTestStore: () => IndexDBTestStore,
    getIndexDBName: () => getIndexDBName
  });
  function ensureVersion(url) {
    return url.build().defParam("version", INDEXDB_VERSION).URI();
  }
  function sanitzeKey(key) {
    if (key.length === 1) {
      key = key[0];
    }
    return key;
  }
  async function connectIdb(url, sthis) {
    const dbName = getIndexDBName(url, sthis);
    const once = await onceIndexDB.get(dbName.fullDb).once(async () => {
      const db = await openDB(dbName.fullDb, 1, {
        upgrade(db2) {
          ["version", "data", "wal", "meta", "idx.data", "idx.wal", "idx.meta"].map((store) => {
            db2.createObjectStore(store, {
              autoIncrement: false
            });
          });
        }
      });
      const found = await db.get("version", "version");
      const version = ensureVersion(url).getParam("version");
      if (!found) {
        await db.put("version", { version }, "version");
      } else if (found.version !== version) {
        sthis.logger.Warn().Str("url", url.toString()).Str("version", version).Str("found", found.version).Msg("version mismatch");
      }
      return { db, dbName, version, url };
    });
    return {
      ...once,
      url: url.build().setParam("version", once.version).URI()
    };
  }
  function joinDBName(...names) {
    return names.map((i) => i.replace(/^[^a-zA-Z0-9]+/g, "").replace(/[^a-zA-Z0-9]+/g, "_")).filter((i) => i.length).join(".");
  }
  function getIndexDBName(iurl, sthis) {
    const url = ensureVersion(iurl);
    const fullDb = url.pathname.replace(/^\/+/, "").replace(/\?.*$/, "");
    const dbName = url.getParam("name");
    if (!dbName) throw sthis.logger.Error().Str("url", url.toString()).Msg(`name not found`).AsError();
    const result = joinDBName(fullDb, dbName);
    const objStore = getStore(url, sthis, joinDBName).name;
    const connectionKey = [result, objStore].join(":");
    return {
      fullDb: result,
      objStore,
      connectionKey,
      dbName
    };
  }
  var onceIndexDB, IndexDBGateway, IndexDBTestStore;
  var init_gateway = __esm({
    "src/runtime/gateways/indexdb/gateway.ts"() {
      "use strict";
      init_build();
      init_cement();
      init_version();
      init_utils();
      onceIndexDB = new KeyedResolvOnce();
      IndexDBGateway = class {
        constructor(sthis) {
          this._db = {};
          this.logger = ensureLogger(sthis, "IndexDBGateway");
          this.sthis = sthis;
        }
        async start(baseURL) {
          return exception2Result(async () => {
            this.logger.Debug().Url(baseURL).Msg("starting");
            await this.sthis.start();
            const ic = await connectIdb(baseURL, this.sthis);
            this._db = ic.db;
            this.logger.Debug().Url(ic.url).Msg("started");
            return ic.url;
          });
        }
        async close() {
          return Result.Ok(void 0);
        }
        async destroy(baseUrl) {
          return exception2Result(async () => {
            const type2 = getStore(baseUrl, this.sthis, joinDBName).name;
            const idb = this._db;
            const trans = idb.transaction(type2, "readwrite");
            const object_store = trans.objectStore(type2);
            const toDelete = [];
            for (let cursor = await object_store.openCursor(); cursor; cursor = await cursor.continue()) {
              toDelete.push(cursor.primaryKey);
            }
            for (const key of toDelete) {
              await trans.db.delete(type2, key);
            }
            await trans.done;
          });
        }
        buildUrl(baseUrl, key) {
          return Promise.resolve(Result.Ok(baseUrl.build().setParam("key", key).URI()));
        }
        async get(url) {
          return exceptionWrapper(async () => {
            const key = getKey(url, this.logger);
            const store = getStore(url, this.sthis, joinDBName).name;
            this.logger.Debug().Url(url).Str("key", key).Str("store", store).Msg("getting");
            const tx = this._db.transaction([store], "readonly");
            const bytes = await tx.objectStore(store).get(sanitzeKey(key));
            await tx.done;
            if (!bytes) {
              return Result.Err(new NotFoundError(`missing ${key}`));
            }
            return Result.Ok(bytes);
          });
        }
        async put(url, value) {
          return exception2Result(async () => {
            const key = getKey(url, this.logger);
            const store = getStore(url, this.sthis, joinDBName).name;
            this.logger.Debug().Url(url).Str("key", key).Str("store", store).Msg("putting");
            const tx = this._db.transaction([store], "readwrite");
            await tx.objectStore(store).put(value, sanitzeKey(key));
            await tx.done;
          });
        }
        async delete(url) {
          return exception2Result(async () => {
            const key = getKey(url, this.logger);
            const store = getStore(url, this.sthis, joinDBName).name;
            this.logger.Debug().Url(url).Str("key", key).Str("store", store).Msg("deleting");
            const tx = this._db.transaction([store], "readwrite");
            await tx.objectStore(store).delete(sanitzeKey(key));
            await tx.done;
            return Result.Ok(void 0);
          });
        }
      };
      IndexDBTestStore = class {
        constructor(sthis) {
          this.sthis = sthis;
          this.logger = ensureLogger(sthis, "IndexDBTestStore", {});
        }
        async get(url, key) {
          const ic = await connectIdb(url, this.sthis);
          const store = getStore(ic.url, this.sthis, joinDBName).name;
          this.logger.Debug().Str("key", key).Str("store", store).Msg("getting");
          let bytes = await ic.db.get(store, sanitzeKey(key));
          this.logger.Debug().Str("key", key).Str("store", store).Int("len", bytes.length).Msg("got");
          if (typeof bytes === "string") {
            bytes = this.sthis.txt.encode(bytes);
          }
          return bytes;
        }
      };
    }
  });

  // node_modules/.pnpm/charwise@3.0.1/node_modules/charwise/codec/number.js
  var require_number = __commonJS({
    "node_modules/.pnpm/charwise@3.0.1/node_modules/charwise/codec/number.js"(exports2) {
      "use strict";
      exports2.encode = function(number) {
        if (isNaN(number)) {
          return "DaN";
        }
        if (number === 0) {
          return "FE  0M0";
        }
        if (number === Infinity) {
          return "FF";
        }
        if (number === -Infinity) {
          return "DD";
        }
        var splitScientificNotation = number.toExponential().split("e");
        var exponent = Number(splitScientificNotation[1]) + 500;
        var mantissa = splitScientificNotation[0] + (splitScientificNotation[0].indexOf(".") === -1 ? "." : "") + "0".repeat(20);
        var encoded = "E" + padStart(String(exponent), 3) + "M" + String(mantissa);
        if (number > 0) {
          return "F" + encoded;
        } else {
          return "D" + flip(encoded);
        }
      };
      exports2.decode = function(encoded) {
        if (encoded === "DaN") {
          return NaN;
        }
        if (encoded === "FF") {
          return Infinity;
        }
        if (encoded === "DD") {
          return -Infinity;
        }
        var isNegative = encoded[0] === "D";
        var splitEncoded = (isNegative ? flip(encoded) : encoded).slice(2).split("M");
        return Number((isNegative ? "-" : "") + splitEncoded[1] + "e" + String(Number(splitEncoded[0]) - 500));
      };
      function flip(number) {
        var flipped = "";
        for (var i = 0; i < number.length; i++) {
          var digit = number[i];
          if (isNaN(Number(digit)) || digit === " ") {
            if (digit !== "-") {
              flipped += digit;
            }
          } else {
            flipped += String(9 - Number(digit));
          }
        }
        return flipped;
      }
      function padStart(str, count) {
        return " ".repeat(count - str.length).substr(0, count) + str;
      }
    }
  });

  // node_modules/.pnpm/charwise@3.0.1/node_modules/charwise/codec/object.js
  var require_object = __commonJS({
    "node_modules/.pnpm/charwise@3.0.1/node_modules/charwise/codec/object.js"(exports2) {
      "use strict";
      var dictEscape = { "?": "?@", "!": "??", '"': "?%" };
      function escape(str) {
        if (!/[!"]/.test(str)) {
          return str;
        }
        return str.replace(/[\?!"]/g, function(match) {
          return dictEscape[match];
        });
      }
      var dictUnescape = { "?@": "?", "??": "!", "?%": '"' };
      function unescape(str) {
        if (!/\?[%\?@]/.test(str)) {
          return str;
        }
        return str.replace(/\?[%\?@]/g, function(match) {
          return dictUnescape[match];
        });
      }
      exports2.factory = function(codec) {
        return {
          encode: encode18,
          decode: decode21
        };
        function encode18(array) {
          if (array === null) {
            return "A";
          }
          if (!Array.isArray(array)) {
            throw new Error("can only encode arrays");
          }
          var l = array.length;
          if (l == 0) {
            return "K!";
          }
          var s = encodeItem(array[0]);
          for (var i = 1; i < l; i++) {
            s += '"' + encodeItem(array[i]);
          }
          return "K" + s + "!";
        }
        function encodeItem(item) {
          if (typeof item === "object") {
            return encode18(item);
          }
          return escape(codec.encode(item));
        }
        function decode21(encoded) {
          if (encoded === "A") {
            return null;
          }
          if (encoded === "K!") {
            return [];
          }
          var items = encoded.split('"');
          var pointers = [[]];
          var array;
          var depth = 0;
          var l = items.length;
          for (var i = 0; i < l; i++) {
            var item = items[i];
            var itemLength = item.length;
            var open3 = 0;
            while (item[open3] == "K") {
              open3++;
            }
            var close9 = 0;
            while (item[itemLength - close9 - 1] == "!") {
              close9++;
            }
            var content = item.slice(open3, itemLength - close9);
            var newdepth = depth + open3;
            for (var j = depth; j < newdepth; j++) {
              pointers[j + 1] = [];
              pointers[j].push(pointers[j + 1]);
              depth = newdepth;
              array = pointers[depth];
            }
            if (content.length !== 0) {
              array.push(codec.decode(unescape(content)));
            }
            var newdepth = depth - close9;
            for (var j = newdepth; j < depth; j++) {
              pointers[j + 1] = [];
              depth = newdepth;
              array = pointers[depth];
            }
          }
          return pointers[0][0];
        }
      };
    }
  });

  // node_modules/.pnpm/charwise@3.0.1/node_modules/charwise/index.js
  var require_charwise = __commonJS({
    "node_modules/.pnpm/charwise@3.0.1/node_modules/charwise/index.js"(exports2) {
      "use strict";
      var number = require_number();
      var object = require_object();
      var flip = exports2.flip = function(n) {
        var s = n.toString();
        var f = "";
        for (var i in s) {
          f += s[i] == "." ? "." : 9 - +s[i];
        }
        return f;
      };
      exports2.number = number;
      exports2.string = {
        encode: function(s) {
          if (!/\x00|\x01/.test(s))
            return "J" + s;
          else {
            return "J" + s.replace(/\x01/g, "").replace(/\x00/g, "");
          }
        },
        decode: function(s) {
          if ("J" === s[0])
            return s.substring(1);
        }
      };
      exports2.encode = function(t) {
        return exports2[typeof t].encode(t);
      };
      exports2.decode = function(s) {
        if (s === "") return s;
        if (!decoders[s[0]])
          throw new Error("no decoder for:" + JSON.stringify(s));
        return decoders[s[0]](s);
      };
      exports2.object = object.factory(exports2);
      exports2.boolean = {
        encode: function(b) {
          return b ? "C" : "B";
        },
        decode: function(b) {
          return "C" === b;
        }
      };
      exports2.undefined = {
        encode: function(b) {
          return "L";
        },
        decode: function() {
          return void 0;
        }
      };
      var decoders = {
        A: exports2.object.decode,
        //null
        B: exports2.boolean.decode,
        // false
        C: exports2.boolean.decode,
        // true
        D: exports2.number.decode,
        // number
        F: exports2.number.decode,
        // number
        // G Date
        // H Date
        // I Buffer
        J: exports2.string.decode,
        // String
        K: exports2.object.decode,
        // Array
        L: exports2.undefined.decode
        // undefined
      };
      exports2.buffer = false;
      exports2.type = "charwise";
    }
  });

  // src/index.ts
  var src_exports5 = {};
  __export(src_exports5, {
    CRDT: () => CRDT,
    Database: () => Database,
    Index: () => Index,
    NotFoundError: () => NotFoundError,
    PACKAGE_VERSION: () => PACKAGE_VERSION,
    Result: () => Result,
    UInt8ArrayEqual: () => UInt8ArrayEqual,
    blockstore: () => blockstore_exports,
    bs: () => blockstore_exports,
    dataDir: () => dataDir,
    ensureLogger: () => ensureLogger,
    ensureSuperLog: () => ensureSuperLog,
    ensureSuperThis: () => ensureSuperThis,
    exceptionWrapper: () => exceptionWrapper,
    falsyToUndef: () => falsyToUndef,
    fireproof: () => fireproof,
    getKey: () => getKey,
    getName: () => getName,
    getStore: () => getStore,
    index: () => index,
    isFalsy: () => isFalsy,
    isNotFoundError: () => isNotFoundError,
    rt: () => runtime_exports,
    runtime: () => runtime_exports,
    throwFalsy: () => throwFalsy
  });

  // src/database.ts
  init_cement();

  // src/write-queue.ts
  function writeQueue(worker, payload = Infinity, unbounded = false) {
    const queue = [];
    let isProcessing = false;
    async function process() {
      if (isProcessing || queue.length === 0) return;
      isProcessing = true;
      const tasksToProcess = queue.splice(0, payload);
      const updates = tasksToProcess.map((item) => item.task);
      if (unbounded) {
        const promises = updates.map(async (update2, index2) => {
          try {
            const result = await worker([update2]);
            tasksToProcess[index2].resolve(result);
          } catch (error) {
            tasksToProcess[index2].reject(error);
          }
        });
        await Promise.all(promises);
      } else {
        try {
          const result = await worker(updates);
          tasksToProcess.forEach((task) => task.resolve(result));
        } catch (error) {
          tasksToProcess.forEach((task) => task.reject(error));
        }
      }
      isProcessing = false;
      void process();
    }
    return {
      push(task) {
        return new Promise((resolve7, reject) => {
          queue.push({ task, resolve: resolve7, reject });
          void process();
        });
      }
    };
  }

  // src/crdt.ts
  init_cement();

  // src/runtime/wait-pr-multiformats/block.ts
  var block_exports = {};
  __export(block_exports, {
    Block: () => Block2,
    create: () => create2,
    createUnsafe: () => createUnsafe,
    decode: () => decode6,
    encode: () => encode4
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/index.js
  init_bytes();

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base32.js
  var base32_exports = {};
  __export(base32_exports, {
    base32: () => base32,
    base32hex: () => base32hex,
    base32hexpad: () => base32hexpad,
    base32hexpadupper: () => base32hexpadupper,
    base32hexupper: () => base32hexupper,
    base32pad: () => base32pad,
    base32padupper: () => base32padupper,
    base32upper: () => base32upper,
    base32z: () => base32z
  });
  init_base();
  var base32 = rfc4648({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
  });
  var base32upper = rfc4648({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
  });
  var base32pad = rfc4648({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
  });
  var base32padupper = rfc4648({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
  });
  var base32hex = rfc4648({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
  });
  var base32hexupper = rfc4648({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
  });
  var base32hexpad = rfc4648({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
  });
  var base32hexpadupper = rfc4648({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
  });
  var base32z = rfc4648({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/cid.js
  init_base58();
  init_bytes();

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/hashes/digest.js
  init_bytes();

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/vendor/varint.js
  var encode_1 = encode2;
  var MSB = 128;
  var REST = 127;
  var MSBALL = ~REST;
  var INT = Math.pow(2, 31);
  function encode2(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while (num >= INT) {
      out[offset++] = num & 255 | MSB;
      num /= 128;
    }
    while (num & MSBALL) {
      out[offset++] = num & 255 | MSB;
      num >>>= 7;
    }
    out[offset] = num | 0;
    encode2.bytes = offset - oldOffset + 1;
    return out;
  }
  var decode2 = read;
  var MSB$1 = 128;
  var REST$1 = 127;
  function read(buf2, offset) {
    var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf2.length;
    do {
      if (counter >= l) {
        read.bytes = 0;
        throw new RangeError("Could not decode varint");
      }
      b = buf2[counter++];
      res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
      shift += 7;
    } while (b >= MSB$1);
    read.bytes = counter - offset;
    return res;
  }
  var N1 = Math.pow(2, 7);
  var N2 = Math.pow(2, 14);
  var N3 = Math.pow(2, 21);
  var N4 = Math.pow(2, 28);
  var N5 = Math.pow(2, 35);
  var N6 = Math.pow(2, 42);
  var N7 = Math.pow(2, 49);
  var N8 = Math.pow(2, 56);
  var N9 = Math.pow(2, 63);
  var length = function(value) {
    return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
  };
  var varint = {
    encode: encode_1,
    decode: decode2,
    encodingLength: length
  };
  var _brrp_varint = varint;
  var varint_default = _brrp_varint;

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/varint.js
  function decode3(data, offset = 0) {
    const code9 = varint_default.decode(data, offset);
    return [code9, varint_default.decode.bytes];
  }
  function encodeTo(int, target, offset = 0) {
    varint_default.encode(int, target, offset);
    return target;
  }
  function encodingLength(int) {
    return varint_default.encodingLength(int);
  }

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/hashes/digest.js
  function create(code9, digest3) {
    const size = digest3.byteLength;
    const sizeOffset = encodingLength(code9);
    const digestOffset = sizeOffset + encodingLength(size);
    const bytes = new Uint8Array(digestOffset + size);
    encodeTo(code9, bytes, 0);
    encodeTo(size, bytes, sizeOffset);
    bytes.set(digest3, digestOffset);
    return new Digest(code9, size, digest3, bytes);
  }
  function decode4(multihash) {
    const bytes = coerce(multihash);
    const [code9, sizeOffset] = decode3(bytes);
    const [size, digestOffset] = decode3(bytes.subarray(sizeOffset));
    const digest3 = bytes.subarray(sizeOffset + digestOffset);
    if (digest3.byteLength !== size) {
      throw new Error("Incorrect length");
    }
    return new Digest(code9, size, digest3, bytes);
  }
  function equals2(a, b) {
    if (a === b) {
      return true;
    } else {
      const data = b;
      return a.code === data.code && a.size === data.size && data.bytes instanceof Uint8Array && equals(a.bytes, data.bytes);
    }
  }
  var Digest = class {
    code;
    size;
    digest;
    bytes;
    /**
     * Creates a multihash digest.
     */
    constructor(code9, size, digest3, bytes) {
      this.code = code9;
      this.size = size;
      this.digest = digest3;
      this.bytes = bytes;
    }
  };

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/cid.js
  function format(link2, base4) {
    const { bytes, version } = link2;
    switch (version) {
      case 0:
        return toStringV0(bytes, baseCache(link2), base4 ?? base58btc.encoder);
      default:
        return toStringV1(bytes, baseCache(link2), base4 ?? base32.encoder);
    }
  }
  var cache = /* @__PURE__ */ new WeakMap();
  function baseCache(cid) {
    const baseCache3 = cache.get(cid);
    if (baseCache3 == null) {
      const baseCache4 = /* @__PURE__ */ new Map();
      cache.set(cid, baseCache4);
      return baseCache4;
    }
    return baseCache3;
  }
  var CID = class _CID {
    code;
    version;
    multihash;
    bytes;
    "/";
    /**
     * @param version - Version of the CID
     * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param multihash - (Multi)hash of the of the content.
     */
    constructor(version, code9, multihash, bytes) {
      this.code = code9;
      this.version = version;
      this.multihash = multihash;
      this.bytes = bytes;
      this["/"] = bytes;
    }
    /**
     * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
     * please either use `CID.asCID(cid)` or switch to new signalling mechanism
     *
     * @deprecated
     */
    get asCID() {
      return this;
    }
    // ArrayBufferView
    get byteOffset() {
      return this.bytes.byteOffset;
    }
    // ArrayBufferView
    get byteLength() {
      return this.bytes.byteLength;
    }
    toV0() {
      switch (this.version) {
        case 0: {
          return this;
        }
        case 1: {
          const { code: code9, multihash } = this;
          if (code9 !== DAG_PB_CODE) {
            throw new Error("Cannot convert a non dag-pb CID to CIDv0");
          }
          if (multihash.code !== SHA_256_CODE) {
            throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
          }
          return _CID.createV0(multihash);
        }
        default: {
          throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
        }
      }
    }
    toV1() {
      switch (this.version) {
        case 0: {
          const { code: code9, digest: digest3 } = this.multihash;
          const multihash = create(code9, digest3);
          return _CID.createV1(this.code, multihash);
        }
        case 1: {
          return this;
        }
        default: {
          throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
        }
      }
    }
    equals(other) {
      return _CID.equals(this, other);
    }
    static equals(self2, other) {
      const unknown = other;
      return unknown != null && self2.code === unknown.code && self2.version === unknown.version && equals2(self2.multihash, unknown.multihash);
    }
    toString(base4) {
      return format(this, base4);
    }
    toJSON() {
      return { "/": format(this) };
    }
    link() {
      return this;
    }
    [Symbol.toStringTag] = "CID";
    // Legacy
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return `CID(${this.toString()})`;
    }
    /**
     * Takes any input `value` and returns a `CID` instance if it was
     * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
     * it will return value back. If `value` is not instance of this CID
     * class, but is compatible CID it will return new instance of this
     * `CID` class. Otherwise returns null.
     *
     * This allows two different incompatible versions of CID library to
     * co-exist and interop as long as binary interface is compatible.
     */
    static asCID(input) {
      if (input == null) {
        return null;
      }
      const value = input;
      if (value instanceof _CID) {
        return value;
      } else if (value["/"] != null && value["/"] === value.bytes || value.asCID === value) {
        const { version, code: code9, multihash, bytes } = value;
        return new _CID(version, code9, multihash, bytes ?? encodeCID(version, code9, multihash.bytes));
      } else if (value[cidSymbol] === true) {
        const { version, multihash, code: code9 } = value;
        const digest3 = decode4(multihash);
        return _CID.create(version, code9, digest3);
      } else {
        return null;
      }
    }
    /**
     * @param version - Version of the CID
     * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param digest - (Multi)hash of the of the content.
     */
    static create(version, code9, digest3) {
      if (typeof code9 !== "number") {
        throw new Error("String codecs are no longer supported");
      }
      if (!(digest3.bytes instanceof Uint8Array)) {
        throw new Error("Invalid digest");
      }
      switch (version) {
        case 0: {
          if (code9 !== DAG_PB_CODE) {
            throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
          } else {
            return new _CID(version, code9, digest3, digest3.bytes);
          }
        }
        case 1: {
          const bytes = encodeCID(version, code9, digest3.bytes);
          return new _CID(version, code9, digest3, bytes);
        }
        default: {
          throw new Error("Invalid version");
        }
      }
    }
    /**
     * Simplified version of `create` for CIDv0.
     */
    static createV0(digest3) {
      return _CID.create(0, DAG_PB_CODE, digest3);
    }
    /**
     * Simplified version of `create` for CIDv1.
     *
     * @param code - Content encoding format code.
     * @param digest - Multihash of the content.
     */
    static createV1(code9, digest3) {
      return _CID.create(1, code9, digest3);
    }
    /**
     * Decoded a CID from its binary representation. The byte array must contain
     * only the CID with no additional bytes.
     *
     * An error will be thrown if the bytes provided do not contain a valid
     * binary representation of a CID.
     */
    static decode(bytes) {
      const [cid, remainder] = _CID.decodeFirst(bytes);
      if (remainder.length !== 0) {
        throw new Error("Incorrect length");
      }
      return cid;
    }
    /**
     * Decoded a CID from its binary representation at the beginning of a byte
     * array.
     *
     * Returns an array with the first element containing the CID and the second
     * element containing the remainder of the original byte array. The remainder
     * will be a zero-length byte array if the provided bytes only contained a
     * binary CID representation.
     */
    static decodeFirst(bytes) {
      const specs = _CID.inspectBytes(bytes);
      const prefixSize = specs.size - specs.multihashSize;
      const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
      if (multihashBytes.byteLength !== specs.multihashSize) {
        throw new Error("Incorrect length");
      }
      const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
      const digest3 = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
      const cid = specs.version === 0 ? _CID.createV0(digest3) : _CID.createV1(specs.codec, digest3);
      return [cid, bytes.subarray(specs.size)];
    }
    /**
     * Inspect the initial bytes of a CID to determine its properties.
     *
     * Involves decoding up to 4 varints. Typically this will require only 4 to 6
     * bytes but for larger multicodec code values and larger multihash digest
     * lengths these varints can be quite large. It is recommended that at least
     * 10 bytes be made available in the `initialBytes` argument for a complete
     * inspection.
     */
    static inspectBytes(initialBytes) {
      let offset = 0;
      const next = () => {
        const [i, length4] = decode3(initialBytes.subarray(offset));
        offset += length4;
        return i;
      };
      let version = next();
      let codec = DAG_PB_CODE;
      if (version === 18) {
        version = 0;
        offset = 0;
      } else {
        codec = next();
      }
      if (version !== 0 && version !== 1) {
        throw new RangeError(`Invalid CID version ${version}`);
      }
      const prefixSize = offset;
      const multihashCode = next();
      const digestSize = next();
      const size = offset + digestSize;
      const multihashSize = size - prefixSize;
      return { version, codec, multihashCode, digestSize, multihashSize, size };
    }
    /**
     * Takes cid in a string representation and creates an instance. If `base`
     * decoder is not provided will use a default from the configuration. It will
     * throw an error if encoding of the CID is not compatible with supplied (or
     * a default decoder).
     */
    static parse(source, base4) {
      const [prefix, bytes] = parseCIDtoBytes(source, base4);
      const cid = _CID.decode(bytes);
      if (cid.version === 0 && source[0] !== "Q") {
        throw Error("Version 0 CID string must not include multibase prefix");
      }
      baseCache(cid).set(prefix, source);
      return cid;
    }
  };
  function parseCIDtoBytes(source, base4) {
    switch (source[0]) {
      // CIDv0 is parsed differently
      case "Q": {
        const decoder2 = base4 ?? base58btc;
        return [
          base58btc.prefix,
          decoder2.decode(`${base58btc.prefix}${source}`)
        ];
      }
      case base58btc.prefix: {
        const decoder2 = base4 ?? base58btc;
        return [base58btc.prefix, decoder2.decode(source)];
      }
      case base32.prefix: {
        const decoder2 = base4 ?? base32;
        return [base32.prefix, decoder2.decode(source)];
      }
      default: {
        if (base4 == null) {
          throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
        }
        return [source[0], base4.decode(source)];
      }
    }
  }
  function toStringV0(bytes, cache3, base4) {
    const { prefix } = base4;
    if (prefix !== base58btc.prefix) {
      throw Error(`Cannot string encode V0 in ${base4.name} encoding`);
    }
    const cid = cache3.get(prefix);
    if (cid == null) {
      const cid2 = base4.encode(bytes).slice(1);
      cache3.set(prefix, cid2);
      return cid2;
    } else {
      return cid;
    }
  }
  function toStringV1(bytes, cache3, base4) {
    const { prefix } = base4;
    const cid = cache3.get(prefix);
    if (cid == null) {
      const cid2 = base4.encode(bytes);
      cache3.set(prefix, cid2);
      return cid2;
    } else {
      return cid;
    }
  }
  var DAG_PB_CODE = 112;
  var SHA_256_CODE = 18;
  function encodeCID(version, code9, multihash) {
    const codeOffset = encodingLength(version);
    const hashOffset = codeOffset + encodingLength(code9);
    const bytes = new Uint8Array(hashOffset + multihash.byteLength);
    encodeTo(version, bytes, 0);
    encodeTo(code9, bytes, codeOffset);
    bytes.set(multihash, hashOffset);
    return bytes;
  }
  var cidSymbol = Symbol.for("@ipld/js-cid/CID");

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/hashes/hasher.js
  function from3({ name: name7, code: code9, encode: encode18 }) {
    return new Hasher(name7, code9, encode18);
  }
  var Hasher = class {
    name;
    code;
    encode;
    constructor(name7, code9, encode18) {
      this.name = name7;
      this.code = code9;
      this.encode = encode18;
    }
    digest(input) {
      if (input instanceof Uint8Array) {
        const result = this.encode(input);
        return result instanceof Uint8Array ? create(this.code, result) : result.then((digest3) => create(this.code, digest3));
      } else {
        throw Error("Unknown type, must be binary type");
      }
    }
  };

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/block.js
  function readonly({ enumerable = true, configurable = false } = {}) {
    return { enumerable, configurable, writable: false };
  }
  function* linksWithin(path, value) {
    if (value != null && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const [index2, element] of value.entries()) {
          const elementPath = [...path, index2];
          const cid = CID.asCID(element);
          if (cid != null) {
            yield [elementPath.join("/"), cid];
          } else if (typeof element === "object") {
            yield* links(element, elementPath);
          }
        }
      } else {
        const cid = CID.asCID(value);
        if (cid != null) {
          yield [path.join("/"), cid];
        } else {
          yield* links(value, path);
        }
      }
    }
  }
  function* links(source, base4) {
    if (source == null || source instanceof Uint8Array) {
      return;
    }
    const cid = CID.asCID(source);
    if (cid != null) {
      yield [base4.join("/"), cid];
    }
    for (const [key, value] of Object.entries(source)) {
      const path = [...base4, key];
      yield* linksWithin(path, value);
    }
  }
  function* treeWithin(path, value) {
    if (Array.isArray(value)) {
      for (const [index2, element] of value.entries()) {
        const elementPath = [...path, index2];
        yield elementPath.join("/");
        if (typeof element === "object" && CID.asCID(element) == null) {
          yield* tree(element, elementPath);
        }
      }
    } else {
      yield* tree(value, path);
    }
  }
  function* tree(source, base4) {
    if (source == null || typeof source !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(source)) {
      const path = [...base4, key];
      yield path.join("/");
      if (value != null && !(value instanceof Uint8Array) && typeof value === "object" && CID.asCID(value) == null) {
        yield* treeWithin(path, value);
      }
    }
  }
  function get(source, path) {
    let node = source;
    for (const [index2, key] of path.entries()) {
      node = node[key];
      if (node == null) {
        throw new Error(`Object has no property at ${path.slice(0, index2 + 1).map((part) => `[${JSON.stringify(part)}]`).join("")}`);
      }
      const cid = CID.asCID(node);
      if (cid != null) {
        return { value: cid, remaining: path.slice(index2 + 1).join("/") };
      }
    }
    return { value: node };
  }
  var Block = class {
    cid;
    bytes;
    value;
    asBlock;
    constructor({ cid, bytes, value }) {
      if (cid == null || bytes == null || typeof value === "undefined") {
        throw new Error("Missing required argument");
      }
      this.cid = cid;
      this.bytes = bytes;
      this.value = value;
      this.asBlock = this;
      Object.defineProperties(this, {
        cid: readonly(),
        bytes: readonly(),
        value: readonly(),
        asBlock: readonly()
      });
    }
    links() {
      return links(this.value, []);
    }
    tree() {
      return tree(this.value, []);
    }
    get(path = "/") {
      return get(this.value, path.split("/").filter(Boolean));
    }
  };
  async function encode3({ value, codec, hasher }) {
    if (typeof value === "undefined")
      throw new Error('Missing required argument "value"');
    if (codec == null || hasher == null)
      throw new Error("Missing required argument: codec or hasher");
    const bytes = codec.encode(value);
    const hash2 = await hasher.digest(bytes);
    const cid = CID.create(1, codec.code, hash2);
    return new Block({ value, bytes, cid });
  }
  async function decode5({ bytes, codec, hasher }) {
    if (bytes == null)
      throw new Error('Missing required argument "bytes"');
    if (codec == null || hasher == null)
      throw new Error("Missing required argument: codec or hasher");
    const value = codec.decode(bytes);
    const hash2 = await hasher.digest(bytes);
    const cid = CID.create(1, codec.code, hash2);
    return new Block({ value, bytes, cid });
  }

  // src/runtime/wait-pr-multiformats/block.ts
  var Block2 = Block;
  async function decode6({
    bytes,
    codec,
    hasher
  }) {
    if (bytes == null) throw new Error('Missing required argument "bytes"');
    if (codec == null || hasher == null) throw new Error("Missing required argument: codec or hasher");
    const value = await Promise.resolve(codec.decode(bytes));
    const hash2 = await hasher.digest(bytes);
    const cid = CID.create(1, codec.code, hash2);
    return new Block({ value, bytes, cid });
  }
  async function encode4({
    value,
    codec,
    hasher
  }) {
    if (typeof value === "undefined") throw new Error('Missing required argument "value"');
    if (codec == null || hasher == null) throw new Error("Missing required argument: codec or hasher");
    const bytes = await Promise.resolve(codec.encode(value));
    const hash2 = await hasher.digest(bytes);
    const cid = CID.create(1, codec.code, hash2);
    return new Block({ value, bytes, cid });
  }
  async function create2({
    bytes,
    cid,
    hasher,
    codec
  }) {
    if (bytes == null) throw new Error('Missing required argument "bytes"');
    if (hasher == null) throw new Error('Missing required argument "hasher"');
    const value = await Promise.resolve(codec.decode(bytes));
    const hash2 = await hasher.digest(bytes);
    if (!bytes_exports.equals(cid.multihash.bytes, hash2.bytes)) {
      throw new Error("CID hash does not match bytes");
    }
    return createUnsafe({
      bytes,
      cid,
      value,
      codec
    });
  }
  async function createUnsafe({
    bytes,
    cid,
    value: maybeValue,
    codec
  }) {
    const value = await Promise.resolve(maybeValue !== void 0 ? maybeValue : codec?.decode(bytes));
    if (value === void 0) throw new Error('Missing required argument, must either provide "value" or "codec"');
    return new Block2({
      cid,
      bytes,
      value
    });
  }

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/link.js
  function isLink(value) {
    if (value == null) {
      return false;
    }
    const withSlash = value;
    if (withSlash["/"] != null && withSlash["/"] === withSlash.bytes) {
      return true;
    }
    const withAsCID = value;
    if (withAsCID.asCID === value) {
      return true;
    }
    return false;
  }
  function parse(source, base4) {
    return CID.parse(source, base4);
  }

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/hashes/sha2-browser.js
  var sha2_browser_exports = {};
  __export(sha2_browser_exports, {
    sha256: () => sha256,
    sha512: () => sha512
  });
  function sha(name7) {
    return async (data) => new Uint8Array(await crypto.subtle.digest(name7, data));
  }
  var sha256 = from3({
    name: "sha2-256",
    code: 18,
    encode: sha("SHA-256")
  });
  var sha512 = from3({
    name: "sha2-512",
    code: 19,
    encode: sha("SHA-512")
  });

  // node_modules/.pnpm/@ipld+dag-cbor@9.2.1/node_modules/@ipld/dag-cbor/src/index.js
  var src_exports = {};
  __export(src_exports, {
    code: () => code,
    decode: () => decode8,
    decodeOptions: () => decodeOptions,
    encode: () => encode6,
    encodeOptions: () => encodeOptions,
    name: () => name,
    toByteView: () => toByteView
  });

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/is.js
  var typeofs = [
    "string",
    "number",
    "bigint",
    "symbol"
  ];
  var objectTypeNames = [
    "Function",
    "Generator",
    "AsyncGenerator",
    "GeneratorFunction",
    "AsyncGeneratorFunction",
    "AsyncFunction",
    "Observable",
    "Array",
    "Buffer",
    "Object",
    "RegExp",
    "Date",
    "Error",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "ArrayBuffer",
    "SharedArrayBuffer",
    "DataView",
    "Promise",
    "URL",
    "HTMLElement",
    "Int8Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Int16Array",
    "Uint16Array",
    "Int32Array",
    "Uint32Array",
    "Float32Array",
    "Float64Array",
    "BigInt64Array",
    "BigUint64Array"
  ];
  function is(value) {
    if (value === null) {
      return "null";
    }
    if (value === void 0) {
      return "undefined";
    }
    if (value === true || value === false) {
      return "boolean";
    }
    const typeOf = typeof value;
    if (typeofs.includes(typeOf)) {
      return typeOf;
    }
    if (typeOf === "function") {
      return "Function";
    }
    if (Array.isArray(value)) {
      return "Array";
    }
    if (isBuffer(value)) {
      return "Buffer";
    }
    const objectType = getObjectType(value);
    if (objectType) {
      return objectType;
    }
    return "Object";
  }
  function isBuffer(value) {
    return value && value.constructor && value.constructor.isBuffer && value.constructor.isBuffer.call(null, value);
  }
  function getObjectType(value) {
    const objectTypeName = Object.prototype.toString.call(value).slice(8, -1);
    if (objectTypeNames.includes(objectTypeName)) {
      return objectTypeName;
    }
    return void 0;
  }

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/token.js
  var Type = class {
    /**
     * @param {number} major
     * @param {string} name
     * @param {boolean} terminal
     */
    constructor(major, name7, terminal) {
      this.major = major;
      this.majorEncoded = major << 5;
      this.name = name7;
      this.terminal = terminal;
    }
    /* c8 ignore next 3 */
    toString() {
      return `Type[${this.major}].${this.name}`;
    }
    /**
     * @param {Type} typ
     * @returns {number}
     */
    compare(typ) {
      return this.major < typ.major ? -1 : this.major > typ.major ? 1 : 0;
    }
  };
  Type.uint = new Type(0, "uint", true);
  Type.negint = new Type(1, "negint", true);
  Type.bytes = new Type(2, "bytes", true);
  Type.string = new Type(3, "string", true);
  Type.array = new Type(4, "array", false);
  Type.map = new Type(5, "map", false);
  Type.tag = new Type(6, "tag", false);
  Type.float = new Type(7, "float", true);
  Type.false = new Type(7, "false", true);
  Type.true = new Type(7, "true", true);
  Type.null = new Type(7, "null", true);
  Type.undefined = new Type(7, "undefined", true);
  Type.break = new Type(7, "break", true);
  var Token = class {
    /**
     * @param {Type} type
     * @param {any} [value]
     * @param {number} [encodedLength]
     */
    constructor(type2, value, encodedLength) {
      this.type = type2;
      this.value = value;
      this.encodedLength = encodedLength;
      this.encodedBytes = void 0;
      this.byteValue = void 0;
    }
    /* c8 ignore next 3 */
    toString() {
      return `Token[${this.type}].${this.value}`;
    }
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/byte-utils.js
  var useBuffer = globalThis.process && // @ts-ignore
  !globalThis.process.browser && // @ts-ignore
  globalThis.Buffer && // @ts-ignore
  typeof globalThis.Buffer.isBuffer === "function";
  var textDecoder = new TextDecoder();
  var textEncoder = new TextEncoder();
  function isBuffer2(buf2) {
    return useBuffer && globalThis.Buffer.isBuffer(buf2);
  }
  function asU8A(buf2) {
    if (!(buf2 instanceof Uint8Array)) {
      return Uint8Array.from(buf2);
    }
    return isBuffer2(buf2) ? new Uint8Array(buf2.buffer, buf2.byteOffset, buf2.byteLength) : buf2;
  }
  var toString2 = useBuffer ? (
    // eslint-disable-line operator-linebreak
    /**
     * @param {Uint8Array} bytes
     * @param {number} start
     * @param {number} end
     */
    (bytes, start, end) => {
      return end - start > 64 ? (
        // eslint-disable-line operator-linebreak
        // @ts-ignore
        globalThis.Buffer.from(bytes.subarray(start, end)).toString("utf8")
      ) : utf8Slice(bytes, start, end);
    }
  ) : (
    // eslint-disable-line operator-linebreak
    /**
     * @param {Uint8Array} bytes
     * @param {number} start
     * @param {number} end
     */
    (bytes, start, end) => {
      return end - start > 64 ? textDecoder.decode(bytes.subarray(start, end)) : utf8Slice(bytes, start, end);
    }
  );
  var fromString2 = useBuffer ? (
    // eslint-disable-line operator-linebreak
    /**
     * @param {string} string
     */
    (string3) => {
      return string3.length > 64 ? (
        // eslint-disable-line operator-linebreak
        // @ts-ignore
        globalThis.Buffer.from(string3)
      ) : utf8ToBytes(string3);
    }
  ) : (
    // eslint-disable-line operator-linebreak
    /**
     * @param {string} string
     */
    (string3) => {
      return string3.length > 64 ? textEncoder.encode(string3) : utf8ToBytes(string3);
    }
  );
  var fromArray = (arr) => {
    return Uint8Array.from(arr);
  };
  var slice = useBuffer ? (
    // eslint-disable-line operator-linebreak
    /**
     * @param {Uint8Array} bytes
     * @param {number} start
     * @param {number} end
     */
    (bytes, start, end) => {
      if (isBuffer2(bytes)) {
        return new Uint8Array(bytes.subarray(start, end));
      }
      return bytes.slice(start, end);
    }
  ) : (
    // eslint-disable-line operator-linebreak
    /**
     * @param {Uint8Array} bytes
     * @param {number} start
     * @param {number} end
     */
    (bytes, start, end) => {
      return bytes.slice(start, end);
    }
  );
  var concat = useBuffer ? (
    // eslint-disable-line operator-linebreak
    /**
     * @param {Uint8Array[]} chunks
     * @param {number} length
     * @returns {Uint8Array}
     */
    (chunks, length4) => {
      chunks = chunks.map((c) => c instanceof Uint8Array ? c : (
        // eslint-disable-line operator-linebreak
        // @ts-ignore
        globalThis.Buffer.from(c)
      ));
      return asU8A(globalThis.Buffer.concat(chunks, length4));
    }
  ) : (
    // eslint-disable-line operator-linebreak
    /**
     * @param {Uint8Array[]} chunks
     * @param {number} length
     * @returns {Uint8Array}
     */
    (chunks, length4) => {
      const out = new Uint8Array(length4);
      let off = 0;
      for (let b of chunks) {
        if (off + b.length > out.length) {
          b = b.subarray(0, out.length - off);
        }
        out.set(b, off);
        off += b.length;
      }
      return out;
    }
  );
  var alloc = useBuffer ? (
    // eslint-disable-line operator-linebreak
    /**
     * @param {number} size
     * @returns {Uint8Array}
     */
    (size) => {
      return globalThis.Buffer.allocUnsafe(size);
    }
  ) : (
    // eslint-disable-line operator-linebreak
    /**
     * @param {number} size
     * @returns {Uint8Array}
     */
    (size) => {
      return new Uint8Array(size);
    }
  );
  function compare(b1, b2) {
    if (isBuffer2(b1) && isBuffer2(b2)) {
      return b1.compare(b2);
    }
    for (let i = 0; i < b1.length; i++) {
      if (b1[i] === b2[i]) {
        continue;
      }
      return b1[i] < b2[i] ? -1 : 1;
    }
    return 0;
  }
  function utf8ToBytes(str) {
    const out = [];
    let p = 0;
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 128) {
        out[p++] = c;
      } else if (c < 2048) {
        out[p++] = c >> 6 | 192;
        out[p++] = c & 63 | 128;
      } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
        c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
        out[p++] = c >> 18 | 240;
        out[p++] = c >> 12 & 63 | 128;
        out[p++] = c >> 6 & 63 | 128;
        out[p++] = c & 63 | 128;
      } else {
        out[p++] = c >> 12 | 224;
        out[p++] = c >> 6 & 63 | 128;
        out[p++] = c & 63 | 128;
      }
    }
    return out;
  }
  function utf8Slice(buf2, offset, end) {
    const res = [];
    while (offset < end) {
      const firstByte = buf2[offset];
      let codePoint = null;
      let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (offset + bytesPerSequence <= end) {
        let secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf2[offset + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf2[offset + 1];
            thirdByte = buf2[offset + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf2[offset + 1];
            thirdByte = buf2[offset + 2];
            fourthByte = buf2[offset + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      offset += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  var MAX_ARGUMENTS_LENGTH = 4096;
  function decodeCodePointsArray(codePoints) {
    const len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    let res = "";
    let i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res;
  }

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/bl.js
  var defaultChunkSize = 256;
  var Bl = class {
    /**
     * @param {number} [chunkSize]
     */
    constructor(chunkSize = defaultChunkSize) {
      this.chunkSize = chunkSize;
      this.cursor = 0;
      this.maxCursor = -1;
      this.chunks = [];
      this._initReuseChunk = null;
    }
    reset() {
      this.cursor = 0;
      this.maxCursor = -1;
      if (this.chunks.length) {
        this.chunks = [];
      }
      if (this._initReuseChunk !== null) {
        this.chunks.push(this._initReuseChunk);
        this.maxCursor = this._initReuseChunk.length - 1;
      }
    }
    /**
     * @param {Uint8Array|number[]} bytes
     */
    push(bytes) {
      let topChunk = this.chunks[this.chunks.length - 1];
      const newMax = this.cursor + bytes.length;
      if (newMax <= this.maxCursor + 1) {
        const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
        topChunk.set(bytes, chunkPos);
      } else {
        if (topChunk) {
          const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
          if (chunkPos < topChunk.length) {
            this.chunks[this.chunks.length - 1] = topChunk.subarray(0, chunkPos);
            this.maxCursor = this.cursor - 1;
          }
        }
        if (bytes.length < 64 && bytes.length < this.chunkSize) {
          topChunk = alloc(this.chunkSize);
          this.chunks.push(topChunk);
          this.maxCursor += topChunk.length;
          if (this._initReuseChunk === null) {
            this._initReuseChunk = topChunk;
          }
          topChunk.set(bytes, 0);
        } else {
          this.chunks.push(bytes);
          this.maxCursor += bytes.length;
        }
      }
      this.cursor += bytes.length;
    }
    /**
     * @param {boolean} [reset]
     * @returns {Uint8Array}
     */
    toBytes(reset = false) {
      let byts;
      if (this.chunks.length === 1) {
        const chunk = this.chunks[0];
        if (reset && this.cursor > chunk.length / 2) {
          byts = this.cursor === chunk.length ? chunk : chunk.subarray(0, this.cursor);
          this._initReuseChunk = null;
          this.chunks = [];
        } else {
          byts = slice(chunk, 0, this.cursor);
        }
      } else {
        byts = concat(this.chunks, this.cursor);
      }
      if (reset) {
        this.reset();
      }
      return byts;
    }
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/common.js
  var decodeErrPrefix = "CBOR decode error:";
  var encodeErrPrefix = "CBOR encode error:";
  var uintMinorPrefixBytes = [];
  uintMinorPrefixBytes[23] = 1;
  uintMinorPrefixBytes[24] = 2;
  uintMinorPrefixBytes[25] = 3;
  uintMinorPrefixBytes[26] = 5;
  uintMinorPrefixBytes[27] = 9;
  function assertEnoughData(data, pos, need) {
    if (data.length - pos < need) {
      throw new Error(`${decodeErrPrefix} not enough data for type`);
    }
  }

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/0uint.js
  var uintBoundaries = [24, 256, 65536, 4294967296, BigInt("18446744073709551616")];
  function readUint8(data, offset, options) {
    assertEnoughData(data, offset, 1);
    const value = data[offset];
    if (options.strict === true && value < uintBoundaries[0]) {
      throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    return value;
  }
  function readUint16(data, offset, options) {
    assertEnoughData(data, offset, 2);
    const value = data[offset] << 8 | data[offset + 1];
    if (options.strict === true && value < uintBoundaries[1]) {
      throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    return value;
  }
  function readUint32(data, offset, options) {
    assertEnoughData(data, offset, 4);
    const value = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
    if (options.strict === true && value < uintBoundaries[2]) {
      throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    return value;
  }
  function readUint64(data, offset, options) {
    assertEnoughData(data, offset, 8);
    const hi = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
    const lo = data[offset + 4] * 16777216 + (data[offset + 5] << 16) + (data[offset + 6] << 8) + data[offset + 7];
    const value = (BigInt(hi) << BigInt(32)) + BigInt(lo);
    if (options.strict === true && value < uintBoundaries[3]) {
      throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    if (value <= Number.MAX_SAFE_INTEGER) {
      return Number(value);
    }
    if (options.allowBigInt === true) {
      return value;
    }
    throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
  }
  function decodeUint8(data, pos, _minor, options) {
    return new Token(Type.uint, readUint8(data, pos + 1, options), 2);
  }
  function decodeUint16(data, pos, _minor, options) {
    return new Token(Type.uint, readUint16(data, pos + 1, options), 3);
  }
  function decodeUint32(data, pos, _minor, options) {
    return new Token(Type.uint, readUint32(data, pos + 1, options), 5);
  }
  function decodeUint64(data, pos, _minor, options) {
    return new Token(Type.uint, readUint64(data, pos + 1, options), 9);
  }
  function encodeUint(buf2, token) {
    return encodeUintValue(buf2, 0, token.value);
  }
  function encodeUintValue(buf2, major, uint) {
    if (uint < uintBoundaries[0]) {
      const nuint = Number(uint);
      buf2.push([major | nuint]);
    } else if (uint < uintBoundaries[1]) {
      const nuint = Number(uint);
      buf2.push([major | 24, nuint]);
    } else if (uint < uintBoundaries[2]) {
      const nuint = Number(uint);
      buf2.push([major | 25, nuint >>> 8, nuint & 255]);
    } else if (uint < uintBoundaries[3]) {
      const nuint = Number(uint);
      buf2.push([major | 26, nuint >>> 24 & 255, nuint >>> 16 & 255, nuint >>> 8 & 255, nuint & 255]);
    } else {
      const buint = BigInt(uint);
      if (buint < uintBoundaries[4]) {
        const set3 = [major | 27, 0, 0, 0, 0, 0, 0, 0];
        let lo = Number(buint & BigInt(4294967295));
        let hi = Number(buint >> BigInt(32) & BigInt(4294967295));
        set3[8] = lo & 255;
        lo = lo >> 8;
        set3[7] = lo & 255;
        lo = lo >> 8;
        set3[6] = lo & 255;
        lo = lo >> 8;
        set3[5] = lo & 255;
        set3[4] = hi & 255;
        hi = hi >> 8;
        set3[3] = hi & 255;
        hi = hi >> 8;
        set3[2] = hi & 255;
        hi = hi >> 8;
        set3[1] = hi & 255;
        buf2.push(set3);
      } else {
        throw new Error(`${decodeErrPrefix} encountered BigInt larger than allowable range`);
      }
    }
  }
  encodeUint.encodedSize = function encodedSize(token) {
    return encodeUintValue.encodedSize(token.value);
  };
  encodeUintValue.encodedSize = function encodedSize2(uint) {
    if (uint < uintBoundaries[0]) {
      return 1;
    }
    if (uint < uintBoundaries[1]) {
      return 2;
    }
    if (uint < uintBoundaries[2]) {
      return 3;
    }
    if (uint < uintBoundaries[3]) {
      return 5;
    }
    return 9;
  };
  encodeUint.compareTokens = function compareTokens(tok1, tok2) {
    return tok1.value < tok2.value ? -1 : tok1.value > tok2.value ? 1 : (
      /* c8 ignore next */
      0
    );
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/1negint.js
  function decodeNegint8(data, pos, _minor, options) {
    return new Token(Type.negint, -1 - readUint8(data, pos + 1, options), 2);
  }
  function decodeNegint16(data, pos, _minor, options) {
    return new Token(Type.negint, -1 - readUint16(data, pos + 1, options), 3);
  }
  function decodeNegint32(data, pos, _minor, options) {
    return new Token(Type.negint, -1 - readUint32(data, pos + 1, options), 5);
  }
  var neg1b = BigInt(-1);
  var pos1b = BigInt(1);
  function decodeNegint64(data, pos, _minor, options) {
    const int = readUint64(data, pos + 1, options);
    if (typeof int !== "bigint") {
      const value = -1 - int;
      if (value >= Number.MIN_SAFE_INTEGER) {
        return new Token(Type.negint, value, 9);
      }
    }
    if (options.allowBigInt !== true) {
      throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
    }
    return new Token(Type.negint, neg1b - BigInt(int), 9);
  }
  function encodeNegint(buf2, token) {
    const negint = token.value;
    const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
    encodeUintValue(buf2, token.type.majorEncoded, unsigned);
  }
  encodeNegint.encodedSize = function encodedSize3(token) {
    const negint = token.value;
    const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
    if (unsigned < uintBoundaries[0]) {
      return 1;
    }
    if (unsigned < uintBoundaries[1]) {
      return 2;
    }
    if (unsigned < uintBoundaries[2]) {
      return 3;
    }
    if (unsigned < uintBoundaries[3]) {
      return 5;
    }
    return 9;
  };
  encodeNegint.compareTokens = function compareTokens2(tok1, tok2) {
    return tok1.value < tok2.value ? 1 : tok1.value > tok2.value ? -1 : (
      /* c8 ignore next */
      0
    );
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/2bytes.js
  function toToken(data, pos, prefix, length4) {
    assertEnoughData(data, pos, prefix + length4);
    const buf2 = slice(data, pos + prefix, pos + prefix + length4);
    return new Token(Type.bytes, buf2, prefix + length4);
  }
  function decodeBytesCompact(data, pos, minor, _options) {
    return toToken(data, pos, 1, minor);
  }
  function decodeBytes8(data, pos, _minor, options) {
    return toToken(data, pos, 2, readUint8(data, pos + 1, options));
  }
  function decodeBytes16(data, pos, _minor, options) {
    return toToken(data, pos, 3, readUint16(data, pos + 1, options));
  }
  function decodeBytes32(data, pos, _minor, options) {
    return toToken(data, pos, 5, readUint32(data, pos + 1, options));
  }
  function decodeBytes64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
      throw new Error(`${decodeErrPrefix} 64-bit integer bytes lengths not supported`);
    }
    return toToken(data, pos, 9, l);
  }
  function tokenBytes(token) {
    if (token.encodedBytes === void 0) {
      token.encodedBytes = token.type === Type.string ? fromString2(token.value) : token.value;
    }
    return token.encodedBytes;
  }
  function encodeBytes(buf2, token) {
    const bytes = tokenBytes(token);
    encodeUintValue(buf2, token.type.majorEncoded, bytes.length);
    buf2.push(bytes);
  }
  encodeBytes.encodedSize = function encodedSize4(token) {
    const bytes = tokenBytes(token);
    return encodeUintValue.encodedSize(bytes.length) + bytes.length;
  };
  encodeBytes.compareTokens = function compareTokens3(tok1, tok2) {
    return compareBytes(tokenBytes(tok1), tokenBytes(tok2));
  };
  function compareBytes(b1, b2) {
    return b1.length < b2.length ? -1 : b1.length > b2.length ? 1 : compare(b1, b2);
  }

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/3string.js
  function toToken2(data, pos, prefix, length4, options) {
    const totLength = prefix + length4;
    assertEnoughData(data, pos, totLength);
    const tok = new Token(Type.string, toString2(data, pos + prefix, pos + totLength), totLength);
    if (options.retainStringBytes === true) {
      tok.byteValue = slice(data, pos + prefix, pos + totLength);
    }
    return tok;
  }
  function decodeStringCompact(data, pos, minor, options) {
    return toToken2(data, pos, 1, minor, options);
  }
  function decodeString8(data, pos, _minor, options) {
    return toToken2(data, pos, 2, readUint8(data, pos + 1, options), options);
  }
  function decodeString16(data, pos, _minor, options) {
    return toToken2(data, pos, 3, readUint16(data, pos + 1, options), options);
  }
  function decodeString32(data, pos, _minor, options) {
    return toToken2(data, pos, 5, readUint32(data, pos + 1, options), options);
  }
  function decodeString64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
      throw new Error(`${decodeErrPrefix} 64-bit integer string lengths not supported`);
    }
    return toToken2(data, pos, 9, l, options);
  }
  var encodeString = encodeBytes;

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/4array.js
  function toToken3(_data, _pos, prefix, length4) {
    return new Token(Type.array, length4, prefix);
  }
  function decodeArrayCompact(data, pos, minor, _options) {
    return toToken3(data, pos, 1, minor);
  }
  function decodeArray8(data, pos, _minor, options) {
    return toToken3(data, pos, 2, readUint8(data, pos + 1, options));
  }
  function decodeArray16(data, pos, _minor, options) {
    return toToken3(data, pos, 3, readUint16(data, pos + 1, options));
  }
  function decodeArray32(data, pos, _minor, options) {
    return toToken3(data, pos, 5, readUint32(data, pos + 1, options));
  }
  function decodeArray64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
      throw new Error(`${decodeErrPrefix} 64-bit integer array lengths not supported`);
    }
    return toToken3(data, pos, 9, l);
  }
  function decodeArrayIndefinite(data, pos, _minor, options) {
    if (options.allowIndefinite === false) {
      throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
    }
    return toToken3(data, pos, 1, Infinity);
  }
  function encodeArray(buf2, token) {
    encodeUintValue(buf2, Type.array.majorEncoded, token.value);
  }
  encodeArray.compareTokens = encodeUint.compareTokens;
  encodeArray.encodedSize = function encodedSize5(token) {
    return encodeUintValue.encodedSize(token.value);
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/5map.js
  function toToken4(_data, _pos, prefix, length4) {
    return new Token(Type.map, length4, prefix);
  }
  function decodeMapCompact(data, pos, minor, _options) {
    return toToken4(data, pos, 1, minor);
  }
  function decodeMap8(data, pos, _minor, options) {
    return toToken4(data, pos, 2, readUint8(data, pos + 1, options));
  }
  function decodeMap16(data, pos, _minor, options) {
    return toToken4(data, pos, 3, readUint16(data, pos + 1, options));
  }
  function decodeMap32(data, pos, _minor, options) {
    return toToken4(data, pos, 5, readUint32(data, pos + 1, options));
  }
  function decodeMap64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
      throw new Error(`${decodeErrPrefix} 64-bit integer map lengths not supported`);
    }
    return toToken4(data, pos, 9, l);
  }
  function decodeMapIndefinite(data, pos, _minor, options) {
    if (options.allowIndefinite === false) {
      throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
    }
    return toToken4(data, pos, 1, Infinity);
  }
  function encodeMap(buf2, token) {
    encodeUintValue(buf2, Type.map.majorEncoded, token.value);
  }
  encodeMap.compareTokens = encodeUint.compareTokens;
  encodeMap.encodedSize = function encodedSize6(token) {
    return encodeUintValue.encodedSize(token.value);
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/6tag.js
  function decodeTagCompact(_data, _pos, minor, _options) {
    return new Token(Type.tag, minor, 1);
  }
  function decodeTag8(data, pos, _minor, options) {
    return new Token(Type.tag, readUint8(data, pos + 1, options), 2);
  }
  function decodeTag16(data, pos, _minor, options) {
    return new Token(Type.tag, readUint16(data, pos + 1, options), 3);
  }
  function decodeTag32(data, pos, _minor, options) {
    return new Token(Type.tag, readUint32(data, pos + 1, options), 5);
  }
  function decodeTag64(data, pos, _minor, options) {
    return new Token(Type.tag, readUint64(data, pos + 1, options), 9);
  }
  function encodeTag(buf2, token) {
    encodeUintValue(buf2, Type.tag.majorEncoded, token.value);
  }
  encodeTag.compareTokens = encodeUint.compareTokens;
  encodeTag.encodedSize = function encodedSize7(token) {
    return encodeUintValue.encodedSize(token.value);
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/7float.js
  var MINOR_FALSE = 20;
  var MINOR_TRUE = 21;
  var MINOR_NULL = 22;
  var MINOR_UNDEFINED = 23;
  function decodeUndefined(_data, _pos, _minor, options) {
    if (options.allowUndefined === false) {
      throw new Error(`${decodeErrPrefix} undefined values are not supported`);
    } else if (options.coerceUndefinedToNull === true) {
      return new Token(Type.null, null, 1);
    }
    return new Token(Type.undefined, void 0, 1);
  }
  function decodeBreak(_data, _pos, _minor, options) {
    if (options.allowIndefinite === false) {
      throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
    }
    return new Token(Type.break, void 0, 1);
  }
  function createToken(value, bytes, options) {
    if (options) {
      if (options.allowNaN === false && Number.isNaN(value)) {
        throw new Error(`${decodeErrPrefix} NaN values are not supported`);
      }
      if (options.allowInfinity === false && (value === Infinity || value === -Infinity)) {
        throw new Error(`${decodeErrPrefix} Infinity values are not supported`);
      }
    }
    return new Token(Type.float, value, bytes);
  }
  function decodeFloat16(data, pos, _minor, options) {
    return createToken(readFloat16(data, pos + 1), 3, options);
  }
  function decodeFloat32(data, pos, _minor, options) {
    return createToken(readFloat32(data, pos + 1), 5, options);
  }
  function decodeFloat64(data, pos, _minor, options) {
    return createToken(readFloat64(data, pos + 1), 9, options);
  }
  function encodeFloat(buf2, token, options) {
    const float = token.value;
    if (float === false) {
      buf2.push([Type.float.majorEncoded | MINOR_FALSE]);
    } else if (float === true) {
      buf2.push([Type.float.majorEncoded | MINOR_TRUE]);
    } else if (float === null) {
      buf2.push([Type.float.majorEncoded | MINOR_NULL]);
    } else if (float === void 0) {
      buf2.push([Type.float.majorEncoded | MINOR_UNDEFINED]);
    } else {
      let decoded;
      let success = false;
      if (!options || options.float64 !== true) {
        encodeFloat16(float);
        decoded = readFloat16(ui8a, 1);
        if (float === decoded || Number.isNaN(float)) {
          ui8a[0] = 249;
          buf2.push(ui8a.slice(0, 3));
          success = true;
        } else {
          encodeFloat32(float);
          decoded = readFloat32(ui8a, 1);
          if (float === decoded) {
            ui8a[0] = 250;
            buf2.push(ui8a.slice(0, 5));
            success = true;
          }
        }
      }
      if (!success) {
        encodeFloat64(float);
        decoded = readFloat64(ui8a, 1);
        ui8a[0] = 251;
        buf2.push(ui8a.slice(0, 9));
      }
    }
  }
  encodeFloat.encodedSize = function encodedSize8(token, options) {
    const float = token.value;
    if (float === false || float === true || float === null || float === void 0) {
      return 1;
    }
    if (!options || options.float64 !== true) {
      encodeFloat16(float);
      let decoded = readFloat16(ui8a, 1);
      if (float === decoded || Number.isNaN(float)) {
        return 3;
      }
      encodeFloat32(float);
      decoded = readFloat32(ui8a, 1);
      if (float === decoded) {
        return 5;
      }
    }
    return 9;
  };
  var buffer = new ArrayBuffer(9);
  var dataView = new DataView(buffer, 1);
  var ui8a = new Uint8Array(buffer, 0);
  function encodeFloat16(inp) {
    if (inp === Infinity) {
      dataView.setUint16(0, 31744, false);
    } else if (inp === -Infinity) {
      dataView.setUint16(0, 64512, false);
    } else if (Number.isNaN(inp)) {
      dataView.setUint16(0, 32256, false);
    } else {
      dataView.setFloat32(0, inp);
      const valu32 = dataView.getUint32(0);
      const exponent = (valu32 & 2139095040) >> 23;
      const mantissa = valu32 & 8388607;
      if (exponent === 255) {
        dataView.setUint16(0, 31744, false);
      } else if (exponent === 0) {
        dataView.setUint16(0, (inp & 2147483648) >> 16 | mantissa >> 13, false);
      } else {
        const logicalExponent = exponent - 127;
        if (logicalExponent < -24) {
          dataView.setUint16(0, 0);
        } else if (logicalExponent < -14) {
          dataView.setUint16(0, (valu32 & 2147483648) >> 16 | /* sign bit */
          1 << 24 + logicalExponent, false);
        } else {
          dataView.setUint16(0, (valu32 & 2147483648) >> 16 | logicalExponent + 15 << 10 | mantissa >> 13, false);
        }
      }
    }
  }
  function readFloat16(ui8a2, pos) {
    if (ui8a2.length - pos < 2) {
      throw new Error(`${decodeErrPrefix} not enough data for float16`);
    }
    const half = (ui8a2[pos] << 8) + ui8a2[pos + 1];
    if (half === 31744) {
      return Infinity;
    }
    if (half === 64512) {
      return -Infinity;
    }
    if (half === 32256) {
      return NaN;
    }
    const exp = half >> 10 & 31;
    const mant = half & 1023;
    let val;
    if (exp === 0) {
      val = mant * 2 ** -24;
    } else if (exp !== 31) {
      val = (mant + 1024) * 2 ** (exp - 25);
    } else {
      val = mant === 0 ? Infinity : NaN;
    }
    return half & 32768 ? -val : val;
  }
  function encodeFloat32(inp) {
    dataView.setFloat32(0, inp, false);
  }
  function readFloat32(ui8a2, pos) {
    if (ui8a2.length - pos < 4) {
      throw new Error(`${decodeErrPrefix} not enough data for float32`);
    }
    const offset = (ui8a2.byteOffset || 0) + pos;
    return new DataView(ui8a2.buffer, offset, 4).getFloat32(0, false);
  }
  function encodeFloat64(inp) {
    dataView.setFloat64(0, inp, false);
  }
  function readFloat64(ui8a2, pos) {
    if (ui8a2.length - pos < 8) {
      throw new Error(`${decodeErrPrefix} not enough data for float64`);
    }
    const offset = (ui8a2.byteOffset || 0) + pos;
    return new DataView(ui8a2.buffer, offset, 8).getFloat64(0, false);
  }
  encodeFloat.compareTokens = encodeUint.compareTokens;

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/jump.js
  function invalidMinor(data, pos, minor) {
    throw new Error(`${decodeErrPrefix} encountered invalid minor (${minor}) for major ${data[pos] >>> 5}`);
  }
  function errorer(msg) {
    return () => {
      throw new Error(`${decodeErrPrefix} ${msg}`);
    };
  }
  var jump = [];
  for (let i = 0; i <= 23; i++) {
    jump[i] = invalidMinor;
  }
  jump[24] = decodeUint8;
  jump[25] = decodeUint16;
  jump[26] = decodeUint32;
  jump[27] = decodeUint64;
  jump[28] = invalidMinor;
  jump[29] = invalidMinor;
  jump[30] = invalidMinor;
  jump[31] = invalidMinor;
  for (let i = 32; i <= 55; i++) {
    jump[i] = invalidMinor;
  }
  jump[56] = decodeNegint8;
  jump[57] = decodeNegint16;
  jump[58] = decodeNegint32;
  jump[59] = decodeNegint64;
  jump[60] = invalidMinor;
  jump[61] = invalidMinor;
  jump[62] = invalidMinor;
  jump[63] = invalidMinor;
  for (let i = 64; i <= 87; i++) {
    jump[i] = decodeBytesCompact;
  }
  jump[88] = decodeBytes8;
  jump[89] = decodeBytes16;
  jump[90] = decodeBytes32;
  jump[91] = decodeBytes64;
  jump[92] = invalidMinor;
  jump[93] = invalidMinor;
  jump[94] = invalidMinor;
  jump[95] = errorer("indefinite length bytes/strings are not supported");
  for (let i = 96; i <= 119; i++) {
    jump[i] = decodeStringCompact;
  }
  jump[120] = decodeString8;
  jump[121] = decodeString16;
  jump[122] = decodeString32;
  jump[123] = decodeString64;
  jump[124] = invalidMinor;
  jump[125] = invalidMinor;
  jump[126] = invalidMinor;
  jump[127] = errorer("indefinite length bytes/strings are not supported");
  for (let i = 128; i <= 151; i++) {
    jump[i] = decodeArrayCompact;
  }
  jump[152] = decodeArray8;
  jump[153] = decodeArray16;
  jump[154] = decodeArray32;
  jump[155] = decodeArray64;
  jump[156] = invalidMinor;
  jump[157] = invalidMinor;
  jump[158] = invalidMinor;
  jump[159] = decodeArrayIndefinite;
  for (let i = 160; i <= 183; i++) {
    jump[i] = decodeMapCompact;
  }
  jump[184] = decodeMap8;
  jump[185] = decodeMap16;
  jump[186] = decodeMap32;
  jump[187] = decodeMap64;
  jump[188] = invalidMinor;
  jump[189] = invalidMinor;
  jump[190] = invalidMinor;
  jump[191] = decodeMapIndefinite;
  for (let i = 192; i <= 215; i++) {
    jump[i] = decodeTagCompact;
  }
  jump[216] = decodeTag8;
  jump[217] = decodeTag16;
  jump[218] = decodeTag32;
  jump[219] = decodeTag64;
  jump[220] = invalidMinor;
  jump[221] = invalidMinor;
  jump[222] = invalidMinor;
  jump[223] = invalidMinor;
  for (let i = 224; i <= 243; i++) {
    jump[i] = errorer("simple values are not supported");
  }
  jump[244] = invalidMinor;
  jump[245] = invalidMinor;
  jump[246] = invalidMinor;
  jump[247] = decodeUndefined;
  jump[248] = errorer("simple values are not supported");
  jump[249] = decodeFloat16;
  jump[250] = decodeFloat32;
  jump[251] = decodeFloat64;
  jump[252] = invalidMinor;
  jump[253] = invalidMinor;
  jump[254] = invalidMinor;
  jump[255] = decodeBreak;
  var quick = [];
  for (let i = 0; i < 24; i++) {
    quick[i] = new Token(Type.uint, i, 1);
  }
  for (let i = -1; i >= -24; i--) {
    quick[31 - i] = new Token(Type.negint, i, 1);
  }
  quick[64] = new Token(Type.bytes, new Uint8Array(0), 1);
  quick[96] = new Token(Type.string, "", 1);
  quick[128] = new Token(Type.array, 0, 1);
  quick[160] = new Token(Type.map, 0, 1);
  quick[244] = new Token(Type.false, false, 1);
  quick[245] = new Token(Type.true, true, 1);
  quick[246] = new Token(Type.null, null, 1);
  function quickEncodeToken(token) {
    switch (token.type) {
      case Type.false:
        return fromArray([244]);
      case Type.true:
        return fromArray([245]);
      case Type.null:
        return fromArray([246]);
      case Type.bytes:
        if (!token.value.length) {
          return fromArray([64]);
        }
        return;
      case Type.string:
        if (token.value === "") {
          return fromArray([96]);
        }
        return;
      case Type.array:
        if (token.value === 0) {
          return fromArray([128]);
        }
        return;
      case Type.map:
        if (token.value === 0) {
          return fromArray([160]);
        }
        return;
      case Type.uint:
        if (token.value < 24) {
          return fromArray([Number(token.value)]);
        }
        return;
      case Type.negint:
        if (token.value >= -24) {
          return fromArray([31 - Number(token.value)]);
        }
    }
  }

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/encode.js
  var defaultEncodeOptions = {
    float64: false,
    mapSorter,
    quickEncodeToken
  };
  function makeCborEncoders() {
    const encoders = [];
    encoders[Type.uint.major] = encodeUint;
    encoders[Type.negint.major] = encodeNegint;
    encoders[Type.bytes.major] = encodeBytes;
    encoders[Type.string.major] = encodeString;
    encoders[Type.array.major] = encodeArray;
    encoders[Type.map.major] = encodeMap;
    encoders[Type.tag.major] = encodeTag;
    encoders[Type.float.major] = encodeFloat;
    return encoders;
  }
  var cborEncoders = makeCborEncoders();
  var buf = new Bl();
  var Ref = class _Ref {
    /**
     * @param {object|any[]} obj
     * @param {Reference|undefined} parent
     */
    constructor(obj, parent) {
      this.obj = obj;
      this.parent = parent;
    }
    /**
     * @param {object|any[]} obj
     * @returns {boolean}
     */
    includes(obj) {
      let p = this;
      do {
        if (p.obj === obj) {
          return true;
        }
      } while (p = p.parent);
      return false;
    }
    /**
     * @param {Reference|undefined} stack
     * @param {object|any[]} obj
     * @returns {Reference}
     */
    static createCheck(stack, obj) {
      if (stack && stack.includes(obj)) {
        throw new Error(`${encodeErrPrefix} object contains circular references`);
      }
      return new _Ref(obj, stack);
    }
  };
  var simpleTokens = {
    null: new Token(Type.null, null),
    undefined: new Token(Type.undefined, void 0),
    true: new Token(Type.true, true),
    false: new Token(Type.false, false),
    emptyArray: new Token(Type.array, 0),
    emptyMap: new Token(Type.map, 0)
  };
  var typeEncoders = {
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    number(obj, _typ, _options, _refStack) {
      if (!Number.isInteger(obj) || !Number.isSafeInteger(obj)) {
        return new Token(Type.float, obj);
      } else if (obj >= 0) {
        return new Token(Type.uint, obj);
      } else {
        return new Token(Type.negint, obj);
      }
    },
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    bigint(obj, _typ, _options, _refStack) {
      if (obj >= BigInt(0)) {
        return new Token(Type.uint, obj);
      } else {
        return new Token(Type.negint, obj);
      }
    },
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    Uint8Array(obj, _typ, _options, _refStack) {
      return new Token(Type.bytes, obj);
    },
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    string(obj, _typ, _options, _refStack) {
      return new Token(Type.string, obj);
    },
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    boolean(obj, _typ, _options, _refStack) {
      return obj ? simpleTokens.true : simpleTokens.false;
    },
    /**
     * @param {any} _obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    null(_obj, _typ, _options, _refStack) {
      return simpleTokens.null;
    },
    /**
     * @param {any} _obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    undefined(_obj, _typ, _options, _refStack) {
      return simpleTokens.undefined;
    },
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    ArrayBuffer(obj, _typ, _options, _refStack) {
      return new Token(Type.bytes, new Uint8Array(obj));
    },
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} _options
     * @param {Reference} [_refStack]
     * @returns {TokenOrNestedTokens}
     */
    DataView(obj, _typ, _options, _refStack) {
      return new Token(Type.bytes, new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength));
    },
    /**
     * @param {any} obj
     * @param {string} _typ
     * @param {EncodeOptions} options
     * @param {Reference} [refStack]
     * @returns {TokenOrNestedTokens}
     */
    Array(obj, _typ, options, refStack) {
      if (!obj.length) {
        if (options.addBreakTokens === true) {
          return [simpleTokens.emptyArray, new Token(Type.break)];
        }
        return simpleTokens.emptyArray;
      }
      refStack = Ref.createCheck(refStack, obj);
      const entries3 = [];
      let i = 0;
      for (const e of obj) {
        entries3[i++] = objectToTokens(e, options, refStack);
      }
      if (options.addBreakTokens) {
        return [new Token(Type.array, obj.length), entries3, new Token(Type.break)];
      }
      return [new Token(Type.array, obj.length), entries3];
    },
    /**
     * @param {any} obj
     * @param {string} typ
     * @param {EncodeOptions} options
     * @param {Reference} [refStack]
     * @returns {TokenOrNestedTokens}
     */
    Object(obj, typ, options, refStack) {
      const isMap = typ !== "Object";
      const keys = isMap ? obj.keys() : Object.keys(obj);
      const length4 = isMap ? obj.size : keys.length;
      if (!length4) {
        if (options.addBreakTokens === true) {
          return [simpleTokens.emptyMap, new Token(Type.break)];
        }
        return simpleTokens.emptyMap;
      }
      refStack = Ref.createCheck(refStack, obj);
      const entries3 = [];
      let i = 0;
      for (const key of keys) {
        entries3[i++] = [
          objectToTokens(key, options, refStack),
          objectToTokens(isMap ? obj.get(key) : obj[key], options, refStack)
        ];
      }
      sortMapEntries(entries3, options);
      if (options.addBreakTokens) {
        return [new Token(Type.map, length4), entries3, new Token(Type.break)];
      }
      return [new Token(Type.map, length4), entries3];
    }
  };
  typeEncoders.Map = typeEncoders.Object;
  typeEncoders.Buffer = typeEncoders.Uint8Array;
  for (const typ of "Uint8Clamped Uint16 Uint32 Int8 Int16 Int32 BigUint64 BigInt64 Float32 Float64".split(" ")) {
    typeEncoders[`${typ}Array`] = typeEncoders.DataView;
  }
  function objectToTokens(obj, options = {}, refStack) {
    const typ = is(obj);
    const customTypeEncoder = options && options.typeEncoders && /** @type {OptionalTypeEncoder} */
    options.typeEncoders[typ] || typeEncoders[typ];
    if (typeof customTypeEncoder === "function") {
      const tokens = customTypeEncoder(obj, typ, options, refStack);
      if (tokens != null) {
        return tokens;
      }
    }
    const typeEncoder = typeEncoders[typ];
    if (!typeEncoder) {
      throw new Error(`${encodeErrPrefix} unsupported type: ${typ}`);
    }
    return typeEncoder(obj, typ, options, refStack);
  }
  function sortMapEntries(entries3, options) {
    if (options.mapSorter) {
      entries3.sort(options.mapSorter);
    }
  }
  function mapSorter(e1, e2) {
    const keyToken1 = Array.isArray(e1[0]) ? e1[0][0] : e1[0];
    const keyToken2 = Array.isArray(e2[0]) ? e2[0][0] : e2[0];
    if (keyToken1.type !== keyToken2.type) {
      return keyToken1.type.compare(keyToken2.type);
    }
    const major = keyToken1.type.major;
    const tcmp = cborEncoders[major].compareTokens(keyToken1, keyToken2);
    if (tcmp === 0) {
      console.warn("WARNING: complex key types used, CBOR key sorting guarantees are gone");
    }
    return tcmp;
  }
  function tokensToEncoded(buf2, tokens, encoders, options) {
    if (Array.isArray(tokens)) {
      for (const token of tokens) {
        tokensToEncoded(buf2, token, encoders, options);
      }
    } else {
      encoders[tokens.type.major](buf2, tokens, options);
    }
  }
  function encodeCustom(data, encoders, options) {
    const tokens = objectToTokens(data, options);
    if (!Array.isArray(tokens) && options.quickEncodeToken) {
      const quickBytes = options.quickEncodeToken(tokens);
      if (quickBytes) {
        return quickBytes;
      }
      const encoder2 = encoders[tokens.type.major];
      if (encoder2.encodedSize) {
        const size = encoder2.encodedSize(tokens, options);
        const buf2 = new Bl(size);
        encoder2(buf2, tokens, options);
        if (buf2.chunks.length !== 1) {
          throw new Error(`Unexpected error: pre-calculated length for ${tokens} was wrong`);
        }
        return asU8A(buf2.chunks[0]);
      }
    }
    buf.reset();
    tokensToEncoded(buf, tokens, encoders, options);
    return buf.toBytes(true);
  }
  function encode5(data, options) {
    options = Object.assign({}, defaultEncodeOptions, options);
    return encodeCustom(data, cborEncoders, options);
  }

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/decode.js
  var defaultDecodeOptions = {
    strict: false,
    allowIndefinite: true,
    allowUndefined: true,
    allowBigInt: true
  };
  var Tokeniser = class {
    /**
     * @param {Uint8Array} data
     * @param {DecodeOptions} options
     */
    constructor(data, options = {}) {
      this._pos = 0;
      this.data = data;
      this.options = options;
    }
    pos() {
      return this._pos;
    }
    done() {
      return this._pos >= this.data.length;
    }
    next() {
      const byt = this.data[this._pos];
      let token = quick[byt];
      if (token === void 0) {
        const decoder2 = jump[byt];
        if (!decoder2) {
          throw new Error(`${decodeErrPrefix} no decoder for major type ${byt >>> 5} (byte 0x${byt.toString(16).padStart(2, "0")})`);
        }
        const minor = byt & 31;
        token = decoder2(this.data, this._pos, minor, this.options);
      }
      this._pos += token.encodedLength;
      return token;
    }
  };
  var DONE = Symbol.for("DONE");
  var BREAK = Symbol.for("BREAK");
  function tokenToArray(token, tokeniser, options) {
    const arr = [];
    for (let i = 0; i < token.value; i++) {
      const value = tokensToObject(tokeniser, options);
      if (value === BREAK) {
        if (token.value === Infinity) {
          break;
        }
        throw new Error(`${decodeErrPrefix} got unexpected break to lengthed array`);
      }
      if (value === DONE) {
        throw new Error(`${decodeErrPrefix} found array but not enough entries (got ${i}, expected ${token.value})`);
      }
      arr[i] = value;
    }
    return arr;
  }
  function tokenToMap(token, tokeniser, options) {
    const useMaps = options.useMaps === true;
    const obj = useMaps ? void 0 : {};
    const m = useMaps ? /* @__PURE__ */ new Map() : void 0;
    for (let i = 0; i < token.value; i++) {
      const key = tokensToObject(tokeniser, options);
      if (key === BREAK) {
        if (token.value === Infinity) {
          break;
        }
        throw new Error(`${decodeErrPrefix} got unexpected break to lengthed map`);
      }
      if (key === DONE) {
        throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${i} [no key], expected ${token.value})`);
      }
      if (useMaps !== true && typeof key !== "string") {
        throw new Error(`${decodeErrPrefix} non-string keys not supported (got ${typeof key})`);
      }
      if (options.rejectDuplicateMapKeys === true) {
        if (useMaps && m.has(key) || !useMaps && key in obj) {
          throw new Error(`${decodeErrPrefix} found repeat map key "${key}"`);
        }
      }
      const value = tokensToObject(tokeniser, options);
      if (value === DONE) {
        throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${i} [no value], expected ${token.value})`);
      }
      if (useMaps) {
        m.set(key, value);
      } else {
        obj[key] = value;
      }
    }
    return useMaps ? m : obj;
  }
  function tokensToObject(tokeniser, options) {
    if (tokeniser.done()) {
      return DONE;
    }
    const token = tokeniser.next();
    if (token.type === Type.break) {
      return BREAK;
    }
    if (token.type.terminal) {
      return token.value;
    }
    if (token.type === Type.array) {
      return tokenToArray(token, tokeniser, options);
    }
    if (token.type === Type.map) {
      return tokenToMap(token, tokeniser, options);
    }
    if (token.type === Type.tag) {
      if (options.tags && typeof options.tags[token.value] === "function") {
        const tagged = tokensToObject(tokeniser, options);
        return options.tags[token.value](tagged);
      }
      throw new Error(`${decodeErrPrefix} tag not supported (${token.value})`);
    }
    throw new Error("unsupported");
  }
  function decodeFirst(data, options) {
    if (!(data instanceof Uint8Array)) {
      throw new Error(`${decodeErrPrefix} data to decode must be a Uint8Array`);
    }
    options = Object.assign({}, defaultDecodeOptions, options);
    const tokeniser = options.tokenizer || new Tokeniser(data, options);
    const decoded = tokensToObject(tokeniser, options);
    if (decoded === DONE) {
      throw new Error(`${decodeErrPrefix} did not find any content to decode`);
    }
    if (decoded === BREAK) {
      throw new Error(`${decodeErrPrefix} got unexpected break`);
    }
    return [decoded, data.subarray(tokeniser.pos())];
  }
  function decode7(data, options) {
    const [decoded, remainder] = decodeFirst(data, options);
    if (remainder.length > 0) {
      throw new Error(`${decodeErrPrefix} too many terminals, data makes no sense`);
    }
    return decoded;
  }

  // node_modules/.pnpm/@ipld+dag-cbor@9.2.1/node_modules/@ipld/dag-cbor/src/index.js
  var CID_CBOR_TAG = 42;
  function toByteView(buf2) {
    if (buf2 instanceof ArrayBuffer) {
      return new Uint8Array(buf2, 0, buf2.byteLength);
    }
    return buf2;
  }
  function cidEncoder(obj) {
    if (obj.asCID !== obj && obj["/"] !== obj.bytes) {
      return null;
    }
    const cid = CID.asCID(obj);
    if (!cid) {
      return null;
    }
    const bytes = new Uint8Array(cid.bytes.byteLength + 1);
    bytes.set(cid.bytes, 1);
    return [
      new Token(Type.tag, CID_CBOR_TAG),
      new Token(Type.bytes, bytes)
    ];
  }
  function undefinedEncoder() {
    throw new Error("`undefined` is not supported by the IPLD Data Model and cannot be encoded");
  }
  function numberEncoder(num) {
    if (Number.isNaN(num)) {
      throw new Error("`NaN` is not supported by the IPLD Data Model and cannot be encoded");
    }
    if (num === Infinity || num === -Infinity) {
      throw new Error("`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded");
    }
    return null;
  }
  var _encodeOptions = {
    float64: true,
    typeEncoders: {
      Object: cidEncoder,
      undefined: undefinedEncoder,
      number: numberEncoder
    }
  };
  var encodeOptions = {
    ..._encodeOptions,
    typeEncoders: {
      ..._encodeOptions.typeEncoders
    }
  };
  function cidDecoder(bytes) {
    if (bytes[0] !== 0) {
      throw new Error("Invalid CID for CBOR tag 42; expected leading 0x00");
    }
    return CID.decode(bytes.subarray(1));
  }
  var _decodeOptions = {
    allowIndefinite: false,
    coerceUndefinedToNull: true,
    allowNaN: false,
    allowInfinity: false,
    allowBigInt: true,
    // this will lead to BigInt for ints outside of
    // safe-integer range, which may surprise users
    strict: true,
    useMaps: false,
    rejectDuplicateMapKeys: true,
    /** @type {import('cborg').TagDecoder[]} */
    tags: []
  };
  _decodeOptions.tags[CID_CBOR_TAG] = cidDecoder;
  var decodeOptions = {
    ..._decodeOptions,
    tags: _decodeOptions.tags.slice()
  };
  var name = "dag-cbor";
  var code = 113;
  var encode6 = (node) => encode5(node, _encodeOptions);
  var decode8 = (data) => decode7(toByteView(data), _decodeOptions);

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/clock/index.js
  var advance = async (blocks, head, event) => {
    const events = new EventFetcher(blocks);
    const headmap = new Map(head.map((cid) => [cid.toString(), cid]));
    if (headmap.has(event.toString())) return head;
    let changed = false;
    for (const cid of head) {
      if (await contains(events, event, cid)) {
        headmap.delete(cid.toString());
        headmap.set(event.toString(), event);
        changed = true;
      }
    }
    if (changed) {
      return [...headmap.values()];
    }
    for (const p of head) {
      if (await contains(events, p, event)) {
        return head;
      }
    }
    return head.concat(event);
  };
  var EventBlock = class extends Block {
    /**
     * @param {object} config
     * @param {API.EventLink<T>} config.cid
     * @param {Event} config.value
     * @param {Uint8Array} config.bytes
     * @param {string} config.prefix
     */
    constructor({ cid, value, bytes, prefix }) {
      super({ cid, value, bytes });
      this.prefix = prefix;
    }
    /**
     * @template T
     * @param {T} data
     * @param {API.EventLink<T>[]} [parents]
     */
    static create(data, parents) {
      return encodeEventBlock({ data, parents: parents ?? [] });
    }
  };
  var EventFetcher = class {
    /** @param {API.BlockFetcher} blocks */
    constructor(blocks) {
      this._blocks = blocks;
    }
    /**
     * @param {API.EventLink<T>} link
     * @returns {Promise<API.EventBlockView<T>>}
     */
    async get(link2) {
      const block = await this._blocks.get(link2);
      if (!block) throw new Error(`missing block: ${link2}`);
      return decodeEventBlock(block.bytes);
    }
  };
  var encodeEventBlock = async (value) => {
    const { cid, bytes } = await encode3({ value, codec: src_exports, hasher: sha256 });
    return new Block({ cid, value, bytes });
  };
  var decodeEventBlock = async (bytes) => {
    const { cid, value } = await decode5({ bytes, codec: src_exports, hasher: sha256 });
    return new Block({ cid, value, bytes });
  };
  var contains = async (events, a, b) => {
    if (a.toString() === b.toString()) return true;
    const [{ value: aevent }, { value: bevent }] = await Promise.all([events.get(a), events.get(b)]);
    const links3 = [...aevent.parents];
    const seen = /* @__PURE__ */ new Set();
    while (links3.length) {
      const link2 = links3.shift();
      if (!link2) break;
      if (link2.toString() === b.toString()) return true;
      if (bevent.parents.some((p) => link2.toString() === p.toString())) continue;
      if (seen.has(link2.toString())) continue;
      seen.add(link2.toString());
      const { value: event } = await events.get(link2);
      links3.push(...event.parents);
    }
    return false;
  };
  var vis = async function* (blocks, head, options = {}) {
    const renderNodeLabel = options.renderNodeLabel ?? ((b) => shortLink(b.cid));
    const events = new EventFetcher(blocks);
    yield "digraph clock {";
    yield '  node [shape=point fontname="Courier"]; head;';
    const hevents = await Promise.all(head.map((link2) => events.get(link2)));
    const links3 = [];
    const nodes = /* @__PURE__ */ new Set();
    for (const e of hevents) {
      nodes.add(e.cid.toString());
      yield `  node [shape=oval fontname="Courier"]; ${e.cid} [label="${renderNodeLabel(e)}"];`;
      yield `  head -> ${e.cid};`;
      for (const p of e.value.parents) {
        yield `  ${e.cid} -> ${p};`;
      }
      links3.push(...e.value.parents);
    }
    while (links3.length) {
      const link2 = links3.shift();
      if (!link2) break;
      if (nodes.has(link2.toString())) continue;
      nodes.add(link2.toString());
      const block = await events.get(link2);
      yield `  node [shape=oval]; ${link2} [label="${renderNodeLabel(block)}" fontname="Courier"];`;
      for (const p of block.value.parents) {
        yield `  ${link2} -> ${p};`;
      }
      links3.push(...block.value.parents);
    }
    yield "}";
  };
  var shortLink = (l) => `${String(l).slice(0, 4)}..${String(l).slice(-4)}`;

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/shard.js
  var KeyCharsASCII = "ascii";
  var MaxKeySize = 4096;
  var ShardBlock = class extends Block {
    /**
     * @param {object} config
     * @param {API.ShardLink} config.cid
     * @param {API.Shard} config.value
     * @param {Uint8Array} config.bytes
     */
    constructor({ cid, value, bytes }) {
      super({ cid, value, bytes });
    }
    /** @param {API.ShardOptions} [options] */
    static create(options) {
      return encodeBlock(create3(options));
    }
  };
  var create3 = (options) => ({ entries: [], ...configure(options) });
  var configure = (options) => ({
    version: 1,
    keyChars: options?.keyChars ?? KeyCharsASCII,
    maxKeySize: options?.maxKeySize ?? MaxKeySize,
    prefix: options?.prefix ?? ""
  });
  var withEntries = (entries3, options) => ({ ...create3(options), entries: entries3 });
  var decodeCache = /* @__PURE__ */ new WeakMap();
  var encodeBlock = async (value) => {
    const { cid, bytes } = await encode3({ value, codec: src_exports, hasher: sha256 });
    const block = new ShardBlock({ cid, value, bytes });
    decodeCache.set(block.bytes, block);
    return block;
  };
  var decodeBlock = async (bytes) => {
    const block = decodeCache.get(bytes);
    if (block) return block;
    const { cid, value } = await decode5({ bytes, codec: src_exports, hasher: sha256 });
    if (!isShard(value)) throw new Error(`invalid shard: ${cid}`);
    return new ShardBlock({ cid, value, bytes });
  };
  var isShard = (value) => value != null && typeof value === "object" && Array.isArray(value.entries) && value.version === 1 && typeof value.maxKeySize === "number" && typeof value.keyChars === "string" && typeof value.prefix === "string";
  var isShardLink = (value) => isLink(value) && value.code === code;
  var ShardFetcher = class {
    /** @param {API.BlockFetcher} blocks */
    constructor(blocks) {
      this._blocks = blocks;
    }
    /**
     * @param {API.ShardLink} link
     * @returns {Promise<API.ShardBlockView>}
     */
    async get(link2) {
      const block = await this._blocks.get(link2);
      if (!block) throw new Error(`missing block: ${link2}`);
      return decodeBlock(block.bytes);
    }
  };
  var putEntry = (target, newEntry) => {
    const entries3 = [];
    for (const [i, entry] of target.entries()) {
      const [k, v] = entry;
      if (newEntry[0] === k) {
        if (Array.isArray(newEntry[1])) {
          if (Array.isArray(v) && v[1] != null && newEntry[1][1] == null) {
            entries3.push([k, [newEntry[1][0], v[1]]]);
          } else {
            entries3.push(newEntry);
          }
        } else {
          if (Array.isArray(v)) {
            entries3.push([k, [v[0], newEntry[1]]]);
          } else {
            entries3.push(newEntry);
          }
        }
        for (let j = i + 1; j < target.length; j++) {
          entries3.push(target[j]);
        }
        return entries3;
      }
      if (i === 0 && newEntry[0] < k) {
        entries3.push(newEntry);
        for (let j = i; j < target.length; j++) {
          entries3.push(target[j]);
        }
        return entries3;
      }
      if (i > 0 && newEntry[0] > target[i - 1][0] && newEntry[0] < k) {
        entries3.push(newEntry);
        for (let j = i; j < target.length; j++) {
          entries3.push(target[j]);
        }
        return entries3;
      }
      entries3.push(entry);
    }
    entries3.push(newEntry);
    return entries3;
  };
  var isPrintableASCII = (s) => /^[\x20-\x7E]*$/.test(s);

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/index.js
  var put = async (blocks, root2, key, value) => {
    const shards = new ShardFetcher(blocks);
    const rshard = await shards.get(root2);
    if (rshard.value.keyChars !== KeyCharsASCII) {
      throw new Error(`unsupported key character set: ${rshard.value.keyChars}`);
    }
    if (!isPrintableASCII(key)) {
      throw new Error("key contains non-ASCII characters");
    }
    if (new TextEncoder().encode(key).length > rshard.value.maxKeySize) {
      throw new Error(`UTF-8 encoded key exceeds max size of ${rshard.value.maxKeySize} bytes`);
    }
    const path = await traverse(shards, rshard, key);
    const target = path[path.length - 1];
    const skey = key.slice(target.value.prefix.length);
    let entry = [skey, value];
    let targetEntries = [...target.value.entries];
    const additions = [];
    for (const [i, e] of targetEntries.entries()) {
      const [k, v] = e;
      if (k === skey) break;
      const shortest = k.length < skey.length ? k : skey;
      const other = shortest === k ? skey : k;
      let common = "";
      for (const char of shortest) {
        const next = common + char;
        if (!other.startsWith(next)) break;
        common = next;
      }
      if (common.length) {
        let entries3 = [];
        if (common !== skey) {
          entries3 = putEntry(entries3, [skey.slice(common.length), value]);
        }
        if (common !== k) {
          entries3 = putEntry(entries3, [k.slice(common.length), v]);
        }
        let child2 = await encodeBlock(
          withEntries(entries3, { ...target.value, prefix: target.value.prefix + common })
        );
        additions.push(child2);
        const commonChars = [...common];
        for (let i2 = commonChars.length - 1; i2 > 0; i2--) {
          const parentConfig = { ...target.value, prefix: target.value.prefix + commonChars.slice(0, i2).join("") };
          let parentValue;
          if (i2 === commonChars.length - 1 && common === k) {
            if (Array.isArray(v)) throw new Error("found a shard link when expecting a value");
            parentValue = [child2.cid, v];
          } else if (i2 === commonChars.length - 1 && common === skey) {
            parentValue = [child2.cid, value];
          } else {
            parentValue = [child2.cid];
          }
          const parent = await encodeBlock(withEntries([[commonChars[i2], parentValue]], parentConfig));
          additions.push(parent);
          child2 = parent;
        }
        targetEntries.splice(i, 1);
        if (commonChars.length === 1 && common === k) {
          if (Array.isArray(v)) throw new Error("found a shard link when expecting a value");
          entry = [commonChars[0], [child2.cid, v]];
        } else if (commonChars.length === 1 && common === skey) {
          entry = [commonChars[0], [child2.cid, value]];
        } else {
          entry = [commonChars[0], [child2.cid]];
        }
        break;
      }
    }
    const shard = withEntries(putEntry(targetEntries, entry), target.value);
    let child = await encodeBlock(shard);
    if (child.cid.toString() === target.cid.toString()) {
      return { root: root2, additions: [], removals: [] };
    }
    additions.push(child);
    for (let i = path.length - 2; i >= 0; i--) {
      const parent = path[i];
      const key2 = child.value.prefix.slice(parent.value.prefix.length);
      const value2 = withEntries(
        parent.value.entries.map((entry2) => {
          const [k, v] = entry2;
          if (k !== key2) return entry2;
          if (!Array.isArray(v)) throw new Error(`"${key2}" is not a shard link in: ${parent.cid}`);
          return (
            /** @type {API.ShardEntry} */
            v[1] == null ? [k, [child.cid]] : [k, [child.cid, v[1]]]
          );
        }),
        parent.value
      );
      child = await encodeBlock(value2);
      additions.push(child);
    }
    return { root: additions[additions.length - 1].cid, additions, removals: path };
  };
  var get2 = async (blocks, root2, key) => {
    const shards = new ShardFetcher(blocks);
    const rshard = await shards.get(root2);
    const path = await traverse(shards, rshard, key);
    const target = path[path.length - 1];
    const skey = key.slice(target.value.prefix.length);
    const entry = target.value.entries.find(([k]) => k === skey);
    if (!entry) return;
    return Array.isArray(entry[1]) ? entry[1][1] : entry[1];
  };
  var del = async (blocks, root2, key) => {
    const shards = new ShardFetcher(blocks);
    const rshard = await shards.get(root2);
    const path = await traverse(shards, rshard, key);
    const target = path[path.length - 1];
    const skey = key.slice(target.value.prefix.length);
    const entryidx = target.value.entries.findIndex(([k]) => k === skey);
    if (entryidx === -1) return { root: root2, additions: [], removals: [] };
    const entry = target.value.entries[entryidx];
    if (Array.isArray(entry[1]) && entry[1][1] == null) {
      return { root: root2, additions: [], removals: [] };
    }
    const additions = [];
    const removals = [...path];
    let shard = withEntries([...target.value.entries], target.value);
    if (Array.isArray(entry[1])) {
      shard.entries[entryidx] = [entry[0], [entry[1][0]]];
    } else {
      shard.entries.splice(entryidx, 1);
      while (!shard.entries.length) {
        const child2 = path[path.length - 1];
        const parent = path[path.length - 2];
        if (!parent) break;
        path.pop();
        shard = withEntries(
          parent.value.entries.filter((e) => {
            if (!Array.isArray(e[1])) return true;
            return e[1][0].toString() !== child2.cid.toString();
          }),
          parent.value
        );
      }
    }
    let child = await encodeBlock(shard);
    additions.push(child);
    for (let i = path.length - 2; i >= 0; i--) {
      const parent = path[i];
      const key2 = child.value.prefix.slice(parent.value.prefix.length);
      const value = withEntries(
        parent.value.entries.map((entry2) => {
          const [k, v] = entry2;
          if (k !== key2) return entry2;
          if (!Array.isArray(v)) throw new Error(`"${key2}" is not a shard link in: ${parent.cid}`);
          return (
            /** @type {API.ShardEntry} */
            v[1] == null ? [k, [child.cid]] : [k, [child.cid, v[1]]]
          );
        }),
        parent.value
      );
      child = await encodeBlock(value);
      additions.push(child);
    }
    return { root: additions[additions.length - 1].cid, additions, removals };
  };
  var isKeyPrefixOption = (options) => {
    const opts = options ?? {};
    return "prefix" in opts && Boolean(opts.prefix);
  };
  var isKeyRangeOption = (options) => {
    const opts = options ?? {};
    return "gt" in opts && Boolean(opts.gt) || "gte" in opts && Boolean(opts.gte) || "lt" in opts && Boolean(opts.lt) || "lte" in opts && Boolean(opts.lte);
  };
  var isKeyLowerBoundRangeOption = (options) => "gt" in options && Boolean(options.gt) || "gte" in options && Boolean(options.gte);
  var isKeyLowerBoundRangeInclusiveOption = (options) => "gte" in options && Boolean(options.gte);
  var isKeyLowerBoundRangeExclusiveOption = (options) => "gt" in options && Boolean(options.gt);
  var isKeyUpperBoundRangeOption = (options) => "lt" in options && Boolean(options.lt) || "lte" in options && Boolean(options.lte);
  var isKeyUpperBoundRangeInclusiveOption = (options) => "lte" in options && Boolean(options.lte);
  var isKeyUpperBoundRangeExclusiveOption = (options) => "lt" in options && Boolean(options.lt);
  var entries = async function* (blocks, root2, options) {
    const hasKeyPrefix = isKeyPrefixOption(options);
    const hasKeyRange = isKeyRangeOption(options);
    const hasKeyLowerBoundRange = hasKeyRange && isKeyLowerBoundRangeOption(options);
    const hasKeyLowerBoundRangeInclusive = hasKeyLowerBoundRange && isKeyLowerBoundRangeInclusiveOption(options);
    const hasKeyLowerBoundRangeExclusive = hasKeyLowerBoundRange && isKeyLowerBoundRangeExclusiveOption(options);
    const hasKeyUpperBoundRange = hasKeyRange && isKeyUpperBoundRangeOption(options);
    const hasKeyUpperBoundRangeInclusive = hasKeyUpperBoundRange && isKeyUpperBoundRangeInclusiveOption(options);
    const hasKeyUpperBoundRangeExclusive = hasKeyUpperBoundRange && isKeyUpperBoundRangeExclusiveOption(options);
    const hasKeyUpperAndLowerBoundRange = hasKeyLowerBoundRange && hasKeyUpperBoundRange;
    const shards = new ShardFetcher(blocks);
    const rshard = await shards.get(root2);
    yield* (
      /** @returns {AsyncIterableIterator<API.ShardValueEntry>} */
      async function* ents(shard) {
        for (const entry of shard.value.entries) {
          const key = shard.value.prefix + entry[0];
          if (Array.isArray(entry[1])) {
            if (entry[1][1]) {
              if (hasKeyPrefix && key.startsWith(options.prefix) || hasKeyUpperAndLowerBoundRange && ((hasKeyLowerBoundRangeExclusive && key > options.gt || hasKeyLowerBoundRangeInclusive && key >= options.gte) && (hasKeyUpperBoundRangeExclusive && key < options.lt || hasKeyUpperBoundRangeInclusive && key <= options.lte)) || hasKeyLowerBoundRangeExclusive && key > options.gt || hasKeyLowerBoundRangeInclusive && key >= options.gte || hasKeyUpperBoundRangeExclusive && key < options.lt || hasKeyUpperBoundRangeInclusive && key <= options.lte || !hasKeyPrefix && !hasKeyRange) {
                yield [key, entry[1][1]];
              }
            }
            if (hasKeyPrefix) {
              if (options.prefix.length <= key.length && !key.startsWith(options.prefix)) {
                continue;
              }
              if (options.prefix.length > key.length && !options.prefix.startsWith(key)) {
                continue;
              }
            } else if (hasKeyLowerBoundRangeExclusive && trunc(key, Math.min(key.length, options.gt.length)) < trunc(options.gt, Math.min(key.length, options.gt.length)) || hasKeyLowerBoundRangeInclusive && trunc(key, Math.min(key.length, options.gte.length)) < trunc(options.gte, Math.min(key.length, options.gte.length)) || hasKeyUpperBoundRangeExclusive && trunc(key, Math.min(key.length, options.lt.length)) > trunc(options.lt, Math.min(key.length, options.lt.length)) || hasKeyUpperBoundRangeInclusive && trunc(key, Math.min(key.length, options.lte.length)) > trunc(options.lte, Math.min(key.length, options.lte.length))) {
              continue;
            }
            yield* ents(await shards.get(entry[1][0]));
          } else {
            if (hasKeyPrefix && key.startsWith(options.prefix) || hasKeyRange && hasKeyUpperAndLowerBoundRange && ((hasKeyLowerBoundRangeExclusive && key > options.gt || hasKeyLowerBoundRangeInclusive && key >= options.gte) && (hasKeyUpperBoundRangeExclusive && key < options.lt || hasKeyUpperBoundRangeInclusive && key <= options.lte)) || hasKeyRange && !hasKeyUpperAndLowerBoundRange && (hasKeyLowerBoundRangeExclusive && key > options.gt || hasKeyLowerBoundRangeInclusive && key >= options.gte || hasKeyUpperBoundRangeExclusive && key < options.lt || hasKeyUpperBoundRangeInclusive && key <= options.lte) || !hasKeyPrefix && !hasKeyRange) {
              yield [key, entry[1]];
            }
          }
        }
      }(rshard)
    );
  };
  var trunc = (str, len) => str.length <= len ? str : str.slice(0, len);
  var traverse = async (shards, shard, key) => {
    for (const [k, v] of shard.value.entries) {
      if (key === k) return [shard];
      if (key.startsWith(k) && Array.isArray(v)) {
        const path = await traverse(shards, await shards.get(v[0]), key.slice(k.length));
        return [shard, ...path];
      }
    }
    return [shard];
  };

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/block.js
  var MemoryBlockstore = class {
    /** @type {Map<string, Uint8Array>} */
    #blocks = /* @__PURE__ */ new Map();
    /**
     * @param {Array<import('multiformats').Block>} [blocks]
     */
    constructor(blocks) {
      if (blocks) {
        this.#blocks = new Map(blocks.map((b) => [b.cid.toString(), b.bytes]));
      }
    }
    /** @type {API.BlockFetcher['get']} */
    async get(cid) {
      const bytes = this.#blocks.get(cid.toString());
      if (!bytes) return;
      return { cid, bytes };
    }
    /**
     * @param {API.UnknownLink} cid
     * @param {Uint8Array} bytes
     */
    async put(cid, bytes) {
      this.#blocks.set(cid.toString(), bytes);
    }
    /**
     * @param {API.UnknownLink} cid
     * @param {Uint8Array} bytes
     */
    putSync(cid, bytes) {
      this.#blocks.set(cid.toString(), bytes);
    }
    /** @param {API.UnknownLink} cid */
    async delete(cid) {
      this.#blocks.delete(cid.toString());
    }
    /** @param {API.UnknownLink} cid */
    deleteSync(cid) {
      this.#blocks.delete(cid.toString());
    }
    *entries() {
      for (const [str, bytes] of this.#blocks) {
        yield { cid: parse(str), bytes };
      }
    }
  };
  var MultiBlockFetcher = class {
    /** @type {API.BlockFetcher[]} */
    #fetchers;
    /** @param {API.BlockFetcher[]} fetchers */
    constructor(...fetchers) {
      this.#fetchers = fetchers;
    }
    /** @type {API.BlockFetcher['get']} */
    async get(link2) {
      for (const f of this.#fetchers) {
        const v = await f.get(link2);
        if (v) return v;
      }
    }
  };

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/batch/shard.js
  var create4 = (init2) => ({
    base: init2?.base,
    entries: [...init2?.entries ?? []],
    ...configure(init2)
  });

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/batch/index.js
  var Batcher = class _Batcher {
    #committed = false;
    /**
     * @param {object} init
     * @param {API.BlockFetcher} init.blocks Block storage.
     * @param {API.BatcherShardEntry[]} init.entries The entries in this shard.
     * @param {string} init.prefix Key prefix.
     * @param {number} init.version Shard compatibility version.
     * @param {string} init.keyChars Characters allowed in keys, referring to a known character set.
     * @param {number} init.maxKeySize Max key size in bytes.
     * @param {API.ShardBlockView} init.base Original shard this batcher is based on.
     */
    constructor({ blocks, entries: entries3, prefix, version, keyChars, maxKeySize, base: base4 }) {
      this.blocks = blocks;
      this.prefix = prefix;
      this.entries = [...entries3];
      this.base = base4;
      this.version = version;
      this.keyChars = keyChars;
      this.maxKeySize = maxKeySize;
    }
    /**
     * @param {string} key The key of the value to put.
     * @param {API.UnknownLink} value The value to put.
     * @returns {Promise<void>}
     */
    async put(key, value) {
      if (this.#committed) throw new BatchCommittedError();
      return put2(this.blocks, this, key, value);
    }
    async commit() {
      if (this.#committed) throw new BatchCommittedError();
      this.#committed = true;
      return commit(this);
    }
    /**
     * @param {object} init
     * @param {API.BlockFetcher} init.blocks Block storage.
     * @param {API.ShardLink} init.link CID of the shard block.
     */
    static async create({ blocks, link: link2 }) {
      const shards = new ShardFetcher(blocks);
      const base4 = await shards.get(link2);
      return new _Batcher({ blocks, base: base4, ...base4.value });
    }
  };
  var put2 = async (blocks, shard, key, value) => {
    if (shard.keyChars !== KeyCharsASCII) {
      throw new Error(`unsupported key character set: ${shard.keyChars}`);
    }
    if (!isPrintableASCII(key)) {
      throw new Error("key contains non-ASCII characters");
    }
    if (new TextEncoder().encode(key).length > shard.maxKeySize) {
      throw new Error(`UTF-8 encoded key exceeds max size of ${shard.maxKeySize} bytes`);
    }
    const shards = new ShardFetcher(blocks);
    const dest = await traverse2(shards, shard, key);
    if (dest.shard !== shard) {
      shard = dest.shard;
      key = dest.key;
    }
    let entry = [dest.key, value];
    let targetEntries = [...dest.shard.entries];
    for (const [i, e] of targetEntries.entries()) {
      const [k, v] = e;
      if (k === dest.key) break;
      const shortest = k.length < dest.key.length ? k : dest.key;
      const other = shortest === k ? dest.key : k;
      let common = "";
      for (const char of shortest) {
        const next = common + char;
        if (!other.startsWith(next)) break;
        common = next;
      }
      if (common.length) {
        let entries3 = [];
        if (common !== dest.key) {
          entries3 = putEntry(entries3, [dest.key.slice(common.length), value]);
        }
        if (common !== k) {
          entries3 = putEntry(entries3, asShardEntry([k.slice(common.length), v]));
        }
        let child = create4({
          ...configure(dest.shard),
          prefix: dest.shard.prefix + common,
          entries: entries3
        });
        const commonChars = [...common];
        for (let i2 = commonChars.length - 1; i2 > 0; i2--) {
          let parentValue;
          if (i2 === commonChars.length - 1 && common === k) {
            if (Array.isArray(v)) throw new Error("found a shard link when expecting a value");
            parentValue = [child, v];
          } else if (i2 === commonChars.length - 1 && common === dest.key) {
            parentValue = [child, value];
          } else {
            parentValue = [child];
          }
          const parent = create4({
            ...configure(dest.shard),
            prefix: dest.shard.prefix + commonChars.slice(0, i2).join(""),
            entries: [[commonChars[i2], parentValue]]
          });
          child = parent;
        }
        targetEntries.splice(i, 1);
        if (commonChars.length === 1 && common === k) {
          if (Array.isArray(v)) throw new Error("found a shard link when expecting a value");
          entry = [commonChars[0], [child, v]];
        } else if (commonChars.length === 1 && common === dest.key) {
          entry = [commonChars[0], [child, value]];
        } else {
          entry = [commonChars[0], [child]];
        }
        break;
      }
    }
    shard.entries = putEntry(asShardEntries(targetEntries), asShardEntry(entry));
  };
  var traverse2 = async (shards, shard, key) => {
    for (let i = 0; i < shard.entries.length; i++) {
      const [k, v] = shard.entries[i];
      if (key <= k) break;
      if (key.startsWith(k) && Array.isArray(v)) {
        if (isShardLink(v[0])) {
          const blk = await shards.get(v[0]);
          const batcher = create4({ base: blk, ...blk.value });
          shard.entries[i] = [k, v[1] == null ? [batcher] : [batcher, v[1]]];
          return traverse2(shards, batcher, key.slice(k.length));
        }
        return traverse2(shards, v[0], key.slice(k.length));
      }
    }
    return { shard, key };
  };
  var commit = async (shard) => {
    const additions = [];
    const removals = [];
    const entries3 = [];
    for (const entry of shard.entries) {
      if (Array.isArray(entry[1]) && !isShardLink(entry[1][0])) {
        const result = await commit(entry[1][0]);
        entries3.push([
          entry[0],
          entry[1][1] == null ? [result.root] : [result.root, entry[1][1]]
        ]);
        additions.push(...result.additions);
        removals.push(...result.removals);
      } else {
        entries3.push(asShardEntry(entry));
      }
    }
    const block = await encodeBlock(withEntries(entries3, shard));
    additions.push(block);
    if (shard.base && shard.base.cid.toString() === block.cid.toString()) {
      return { root: block.cid, additions: [], removals: [] };
    }
    if (shard.base) removals.push(shard.base);
    return { root: block.cid, additions, removals };
  };
  var asShardEntries = (entries3) => (
    /** @type {API.ShardEntry[]} */
    entries3
  );
  var asShardEntry = (entry) => (
    /** @type {API.ShardEntry} */
    entry
  );
  var create5 = (blocks, root2) => Batcher.create({ blocks, link: root2 });
  var BatchCommittedError = class _BatchCommittedError extends Error {
    /**
     * @param {string} [message]
     * @param {ErrorOptions} [options]
     */
    constructor(message2, options) {
      super(message2 ?? "batch already committed", options);
      this.code = _BatchCommittedError.code;
    }
    static code = "ERR_BATCH_COMMITTED";
  };

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/crdt/index.js
  var put3 = async (blocks, head, key, value) => {
    const mblocks = new MemoryBlockstore();
    blocks = new MultiBlockFetcher(mblocks, blocks);
    if (!head.length) {
      const shard = await ShardBlock.create();
      mblocks.putSync(shard.cid, shard.bytes);
      const result2 = await put(blocks, shard.cid, key, value);
      const data2 = { type: "put", root: result2.root, key, value };
      const event2 = await EventBlock.create(data2, head);
      head = await advance(blocks, head, event2.cid);
      return {
        root: result2.root,
        additions: [shard, ...result2.additions],
        removals: result2.removals,
        head,
        event: event2
      };
    }
    const events = new EventFetcher(blocks);
    const ancestor = await findCommonAncestor(events, head);
    if (!ancestor) throw new Error("failed to find common ancestor event");
    const aevent = await events.get(ancestor);
    let { root: root2 } = aevent.value.data;
    const sorted = await findSortedEvents(events, head, ancestor);
    const additions = /* @__PURE__ */ new Map();
    const removals = /* @__PURE__ */ new Map();
    for (const { value: event2 } of sorted) {
      let result2;
      if (event2.data.type === "put") {
        result2 = await put(blocks, root2, event2.data.key, event2.data.value);
      } else if (event2.data.type === "del") {
        result2 = await del(blocks, root2, event2.data.key);
      } else if (event2.data.type === "batch") {
        const batch2 = await create5(blocks, root2);
        for (const op of event2.data.ops) {
          if (op.type !== "put") throw new Error(`unsupported batch operation: ${op.type}`);
          await batch2.put(op.key, op.value);
        }
        result2 = await batch2.commit();
      } else {
        throw new Error(`unknown operation: ${event2.data.type}`);
      }
      root2 = result2.root;
      for (const a of result2.additions) {
        mblocks.putSync(a.cid, a.bytes);
        additions.set(a.cid.toString(), a);
      }
      for (const r of result2.removals) {
        removals.set(r.cid.toString(), r);
      }
    }
    const result = await put(blocks, root2, key, value);
    if (result.root.toString() === root2.toString()) {
      return { root: root2, additions: [], removals: [], head };
    }
    for (const a of result.additions) {
      mblocks.putSync(a.cid, a.bytes);
      additions.set(a.cid.toString(), a);
    }
    for (const r of result.removals) {
      removals.set(r.cid.toString(), r);
    }
    const data = { type: "put", root: result.root, key, value };
    const event = await EventBlock.create(data, head);
    mblocks.putSync(event.cid, event.bytes);
    head = await advance(blocks, head, event.cid);
    for (const k of removals.keys()) {
      if (additions.has(k)) {
        additions.delete(k);
        removals.delete(k);
      }
    }
    return {
      root: result.root,
      additions: [...additions.values()],
      removals: [...removals.values()],
      head,
      event
    };
  };
  var root = async (blocks, head) => {
    if (!head.length) throw new Error("cannot determine root of headless clock");
    const mblocks = new MemoryBlockstore();
    blocks = new MultiBlockFetcher(mblocks, blocks);
    const events = new EventFetcher(blocks);
    if (head.length === 1) {
      const event = await events.get(head[0]);
      const { root: root3 } = event.value.data;
      return { root: root3, additions: [], removals: [] };
    }
    const ancestor = await findCommonAncestor(events, head);
    if (!ancestor) throw new Error("failed to find common ancestor event");
    const aevent = await events.get(ancestor);
    let { root: root2 } = aevent.value.data;
    const sorted = await findSortedEvents(events, head, ancestor);
    const additions = /* @__PURE__ */ new Map();
    const removals = /* @__PURE__ */ new Map();
    for (const { value: event } of sorted) {
      let result;
      if (event.data.type === "put") {
        result = await put(blocks, root2, event.data.key, event.data.value);
      } else if (event.data.type === "del") {
        result = await del(blocks, root2, event.data.key);
      } else if (event.data.type === "batch") {
        const batch2 = await create5(blocks, root2);
        for (const op of event.data.ops) {
          if (op.type !== "put") throw new Error(`unsupported batch operation: ${op.type}`);
          await batch2.put(op.key, op.value);
        }
        result = await batch2.commit();
      } else {
        throw new Error(`unknown operation: ${event.data.type}`);
      }
      root2 = result.root;
      for (const a of result.additions) {
        mblocks.putSync(a.cid, a.bytes);
        additions.set(a.cid.toString(), a);
      }
      for (const r of result.removals) {
        removals.set(r.cid.toString(), r);
      }
    }
    for (const k of removals.keys()) {
      if (additions.has(k)) {
        additions.delete(k);
        removals.delete(k);
      }
    }
    return {
      root: root2,
      additions: [...additions.values()],
      removals: [...removals.values()]
    };
  };
  var get3 = async (blocks, head, key) => {
    if (!head.length) return;
    const result = await root(blocks, head);
    if (result.additions.length) {
      blocks = new MultiBlockFetcher(new MemoryBlockstore(result.additions), blocks);
    }
    return get2(blocks, result.root, key);
  };
  var entries2 = async function* (blocks, head, options) {
    if (!head.length) return;
    const result = await root(blocks, head);
    if (result.additions.length) {
      blocks = new MultiBlockFetcher(new MemoryBlockstore(result.additions), blocks);
    }
    yield* entries(blocks, result.root, options);
  };
  var findCommonAncestor = async (events, children) => {
    if (!children.length) return;
    const candidates = children.map((c) => [c]);
    while (true) {
      let changed = false;
      for (const c of candidates) {
        const candidate = await findAncestorCandidate(events, c[c.length - 1]);
        if (!candidate) continue;
        changed = true;
        c.push(candidate);
        const ancestor = findCommonString(candidates);
        if (ancestor) return ancestor;
      }
      if (!changed) return;
    }
  };
  var findAncestorCandidate = async (events, root2) => {
    const { value: event } = await events.get(root2);
    if (!event.parents.length) return root2;
    return event.parents.length === 1 ? event.parents[0] : findCommonAncestor(events, event.parents);
  };
  var findCommonString = (arrays) => {
    arrays = arrays.map((a) => [...a]);
    for (const arr of arrays) {
      for (const item of arr) {
        let matched = true;
        for (const other of arrays) {
          if (arr === other) continue;
          matched = other.some((i) => String(i) === String(item));
          if (!matched) break;
        }
        if (matched) return item;
      }
    }
  };
  var findSortedEvents = async (events, head, tail) => {
    if (head.length === 1 && head[0].toString() === tail.toString()) {
      return [];
    }
    const weights = /* @__PURE__ */ new Map();
    const all = await Promise.all(head.map((h) => findEvents(events, h, tail)));
    for (const arr of all) {
      for (const { event, depth } of arr) {
        const info = weights.get(event.cid.toString());
        if (info) {
          info.weight += depth;
        } else {
          weights.set(event.cid.toString(), { event, weight: depth });
        }
      }
    }
    const buckets = /* @__PURE__ */ new Map();
    for (const { event, weight } of weights.values()) {
      const bucket = buckets.get(weight);
      if (bucket) {
        bucket.push(event);
      } else {
        buckets.set(weight, [event]);
      }
    }
    return Array.from(buckets).sort((a, b) => b[0] - a[0]).flatMap(([, es]) => es.sort((a, b) => String(a.cid) < String(b.cid) ? -1 : 1));
  };
  var findEvents = async (events, start, end, depth = 0) => {
    const event = await events.get(start);
    const acc = [{ event, depth }];
    const { parents } = event.value;
    if (parents.length === 1 && String(parents[0]) === String(end)) return acc;
    const rest = await Promise.all(parents.map((p) => findEvents(events, p, end, depth + 1)));
    return acc.concat(...rest);
  };

  // node_modules/.pnpm/@web3-storage+pail@0.6.0/node_modules/@web3-storage/pail/src/crdt/batch/index.js
  var Batcher2 = class _Batcher {
    #committed = false;
    /**
     * @param {object} init
     * @param {API.BlockFetcher} init.blocks Block storage.
     * @param {API.EventLink<API.Operation>[]} init.head Merkle clock head.
     * @param {API.BatcherShardEntry[]} init.entries The entries in this shard.
     * @param {string} init.prefix Key prefix.
     * @param {number} init.version Shard compatibility version.
     * @param {string} init.keyChars Characters allowed in keys, referring to a known character set.
     * @param {number} init.maxKeySize Max key size in bytes.
     * @param {API.ShardBlockView} init.base Original shard this batcher is based on.
     * @param {API.ShardBlockView[]} init.additions Additions to include in the committed batch.
     * @param {API.ShardBlockView[]} init.removals Removals to include in the committed batch.
     */
    constructor({ blocks, head, entries: entries3, prefix, version, keyChars, maxKeySize, base: base4, additions, removals }) {
      this.blocks = blocks;
      this.head = head;
      this.prefix = prefix;
      this.entries = [...entries3];
      this.base = base4;
      this.version = version;
      this.keyChars = keyChars;
      this.maxKeySize = maxKeySize;
      this.additions = additions;
      this.removals = removals;
      this.ops = [];
    }
    /**
     * @param {string} key The key of the value to put.
     * @param {API.UnknownLink} value The value to put.
     * @returns {Promise<void>}
     */
    async put(key, value) {
      if (this.#committed) throw new BatchCommittedError();
      await put2(this.blocks, this, key, value);
      this.ops.push({ type: "put", key, value });
    }
    async commit() {
      if (this.#committed) throw new BatchCommittedError();
      this.#committed = true;
      const res = await commit(this);
      const data = { type: "batch", ops: this.ops, root: res.root };
      const event = await EventBlock.create(data, this.head);
      const mblocks = new MemoryBlockstore();
      const blocks = new MultiBlockFetcher(mblocks, this.blocks);
      mblocks.putSync(event.cid, event.bytes);
      const head = await advance(blocks, this.head, event.cid);
      const additions = /* @__PURE__ */ new Map();
      const removals = /* @__PURE__ */ new Map();
      for (const a of this.additions) {
        additions.set(a.cid.toString(), a);
      }
      for (const r of this.removals) {
        removals.set(r.cid.toString(), r);
      }
      for (const a of res.additions) {
        if (removals.has(a.cid.toString())) {
          removals.delete(a.cid.toString());
        }
        additions.set(a.cid.toString(), a);
      }
      for (const r of res.removals) {
        if (additions.has(r.cid.toString())) {
          additions.delete(r.cid.toString());
        } else {
          removals.set(r.cid.toString(), r);
        }
      }
      return {
        head,
        event,
        root: res.root,
        additions: [...additions.values()],
        removals: [...removals.values()]
      };
    }
    /**
     * @param {object} init
     * @param {API.BlockFetcher} init.blocks Block storage.
     * @param {API.EventLink<API.Operation>[]} init.head Merkle clock head.
     */
    static async create({ blocks, head }) {
      const mblocks = new MemoryBlockstore();
      blocks = new MultiBlockFetcher(mblocks, blocks);
      if (!head.length) {
        const base5 = await ShardBlock.create();
        mblocks.putSync(base5.cid, base5.bytes);
        return new _Batcher({
          blocks,
          head,
          entries: [],
          base: base5,
          additions: [base5],
          removals: [],
          ...configure(base5.value)
        });
      }
      const { root: root2, additions, removals } = await root(blocks, head);
      for (const a of additions) {
        mblocks.putSync(a.cid, a.bytes);
      }
      const shards = new ShardFetcher(blocks);
      const base4 = await shards.get(root2);
      return new _Batcher({
        blocks,
        head,
        entries: base4.value.entries,
        base: base4,
        additions,
        removals,
        ...configure(base4.value)
      });
    }
  };
  var create6 = (blocks, head) => Batcher2.create({ blocks, head });

  // src/blockstore/index.ts
  var blockstore_exports = {};
  __export(blockstore_exports, {
    BaseBlockstore: () => BaseBlockstore,
    CarTransaction: () => CarTransaction,
    CompactionFetcher: () => CompactionFetcher,
    ConnectionBase: () => ConnectionBase,
    EncryptedBlockstore: () => EncryptedBlockstore,
    FragmentGateway: () => FragmentGateway,
    Loader: () => Loader,
    ensureStart: () => ensureStart,
    getGatewayFromURL: () => getGatewayFromURL,
    parseCarFile: () => parseCarFile,
    registerStoreProtocol: () => registerStoreProtocol,
    testStoreFactory: () => testStoreFactory,
    toCIDBlock: () => toCIDBlock,
    toStoreRuntime: () => toStoreRuntime
  });

  // src/blockstore/types.ts
  function toCIDBlock(block) {
    return block;
  }

  // src/blockstore/store-factory.ts
  init_cement();

  // src/runtime/files.ts
  var files_exports = {};
  __export(files_exports, {
    decodeFile: () => decodeFile,
    encodeFile: () => encodeFile2
  });

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/codec.js
  var codec_exports = {};
  __export(codec_exports, {
    DEFAULT_DIRECTORY_MODE: () => DEFAULT_DIRECTORY_MODE,
    DEFAULT_FILE_MODE: () => DEFAULT_FILE_MODE,
    NodeType: () => NodeType,
    code: () => code3,
    createAdvancedFile: () => createAdvancedFile,
    createComplexFile: () => createComplexFile,
    createDirectoryShard: () => createDirectoryShard,
    createEmptyFile: () => createEmptyFile,
    createFileChunk: () => createFileChunk,
    createFileShard: () => createFileShard,
    createFlatDirectory: () => createFlatDirectory,
    createRaw: () => createRaw,
    createShardedDirectory: () => createShardedDirectory,
    createSimpleFile: () => createSimpleFile,
    createSymlink: () => createSymlink,
    cumulativeContentByteLength: () => cumulativeContentByteLength,
    cumulativeDagByteLength: () => cumulativeDagByteLength,
    decode: () => decode10,
    decodeMetadata: () => decodeMetadata,
    encode: () => encode8,
    encodeAdvancedFile: () => encodeAdvancedFile,
    encodeComplexFile: () => encodeComplexFile,
    encodeDirectory: () => encodeDirectory,
    encodeDirectoryMetadata: () => encodeDirectoryMetadata,
    encodeFile: () => encodeFile,
    encodeFileChunk: () => encodeFileChunk,
    encodeFileShard: () => encodeFileShard,
    encodeHAMTShard: () => encodeHAMTShard,
    encodeLink: () => encodeLink2,
    encodeMetadata: () => encodeMetadata,
    encodeMode: () => encodeMode,
    encodeRaw: () => encodeRaw,
    encodeSimpleFile: () => encodeSimpleFile,
    encodeSymlink: () => encodeSymlink,
    filesize: () => filesize,
    matchFile: () => matchFile,
    name: () => name2
  });

  // node_modules/.pnpm/@ipld+dag-pb@4.0.8/node_modules/@ipld/dag-pb/src/pb-decode.js
  var textDecoder2 = new TextDecoder();
  function decodeVarint(bytes, offset) {
    let v = 0;
    for (let shift = 0; ; shift += 7) {
      if (shift >= 64) {
        throw new Error("protobuf: varint overflow");
      }
      if (offset >= bytes.length) {
        throw new Error("protobuf: unexpected end of data");
      }
      const b = bytes[offset++];
      v += shift < 28 ? (b & 127) << shift : (b & 127) * 2 ** shift;
      if (b < 128) {
        break;
      }
    }
    return [v, offset];
  }
  function decodeBytes(bytes, offset) {
    let byteLen;
    [byteLen, offset] = decodeVarint(bytes, offset);
    const postOffset = offset + byteLen;
    if (byteLen < 0 || postOffset < 0) {
      throw new Error("protobuf: invalid length");
    }
    if (postOffset > bytes.length) {
      throw new Error("protobuf: unexpected end of data");
    }
    return [bytes.subarray(offset, postOffset), postOffset];
  }
  function decodeKey(bytes, index2) {
    let wire;
    [wire, index2] = decodeVarint(bytes, index2);
    return [wire & 7, wire >> 3, index2];
  }
  function decodeLink(bytes) {
    const link2 = {};
    const l = bytes.length;
    let index2 = 0;
    while (index2 < l) {
      let wireType, fieldNum;
      [wireType, fieldNum, index2] = decodeKey(bytes, index2);
      if (fieldNum === 1) {
        if (link2.Hash) {
          throw new Error("protobuf: (PBLink) duplicate Hash section");
        }
        if (wireType !== 2) {
          throw new Error(`protobuf: (PBLink) wrong wireType (${wireType}) for Hash`);
        }
        if (link2.Name !== void 0) {
          throw new Error("protobuf: (PBLink) invalid order, found Name before Hash");
        }
        if (link2.Tsize !== void 0) {
          throw new Error("protobuf: (PBLink) invalid order, found Tsize before Hash");
        }
        [link2.Hash, index2] = decodeBytes(bytes, index2);
      } else if (fieldNum === 2) {
        if (link2.Name !== void 0) {
          throw new Error("protobuf: (PBLink) duplicate Name section");
        }
        if (wireType !== 2) {
          throw new Error(`protobuf: (PBLink) wrong wireType (${wireType}) for Name`);
        }
        if (link2.Tsize !== void 0) {
          throw new Error("protobuf: (PBLink) invalid order, found Tsize before Name");
        }
        let byts;
        [byts, index2] = decodeBytes(bytes, index2);
        link2.Name = textDecoder2.decode(byts);
      } else if (fieldNum === 3) {
        if (link2.Tsize !== void 0) {
          throw new Error("protobuf: (PBLink) duplicate Tsize section");
        }
        if (wireType !== 0) {
          throw new Error(`protobuf: (PBLink) wrong wireType (${wireType}) for Tsize`);
        }
        [link2.Tsize, index2] = decodeVarint(bytes, index2);
      } else {
        throw new Error(`protobuf: (PBLink) invalid fieldNumber, expected 1, 2 or 3, got ${fieldNum}`);
      }
    }
    if (index2 > l) {
      throw new Error("protobuf: (PBLink) unexpected end of data");
    }
    return link2;
  }
  function decodeNode(bytes) {
    const l = bytes.length;
    let index2 = 0;
    let links3 = void 0;
    let linksBeforeData = false;
    let data = void 0;
    while (index2 < l) {
      let wireType, fieldNum;
      [wireType, fieldNum, index2] = decodeKey(bytes, index2);
      if (wireType !== 2) {
        throw new Error(`protobuf: (PBNode) invalid wireType, expected 2, got ${wireType}`);
      }
      if (fieldNum === 1) {
        if (data) {
          throw new Error("protobuf: (PBNode) duplicate Data section");
        }
        [data, index2] = decodeBytes(bytes, index2);
        if (links3) {
          linksBeforeData = true;
        }
      } else if (fieldNum === 2) {
        if (linksBeforeData) {
          throw new Error("protobuf: (PBNode) duplicate Links section");
        } else if (!links3) {
          links3 = [];
        }
        let byts;
        [byts, index2] = decodeBytes(bytes, index2);
        links3.push(decodeLink(byts));
      } else {
        throw new Error(`protobuf: (PBNode) invalid fieldNumber, expected 1 or 2, got ${fieldNum}`);
      }
    }
    if (index2 > l) {
      throw new Error("protobuf: (PBNode) unexpected end of data");
    }
    const node = {};
    if (data) {
      node.Data = data;
    }
    node.Links = links3 || [];
    return node;
  }

  // node_modules/.pnpm/@ipld+dag-pb@4.0.8/node_modules/@ipld/dag-pb/src/pb-encode.js
  var textEncoder2 = new TextEncoder();
  var maxInt32 = 2 ** 32;
  var maxUInt32 = 2 ** 31;
  function encodeLink(link2, bytes) {
    let i = bytes.length;
    if (typeof link2.Tsize === "number") {
      if (link2.Tsize < 0) {
        throw new Error("Tsize cannot be negative");
      }
      if (!Number.isSafeInteger(link2.Tsize)) {
        throw new Error("Tsize too large for encoding");
      }
      i = encodeVarint(bytes, i, link2.Tsize) - 1;
      bytes[i] = 24;
    }
    if (typeof link2.Name === "string") {
      const nameBytes = textEncoder2.encode(link2.Name);
      i -= nameBytes.length;
      bytes.set(nameBytes, i);
      i = encodeVarint(bytes, i, nameBytes.length) - 1;
      bytes[i] = 18;
    }
    if (link2.Hash) {
      i -= link2.Hash.length;
      bytes.set(link2.Hash, i);
      i = encodeVarint(bytes, i, link2.Hash.length) - 1;
      bytes[i] = 10;
    }
    return bytes.length - i;
  }
  function encodeNode(node) {
    const size = sizeNode(node);
    const bytes = new Uint8Array(size);
    let i = size;
    if (node.Data) {
      i -= node.Data.length;
      bytes.set(node.Data, i);
      i = encodeVarint(bytes, i, node.Data.length) - 1;
      bytes[i] = 10;
    }
    if (node.Links) {
      for (let index2 = node.Links.length - 1; index2 >= 0; index2--) {
        const size2 = encodeLink(node.Links[index2], bytes.subarray(0, i));
        i -= size2;
        i = encodeVarint(bytes, i, size2) - 1;
        bytes[i] = 18;
      }
    }
    return bytes;
  }
  function sizeLink(link2) {
    let n = 0;
    if (link2.Hash) {
      const l = link2.Hash.length;
      n += 1 + l + sov(l);
    }
    if (typeof link2.Name === "string") {
      const l = textEncoder2.encode(link2.Name).length;
      n += 1 + l + sov(l);
    }
    if (typeof link2.Tsize === "number") {
      n += 1 + sov(link2.Tsize);
    }
    return n;
  }
  function sizeNode(node) {
    let n = 0;
    if (node.Data) {
      const l = node.Data.length;
      n += 1 + l + sov(l);
    }
    if (node.Links) {
      for (const link2 of node.Links) {
        const l = sizeLink(link2);
        n += 1 + l + sov(l);
      }
    }
    return n;
  }
  function encodeVarint(bytes, offset, v) {
    offset -= sov(v);
    const base4 = offset;
    while (v >= maxUInt32) {
      bytes[offset++] = v & 127 | 128;
      v /= 128;
    }
    while (v >= 128) {
      bytes[offset++] = v & 127 | 128;
      v >>>= 7;
    }
    bytes[offset] = v;
    return base4;
  }
  function sov(x) {
    if (x % 2 === 0) {
      x++;
    }
    return Math.floor((len64(x) + 6) / 7);
  }
  function len64(x) {
    let n = 0;
    if (x >= maxInt32) {
      x = Math.floor(x / maxInt32);
      n = 32;
    }
    if (x >= 1 << 16) {
      x >>>= 16;
      n += 16;
    }
    if (x >= 1 << 8) {
      x >>>= 8;
      n += 8;
    }
    return n + len8tab[x];
  }
  var len8tab = [
    0,
    1,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8,
    8
  ];

  // node_modules/.pnpm/@ipld+dag-pb@4.0.8/node_modules/@ipld/dag-pb/src/util.js
  var pbNodeProperties = ["Data", "Links"];
  var pbLinkProperties = ["Hash", "Name", "Tsize"];
  var textEncoder3 = new TextEncoder();
  function linkComparator(a, b) {
    if (a === b) {
      return 0;
    }
    const abuf = a.Name ? textEncoder3.encode(a.Name) : [];
    const bbuf = b.Name ? textEncoder3.encode(b.Name) : [];
    let x = abuf.length;
    let y = bbuf.length;
    for (let i = 0, len = Math.min(x, y); i < len; ++i) {
      if (abuf[i] !== bbuf[i]) {
        x = abuf[i];
        y = bbuf[i];
        break;
      }
    }
    return x < y ? -1 : y < x ? 1 : 0;
  }
  function hasOnlyProperties(node, properties) {
    return !Object.keys(node).some((p) => !properties.includes(p));
  }
  function asLink(link2) {
    if (typeof link2.asCID === "object") {
      const Hash = CID.asCID(link2);
      if (!Hash) {
        throw new TypeError("Invalid DAG-PB form");
      }
      return { Hash };
    }
    if (typeof link2 !== "object" || Array.isArray(link2)) {
      throw new TypeError("Invalid DAG-PB form");
    }
    const pbl = {};
    if (link2.Hash) {
      let cid = CID.asCID(link2.Hash);
      try {
        if (!cid) {
          if (typeof link2.Hash === "string") {
            cid = CID.parse(link2.Hash);
          } else if (link2.Hash instanceof Uint8Array) {
            cid = CID.decode(link2.Hash);
          }
        }
      } catch (e) {
        throw new TypeError(`Invalid DAG-PB form: ${e.message}`);
      }
      if (cid) {
        pbl.Hash = cid;
      }
    }
    if (!pbl.Hash) {
      throw new TypeError("Invalid DAG-PB form");
    }
    if (typeof link2.Name === "string") {
      pbl.Name = link2.Name;
    }
    if (typeof link2.Tsize === "number") {
      pbl.Tsize = link2.Tsize;
    }
    return pbl;
  }
  function prepare(node) {
    if (node instanceof Uint8Array || typeof node === "string") {
      node = { Data: node };
    }
    if (typeof node !== "object" || Array.isArray(node)) {
      throw new TypeError("Invalid DAG-PB form");
    }
    const pbn = {};
    if (node.Data !== void 0) {
      if (typeof node.Data === "string") {
        pbn.Data = textEncoder3.encode(node.Data);
      } else if (node.Data instanceof Uint8Array) {
        pbn.Data = node.Data;
      } else {
        throw new TypeError("Invalid DAG-PB form");
      }
    }
    if (node.Links !== void 0) {
      if (Array.isArray(node.Links)) {
        pbn.Links = node.Links.map(asLink);
        pbn.Links.sort(linkComparator);
      } else {
        throw new TypeError("Invalid DAG-PB form");
      }
    } else {
      pbn.Links = [];
    }
    return pbn;
  }
  function validate(node) {
    if (!node || typeof node !== "object" || Array.isArray(node) || node instanceof Uint8Array || node["/"] && node["/"] === node.bytes) {
      throw new TypeError("Invalid DAG-PB form");
    }
    if (!hasOnlyProperties(node, pbNodeProperties)) {
      throw new TypeError("Invalid DAG-PB form (extraneous properties)");
    }
    if (node.Data !== void 0 && !(node.Data instanceof Uint8Array)) {
      throw new TypeError("Invalid DAG-PB form (Data must be bytes)");
    }
    if (!Array.isArray(node.Links)) {
      throw new TypeError("Invalid DAG-PB form (Links must be a list)");
    }
    for (let i = 0; i < node.Links.length; i++) {
      const link2 = node.Links[i];
      if (!link2 || typeof link2 !== "object" || Array.isArray(link2) || link2 instanceof Uint8Array || link2["/"] && link2["/"] === link2.bytes) {
        throw new TypeError("Invalid DAG-PB form (bad link)");
      }
      if (!hasOnlyProperties(link2, pbLinkProperties)) {
        throw new TypeError("Invalid DAG-PB form (extraneous properties on link)");
      }
      if (link2.Hash === void 0) {
        throw new TypeError("Invalid DAG-PB form (link must have a Hash)");
      }
      if (link2.Hash == null || !link2.Hash["/"] || link2.Hash["/"] !== link2.Hash.bytes) {
        throw new TypeError("Invalid DAG-PB form (link Hash must be a CID)");
      }
      if (link2.Name !== void 0 && typeof link2.Name !== "string") {
        throw new TypeError("Invalid DAG-PB form (link Name must be a string)");
      }
      if (link2.Tsize !== void 0) {
        if (typeof link2.Tsize !== "number" || link2.Tsize % 1 !== 0) {
          throw new TypeError("Invalid DAG-PB form (link Tsize must be an integer)");
        }
        if (link2.Tsize < 0) {
          throw new TypeError("Invalid DAG-PB form (link Tsize cannot be negative)");
        }
      }
      if (i > 0 && linkComparator(link2, node.Links[i - 1]) === -1) {
        throw new TypeError("Invalid DAG-PB form (links must be sorted by Name bytes)");
      }
    }
  }

  // node_modules/.pnpm/@ipld+dag-pb@4.0.8/node_modules/@ipld/dag-pb/src/index.js
  var code2 = 112;
  function encode7(node) {
    validate(node);
    const pbn = {};
    if (node.Links) {
      pbn.Links = node.Links.map((l) => {
        const link2 = {};
        if (l.Hash) {
          link2.Hash = l.Hash.bytes;
        }
        if (l.Name !== void 0) {
          link2.Name = l.Name;
        }
        if (l.Tsize !== void 0) {
          link2.Tsize = l.Tsize;
        }
        return link2;
      });
    }
    if (node.Data) {
      pbn.Data = node.Data;
    }
    return encodeNode(pbn);
  }
  function decode9(bytes) {
    const pbn = decodeNode(bytes);
    const node = {};
    if (pbn.Data) {
      node.Data = pbn.Data;
    }
    if (pbn.Links) {
      node.Links = pbn.Links.map((l) => {
        const link2 = {};
        try {
          link2.Hash = CID.decode(l.Hash);
        } catch (e) {
        }
        if (!link2.Hash) {
          throw new Error("Invalid Hash field found in link, expected CID");
        }
        if (l.Name !== void 0) {
          link2.Name = l.Name;
        }
        if (l.Tsize !== void 0) {
          link2.Tsize = l.Tsize;
        }
        return link2;
      });
    }
    return node;
  }

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/gen/unixfs.js
  var import_minimal = __toESM(require_minimal2(), 1);
  var $Reader = import_minimal.default.Reader;
  var $Writer = import_minimal.default.Writer;
  var $util = import_minimal.default.util;
  var $root = import_minimal.default.roots.unixfs || (import_minimal.default.roots.unixfs = {});
  var Data = $root.Data = (() => {
    function Data3(p) {
      this.blocksizes = [];
      if (p) {
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null)
            this[ks[i]] = p[ks[i]];
      }
    }
    Data3.prototype.Type = 0;
    Data3.prototype.Data = $util.newBuffer([]);
    Data3.prototype.filesize = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
    Data3.prototype.blocksizes = $util.emptyArray;
    Data3.prototype.hashType = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
    Data3.prototype.fanout = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
    Data3.prototype.mode = 0;
    Data3.prototype.mtime = null;
    Data3.encode = function encode18(m, w) {
      if (!w)
        w = $Writer.create();
      w.uint32(8).int32(m.Type);
      if (m.Data != null && Object.hasOwnProperty.call(m, "Data"))
        w.uint32(18).bytes(m.Data);
      if (m.filesize != null && Object.hasOwnProperty.call(m, "filesize"))
        w.uint32(24).uint64(m.filesize);
      if (m.blocksizes != null && m.blocksizes.length) {
        for (var i = 0; i < m.blocksizes.length; ++i)
          w.uint32(32).uint64(m.blocksizes[i]);
      }
      if (m.hashType != null && Object.hasOwnProperty.call(m, "hashType"))
        w.uint32(40).uint64(m.hashType);
      if (m.fanout != null && Object.hasOwnProperty.call(m, "fanout"))
        w.uint32(48).uint64(m.fanout);
      if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
        w.uint32(56).uint32(m.mode);
      if (m.mtime != null && Object.hasOwnProperty.call(m, "mtime"))
        $root.UnixTime.encode(m.mtime, w.uint32(66).fork()).ldelim();
      return w;
    };
    Data3.decode = function decode21(r, l) {
      if (!(r instanceof $Reader))
        r = $Reader.create(r);
      var c = l === void 0 ? r.len : r.pos + l, m = new $root.Data();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1:
            m.Type = r.int32();
            break;
          case 2:
            m.Data = r.bytes();
            break;
          case 3:
            m.filesize = r.uint64();
            break;
          case 4:
            if (!(m.blocksizes && m.blocksizes.length))
              m.blocksizes = [];
            if ((t & 7) === 2) {
              var c2 = r.uint32() + r.pos;
              while (r.pos < c2)
                m.blocksizes.push(r.uint64());
            } else
              m.blocksizes.push(r.uint64());
            break;
          case 5:
            m.hashType = r.uint64();
            break;
          case 6:
            m.fanout = r.uint64();
            break;
          case 7:
            m.mode = r.uint32();
            break;
          case 8:
            m.mtime = $root.UnixTime.decode(r, r.uint32());
            break;
          default:
            r.skipType(t & 7);
            break;
        }
      }
      if (!m.hasOwnProperty("Type"))
        throw $util.ProtocolError("missing required 'Type'", { instance: m });
      return m;
    };
    Data3.fromObject = function fromObject(d) {
      if (d instanceof $root.Data)
        return d;
      var m = new $root.Data();
      switch (d.Type) {
        case "Raw":
        case 0:
          m.Type = 0;
          break;
        case "Directory":
        case 1:
          m.Type = 1;
          break;
        case "File":
        case 2:
          m.Type = 2;
          break;
        case "Metadata":
        case 3:
          m.Type = 3;
          break;
        case "Symlink":
        case 4:
          m.Type = 4;
          break;
        case "HAMTShard":
        case 5:
          m.Type = 5;
          break;
      }
      if (d.Data != null) {
        if (typeof d.Data === "string")
          $util.base64.decode(d.Data, m.Data = $util.newBuffer($util.base64.length(d.Data)), 0);
        else if (d.Data.length)
          m.Data = d.Data;
      }
      if (d.filesize != null) {
        if ($util.Long)
          (m.filesize = $util.Long.fromValue(d.filesize)).unsigned = true;
        else if (typeof d.filesize === "string")
          m.filesize = parseInt(d.filesize, 10);
        else if (typeof d.filesize === "number")
          m.filesize = d.filesize;
        else if (typeof d.filesize === "object")
          m.filesize = new $util.LongBits(d.filesize.low >>> 0, d.filesize.high >>> 0).toNumber(true);
      }
      if (d.blocksizes) {
        if (!Array.isArray(d.blocksizes))
          throw TypeError(".Data.blocksizes: array expected");
        m.blocksizes = [];
        for (var i = 0; i < d.blocksizes.length; ++i) {
          if ($util.Long)
            (m.blocksizes[i] = $util.Long.fromValue(d.blocksizes[i])).unsigned = true;
          else if (typeof d.blocksizes[i] === "string")
            m.blocksizes[i] = parseInt(d.blocksizes[i], 10);
          else if (typeof d.blocksizes[i] === "number")
            m.blocksizes[i] = d.blocksizes[i];
          else if (typeof d.blocksizes[i] === "object")
            m.blocksizes[i] = new $util.LongBits(d.blocksizes[i].low >>> 0, d.blocksizes[i].high >>> 0).toNumber(true);
        }
      }
      if (d.hashType != null) {
        if ($util.Long)
          (m.hashType = $util.Long.fromValue(d.hashType)).unsigned = true;
        else if (typeof d.hashType === "string")
          m.hashType = parseInt(d.hashType, 10);
        else if (typeof d.hashType === "number")
          m.hashType = d.hashType;
        else if (typeof d.hashType === "object")
          m.hashType = new $util.LongBits(d.hashType.low >>> 0, d.hashType.high >>> 0).toNumber(true);
      }
      if (d.fanout != null) {
        if ($util.Long)
          (m.fanout = $util.Long.fromValue(d.fanout)).unsigned = true;
        else if (typeof d.fanout === "string")
          m.fanout = parseInt(d.fanout, 10);
        else if (typeof d.fanout === "number")
          m.fanout = d.fanout;
        else if (typeof d.fanout === "object")
          m.fanout = new $util.LongBits(d.fanout.low >>> 0, d.fanout.high >>> 0).toNumber(true);
      }
      if (d.mode != null) {
        m.mode = d.mode >>> 0;
      }
      if (d.mtime != null) {
        if (typeof d.mtime !== "object")
          throw TypeError(".Data.mtime: object expected");
        m.mtime = $root.UnixTime.fromObject(d.mtime);
      }
      return m;
    };
    Data3.toObject = function toObject(m, o) {
      if (!o)
        o = {};
      var d = {};
      if (o.arrays || o.defaults) {
        d.blocksizes = [];
      }
      if (o.defaults) {
        d.Type = o.enums === String ? "Raw" : 0;
        if (o.bytes === String)
          d.Data = "";
        else {
          d.Data = [];
          if (o.bytes !== Array)
            d.Data = $util.newBuffer(d.Data);
        }
        if ($util.Long) {
          var n = new $util.Long(0, 0, true);
          d.filesize = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
        } else
          d.filesize = o.longs === String ? "0" : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, true);
          d.hashType = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
        } else
          d.hashType = o.longs === String ? "0" : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, true);
          d.fanout = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
        } else
          d.fanout = o.longs === String ? "0" : 0;
        d.mode = 0;
        d.mtime = null;
      }
      if (m.Type != null && m.hasOwnProperty("Type")) {
        d.Type = o.enums === String ? $root.Data.DataType[m.Type] : m.Type;
      }
      if (m.Data != null && m.hasOwnProperty("Data")) {
        d.Data = o.bytes === String ? $util.base64.encode(m.Data, 0, m.Data.length) : o.bytes === Array ? Array.prototype.slice.call(m.Data) : m.Data;
      }
      if (m.filesize != null && m.hasOwnProperty("filesize")) {
        if (typeof m.filesize === "number")
          d.filesize = o.longs === String ? String(m.filesize) : m.filesize;
        else
          d.filesize = o.longs === String ? $util.Long.prototype.toString.call(m.filesize) : o.longs === Number ? new $util.LongBits(m.filesize.low >>> 0, m.filesize.high >>> 0).toNumber(true) : m.filesize;
      }
      if (m.blocksizes && m.blocksizes.length) {
        d.blocksizes = [];
        for (var j = 0; j < m.blocksizes.length; ++j) {
          if (typeof m.blocksizes[j] === "number")
            d.blocksizes[j] = o.longs === String ? String(m.blocksizes[j]) : m.blocksizes[j];
          else
            d.blocksizes[j] = o.longs === String ? $util.Long.prototype.toString.call(m.blocksizes[j]) : o.longs === Number ? new $util.LongBits(m.blocksizes[j].low >>> 0, m.blocksizes[j].high >>> 0).toNumber(true) : m.blocksizes[j];
        }
      }
      if (m.hashType != null && m.hasOwnProperty("hashType")) {
        if (typeof m.hashType === "number")
          d.hashType = o.longs === String ? String(m.hashType) : m.hashType;
        else
          d.hashType = o.longs === String ? $util.Long.prototype.toString.call(m.hashType) : o.longs === Number ? new $util.LongBits(m.hashType.low >>> 0, m.hashType.high >>> 0).toNumber(true) : m.hashType;
      }
      if (m.fanout != null && m.hasOwnProperty("fanout")) {
        if (typeof m.fanout === "number")
          d.fanout = o.longs === String ? String(m.fanout) : m.fanout;
        else
          d.fanout = o.longs === String ? $util.Long.prototype.toString.call(m.fanout) : o.longs === Number ? new $util.LongBits(m.fanout.low >>> 0, m.fanout.high >>> 0).toNumber(true) : m.fanout;
      }
      if (m.mode != null && m.hasOwnProperty("mode")) {
        d.mode = m.mode;
      }
      if (m.mtime != null && m.hasOwnProperty("mtime")) {
        d.mtime = $root.UnixTime.toObject(m.mtime, o);
      }
      return d;
    };
    Data3.prototype.toJSON = function toJSON2() {
      return this.constructor.toObject(this, import_minimal.default.util.toJSONOptions);
    };
    Data3.DataType = function() {
      const valuesById = {}, values = Object.create(valuesById);
      values[valuesById[0] = "Raw"] = 0;
      values[valuesById[1] = "Directory"] = 1;
      values[valuesById[2] = "File"] = 2;
      values[valuesById[3] = "Metadata"] = 3;
      values[valuesById[4] = "Symlink"] = 4;
      values[valuesById[5] = "HAMTShard"] = 5;
      return values;
    }();
    return Data3;
  })();
  var UnixTime = $root.UnixTime = (() => {
    function UnixTime3(p) {
      if (p) {
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null)
            this[ks[i]] = p[ks[i]];
      }
    }
    UnixTime3.prototype.Seconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    UnixTime3.prototype.FractionalNanoseconds = 0;
    UnixTime3.encode = function encode18(m, w) {
      if (!w)
        w = $Writer.create();
      w.uint32(8).int64(m.Seconds);
      if (m.FractionalNanoseconds != null && Object.hasOwnProperty.call(m, "FractionalNanoseconds"))
        w.uint32(21).fixed32(m.FractionalNanoseconds);
      return w;
    };
    UnixTime3.decode = function decode21(r, l) {
      if (!(r instanceof $Reader))
        r = $Reader.create(r);
      var c = l === void 0 ? r.len : r.pos + l, m = new $root.UnixTime();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1:
            m.Seconds = r.int64();
            break;
          case 2:
            m.FractionalNanoseconds = r.fixed32();
            break;
          default:
            r.skipType(t & 7);
            break;
        }
      }
      if (!m.hasOwnProperty("Seconds"))
        throw $util.ProtocolError("missing required 'Seconds'", { instance: m });
      return m;
    };
    UnixTime3.fromObject = function fromObject(d) {
      if (d instanceof $root.UnixTime)
        return d;
      var m = new $root.UnixTime();
      if (d.Seconds != null) {
        if ($util.Long)
          (m.Seconds = $util.Long.fromValue(d.Seconds)).unsigned = false;
        else if (typeof d.Seconds === "string")
          m.Seconds = parseInt(d.Seconds, 10);
        else if (typeof d.Seconds === "number")
          m.Seconds = d.Seconds;
        else if (typeof d.Seconds === "object")
          m.Seconds = new $util.LongBits(d.Seconds.low >>> 0, d.Seconds.high >>> 0).toNumber();
      }
      if (d.FractionalNanoseconds != null) {
        m.FractionalNanoseconds = d.FractionalNanoseconds >>> 0;
      }
      return m;
    };
    UnixTime3.toObject = function toObject(m, o) {
      if (!o)
        o = {};
      var d = {};
      if (o.defaults) {
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.Seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
        } else
          d.Seconds = o.longs === String ? "0" : 0;
        d.FractionalNanoseconds = 0;
      }
      if (m.Seconds != null && m.hasOwnProperty("Seconds")) {
        if (typeof m.Seconds === "number")
          d.Seconds = o.longs === String ? String(m.Seconds) : m.Seconds;
        else
          d.Seconds = o.longs === String ? $util.Long.prototype.toString.call(m.Seconds) : o.longs === Number ? new $util.LongBits(m.Seconds.low >>> 0, m.Seconds.high >>> 0).toNumber() : m.Seconds;
      }
      if (m.FractionalNanoseconds != null && m.hasOwnProperty("FractionalNanoseconds")) {
        d.FractionalNanoseconds = m.FractionalNanoseconds;
      }
      return d;
    };
    UnixTime3.prototype.toJSON = function toJSON2() {
      return this.constructor.toObject(this, import_minimal.default.util.toJSONOptions);
    };
    return UnixTime3;
  })();
  var Metadata = $root.Metadata = (() => {
    function Metadata3(p) {
      if (p) {
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null)
            this[ks[i]] = p[ks[i]];
      }
    }
    Metadata3.prototype.MimeType = "";
    Metadata3.encode = function encode18(m, w) {
      if (!w)
        w = $Writer.create();
      if (m.MimeType != null && Object.hasOwnProperty.call(m, "MimeType"))
        w.uint32(10).string(m.MimeType);
      return w;
    };
    Metadata3.decode = function decode21(r, l) {
      if (!(r instanceof $Reader))
        r = $Reader.create(r);
      var c = l === void 0 ? r.len : r.pos + l, m = new $root.Metadata();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1:
            m.MimeType = r.string();
            break;
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };
    Metadata3.fromObject = function fromObject(d) {
      if (d instanceof $root.Metadata)
        return d;
      var m = new $root.Metadata();
      if (d.MimeType != null) {
        m.MimeType = String(d.MimeType);
      }
      return m;
    };
    Metadata3.toObject = function toObject(m, o) {
      if (!o)
        o = {};
      var d = {};
      if (o.defaults) {
        d.MimeType = "";
      }
      if (m.MimeType != null && m.hasOwnProperty("MimeType")) {
        d.MimeType = m.MimeType;
      }
      return d;
    };
    Metadata3.prototype.toJSON = function toJSON2() {
      return this.constructor.toObject(this, import_minimal.default.util.toJSONOptions);
    };
    return Metadata3;
  })();

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/unixfs.js
  var NodeType = Data.DataType;

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/codec.js
  var EMPTY = Object.freeze([]);
  var EMPTY_BUFFER = new Uint8Array(0);
  var BLANK = Object.freeze({});
  var DEFAULT_FILE_MODE = parseInt("0644", 8);
  var DEFAULT_DIRECTORY_MODE = parseInt("0755", 8);
  var code3 = code2;
  var name2 = "UnixFS";
  var encodePB = (data, links3) => {
    Object(globalThis).debug && console.log({ data, links: links3 });
    return encode7(
      // We run through prepare as links need to be sorted by name which it will
      // do.
      prepare({
        Data: Data.encode(data).finish(),
        // We can cast to mutable array as we know no mutation occurs there
        Links: (
          /** @type {PB.PBLink[]} */
          links3
        )
      })
    );
  };
  var createRaw = (content) => ({
    type: NodeType.Raw,
    content
  });
  var createEmptyFile = (metadata) => createSimpleFile(EMPTY_BUFFER, metadata);
  var createSimpleFile = (content, metadata) => ({
    type: NodeType.File,
    layout: "simple",
    content,
    metadata: decodeMetadata(metadata)
  });
  var createFileChunk = (content) => ({
    type: NodeType.File,
    layout: "simple",
    content
  });
  var createAdvancedFile = (parts, metadata) => ({
    type: NodeType.File,
    layout: "advanced",
    parts,
    metadata: decodeMetadata(metadata)
  });
  var createFileShard = (parts) => ({
    type: NodeType.File,
    layout: "advanced",
    parts
  });
  var createComplexFile = (content, parts, metadata) => ({
    type: NodeType.File,
    layout: "complex",
    content,
    parts,
    metadata: decodeMetadata(metadata)
  });
  var createFlatDirectory = (entries3, metadata) => ({
    type: NodeType.Directory,
    metadata: decodeMetadata(metadata),
    entries: entries3
  });
  var createShardedDirectory = (entries3, bitfield, fanout, hashType, metadata = BLANK) => ({
    type: NodeType.HAMTShard,
    bitfield,
    fanout: readFanout(fanout),
    hashType: readInt(hashType),
    entries: entries3,
    metadata: decodeMetadata(metadata)
  });
  var createDirectoryShard = (entries3, bitfield, fanout, hashType) => ({
    type: NodeType.HAMTShard,
    bitfield,
    fanout: readFanout(fanout),
    hashType: readInt(hashType),
    entries: entries3
  });
  var encodeRaw = (content) => encodePB(
    {
      Type: NodeType.Raw,
      // TODO:
      Data: content.byteLength > 0 ? content : void 0,
      filesize: content.byteLength,
      // @ts-ignore
      blocksizes: EMPTY
    },
    []
  );
  var encodeFile = (node, ignoreMetadata = false) => {
    const metadata = ignoreMetadata ? BLANK : Object(node).metadata;
    switch (node.layout) {
      case "simple":
        return encodeSimpleFile(node.content, metadata);
      case "advanced":
        return encodeAdvancedFile(node.parts, metadata);
      case "complex":
        return encodeComplexFile(node.content, node.parts, metadata);
      default:
        throw new TypeError(
          `File with unknown layout "${Object(node).layout}" was passed`
        );
    }
  };
  var encodeFileChunk = (content) => encodeSimpleFile(content, BLANK);
  var encodeFileShard = (parts) => encodePB(
    {
      Type: NodeType.File,
      blocksizes: parts.map(contentByteLength),
      filesize: cumulativeContentByteLength(parts)
    },
    parts.map(encodeLink2)
  );
  var encodeAdvancedFile = (parts, metadata = BLANK) => encodePB(
    {
      Type: NodeType.File,
      blocksizes: parts.map(contentByteLength),
      filesize: cumulativeContentByteLength(parts),
      ...encodeMetadata(metadata)
    },
    parts.map(encodeLink2)
  );
  var encodeLink2 = (dag) => ({
    Name: "",
    Tsize: dag.dagByteLength,
    // @ts-ignore - @see https://github.com/multiformats/js-multiformats/pull/161
    Hash: dag.cid
  });
  var encodeSimpleFile = (content, metadata = BLANK) => encodePB(
    {
      Type: NodeType.File,
      // adding empty file to both go-ipfs and js-ipfs produces block in
      // which `Data` is omitted but filesize and blocksizes are present.
      // For the sake of hash consistency we do the same.
      Data: content.byteLength > 0 ? content : void 0,
      filesize: content.byteLength,
      blocksizes: [],
      ...encodeMetadata(metadata)
    },
    []
  );
  var encodeComplexFile = (content, parts, metadata = BLANK) => encodePB(
    {
      Type: NodeType.File,
      Data: content,
      filesize: content.byteLength + cumulativeContentByteLength(parts),
      blocksizes: parts.map(contentByteLength)
    },
    parts.map(encodeLink2)
  );
  var encodeDirectory = (node) => encodePB(
    {
      Type: node.type,
      ...encodeDirectoryMetadata(node.metadata || BLANK)
    },
    node.entries.map(encodeNamedLink)
  );
  var encodeHAMTShard = ({
    bitfield,
    fanout,
    hashType,
    entries: entries3,
    metadata = BLANK
  }) => encodePB(
    {
      Type: NodeType.HAMTShard,
      Data: bitfield.byteLength > 0 ? bitfield : void 0,
      fanout: readFanout(fanout),
      hashType: readInt(hashType),
      ...encodeDirectoryMetadata(metadata)
    },
    entries3.map(encodeNamedLink)
  );
  var readFanout = (n) => {
    if (Math.log2(n) % 1 === 0) {
      return n;
    } else {
      throw new TypeError(
        `Expected hamt size to be a power of two instead got ${n}`
      );
    }
  };
  var readInt = (n) => {
    if (Number.isInteger(n)) {
      return n;
    } else {
      throw new TypeError(`Expected an integer value instead got ${n}`);
    }
  };
  var createSymlink = (path, metadata = BLANK) => ({
    type: NodeType.Symlink,
    content: path,
    metadata: decodeMetadata(metadata)
  });
  var encodeSymlink = (node, ignoreMetadata = false) => {
    const metadata = ignoreMetadata ? BLANK : Object(node).metadata;
    return encodePB(
      {
        Type: NodeType.Symlink,
        Data: node.content,
        ...encodeMetadata(metadata || BLANK)
      },
      []
    );
  };
  var encode8 = (node, root2 = true) => {
    switch (node.type) {
      case NodeType.Raw:
        return encodeRaw(node.content);
      case NodeType.File:
        return encodeFile(node);
      case NodeType.Directory:
        return encodeDirectory(node);
      case NodeType.HAMTShard:
        return encodeHAMTShard(node);
      case NodeType.Symlink:
        return encodeSymlink(node);
      default:
        throw new Error(`Unknown node type ${Object(node).type}`);
    }
  };
  var decode10 = (bytes) => {
    const pb = decode9(bytes);
    const message2 = Data.decode(
      /** @type {Uint8Array} */
      pb.Data
    );
    const {
      Type: type2,
      Data: data,
      mtime,
      mode,
      blocksizes,
      ...rest
    } = Data.toObject(message2, {
      defaults: false,
      arrays: true,
      longs: Number,
      objects: false
    });
    const metadata = {
      ...mode && { mode },
      ...decodeMtime(mtime)
    };
    const links3 = pb.Links;
    switch (message2.Type) {
      case NodeType.Raw:
        return createRaw(data);
      case NodeType.File:
        if (links3.length === 0) {
          return new SimpleFileView(data, metadata);
        } else if (data.byteLength === 0) {
          return new AdvancedFileView(
            decodeFileLinks(rest.blocksizes, links3),
            metadata
          );
        } else {
          return new ComplexFileView(
            data,
            decodeFileLinks(rest.blocksizes, links3),
            metadata
          );
        }
      case NodeType.Directory:
        return createFlatDirectory(decodeDirectoryLinks(links3), metadata);
      case NodeType.HAMTShard:
        return createShardedDirectory(
          decodeDirectoryLinks(links3),
          data || EMPTY_BUFFER,
          rest.fanout,
          rest.hashType,
          metadata
        );
      case NodeType.Symlink:
        return createSymlink(data, metadata);
      default:
        throw new TypeError(`Unsupported node type ${message2.Type}`);
    }
  };
  var decodeMtime = (mtime) => mtime == null ? void 0 : {
    mtime: { secs: mtime.Seconds, nsecs: mtime.FractionalNanoseconds || 0 }
  };
  var decodeFileLinks = (blocksizes, links3) => {
    const parts = [];
    const length4 = blocksizes.length;
    let n = 0;
    while (n < length4) {
      parts.push(
        /** @type {UnixFS.FileLink} */
        {
          cid: links3[n].Hash,
          dagByteLength: links3[n].Tsize || 0,
          contentByteLength: blocksizes[n]
        }
      );
    }
    return parts;
  };
  var decodeDirectoryLinks = (links3) => links3.map(
    (link2) => (
      /** @type {UnixFS.DirectoryEntryLink} */
      {
        cid: link2.Hash,
        name: link2.Name || "",
        dagByteLength: link2.Tsize || 0
      }
    )
  );
  var cumulativeContentByteLength = (links3) => links3.reduce((size, link2) => size + link2.contentByteLength, 0);
  var cumulativeDagByteLength = (root2, links3) => links3.reduce((size, link2) => size + link2.dagByteLength, root2.byteLength);
  var contentByteLength = (link2) => link2.contentByteLength;
  var encodeNamedLink = ({ name: name7, dagByteLength, cid }) => ({
    Name: name7,
    Tsize: dagByteLength,
    Hash: cid
  });
  var encodeDirectoryMetadata = (metadata) => encodeMetadata(metadata, DEFAULT_DIRECTORY_MODE);
  var encodeMetadata = ({ mode, mtime }, defaultMode = DEFAULT_FILE_MODE) => ({
    mode: mode != null ? encodeMode(mode, defaultMode) : void 0,
    mtime: mtime != null ? encodeMTime(mtime) : void 0
  });
  var decodeMetadata = (data) => data == null ? BLANK : {
    ...data.mode == null ? void 0 : { mode: decodeMode(data.mode) },
    ...data.mtime == null ? void 0 : { mtime: data.mtime }
  };
  var encodeMTime = (mtime) => {
    return mtime == null ? void 0 : mtime.nsecs !== 0 ? { Seconds: mtime.secs, FractionalNanoseconds: mtime.nsecs } : { Seconds: mtime.secs };
  };
  var encodeMode = (specifiedMode, defaultMode) => {
    const mode = specifiedMode == null ? void 0 : decodeMode(specifiedMode);
    return mode === defaultMode || mode == null ? void 0 : mode;
  };
  var decodeMode = (mode) => mode & 4095 | mode & 4294963200;
  var matchFile = ({
    content = EMPTY_BUFFER,
    parts = EMPTY,
    metadata = BLANK,
    ...rest
  }) => {
    if (parts.length === 0) {
      return new SimpleFileView(content, metadata);
    } else if (content.byteLength === 0) {
      return new AdvancedFileView(parts, metadata);
    } else {
      return new ComplexFileView(content, parts, metadata);
    }
  };
  var SimpleFileView = class {
    /**
     * @param {Uint8Array} content
     * @param {UnixFS.Metadata} metadata
     */
    constructor(content, metadata) {
      this.content = content;
      this.metadata = metadata;
      this.layout = "simple";
      this.type = NodeType.File;
    }
    get filesize() {
      return this.content.byteLength;
    }
    encode() {
      return encodeSimpleFile(this.content, this.metadata);
    }
  };
  var AdvancedFileView = class {
    /**
     * @param {ReadonlyArray<UnixFS.FileLink>} parts
     * @param {UnixFS.Metadata} metadata
     */
    constructor(parts, metadata) {
      this.parts = parts;
      this.metadata = metadata;
    }
    /** @type {"advanced"} */
    get layout() {
      return "advanced";
    }
    /**
     * @returns {NodeType.File}
     */
    get type() {
      return NodeType.File;
    }
    get fileSize() {
      return cumulativeContentByteLength(this.parts);
    }
    get blockSizes() {
      return this.parts.map(contentByteLength);
    }
    encode() {
      return encodeAdvancedFile(this.parts, this.metadata);
    }
  };
  var ComplexFileView = class {
    /**
     * @param {Uint8Array} content
     * @param {ReadonlyArray<UnixFS.FileLink>} parts
     * @param {UnixFS.Metadata} metadata
     */
    constructor(content, parts, metadata) {
      this.content = content;
      this.parts = parts;
      this.metadata = metadata;
    }
    /** @type {"complex"} */
    get layout() {
      return "complex";
    }
    /**
     * @returns {NodeType.File}
     */
    get type() {
      return NodeType.File;
    }
    get fileSize() {
      return this.content.byteLength + cumulativeContentByteLength(this.parts);
    }
    get blockSizes() {
      return this.parts.map(contentByteLength);
    }
    encode() {
      return encodeComplexFile(this.content, this.parts, this.metadata);
    }
  };
  var filesize = (node) => {
    switch (node.type) {
      case NodeType.Raw:
      case NodeType.Symlink:
        return node.content.byteLength;
      case NodeType.File:
        switch (node.layout) {
          case "simple":
            return node.content.byteLength;
          case "advanced":
            return cumulativeContentByteLength(node.parts);
          case "complex":
            return node.content.byteLength + cumulativeContentByteLength(node.parts);
        }
      default:
        return 0;
    }
  };

  // node_modules/.pnpm/actor@2.3.1/node_modules/actor/src/lib.js
  var effect = function* (task) {
    const message2 = yield* task;
    yield* send(message2);
  };
  function* current() {
    return (
      /** @type {Task.Controller<T, X, M>} */
      yield CURRENT
    );
  }
  var suspend = function* () {
    yield SUSPEND;
  };
  var wait = function* (input) {
    const task = yield* current();
    if (isAsync(input)) {
      let failed = false;
      let output = void 0;
      input.then(
        (value) => {
          failed = false;
          output = value;
          enqueue(task);
        },
        (error) => {
          failed = true;
          output = error;
          enqueue(task);
        }
      );
      yield* suspend();
      if (failed) {
        throw output;
      } else {
        return (
          /** @type {T} */
          output
        );
      }
    } else {
      main(wake(task));
      yield* suspend();
      return input;
    }
  };
  function* wake(task) {
    enqueue(task);
  }
  var isAsync = (node) => node != null && typeof /** @type {{then?:unknown}} */
  node.then === "function";
  var send = function* (message2) {
    yield (
      /** @type {Task.Message<T>} */
      message2
    );
  };
  var listen = function* (source) {
    const forks = [];
    for (const entry of Object.entries(source)) {
      const [name7, effect2] = (
        /** @type {[Tag, Task.Effect<T>]} */
        entry
      );
      if (effect2 !== NONE) {
        forks.push(yield* fork(tag(effect2, name7)));
      }
    }
    yield* group(forks);
  };
  var effects = (tasks) => tasks.length > 0 ? batch(tasks.map(effect)) : NONE;
  function* batch(effects2) {
    const forks = [];
    for (const effect2 of effects2) {
      forks.push(yield* fork(effect2));
    }
    yield* group(forks);
  }
  var tag = (effect2, tag2) => (
    // @ts-ignore
    effect2 === NONE ? NONE : effect2 instanceof Tagger ? new Tagger([...effect2.tags, tag2], effect2.source) : new Tagger([tag2], effect2)
  );
  var Tagger = class {
    /**
     * @param {Task.Task<Success, Failure, Message>} source
     * @param {string[]} tags
     */
    constructor(tags, source) {
      this.tags = tags;
      this.source = source;
      this.controller;
    }
    /* c8 ignore next 3 */
    [Symbol.iterator]() {
      if (!this.controller) {
        this.controller = this.source[Symbol.iterator]();
      }
      return this;
    }
    /**
     * @param {Task.TaskState<Success, Message>} state
     * @returns {Task.TaskState<Success, Tagged<Tag, Message>>}
     */
    box(state) {
      if (state.done) {
        return state;
      } else {
        switch (state.value) {
          case SUSPEND:
          case CURRENT:
            return (
              /** @type {Task.TaskState<Success, Tagged<Tag, Message>>} */
              state
            );
          default: {
            const tagged = (
              /** @type {{ done: false, value: any }} */
              state
            );
            let { value } = tagged;
            for (const tag2 of this.tags) {
              value = withTag(tag2, value);
            }
            tagged.value = value;
            return tagged;
          }
        }
      }
    }
    /**
     *
     * @param {Task.Instruction<Message>} instruction
     */
    next(instruction) {
      return this.box(this.controller.next(instruction));
    }
    /**
     *
     * @param {Failure} error
     */
    throw(error) {
      return this.box(this.controller.throw(error));
    }
    /**
     * @param {Success} value
     */
    return(value) {
      return this.box(this.controller.return(value));
    }
    get [Symbol.toStringTag]() {
      return "TaggedEffect";
    }
  };
  var none = () => NONE;
  var withTag = (tag2, value) => (
    /** @type {Tagged<Tag, T>} */
    { type: tag2, [tag2]: value }
  );
  var CURRENT = Symbol("current");
  var SUSPEND = Symbol("suspend");
  var Group = class _Group {
    /**
     * @template T, X, M
     * @param {Task.Controller<T, X, M>|Task.Fork<T, X, M>} member
     * @returns {Task.Group<T, X, M>}
     */
    static of(member) {
      return (
        /** @type {{group?:Task.TaskGroup<T, X, M>}} */
        member.group || MAIN
      );
    }
    /**
     * @template T, X, M
     * @param {(Task.Controller<T, X, M>|Task.Fork<T, X, M>) & {group?:Task.TaskGroup<T, X, M>}} member
     * @param {Task.TaskGroup<T, X, M>} group
     */
    static enqueue(member, group2) {
      member.group = group2;
      group2.stack.active.push(member);
    }
    /**
     * @param {Task.Controller<T, X, M>} driver
     * @param {Task.Controller<T, X, M>[]} [active]
     * @param {Set<Task.Controller<T, X, M>>} [idle]
     * @param {Task.Stack<T, X, M>} [stack]
     */
    constructor(driver, active = [], idle = /* @__PURE__ */ new Set(), stack = new Stack(active, idle)) {
      this.driver = driver;
      this.parent = _Group.of(driver);
      this.stack = stack;
      this.id = ++ID;
    }
  };
  var Main = class {
    constructor() {
      this.status = IDLE;
      this.stack = new Stack();
      this.id = /** @type {0} */
      0;
    }
  };
  var Stack = class {
    /**
     * @param {Task.Controller<T, X, M>[]} [active]
     * @param {Set<Task.Controller<T, X, M>>} [idle]
     */
    constructor(active = [], idle = /* @__PURE__ */ new Set()) {
      this.active = active;
      this.idle = idle;
    }
    /**
     *
     * @param {Task.Stack<unknown, unknown, unknown>} stack
     * @returns
     */
    static size({ active, idle }) {
      return active.length + idle.size;
    }
  };
  var main = (task) => enqueue(task[Symbol.iterator]());
  var enqueue = (task) => {
    let group2 = Group.of(task);
    group2.stack.active.push(task);
    group2.stack.idle.delete(task);
    while (group2.parent) {
      const { idle, active } = group2.parent.stack;
      if (idle.has(group2.driver)) {
        idle.delete(group2.driver);
        active.push(group2.driver);
      } else {
        break;
      }
      group2 = group2.parent;
    }
    if (MAIN.status === IDLE) {
      MAIN.status = ACTIVE;
      while (true) {
        try {
          for (const _message of step(MAIN)) {
          }
          MAIN.status = IDLE;
          break;
        } catch (_error) {
          MAIN.stack.active.shift();
        }
      }
    }
  };
  var resume = (task) => enqueue(task);
  var step = function* (group2) {
    const { active } = group2.stack;
    let task = active[0];
    group2.stack.idle.delete(task);
    while (task) {
      let state = INIT;
      loop: while (!state.done && task === active[0]) {
        const instruction = state.value;
        switch (instruction) {
          // if task is suspended we add it to the idle list and break the loop
          // to move to a next task.
          case SUSPEND:
            group2.stack.idle.add(task);
            break loop;
          // if task requested a context (which is usually to suspend itself)
          // pass back a task reference and continue.
          case CURRENT:
            state = task.next(task);
            break;
          default:
            state = task.next(
              yield (
                /** @type {M & Task.Message<M>}*/
                instruction
              )
            );
            break;
        }
      }
      active.shift();
      task = active[0];
      group2.stack.idle.delete(task);
    }
  };
  var fork = (task, options) => new Fork(task, options);
  var exit = (handle, value) => conclude(handle, { ok: true, value });
  var abort = (handle, error) => conclude(handle, { ok: false, error });
  function* conclude(handle, result) {
    try {
      const task = handle;
      const state = result.ok ? task.return(result.value) : task.throw(result.error);
      if (!state.done) {
        if (state.value === SUSPEND) {
          const { idle } = Group.of(task).stack;
          idle.add(task);
        } else {
          enqueue(task);
        }
      }
    } catch (error) {
    }
  }
  function* group(forks) {
    if (forks.length === 0) return;
    const self2 = yield* current();
    const group2 = new Group(self2);
    let failure = null;
    for (const fork4 of forks) {
      const { result } = fork4;
      if (result) {
        if (!result.ok && !failure) {
          failure = result;
        }
        continue;
      }
      move(fork4, group2);
    }
    try {
      if (failure) {
        throw failure.error;
      }
      while (true) {
        yield* step(group2);
        if (Stack.size(group2.stack) > 0) {
          yield* suspend();
        } else {
          break;
        }
      }
    } catch (error) {
      for (const task of group2.stack.active) {
        yield* abort(task, error);
      }
      for (const task of group2.stack.idle) {
        yield* abort(task, error);
        enqueue(task);
      }
      throw error;
    }
  }
  var move = (fork4, group2) => {
    const from8 = Group.of(fork4);
    if (from8 !== group2) {
      const { active, idle } = from8.stack;
      const target = group2.stack;
      fork4.group = group2;
      if (idle.has(fork4)) {
        idle.delete(fork4);
        target.idle.add(fork4);
      } else {
        const index2 = active.indexOf(fork4);
        if (index2 >= 0) {
          active.splice(index2, 1);
          target.active.push(fork4);
        }
      }
    }
  };
  function* join(fork4) {
    if (fork4.status === IDLE) {
      yield* fork4;
    }
    if (!fork4.result) {
      yield* group([fork4]);
    }
    const result = (
      /** @type {Task.Result<T, X>} */
      fork4.result
    );
    if (result.ok) {
      return result.value;
    } else {
      throw result.error;
    }
  }
  var Future2 = class {
    /**
     * @param {Task.StateHandler<T, X>} handler
     */
    constructor(handler) {
      this.handler = handler;
      this.result;
    }
    /**
     * @type {Promise<T>}
     */
    get promise() {
      const { result } = this;
      const promise = result == null ? new Promise((succeed, fail) => {
        this.handler.onsuccess = succeed;
        this.handler.onfailure = fail;
      }) : result.ok ? Promise.resolve(result.value) : Promise.reject(result.error);
      Object.defineProperty(this, "promise", { value: promise });
      return promise;
    }
    /**
     * @template U, [E=never]
     * @param {((value:T) => U | PromiseLike<U>)|undefined|null} [onresolve]
     * @param {((error:X) => E|PromiseLike<E>)|undefined|null} [onreject]
     * @returns {Promise<U|E>}
     */
    then(onresolve, onreject) {
      return this.activate().promise.then(onresolve, onreject);
    }
    /**
     * @template [U=never]
     * @param {(error:X) => U} onreject
     */
    catch(onreject) {
      return (
        /** @type {Task.Future<T|U, never>} */
        this.activate().promise.catch(onreject)
      );
    }
    /**
     * @param {() => void} onfinally
     * @returns {Task.Future<T, X>}
     */
    finally(onfinally) {
      return (
        /** @type {Task.Future<T, X>} */
        this.activate().promise.finally(onfinally)
      );
    }
    /**
     * @abstract
     */
    /* c8 ignore next 3 */
    activate() {
      return this;
    }
  };
  var Fork = class extends Future2 {
    /**
     * @param {Task.Task<T, X, M>} task
     * @param {Task.ForkOptions} [options]
     * @param {Task.StateHandler<T, X>} [handler]
     * @param {Task.TaskState<T, M>} [state]
     */
    constructor(task, options = BLANK2, handler = {}, state = INIT) {
      super(handler);
      this.id = ++ID;
      this.name = options.name || "";
      this.task = task;
      this.state = state;
      this.status = IDLE;
      this.result;
      this.handler = handler;
      this.controller;
    }
    *resume() {
      resume(this);
    }
    /**
     * @returns {Task.Task<T, X, M>}
     */
    join() {
      return join(this);
    }
    /**
     * @param {X} error
     */
    abort(error) {
      return abort(this, error);
    }
    /**
     * @param {T} value
     */
    exit(value) {
      return exit(this, value);
    }
    get [Symbol.toStringTag]() {
      return "Fork";
    }
    /**
     * @returns {Task.Controller<Task.Fork<T, X, M>, never, never>}
     */
    *[Symbol.iterator]() {
      return this.activate();
    }
    activate() {
      this.controller = this.task[Symbol.iterator]();
      this.status = ACTIVE;
      enqueue(this);
      return this;
    }
    /**
     * @private
     * @param {any} error
     * @returns {never}
     */
    panic(error) {
      this.result = { ok: false, error };
      this.status = FINISHED;
      const { handler } = this;
      if (handler.onfailure) {
        handler.onfailure(error);
      }
      throw error;
    }
    /**
     * @private
     * @param {Task.TaskState<T, M>} state
     */
    step(state) {
      this.state = state;
      if (state.done) {
        this.result = { ok: true, value: state.value };
        this.status = FINISHED;
        const { handler } = this;
        if (handler.onsuccess) {
          handler.onsuccess(state.value);
        }
      }
      return state;
    }
    /**
     * @param {unknown} value
     */
    next(value) {
      try {
        return this.step(this.controller.next(value));
      } catch (error) {
        return this.panic(error);
      }
    }
    /**
     * @param {T} value
     */
    return(value) {
      try {
        return this.step(this.controller.return(value));
      } catch (error) {
        return this.panic(error);
      }
    }
    /**
     * @param {X} error
     */
    throw(error) {
      try {
        return this.step(this.controller.throw(error));
      } catch (error2) {
        return this.panic(error2);
      }
    }
  };
  var loop = function* (init2, next) {
    const controller = yield* current();
    const group2 = new Group(controller);
    Group.enqueue(init2[Symbol.iterator](), group2);
    while (true) {
      for (const message2 of step(group2)) {
        Group.enqueue(next(message2)[Symbol.iterator](), group2);
      }
      if (Stack.size(group2.stack) > 0) {
        yield* suspend();
      } else {
        break;
      }
    }
  };
  var ID = 0;
  var IDLE = "idle";
  var ACTIVE = "active";
  var FINISHED = "finished";
  var INIT = { done: false, value: CURRENT };
  var BLANK2 = {};
  var NONE = function* none2() {
  }();
  var MAIN = new Main();

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file/chunker/indexed.js
  function Indexed() {
  }
  Object.defineProperties(Indexed, {
    prototype: {
      value: new Proxy(Object.prototype, {
        /**
         * @param {object} target
         * @param {PropertyKey} property
         * @param {{get(key:PropertyKey): any}} receiver
         */
        get(target, property, receiver) {
          return typeof property === "symbol" ? Reflect.get(target, property, receiver) : receiver.get(property);
        }
      })
    }
  });

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file/chunker/buffer.js
  var empty2 = () => new BufferView();
  var slice2 = (buffer2, startOffset = 0, endOffset = buffer2.byteLength) => {
    const segments = [];
    const start = startOffset < 0 ? buffer2.byteLength - startOffset : startOffset;
    const end = endOffset < 0 ? buffer2.byteLength - endOffset : endOffset;
    if (start === 0 && end >= buffer2.byteLength) {
      return buffer2;
    }
    if (start > end || start > buffer2.byteLength || end <= 0) {
      return empty2();
    }
    let byteLength = 0;
    let offset = 0;
    for (const segment of buffer2.segments) {
      const nextOffset = offset + segment.byteLength;
      if (byteLength === 0) {
        if (end <= nextOffset) {
          const range = segment.subarray(start - offset, end - offset);
          segments.push(range);
          byteLength = range.byteLength;
          break;
        } else if (start < nextOffset) {
          const range = start === offset ? segment : segment.subarray(start - offset);
          segments.push(range);
          byteLength = range.byteLength;
        }
      } else if (end <= nextOffset) {
        const range = end === nextOffset ? segment : segment.subarray(0, end - offset);
        segments.push(range);
        byteLength += range.byteLength;
        break;
      } else {
        segments.push(segment);
        byteLength += segment.byteLength;
      }
      offset = nextOffset;
    }
    return new BufferView(segments, buffer2.byteOffset + start, byteLength);
  };
  var push = (buffer2, part) => {
    if (part.byteLength > 0) {
      buffer2.segments.push(part);
      return new BufferView(
        buffer2.segments,
        buffer2.byteOffset,
        buffer2.byteLength + part.byteLength
      );
    } else {
      return buffer2;
    }
  };
  var get4 = (buffer2, n) => {
    if (n < buffer2.byteLength) {
      let offset = 0;
      for (const segment of buffer2.segments) {
        if (n < offset + segment.byteLength) {
          return segment[n - offset];
        } else {
          offset += segment.byteLength;
        }
      }
    }
    return void 0;
  };
  var copyTo = (buffer2, target, byteOffset) => {
    let offset = byteOffset;
    for (const segment of buffer2.segments) {
      target.set(segment, offset);
      offset += segment.byteLength;
    }
    return target;
  };
  function* iterate(buffer2) {
    for (const part of buffer2.segments) {
      yield* part;
    }
  }
  var BufferView = class extends Indexed {
    /**
     * @param {Uint8Array[]} segments
     * @param {number} byteOffset
     * @param {number} byteLength
     */
    constructor(segments = [], byteOffset = 0, byteLength = 0) {
      super();
      this.segments = segments;
      this.byteLength = byteLength;
      this.length = byteLength;
      this.byteOffset = byteOffset;
    }
    [Symbol.iterator]() {
      return iterate(this);
    }
    /**
     * @param {number} [start]
     * @param {number} [end]
     */
    slice(start, end) {
      return (
        /** @type {BufferView} */
        slice2(this, start, end)
      );
    }
    /**
     * @param {number} [start]
     * @param {number} [end]
     */
    subarray(start, end) {
      return (
        /** @type {BufferView} */
        slice2(this, start, end)
      );
    }
    /**
     *
     * @param {Uint8Array} bytes
     */
    push(bytes) {
      return (
        /** @type {BufferView} */
        push(this, bytes)
      );
    }
    /**
     * @param {number} n
     */
    get(n) {
      return get4(this, n);
    }
    /**
     *
     * @param {Uint8Array} target
     * @param {number} offset
     */
    copyTo(target, offset) {
      return copyTo(this, target, offset);
    }
  };

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/writer/util.js
  var panic = (reason) => {
    throw new Error(reason);
  };
  var unreachable = (template, subject, ...substitutions) => panic(String.raw(template, JSON.stringify(subject), ...substitutions));
  var EMPTY_BUFFER2 = new Uint8Array(0);
  var EMPTY2 = [];

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file/chunker.js
  var open = (config2) => ({
    config: config2,
    buffer: empty2()
  });
  var write = (state, bytes) => bytes.byteLength > 0 ? split(state.config, state.buffer.push(bytes), false) : { ...state, chunks: EMPTY2 };
  var close = (state) => split(state.config, state.buffer, true);
  var split = (config2, buffer2, end) => {
    const chunker = config2.chunker;
    const chunks = [];
    let offset = 0;
    for (const size of chunker.cut(chunker.context, buffer2, end)) {
      if (size > 0) {
        const chunk = buffer2.subarray(offset, offset + size);
        chunks.push(chunk);
        offset += size;
      }
    }
    return { config: config2, chunks, buffer: buffer2.subarray(offset) };
  };

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file/layout/queue.js
  var mutable = () => ({
    mutable: true,
    needs: {},
    nodes: {},
    links: {},
    linked: EMPTY3
  });
  var addNodes = (newNodes, input) => {
    let queue = patch(input, {});
    for (const node of newNodes) {
      const { ready, has: has2, wants } = collect(node.children, queue.links);
      if (wants.length === 0) {
        queue = patch(queue, {
          links: assign(void 0, has2),
          linked: [{ id: node.id, links: ready }]
        });
      } else {
        queue = patch(queue, {
          needs: assign(node.id, wants),
          nodes: {
            [node.id]: {
              children: node.children,
              count: wants.length
            }
          }
        });
      }
    }
    return queue;
  };
  var addLink = (id, link2, queue) => {
    const nodeID = queue.needs[id];
    const node = queue.nodes[nodeID];
    if (node != null) {
      if (node.count === 1) {
        const { ready, has: has2 } = collect(node.children, {
          ...queue.links,
          [id]: link2
        });
        return patch(queue, {
          needs: { [id]: void 0 },
          links: assign(void 0, has2),
          nodes: { [nodeID]: void 0 },
          linked: [{ id: nodeID, links: ready }]
        });
      } else {
        return patch(queue, {
          needs: { [id]: void 0 },
          links: { [id]: link2 },
          nodes: {
            [nodeID]: {
              ...node,
              count: node.count - 1
            }
          }
        });
      }
    } else {
      return patch(queue, {
        links: { [id]: link2 }
      });
    }
  };
  var patch = (queue, { needs, nodes, links: links3, linked }) => {
    const result = queue.mutable ? queue : { ...queue };
    const original = queue.mutable ? BLANK3 : void 0;
    if (needs) {
      result.needs = patchDict(queue.needs, needs, original);
    }
    if (nodes) {
      result.nodes = patchDict(queue.nodes, nodes, original);
    }
    if (links3) {
      result.links = patchDict(queue.links, links3, original);
    }
    result.linked = linked ? append(queue.linked || EMPTY3, linked, EMPTY3) : queue.linked || [];
    return (
      /** @type {Queue.Result} */
      result
    );
  };
  var assign = (value, keys) => {
    const delta = (
      /** @type {Record<K, V>} */
      {}
    );
    for (const key of keys) {
      delta[key] = value;
    }
    return delta;
  };
  var patchDict = (target, delta, original = target) => {
    const result = target === original ? { ...target } : target;
    for (const entry of Object.entries(delta)) {
      const [id, value] = (
        /** @type {[K, V|void]} */
        entry
      );
      if (value == null) {
        delete result[id];
      } else {
        result[id] = value;
      }
    }
    return result;
  };
  var append = (target, items, original = target) => {
    if (target === original) {
      return [...target, ...items];
    } else {
      for (const item of items) {
        target.push(item);
      }
      return target;
    }
  };
  var collect = (children, source) => {
    const has2 = [];
    const wants = [];
    const ready = [];
    for (const child of children) {
      const link2 = source[child];
      if (link2) {
        has2.push(child);
        ready.push(link2);
      } else {
        wants.push(child);
      }
    }
    return { has: has2, wants, ready };
  };
  var EMPTY3 = (
    /** @type {never[]} */
    Object.freeze([])
  );
  var BLANK3 = (
    /** @type {Record<never, never>} */
    Object.freeze({})
  );

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file/writer.js
  var update = (message2, state) => {
    switch (message2.type) {
      case "write":
        return write2(state, message2.bytes);
      case "link":
        return link(state, message2.link);
      /* c8 ignore next 2 */
      case "block":
        return { state, effect: none() };
      case "close":
        return close2(state);
      case "end":
        return { state, effect: none() };
      default:
        return unreachable`File Writer got unknown message ${message2}`;
    }
  };
  var init = (writer, metadata, config2) => {
    return {
      status: "open",
      metadata,
      config: config2,
      writer,
      chunker: open({ chunker: config2.chunker }),
      layout: config2.fileLayout.open(),
      // Note: Writing in large slices e.g. 1GiB at a time creates large queues
      // with around `16353` items. Immutable version ends up copying it every
      // time state of the queue changes, which introduces significant overhead.
      // To avoid this overhead we use mutable implementation which is API
      // compatible but makes in place updates.
      // TODO: We should consider using Persistent bit-partitioned vector tries
      // instead of arrays which would provide immutable interface with neglegable
      // overhead.
      // @see https://github.com/Gozala/vectrie
      nodeQueue: mutable()
    };
  };
  var write2 = (state, bytes) => {
    if (state.status === "open") {
      const { chunks, ...chunker } = write(state.chunker, bytes);
      const { nodes, leaves, layout } = state.config.fileLayout.write(
        state.layout,
        chunks
      );
      const { linked, ...nodeQueue } = addNodes(nodes, state.nodeQueue);
      const tasks = [
        ...encodeLeaves(leaves, state.config),
        ...encodeBranches(linked, state.config)
      ];
      return {
        state: {
          ...state,
          chunker,
          layout,
          nodeQueue
        },
        effect: listen({
          link: effects(tasks)
        })
      };
    } else {
      return panic("Unable to perform write on closed file");
    }
  };
  var link = (state, { id, link: link2, block }) => {
    let { linked, ...nodeQueue } = addLink(id, link2, state.nodeQueue);
    const tasks = encodeBranches(linked, state.config);
    const newState = state.status === "closed" && id === state.rootID ? {
      ...state,
      status: "linked",
      link: link2,
      nodeQueue
    } : { ...state, nodeQueue };
    const end = state.status === "closed" && id === state.rootID && state.end ? state.end.resume() : none();
    return {
      state: newState,
      effect: listen({
        link: effects(tasks),
        block: writeBlock(state.writer, block),
        end
      })
    };
  };
  var close2 = (state) => {
    if (state.status === "open") {
      const { chunks } = close(state.chunker);
      const { layout, ...write6 } = state.config.fileLayout.write(
        state.layout,
        chunks
      );
      const { root: root2, ...close9 } = state.config.fileLayout.close(
        layout,
        state.metadata
      );
      const [nodes, leaves] = isLeafNode(root2) ? [
        [...write6.nodes, ...close9.nodes],
        [...write6.leaves, ...close9.leaves, root2]
      ] : [
        [...write6.nodes, ...close9.nodes, root2],
        [...write6.leaves, ...close9.leaves]
      ];
      const { linked, ...nodeQueue } = addNodes(nodes, state.nodeQueue);
      const tasks = [
        ...encodeLeaves(leaves, state.config),
        ...encodeBranches(linked, state.config)
      ];
      const fork4 = fork(suspend());
      return {
        state: {
          ...state,
          chunker: null,
          layout: null,
          rootID: root2.id,
          status: "closed",
          end: fork4,
          nodeQueue
        },
        effect: listen({
          link: effects(tasks),
          end: join(fork4)
        })
      };
    } else {
      return { state, effect: none() };
    }
  };
  var encodeLeaves = (leaves, config2) => leaves.map((leaf) => encodeLeaf(config2, leaf, config2.fileChunkEncoder));
  var encodeLeaf = function* ({ hasher, linker }, { id, content }, encoder2) {
    const bytes = encoder2.encode(content ? asUint8Array(content) : EMPTY_BUFFER2);
    const hash2 = yield* wait(hasher.digest(bytes));
    const cid = linker.createLink(encoder2.code, hash2);
    const block = { cid, bytes };
    const link2 = (
      /** @type {UnixFS.FileLink} */
      {
        cid,
        contentByteLength: content ? content.byteLength : 0,
        dagByteLength: bytes.byteLength
      }
    );
    return { id, block, link: link2 };
  };
  var encodeBranches = (nodes, config2) => nodes.map((node) => encodeBranch(config2, node));
  var encodeBranch = function* (config2, { id, links: links3 }, metadata) {
    const bytes = config2.fileEncoder.encode({
      type: NodeType.File,
      layout: "advanced",
      parts: links3,
      metadata
    });
    const hash2 = yield* wait(Promise.resolve(config2.hasher.digest(bytes)));
    const cid = config2.linker.createLink(config2.fileEncoder.code, hash2);
    const block = { bytes, cid };
    const link2 = (
      /** @type {UnixFS.FileLink} */
      {
        cid,
        contentByteLength: cumulativeContentByteLength(links3),
        dagByteLength: cumulativeDagByteLength(bytes, links3)
      }
    );
    return { id, block, link: link2 };
  };
  var writeBlock = function* (writer, block) {
    if ((writer.desiredSize || 0) <= 0) {
      yield* wait(writer.ready);
    }
    writer.write(block);
  };
  var asUint8Array = (buffer2) => buffer2 instanceof Uint8Array ? buffer2 : buffer2.copyTo(new Uint8Array(buffer2.byteLength), 0);
  var isLeafNode = (node) => node.children == null;

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file/chunker/fixed.js
  var fixed_exports = {};
  __export(fixed_exports, {
    context: () => context,
    cut: () => cut,
    name: () => name3,
    type: () => type,
    withMaxChunkSize: () => withMaxChunkSize
  });
  var name3 = "fixed";
  var context = {
    maxChunkSize: 262144
  };
  var type = "Stateless";
  var withMaxChunkSize = (maxChunkSize) => ({
    type: "Stateless",
    context: { maxChunkSize },
    name: name3,
    cut
  });
  var cut = ({ maxChunkSize }, { byteLength }, end) => {
    const n = byteLength / maxChunkSize | 0;
    const chunks = new Array(n).fill(maxChunkSize);
    const lastChunkSize = end ? byteLength - n * maxChunkSize : 0;
    if (lastChunkSize > 0) {
      chunks.push(lastChunkSize);
    }
    return chunks;
  };

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file/layout/balanced.js
  var Node = class {
    /**
     *
     * @param {number} id
     * @param {number[]} children
     * @param {Layout.Metadata} [metadata]
     */
    constructor(id, children, metadata) {
      this.id = id;
      this.children = children;
      this.metadata = metadata;
    }
  };
  var withWidth = (width) => ({
    open: () => open2({ width }),
    write: write3,
    close: close3
  });
  var defaults = { width: 174 };
  var open2 = ({ width } = defaults) => ({
    width,
    head: null,
    leafIndex: [],
    nodeIndex: [],
    lastID: 0
  });
  var write3 = (layout, chunks) => {
    if (chunks.length === 0) {
      return { layout, nodes: EMPTY4, leaves: EMPTY4 };
    } else {
      let { lastID } = layout;
      const [head, slices] = layout.head ? (
        // If we had a head we have more then two chunks (we already checked
        // chunks weren't empty) so we process head along with other chunks.
        [null, (chunks.unshift(layout.head), chunks)]
      ) : (
        // If we have no head no leaves and got only one chunk we have to save it
        // until we can decide what to do with it.
        chunks.length === 1 && layout.leafIndex.length === 0 ? [chunks[0], EMPTY4] : (
          // Otherwise we have no head but got enough chunks to know we'll have a
          // node.
          [null, chunks]
        )
      );
      if (slices.length === 0) {
        return { layout: { ...layout, head }, nodes: EMPTY4, leaves: EMPTY4 };
      } else {
        const leafIndex = [...layout.leafIndex];
        const leaves = [];
        for (const chunk of slices) {
          const leaf = { id: ++lastID, content: chunk };
          leaves.push(leaf);
          leafIndex.push(leaf.id);
        }
        if (leafIndex.length > layout.width) {
          return flush({ ...layout, leafIndex, head, lastID }, leaves);
        } else {
          return {
            layout: { ...layout, head, leafIndex, lastID },
            leaves,
            nodes: EMPTY4
          };
        }
      }
    }
  };
  var flush = (state, leaves = EMPTY4, nodes = [], close9 = false) => {
    let { lastID } = state;
    const nodeIndex = state.nodeIndex.map((row) => [...row]);
    const leafIndex = [...state.leafIndex];
    const { width } = state;
    while (leafIndex.length > width || leafIndex.length > 0 && close9) {
      grow(nodeIndex, 1);
      const node = new Node(++lastID, leafIndex.splice(0, width));
      nodeIndex[0].push(node.id);
      nodes.push(node);
    }
    let depth = 0;
    while (depth < nodeIndex.length) {
      const row = nodeIndex[depth];
      depth++;
      while (row.length > width || row.length > 0 && close9 && depth < nodeIndex.length) {
        const node = new Node(++lastID, row.splice(0, width));
        grow(nodeIndex, depth + 1);
        nodeIndex[depth].push(node.id);
        nodes.push(node);
      }
    }
    return { layout: { ...state, lastID, leafIndex, nodeIndex }, leaves, nodes };
  };
  var close3 = (layout, metadata) => {
    const state = layout;
    if (layout.head) {
      return {
        root: { id: 1, content: layout.head, metadata },
        leaves: EMPTY4,
        nodes: EMPTY4
      };
    } else if (layout.leafIndex.length === 0) {
      return {
        root: { id: 1, metadata },
        leaves: EMPTY4,
        nodes: EMPTY4
      };
    } else {
      const { nodes, layout: layout2 } = flush(state, EMPTY4, [], true);
      const { nodeIndex } = layout2;
      const height = nodeIndex.length - 1;
      const top = nodeIndex[height];
      if (top.length === 1) {
        const root2 = nodes[nodes.length - 1];
        nodes.length = nodes.length - 1;
        return { root: root2, nodes, leaves: EMPTY4 };
      } else {
        const root2 = new Node(layout2.lastID + 1, top, metadata);
        return { root: root2, nodes, leaves: EMPTY4 };
      }
    }
  };
  var grow = (index2, length4) => {
    while (index2.length < length4) {
      index2.push([]);
    }
    return index2;
  };
  var EMPTY4 = [];

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/file.js
  var defaults2 = () => ({
    chunker: fixed_exports,
    fileChunkEncoder: UnixFSLeaf,
    smallFileEncoder: UnixFSLeaf,
    fileEncoder: codec_exports,
    fileLayout: withWidth(174),
    hasher: sha256,
    linker: { createLink: CID.createV1 }
  });
  var configure2 = (config2) => ({
    ...defaults2(),
    ...config2
  });
  var UnixFSLeaf = {
    code: code3,
    name: name2,
    encode: encodeFileChunk
  };
  var create7 = ({ writer, metadata = {}, settings: settings2 = defaults2() }) => new FileWriterView(init(writer, metadata, configure2(settings2)));
  var write4 = async (view, bytes) => {
    await perform(view, send({ type: "write", bytes }));
    return view;
  };
  var close4 = async (view, { releaseLock = false, closeWriter = false } = {}) => {
    await perform(view, send({ type: "close" }));
    const { state } = view;
    if (state.status === "linked") {
      if (closeWriter) {
        await view.state.writer.close();
      } else if (releaseLock) {
        view.state.writer.releaseLock();
      }
      return state.link;
    } else {
      panic(
        `Expected writer to be in 'linked' state after close, but it is in "${state.status}" instead`
      );
    }
  };
  var perform = (view, effect2) => fork(
    loop(effect2, (message2) => {
      const { state, effect: effect3 } = update(message2, view.state);
      view.state = state;
      return effect3;
    })
  );
  var FileWriterView = class {
    /**
     * @param {Writer.State<Layout>} state
     */
    constructor(state) {
      this.state = state;
    }
    get writer() {
      return this.state.writer;
    }
    get settings() {
      return this.state.config;
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {Promise<API.View<Layout>>}
     */
    write(bytes) {
      return write4(this, bytes);
    }
    /**
     * @param {API.CloseOptions} [options]
     * @returns {Promise<UnixFS.FileLink>}
     */
    close(options) {
      return close4(this, options);
    }
  };

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/directory.js
  var defaults3 = defaults2;
  var create8 = ({ writer, settings: settings2 = defaults3(), metadata = {} }) => new DirectoryWriter({
    writer,
    metadata,
    settings: settings2,
    entries: /* @__PURE__ */ new Map(),
    closed: false
  });
  var set = (view, name7, link2, { overwrite = false } = {}) => {
    const writable = asWritable(view.state);
    if (name7.includes("/")) {
      throw new Error(
        `Directory entry name "${name7}" contains forbidden "/" character`
      );
    }
    if (!overwrite && writable.entries.has(name7)) {
      throw new Error(`Directory already contains entry with name "${name7}"`);
    } else {
      writable.entries.set(name7, link2);
      return view;
    }
  };
  var remove = (view, name7) => {
    const writer = asWritable(view.state);
    writer.entries.delete(name7);
    return view;
  };
  var asWritable = (writer) => {
    if (!writer.closed) {
      return writer;
    } else {
      throw new Error(
        `Can not change written directory, but you can .fork() and make changes to it`
      );
    }
  };
  var close5 = async (view, { closeWriter = false, releaseLock = false } = {}) => {
    const { writer, settings: settings2, metadata } = asWritable(view.state);
    view.state.closed = true;
    const entries3 = [...links2(view)];
    const node = createFlatDirectory(entries3, metadata);
    const bytes = encodeDirectory(node);
    const digest3 = await settings2.hasher.digest(bytes);
    const cid = settings2.linker.createLink(code3, digest3);
    if ((writer.desiredSize || 0) <= 0) {
      await writer.ready;
    }
    writer.write({ cid, bytes });
    if (closeWriter) {
      await writer.close();
    } else if (releaseLock) {
      writer.releaseLock();
    }
    return {
      cid,
      dagByteLength: cumulativeDagByteLength(bytes, entries3)
    };
  };
  var links2 = function* ({ state }) {
    for (const [name7, { dagByteLength, cid }] of state.entries) {
      yield (
        /** @type {UnixFS.DirectoryEntryLink} */
        {
          name: name7,
          dagByteLength,
          cid
        }
      );
    }
  };
  var fork2 = ({ state }, {
    writer = state.writer,
    metadata = state.metadata,
    settings: settings2 = state.settings
  } = {}) => new DirectoryWriter({
    writer,
    metadata,
    settings: settings2,
    entries: new Map(state.entries.entries()),
    closed: false
  });
  var DirectoryWriter = class {
    /**
     * @param {API.State<Layout>} state
     */
    constructor(state) {
      this.state = state;
    }
    get writer() {
      return this.state.writer;
    }
    get settings() {
      return this.state.settings;
    }
    links() {
      return links2(this);
    }
    /**
     * @param {string} name
     * @param {UnixFS.FileLink | UnixFS.DirectoryLink} link
     * @param {API.WriteOptions} [options]
     */
    set(name7, link2, options) {
      return set(this, name7, link2, options);
    }
    /**
     * @param {string} name
     */
    remove(name7) {
      return remove(this, name7);
    }
    /**
     * @template L
     * @param {Partial<API.Options<L>>} [options]
     * @returns {API.View<Layout|L>}
     */
    fork(options) {
      return fork2(this, options);
    }
    /**
     * @param {API.CloseOptions} [options]
     * @returns {Promise<UnixFS.DirectoryLink>}
     */
    close(options) {
      return close5(this, options);
    }
    entries() {
      return this.state.entries.entries();
    }
    /**
     * @param {string} name
     */
    has(name7) {
      return this.state.entries.has(name7);
    }
    get size() {
      return this.state.entries.size;
    }
  };

  // node_modules/.pnpm/@perma+map@1.0.3/node_modules/@perma/map/src/path/Uint32.js
  var import_murmurhash3js_revisited = __toESM(require_murmurhash3js_revisited(), 1);
  var utf8 = new TextEncoder();
  var hash32 = import_murmurhash3js_revisited.default.x64.hash126;

  // node_modules/.pnpm/@multiformats+murmur3@2.1.8/node_modules/@multiformats/murmur3/src/index.js
  var import_murmurhash3js_revisited2 = __toESM(require_murmurhash3js_revisited(), 1);
  function fromNumberTo32BitBuf(number) {
    const bytes = new Array(4);
    for (let i = 0; i < 4; i++) {
      bytes[i] = number & 255;
      number = number >> 8;
    }
    return new Uint8Array(bytes);
  }
  var murmur332 = from3({
    name: "murmur3-32",
    code: 35,
    encode: (input) => fromNumberTo32BitBuf(import_murmurhash3js_revisited2.default.x86.hash32(input))
  });
  var murmur3128 = from3({
    name: "murmur3-128",
    code: 34,
    encode: (input) => bytes_exports.fromHex(import_murmurhash3js_revisited2.default.x64.hash128(input))
  });
  var murmur364 = from3({
    name: "murmur3-x64-64",
    code: 34,
    encode: (input) => bytes_exports.fromHex(import_murmurhash3js_revisited2.default.x64.hash128(input)).subarray(0, 8)
  });

  // node_modules/.pnpm/@perma+map@1.0.3/node_modules/@perma/map/src/path/Uint8Array.js
  var utf82 = new TextEncoder();
  var toInt = (bytes, offset, count) => {
    let byteOffset = offset / 8 | 0;
    let bitOffset = offset % 8;
    let desired = count;
    let bits = 0;
    while (desired > 0 && byteOffset < bytes.byteLength) {
      const byte = bytes[byteOffset];
      const available = 8 - bitOffset;
      const taking = available < desired ? available : desired;
      const bitsLeft = 8 - bitOffset - taking;
      const mask = 255 >> bitOffset;
      const value = (mask & byte) >> bitsLeft;
      bits = (bits << taking) + value;
      desired -= taking;
      byteOffset++;
      bitOffset = 0;
    }
    return bits;
  };

  // node_modules/.pnpm/@perma+map@1.0.3/node_modules/@perma/map/src/lib.js
  var NOT_FOUND = new RangeError("Not Found");

  // node_modules/.pnpm/@perma+map@1.0.3/node_modules/@perma/map/src/path/InfiniteUint8Array.js
  var utf83 = new TextEncoder();
  var hash64 = (bytes) => (
    /** @type {Uint8Array} */
    murmur364.encode(bytes)
  );
  var configure5 = ({ bitWidth: bitWidth2 = 8, hash: hash2 = hash64 }) => {
    const hashSize = hash2(new Uint8Array()).byteLength;
    const options = { bitWidth: bitWidth2, hash: hash2, hashSize };
    const at = (path, depth) => read2(path, depth, options);
    const from8 = (key) => utf83.encode(key);
    return { at, from: from8, size: Infinity };
  };
  var read2 = (key, depth = 0, { bitWidth: bitWidth2 = 8, hash: hash2, hashSize }) => {
    const frameBitSize = hashSize * 8;
    let digest3 = 0;
    let bitCount2 = bitWidth2;
    let bitOffset = bitWidth2 * depth;
    while (bitCount2 > 0) {
      const frameOffset = bitOffset / frameBitSize >> 0;
      const frame = frameOffset === 0 ? hash2(key) : hash2(appendByte(key, frameOffset));
      const offset = frameBitSize <= bitOffset ? bitOffset % frameBitSize : bitOffset;
      const maxBits = frameBitSize - offset;
      const count = maxBits < bitCount2 ? maxBits : bitCount2;
      digest3 = (digest3 << count) + toInt(frame, offset, count);
      bitCount2 -= count;
      bitOffset += count;
    }
    return digest3;
  };
  var appendByte = (source, byte) => {
    const bytes = new Uint8Array(source.byteLength + 1).fill(
      byte,
      source.byteLength
    );
    bytes.set(source);
    return bytes;
  };

  // node_modules/.pnpm/@perma+map@1.0.3/node_modules/@perma/map/src/unixfs.js
  var bitWidth = 8;
  var config = {
    bitWidth,
    Path: configure5({ bitWidth })
  };

  // node_modules/.pnpm/@ipld+unixfs@3.0.0/node_modules/@ipld/unixfs/src/lib.js
  var createWriter = ({ writable, settings: settings2 = defaults2() }) => new FileSystemWriter({
    writer: writable.getWriter(),
    settings: settings2
  });
  var close7 = async (view, { releaseLock = true, closeWriter = true } = {}) => {
    if (closeWriter) {
      await view.writer.close();
    } else if (releaseLock) {
      view.writer.releaseLock();
    }
    return view;
  };
  var FileSystemWriter = class {
    /**
     * @param {object} options
     * @param {API.BlockWriter} options.writer
     * @param {Partial<API.EncoderSettings<Layout>>} options.settings
     */
    constructor({ writer, settings: settings2 }) {
      this.writer = writer;
      this.settings = configure2(settings2);
    }
    /**
     * @template [L=unknown]
     * @param {API.WriterOptions<L|Layout>} config
     */
    createFileWriter({ settings: settings2 = this.settings, metadata } = {}) {
      return create7({
        writer: this.writer,
        settings: settings2,
        metadata
      });
    }
    /**
     * @template [L=unknown]
     * @param {API.WriterOptions<L|Layout>} config
     */
    createDirectoryWriter({ settings: settings2 = this.settings, metadata } = {}) {
      return create8({
        writer: this.writer,
        settings: settings2,
        metadata
      });
    }
    /**
     * @param {API.CloseOptions} [options]
     */
    close(options) {
      return close7(this, options);
    }
  };
  var BLOCK_SIZE_LIMIT = 1048576;
  var defaultCapacity = BLOCK_SIZE_LIMIT * 100;
  var withCapacity = (byteLength = defaultCapacity) => ({
    highWaterMark: byteLength,
    size: (block) => block.bytes.length
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/codecs/raw.js
  var raw_exports = {};
  __export(raw_exports, {
    code: () => code4,
    decode: () => decode11,
    encode: () => encode9,
    name: () => name4
  });
  init_bytes();
  var name4 = "raw";
  var code4 = 85;
  function encode9(node) {
    return coerce(node);
  }
  function decode11(data) {
    return coerce(data);
  }

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/index.js
  var import_err_code11 = __toESM(require_err_code(), 1);

  // node_modules/.pnpm/it-last@3.0.4/node_modules/it-last/dist/src/index.js
  function isAsyncIterable(thing) {
    return thing[Symbol.asyncIterator] != null;
  }
  function last(source) {
    if (isAsyncIterable(source)) {
      return (async () => {
        let res2;
        for await (const entry of source) {
          res2 = entry;
        }
        return res2;
      })();
    }
    let res;
    for (const entry of source) {
      res = entry;
    }
    return res;
  }
  var src_default = last;

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/json/encode.js
  var JSONEncoder = class extends Array {
    constructor() {
      super();
      this.inRecursive = [];
    }
    /**
     * @param {Bl} buf
     */
    prefix(buf2) {
      const recurs = this.inRecursive[this.inRecursive.length - 1];
      if (recurs) {
        if (recurs.type === Type.array) {
          recurs.elements++;
          if (recurs.elements !== 1) {
            buf2.push([44]);
          }
        }
        if (recurs.type === Type.map) {
          recurs.elements++;
          if (recurs.elements !== 1) {
            if (recurs.elements % 2 === 1) {
              buf2.push([44]);
            } else {
              buf2.push([58]);
            }
          }
        }
      }
    }
    /**
     * @param {Bl} buf
     * @param {Token} token
     */
    [Type.uint.major](buf2, token) {
      this.prefix(buf2);
      const is2 = String(token.value);
      const isa = [];
      for (let i = 0; i < is2.length; i++) {
        isa[i] = is2.charCodeAt(i);
      }
      buf2.push(isa);
    }
    /**
     * @param {Bl} buf
     * @param {Token} token
     */
    [Type.negint.major](buf2, token) {
      this[Type.uint.major](buf2, token);
    }
    /**
     * @param {Bl} _buf
     * @param {Token} _token
     */
    [Type.bytes.major](_buf, _token) {
      throw new Error(`${encodeErrPrefix} unsupported type: Uint8Array`);
    }
    /**
     * @param {Bl} buf
     * @param {Token} token
     */
    [Type.string.major](buf2, token) {
      this.prefix(buf2);
      const byts = fromString2(JSON.stringify(token.value));
      buf2.push(byts.length > 32 ? asU8A(byts) : byts);
    }
    /**
     * @param {Bl} buf
     * @param {Token} _token
     */
    [Type.array.major](buf2, _token) {
      this.prefix(buf2);
      this.inRecursive.push({ type: Type.array, elements: 0 });
      buf2.push([91]);
    }
    /**
     * @param {Bl} buf
     * @param {Token} _token
     */
    [Type.map.major](buf2, _token) {
      this.prefix(buf2);
      this.inRecursive.push({ type: Type.map, elements: 0 });
      buf2.push([123]);
    }
    /**
     * @param {Bl} _buf
     * @param {Token} _token
     */
    [Type.tag.major](_buf, _token) {
    }
    /**
     * @param {Bl} buf
     * @param {Token} token
     */
    [Type.float.major](buf2, token) {
      if (token.type.name === "break") {
        const recurs = this.inRecursive.pop();
        if (recurs) {
          if (recurs.type === Type.array) {
            buf2.push([93]);
          } else if (recurs.type === Type.map) {
            buf2.push([125]);
          } else {
            throw new Error("Unexpected recursive type; this should not happen!");
          }
          return;
        }
        throw new Error("Unexpected break; this should not happen!");
      }
      if (token.value === void 0) {
        throw new Error(`${encodeErrPrefix} unsupported type: undefined`);
      }
      this.prefix(buf2);
      if (token.type.name === "true") {
        buf2.push([116, 114, 117, 101]);
        return;
      } else if (token.type.name === "false") {
        buf2.push([102, 97, 108, 115, 101]);
        return;
      } else if (token.type.name === "null") {
        buf2.push([110, 117, 108, 108]);
        return;
      }
      const is2 = String(token.value);
      const isa = [];
      let dp = false;
      for (let i = 0; i < is2.length; i++) {
        isa[i] = is2.charCodeAt(i);
        if (!dp && (isa[i] === 46 || isa[i] === 101 || isa[i] === 69)) {
          dp = true;
        }
      }
      if (!dp) {
        isa.push(46);
        isa.push(48);
      }
      buf2.push(isa);
    }
  };
  function mapSorter2(e1, e2) {
    if (Array.isArray(e1[0]) || Array.isArray(e2[0])) {
      throw new Error(`${encodeErrPrefix} complex map keys are not supported`);
    }
    const keyToken1 = e1[0];
    const keyToken2 = e2[0];
    if (keyToken1.type !== Type.string || keyToken2.type !== Type.string) {
      throw new Error(`${encodeErrPrefix} non-string map keys are not supported`);
    }
    if (keyToken1 < keyToken2) {
      return -1;
    }
    if (keyToken1 > keyToken2) {
      return 1;
    }
    throw new Error(`${encodeErrPrefix} unexpected duplicate map keys, this is not supported`);
  }
  var defaultEncodeOptions2 = { addBreakTokens: true, mapSorter: mapSorter2 };
  function encode10(data, options) {
    options = Object.assign({}, defaultEncodeOptions2, options);
    return encodeCustom(data, new JSONEncoder(), options);
  }

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/json/decode.js
  var Tokenizer = class {
    /**
     * @param {Uint8Array} data
     * @param {DecodeOptions} options
     */
    constructor(data, options = {}) {
      this._pos = 0;
      this.data = data;
      this.options = options;
      this.modeStack = ["value"];
      this.lastToken = "";
    }
    pos() {
      return this._pos;
    }
    /**
     * @returns {boolean}
     */
    done() {
      return this._pos >= this.data.length;
    }
    /**
     * @returns {number}
     */
    ch() {
      return this.data[this._pos];
    }
    /**
     * @returns {string}
     */
    currentMode() {
      return this.modeStack[this.modeStack.length - 1];
    }
    skipWhitespace() {
      let c = this.ch();
      while (c === 32 || c === 9 || c === 13 || c === 10) {
        c = this.data[++this._pos];
      }
    }
    /**
     * @param {number[]} str
     */
    expect(str) {
      if (this.data.length - this._pos < str.length) {
        throw new Error(`${decodeErrPrefix} unexpected end of input at position ${this._pos}`);
      }
      for (let i = 0; i < str.length; i++) {
        if (this.data[this._pos++] !== str[i]) {
          throw new Error(`${decodeErrPrefix} unexpected token at position ${this._pos}, expected to find '${String.fromCharCode(...str)}'`);
        }
      }
    }
    parseNumber() {
      const startPos = this._pos;
      let negative = false;
      let float = false;
      const swallow = (chars) => {
        while (!this.done()) {
          const ch = this.ch();
          if (chars.includes(ch)) {
            this._pos++;
          } else {
            break;
          }
        }
      };
      if (this.ch() === 45) {
        negative = true;
        this._pos++;
      }
      if (this.ch() === 48) {
        this._pos++;
        if (this.ch() === 46) {
          this._pos++;
          float = true;
        } else {
          return new Token(Type.uint, 0, this._pos - startPos);
        }
      }
      swallow([48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
      if (negative && this._pos === startPos + 1) {
        throw new Error(`${decodeErrPrefix} unexpected token at position ${this._pos}`);
      }
      if (!this.done() && this.ch() === 46) {
        if (float) {
          throw new Error(`${decodeErrPrefix} unexpected token at position ${this._pos}`);
        }
        float = true;
        this._pos++;
        swallow([48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
      }
      if (!this.done() && (this.ch() === 101 || this.ch() === 69)) {
        float = true;
        this._pos++;
        if (!this.done() && (this.ch() === 43 || this.ch() === 45)) {
          this._pos++;
        }
        swallow([48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
      }
      const numStr = String.fromCharCode.apply(null, this.data.subarray(startPos, this._pos));
      const num = parseFloat(numStr);
      if (float) {
        return new Token(Type.float, num, this._pos - startPos);
      }
      if (this.options.allowBigInt !== true || Number.isSafeInteger(num)) {
        return new Token(num >= 0 ? Type.uint : Type.negint, num, this._pos - startPos);
      }
      return new Token(num >= 0 ? Type.uint : Type.negint, BigInt(numStr), this._pos - startPos);
    }
    /**
     * @returns {Token}
     */
    parseString() {
      if (this.ch() !== 34) {
        throw new Error(`${decodeErrPrefix} unexpected character at position ${this._pos}; this shouldn't happen`);
      }
      this._pos++;
      for (let i = this._pos, l = 0; i < this.data.length && l < 65536; i++, l++) {
        const ch = this.data[i];
        if (ch === 92 || ch < 32 || ch >= 128) {
          break;
        }
        if (ch === 34) {
          const str = String.fromCharCode.apply(null, this.data.subarray(this._pos, i));
          this._pos = i + 1;
          return new Token(Type.string, str, l);
        }
      }
      const startPos = this._pos;
      const chars = [];
      const readu4 = () => {
        if (this._pos + 4 >= this.data.length) {
          throw new Error(`${decodeErrPrefix} unexpected end of unicode escape sequence at position ${this._pos}`);
        }
        let u4 = 0;
        for (let i = 0; i < 4; i++) {
          let ch = this.ch();
          if (ch >= 48 && ch <= 57) {
            ch -= 48;
          } else if (ch >= 97 && ch <= 102) {
            ch = ch - 97 + 10;
          } else if (ch >= 65 && ch <= 70) {
            ch = ch - 65 + 10;
          } else {
            throw new Error(`${decodeErrPrefix} unexpected unicode escape character at position ${this._pos}`);
          }
          u4 = u4 * 16 + ch;
          this._pos++;
        }
        return u4;
      };
      const readUtf8Char = () => {
        const firstByte = this.ch();
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (this._pos + bytesPerSequence > this.data.length) {
          throw new Error(`${decodeErrPrefix} unexpected unicode sequence at position ${this._pos}`);
        }
        let secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          /* c8 ignore next 6 */
          // this case is dealt with by the caller function
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = this.data[this._pos + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = this.data[this._pos + 1];
            thirdByte = this.data[this._pos + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = this.data[this._pos + 1];
            thirdByte = this.data[this._pos + 2];
            fourthByte = this.data[this._pos + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          chars.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        chars.push(codePoint);
        this._pos += bytesPerSequence;
      };
      while (!this.done()) {
        const ch = this.ch();
        let ch1;
        switch (ch) {
          case 92:
            this._pos++;
            if (this.done()) {
              throw new Error(`${decodeErrPrefix} unexpected string termination at position ${this._pos}`);
            }
            ch1 = this.ch();
            this._pos++;
            switch (ch1) {
              case 34:
              // '"'
              case 39:
              // '\''
              case 92:
              // '\'
              case 47:
                chars.push(ch1);
                break;
              case 98:
                chars.push(8);
                break;
              case 116:
                chars.push(9);
                break;
              case 110:
                chars.push(10);
                break;
              case 102:
                chars.push(12);
                break;
              case 114:
                chars.push(13);
                break;
              case 117:
                chars.push(readu4());
                break;
              default:
                throw new Error(`${decodeErrPrefix} unexpected string escape character at position ${this._pos}`);
            }
            break;
          case 34:
            this._pos++;
            return new Token(Type.string, decodeCodePointsArray(chars), this._pos - startPos);
          default:
            if (ch < 32) {
              throw new Error(`${decodeErrPrefix} invalid control character at position ${this._pos}`);
            } else if (ch < 128) {
              chars.push(ch);
              this._pos++;
            } else {
              readUtf8Char();
            }
        }
      }
      throw new Error(`${decodeErrPrefix} unexpected end of string at position ${this._pos}`);
    }
    /**
     * @returns {Token}
     */
    parseValue() {
      switch (this.ch()) {
        case 123:
          this.modeStack.push("obj-start");
          this._pos++;
          return new Token(Type.map, Infinity, 1);
        case 91:
          this.modeStack.push("array-start");
          this._pos++;
          return new Token(Type.array, Infinity, 1);
        case 34: {
          return this.parseString();
        }
        case 110:
          this.expect([110, 117, 108, 108]);
          return new Token(Type.null, null, 4);
        case 102:
          this.expect([102, 97, 108, 115, 101]);
          return new Token(Type.false, false, 5);
        case 116:
          this.expect([116, 114, 117, 101]);
          return new Token(Type.true, true, 4);
        case 45:
        // '-'
        case 48:
        // '0'
        case 49:
        // '1'
        case 50:
        // '2'
        case 51:
        // '3'
        case 52:
        // '4'
        case 53:
        // '5'
        case 54:
        // '6'
        case 55:
        // '7'
        case 56:
        // '8'
        case 57:
          return this.parseNumber();
        default:
          throw new Error(`${decodeErrPrefix} unexpected character at position ${this._pos}`);
      }
    }
    /**
     * @returns {Token}
     */
    next() {
      this.skipWhitespace();
      switch (this.currentMode()) {
        case "value":
          this.modeStack.pop();
          return this.parseValue();
        case "array-value": {
          this.modeStack.pop();
          if (this.ch() === 93) {
            this._pos++;
            this.skipWhitespace();
            return new Token(Type.break, void 0, 1);
          }
          if (this.ch() !== 44) {
            throw new Error(`${decodeErrPrefix} unexpected character at position ${this._pos}, was expecting array delimiter but found '${String.fromCharCode(this.ch())}'`);
          }
          this._pos++;
          this.modeStack.push("array-value");
          this.skipWhitespace();
          return this.parseValue();
        }
        case "array-start": {
          this.modeStack.pop();
          if (this.ch() === 93) {
            this._pos++;
            this.skipWhitespace();
            return new Token(Type.break, void 0, 1);
          }
          this.modeStack.push("array-value");
          this.skipWhitespace();
          return this.parseValue();
        }
        // @ts-ignore
        case "obj-key":
          if (this.ch() === 125) {
            this.modeStack.pop();
            this._pos++;
            this.skipWhitespace();
            return new Token(Type.break, void 0, 1);
          }
          if (this.ch() !== 44) {
            throw new Error(`${decodeErrPrefix} unexpected character at position ${this._pos}, was expecting object delimiter but found '${String.fromCharCode(this.ch())}'`);
          }
          this._pos++;
          this.skipWhitespace();
        case "obj-start": {
          this.modeStack.pop();
          if (this.ch() === 125) {
            this._pos++;
            this.skipWhitespace();
            return new Token(Type.break, void 0, 1);
          }
          const token = this.parseString();
          this.skipWhitespace();
          if (this.ch() !== 58) {
            throw new Error(`${decodeErrPrefix} unexpected character at position ${this._pos}, was expecting key/value delimiter ':' but found '${String.fromCharCode(this.ch())}'`);
          }
          this._pos++;
          this.modeStack.push("obj-value");
          return token;
        }
        case "obj-value": {
          this.modeStack.pop();
          this.modeStack.push("obj-key");
          this.skipWhitespace();
          return this.parseValue();
        }
        /* c8 ignore next 2 */
        default:
          throw new Error(`${decodeErrPrefix} unexpected parse state at position ${this._pos}; this shouldn't happen`);
      }
    }
  };
  function decode12(data, options) {
    options = Object.assign({ tokenizer: new Tokenizer(data, options) }, options);
    return decode7(data, options);
  }

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base64.js
  var base64_exports = {};
  __export(base64_exports, {
    base64: () => base64,
    base64pad: () => base64pad,
    base64url: () => base64url,
    base64urlpad: () => base64urlpad
  });
  init_base();
  var base64 = rfc4648({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6
  });
  var base64pad = rfc4648({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6
  });
  var base64url = rfc4648({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6
  });
  var base64urlpad = rfc4648({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6
  });

  // node_modules/.pnpm/@ipld+dag-json@10.2.2/node_modules/@ipld/dag-json/src/index.js
  function toByteView2(buf2) {
    if (buf2 instanceof ArrayBuffer) {
      return new Uint8Array(buf2, 0, buf2.byteLength);
    }
    return buf2;
  }
  function cidEncoder2(obj) {
    if (obj.asCID !== obj && obj["/"] !== obj.bytes) {
      return null;
    }
    const cid = CID.asCID(obj);
    if (!cid) {
      return null;
    }
    const cidString = cid.toString();
    return [
      new Token(Type.map, Infinity, 1),
      new Token(Type.string, "/", 1),
      // key
      new Token(Type.string, cidString, cidString.length),
      // value
      new Token(Type.break, void 0, 1)
    ];
  }
  function bytesEncoder(bytes) {
    const bytesString = base64.encode(bytes).slice(1);
    return [
      new Token(Type.map, Infinity, 1),
      new Token(Type.string, "/", 1),
      // key
      new Token(Type.map, Infinity, 1),
      // value
      new Token(Type.string, "bytes", 5),
      // inner key
      new Token(Type.string, bytesString, bytesString.length),
      // inner value
      new Token(Type.break, void 0, 1),
      new Token(Type.break, void 0, 1)
    ];
  }
  function taBytesEncoder(obj) {
    return bytesEncoder(new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength));
  }
  function abBytesEncoder(ab) {
    return bytesEncoder(new Uint8Array(ab));
  }
  function undefinedEncoder2() {
    throw new Error("`undefined` is not supported by the IPLD Data Model and cannot be encoded");
  }
  function numberEncoder2(num) {
    if (Number.isNaN(num)) {
      throw new Error("`NaN` is not supported by the IPLD Data Model and cannot be encoded");
    }
    if (num === Infinity || num === -Infinity) {
      throw new Error("`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded");
    }
    return null;
  }
  var encodeOptions2 = {
    typeEncoders: {
      Object: cidEncoder2,
      Buffer: bytesEncoder,
      Uint8Array: bytesEncoder,
      Int8Array: taBytesEncoder,
      Uint16Array: taBytesEncoder,
      Int16Array: taBytesEncoder,
      Uint32Array: taBytesEncoder,
      Int32Array: taBytesEncoder,
      Float32Array: taBytesEncoder,
      Float64Array: taBytesEncoder,
      Uint8ClampedArray: taBytesEncoder,
      BigInt64Array: taBytesEncoder,
      BigUint64Array: taBytesEncoder,
      DataView: taBytesEncoder,
      ArrayBuffer: abBytesEncoder,
      undefined: undefinedEncoder2,
      number: numberEncoder2
    }
  };
  var DagJsonTokenizer = class extends Tokenizer {
    /**
     * @param {Uint8Array} data
     * @param {object} [options]
     */
    constructor(data, options) {
      super(data, options);
      this.tokenBuffer = [];
    }
    /**
     * @returns {boolean}
     */
    done() {
      return this.tokenBuffer.length === 0 && super.done();
    }
    /**
     * @returns {Token}
     */
    _next() {
      if (this.tokenBuffer.length > 0) {
        return this.tokenBuffer.pop();
      }
      return super.next();
    }
    /**
     * Implements rules outlined in https://github.com/ipld/specs/pull/356
     *
     * @returns {Token}
     */
    next() {
      const token = this._next();
      if (token.type === Type.map) {
        const keyToken = this._next();
        if (keyToken.type === Type.string && keyToken.value === "/") {
          const valueToken = this._next();
          if (valueToken.type === Type.string) {
            const breakToken = this._next();
            if (breakToken.type !== Type.break) {
              throw new Error("Invalid encoded CID form");
            }
            this.tokenBuffer.push(valueToken);
            return new Token(Type.tag, 42, 0);
          }
          if (valueToken.type === Type.map) {
            const innerKeyToken = this._next();
            if (innerKeyToken.type === Type.string && innerKeyToken.value === "bytes") {
              const innerValueToken = this._next();
              if (innerValueToken.type === Type.string) {
                for (let i = 0; i < 2; i++) {
                  const breakToken = this._next();
                  if (breakToken.type !== Type.break) {
                    throw new Error("Invalid encoded Bytes form");
                  }
                }
                const bytes = base64.decode(`m${innerValueToken.value}`);
                return new Token(Type.bytes, bytes, innerValueToken.value.length);
              }
              this.tokenBuffer.push(innerValueToken);
            }
            this.tokenBuffer.push(innerKeyToken);
          }
          this.tokenBuffer.push(valueToken);
        }
        this.tokenBuffer.push(keyToken);
      }
      return token;
    }
  };
  var decodeOptions2 = {
    allowIndefinite: false,
    allowUndefined: false,
    allowNaN: false,
    allowInfinity: false,
    allowBigInt: true,
    // this will lead to BigInt for ints outside of
    // safe-integer range, which may surprise users
    strict: true,
    useMaps: false,
    rejectDuplicateMapKeys: true,
    /** @type {import('cborg').TagDecoder[]} */
    tags: []
  };
  decodeOptions2.tags[42] = CID.parse;
  var code5 = 297;
  var encode11 = (node) => encode10(node, encodeOptions2);
  var decode13 = (data) => {
    const buf2 = toByteView2(data);
    const options = Object.assign(decodeOptions2, { tokenizer: new DagJsonTokenizer(buf2, decodeOptions2) });
    return decode12(buf2, options);
  };
  var format2 = (node) => utf8Decoder.decode(encode11(node));
  var utf8Decoder = new TextDecoder();
  var parse2 = (data) => decode13(utf8Encoder.encode(data));
  var utf8Encoder = new TextEncoder();

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/index.js
  var import_err_code10 = __toESM(require_err_code(), 1);

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/codecs/json.js
  var textEncoder4 = new TextEncoder();
  var textDecoder3 = new TextDecoder();
  var code6 = 512;
  function decode14(data) {
    return JSON.parse(textDecoder3.decode(data));
  }

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/hashes/identity.js
  var identity_exports = {};
  __export(identity_exports, {
    identity: () => identity
  });
  init_bytes();
  var code7 = 0;
  var name5 = "identity";
  var encode12 = coerce;
  function digest(input) {
    return create(code7, encode12(input));
  }
  var identity = { code: code7, name: name5, encode: encode12, digest };

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/utils/resolve-object-path.js
  var import_err_code = __toESM(require_err_code(), 1);
  function resolveObjectPath(object, block, cid, name7, path, toResolve, depth) {
    let subObject = object;
    let subPath = path;
    while (toResolve.length > 0) {
      const prop = toResolve[0];
      if (prop in subObject) {
        toResolve.shift();
        subPath = `${subPath}/${prop}`;
        const subObjectCid = CID.asCID(subObject[prop]);
        if (subObjectCid != null) {
          return {
            entry: {
              type: "object",
              name: name7,
              path,
              cid,
              node: block,
              depth,
              size: BigInt(block.length),
              content: async function* () {
                yield object;
              }
            },
            next: {
              cid: subObjectCid,
              name: prop,
              path: subPath,
              toResolve
            }
          };
        }
        subObject = subObject[prop];
      } else {
        throw (0, import_err_code.default)(new Error(`No property named ${prop} found in node ${cid}`), "ERR_NO_PROP");
      }
    }
    return {
      entry: {
        type: "object",
        name: name7,
        path,
        cid,
        node: block,
        depth,
        size: BigInt(block.length),
        content: async function* () {
          yield object;
        }
      }
    };
  }

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/dag-cbor.js
  var resolve = async (cid, name7, path, toResolve, resolve7, depth, blockstore, options) => {
    const block = await blockstore.get(cid, options);
    const object = decode8(block);
    return resolveObjectPath(object, block, cid, name7, path, toResolve, depth);
  };
  var dag_cbor_default = resolve;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/dag-json.js
  var resolve2 = async (cid, name7, path, toResolve, resolve7, depth, blockstore, options) => {
    const block = await blockstore.get(cid, options);
    const object = decode13(block);
    return resolveObjectPath(object, block, cid, name7, path, toResolve, depth);
  };
  var dag_json_default = resolve2;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/identity.js
  var import_err_code3 = __toESM(require_err_code(), 1);

  // node_modules/.pnpm/progress-events@1.0.0/node_modules/progress-events/dist/src/index.js
  var CustomProgressEvent = class extends Event {
    constructor(type2, detail) {
      super(type2);
      this.detail = detail;
    }
  };

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/utils/extract-data-from-block.js
  function extractDataFromBlock(block, blockStart, requestedStart, requestedEnd) {
    const blockLength2 = BigInt(block.length);
    const blockEnd = BigInt(blockStart + blockLength2);
    if (requestedStart >= blockEnd || requestedEnd < blockStart) {
      return new Uint8Array(0);
    }
    if (requestedEnd >= blockStart && requestedEnd < blockEnd) {
      block = block.subarray(0, Number(requestedEnd - blockStart));
    }
    if (requestedStart >= blockStart && requestedStart < blockEnd) {
      block = block.subarray(Number(requestedStart - blockStart));
    }
    return block;
  }
  var extract_data_from_block_default = extractDataFromBlock;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/utils/validate-offset-and-length.js
  var import_err_code2 = __toESM(require_err_code(), 1);
  var validateOffsetAndLength = (size, offset = 0, length4 = size) => {
    const fileSize = BigInt(size);
    const start = BigInt(offset ?? 0);
    let end = BigInt(length4);
    if (end !== fileSize) {
      end = start + end;
    }
    if (end > fileSize) {
      end = fileSize;
    }
    if (start < 0n) {
      throw (0, import_err_code2.default)(new Error("Offset must be greater than or equal to 0"), "ERR_INVALID_PARAMS");
    }
    if (start > fileSize) {
      throw (0, import_err_code2.default)(new Error("Offset must be less than the file size"), "ERR_INVALID_PARAMS");
    }
    if (end < 0n) {
      throw (0, import_err_code2.default)(new Error("Length must be greater than or equal to 0"), "ERR_INVALID_PARAMS");
    }
    if (end > fileSize) {
      throw (0, import_err_code2.default)(new Error("Length must be less than the file size"), "ERR_INVALID_PARAMS");
    }
    return {
      start,
      end
    };
  };
  var validate_offset_and_length_default = validateOffsetAndLength;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/identity.js
  var rawContent = (node) => {
    async function* contentGenerator(options = {}) {
      const { start, end } = validate_offset_and_length_default(node.length, options.offset, options.length);
      const buf2 = extract_data_from_block_default(node, 0n, start, end);
      options.onProgress?.(new CustomProgressEvent("unixfs:exporter:progress:identity", {
        bytesRead: BigInt(buf2.byteLength),
        totalBytes: end - start,
        fileSize: BigInt(node.byteLength)
      }));
      yield buf2;
    }
    return contentGenerator;
  };
  var resolve3 = async (cid, name7, path, toResolve, resolve7, depth, blockstore, options) => {
    if (toResolve.length > 0) {
      throw (0, import_err_code3.default)(new Error(`No link named ${path} found in raw node ${cid}`), "ERR_NOT_FOUND");
    }
    const buf2 = decode4(cid.multihash.bytes);
    return {
      entry: {
        type: "identity",
        name: name7,
        path,
        cid,
        content: rawContent(buf2.digest),
        depth,
        size: BigInt(buf2.digest.length),
        node: buf2.digest
      }
    };
  };
  var identity_default = resolve3;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/json.js
  var resolve4 = async (cid, name7, path, toResolve, resolve7, depth, blockstore, options) => {
    const block = await blockstore.get(cid, options);
    const object = decode14(block);
    return resolveObjectPath(object, block, cid, name7, path, toResolve, depth);
  };
  var json_default = resolve4;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/raw.js
  var import_err_code4 = __toESM(require_err_code(), 1);
  var rawContent2 = (node) => {
    async function* contentGenerator(options = {}) {
      const { start, end } = validate_offset_and_length_default(node.length, options.offset, options.length);
      const buf2 = extract_data_from_block_default(node, 0n, start, end);
      options.onProgress?.(new CustomProgressEvent("unixfs:exporter:progress:raw", {
        bytesRead: BigInt(buf2.byteLength),
        totalBytes: end - start,
        fileSize: BigInt(node.byteLength)
      }));
      yield buf2;
    }
    return contentGenerator;
  };
  var resolve5 = async (cid, name7, path, toResolve, resolve7, depth, blockstore, options) => {
    if (toResolve.length > 0) {
      throw (0, import_err_code4.default)(new Error(`No link named ${path} found in raw node ${cid}`), "ERR_NOT_FOUND");
    }
    const block = await blockstore.get(cid, options);
    return {
      entry: {
        type: "raw",
        name: name7,
        path,
        cid,
        content: rawContent2(block),
        depth,
        size: BigInt(block.length),
        node: block
      }
    };
  };
  var raw_default = resolve5;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/unixfs-v1/index.js
  var import_err_code9 = __toESM(require_err_code(), 1);

  // node_modules/.pnpm/ipfs-unixfs@11.1.2/node_modules/ipfs-unixfs/dist/src/index.js
  var import_err_code5 = __toESM(require_err_code(), 1);

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/utils/float.js
  var f32 = new Float32Array([-0]);
  var f8b = new Uint8Array(f32.buffer);
  function writeFloatLE(val, buf2, pos) {
    f32[0] = val;
    buf2[pos] = f8b[0];
    buf2[pos + 1] = f8b[1];
    buf2[pos + 2] = f8b[2];
    buf2[pos + 3] = f8b[3];
  }
  function readFloatLE(buf2, pos) {
    f8b[0] = buf2[pos];
    f8b[1] = buf2[pos + 1];
    f8b[2] = buf2[pos + 2];
    f8b[3] = buf2[pos + 3];
    return f32[0];
  }
  var f64 = new Float64Array([-0]);
  var d8b = new Uint8Array(f64.buffer);
  function writeDoubleLE(val, buf2, pos) {
    f64[0] = val;
    buf2[pos] = d8b[0];
    buf2[pos + 1] = d8b[1];
    buf2[pos + 2] = d8b[2];
    buf2[pos + 3] = d8b[3];
    buf2[pos + 4] = d8b[4];
    buf2[pos + 5] = d8b[5];
    buf2[pos + 6] = d8b[6];
    buf2[pos + 7] = d8b[7];
  }
  function readDoubleLE(buf2, pos) {
    d8b[0] = buf2[pos];
    d8b[1] = buf2[pos + 1];
    d8b[2] = buf2[pos + 2];
    d8b[3] = buf2[pos + 3];
    d8b[4] = buf2[pos + 4];
    d8b[5] = buf2[pos + 5];
    d8b[6] = buf2[pos + 6];
    d8b[7] = buf2[pos + 7];
    return f64[0];
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/utils/longbits.js
  var MAX_SAFE_NUMBER_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
  var MIN_SAFE_NUMBER_INTEGER = BigInt(Number.MIN_SAFE_INTEGER);
  var LongBits = class _LongBits {
    lo;
    hi;
    constructor(lo, hi) {
      this.lo = lo | 0;
      this.hi = hi | 0;
    }
    /**
     * Converts this long bits to a possibly unsafe JavaScript number
     */
    toNumber(unsigned = false) {
      if (!unsigned && this.hi >>> 31 > 0) {
        const lo = ~this.lo + 1 >>> 0;
        let hi = ~this.hi >>> 0;
        if (lo === 0) {
          hi = hi + 1 >>> 0;
        }
        return -(lo + hi * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    }
    /**
     * Converts this long bits to a bigint
     */
    toBigInt(unsigned = false) {
      if (unsigned) {
        return BigInt(this.lo >>> 0) + (BigInt(this.hi >>> 0) << 32n);
      }
      if (this.hi >>> 31 !== 0) {
        const lo = ~this.lo + 1 >>> 0;
        let hi = ~this.hi >>> 0;
        if (lo === 0) {
          hi = hi + 1 >>> 0;
        }
        return -(BigInt(lo) + (BigInt(hi) << 32n));
      }
      return BigInt(this.lo >>> 0) + (BigInt(this.hi >>> 0) << 32n);
    }
    /**
     * Converts this long bits to a string
     */
    toString(unsigned = false) {
      return this.toBigInt(unsigned).toString();
    }
    /**
     * Zig-zag encodes this long bits
     */
    zzEncode() {
      const mask = this.hi >> 31;
      this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
      this.lo = (this.lo << 1 ^ mask) >>> 0;
      return this;
    }
    /**
     * Zig-zag decodes this long bits
     */
    zzDecode() {
      const mask = -(this.lo & 1);
      this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
      this.hi = (this.hi >>> 1 ^ mask) >>> 0;
      return this;
    }
    /**
     * Calculates the length of this longbits when encoded as a varint.
     */
    length() {
      const part0 = this.lo;
      const part1 = (this.lo >>> 28 | this.hi << 4) >>> 0;
      const part2 = this.hi >>> 24;
      return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
    }
    /**
     * Constructs new long bits from the specified number
     */
    static fromBigInt(value) {
      if (value === 0n) {
        return zero;
      }
      if (value < MAX_SAFE_NUMBER_INTEGER && value > MIN_SAFE_NUMBER_INTEGER) {
        return this.fromNumber(Number(value));
      }
      const negative = value < 0n;
      if (negative) {
        value = -value;
      }
      let hi = value >> 32n;
      let lo = value - (hi << 32n);
      if (negative) {
        hi = ~hi | 0n;
        lo = ~lo | 0n;
        if (++lo > TWO_32) {
          lo = 0n;
          if (++hi > TWO_32) {
            hi = 0n;
          }
        }
      }
      return new _LongBits(Number(lo), Number(hi));
    }
    /**
     * Constructs new long bits from the specified number
     */
    static fromNumber(value) {
      if (value === 0) {
        return zero;
      }
      const sign = value < 0;
      if (sign) {
        value = -value;
      }
      let lo = value >>> 0;
      let hi = (value - lo) / 4294967296 >>> 0;
      if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
          lo = 0;
          if (++hi > 4294967295) {
            hi = 0;
          }
        }
      }
      return new _LongBits(lo, hi);
    }
    /**
     * Constructs new long bits from a number, long or string
     */
    static from(value) {
      if (typeof value === "number") {
        return _LongBits.fromNumber(value);
      }
      if (typeof value === "bigint") {
        return _LongBits.fromBigInt(value);
      }
      if (typeof value === "string") {
        return _LongBits.fromBigInt(BigInt(value));
      }
      return value.low != null || value.high != null ? new _LongBits(value.low >>> 0, value.high >>> 0) : zero;
    }
  };
  var zero = new LongBits(0, 0);
  zero.toBigInt = function() {
    return 0n;
  };
  zero.zzEncode = zero.zzDecode = function() {
    return this;
  };
  zero.length = function() {
    return 1;
  };
  var TWO_32 = 4294967296n;

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/utils/utf8.js
  function length2(string3) {
    let len = 0;
    let c = 0;
    for (let i = 0; i < string3.length; ++i) {
      c = string3.charCodeAt(i);
      if (c < 128) {
        len += 1;
      } else if (c < 2048) {
        len += 2;
      } else if ((c & 64512) === 55296 && (string3.charCodeAt(i + 1) & 64512) === 56320) {
        ++i;
        len += 4;
      } else {
        len += 3;
      }
    }
    return len;
  }
  function read3(buffer2, start, end) {
    const len = end - start;
    if (len < 1) {
      return "";
    }
    let parts;
    const chunk = [];
    let i = 0;
    let t;
    while (start < end) {
      t = buffer2[start++];
      if (t < 128) {
        chunk[i++] = t;
      } else if (t > 191 && t < 224) {
        chunk[i++] = (t & 31) << 6 | buffer2[start++] & 63;
      } else if (t > 239 && t < 365) {
        t = ((t & 7) << 18 | (buffer2[start++] & 63) << 12 | (buffer2[start++] & 63) << 6 | buffer2[start++] & 63) - 65536;
        chunk[i++] = 55296 + (t >> 10);
        chunk[i++] = 56320 + (t & 1023);
      } else {
        chunk[i++] = (t & 15) << 12 | (buffer2[start++] & 63) << 6 | buffer2[start++] & 63;
      }
      if (i > 8191) {
        (parts ?? (parts = [])).push(String.fromCharCode.apply(String, chunk));
        i = 0;
      }
    }
    if (parts != null) {
      if (i > 0) {
        parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
      }
      return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
  }
  function write5(string3, buffer2, offset) {
    const start = offset;
    let c1;
    let c2;
    for (let i = 0; i < string3.length; ++i) {
      c1 = string3.charCodeAt(i);
      if (c1 < 128) {
        buffer2[offset++] = c1;
      } else if (c1 < 2048) {
        buffer2[offset++] = c1 >> 6 | 192;
        buffer2[offset++] = c1 & 63 | 128;
      } else if ((c1 & 64512) === 55296 && ((c2 = string3.charCodeAt(i + 1)) & 64512) === 56320) {
        c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
        ++i;
        buffer2[offset++] = c1 >> 18 | 240;
        buffer2[offset++] = c1 >> 12 & 63 | 128;
        buffer2[offset++] = c1 >> 6 & 63 | 128;
        buffer2[offset++] = c1 & 63 | 128;
      } else {
        buffer2[offset++] = c1 >> 12 | 224;
        buffer2[offset++] = c1 >> 6 & 63 | 128;
        buffer2[offset++] = c1 & 63 | 128;
      }
    }
    return offset - start;
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/utils/reader.js
  function indexOutOfRange(reader, writeLength) {
    return RangeError(`index out of range: ${reader.pos} + ${writeLength ?? 1} > ${reader.len}`);
  }
  function readFixed32End(buf2, end) {
    return (buf2[end - 4] | buf2[end - 3] << 8 | buf2[end - 2] << 16 | buf2[end - 1] << 24) >>> 0;
  }
  var Uint8ArrayReader = class {
    buf;
    pos;
    len;
    _slice = Uint8Array.prototype.subarray;
    constructor(buffer2) {
      this.buf = buffer2;
      this.pos = 0;
      this.len = buffer2.length;
    }
    /**
     * Reads a varint as an unsigned 32 bit value
     */
    uint32() {
      let value = 4294967295;
      value = (this.buf[this.pos] & 127) >>> 0;
      if (this.buf[this.pos++] < 128)
        return value;
      value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
      if (this.buf[this.pos++] < 128)
        return value;
      value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
      if (this.buf[this.pos++] < 128)
        return value;
      value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
      if (this.buf[this.pos++] < 128)
        return value;
      value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
      if (this.buf[this.pos++] < 128)
        return value;
      if ((this.pos += 5) > this.len) {
        this.pos = this.len;
        throw indexOutOfRange(this, 10);
      }
      return value;
    }
    /**
     * Reads a varint as a signed 32 bit value
     */
    int32() {
      return this.uint32() | 0;
    }
    /**
     * Reads a zig-zag encoded varint as a signed 32 bit value
     */
    sint32() {
      const value = this.uint32();
      return value >>> 1 ^ -(value & 1) | 0;
    }
    /**
     * Reads a varint as a boolean
     */
    bool() {
      return this.uint32() !== 0;
    }
    /**
     * Reads fixed 32 bits as an unsigned 32 bit integer
     */
    fixed32() {
      if (this.pos + 4 > this.len) {
        throw indexOutOfRange(this, 4);
      }
      const res = readFixed32End(this.buf, this.pos += 4);
      return res;
    }
    /**
     * Reads fixed 32 bits as a signed 32 bit integer
     */
    sfixed32() {
      if (this.pos + 4 > this.len) {
        throw indexOutOfRange(this, 4);
      }
      const res = readFixed32End(this.buf, this.pos += 4) | 0;
      return res;
    }
    /**
     * Reads a float (32 bit) as a number
     */
    float() {
      if (this.pos + 4 > this.len) {
        throw indexOutOfRange(this, 4);
      }
      const value = readFloatLE(this.buf, this.pos);
      this.pos += 4;
      return value;
    }
    /**
     * Reads a double (64 bit float) as a number
     */
    double() {
      if (this.pos + 8 > this.len) {
        throw indexOutOfRange(this, 4);
      }
      const value = readDoubleLE(this.buf, this.pos);
      this.pos += 8;
      return value;
    }
    /**
     * Reads a sequence of bytes preceded by its length as a varint
     */
    bytes() {
      const length4 = this.uint32();
      const start = this.pos;
      const end = this.pos + length4;
      if (end > this.len) {
        throw indexOutOfRange(this, length4);
      }
      this.pos += length4;
      return start === end ? new Uint8Array(0) : this.buf.subarray(start, end);
    }
    /**
     * Reads a string preceded by its byte length as a varint
     */
    string() {
      const bytes = this.bytes();
      return read3(bytes, 0, bytes.length);
    }
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint
     */
    skip(length4) {
      if (typeof length4 === "number") {
        if (this.pos + length4 > this.len) {
          throw indexOutOfRange(this, length4);
        }
        this.pos += length4;
      } else {
        do {
          if (this.pos >= this.len) {
            throw indexOutOfRange(this);
          }
        } while ((this.buf[this.pos++] & 128) !== 0);
      }
      return this;
    }
    /**
     * Skips the next element of the specified wire type
     */
    skipType(wireType) {
      switch (wireType) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        case 5:
          this.skip(4);
          break;
        /* istanbul ignore next */
        default:
          throw Error(`invalid wire type ${wireType} at offset ${this.pos}`);
      }
      return this;
    }
    readLongVarint() {
      const bits = new LongBits(0, 0);
      let i = 0;
      if (this.len - this.pos > 4) {
        for (; i < 4; ++i) {
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128) {
            return bits;
          }
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
        if (this.buf[this.pos++] < 128) {
          return bits;
        }
        i = 0;
      } else {
        for (; i < 3; ++i) {
          if (this.pos >= this.len) {
            throw indexOutOfRange(this);
          }
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128) {
            return bits;
          }
        }
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
      }
      if (this.len - this.pos > 4) {
        for (; i < 5; ++i) {
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128) {
            return bits;
          }
        }
      } else {
        for (; i < 5; ++i) {
          if (this.pos >= this.len) {
            throw indexOutOfRange(this);
          }
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128) {
            return bits;
          }
        }
      }
      throw Error("invalid varint encoding");
    }
    readFixed64() {
      if (this.pos + 8 > this.len) {
        throw indexOutOfRange(this, 8);
      }
      const lo = readFixed32End(this.buf, this.pos += 4);
      const hi = readFixed32End(this.buf, this.pos += 4);
      return new LongBits(lo, hi);
    }
    /**
     * Reads a varint as a signed 64 bit value
     */
    int64() {
      return this.readLongVarint().toBigInt();
    }
    /**
     * Reads a varint as a signed 64 bit value returned as a possibly unsafe
     * JavaScript number
     */
    int64Number() {
      return this.readLongVarint().toNumber();
    }
    /**
     * Reads a varint as a signed 64 bit value returned as a string
     */
    int64String() {
      return this.readLongVarint().toString();
    }
    /**
     * Reads a varint as an unsigned 64 bit value
     */
    uint64() {
      return this.readLongVarint().toBigInt(true);
    }
    /**
     * Reads a varint as an unsigned 64 bit value returned as a possibly unsafe
     * JavaScript number
     */
    uint64Number() {
      return this.readLongVarint().toNumber(true);
    }
    /**
     * Reads a varint as an unsigned 64 bit value returned as a string
     */
    uint64String() {
      return this.readLongVarint().toString(true);
    }
    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value
     */
    sint64() {
      return this.readLongVarint().zzDecode().toBigInt();
    }
    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
     * possibly unsafe JavaScript number
     */
    sint64Number() {
      return this.readLongVarint().zzDecode().toNumber();
    }
    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
     * string
     */
    sint64String() {
      return this.readLongVarint().zzDecode().toString();
    }
    /**
     * Reads fixed 64 bits
     */
    fixed64() {
      return this.readFixed64().toBigInt();
    }
    /**
     * Reads fixed 64 bits returned as a possibly unsafe JavaScript number
     */
    fixed64Number() {
      return this.readFixed64().toNumber();
    }
    /**
     * Reads fixed 64 bits returned as a string
     */
    fixed64String() {
      return this.readFixed64().toString();
    }
    /**
     * Reads zig-zag encoded fixed 64 bits
     */
    sfixed64() {
      return this.readFixed64().toBigInt();
    }
    /**
     * Reads zig-zag encoded fixed 64 bits returned as a possibly unsafe
     * JavaScript number
     */
    sfixed64Number() {
      return this.readFixed64().toNumber();
    }
    /**
     * Reads zig-zag encoded fixed 64 bits returned as a string
     */
    sfixed64String() {
      return this.readFixed64().toString();
    }
  };
  function createReader(buf2) {
    return new Uint8ArrayReader(buf2 instanceof Uint8Array ? buf2 : buf2.subarray());
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/decode.js
  function decodeMessage(buf2, codec) {
    const reader = createReader(buf2);
    return codec.decode(reader);
  }

  // node_modules/.pnpm/uint8arrays@5.0.3/node_modules/uint8arrays/dist/src/alloc.js
  function allocUnsafe(size = 0) {
    return new Uint8Array(size);
  }

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base10.js
  var base10_exports = {};
  __export(base10_exports, {
    base10: () => base10
  });
  init_base();
  var base10 = baseX({
    prefix: "9",
    name: "base10",
    alphabet: "0123456789"
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base16.js
  var base16_exports = {};
  __export(base16_exports, {
    base16: () => base16,
    base16upper: () => base16upper
  });
  init_base();
  var base16 = rfc4648({
    prefix: "f",
    name: "base16",
    alphabet: "0123456789abcdef",
    bitsPerChar: 4
  });
  var base16upper = rfc4648({
    prefix: "F",
    name: "base16upper",
    alphabet: "0123456789ABCDEF",
    bitsPerChar: 4
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base2.js
  var base2_exports = {};
  __export(base2_exports, {
    base2: () => base2
  });
  init_base();
  var base2 = rfc4648({
    prefix: "0",
    name: "base2",
    alphabet: "01",
    bitsPerChar: 1
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base256emoji.js
  var base256emoji_exports = {};
  __export(base256emoji_exports, {
    base256emoji: () => base256emoji
  });
  init_base();
  var alphabet = Array.from("\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}");
  var alphabetBytesToChars = alphabet.reduce((p, c, i) => {
    p[i] = c;
    return p;
  }, []);
  var alphabetCharsToBytes = alphabet.reduce((p, c, i) => {
    p[c.codePointAt(0)] = i;
    return p;
  }, []);
  function encode13(data) {
    return data.reduce((p, c) => {
      p += alphabetBytesToChars[c];
      return p;
    }, "");
  }
  function decode15(str) {
    const byts = [];
    for (const char of str) {
      const byt = alphabetCharsToBytes[char.codePointAt(0)];
      if (byt === void 0) {
        throw new Error(`Non-base256emoji character: ${char}`);
      }
      byts.push(byt);
    }
    return new Uint8Array(byts);
  }
  var base256emoji = from2({
    prefix: "\u{1F680}",
    name: "base256emoji",
    encode: encode13,
    decode: decode15
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base36.js
  var base36_exports = {};
  __export(base36_exports, {
    base36: () => base36,
    base36upper: () => base36upper
  });
  init_base();
  var base36 = baseX({
    prefix: "k",
    name: "base36",
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
  });
  var base36upper = baseX({
    prefix: "K",
    name: "base36upper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/basics.js
  init_base58();

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/base8.js
  var base8_exports = {};
  __export(base8_exports, {
    base8: () => base8
  });
  init_base();
  var base8 = rfc4648({
    prefix: "7",
    name: "base8",
    alphabet: "01234567",
    bitsPerChar: 3
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/bases/identity.js
  var identity_exports2 = {};
  __export(identity_exports2, {
    identity: () => identity2
  });
  init_bytes();
  init_base();
  var identity2 = from2({
    prefix: "\0",
    name: "identity",
    encode: (buf2) => toString(buf2),
    decode: (str) => fromString(str)
  });

  // node_modules/.pnpm/multiformats@13.2.2/node_modules/multiformats/dist/src/basics.js
  var bases = { ...identity_exports2, ...base2_exports, ...base8_exports, ...base10_exports, ...base16_exports, ...base32_exports, ...base36_exports, ...base58_exports, ...base64_exports, ...base256emoji_exports };
  var hashes = { ...sha2_browser_exports, ...identity_exports };

  // node_modules/.pnpm/uint8arrays@5.0.3/node_modules/uint8arrays/dist/src/util/bases.js
  function createCodec(name7, prefix, encode18, decode21) {
    return {
      name: name7,
      prefix,
      encoder: {
        name: name7,
        prefix,
        encode: encode18
      },
      decoder: {
        decode: decode21
      }
    };
  }
  var string = createCodec("utf8", "u", (buf2) => {
    const decoder2 = new TextDecoder("utf8");
    return "u" + decoder2.decode(buf2);
  }, (str) => {
    const encoder2 = new TextEncoder();
    return encoder2.encode(str.substring(1));
  });
  var ascii = createCodec("ascii", "a", (buf2) => {
    let string3 = "a";
    for (let i = 0; i < buf2.length; i++) {
      string3 += String.fromCharCode(buf2[i]);
    }
    return string3;
  }, (str) => {
    str = str.substring(1);
    const buf2 = allocUnsafe(str.length);
    for (let i = 0; i < str.length; i++) {
      buf2[i] = str.charCodeAt(i);
    }
    return buf2;
  });
  var BASES = {
    utf8: string,
    "utf-8": string,
    hex: bases.base16,
    latin1: ascii,
    ascii,
    binary: ascii,
    ...bases
  };
  var bases_default = BASES;

  // node_modules/.pnpm/uint8arrays@5.0.3/node_modules/uint8arrays/dist/src/from-string.js
  function fromString3(string3, encoding = "utf8") {
    const base4 = bases_default[encoding];
    if (base4 == null) {
      throw new Error(`Unsupported encoding "${encoding}"`);
    }
    return base4.decoder.decode(`${base4.prefix}${string3}`);
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/utils/pool.js
  function pool(size) {
    const SIZE = size ?? 8192;
    const MAX = SIZE >>> 1;
    let slab;
    let offset = SIZE;
    return function poolAlloc(size2) {
      if (size2 < 1 || size2 > MAX) {
        return allocUnsafe(size2);
      }
      if (offset + size2 > SIZE) {
        slab = allocUnsafe(SIZE);
        offset = 0;
      }
      const buf2 = slab.subarray(offset, offset += size2);
      if ((offset & 7) !== 0) {
        offset = (offset | 7) + 1;
      }
      return buf2;
    };
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/utils/writer.js
  var Op = class {
    /**
     * Function to call
     */
    fn;
    /**
     * Value byte length
     */
    len;
    /**
     * Next operation
     */
    next;
    /**
     * Value to write
     */
    val;
    constructor(fn, len, val) {
      this.fn = fn;
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
  };
  function noop() {
  }
  var State = class {
    /**
     * Current head
     */
    head;
    /**
     * Current tail
     */
    tail;
    /**
     * Current buffer length
     */
    len;
    /**
     * Next state
     */
    next;
    constructor(writer) {
      this.head = writer.head;
      this.tail = writer.tail;
      this.len = writer.len;
      this.next = writer.states;
    }
  };
  var bufferPool = pool();
  function alloc2(size) {
    if (globalThis.Buffer != null) {
      return allocUnsafe(size);
    }
    return bufferPool(size);
  }
  var Uint8ArrayWriter = class {
    /**
     * Current length
     */
    len;
    /**
     * Operations head
     */
    head;
    /**
     * Operations tail
     */
    tail;
    /**
     * Linked forked states
     */
    states;
    constructor() {
      this.len = 0;
      this.head = new Op(noop, 0, 0);
      this.tail = this.head;
      this.states = null;
    }
    /**
     * Pushes a new operation to the queue
     */
    _push(fn, len, val) {
      this.tail = this.tail.next = new Op(fn, len, val);
      this.len += len;
      return this;
    }
    /**
     * Writes an unsigned 32 bit value as a varint
     */
    uint32(value) {
      this.len += (this.tail = this.tail.next = new VarintOp((value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5, value)).len;
      return this;
    }
    /**
     * Writes a signed 32 bit value as a varint`
     */
    int32(value) {
      return value < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
    }
    /**
     * Writes a 32 bit value as a varint, zig-zag encoded
     */
    sint32(value) {
      return this.uint32((value << 1 ^ value >> 31) >>> 0);
    }
    /**
     * Writes an unsigned 64 bit value as a varint
     */
    uint64(value) {
      const bits = LongBits.fromBigInt(value);
      return this._push(writeVarint64, bits.length(), bits);
    }
    /**
     * Writes an unsigned 64 bit value as a varint
     */
    uint64Number(value) {
      const bits = LongBits.fromNumber(value);
      return this._push(writeVarint64, bits.length(), bits);
    }
    /**
     * Writes an unsigned 64 bit value as a varint
     */
    uint64String(value) {
      return this.uint64(BigInt(value));
    }
    /**
     * Writes a signed 64 bit value as a varint
     */
    int64(value) {
      return this.uint64(value);
    }
    /**
     * Writes a signed 64 bit value as a varint
     */
    int64Number(value) {
      return this.uint64Number(value);
    }
    /**
     * Writes a signed 64 bit value as a varint
     */
    int64String(value) {
      return this.uint64String(value);
    }
    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded
     */
    sint64(value) {
      const bits = LongBits.fromBigInt(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    }
    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded
     */
    sint64Number(value) {
      const bits = LongBits.fromNumber(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    }
    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded
     */
    sint64String(value) {
      return this.sint64(BigInt(value));
    }
    /**
     * Writes a boolish value as a varint
     */
    bool(value) {
      return this._push(writeByte, 1, value ? 1 : 0);
    }
    /**
     * Writes an unsigned 32 bit value as fixed 32 bits
     */
    fixed32(value) {
      return this._push(writeFixed32, 4, value >>> 0);
    }
    /**
     * Writes a signed 32 bit value as fixed 32 bits
     */
    sfixed32(value) {
      return this.fixed32(value);
    }
    /**
     * Writes an unsigned 64 bit value as fixed 64 bits
     */
    fixed64(value) {
      const bits = LongBits.fromBigInt(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    }
    /**
     * Writes an unsigned 64 bit value as fixed 64 bits
     */
    fixed64Number(value) {
      const bits = LongBits.fromNumber(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    }
    /**
     * Writes an unsigned 64 bit value as fixed 64 bits
     */
    fixed64String(value) {
      return this.fixed64(BigInt(value));
    }
    /**
     * Writes a signed 64 bit value as fixed 64 bits
     */
    sfixed64(value) {
      return this.fixed64(value);
    }
    /**
     * Writes a signed 64 bit value as fixed 64 bits
     */
    sfixed64Number(value) {
      return this.fixed64Number(value);
    }
    /**
     * Writes a signed 64 bit value as fixed 64 bits
     */
    sfixed64String(value) {
      return this.fixed64String(value);
    }
    /**
     * Writes a float (32 bit)
     */
    float(value) {
      return this._push(writeFloatLE, 4, value);
    }
    /**
     * Writes a double (64 bit float).
     *
     * @function
     * @param {number} value - Value to write
     * @returns {Writer} `this`
     */
    double(value) {
      return this._push(writeDoubleLE, 8, value);
    }
    /**
     * Writes a sequence of bytes
     */
    bytes(value) {
      const len = value.length >>> 0;
      if (len === 0) {
        return this._push(writeByte, 1, 0);
      }
      return this.uint32(len)._push(writeBytes, len, value);
    }
    /**
     * Writes a string
     */
    string(value) {
      const len = length2(value);
      return len !== 0 ? this.uint32(len)._push(write5, len, value) : this._push(writeByte, 1, 0);
    }
    /**
     * Forks this writer's state by pushing it to a stack.
     * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
     */
    fork() {
      this.states = new State(this);
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
      return this;
    }
    /**
     * Resets this instance to the last state
     */
    reset() {
      if (this.states != null) {
        this.head = this.states.head;
        this.tail = this.states.tail;
        this.len = this.states.len;
        this.states = this.states.next;
      } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
      }
      return this;
    }
    /**
     * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
     */
    ldelim() {
      const head = this.head;
      const tail = this.tail;
      const len = this.len;
      this.reset().uint32(len);
      if (len !== 0) {
        this.tail.next = head.next;
        this.tail = tail;
        this.len += len;
      }
      return this;
    }
    /**
     * Finishes the write operation
     */
    finish() {
      let head = this.head.next;
      const buf2 = alloc2(this.len);
      let pos = 0;
      while (head != null) {
        head.fn(head.val, buf2, pos);
        pos += head.len;
        head = head.next;
      }
      return buf2;
    }
  };
  function writeByte(val, buf2, pos) {
    buf2[pos] = val & 255;
  }
  function writeVarint32(val, buf2, pos) {
    while (val > 127) {
      buf2[pos++] = val & 127 | 128;
      val >>>= 7;
    }
    buf2[pos] = val;
  }
  var VarintOp = class extends Op {
    next;
    constructor(len, val) {
      super(writeVarint32, len, val);
      this.next = void 0;
    }
  };
  function writeVarint64(val, buf2, pos) {
    while (val.hi !== 0) {
      buf2[pos++] = val.lo & 127 | 128;
      val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
      val.hi >>>= 7;
    }
    while (val.lo > 127) {
      buf2[pos++] = val.lo & 127 | 128;
      val.lo = val.lo >>> 7;
    }
    buf2[pos++] = val.lo;
  }
  function writeFixed32(val, buf2, pos) {
    buf2[pos] = val & 255;
    buf2[pos + 1] = val >>> 8 & 255;
    buf2[pos + 2] = val >>> 16 & 255;
    buf2[pos + 3] = val >>> 24;
  }
  function writeBytes(val, buf2, pos) {
    buf2.set(val, pos);
  }
  if (globalThis.Buffer != null) {
    Uint8ArrayWriter.prototype.bytes = function(value) {
      const len = value.length >>> 0;
      this.uint32(len);
      if (len > 0) {
        this._push(writeBytesBuffer, len, value);
      }
      return this;
    };
    Uint8ArrayWriter.prototype.string = function(value) {
      const len = globalThis.Buffer.byteLength(value);
      this.uint32(len);
      if (len > 0) {
        this._push(writeStringBuffer, len, value);
      }
      return this;
    };
  }
  function writeBytesBuffer(val, buf2, pos) {
    buf2.set(val, pos);
  }
  function writeStringBuffer(val, buf2, pos) {
    if (val.length < 40) {
      write5(val, buf2, pos);
    } else if (buf2.utf8Write != null) {
      buf2.utf8Write(val, pos);
    } else {
      buf2.set(fromString3(val), pos);
    }
  }
  function createWriter2() {
    return new Uint8ArrayWriter();
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/encode.js
  function encodeMessage(message2, codec) {
    const w = createWriter2();
    codec.encode(message2, w, {
      lengthDelimited: false
    });
    return w.finish();
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/codec.js
  var CODEC_TYPES;
  (function(CODEC_TYPES2) {
    CODEC_TYPES2[CODEC_TYPES2["VARINT"] = 0] = "VARINT";
    CODEC_TYPES2[CODEC_TYPES2["BIT64"] = 1] = "BIT64";
    CODEC_TYPES2[CODEC_TYPES2["LENGTH_DELIMITED"] = 2] = "LENGTH_DELIMITED";
    CODEC_TYPES2[CODEC_TYPES2["START_GROUP"] = 3] = "START_GROUP";
    CODEC_TYPES2[CODEC_TYPES2["END_GROUP"] = 4] = "END_GROUP";
    CODEC_TYPES2[CODEC_TYPES2["BIT32"] = 5] = "BIT32";
  })(CODEC_TYPES || (CODEC_TYPES = {}));
  function createCodec2(name7, type2, encode18, decode21) {
    return {
      name: name7,
      type: type2,
      encode: encode18,
      decode: decode21
    };
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/codecs/enum.js
  function enumeration(v) {
    function findValue(val) {
      if (v[val.toString()] == null) {
        throw new Error("Invalid enum value");
      }
      return v[val];
    }
    const encode18 = function enumEncode(val, writer) {
      const enumValue = findValue(val);
      writer.int32(enumValue);
    };
    const decode21 = function enumDecode(reader) {
      const val = reader.int32();
      return findValue(val);
    };
    return createCodec2("enum", CODEC_TYPES.VARINT, encode18, decode21);
  }

  // node_modules/.pnpm/protons-runtime@5.2.2/node_modules/protons-runtime/dist/src/codecs/message.js
  function message(encode18, decode21) {
    return createCodec2("message", CODEC_TYPES.LENGTH_DELIMITED, encode18, decode21);
  }

  // node_modules/.pnpm/ipfs-unixfs@11.1.2/node_modules/ipfs-unixfs/dist/src/unixfs.js
  var Data2;
  (function(Data3) {
    let DataType;
    (function(DataType2) {
      DataType2["Raw"] = "Raw";
      DataType2["Directory"] = "Directory";
      DataType2["File"] = "File";
      DataType2["Metadata"] = "Metadata";
      DataType2["Symlink"] = "Symlink";
      DataType2["HAMTShard"] = "HAMTShard";
    })(DataType = Data3.DataType || (Data3.DataType = {}));
    let __DataTypeValues;
    (function(__DataTypeValues2) {
      __DataTypeValues2[__DataTypeValues2["Raw"] = 0] = "Raw";
      __DataTypeValues2[__DataTypeValues2["Directory"] = 1] = "Directory";
      __DataTypeValues2[__DataTypeValues2["File"] = 2] = "File";
      __DataTypeValues2[__DataTypeValues2["Metadata"] = 3] = "Metadata";
      __DataTypeValues2[__DataTypeValues2["Symlink"] = 4] = "Symlink";
      __DataTypeValues2[__DataTypeValues2["HAMTShard"] = 5] = "HAMTShard";
    })(__DataTypeValues || (__DataTypeValues = {}));
    (function(DataType2) {
      DataType2.codec = () => {
        return enumeration(__DataTypeValues);
      };
    })(DataType = Data3.DataType || (Data3.DataType = {}));
    let _codec;
    Data3.codec = () => {
      if (_codec == null) {
        _codec = message((obj, w, opts = {}) => {
          if (opts.lengthDelimited !== false) {
            w.fork();
          }
          if (obj.Type != null) {
            w.uint32(8);
            Data3.DataType.codec().encode(obj.Type, w);
          }
          if (obj.Data != null) {
            w.uint32(18);
            w.bytes(obj.Data);
          }
          if (obj.filesize != null) {
            w.uint32(24);
            w.uint64(obj.filesize);
          }
          if (obj.blocksizes != null) {
            for (const value of obj.blocksizes) {
              w.uint32(32);
              w.uint64(value);
            }
          }
          if (obj.hashType != null) {
            w.uint32(40);
            w.uint64(obj.hashType);
          }
          if (obj.fanout != null) {
            w.uint32(48);
            w.uint64(obj.fanout);
          }
          if (obj.mode != null) {
            w.uint32(56);
            w.uint32(obj.mode);
          }
          if (obj.mtime != null) {
            w.uint32(66);
            UnixTime2.codec().encode(obj.mtime, w);
          }
          if (opts.lengthDelimited !== false) {
            w.ldelim();
          }
        }, (reader, length4) => {
          const obj = {
            blocksizes: []
          };
          const end = length4 == null ? reader.len : reader.pos + length4;
          while (reader.pos < end) {
            const tag2 = reader.uint32();
            switch (tag2 >>> 3) {
              case 1:
                obj.Type = Data3.DataType.codec().decode(reader);
                break;
              case 2:
                obj.Data = reader.bytes();
                break;
              case 3:
                obj.filesize = reader.uint64();
                break;
              case 4:
                obj.blocksizes.push(reader.uint64());
                break;
              case 5:
                obj.hashType = reader.uint64();
                break;
              case 6:
                obj.fanout = reader.uint64();
                break;
              case 7:
                obj.mode = reader.uint32();
                break;
              case 8:
                obj.mtime = UnixTime2.codec().decode(reader, reader.uint32());
                break;
              default:
                reader.skipType(tag2 & 7);
                break;
            }
          }
          return obj;
        });
      }
      return _codec;
    };
    Data3.encode = (obj) => {
      return encodeMessage(obj, Data3.codec());
    };
    Data3.decode = (buf2) => {
      return decodeMessage(buf2, Data3.codec());
    };
  })(Data2 || (Data2 = {}));
  var UnixTime2;
  (function(UnixTime3) {
    let _codec;
    UnixTime3.codec = () => {
      if (_codec == null) {
        _codec = message((obj, w, opts = {}) => {
          if (opts.lengthDelimited !== false) {
            w.fork();
          }
          if (obj.Seconds != null) {
            w.uint32(8);
            w.int64(obj.Seconds);
          }
          if (obj.FractionalNanoseconds != null) {
            w.uint32(21);
            w.fixed32(obj.FractionalNanoseconds);
          }
          if (opts.lengthDelimited !== false) {
            w.ldelim();
          }
        }, (reader, length4) => {
          const obj = {};
          const end = length4 == null ? reader.len : reader.pos + length4;
          while (reader.pos < end) {
            const tag2 = reader.uint32();
            switch (tag2 >>> 3) {
              case 1:
                obj.Seconds = reader.int64();
                break;
              case 2:
                obj.FractionalNanoseconds = reader.fixed32();
                break;
              default:
                reader.skipType(tag2 & 7);
                break;
            }
          }
          return obj;
        });
      }
      return _codec;
    };
    UnixTime3.encode = (obj) => {
      return encodeMessage(obj, UnixTime3.codec());
    };
    UnixTime3.decode = (buf2) => {
      return decodeMessage(buf2, UnixTime3.codec());
    };
  })(UnixTime2 || (UnixTime2 = {}));
  var Metadata2;
  (function(Metadata3) {
    let _codec;
    Metadata3.codec = () => {
      if (_codec == null) {
        _codec = message((obj, w, opts = {}) => {
          if (opts.lengthDelimited !== false) {
            w.fork();
          }
          if (obj.MimeType != null) {
            w.uint32(10);
            w.string(obj.MimeType);
          }
          if (opts.lengthDelimited !== false) {
            w.ldelim();
          }
        }, (reader, length4) => {
          const obj = {};
          const end = length4 == null ? reader.len : reader.pos + length4;
          while (reader.pos < end) {
            const tag2 = reader.uint32();
            switch (tag2 >>> 3) {
              case 1:
                obj.MimeType = reader.string();
                break;
              default:
                reader.skipType(tag2 & 7);
                break;
            }
          }
          return obj;
        });
      }
      return _codec;
    };
    Metadata3.encode = (obj) => {
      return encodeMessage(obj, Metadata3.codec());
    };
    Metadata3.decode = (buf2) => {
      return decodeMessage(buf2, Metadata3.codec());
    };
  })(Metadata2 || (Metadata2 = {}));

  // node_modules/.pnpm/ipfs-unixfs@11.1.2/node_modules/ipfs-unixfs/dist/src/index.js
  var types = {
    Raw: "raw",
    Directory: "directory",
    File: "file",
    Metadata: "metadata",
    Symlink: "symlink",
    HAMTShard: "hamt-sharded-directory"
  };
  var dirTypes = [
    "directory",
    "hamt-sharded-directory"
  ];
  var DEFAULT_FILE_MODE2 = parseInt("0644", 8);
  var DEFAULT_DIRECTORY_MODE2 = parseInt("0755", 8);
  var UnixFS = class _UnixFS {
    /**
     * Decode from protobuf https://github.com/ipfs/specs/blob/master/UNIXFS.md
     */
    static unmarshal(marshaled) {
      const message2 = Data2.decode(marshaled);
      const data = new _UnixFS({
        type: types[message2.Type != null ? message2.Type.toString() : "File"],
        data: message2.Data,
        blockSizes: message2.blocksizes,
        mode: message2.mode,
        mtime: message2.mtime != null ? {
          secs: message2.mtime.Seconds ?? 0n,
          nsecs: message2.mtime.FractionalNanoseconds
        } : void 0,
        fanout: message2.fanout
      });
      data._originalMode = message2.mode ?? 0;
      return data;
    }
    type;
    data;
    blockSizes;
    hashType;
    fanout;
    mtime;
    _mode;
    _originalMode;
    constructor(options = {
      type: "file"
    }) {
      const { type: type2, data, blockSizes, hashType, fanout, mtime, mode } = options;
      if (type2 != null && !Object.values(types).includes(type2)) {
        throw (0, import_err_code5.default)(new Error("Type: " + type2 + " is not valid"), "ERR_INVALID_TYPE");
      }
      this.type = type2 ?? "file";
      this.data = data;
      this.hashType = hashType;
      this.fanout = fanout;
      this.blockSizes = blockSizes ?? [];
      this._originalMode = 0;
      this.mode = mode;
      this.mtime = mtime;
    }
    set mode(mode) {
      if (mode == null) {
        this._mode = this.isDirectory() ? DEFAULT_DIRECTORY_MODE2 : DEFAULT_FILE_MODE2;
      } else {
        this._mode = mode & 4095;
      }
    }
    get mode() {
      return this._mode;
    }
    isDirectory() {
      return dirTypes.includes(this.type);
    }
    addBlockSize(size) {
      this.blockSizes.push(size);
    }
    removeBlockSize(index2) {
      this.blockSizes.splice(index2, 1);
    }
    /**
     * Returns `0n` for directories or `data.length + sum(blockSizes)` for everything else
     */
    fileSize() {
      if (this.isDirectory()) {
        return 0n;
      }
      let sum = 0n;
      this.blockSizes.forEach((size) => {
        sum += size;
      });
      if (this.data != null) {
        sum += BigInt(this.data.length);
      }
      return sum;
    }
    /**
     * encode to protobuf Uint8Array
     */
    marshal() {
      let type2;
      switch (this.type) {
        case "raw":
          type2 = Data2.DataType.Raw;
          break;
        case "directory":
          type2 = Data2.DataType.Directory;
          break;
        case "file":
          type2 = Data2.DataType.File;
          break;
        case "metadata":
          type2 = Data2.DataType.Metadata;
          break;
        case "symlink":
          type2 = Data2.DataType.Symlink;
          break;
        case "hamt-sharded-directory":
          type2 = Data2.DataType.HAMTShard;
          break;
        default:
          throw (0, import_err_code5.default)(new Error(`Type: ${type2} is not valid`), "ERR_INVALID_TYPE");
      }
      let data = this.data;
      if (this.data == null || this.data.length === 0) {
        data = void 0;
      }
      let mode;
      if (this.mode != null) {
        mode = this._originalMode & 4294963200 | (this.mode ?? 0);
        if (mode === DEFAULT_FILE_MODE2 && !this.isDirectory()) {
          mode = void 0;
        }
        if (mode === DEFAULT_DIRECTORY_MODE2 && this.isDirectory()) {
          mode = void 0;
        }
      }
      let mtime;
      if (this.mtime != null) {
        mtime = {
          Seconds: this.mtime.secs,
          FractionalNanoseconds: this.mtime.nsecs
        };
      }
      return Data2.encode({
        Type: type2,
        Data: data,
        filesize: this.isDirectory() ? void 0 : this.fileSize(),
        blocksizes: this.blockSizes,
        hashType: this.hashType,
        fanout: this.fanout,
        mode,
        mtime
      });
    }
  };

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/utils/find-cid-in-shard.js
  var import_err_code6 = __toESM(require_err_code(), 1);

  // node_modules/.pnpm/hamt-sharding@3.0.2/node_modules/hamt-sharding/dist/src/bucket.js
  var import_sparse_array = __toESM(require_sparse_array(), 1);

  // node_modules/.pnpm/uint8arrays@4.0.10/node_modules/uint8arrays/dist/src/util/as-uint8array.js
  function asUint8Array2(buf2) {
    if (globalThis.Buffer != null) {
      return new Uint8Array(buf2.buffer, buf2.byteOffset, buf2.byteLength);
    }
    return buf2;
  }

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base10.js
  var base10_exports2 = {};
  __export(base10_exports2, {
    base10: () => base102
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/vendor/base-x.js
  function base3(ALPHABET, name7) {
    if (ALPHABET.length >= 255) {
      throw new TypeError("Alphabet too long");
    }
    var BASE_MAP = new Uint8Array(256);
    for (var j = 0; j < BASE_MAP.length; j++) {
      BASE_MAP[j] = 255;
    }
    for (var i = 0; i < ALPHABET.length; i++) {
      var x = ALPHABET.charAt(i);
      var xc = x.charCodeAt(0);
      if (BASE_MAP[xc] !== 255) {
        throw new TypeError(x + " is ambiguous");
      }
      BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256);
    var iFACTOR = Math.log(256) / Math.log(BASE);
    function encode18(source) {
      if (source instanceof Uint8Array) ;
      else if (ArrayBuffer.isView(source)) {
        source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
      } else if (Array.isArray(source)) {
        source = Uint8Array.from(source);
      }
      if (!(source instanceof Uint8Array)) {
        throw new TypeError("Expected Uint8Array");
      }
      if (source.length === 0) {
        return "";
      }
      var zeroes = 0;
      var length4 = 0;
      var pbegin = 0;
      var pend = source.length;
      while (pbegin !== pend && source[pbegin] === 0) {
        pbegin++;
        zeroes++;
      }
      var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
      var b58 = new Uint8Array(size);
      while (pbegin !== pend) {
        var carry = source[pbegin];
        var i2 = 0;
        for (var it1 = size - 1; (carry !== 0 || i2 < length4) && it1 !== -1; it1--, i2++) {
          carry += 256 * b58[it1] >>> 0;
          b58[it1] = carry % BASE >>> 0;
          carry = carry / BASE >>> 0;
        }
        if (carry !== 0) {
          throw new Error("Non-zero carry");
        }
        length4 = i2;
        pbegin++;
      }
      var it2 = size - length4;
      while (it2 !== size && b58[it2] === 0) {
        it2++;
      }
      var str = LEADER.repeat(zeroes);
      for (; it2 < size; ++it2) {
        str += ALPHABET.charAt(b58[it2]);
      }
      return str;
    }
    function decodeUnsafe(source) {
      if (typeof source !== "string") {
        throw new TypeError("Expected String");
      }
      if (source.length === 0) {
        return new Uint8Array();
      }
      var psz = 0;
      if (source[psz] === " ") {
        return;
      }
      var zeroes = 0;
      var length4 = 0;
      while (source[psz] === LEADER) {
        zeroes++;
        psz++;
      }
      var size = (source.length - psz) * FACTOR + 1 >>> 0;
      var b256 = new Uint8Array(size);
      while (source[psz]) {
        var carry = BASE_MAP[source.charCodeAt(psz)];
        if (carry === 255) {
          return;
        }
        var i2 = 0;
        for (var it3 = size - 1; (carry !== 0 || i2 < length4) && it3 !== -1; it3--, i2++) {
          carry += BASE * b256[it3] >>> 0;
          b256[it3] = carry % 256 >>> 0;
          carry = carry / 256 >>> 0;
        }
        if (carry !== 0) {
          throw new Error("Non-zero carry");
        }
        length4 = i2;
        psz++;
      }
      if (source[psz] === " ") {
        return;
      }
      var it4 = size - length4;
      while (it4 !== size && b256[it4] === 0) {
        it4++;
      }
      var vch = new Uint8Array(zeroes + (size - it4));
      var j2 = zeroes;
      while (it4 !== size) {
        vch[j2++] = b256[it4++];
      }
      return vch;
    }
    function decode21(string3) {
      var buffer2 = decodeUnsafe(string3);
      if (buffer2) {
        return buffer2;
      }
      throw new Error(`Non-${name7} character`);
    }
    return {
      encode: encode18,
      decodeUnsafe,
      decode: decode21
    };
  }
  var src2 = base3;
  var _brrp__multiformats_scope_baseX2 = src2;
  var base_x_default2 = _brrp__multiformats_scope_baseX2;

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bytes.js
  var empty4 = new Uint8Array(0);
  var equals3 = (aa, bb) => {
    if (aa === bb) return true;
    if (aa.byteLength !== bb.byteLength) {
      return false;
    }
    for (let ii = 0; ii < aa.byteLength; ii++) {
      if (aa[ii] !== bb[ii]) {
        return false;
      }
    }
    return true;
  };
  var coerce2 = (o) => {
    if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") return o;
    if (o instanceof ArrayBuffer) return new Uint8Array(o);
    if (ArrayBuffer.isView(o)) {
      return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
    }
    throw new Error("Unknown type, must be binary type");
  };
  var fromString4 = (str) => new TextEncoder().encode(str);
  var toString3 = (b) => new TextDecoder().decode(b);

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base.js
  var Encoder2 = class {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(bytes:Uint8Array) => string} baseEncode
     */
    constructor(name7, prefix, baseEncode) {
      this.name = name7;
      this.prefix = prefix;
      this.baseEncode = baseEncode;
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {API.Multibase<Prefix>}
     */
    encode(bytes) {
      if (bytes instanceof Uint8Array) {
        return `${this.prefix}${this.baseEncode(bytes)}`;
      } else {
        throw Error("Unknown type, must be binary type");
      }
    }
  };
  var Decoder2 = class {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(text:string) => Uint8Array} baseDecode
     */
    constructor(name7, prefix, baseDecode) {
      this.name = name7;
      this.prefix = prefix;
      if (prefix.codePointAt(0) === void 0) {
        throw new Error("Invalid prefix character");
      }
      this.prefixCodePoint = /** @type {number} */
      prefix.codePointAt(0);
      this.baseDecode = baseDecode;
    }
    /**
     * @param {string} text
     */
    decode(text) {
      if (typeof text === "string") {
        if (text.codePointAt(0) !== this.prefixCodePoint) {
          throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
        }
        return this.baseDecode(text.slice(this.prefix.length));
      } else {
        throw Error("Can only multibase decode strings");
      }
    }
    /**
     * @template {string} OtherPrefix
     * @param {API.UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
     * @returns {ComposedDecoder<Prefix|OtherPrefix>}
     */
    or(decoder2) {
      return or2(this, decoder2);
    }
  };
  var ComposedDecoder2 = class {
    /**
     * @param {Decoders<Prefix>} decoders
     */
    constructor(decoders) {
      this.decoders = decoders;
    }
    /**
     * @template {string} OtherPrefix
     * @param {API.UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
     * @returns {ComposedDecoder<Prefix|OtherPrefix>}
     */
    or(decoder2) {
      return or2(this, decoder2);
    }
    /**
     * @param {string} input
     * @returns {Uint8Array}
     */
    decode(input) {
      const prefix = (
        /** @type {Prefix} */
        input[0]
      );
      const decoder2 = this.decoders[prefix];
      if (decoder2) {
        return decoder2.decode(input);
      } else {
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
      }
    }
  };
  var or2 = (left, right) => new ComposedDecoder2(
    /** @type {Decoders<L|R>} */
    {
      ...left.decoders || { [
        /** @type API.UnibaseDecoder<L> */
        left.prefix
      ]: left },
      ...right.decoders || { [
        /** @type API.UnibaseDecoder<R> */
        right.prefix
      ]: right }
    }
  );
  var Codec2 = class {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(bytes:Uint8Array) => string} baseEncode
     * @param {(text:string) => Uint8Array} baseDecode
     */
    constructor(name7, prefix, baseEncode, baseDecode) {
      this.name = name7;
      this.prefix = prefix;
      this.baseEncode = baseEncode;
      this.baseDecode = baseDecode;
      this.encoder = new Encoder2(name7, prefix, baseEncode);
      this.decoder = new Decoder2(name7, prefix, baseDecode);
    }
    /**
     * @param {Uint8Array} input
     */
    encode(input) {
      return this.encoder.encode(input);
    }
    /**
     * @param {string} input
     */
    decode(input) {
      return this.decoder.decode(input);
    }
  };
  var from6 = ({ name: name7, prefix, encode: encode18, decode: decode21 }) => new Codec2(name7, prefix, encode18, decode21);
  var baseX2 = ({ prefix, name: name7, alphabet: alphabet3 }) => {
    const { encode: encode18, decode: decode21 } = base_x_default2(alphabet3, name7);
    return from6({
      prefix,
      name: name7,
      encode: encode18,
      /**
       * @param {string} text
       */
      decode: (text) => coerce2(decode21(text))
    });
  };
  var decode16 = (string3, alphabet3, bitsPerChar, name7) => {
    const codes = {};
    for (let i = 0; i < alphabet3.length; ++i) {
      codes[alphabet3[i]] = i;
    }
    let end = string3.length;
    while (string3[end - 1] === "=") {
      --end;
    }
    const out = new Uint8Array(end * bitsPerChar / 8 | 0);
    let bits = 0;
    let buffer2 = 0;
    let written = 0;
    for (let i = 0; i < end; ++i) {
      const value = codes[string3[i]];
      if (value === void 0) {
        throw new SyntaxError(`Non-${name7} character`);
      }
      buffer2 = buffer2 << bitsPerChar | value;
      bits += bitsPerChar;
      if (bits >= 8) {
        bits -= 8;
        out[written++] = 255 & buffer2 >> bits;
      }
    }
    if (bits >= bitsPerChar || 255 & buffer2 << 8 - bits) {
      throw new SyntaxError("Unexpected end of data");
    }
    return out;
  };
  var encode14 = (data, alphabet3, bitsPerChar) => {
    const pad = alphabet3[alphabet3.length - 1] === "=";
    const mask = (1 << bitsPerChar) - 1;
    let out = "";
    let bits = 0;
    let buffer2 = 0;
    for (let i = 0; i < data.length; ++i) {
      buffer2 = buffer2 << 8 | data[i];
      bits += 8;
      while (bits > bitsPerChar) {
        bits -= bitsPerChar;
        out += alphabet3[mask & buffer2 >> bits];
      }
    }
    if (bits) {
      out += alphabet3[mask & buffer2 << bitsPerChar - bits];
    }
    if (pad) {
      while (out.length * bitsPerChar & 7) {
        out += "=";
      }
    }
    return out;
  };
  var rfc46482 = ({ name: name7, prefix, bitsPerChar, alphabet: alphabet3 }) => {
    return from6({
      prefix,
      name: name7,
      encode(input) {
        return encode14(input, alphabet3, bitsPerChar);
      },
      decode(input) {
        return decode16(input, alphabet3, bitsPerChar, name7);
      }
    });
  };

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base10.js
  var base102 = baseX2({
    prefix: "9",
    name: "base10",
    alphabet: "0123456789"
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base16.js
  var base16_exports2 = {};
  __export(base16_exports2, {
    base16: () => base162,
    base16upper: () => base16upper2
  });
  var base162 = rfc46482({
    prefix: "f",
    name: "base16",
    alphabet: "0123456789abcdef",
    bitsPerChar: 4
  });
  var base16upper2 = rfc46482({
    prefix: "F",
    name: "base16upper",
    alphabet: "0123456789ABCDEF",
    bitsPerChar: 4
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base2.js
  var base2_exports2 = {};
  __export(base2_exports2, {
    base2: () => base22
  });
  var base22 = rfc46482({
    prefix: "0",
    name: "base2",
    alphabet: "01",
    bitsPerChar: 1
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base256emoji.js
  var base256emoji_exports2 = {};
  __export(base256emoji_exports2, {
    base256emoji: () => base256emoji2
  });
  var alphabet2 = Array.from("\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}");
  var alphabetBytesToChars2 = (
    /** @type {string[]} */
    alphabet2.reduce(
      (p, c, i) => {
        p[i] = c;
        return p;
      },
      /** @type {string[]} */
      []
    )
  );
  var alphabetCharsToBytes2 = (
    /** @type {number[]} */
    alphabet2.reduce(
      (p, c, i) => {
        p[
          /** @type {number} */
          c.codePointAt(0)
        ] = i;
        return p;
      },
      /** @type {number[]} */
      []
    )
  );
  function encode15(data) {
    return data.reduce((p, c) => {
      p += alphabetBytesToChars2[c];
      return p;
    }, "");
  }
  function decode17(str) {
    const byts = [];
    for (const char of str) {
      const byt = alphabetCharsToBytes2[
        /** @type {number} */
        char.codePointAt(0)
      ];
      if (byt === void 0) {
        throw new Error(`Non-base256emoji character: ${char}`);
      }
      byts.push(byt);
    }
    return new Uint8Array(byts);
  }
  var base256emoji2 = from6({
    prefix: "\u{1F680}",
    name: "base256emoji",
    encode: encode15,
    decode: decode17
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base32.js
  var base32_exports2 = {};
  __export(base32_exports2, {
    base32: () => base322,
    base32hex: () => base32hex2,
    base32hexpad: () => base32hexpad2,
    base32hexpadupper: () => base32hexpadupper2,
    base32hexupper: () => base32hexupper2,
    base32pad: () => base32pad2,
    base32padupper: () => base32padupper2,
    base32upper: () => base32upper2,
    base32z: () => base32z2
  });
  var base322 = rfc46482({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
  });
  var base32upper2 = rfc46482({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
  });
  var base32pad2 = rfc46482({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
  });
  var base32padupper2 = rfc46482({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
  });
  var base32hex2 = rfc46482({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
  });
  var base32hexupper2 = rfc46482({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
  });
  var base32hexpad2 = rfc46482({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
  });
  var base32hexpadupper2 = rfc46482({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
  });
  var base32z2 = rfc46482({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base36.js
  var base36_exports2 = {};
  __export(base36_exports2, {
    base36: () => base362,
    base36upper: () => base36upper2
  });
  var base362 = baseX2({
    prefix: "k",
    name: "base36",
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
  });
  var base36upper2 = baseX2({
    prefix: "K",
    name: "base36upper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base58.js
  var base58_exports2 = {};
  __export(base58_exports2, {
    base58btc: () => base58btc2,
    base58flickr: () => base58flickr2
  });
  var base58btc2 = baseX2({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  });
  var base58flickr2 = baseX2({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base64.js
  var base64_exports2 = {};
  __export(base64_exports2, {
    base64: () => base642,
    base64pad: () => base64pad2,
    base64url: () => base64url2,
    base64urlpad: () => base64urlpad2
  });
  var base642 = rfc46482({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6
  });
  var base64pad2 = rfc46482({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6
  });
  var base64url2 = rfc46482({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6
  });
  var base64urlpad2 = rfc46482({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/base8.js
  var base8_exports2 = {};
  __export(base8_exports2, {
    base8: () => base82
  });
  var base82 = rfc46482({
    prefix: "7",
    name: "base8",
    alphabet: "01234567",
    bitsPerChar: 3
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/bases/identity.js
  var identity_exports3 = {};
  __export(identity_exports3, {
    identity: () => identity3
  });
  var identity3 = from6({
    prefix: "\0",
    name: "identity",
    encode: (buf2) => toString3(buf2),
    decode: (str) => fromString4(str)
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/codecs/json.js
  var textEncoder5 = new TextEncoder();
  var textDecoder4 = new TextDecoder();

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/hashes/identity.js
  var identity_exports4 = {};
  __export(identity_exports4, {
    identity: () => identity4
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/vendor/varint.js
  var encode_12 = encode16;
  var MSB2 = 128;
  var REST2 = 127;
  var MSBALL2 = ~REST2;
  var INT2 = Math.pow(2, 31);
  function encode16(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while (num >= INT2) {
      out[offset++] = num & 255 | MSB2;
      num /= 128;
    }
    while (num & MSBALL2) {
      out[offset++] = num & 255 | MSB2;
      num >>>= 7;
    }
    out[offset] = num | 0;
    encode16.bytes = offset - oldOffset + 1;
    return out;
  }
  var decode18 = read4;
  var MSB$12 = 128;
  var REST$12 = 127;
  function read4(buf2, offset) {
    var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf2.length;
    do {
      if (counter >= l) {
        read4.bytes = 0;
        throw new RangeError("Could not decode varint");
      }
      b = buf2[counter++];
      res += shift < 28 ? (b & REST$12) << shift : (b & REST$12) * Math.pow(2, shift);
      shift += 7;
    } while (b >= MSB$12);
    read4.bytes = counter - offset;
    return res;
  }
  var N12 = Math.pow(2, 7);
  var N22 = Math.pow(2, 14);
  var N32 = Math.pow(2, 21);
  var N42 = Math.pow(2, 28);
  var N52 = Math.pow(2, 35);
  var N62 = Math.pow(2, 42);
  var N72 = Math.pow(2, 49);
  var N82 = Math.pow(2, 56);
  var N92 = Math.pow(2, 63);
  var length3 = function(value) {
    return value < N12 ? 1 : value < N22 ? 2 : value < N32 ? 3 : value < N42 ? 4 : value < N52 ? 5 : value < N62 ? 6 : value < N72 ? 7 : value < N82 ? 8 : value < N92 ? 9 : 10;
  };
  var varint2 = {
    encode: encode_12,
    decode: decode18,
    encodingLength: length3
  };
  var _brrp_varint2 = varint2;
  var varint_default2 = _brrp_varint2;

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/varint.js
  var decode19 = (data, offset = 0) => {
    const code9 = varint_default2.decode(data, offset);
    return [code9, varint_default2.decode.bytes];
  };
  var encodeTo2 = (int, target, offset = 0) => {
    varint_default2.encode(int, target, offset);
    return target;
  };
  var encodingLength2 = (int) => {
    return varint_default2.encodingLength(int);
  };

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/hashes/digest.js
  var create11 = (code9, digest3) => {
    const size = digest3.byteLength;
    const sizeOffset = encodingLength2(code9);
    const digestOffset = sizeOffset + encodingLength2(size);
    const bytes = new Uint8Array(digestOffset + size);
    encodeTo2(code9, bytes, 0);
    encodeTo2(size, bytes, sizeOffset);
    bytes.set(digest3, digestOffset);
    return new Digest2(code9, size, digest3, bytes);
  };
  var decode20 = (multihash) => {
    const bytes = coerce2(multihash);
    const [code9, sizeOffset] = decode19(bytes);
    const [size, digestOffset] = decode19(bytes.subarray(sizeOffset));
    const digest3 = bytes.subarray(sizeOffset + digestOffset);
    if (digest3.byteLength !== size) {
      throw new Error("Incorrect length");
    }
    return new Digest2(code9, size, digest3, bytes);
  };
  var equals4 = (a, b) => {
    if (a === b) {
      return true;
    } else {
      const data = (
        /** @type {{code?:unknown, size?:unknown, bytes?:unknown}} */
        b
      );
      return a.code === data.code && a.size === data.size && data.bytes instanceof Uint8Array && equals3(a.bytes, data.bytes);
    }
  };
  var Digest2 = class {
    /**
     * Creates a multihash digest.
     *
     * @param {Code} code
     * @param {Size} size
     * @param {Uint8Array} digest
     * @param {Uint8Array} bytes
     */
    constructor(code9, size, digest3, bytes) {
      this.code = code9;
      this.size = size;
      this.digest = digest3;
      this.bytes = bytes;
    }
  };

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/hashes/identity.js
  var code8 = 0;
  var name6 = "identity";
  var encode17 = coerce2;
  var digest2 = (input) => create11(code8, encode17(input));
  var identity4 = { code: code8, name: name6, encode: encode17, digest: digest2 };

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/hashes/sha2-browser.js
  var sha2_browser_exports2 = {};
  __export(sha2_browser_exports2, {
    sha256: () => sha2562,
    sha512: () => sha5122
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/hashes/hasher.js
  var from7 = ({ name: name7, code: code9, encode: encode18 }) => new Hasher2(name7, code9, encode18);
  var Hasher2 = class {
    /**
     *
     * @param {Name} name
     * @param {Code} code
     * @param {(input: Uint8Array) => Await<Uint8Array>} encode
     */
    constructor(name7, code9, encode18) {
      this.name = name7;
      this.code = code9;
      this.encode = encode18;
    }
    /**
     * @param {Uint8Array} input
     * @returns {Await<Digest.Digest<Code, number>>}
     */
    digest(input) {
      if (input instanceof Uint8Array) {
        const result = this.encode(input);
        return result instanceof Uint8Array ? create11(this.code, result) : result.then((digest3) => create11(this.code, digest3));
      } else {
        throw Error("Unknown type, must be binary type");
      }
    }
  };

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/hashes/sha2-browser.js
  var sha2 = (name7) => (
    /**
     * @param {Uint8Array} data
     */
    async (data) => new Uint8Array(await crypto.subtle.digest(name7, data))
  );
  var sha2562 = from7({
    name: "sha2-256",
    code: 18,
    encode: sha2("SHA-256")
  });
  var sha5122 = from7({
    name: "sha2-512",
    code: 19,
    encode: sha2("SHA-512")
  });

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/cid.js
  var format3 = (link2, base4) => {
    const { bytes, version } = link2;
    switch (version) {
      case 0:
        return toStringV02(
          bytes,
          baseCache2(link2),
          /** @type {API.MultibaseEncoder<"z">} */
          base4 || base58btc2.encoder
        );
      default:
        return toStringV12(
          bytes,
          baseCache2(link2),
          /** @type {API.MultibaseEncoder<Prefix>} */
          base4 || base322.encoder
        );
    }
  };
  var cache2 = /* @__PURE__ */ new WeakMap();
  var baseCache2 = (cid) => {
    const baseCache3 = cache2.get(cid);
    if (baseCache3 == null) {
      const baseCache4 = /* @__PURE__ */ new Map();
      cache2.set(cid, baseCache4);
      return baseCache4;
    }
    return baseCache3;
  };
  var CID2 = class _CID {
    /**
     * @param {Version} version - Version of the CID
     * @param {Format} code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param {API.MultihashDigest<Alg>} multihash - (Multi)hash of the of the content.
     * @param {Uint8Array} bytes
     */
    constructor(version, code9, multihash, bytes) {
      this.code = code9;
      this.version = version;
      this.multihash = multihash;
      this.bytes = bytes;
      this["/"] = bytes;
    }
    /**
     * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
     * please either use `CID.asCID(cid)` or switch to new signalling mechanism
     *
     * @deprecated
     */
    get asCID() {
      return this;
    }
    // ArrayBufferView
    get byteOffset() {
      return this.bytes.byteOffset;
    }
    // ArrayBufferView
    get byteLength() {
      return this.bytes.byteLength;
    }
    /**
     * @returns {CID<Data, API.DAG_PB, API.SHA_256, 0>}
     */
    toV0() {
      switch (this.version) {
        case 0: {
          return (
            /** @type {CID<Data, API.DAG_PB, API.SHA_256, 0>} */
            this
          );
        }
        case 1: {
          const { code: code9, multihash } = this;
          if (code9 !== DAG_PB_CODE2) {
            throw new Error("Cannot convert a non dag-pb CID to CIDv0");
          }
          if (multihash.code !== SHA_256_CODE2) {
            throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
          }
          return (
            /** @type {CID<Data, API.DAG_PB, API.SHA_256, 0>} */
            _CID.createV0(
              /** @type {API.MultihashDigest<API.SHA_256>} */
              multihash
            )
          );
        }
        default: {
          throw Error(
            `Can not convert CID version ${this.version} to version 0. This is a bug please report`
          );
        }
      }
    }
    /**
     * @returns {CID<Data, Format, Alg, 1>}
     */
    toV1() {
      switch (this.version) {
        case 0: {
          const { code: code9, digest: digest3 } = this.multihash;
          const multihash = create11(code9, digest3);
          return (
            /** @type {CID<Data, Format, Alg, 1>} */
            _CID.createV1(this.code, multihash)
          );
        }
        case 1: {
          return (
            /** @type {CID<Data, Format, Alg, 1>} */
            this
          );
        }
        default: {
          throw Error(
            `Can not convert CID version ${this.version} to version 1. This is a bug please report`
          );
        }
      }
    }
    /**
     * @param {unknown} other
     * @returns {other is CID<Data, Format, Alg, Version>}
     */
    equals(other) {
      return _CID.equals(this, other);
    }
    /**
     * @template {unknown} Data
     * @template {number} Format
     * @template {number} Alg
     * @template {API.Version} Version
     * @param {API.Link<Data, Format, Alg, Version>} self
     * @param {unknown} other
     * @returns {other is CID}
     */
    static equals(self2, other) {
      const unknown = (
        /** @type {{code?:unknown, version?:unknown, multihash?:unknown}} */
        other
      );
      return unknown && self2.code === unknown.code && self2.version === unknown.version && equals4(self2.multihash, unknown.multihash);
    }
    /**
     * @param {API.MultibaseEncoder<string>} [base]
     * @returns {string}
     */
    toString(base4) {
      return format3(this, base4);
    }
    /**
     * @returns {API.LinkJSON<this>}
     */
    toJSON() {
      return { "/": format3(this) };
    }
    link() {
      return this;
    }
    get [Symbol.toStringTag]() {
      return "CID";
    }
    // Legacy
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return `CID(${this.toString()})`;
    }
    /**
     * Takes any input `value` and returns a `CID` instance if it was
     * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
     * it will return value back. If `value` is not instance of this CID
     * class, but is compatible CID it will return new instance of this
     * `CID` class. Otherwise returns null.
     *
     * This allows two different incompatible versions of CID library to
     * co-exist and interop as long as binary interface is compatible.
     *
     * @template {unknown} Data
     * @template {number} Format
     * @template {number} Alg
     * @template {API.Version} Version
     * @template {unknown} U
     * @param {API.Link<Data, Format, Alg, Version>|U} input
     * @returns {CID<Data, Format, Alg, Version>|null}
     */
    static asCID(input) {
      if (input == null) {
        return null;
      }
      const value = (
        /** @type {any} */
        input
      );
      if (value instanceof _CID) {
        return value;
      } else if (value["/"] != null && value["/"] === value.bytes || value.asCID === value) {
        const { version, code: code9, multihash, bytes } = value;
        return new _CID(
          version,
          code9,
          /** @type {API.MultihashDigest<Alg>} */
          multihash,
          bytes || encodeCID2(version, code9, multihash.bytes)
        );
      } else if (value[cidSymbol2] === true) {
        const { version, multihash, code: code9 } = value;
        const digest3 = (
          /** @type {API.MultihashDigest<Alg>} */
          decode20(multihash)
        );
        return _CID.create(version, code9, digest3);
      } else {
        return null;
      }
    }
    /**
     *
     * @template {unknown} Data
     * @template {number} Format
     * @template {number} Alg
     * @template {API.Version} Version
     * @param {Version} version - Version of the CID
     * @param {Format} code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param {API.MultihashDigest<Alg>} digest - (Multi)hash of the of the content.
     * @returns {CID<Data, Format, Alg, Version>}
     */
    static create(version, code9, digest3) {
      if (typeof code9 !== "number") {
        throw new Error("String codecs are no longer supported");
      }
      if (!(digest3.bytes instanceof Uint8Array)) {
        throw new Error("Invalid digest");
      }
      switch (version) {
        case 0: {
          if (code9 !== DAG_PB_CODE2) {
            throw new Error(
              `Version 0 CID must use dag-pb (code: ${DAG_PB_CODE2}) block encoding`
            );
          } else {
            return new _CID(version, code9, digest3, digest3.bytes);
          }
        }
        case 1: {
          const bytes = encodeCID2(version, code9, digest3.bytes);
          return new _CID(version, code9, digest3, bytes);
        }
        default: {
          throw new Error("Invalid version");
        }
      }
    }
    /**
     * Simplified version of `create` for CIDv0.
     *
     * @template {unknown} [T=unknown]
     * @param {API.MultihashDigest<typeof SHA_256_CODE>} digest - Multihash.
     * @returns {CID<T, typeof DAG_PB_CODE, typeof SHA_256_CODE, 0>}
     */
    static createV0(digest3) {
      return _CID.create(0, DAG_PB_CODE2, digest3);
    }
    /**
     * Simplified version of `create` for CIDv1.
     *
     * @template {unknown} Data
     * @template {number} Code
     * @template {number} Alg
     * @param {Code} code - Content encoding format code.
     * @param {API.MultihashDigest<Alg>} digest - Miltihash of the content.
     * @returns {CID<Data, Code, Alg, 1>}
     */
    static createV1(code9, digest3) {
      return _CID.create(1, code9, digest3);
    }
    /**
     * Decoded a CID from its binary representation. The byte array must contain
     * only the CID with no additional bytes.
     *
     * An error will be thrown if the bytes provided do not contain a valid
     * binary representation of a CID.
     *
     * @template {unknown} Data
     * @template {number} Code
     * @template {number} Alg
     * @template {API.Version} Ver
     * @param {API.ByteView<API.Link<Data, Code, Alg, Ver>>} bytes
     * @returns {CID<Data, Code, Alg, Ver>}
     */
    static decode(bytes) {
      const [cid, remainder] = _CID.decodeFirst(bytes);
      if (remainder.length) {
        throw new Error("Incorrect length");
      }
      return cid;
    }
    /**
     * Decoded a CID from its binary representation at the beginning of a byte
     * array.
     *
     * Returns an array with the first element containing the CID and the second
     * element containing the remainder of the original byte array. The remainder
     * will be a zero-length byte array if the provided bytes only contained a
     * binary CID representation.
     *
     * @template {unknown} T
     * @template {number} C
     * @template {number} A
     * @template {API.Version} V
     * @param {API.ByteView<API.Link<T, C, A, V>>} bytes
     * @returns {[CID<T, C, A, V>, Uint8Array]}
     */
    static decodeFirst(bytes) {
      const specs = _CID.inspectBytes(bytes);
      const prefixSize = specs.size - specs.multihashSize;
      const multihashBytes = coerce2(
        bytes.subarray(prefixSize, prefixSize + specs.multihashSize)
      );
      if (multihashBytes.byteLength !== specs.multihashSize) {
        throw new Error("Incorrect length");
      }
      const digestBytes = multihashBytes.subarray(
        specs.multihashSize - specs.digestSize
      );
      const digest3 = new Digest2(
        specs.multihashCode,
        specs.digestSize,
        digestBytes,
        multihashBytes
      );
      const cid = specs.version === 0 ? _CID.createV0(
        /** @type {API.MultihashDigest<API.SHA_256>} */
        digest3
      ) : _CID.createV1(specs.codec, digest3);
      return [
        /** @type {CID<T, C, A, V>} */
        cid,
        bytes.subarray(specs.size)
      ];
    }
    /**
     * Inspect the initial bytes of a CID to determine its properties.
     *
     * Involves decoding up to 4 varints. Typically this will require only 4 to 6
     * bytes but for larger multicodec code values and larger multihash digest
     * lengths these varints can be quite large. It is recommended that at least
     * 10 bytes be made available in the `initialBytes` argument for a complete
     * inspection.
     *
     * @template {unknown} T
     * @template {number} C
     * @template {number} A
     * @template {API.Version} V
     * @param {API.ByteView<API.Link<T, C, A, V>>} initialBytes
     * @returns {{ version:V, codec:C, multihashCode:A, digestSize:number, multihashSize:number, size:number }}
     */
    static inspectBytes(initialBytes) {
      let offset = 0;
      const next = () => {
        const [i, length4] = decode19(initialBytes.subarray(offset));
        offset += length4;
        return i;
      };
      let version = (
        /** @type {V} */
        next()
      );
      let codec = (
        /** @type {C} */
        DAG_PB_CODE2
      );
      if (
        /** @type {number} */
        version === 18
      ) {
        version = /** @type {V} */
        0;
        offset = 0;
      } else {
        codec = /** @type {C} */
        next();
      }
      if (version !== 0 && version !== 1) {
        throw new RangeError(`Invalid CID version ${version}`);
      }
      const prefixSize = offset;
      const multihashCode = (
        /** @type {A} */
        next()
      );
      const digestSize = next();
      const size = offset + digestSize;
      const multihashSize = size - prefixSize;
      return { version, codec, multihashCode, digestSize, multihashSize, size };
    }
    /**
     * Takes cid in a string representation and creates an instance. If `base`
     * decoder is not provided will use a default from the configuration. It will
     * throw an error if encoding of the CID is not compatible with supplied (or
     * a default decoder).
     *
     * @template {string} Prefix
     * @template {unknown} Data
     * @template {number} Code
     * @template {number} Alg
     * @template {API.Version} Ver
     * @param {API.ToString<API.Link<Data, Code, Alg, Ver>, Prefix>} source
     * @param {API.MultibaseDecoder<Prefix>} [base]
     * @returns {CID<Data, Code, Alg, Ver>}
     */
    static parse(source, base4) {
      const [prefix, bytes] = parseCIDtoBytes2(source, base4);
      const cid = _CID.decode(bytes);
      if (cid.version === 0 && source[0] !== "Q") {
        throw Error("Version 0 CID string must not include multibase prefix");
      }
      baseCache2(cid).set(prefix, source);
      return cid;
    }
  };
  var parseCIDtoBytes2 = (source, base4) => {
    switch (source[0]) {
      // CIDv0 is parsed differently
      case "Q": {
        const decoder2 = base4 || base58btc2;
        return [
          /** @type {Prefix} */
          base58btc2.prefix,
          decoder2.decode(`${base58btc2.prefix}${source}`)
        ];
      }
      case base58btc2.prefix: {
        const decoder2 = base4 || base58btc2;
        return [
          /** @type {Prefix} */
          base58btc2.prefix,
          decoder2.decode(source)
        ];
      }
      case base322.prefix: {
        const decoder2 = base4 || base322;
        return [
          /** @type {Prefix} */
          base322.prefix,
          decoder2.decode(source)
        ];
      }
      default: {
        if (base4 == null) {
          throw Error(
            "To parse non base32 or base58btc encoded CID multibase decoder must be provided"
          );
        }
        return [
          /** @type {Prefix} */
          source[0],
          base4.decode(source)
        ];
      }
    }
  };
  var toStringV02 = (bytes, cache3, base4) => {
    const { prefix } = base4;
    if (prefix !== base58btc2.prefix) {
      throw Error(`Cannot string encode V0 in ${base4.name} encoding`);
    }
    const cid = cache3.get(prefix);
    if (cid == null) {
      const cid2 = base4.encode(bytes).slice(1);
      cache3.set(prefix, cid2);
      return cid2;
    } else {
      return cid;
    }
  };
  var toStringV12 = (bytes, cache3, base4) => {
    const { prefix } = base4;
    const cid = cache3.get(prefix);
    if (cid == null) {
      const cid2 = base4.encode(bytes);
      cache3.set(prefix, cid2);
      return cid2;
    } else {
      return cid;
    }
  };
  var DAG_PB_CODE2 = 112;
  var SHA_256_CODE2 = 18;
  var encodeCID2 = (version, code9, multihash) => {
    const codeOffset = encodingLength2(version);
    const hashOffset = codeOffset + encodingLength2(code9);
    const bytes = new Uint8Array(hashOffset + multihash.byteLength);
    encodeTo2(version, bytes, 0);
    encodeTo2(code9, bytes, codeOffset);
    bytes.set(multihash, hashOffset);
    return bytes;
  };
  var cidSymbol2 = Symbol.for("@ipld/js-cid/CID");

  // node_modules/.pnpm/multiformats@12.1.3/node_modules/multiformats/src/basics.js
  var bases2 = { ...identity_exports3, ...base2_exports2, ...base8_exports2, ...base10_exports2, ...base16_exports2, ...base32_exports2, ...base36_exports2, ...base58_exports2, ...base64_exports2, ...base256emoji_exports2 };
  var hashes2 = { ...sha2_browser_exports2, ...identity_exports4 };

  // node_modules/.pnpm/uint8arrays@4.0.10/node_modules/uint8arrays/dist/src/alloc.js
  function allocUnsafe2(size = 0) {
    if (globalThis.Buffer?.allocUnsafe != null) {
      return asUint8Array2(globalThis.Buffer.allocUnsafe(size));
    }
    return new Uint8Array(size);
  }

  // node_modules/.pnpm/uint8arrays@4.0.10/node_modules/uint8arrays/dist/src/util/bases.js
  function createCodec3(name7, prefix, encode18, decode21) {
    return {
      name: name7,
      prefix,
      encoder: {
        name: name7,
        prefix,
        encode: encode18
      },
      decoder: {
        decode: decode21
      }
    };
  }
  var string2 = createCodec3("utf8", "u", (buf2) => {
    const decoder2 = new TextDecoder("utf8");
    return "u" + decoder2.decode(buf2);
  }, (str) => {
    const encoder2 = new TextEncoder();
    return encoder2.encode(str.substring(1));
  });
  var ascii2 = createCodec3("ascii", "a", (buf2) => {
    let string3 = "a";
    for (let i = 0; i < buf2.length; i++) {
      string3 += String.fromCharCode(buf2[i]);
    }
    return string3;
  }, (str) => {
    str = str.substring(1);
    const buf2 = allocUnsafe2(str.length);
    for (let i = 0; i < str.length; i++) {
      buf2[i] = str.charCodeAt(i);
    }
    return buf2;
  });
  var BASES2 = {
    utf8: string2,
    "utf-8": string2,
    hex: bases2.base16,
    latin1: ascii2,
    ascii: ascii2,
    binary: ascii2,
    ...bases2
  };
  var bases_default2 = BASES2;

  // node_modules/.pnpm/uint8arrays@4.0.10/node_modules/uint8arrays/dist/src/from-string.js
  function fromString5(string3, encoding = "utf8") {
    const base4 = bases_default2[encoding];
    if (base4 == null) {
      throw new Error(`Unsupported encoding "${encoding}"`);
    }
    if ((encoding === "utf8" || encoding === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null) {
      return asUint8Array2(globalThis.Buffer.from(string3, "utf-8"));
    }
    return base4.decoder.decode(`${base4.prefix}${string3}`);
  }

  // node_modules/.pnpm/hamt-sharding@3.0.2/node_modules/hamt-sharding/dist/src/bucket.js
  var Bucket = class _Bucket {
    constructor(options, parent, posAtParent = 0) {
      this._options = options;
      this._popCount = 0;
      this._parent = parent;
      this._posAtParent = posAtParent;
      this._children = new import_sparse_array.default();
      this.key = null;
    }
    async put(key, value) {
      const place = await this._findNewBucketAndPos(key);
      await place.bucket._putAt(place, key, value);
    }
    async get(key) {
      const child = await this._findChild(key);
      if (child != null) {
        return child.value;
      }
    }
    async del(key) {
      const place = await this._findPlace(key);
      const child = place.bucket._at(place.pos);
      if (child != null && child.key === key) {
        place.bucket._delAt(place.pos);
      }
    }
    leafCount() {
      const children = this._children.compactArray();
      return children.reduce((acc, child) => {
        if (child instanceof _Bucket) {
          return acc + child.leafCount();
        }
        return acc + 1;
      }, 0);
    }
    childrenCount() {
      return this._children.length;
    }
    onlyChild() {
      return this._children.get(0);
    }
    *eachLeafSeries() {
      const children = this._children.compactArray();
      for (const child of children) {
        if (child instanceof _Bucket) {
          yield* child.eachLeafSeries();
        } else {
          yield child;
        }
      }
    }
    serialize(map2, reduce) {
      const acc = [];
      return reduce(this._children.reduce((acc2, child, index2) => {
        if (child != null) {
          if (child instanceof _Bucket) {
            acc2.push(child.serialize(map2, reduce));
          } else {
            acc2.push(map2(child, index2));
          }
        }
        return acc2;
      }, acc));
    }
    async asyncTransform(asyncMap, asyncReduce) {
      return await asyncTransformBucket(this, asyncMap, asyncReduce);
    }
    toJSON() {
      return this.serialize(mapNode, reduceNodes);
    }
    prettyPrint() {
      return JSON.stringify(this.toJSON(), null, "  ");
    }
    tableSize() {
      return Math.pow(2, this._options.bits);
    }
    async _findChild(key) {
      const result = await this._findPlace(key);
      const child = result.bucket._at(result.pos);
      if (child instanceof _Bucket) {
        return void 0;
      }
      if (child != null && child.key === key) {
        return child;
      }
    }
    async _findPlace(key) {
      const hashValue = this._options.hash(typeof key === "string" ? fromString5(key) : key);
      const index2 = await hashValue.take(this._options.bits);
      const child = this._children.get(index2);
      if (child instanceof _Bucket) {
        return await child._findPlace(hashValue);
      }
      return {
        bucket: this,
        pos: index2,
        hash: hashValue,
        existingChild: child
      };
    }
    async _findNewBucketAndPos(key) {
      const place = await this._findPlace(key);
      if (place.existingChild != null && place.existingChild.key !== key) {
        const bucket = new _Bucket(this._options, place.bucket, place.pos);
        place.bucket._putObjectAt(place.pos, bucket);
        const newPlace = await bucket._findPlace(place.existingChild.hash);
        newPlace.bucket._putAt(newPlace, place.existingChild.key, place.existingChild.value);
        return await bucket._findNewBucketAndPos(place.hash);
      }
      return place;
    }
    _putAt(place, key, value) {
      this._putObjectAt(place.pos, {
        key,
        value,
        hash: place.hash
      });
    }
    _putObjectAt(pos, object) {
      if (this._children.get(pos) == null) {
        this._popCount++;
      }
      this._children.set(pos, object);
    }
    _delAt(pos) {
      if (pos === -1) {
        throw new Error("Invalid position");
      }
      if (this._children.get(pos) != null) {
        this._popCount--;
      }
      this._children.unset(pos);
      this._level();
    }
    _level() {
      if (this._parent != null && this._popCount <= 1) {
        if (this._popCount === 1) {
          const onlyChild = this._children.find(exists);
          if (onlyChild != null && !(onlyChild instanceof _Bucket)) {
            const hash2 = onlyChild.hash;
            hash2.untake(this._options.bits);
            const place = {
              pos: this._posAtParent,
              hash: hash2,
              bucket: this._parent
            };
            this._parent._putAt(place, onlyChild.key, onlyChild.value);
          }
        } else {
          this._parent._delAt(this._posAtParent);
        }
      }
    }
    _at(index2) {
      return this._children.get(index2);
    }
  };
  function exists(o) {
    return Boolean(o);
  }
  function mapNode(node, _) {
    return node.key;
  }
  function reduceNodes(nodes) {
    return nodes;
  }
  async function asyncTransformBucket(bucket, asyncMap, asyncReduce) {
    const output = [];
    for (const child of bucket._children.compactArray()) {
      if (child instanceof Bucket) {
        await asyncTransformBucket(child, asyncMap, asyncReduce);
      } else {
        const mappedChildren = await asyncMap(child);
        output.push({
          bitField: bucket._children.bitField(),
          children: mappedChildren
        });
      }
    }
    return await asyncReduce(output);
  }

  // node_modules/.pnpm/hamt-sharding@3.0.2/node_modules/hamt-sharding/dist/src/consumable-buffer.js
  var START_MASKS = [
    255,
    254,
    252,
    248,
    240,
    224,
    192,
    128
  ];
  var STOP_MASKS = [
    1,
    3,
    7,
    15,
    31,
    63,
    127,
    255
  ];
  var ConsumableBuffer = class {
    constructor(value) {
      this._value = value;
      this._currentBytePos = value.length - 1;
      this._currentBitPos = 7;
    }
    availableBits() {
      return this._currentBitPos + 1 + this._currentBytePos * 8;
    }
    totalBits() {
      return this._value.length * 8;
    }
    take(bits) {
      let pendingBits = bits;
      let result = 0;
      while (pendingBits > 0 && this._haveBits()) {
        const byte = this._value[this._currentBytePos];
        const availableBits = this._currentBitPos + 1;
        const taking = Math.min(availableBits, pendingBits);
        const value = byteBitsToInt(byte, availableBits - taking, taking);
        result = (result << taking) + value;
        pendingBits -= taking;
        this._currentBitPos -= taking;
        if (this._currentBitPos < 0) {
          this._currentBitPos = 7;
          this._currentBytePos--;
        }
      }
      return result;
    }
    untake(bits) {
      this._currentBitPos += bits;
      while (this._currentBitPos > 7) {
        this._currentBitPos -= 8;
        this._currentBytePos += 1;
      }
    }
    _haveBits() {
      return this._currentBytePos >= 0;
    }
  };
  function byteBitsToInt(byte, start, length4) {
    const mask = maskFor(start, length4);
    return (byte & mask) >>> start;
  }
  function maskFor(start, length4) {
    return START_MASKS[start] & STOP_MASKS[Math.min(length4 + start - 1, 7)];
  }

  // node_modules/.pnpm/uint8arrays@4.0.10/node_modules/uint8arrays/dist/src/concat.js
  function concat2(arrays, length4) {
    if (length4 == null) {
      length4 = arrays.reduce((acc, curr) => acc + curr.length, 0);
    }
    const output = allocUnsafe2(length4);
    let offset = 0;
    for (const arr of arrays) {
      output.set(arr, offset);
      offset += arr.length;
    }
    return asUint8Array2(output);
  }

  // node_modules/.pnpm/hamt-sharding@3.0.2/node_modules/hamt-sharding/dist/src/consumable-hash.js
  function wrapHash(hashFn2) {
    function hashing(value) {
      if (value instanceof InfiniteHash) {
        return value;
      } else {
        return new InfiniteHash(value, hashFn2);
      }
    }
    return hashing;
  }
  var InfiniteHash = class {
    constructor(value, hashFn2) {
      if (!(value instanceof Uint8Array)) {
        throw new Error("can only hash Uint8Arrays");
      }
      this._value = value;
      this._hashFn = hashFn2;
      this._depth = -1;
      this._availableBits = 0;
      this._currentBufferIndex = 0;
      this._buffers = [];
    }
    async take(bits) {
      let pendingBits = bits;
      while (this._availableBits < pendingBits) {
        await this._produceMoreBits();
      }
      let result = 0;
      while (pendingBits > 0) {
        const hash2 = this._buffers[this._currentBufferIndex];
        const available = Math.min(hash2.availableBits(), pendingBits);
        const took = hash2.take(available);
        result = (result << available) + took;
        pendingBits -= available;
        this._availableBits -= available;
        if (hash2.availableBits() === 0) {
          this._currentBufferIndex++;
        }
      }
      return result;
    }
    untake(bits) {
      let pendingBits = bits;
      while (pendingBits > 0) {
        const hash2 = this._buffers[this._currentBufferIndex];
        const availableForUntake = Math.min(hash2.totalBits() - hash2.availableBits(), pendingBits);
        hash2.untake(availableForUntake);
        pendingBits -= availableForUntake;
        this._availableBits += availableForUntake;
        if (this._currentBufferIndex > 0 && hash2.totalBits() === hash2.availableBits()) {
          this._depth--;
          this._currentBufferIndex--;
        }
      }
    }
    async _produceMoreBits() {
      this._depth++;
      const value = this._depth > 0 ? concat2([this._value, Uint8Array.from([this._depth])]) : this._value;
      const hashValue = await this._hashFn(value);
      const buffer2 = new ConsumableBuffer(hashValue);
      this._buffers.push(buffer2);
      this._availableBits += buffer2.availableBits();
    }
  };

  // node_modules/.pnpm/hamt-sharding@3.0.2/node_modules/hamt-sharding/dist/src/index.js
  function createHAMT(options) {
    if (options == null || options.hashFn == null) {
      throw new Error("please define an options.hashFn");
    }
    const bucketOptions = {
      bits: options.bits ?? 8,
      hash: wrapHash(options.hashFn)
    };
    return new Bucket(bucketOptions);
  }

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/utils/find-cid-in-shard.js
  var hashFn = async function(buf2) {
    return (await murmur3128.encode(buf2)).slice(0, 8).reverse();
  };
  var addLinksToHamtBucket = async (links3, bucket, rootBucket) => {
    const padLength = (bucket.tableSize() - 1).toString(16).length;
    await Promise.all(links3.map(async (link2) => {
      if (link2.Name == null) {
        throw new Error("Unexpected Link without a Name");
      }
      if (link2.Name.length === padLength) {
        const pos = parseInt(link2.Name, 16);
        bucket._putObjectAt(pos, new Bucket({
          hash: rootBucket._options.hash,
          bits: rootBucket._options.bits
        }, bucket, pos));
        return;
      }
      await rootBucket.put(link2.Name.substring(2), true);
    }));
  };
  var toPrefix = (position, padLength) => {
    return position.toString(16).toUpperCase().padStart(padLength, "0").substring(0, padLength);
  };
  var toBucketPath = (position) => {
    let bucket = position.bucket;
    const path = [];
    while (bucket._parent != null) {
      path.push(bucket);
      bucket = bucket._parent;
    }
    path.push(bucket);
    return path.reverse();
  };
  var findShardCid = async (node, name7, blockstore, context2, options) => {
    if (context2 == null) {
      if (node.Data == null) {
        throw (0, import_err_code6.default)(new Error("no data in PBNode"), "ERR_NOT_UNIXFS");
      }
      let dir;
      try {
        dir = UnixFS.unmarshal(node.Data);
      } catch (err) {
        throw (0, import_err_code6.default)(err, "ERR_NOT_UNIXFS");
      }
      if (dir.type !== "hamt-sharded-directory") {
        throw (0, import_err_code6.default)(new Error("not a HAMT"), "ERR_NOT_UNIXFS");
      }
      if (dir.fanout == null) {
        throw (0, import_err_code6.default)(new Error("missing fanout"), "ERR_NOT_UNIXFS");
      }
      const rootBucket = createHAMT({
        hashFn,
        bits: Math.log2(Number(dir.fanout))
      });
      context2 = {
        rootBucket,
        hamtDepth: 1,
        lastBucket: rootBucket
      };
    }
    const padLength = (context2.lastBucket.tableSize() - 1).toString(16).length;
    await addLinksToHamtBucket(node.Links, context2.lastBucket, context2.rootBucket);
    const position = await context2.rootBucket._findNewBucketAndPos(name7);
    let prefix = toPrefix(position.pos, padLength);
    const bucketPath = toBucketPath(position);
    if (bucketPath.length > context2.hamtDepth) {
      context2.lastBucket = bucketPath[context2.hamtDepth];
      prefix = toPrefix(context2.lastBucket._posAtParent, padLength);
    }
    const link2 = node.Links.find((link3) => {
      if (link3.Name == null) {
        return false;
      }
      const entryPrefix = link3.Name.substring(0, padLength);
      const entryName = link3.Name.substring(padLength);
      if (entryPrefix !== prefix) {
        return false;
      }
      if (entryName !== "" && entryName !== name7) {
        return false;
      }
      return true;
    });
    if (link2 == null) {
      return;
    }
    if (link2.Name != null && link2.Name.substring(padLength) === name7) {
      return link2.Hash;
    }
    context2.hamtDepth++;
    const block = await blockstore.get(link2.Hash, options);
    node = decode9(block);
    return findShardCid(node, name7, blockstore, context2, options);
  };
  var find_cid_in_shard_default = findShardCid;

  // node_modules/.pnpm/it-peekable@3.0.3/node_modules/it-peekable/dist/src/index.js
  function peekable(iterable) {
    const [iterator, symbol] = iterable[Symbol.asyncIterator] != null ? [iterable[Symbol.asyncIterator](), Symbol.asyncIterator] : [iterable[Symbol.iterator](), Symbol.iterator];
    const queue = [];
    return {
      peek: () => {
        return iterator.next();
      },
      push: (value) => {
        queue.push(value);
      },
      next: () => {
        if (queue.length > 0) {
          return {
            done: false,
            value: queue.shift()
          };
        }
        return iterator.next();
      },
      [symbol]() {
        return this;
      }
    };
  }
  var src_default2 = peekable;

  // node_modules/.pnpm/it-filter@3.0.4/node_modules/it-filter/dist/src/index.js
  function isAsyncIterable2(thing) {
    return thing[Symbol.asyncIterator] != null;
  }
  function filter(source, fn) {
    if (isAsyncIterable2(source)) {
      return async function* () {
        for await (const entry of source) {
          if (await fn(entry)) {
            yield entry;
          }
        }
      }();
    }
    const peekable2 = src_default2(source);
    const { value, done } = peekable2.next();
    if (done === true) {
      return function* () {
      }();
    }
    const res = fn(value);
    if (typeof res.then === "function") {
      return async function* () {
        if (await res) {
          yield value;
        }
        for await (const entry of peekable2) {
          if (await fn(entry)) {
            yield entry;
          }
        }
      }();
    }
    const func = fn;
    return function* () {
      if (res === true) {
        yield value;
      }
      for (const entry of peekable2) {
        if (func(entry)) {
          yield entry;
        }
      }
    }();
  }
  var src_default3 = filter;

  // node_modules/.pnpm/it-map@3.0.5/node_modules/it-map/dist/src/index.js
  function isAsyncIterable3(thing) {
    return thing[Symbol.asyncIterator] != null;
  }
  function map(source, func) {
    if (isAsyncIterable3(source)) {
      return async function* () {
        for await (const val of source) {
          yield func(val);
        }
      }();
    }
    const peekable2 = src_default2(source);
    const { value, done } = peekable2.next();
    if (done === true) {
      return function* () {
      }();
    }
    const res = func(value);
    if (typeof res.then === "function") {
      return async function* () {
        yield await res;
        for await (const val of peekable2) {
          yield func(val);
        }
      }();
    }
    const fn = func;
    return function* () {
      yield res;
      for (const val of peekable2) {
        yield fn(val);
      }
    }();
  }
  var src_default4 = map;

  // node_modules/.pnpm/p-defer@4.0.0/node_modules/p-defer/index.js
  function pDefer() {
    const deferred = {};
    deferred.promise = new Promise((resolve7, reject) => {
      deferred.resolve = resolve7;
      deferred.reject = reject;
    });
    return deferred;
  }

  // node_modules/.pnpm/it-parallel@3.0.6/node_modules/it-parallel/dist/src/index.js
  var CustomEvent = globalThis.CustomEvent ?? Event;
  async function* parallel(source, options = {}) {
    let concurrency = options.concurrency ?? Infinity;
    if (concurrency < 1) {
      concurrency = Infinity;
    }
    const ordered = options.ordered == null ? false : options.ordered;
    const emitter = new EventTarget();
    const ops = [];
    let slotAvailable = pDefer();
    let resultAvailable = pDefer();
    let sourceFinished = false;
    let sourceErr;
    let opErred = false;
    emitter.addEventListener("task-complete", () => {
      resultAvailable.resolve();
    });
    void Promise.resolve().then(async () => {
      try {
        for await (const task of source) {
          if (ops.length === concurrency) {
            slotAvailable = pDefer();
            await slotAvailable.promise;
          }
          if (opErred) {
            break;
          }
          const op = {
            done: false
          };
          ops.push(op);
          task().then((result) => {
            op.done = true;
            op.ok = true;
            op.value = result;
            emitter.dispatchEvent(new CustomEvent("task-complete"));
          }, (err) => {
            op.done = true;
            op.err = err;
            emitter.dispatchEvent(new CustomEvent("task-complete"));
          });
        }
        sourceFinished = true;
        emitter.dispatchEvent(new CustomEvent("task-complete"));
      } catch (err) {
        sourceErr = err;
        emitter.dispatchEvent(new CustomEvent("task-complete"));
      }
    });
    function valuesAvailable() {
      if (ordered) {
        return ops[0]?.done;
      }
      return Boolean(ops.find((op) => op.done));
    }
    function* yieldOrderedValues() {
      while (ops.length > 0 && ops[0].done) {
        const op = ops[0];
        ops.shift();
        if (op.ok) {
          yield op.value;
        } else {
          opErred = true;
          slotAvailable.resolve();
          throw op.err;
        }
        slotAvailable.resolve();
      }
    }
    function* yieldUnOrderedValues() {
      while (valuesAvailable()) {
        for (let i = 0; i < ops.length; i++) {
          if (ops[i].done) {
            const op = ops[i];
            ops.splice(i, 1);
            i--;
            if (op.ok) {
              yield op.value;
            } else {
              opErred = true;
              slotAvailable.resolve();
              throw op.err;
            }
            slotAvailable.resolve();
          }
        }
      }
    }
    while (true) {
      if (!valuesAvailable()) {
        resultAvailable = pDefer();
        await resultAvailable.promise;
      }
      if (sourceErr != null) {
        throw sourceErr;
      }
      if (ordered) {
        yield* yieldOrderedValues();
      } else {
        yield* yieldUnOrderedValues();
      }
      if (sourceFinished && ops.length === 0) {
        break;
      }
    }
  }

  // node_modules/.pnpm/it-pushable@3.2.3/node_modules/it-pushable/dist/src/fifo.js
  var FixedFIFO = class {
    buffer;
    mask;
    top;
    btm;
    next;
    constructor(hwm) {
      if (!(hwm > 0) || (hwm - 1 & hwm) !== 0) {
        throw new Error("Max size for a FixedFIFO should be a power of two");
      }
      this.buffer = new Array(hwm);
      this.mask = hwm - 1;
      this.top = 0;
      this.btm = 0;
      this.next = null;
    }
    push(data) {
      if (this.buffer[this.top] !== void 0) {
        return false;
      }
      this.buffer[this.top] = data;
      this.top = this.top + 1 & this.mask;
      return true;
    }
    shift() {
      const last2 = this.buffer[this.btm];
      if (last2 === void 0) {
        return void 0;
      }
      this.buffer[this.btm] = void 0;
      this.btm = this.btm + 1 & this.mask;
      return last2;
    }
    isEmpty() {
      return this.buffer[this.btm] === void 0;
    }
  };
  var FIFO = class {
    size;
    hwm;
    head;
    tail;
    constructor(options = {}) {
      this.hwm = options.splitLimit ?? 16;
      this.head = new FixedFIFO(this.hwm);
      this.tail = this.head;
      this.size = 0;
    }
    calculateSize(obj) {
      if (obj?.byteLength != null) {
        return obj.byteLength;
      }
      return 1;
    }
    push(val) {
      if (val?.value != null) {
        this.size += this.calculateSize(val.value);
      }
      if (!this.head.push(val)) {
        const prev = this.head;
        this.head = prev.next = new FixedFIFO(2 * this.head.buffer.length);
        this.head.push(val);
      }
    }
    shift() {
      let val = this.tail.shift();
      if (val === void 0 && this.tail.next != null) {
        const next = this.tail.next;
        this.tail.next = null;
        this.tail = next;
        val = this.tail.shift();
      }
      if (val?.value != null) {
        this.size -= this.calculateSize(val.value);
      }
      return val;
    }
    isEmpty() {
      return this.head.isEmpty();
    }
  };

  // node_modules/.pnpm/it-pushable@3.2.3/node_modules/it-pushable/dist/src/index.js
  var AbortError = class extends Error {
    type;
    code;
    constructor(message2, code9) {
      super(message2 ?? "The operation was aborted");
      this.type = "aborted";
      this.code = code9 ?? "ABORT_ERR";
    }
  };
  function pushable(options = {}) {
    const getNext = (buffer2) => {
      const next = buffer2.shift();
      if (next == null) {
        return { done: true };
      }
      if (next.error != null) {
        throw next.error;
      }
      return {
        done: next.done === true,
        // @ts-expect-error if done is false, value will be present
        value: next.value
      };
    };
    return _pushable(getNext, options);
  }
  function _pushable(getNext, options) {
    options = options ?? {};
    let onEnd = options.onEnd;
    let buffer2 = new FIFO();
    let pushable2;
    let onNext;
    let ended;
    let drain = pDefer();
    const waitNext = async () => {
      try {
        if (!buffer2.isEmpty()) {
          return getNext(buffer2);
        }
        if (ended) {
          return { done: true };
        }
        return await new Promise((resolve7, reject) => {
          onNext = (next) => {
            onNext = null;
            buffer2.push(next);
            try {
              resolve7(getNext(buffer2));
            } catch (err) {
              reject(err);
            }
            return pushable2;
          };
        });
      } finally {
        if (buffer2.isEmpty()) {
          queueMicrotask(() => {
            drain.resolve();
            drain = pDefer();
          });
        }
      }
    };
    const bufferNext = (next) => {
      if (onNext != null) {
        return onNext(next);
      }
      buffer2.push(next);
      return pushable2;
    };
    const bufferError = (err) => {
      buffer2 = new FIFO();
      if (onNext != null) {
        return onNext({ error: err });
      }
      buffer2.push({ error: err });
      return pushable2;
    };
    const push2 = (value) => {
      if (ended) {
        return pushable2;
      }
      if (options?.objectMode !== true && value?.byteLength == null) {
        throw new Error("objectMode was not true but tried to push non-Uint8Array value");
      }
      return bufferNext({ done: false, value });
    };
    const end = (err) => {
      if (ended)
        return pushable2;
      ended = true;
      return err != null ? bufferError(err) : bufferNext({ done: true });
    };
    const _return = () => {
      buffer2 = new FIFO();
      end();
      return { done: true };
    };
    const _throw = (err) => {
      end(err);
      return { done: true };
    };
    pushable2 = {
      [Symbol.asyncIterator]() {
        return this;
      },
      next: waitNext,
      return: _return,
      throw: _throw,
      push: push2,
      end,
      get readableLength() {
        return buffer2.size;
      },
      onEmpty: async (options2) => {
        const signal = options2?.signal;
        signal?.throwIfAborted();
        if (buffer2.isEmpty()) {
          return;
        }
        let cancel;
        let listener;
        if (signal != null) {
          cancel = new Promise((resolve7, reject) => {
            listener = () => {
              reject(new AbortError());
            };
            signal.addEventListener("abort", listener);
          });
        }
        try {
          await Promise.race([
            drain.promise,
            cancel
          ]);
        } finally {
          if (listener != null && signal != null) {
            signal?.removeEventListener("abort", listener);
          }
        }
      }
    };
    if (onEnd == null) {
      return pushable2;
    }
    const _pushable2 = pushable2;
    pushable2 = {
      [Symbol.asyncIterator]() {
        return this;
      },
      next() {
        return _pushable2.next();
      },
      throw(err) {
        _pushable2.throw(err);
        if (onEnd != null) {
          onEnd(err);
          onEnd = void 0;
        }
        return { done: true };
      },
      return() {
        _pushable2.return();
        if (onEnd != null) {
          onEnd();
          onEnd = void 0;
        }
        return { done: true };
      },
      push: push2,
      end(err) {
        _pushable2.end(err);
        if (onEnd != null) {
          onEnd(err);
          onEnd = void 0;
        }
        return pushable2;
      },
      get readableLength() {
        return _pushable2.readableLength;
      },
      onEmpty: (opts) => {
        return _pushable2.onEmpty(opts);
      }
    };
    return pushable2;
  }

  // node_modules/.pnpm/it-merge@3.0.3/node_modules/it-merge/dist/src/index.js
  function isAsyncIterable4(thing) {
    return thing[Symbol.asyncIterator] != null;
  }
  function merge(...sources) {
    const syncSources = [];
    for (const source of sources) {
      if (!isAsyncIterable4(source)) {
        syncSources.push(source);
      }
    }
    if (syncSources.length === sources.length) {
      return function* () {
        for (const source of syncSources) {
          yield* source;
        }
      }();
    }
    return async function* () {
      const output = pushable({
        objectMode: true
      });
      void Promise.resolve().then(async () => {
        try {
          await Promise.all(sources.map(async (source) => {
            for await (const item of source) {
              output.push(item);
            }
          }));
          output.end();
        } catch (err) {
          output.end(err);
        }
      });
      yield* output;
    }();
  }
  var src_default5 = merge;

  // node_modules/.pnpm/it-pipe@3.0.1/node_modules/it-pipe/dist/src/index.js
  function pipe(first, ...rest) {
    if (first == null) {
      throw new Error("Empty pipeline");
    }
    if (isDuplex(first)) {
      const duplex = first;
      first = () => duplex.source;
    } else if (isIterable(first) || isAsyncIterable5(first)) {
      const source = first;
      first = () => source;
    }
    const fns = [first, ...rest];
    if (fns.length > 1) {
      if (isDuplex(fns[fns.length - 1])) {
        fns[fns.length - 1] = fns[fns.length - 1].sink;
      }
    }
    if (fns.length > 2) {
      for (let i = 1; i < fns.length - 1; i++) {
        if (isDuplex(fns[i])) {
          fns[i] = duplexPipelineFn(fns[i]);
        }
      }
    }
    return rawPipe(...fns);
  }
  var rawPipe = (...fns) => {
    let res;
    while (fns.length > 0) {
      res = fns.shift()(res);
    }
    return res;
  };
  var isAsyncIterable5 = (obj) => {
    return obj?.[Symbol.asyncIterator] != null;
  };
  var isIterable = (obj) => {
    return obj?.[Symbol.iterator] != null;
  };
  var isDuplex = (obj) => {
    if (obj == null) {
      return false;
    }
    return obj.sink != null && obj.source != null;
  };
  var duplexPipelineFn = (duplex) => {
    return (source) => {
      const p = duplex.sink(source);
      if (p?.then != null) {
        const stream = pushable({
          objectMode: true
        });
        p.then(() => {
          stream.end();
        }, (err) => {
          stream.end(err);
        });
        let sourceWrap;
        const source2 = duplex.source;
        if (isAsyncIterable5(source2)) {
          sourceWrap = async function* () {
            yield* source2;
            stream.end();
          };
        } else if (isIterable(source2)) {
          sourceWrap = function* () {
            yield* source2;
            stream.end();
          };
        } else {
          throw new Error("Unknown duplex source type - must be Iterable or AsyncIterable");
        }
        return src_default5(stream, sourceWrap());
      }
      return duplex.source;
    };
  };

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/unixfs-v1/content/directory.js
  var directoryContent = (cid, node, unixfs, path, resolve7, depth, blockstore) => {
    async function* yieldDirectoryContent(options = {}) {
      const offset = options.offset ?? 0;
      const length4 = options.length ?? node.Links.length;
      const links3 = node.Links.slice(offset, length4);
      options.onProgress?.(new CustomProgressEvent("unixfs:exporter:walk:directory", {
        cid
      }));
      yield* pipe(links3, (source) => src_default4(source, (link2) => {
        return async () => {
          const linkName = link2.Name ?? "";
          const linkPath = `${path}/${linkName}`;
          const result = await resolve7(link2.Hash, linkName, linkPath, [], depth + 1, blockstore, options);
          return result.entry;
        };
      }), (source) => parallel(source, {
        ordered: true,
        concurrency: options.blockReadConcurrency
      }), (source) => src_default3(source, (entry) => entry != null));
    }
    return yieldDirectoryContent;
  };
  var directory_default = directoryContent;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/unixfs-v1/content/file.js
  var import_err_code7 = __toESM(require_err_code(), 1);

  // node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.mjs
  var import_index4 = __toESM(require_eventemitter3(), 1);

  // node_modules/.pnpm/p-timeout@6.1.2/node_modules/p-timeout/index.js
  var TimeoutError = class extends Error {
    constructor(message2) {
      super(message2);
      this.name = "TimeoutError";
    }
  };
  var AbortError2 = class extends Error {
    constructor(message2) {
      super();
      this.name = "AbortError";
      this.message = message2;
    }
  };
  var getDOMException = (errorMessage) => globalThis.DOMException === void 0 ? new AbortError2(errorMessage) : new DOMException(errorMessage);
  var getAbortedReason = (signal) => {
    const reason = signal.reason === void 0 ? getDOMException("This operation was aborted.") : signal.reason;
    return reason instanceof Error ? reason : getDOMException(reason);
  };
  function pTimeout(promise, options) {
    const {
      milliseconds,
      fallback,
      message: message2,
      customTimers = { setTimeout, clearTimeout }
    } = options;
    let timer;
    const wrappedPromise = new Promise((resolve7, reject) => {
      if (typeof milliseconds !== "number" || Math.sign(milliseconds) !== 1) {
        throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
      }
      if (options.signal) {
        const { signal } = options;
        if (signal.aborted) {
          reject(getAbortedReason(signal));
        }
        signal.addEventListener("abort", () => {
          reject(getAbortedReason(signal));
        });
      }
      if (milliseconds === Number.POSITIVE_INFINITY) {
        promise.then(resolve7, reject);
        return;
      }
      const timeoutError = new TimeoutError();
      timer = customTimers.setTimeout.call(void 0, () => {
        if (fallback) {
          try {
            resolve7(fallback());
          } catch (error) {
            reject(error);
          }
          return;
        }
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        if (message2 === false) {
          resolve7();
        } else if (message2 instanceof Error) {
          reject(message2);
        } else {
          timeoutError.message = message2 ?? `Promise timed out after ${milliseconds} milliseconds`;
          reject(timeoutError);
        }
      }, milliseconds);
      (async () => {
        try {
          resolve7(await promise);
        } catch (error) {
          reject(error);
        }
      })();
    });
    const cancelablePromise = wrappedPromise.finally(() => {
      cancelablePromise.clear();
    });
    cancelablePromise.clear = () => {
      customTimers.clearTimeout.call(void 0, timer);
      timer = void 0;
    };
    return cancelablePromise;
  }

  // node_modules/.pnpm/p-queue@8.0.1/node_modules/p-queue/dist/lower-bound.js
  function lowerBound(array, value, comparator) {
    let first = 0;
    let count = array.length;
    while (count > 0) {
      const step2 = Math.trunc(count / 2);
      let it = first + step2;
      if (comparator(array[it], value) <= 0) {
        first = ++it;
        count -= step2 + 1;
      } else {
        count = step2;
      }
    }
    return first;
  }

  // node_modules/.pnpm/p-queue@8.0.1/node_modules/p-queue/dist/priority-queue.js
  var PriorityQueue = class {
    #queue = [];
    enqueue(run, options) {
      options = {
        priority: 0,
        ...options
      };
      const element = {
        priority: options.priority,
        run
      };
      if (this.size && this.#queue[this.size - 1].priority >= options.priority) {
        this.#queue.push(element);
        return;
      }
      const index2 = lowerBound(this.#queue, element, (a, b) => b.priority - a.priority);
      this.#queue.splice(index2, 0, element);
    }
    dequeue() {
      const item = this.#queue.shift();
      return item?.run;
    }
    filter(options) {
      return this.#queue.filter((element) => element.priority === options.priority).map((element) => element.run);
    }
    get size() {
      return this.#queue.length;
    }
  };

  // node_modules/.pnpm/p-queue@8.0.1/node_modules/p-queue/dist/index.js
  var PQueue = class extends import_index4.default {
    #carryoverConcurrencyCount;
    #isIntervalIgnored;
    #intervalCount = 0;
    #intervalCap;
    #interval;
    #intervalEnd = 0;
    #intervalId;
    #timeoutId;
    #queue;
    #queueClass;
    #pending = 0;
    // The `!` is needed because of https://github.com/microsoft/TypeScript/issues/32194
    #concurrency;
    #isPaused;
    #throwOnTimeout;
    /**
        Per-operation timeout in milliseconds. Operations fulfill once `timeout` elapses if they haven't already.
    
        Applies to each future operation.
        */
    timeout;
    // TODO: The `throwOnTimeout` option should affect the return types of `add()` and `addAll()`
    constructor(options) {
      super();
      options = {
        carryoverConcurrencyCount: false,
        intervalCap: Number.POSITIVE_INFINITY,
        interval: 0,
        concurrency: Number.POSITIVE_INFINITY,
        autoStart: true,
        queueClass: PriorityQueue,
        ...options
      };
      if (!(typeof options.intervalCap === "number" && options.intervalCap >= 1)) {
        throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${options.intervalCap?.toString() ?? ""}\` (${typeof options.intervalCap})`);
      }
      if (options.interval === void 0 || !(Number.isFinite(options.interval) && options.interval >= 0)) {
        throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${options.interval?.toString() ?? ""}\` (${typeof options.interval})`);
      }
      this.#carryoverConcurrencyCount = options.carryoverConcurrencyCount;
      this.#isIntervalIgnored = options.intervalCap === Number.POSITIVE_INFINITY || options.interval === 0;
      this.#intervalCap = options.intervalCap;
      this.#interval = options.interval;
      this.#queue = new options.queueClass();
      this.#queueClass = options.queueClass;
      this.concurrency = options.concurrency;
      this.timeout = options.timeout;
      this.#throwOnTimeout = options.throwOnTimeout === true;
      this.#isPaused = options.autoStart === false;
    }
    get #doesIntervalAllowAnother() {
      return this.#isIntervalIgnored || this.#intervalCount < this.#intervalCap;
    }
    get #doesConcurrentAllowAnother() {
      return this.#pending < this.#concurrency;
    }
    #next() {
      this.#pending--;
      this.#tryToStartAnother();
      this.emit("next");
    }
    #onResumeInterval() {
      this.#onInterval();
      this.#initializeIntervalIfNeeded();
      this.#timeoutId = void 0;
    }
    get #isIntervalPaused() {
      const now = Date.now();
      if (this.#intervalId === void 0) {
        const delay = this.#intervalEnd - now;
        if (delay < 0) {
          this.#intervalCount = this.#carryoverConcurrencyCount ? this.#pending : 0;
        } else {
          if (this.#timeoutId === void 0) {
            this.#timeoutId = setTimeout(() => {
              this.#onResumeInterval();
            }, delay);
          }
          return true;
        }
      }
      return false;
    }
    #tryToStartAnother() {
      if (this.#queue.size === 0) {
        if (this.#intervalId) {
          clearInterval(this.#intervalId);
        }
        this.#intervalId = void 0;
        this.emit("empty");
        if (this.#pending === 0) {
          this.emit("idle");
        }
        return false;
      }
      if (!this.#isPaused) {
        const canInitializeInterval = !this.#isIntervalPaused;
        if (this.#doesIntervalAllowAnother && this.#doesConcurrentAllowAnother) {
          const job = this.#queue.dequeue();
          if (!job) {
            return false;
          }
          this.emit("active");
          job();
          if (canInitializeInterval) {
            this.#initializeIntervalIfNeeded();
          }
          return true;
        }
      }
      return false;
    }
    #initializeIntervalIfNeeded() {
      if (this.#isIntervalIgnored || this.#intervalId !== void 0) {
        return;
      }
      this.#intervalId = setInterval(() => {
        this.#onInterval();
      }, this.#interval);
      this.#intervalEnd = Date.now() + this.#interval;
    }
    #onInterval() {
      if (this.#intervalCount === 0 && this.#pending === 0 && this.#intervalId) {
        clearInterval(this.#intervalId);
        this.#intervalId = void 0;
      }
      this.#intervalCount = this.#carryoverConcurrencyCount ? this.#pending : 0;
      this.#processQueue();
    }
    /**
    Executes all queued functions until it reaches the limit.
    */
    #processQueue() {
      while (this.#tryToStartAnother()) {
      }
    }
    get concurrency() {
      return this.#concurrency;
    }
    set concurrency(newConcurrency) {
      if (!(typeof newConcurrency === "number" && newConcurrency >= 1)) {
        throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
      }
      this.#concurrency = newConcurrency;
      this.#processQueue();
    }
    async #throwOnAbort(signal) {
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          reject(signal.reason);
        }, { once: true });
      });
    }
    async add(function_, options = {}) {
      options = {
        timeout: this.timeout,
        throwOnTimeout: this.#throwOnTimeout,
        ...options
      };
      return new Promise((resolve7, reject) => {
        this.#queue.enqueue(async () => {
          this.#pending++;
          this.#intervalCount++;
          try {
            options.signal?.throwIfAborted();
            let operation = function_({ signal: options.signal });
            if (options.timeout) {
              operation = pTimeout(Promise.resolve(operation), { milliseconds: options.timeout });
            }
            if (options.signal) {
              operation = Promise.race([operation, this.#throwOnAbort(options.signal)]);
            }
            const result = await operation;
            resolve7(result);
            this.emit("completed", result);
          } catch (error) {
            if (error instanceof TimeoutError && !options.throwOnTimeout) {
              resolve7();
              return;
            }
            reject(error);
            this.emit("error", error);
          } finally {
            this.#next();
          }
        }, options);
        this.emit("add");
        this.#tryToStartAnother();
      });
    }
    async addAll(functions, options) {
      return Promise.all(functions.map(async (function_) => this.add(function_, options)));
    }
    /**
    Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
    */
    start() {
      if (!this.#isPaused) {
        return this;
      }
      this.#isPaused = false;
      this.#processQueue();
      return this;
    }
    /**
    Put queue execution on hold.
    */
    pause() {
      this.#isPaused = true;
    }
    /**
    Clear the queue.
    */
    clear() {
      this.#queue = new this.#queueClass();
    }
    /**
        Can be called multiple times. Useful if you for example add additional items at a later time.
    
        @returns A promise that settles when the queue becomes empty.
        */
    async onEmpty() {
      if (this.#queue.size === 0) {
        return;
      }
      await this.#onEvent("empty");
    }
    /**
        @returns A promise that settles when the queue size is less than the given limit: `queue.size < limit`.
    
        If you want to avoid having the queue grow beyond a certain size you can `await queue.onSizeLessThan()` before adding a new item.
    
        Note that this only limits the number of items waiting to start. There could still be up to `concurrency` jobs already running that this call does not include in its calculation.
        */
    async onSizeLessThan(limit) {
      if (this.#queue.size < limit) {
        return;
      }
      await this.#onEvent("next", () => this.#queue.size < limit);
    }
    /**
        The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.
    
        @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
        */
    async onIdle() {
      if (this.#pending === 0 && this.#queue.size === 0) {
        return;
      }
      await this.#onEvent("idle");
    }
    async #onEvent(event, filter2) {
      return new Promise((resolve7) => {
        const listener = () => {
          if (filter2 && !filter2()) {
            return;
          }
          this.off(event, listener);
          resolve7();
        };
        this.on(event, listener);
      });
    }
    /**
    Size of the queue, the number of queued items waiting to run.
    */
    get size() {
      return this.#queue.size;
    }
    /**
        Size of the queue, filtered by the given options.
    
        For example, this can be used to find the number of items remaining in the queue with a specific priority level.
        */
    sizeBy(options) {
      return this.#queue.filter(options).length;
    }
    /**
    Number of running items (no longer in the queue).
    */
    get pending() {
      return this.#pending;
    }
    /**
    Whether the queue is currently paused.
    */
    get isPaused() {
      return this.#isPaused;
    }
  };

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/unixfs-v1/content/file.js
  async function walkDAG(blockstore, node, queue, streamPosition, start, end, options) {
    if (node instanceof Uint8Array) {
      const buf2 = extract_data_from_block_default(node, streamPosition, start, end);
      queue.push(buf2);
      return;
    }
    if (node.Data == null) {
      throw (0, import_err_code7.default)(new Error("no data in PBNode"), "ERR_NOT_UNIXFS");
    }
    let file;
    try {
      file = UnixFS.unmarshal(node.Data);
    } catch (err) {
      throw (0, import_err_code7.default)(err, "ERR_NOT_UNIXFS");
    }
    if (file.data != null) {
      const data = file.data;
      const buf2 = extract_data_from_block_default(data, streamPosition, start, end);
      queue.push(buf2);
      streamPosition += BigInt(buf2.byteLength);
    }
    const childOps = [];
    if (node.Links.length !== file.blockSizes.length) {
      throw (0, import_err_code7.default)(new Error("Inconsistent block sizes and dag links"), "ERR_NOT_UNIXFS");
    }
    for (let i = 0; i < node.Links.length; i++) {
      const childLink = node.Links[i];
      const childStart = streamPosition;
      const childEnd = childStart + file.blockSizes[i];
      if (start >= childStart && start < childEnd || // child has offset byte
      end >= childStart && end <= childEnd || // child has end byte
      start < childStart && end > childEnd) {
        childOps.push({
          link: childLink,
          blockStart: streamPosition
        });
      }
      streamPosition = childEnd;
      if (streamPosition > end) {
        break;
      }
    }
    await pipe(childOps, (source) => src_default4(source, (op) => {
      return async () => {
        const block = await blockstore.get(op.link.Hash, options);
        return {
          ...op,
          block
        };
      };
    }), (source) => parallel(source, {
      ordered: true,
      concurrency: options.blockReadConcurrency
    }), async (source) => {
      for await (const { link: link2, block, blockStart } of source) {
        let child;
        switch (link2.Hash.code) {
          case code2:
            child = decode9(block);
            break;
          case code4:
            child = block;
            break;
          default:
            queue.end((0, import_err_code7.default)(new Error(`Unsupported codec: ${link2.Hash.code}`), "ERR_NOT_UNIXFS"));
            return;
        }
        const childQueue = new PQueue({
          concurrency: 1
        });
        childQueue.on("error", (error) => {
          queue.end(error);
        });
        void childQueue.add(async () => {
          options.onProgress?.(new CustomProgressEvent("unixfs:exporter:walk:file", {
            cid: link2.Hash
          }));
          await walkDAG(blockstore, child, queue, blockStart, start, end, options);
        });
        await childQueue.onIdle();
      }
    });
    if (streamPosition >= end) {
      queue.end();
    }
  }
  var fileContent = (cid, node, unixfs, path, resolve7, depth, blockstore) => {
    async function* yieldFileContent(options = {}) {
      const fileSize = unixfs.fileSize();
      if (fileSize === void 0) {
        throw new Error("File was a directory");
      }
      const { start, end } = validate_offset_and_length_default(fileSize, options.offset, options.length);
      if (end === 0n) {
        return;
      }
      let read5 = 0n;
      const wanted = end - start;
      const queue = pushable();
      options.onProgress?.(new CustomProgressEvent("unixfs:exporter:walk:file", {
        cid
      }));
      void walkDAG(blockstore, node, queue, 0n, start, end, options).catch((err) => {
        queue.end(err);
      });
      for await (const buf2 of queue) {
        if (buf2 == null) {
          continue;
        }
        read5 += BigInt(buf2.byteLength);
        if (read5 > wanted) {
          queue.end();
          throw (0, import_err_code7.default)(new Error("Read too many bytes - the file size reported by the UnixFS data in the root node may be incorrect"), "ERR_OVER_READ");
        }
        if (read5 === wanted) {
          queue.end();
        }
        options.onProgress?.(new CustomProgressEvent("unixfs:exporter:progress:unixfs:file", {
          bytesRead: read5,
          totalBytes: wanted,
          fileSize
        }));
        yield buf2;
      }
      if (read5 < wanted) {
        throw (0, import_err_code7.default)(new Error("Traversed entire DAG but did not read enough bytes"), "ERR_UNDER_READ");
      }
    }
    return yieldFileContent;
  };
  var file_default = fileContent;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/unixfs-v1/content/hamt-sharded-directory.js
  var import_err_code8 = __toESM(require_err_code(), 1);
  var hamtShardedDirectoryContent = (cid, node, unixfs, path, resolve7, depth, blockstore) => {
    function yieldHamtDirectoryContent(options = {}) {
      options.onProgress?.(new CustomProgressEvent("unixfs:exporter:walk:hamt-sharded-directory", {
        cid
      }));
      return listDirectory(node, path, resolve7, depth, blockstore, options);
    }
    return yieldHamtDirectoryContent;
  };
  async function* listDirectory(node, path, resolve7, depth, blockstore, options) {
    const links3 = node.Links;
    if (node.Data == null) {
      throw (0, import_err_code8.default)(new Error("no data in PBNode"), "ERR_NOT_UNIXFS");
    }
    let dir;
    try {
      dir = UnixFS.unmarshal(node.Data);
    } catch (err) {
      throw (0, import_err_code8.default)(err, "ERR_NOT_UNIXFS");
    }
    if (dir.fanout == null) {
      throw (0, import_err_code8.default)(new Error("missing fanout"), "ERR_NOT_UNIXFS");
    }
    const padLength = (dir.fanout - 1n).toString(16).length;
    const results = pipe(links3, (source) => src_default4(source, (link2) => {
      return async () => {
        const name7 = link2.Name != null ? link2.Name.substring(padLength) : null;
        if (name7 != null && name7 !== "") {
          const result = await resolve7(link2.Hash, name7, `${path}/${name7}`, [], depth + 1, blockstore, options);
          return { entries: result.entry == null ? [] : [result.entry] };
        } else {
          const block = await blockstore.get(link2.Hash, options);
          node = decode9(block);
          options.onProgress?.(new CustomProgressEvent("unixfs:exporter:walk:hamt-sharded-directory", {
            cid: link2.Hash
          }));
          return { entries: listDirectory(node, path, resolve7, depth, blockstore, options) };
        }
      };
    }), (source) => parallel(source, {
      ordered: true,
      concurrency: options.blockReadConcurrency
    }));
    for await (const { entries: entries3 } of results) {
      yield* entries3;
    }
  }
  var hamt_sharded_directory_default = hamtShardedDirectoryContent;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/unixfs-v1/index.js
  var findLinkCid = (node, name7) => {
    const link2 = node.Links.find((link3) => link3.Name === name7);
    return link2?.Hash;
  };
  var contentExporters = {
    raw: file_default,
    file: file_default,
    directory: directory_default,
    "hamt-sharded-directory": hamt_sharded_directory_default,
    metadata: (cid, node, unixfs, path, resolve7, depth, blockstore) => {
      return () => [];
    },
    symlink: (cid, node, unixfs, path, resolve7, depth, blockstore) => {
      return () => [];
    }
  };
  var unixFsResolver = async (cid, name7, path, toResolve, resolve7, depth, blockstore, options) => {
    const block = await blockstore.get(cid, options);
    const node = decode9(block);
    let unixfs;
    let next;
    if (name7 == null) {
      name7 = cid.toString();
    }
    if (node.Data == null) {
      throw (0, import_err_code9.default)(new Error("no data in PBNode"), "ERR_NOT_UNIXFS");
    }
    try {
      unixfs = UnixFS.unmarshal(node.Data);
    } catch (err) {
      throw (0, import_err_code9.default)(err, "ERR_NOT_UNIXFS");
    }
    if (path == null) {
      path = name7;
    }
    if (toResolve.length > 0) {
      let linkCid;
      if (unixfs?.type === "hamt-sharded-directory") {
        linkCid = await find_cid_in_shard_default(node, toResolve[0], blockstore);
      } else {
        linkCid = findLinkCid(node, toResolve[0]);
      }
      if (linkCid == null) {
        throw (0, import_err_code9.default)(new Error("file does not exist"), "ERR_NOT_FOUND");
      }
      const nextName = toResolve.shift();
      const nextPath = `${path}/${nextName}`;
      next = {
        cid: linkCid,
        toResolve,
        name: nextName ?? "",
        path: nextPath
      };
    }
    const content = contentExporters[unixfs.type](cid, node, unixfs, path, resolve7, depth, blockstore);
    if (content == null) {
      throw (0, import_err_code9.default)(new Error("could not find content exporter"), "ERR_NOT_FOUND");
    }
    if (unixfs.isDirectory()) {
      return {
        entry: {
          type: "directory",
          name: name7,
          path,
          cid,
          content,
          unixfs,
          depth,
          node,
          size: unixfs.fileSize()
        },
        next
      };
    }
    return {
      entry: {
        type: "file",
        name: name7,
        path,
        cid,
        content,
        unixfs,
        depth,
        node,
        size: unixfs.fileSize()
      },
      next
    };
  };
  var unixfs_v1_default = unixFsResolver;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/resolvers/index.js
  var resolvers = {
    [code2]: unixfs_v1_default,
    [code4]: raw_default,
    [code]: dag_cbor_default,
    [code5]: dag_json_default,
    [identity.code]: identity_default,
    [code6]: json_default
  };
  var resolve6 = async (cid, name7, path, toResolve, depth, blockstore, options) => {
    const resolver = resolvers[cid.code];
    if (resolver == null) {
      throw (0, import_err_code10.default)(new Error(`No resolver for code ${cid.code}`), "ERR_NO_RESOLVER");
    }
    return resolver(cid, name7, path, toResolve, resolve6, depth, blockstore, options);
  };
  var resolvers_default = resolve6;

  // node_modules/.pnpm/ipfs-unixfs-exporter@13.5.0/node_modules/ipfs-unixfs-exporter/dist/src/index.js
  var toPathComponents = (path = "") => {
    return (path.trim().match(/([^\\^/]|\\\/)+/g) ?? []).filter(Boolean);
  };
  var cidAndRest = (path) => {
    if (path instanceof Uint8Array) {
      return {
        cid: CID.decode(path),
        toResolve: []
      };
    }
    const cid = CID.asCID(path);
    if (cid != null) {
      return {
        cid,
        toResolve: []
      };
    }
    if (typeof path === "string") {
      if (path.indexOf("/ipfs/") === 0) {
        path = path.substring(6);
      }
      const output = toPathComponents(path);
      return {
        cid: CID.parse(output[0]),
        toResolve: output.slice(1)
      };
    }
    throw (0, import_err_code11.default)(new Error(`Unknown path type ${path}`), "ERR_BAD_PATH");
  };
  async function* walkPath(path, blockstore, options = {}) {
    let { cid, toResolve } = cidAndRest(path);
    let name7 = cid.toString();
    let entryPath = name7;
    const startingDepth = toResolve.length;
    while (true) {
      const result = await resolvers_default(cid, name7, entryPath, toResolve, startingDepth, blockstore, options);
      if (result.entry == null && result.next == null) {
        throw (0, import_err_code11.default)(new Error(`Could not resolve ${path}`), "ERR_NOT_FOUND");
      }
      if (result.entry != null) {
        yield result.entry;
      }
      if (result.next == null) {
        return;
      }
      toResolve = result.next.toResolve;
      cid = result.next.cid;
      name7 = result.next.name;
      entryPath = result.next.path;
    }
  }
  async function exporter(path, blockstore, options = {}) {
    const result = await src_default(walkPath(path, blockstore, options));
    if (result == null) {
      throw (0, import_err_code11.default)(new Error(`Could not resolve ${path}`), "ERR_NOT_FOUND");
    }
    return result;
  }

  // src/runtime/files.ts
  var queuingStrategy = withCapacity();
  var settings = configure2({
    fileChunkEncoder: raw_exports,
    smallFileEncoder: raw_exports,
    chunker: withMaxChunkSize(1024 * 1024),
    fileLayout: withWidth(1024)
  });
  async function collect2(collectable) {
    const chunks = [];
    await collectable.pipeTo(
      new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        }
      })
    );
    return chunks;
  }
  async function encodeFile2(blob) {
    const readable = createFileEncoderStream(blob);
    const blocks = await collect2(readable);
    return { cid: blocks.at(-1).cid, blocks };
  }
  async function decodeFile(blocks, cid, meta) {
    const entry = await exporter(cid.toString(), blocks, { length: meta.size });
    const chunks = [];
    for await (const chunk of entry.content()) {
      chunks.push(chunk);
    }
    return new File(chunks, entry.name, { type: meta.type, lastModified: 0 });
  }
  function createFileEncoderStream(blob) {
    const { readable, writable } = new TransformStream({}, queuingStrategy);
    const unixfsWriter = createWriter({ writable, settings });
    const fileBuilder = new UnixFSFileBuilder("", blob);
    void (async () => {
      await fileBuilder.finalize(unixfsWriter);
      await unixfsWriter.close();
    })();
    return readable;
  }
  var UnixFSFileBuilder = class {
    #file;
    constructor(name7, file) {
      this.name = name7;
      this.#file = file;
    }
    async finalize(writer) {
      const unixfsFileWriter = create7(writer);
      await this.#file.stream().pipeTo(
        new WritableStream({
          async write(chunk) {
            await unixfsFileWriter.write(chunk);
          }
        })
      );
      return await unixfsFileWriter.close();
    }
  };

  // node_modules/.pnpm/yocto-queue@1.1.1/node_modules/yocto-queue/index.js
  var Node2 = class {
    value;
    next;
    constructor(value) {
      this.value = value;
    }
  };
  var Queue = class {
    #head;
    #tail;
    #size;
    constructor() {
      this.clear();
    }
    enqueue(value) {
      const node = new Node2(value);
      if (this.#head) {
        this.#tail.next = node;
        this.#tail = node;
      } else {
        this.#head = node;
        this.#tail = node;
      }
      this.#size++;
    }
    dequeue() {
      const current2 = this.#head;
      if (!current2) {
        return;
      }
      this.#head = this.#head.next;
      this.#size--;
      return current2.value;
    }
    peek() {
      if (!this.#head) {
        return;
      }
      return this.#head.value;
    }
    clear() {
      this.#head = void 0;
      this.#tail = void 0;
      this.#size = 0;
    }
    get size() {
      return this.#size;
    }
    *[Symbol.iterator]() {
      let current2 = this.#head;
      while (current2) {
        yield current2.value;
        current2 = current2.next;
      }
    }
  };

  // node_modules/.pnpm/p-limit@6.1.0/node_modules/p-limit/index.js
  function pLimit(concurrency) {
    validateConcurrency(concurrency);
    const queue = new Queue();
    let activeCount = 0;
    const resumeNext = () => {
      if (activeCount < concurrency && queue.size > 0) {
        queue.dequeue()();
        activeCount++;
      }
    };
    const next = () => {
      activeCount--;
      resumeNext();
    };
    const run = async (function_, resolve7, arguments_) => {
      const result = (async () => function_(...arguments_))();
      resolve7(result);
      try {
        await result;
      } catch {
      }
      next();
    };
    const enqueue2 = (function_, resolve7, arguments_) => {
      new Promise((internalResolve) => {
        queue.enqueue(internalResolve);
      }).then(
        run.bind(void 0, function_, resolve7, arguments_)
      );
      (async () => {
        await Promise.resolve();
        if (activeCount < concurrency) {
          resumeNext();
        }
      })();
    };
    const generator = (function_, ...arguments_) => new Promise((resolve7) => {
      enqueue2(function_, resolve7, arguments_);
    });
    Object.defineProperties(generator, {
      activeCount: {
        get: () => activeCount
      },
      pendingCount: {
        get: () => queue.size
      },
      clearQueue: {
        value() {
          queue.clear();
        }
      },
      concurrency: {
        get: () => concurrency,
        set(newConcurrency) {
          validateConcurrency(newConcurrency);
          concurrency = newConcurrency;
          queueMicrotask(() => {
            while (activeCount < concurrency && queue.size > 0) {
              resumeNext();
            }
          });
        }
      }
    });
    return generator;
  }
  function validateConcurrency(concurrency) {
    if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
      throw new TypeError("Expected `concurrency` to be a number from 1 and up");
    }
  }

  // src/blockstore/store.ts
  init_cement();

  // src/types.ts
  function isFalsy(value) {
    return value === false && value === null && value === void 0;
  }
  function throwFalsy(value) {
    if (isFalsy(value)) {
      throw new Error("value is Falsy");
    }
    return value;
  }
  function falsyToUndef(value) {
    if (isFalsy(value)) {
      return void 0;
    }
    return value;
  }

  // src/blockstore/store.ts
  init_utils();

  // node_modules/.pnpm/@ipld+car@5.3.2/node_modules/@ipld/car/src/decoder-common.js
  var import_varint3 = __toESM(require_varint(), 1);
  var CIDV0_BYTES = {
    SHA2_256: 18,
    LENGTH: 32,
    DAG_PB: 112
  };
  var V2_HEADER_LENGTH = (
    /* characteristics */
    16 + 8 + 8 + 8
  );
  function decodeVarint2(bytes, seeker) {
    if (!bytes.length) {
      throw new Error("Unexpected end of data");
    }
    const i = import_varint3.default.decode(bytes);
    seeker.seek(
      /** @type {number} */
      import_varint3.default.decode.bytes
    );
    return i;
  }
  function decodeV2Header(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 0;
    const header = {
      version: 2,
      /** @type {[bigint, bigint]} */
      characteristics: [
        dv.getBigUint64(offset, true),
        dv.getBigUint64(offset += 8, true)
      ],
      dataOffset: Number(dv.getBigUint64(offset += 8, true)),
      dataSize: Number(dv.getBigUint64(offset += 8, true)),
      indexOffset: Number(dv.getBigUint64(offset += 8, true))
    };
    return header;
  }
  function getMultihashLength(bytes) {
    import_varint3.default.decode(bytes);
    const codeLength = (
      /** @type {number} */
      import_varint3.default.decode.bytes
    );
    const length4 = import_varint3.default.decode(bytes.subarray(import_varint3.default.decode.bytes));
    const lengthLength = (
      /** @type {number} */
      import_varint3.default.decode.bytes
    );
    const mhLength = codeLength + lengthLength + length4;
    return mhLength;
  }

  // node_modules/.pnpm/@ipld+car@5.3.2/node_modules/@ipld/car/src/header-validator.js
  var Kinds = {
    Null: (
      /** @returns {undefined|null} */
      (obj) => obj === null ? obj : void 0
    ),
    Int: (
      /** @returns {undefined|number} */
      (obj) => Number.isInteger(obj) ? obj : void 0
    ),
    Float: (
      /** @returns {undefined|number} */
      (obj) => typeof obj === "number" && Number.isFinite(obj) ? obj : void 0
    ),
    String: (
      /** @returns {undefined|string} */
      (obj) => typeof obj === "string" ? obj : void 0
    ),
    Bool: (
      /** @returns {undefined|boolean} */
      (obj) => typeof obj === "boolean" ? obj : void 0
    ),
    Bytes: (
      /** @returns {undefined|Uint8Array} */
      (obj) => obj instanceof Uint8Array ? obj : void 0
    ),
    Link: (
      /** @returns {undefined|object} */
      (obj) => obj !== null && typeof obj === "object" && obj.asCID === obj ? obj : void 0
    ),
    List: (
      /** @returns {undefined|Array<any>} */
      (obj) => Array.isArray(obj) ? obj : void 0
    ),
    Map: (
      /** @returns {undefined|object} */
      (obj) => obj !== null && typeof obj === "object" && obj.asCID !== obj && !Array.isArray(obj) && !(obj instanceof Uint8Array) ? obj : void 0
    )
  };
  var Types = {
    "CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)": Kinds.Link,
    "CarV1HeaderOrV2Pragma > roots (anon)": (
      /** @returns {undefined|any} */
      (obj) => {
        if (Kinds.List(obj) === void 0) {
          return void 0;
        }
        for (let i = 0; i < obj.length; i++) {
          let v = obj[i];
          v = Types["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v);
          if (v === void 0) {
            return void 0;
          }
          if (v !== obj[i]) {
            const ret = obj.slice(0, i);
            for (let j = i; j < obj.length; j++) {
              let v2 = obj[j];
              v2 = Types["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v2);
              if (v2 === void 0) {
                return void 0;
              }
              ret.push(v2);
            }
            return ret;
          }
        }
        return obj;
      }
    ),
    Int: Kinds.Int,
    CarV1HeaderOrV2Pragma: (
      /** @returns {undefined|any} */
      (obj) => {
        if (Kinds.Map(obj) === void 0) {
          return void 0;
        }
        const entries3 = Object.entries(obj);
        let ret = obj;
        let requiredCount = 1;
        for (let i = 0; i < entries3.length; i++) {
          const [key, value] = entries3[i];
          switch (key) {
            case "roots":
              {
                const v = Types["CarV1HeaderOrV2Pragma > roots (anon)"](obj[key]);
                if (v === void 0) {
                  return void 0;
                }
                if (v !== value || ret !== obj) {
                  if (ret === obj) {
                    ret = {};
                    for (let j = 0; j < i; j++) {
                      ret[entries3[j][0]] = entries3[j][1];
                    }
                  }
                  ret.roots = v;
                }
              }
              break;
            case "version":
              {
                requiredCount--;
                const v = Types.Int(obj[key]);
                if (v === void 0) {
                  return void 0;
                }
                if (v !== value || ret !== obj) {
                  if (ret === obj) {
                    ret = {};
                    for (let j = 0; j < i; j++) {
                      ret[entries3[j][0]] = entries3[j][1];
                    }
                  }
                  ret.version = v;
                }
              }
              break;
            default:
              return void 0;
          }
        }
        if (requiredCount > 0) {
          return void 0;
        }
        return ret;
      }
    )
  };
  var Reprs = {
    "CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)": Kinds.Link,
    "CarV1HeaderOrV2Pragma > roots (anon)": (
      /** @returns {undefined|any} */
      (obj) => {
        if (Kinds.List(obj) === void 0) {
          return void 0;
        }
        for (let i = 0; i < obj.length; i++) {
          let v = obj[i];
          v = Reprs["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v);
          if (v === void 0) {
            return void 0;
          }
          if (v !== obj[i]) {
            const ret = obj.slice(0, i);
            for (let j = i; j < obj.length; j++) {
              let v2 = obj[j];
              v2 = Reprs["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v2);
              if (v2 === void 0) {
                return void 0;
              }
              ret.push(v2);
            }
            return ret;
          }
        }
        return obj;
      }
    ),
    Int: Kinds.Int,
    CarV1HeaderOrV2Pragma: (
      /** @returns {undefined|any} */
      (obj) => {
        if (Kinds.Map(obj) === void 0) {
          return void 0;
        }
        const entries3 = Object.entries(obj);
        let ret = obj;
        let requiredCount = 1;
        for (let i = 0; i < entries3.length; i++) {
          const [key, value] = entries3[i];
          switch (key) {
            case "roots":
              {
                const v = Reprs["CarV1HeaderOrV2Pragma > roots (anon)"](value);
                if (v === void 0) {
                  return void 0;
                }
                if (v !== value || ret !== obj) {
                  if (ret === obj) {
                    ret = {};
                    for (let j = 0; j < i; j++) {
                      ret[entries3[j][0]] = entries3[j][1];
                    }
                  }
                  ret.roots = v;
                }
              }
              break;
            case "version":
              {
                requiredCount--;
                const v = Reprs.Int(value);
                if (v === void 0) {
                  return void 0;
                }
                if (v !== value || ret !== obj) {
                  if (ret === obj) {
                    ret = {};
                    for (let j = 0; j < i; j++) {
                      ret[entries3[j][0]] = entries3[j][1];
                    }
                  }
                  ret.version = v;
                }
              }
              break;
            default:
              return void 0;
          }
        }
        if (requiredCount > 0) {
          return void 0;
        }
        return ret;
      }
    )
  };
  var CarV1HeaderOrV2Pragma = {
    toTyped: Types.CarV1HeaderOrV2Pragma,
    toRepresentation: Reprs.CarV1HeaderOrV2Pragma
  };

  // node_modules/.pnpm/cborg@4.2.3/node_modules/cborg/lib/length.js
  var cborEncoders2 = makeCborEncoders();
  var defaultEncodeOptions3 = {
    float64: false,
    quickEncodeToken
  };
  function tokensToLength(tokens, encoders = cborEncoders2, options = defaultEncodeOptions3) {
    if (Array.isArray(tokens)) {
      let len = 0;
      for (const token of tokens) {
        len += tokensToLength(token, encoders, options);
      }
      return len;
    } else {
      const encoder2 = encoders[tokens.type.major];
      if (encoder2.encodedSize === void 0 || typeof encoder2.encodedSize !== "function") {
        throw new Error(`Encoder for ${tokens.type.name} does not have an encodedSize()`);
      }
      return encoder2.encodedSize(tokens, options);
    }
  }

  // node_modules/.pnpm/@ipld+car@5.3.2/node_modules/@ipld/car/src/buffer-writer.js
  var import_varint4 = __toESM(require_varint(), 1);
  var CarBufferWriter = class {
    /**
     * @param {Uint8Array} bytes
     * @param {number} headerSize
     */
    constructor(bytes, headerSize) {
      this.bytes = bytes;
      this.byteOffset = headerSize;
      this.roots = [];
      this.headerSize = headerSize;
    }
    /**
     * Add a root to this writer, to be used to create a header when the CAR is
     * finalized with {@link CarBufferWriter.close `close()`}
     *
     * @param {CID} root
     * @param {{resize?:boolean}} [options]
     * @returns {CarBufferWriter}
     */
    addRoot(root2, options) {
      addRoot(this, root2, options);
      return this;
    }
    /**
     * Write a `Block` (a `{ cid:CID, bytes:Uint8Array }` pair) to the archive.
     * Throws if there is not enough capacity.
     *
     * @param {Block} block - A `{ cid:CID, bytes:Uint8Array }` pair.
     * @returns {CarBufferWriter}
     */
    write(block) {
      addBlock(this, block);
      return this;
    }
    /**
     * Finalize the CAR and return it as a `Uint8Array`.
     *
     * @param {object} [options]
     * @param {boolean} [options.resize]
     * @returns {Uint8Array}
     */
    close(options) {
      return close8(this, options);
    }
  };
  var addRoot = (writer, root2, options = {}) => {
    const { resize = false } = options;
    const { bytes, headerSize, byteOffset, roots } = writer;
    writer.roots.push(root2);
    const size = headerLength(writer);
    if (size > headerSize) {
      if (size - headerSize + byteOffset < bytes.byteLength) {
        if (resize) {
          resizeHeader(writer, size);
        } else {
          roots.pop();
          throw new RangeError(`Header of size ${headerSize} has no capacity for new root ${root2}.
  However there is a space in the buffer and you could call addRoot(root, { resize: root }) to resize header to make a space for this root.`);
        }
      } else {
        roots.pop();
        throw new RangeError(`Buffer has no capacity for a new root ${root2}`);
      }
    }
  };
  var blockLength = ({ cid, bytes }) => {
    const size = cid.bytes.byteLength + bytes.byteLength;
    return import_varint4.default.encodingLength(size) + size;
  };
  var addBlock = (writer, { cid, bytes }) => {
    const byteLength = cid.bytes.byteLength + bytes.byteLength;
    const size = import_varint4.default.encode(byteLength);
    if (writer.byteOffset + size.length + byteLength > writer.bytes.byteLength) {
      throw new RangeError("Buffer has no capacity for this block");
    } else {
      writeBytes2(writer, size);
      writeBytes2(writer, cid.bytes);
      writeBytes2(writer, bytes);
    }
  };
  var close8 = (writer, options = {}) => {
    const { resize = false } = options;
    const { roots, bytes, byteOffset, headerSize } = writer;
    const headerBytes = encode6({ version: 1, roots });
    const varintBytes = import_varint4.default.encode(headerBytes.length);
    const size = varintBytes.length + headerBytes.byteLength;
    const offset = headerSize - size;
    if (offset === 0) {
      writeHeader(writer, varintBytes, headerBytes);
      return bytes.subarray(0, byteOffset);
    } else if (resize) {
      resizeHeader(writer, size);
      writeHeader(writer, varintBytes, headerBytes);
      return bytes.subarray(0, writer.byteOffset);
    } else {
      throw new RangeError(`Header size was overestimated.
You can use close({ resize: true }) to resize header`);
    }
  };
  var resizeHeader = (writer, byteLength) => {
    const { bytes, headerSize } = writer;
    bytes.set(bytes.subarray(headerSize, writer.byteOffset), byteLength);
    writer.byteOffset += byteLength - headerSize;
    writer.headerSize = byteLength;
  };
  var writeBytes2 = (writer, bytes) => {
    writer.bytes.set(bytes, writer.byteOffset);
    writer.byteOffset += bytes.length;
  };
  var writeHeader = ({ bytes }, varint6, header) => {
    bytes.set(varint6);
    bytes.set(header, varint6.length);
  };
  var headerPreludeTokens = [
    new Token(Type.map, 2),
    new Token(Type.string, "version"),
    new Token(Type.uint, 1),
    new Token(Type.string, "roots")
  ];
  var CID_TAG = new Token(Type.tag, 42);
  var calculateHeaderLength = (rootLengths) => {
    const tokens = [...headerPreludeTokens];
    tokens.push(new Token(Type.array, rootLengths.length));
    for (const rootLength of rootLengths) {
      tokens.push(CID_TAG);
      tokens.push(new Token(Type.bytes, { length: rootLength + 1 }));
    }
    const length4 = tokensToLength(tokens);
    return import_varint4.default.encodingLength(length4) + length4;
  };
  var headerLength = ({ roots }) => calculateHeaderLength(roots.map((cid) => cid.bytes.byteLength));
  var createWriter3 = (buffer2, options = {}) => {
    const {
      roots = [],
      byteOffset = 0,
      byteLength = buffer2.byteLength,
      headerSize = headerLength({ roots })
    } = options;
    const bytes = new Uint8Array(buffer2, byteOffset, byteLength);
    const writer = new CarBufferWriter(bytes, headerSize);
    for (const root2 of roots) {
      writer.addRoot(root2);
    }
    return writer;
  };

  // node_modules/.pnpm/@ipld+car@5.3.2/node_modules/@ipld/car/src/decoder.js
  async function readHeader(reader, strictVersion) {
    const length4 = decodeVarint2(await reader.upTo(8), reader);
    if (length4 === 0) {
      throw new Error("Invalid CAR header (zero length)");
    }
    const header = await reader.exactly(length4, true);
    const block = decode8(header);
    if (CarV1HeaderOrV2Pragma.toTyped(block) === void 0) {
      throw new Error("Invalid CAR header format");
    }
    if (block.version !== 1 && block.version !== 2 || strictVersion !== void 0 && block.version !== strictVersion) {
      throw new Error(`Invalid CAR version: ${block.version}${strictVersion !== void 0 ? ` (expected ${strictVersion})` : ""}`);
    }
    if (block.version === 1) {
      if (!Array.isArray(block.roots)) {
        throw new Error("Invalid CAR header format");
      }
      return block;
    }
    if (block.roots !== void 0) {
      throw new Error("Invalid CAR header format");
    }
    const v2Header = decodeV2Header(await reader.exactly(V2_HEADER_LENGTH, true));
    reader.seek(v2Header.dataOffset - reader.pos);
    const v1Header = await readHeader(reader, 1);
    return Object.assign(v1Header, v2Header);
  }
  async function readCid(reader) {
    const first = await reader.exactly(2, false);
    if (first[0] === CIDV0_BYTES.SHA2_256 && first[1] === CIDV0_BYTES.LENGTH) {
      const bytes2 = await reader.exactly(34, true);
      const multihash2 = decode4(bytes2);
      return CID.create(0, CIDV0_BYTES.DAG_PB, multihash2);
    }
    const version = decodeVarint2(await reader.upTo(8), reader);
    if (version !== 1) {
      throw new Error(`Unexpected CID version (${version})`);
    }
    const codec = decodeVarint2(await reader.upTo(8), reader);
    const bytes = await reader.exactly(getMultihashLength(await reader.upTo(8)), true);
    const multihash = decode4(bytes);
    return CID.create(version, codec, multihash);
  }
  async function readBlockHead(reader) {
    const start = reader.pos;
    let length4 = decodeVarint2(await reader.upTo(8), reader);
    if (length4 === 0) {
      throw new Error("Invalid CAR section (zero length)");
    }
    length4 += reader.pos - start;
    const cid = await readCid(reader);
    const blockLength2 = length4 - Number(reader.pos - start);
    return { cid, length: length4, blockLength: blockLength2 };
  }
  async function readBlock(reader) {
    const { cid, blockLength: blockLength2 } = await readBlockHead(reader);
    const bytes = await reader.exactly(blockLength2, true);
    return { bytes, cid };
  }
  async function readBlockIndex(reader) {
    const offset = reader.pos;
    const { cid, length: length4, blockLength: blockLength2 } = await readBlockHead(reader);
    const index2 = { cid, length: length4, blockLength: blockLength2, offset, blockOffset: reader.pos };
    reader.seek(index2.blockLength);
    return index2;
  }
  function createDecoder(reader) {
    const headerPromise = (async () => {
      const header = await readHeader(reader);
      if (header.version === 2) {
        const v1length = reader.pos - header.dataOffset;
        reader = limitReader(reader, header.dataSize - v1length);
      }
      return header;
    })();
    return {
      header: () => headerPromise,
      async *blocks() {
        await headerPromise;
        while ((await reader.upTo(8)).length > 0) {
          yield await readBlock(reader);
        }
      },
      async *blocksIndex() {
        await headerPromise;
        while ((await reader.upTo(8)).length > 0) {
          yield await readBlockIndex(reader);
        }
      }
    };
  }
  function bytesReader(bytes) {
    let pos = 0;
    return {
      async upTo(length4) {
        const out = bytes.subarray(pos, pos + Math.min(length4, bytes.length - pos));
        return out;
      },
      async exactly(length4, seek = false) {
        if (length4 > bytes.length - pos) {
          throw new Error("Unexpected end of data");
        }
        const out = bytes.subarray(pos, pos + length4);
        if (seek) {
          pos += length4;
        }
        return out;
      },
      seek(length4) {
        pos += length4;
      },
      get pos() {
        return pos;
      }
    };
  }
  function chunkReader(readChunk) {
    let pos = 0;
    let have = 0;
    let offset = 0;
    let currentChunk = new Uint8Array(0);
    const read5 = async (length4) => {
      have = currentChunk.length - offset;
      const bufa = [currentChunk.subarray(offset)];
      while (have < length4) {
        const chunk = await readChunk();
        if (chunk == null) {
          break;
        }
        if (have < 0) {
          if (chunk.length > have) {
            bufa.push(chunk.subarray(-have));
          }
        } else {
          bufa.push(chunk);
        }
        have += chunk.length;
      }
      currentChunk = new Uint8Array(bufa.reduce((p, c) => p + c.length, 0));
      let off = 0;
      for (const b of bufa) {
        currentChunk.set(b, off);
        off += b.length;
      }
      offset = 0;
    };
    return {
      async upTo(length4) {
        if (currentChunk.length - offset < length4) {
          await read5(length4);
        }
        return currentChunk.subarray(offset, offset + Math.min(currentChunk.length - offset, length4));
      },
      async exactly(length4, seek = false) {
        if (currentChunk.length - offset < length4) {
          await read5(length4);
        }
        if (currentChunk.length - offset < length4) {
          throw new Error("Unexpected end of data");
        }
        const out = currentChunk.subarray(offset, offset + length4);
        if (seek) {
          pos += length4;
          offset += length4;
        }
        return out;
      },
      seek(length4) {
        pos += length4;
        offset += length4;
      },
      get pos() {
        return pos;
      }
    };
  }
  function asyncIterableReader(asyncIterable) {
    const iterator = asyncIterable[Symbol.asyncIterator]();
    async function readChunk() {
      const next = await iterator.next();
      if (next.done) {
        return null;
      }
      return next.value;
    }
    return chunkReader(readChunk);
  }
  function limitReader(reader, byteLimit) {
    let bytesRead = 0;
    return {
      async upTo(length4) {
        let bytes = await reader.upTo(length4);
        if (bytes.length + bytesRead > byteLimit) {
          bytes = bytes.subarray(0, byteLimit - bytesRead);
        }
        return bytes;
      },
      async exactly(length4, seek = false) {
        const bytes = await reader.exactly(length4, seek);
        if (bytes.length + bytesRead > byteLimit) {
          throw new Error("Unexpected end of data");
        }
        if (seek) {
          bytesRead += length4;
        }
        return bytes;
      },
      seek(length4) {
        bytesRead += length4;
        reader.seek(length4);
      },
      get pos() {
        return reader.pos;
      }
    };
  }

  // node_modules/.pnpm/@ipld+car@5.3.2/node_modules/@ipld/car/src/reader-browser.js
  var CarReader = class {
    /**
     * @constructs CarReader
     * @param {CarHeader|CarV2Header} header
     * @param {Block[]} blocks
     */
    constructor(header, blocks) {
      this._header = header;
      this._blocks = blocks;
      this._keys = blocks.map((b) => b.cid.toString());
    }
    /**
     * @property
     * @memberof CarReader
     * @instance
     */
    get version() {
      return this._header.version;
    }
    /**
     * Get the list of roots defined by the CAR referenced by this reader. May be
     * zero or more `CID`s.
     *
     * @function
     * @memberof CarReader
     * @instance
     * @async
     * @returns {Promise<CID[]>}
     */
    async getRoots() {
      return this._header.roots;
    }
    /**
     * Check whether a given `CID` exists within the CAR referenced by this
     * reader.
     *
     * @function
     * @memberof CarReader
     * @instance
     * @async
     * @param {CID} key
     * @returns {Promise<boolean>}
     */
    async has(key) {
      return this._keys.indexOf(key.toString()) > -1;
    }
    /**
     * Fetch a `Block` (a `{ cid:CID, bytes:Uint8Array }` pair) from the CAR
     * referenced by this reader matching the provided `CID`. In the case where
     * the provided `CID` doesn't exist within the CAR, `undefined` will be
     * returned.
     *
     * @function
     * @memberof CarReader
     * @instance
     * @async
     * @param {CID} key
     * @returns {Promise<Block | undefined>}
     */
    async get(key) {
      const index2 = this._keys.indexOf(key.toString());
      return index2 > -1 ? this._blocks[index2] : void 0;
    }
    /**
     * Returns a `BlockIterator` (`AsyncIterable<Block>`) that iterates over all
     * of the `Block`s (`{ cid:CID, bytes:Uint8Array }` pairs) contained within
     * the CAR referenced by this reader.
     *
     * @function
     * @memberof CarReader
     * @instance
     * @async
     * @generator
     * @returns {AsyncGenerator<Block>}
     */
    async *blocks() {
      for (const block of this._blocks) {
        yield block;
      }
    }
    /**
     * Returns a `CIDIterator` (`AsyncIterable<CID>`) that iterates over all of
     * the `CID`s contained within the CAR referenced by this reader.
     *
     * @function
     * @memberof CarReader
     * @instance
     * @async
     * @generator
     * @returns {AsyncGenerator<CID>}
     */
    async *cids() {
      for (const block of this._blocks) {
        yield block.cid;
      }
    }
    /**
     * Instantiate a {@link CarReader} from a `Uint8Array` blob. This performs a
     * decode fully in memory and maintains the decoded state in memory for full
     * access to the data via the `CarReader` API.
     *
     * @async
     * @static
     * @memberof CarReader
     * @param {Uint8Array} bytes
     * @returns {Promise<CarReader>}
     */
    static async fromBytes(bytes) {
      if (!(bytes instanceof Uint8Array)) {
        throw new TypeError("fromBytes() requires a Uint8Array");
      }
      return decodeReaderComplete(bytesReader(bytes));
    }
    /**
     * Instantiate a {@link CarReader} from a `AsyncIterable<Uint8Array>`, such as
     * a [modern Node.js stream](https://nodejs.org/api/stream.html#stream_streams_compatibility_with_async_generators_and_async_iterators).
     * This performs a decode fully in memory and maintains the decoded state in
     * memory for full access to the data via the `CarReader` API.
     *
     * Care should be taken for large archives; this API may not be appropriate
     * where memory is a concern or the archive is potentially larger than the
     * amount of memory that the runtime can handle.
     *
     * @async
     * @static
     * @memberof CarReader
     * @param {AsyncIterable<Uint8Array>} asyncIterable
     * @returns {Promise<CarReader>}
     */
    static async fromIterable(asyncIterable) {
      if (!asyncIterable || !(typeof asyncIterable[Symbol.asyncIterator] === "function")) {
        throw new TypeError("fromIterable() requires an async iterable");
      }
      return decodeReaderComplete(asyncIterableReader(asyncIterable));
    }
  };
  async function decodeReaderComplete(reader) {
    const decoder2 = createDecoder(reader);
    const header = await decoder2.header();
    const blocks = [];
    for await (const block of decoder2.blocks()) {
      blocks.push(block);
    }
    return new CarReader(header, blocks);
  }

  // node_modules/.pnpm/@ipld+car@5.3.2/node_modules/@ipld/car/src/encoder.js
  var import_varint5 = __toESM(require_varint(), 1);

  // src/blockstore/loader.ts
  init_cement();

  // src/blockstore/loader-helpers.ts
  async function parseCarFile(reader, logger) {
    const roots = await reader.getRoots();
    const header = await reader.get(roots[0]);
    if (!header) throw logger.Error().Msg("missing header block").AsError();
    const dec = await decode6({ bytes: header.bytes, hasher: sha256, codec: src_exports });
    const fpvalue = dec.value;
    if (fpvalue && !fpvalue.fp) {
      throw logger.Error().Msg("missing fp").AsError();
    }
    return fpvalue.fp;
  }

  // src/blockstore/transaction.ts
  init_cement();
  init_utils();
  var CarTransaction = class extends MemoryBlockstore {
    constructor(parent, opts = { add: true, noLoader: false }) {
      super();
      if (opts.add) {
        parent.transactions.add(this);
      }
      this.parent = parent;
    }
    async get(cid) {
      return await this.superGet(cid) || falsyToUndef(await this.parent.get(cid));
    }
    async superGet(cid) {
      return super.get(cid);
    }
  };
  function defaultedBlockstoreRuntime(sthis, opts, component, ctx) {
    const logger = ensureLogger(sthis, component, ctx);
    const store = opts.store || {};
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      applyMeta: (meta, snap) => {
        return Promise.resolve();
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      compact: async (blocks) => {
        return {};
      },
      autoCompact: 100,
      public: false,
      name: void 0,
      threshold: 1e3 * 1e3,
      ...opts,
      logger,
      keyBag: opts.keyBag || {},
      crypto: toCryptoRuntime(opts.crypto),
      store,
      storeRuntime: toStoreRuntime(store, sthis)
    };
  }
  function blockstoreFactory(sthis, opts) {
    if (opts.name) {
      return new EncryptedBlockstore(sthis, opts);
    } else {
      return new BaseBlockstore(opts);
    }
  }
  var BaseBlockstore = class {
    constructor(ebOpts = {}) {
      this.transactions = /* @__PURE__ */ new Set();
      this.sthis = ensureSuperThis(ebOpts);
      this.ebOpts = defaultedBlockstoreRuntime(this.sthis, ebOpts, "BaseBlockstore");
      this.logger = this.ebOpts.logger;
    }
    // ready: Promise<void>;
    ready() {
      return Promise.resolve();
    }
    async close() {
    }
    async destroy() {
    }
    async get(cid) {
      if (!cid) throw this.logger.Error().Msg("required cid").AsError();
      for (const f of this.transactions) {
        const v = await f.superGet(cid);
        if (v) return v;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async put(cid, block) {
      throw this.logger.Error().Msg("use a transaction to put").AsError();
    }
    // TransactionMeta
    async transaction(fn, _opts) {
      const t = new CarTransaction(this, _opts);
      const done = await fn(t);
      this.lastTxMeta = done;
      return { t, meta: done };
    }
    async *entries() {
      const seen = /* @__PURE__ */ new Set();
      for (const t of this.transactions) {
        for await (const blk of t.entries()) {
          if (seen.has(blk.cid.toString())) continue;
          seen.add(blk.cid.toString());
          yield blk;
        }
      }
    }
  };
  var EncryptedBlockstore = class extends BaseBlockstore {
    constructor(sthis, ebOpts) {
      super(ebOpts);
      this.compacting = false;
      this.logger = ensureLogger(this.sthis, "EncryptedBlockstore");
      const { name: name7 } = ebOpts;
      if (!name7) {
        throw this.logger.Error().Msg("name required").AsError();
      }
      this.name = name7;
      this.loader = new Loader(this.name, ebOpts, sthis);
    }
    ready() {
      return this.loader.ready();
    }
    close() {
      return this.loader.close();
    }
    destroy() {
      return this.loader.destroy();
    }
    async get(cid) {
      const got = await super.get(cid);
      if (got) return got;
      if (!this.loader) {
        return;
      }
      return falsyToUndef(await this.loader.getBlock(cid));
    }
    async transaction(fn, opts = { noLoader: false }) {
      const { t, meta: done } = await super.transaction(fn);
      const cars = await this.loader.commit(t, done, opts);
      if (this.ebOpts.autoCompact && this.loader.carLog.length > this.ebOpts.autoCompact) {
        setTimeout(() => void this.compact(), 10);
      }
      if (cars) {
        this.transactions.delete(t);
        return { meta: done, cars, t };
      }
      throw this.logger.Error().Msg("failed to commit car files").AsError();
    }
    async getFile(car, cid) {
      await this.ready();
      if (!this.loader) throw this.logger.Error().Msg("loader required to get file, database must be named").AsError();
      const reader = await this.loader.loadFileCar(
        car
        /*, isPublic */
      );
      const block = await reader.get(cid);
      if (!block) throw this.logger.Error().Str("cid", cid.toString()).Msg(`Missing block`).AsError();
      return block.bytes;
    }
    async compact() {
      await this.ready();
      if (!this.loader) throw this.logger.Error().Msg("loader required to compact").AsError();
      if (this.loader.carLog.length < 2) return;
      const compactFn = this.ebOpts.compact || ((blocks) => this.defaultCompact(blocks, this.logger));
      if (!compactFn || this.compacting) return;
      const blockLog = new CompactionFetcher(this);
      this.compacting = true;
      const meta = await compactFn(blockLog);
      await this.loader?.commit(blockLog.loggedBlocks, meta, {
        compact: true,
        noLoader: true
      });
      this.compacting = false;
    }
    async defaultCompact(blocks, logger) {
      if (!this.loader) {
        throw logger.Error().Msg("no loader").AsError();
      }
      if (!this.lastTxMeta) {
        throw logger.Error().Msg("no lastTxMeta").AsError();
      }
      for await (const blk of this.loader.entries(false)) {
        blocks.loggedBlocks.putSync(blk.cid, blk.bytes);
      }
      for (const t of this.transactions) {
        for await (const blk of t.entries()) {
          blocks.loggedBlocks.putSync(blk.cid, blk.bytes);
        }
      }
      return this.lastTxMeta;
    }
    async *entries() {
      for await (const blk of this.loader.entries()) {
        yield blk;
      }
    }
  };
  var CompactionFetcher = class {
    constructor(blocks) {
      this.blockstore = blocks;
      this.loggedBlocks = new CarTransaction(blocks);
    }
    async get(cid) {
      const block = await this.blockstore.get(cid);
      if (block) this.loggedBlocks.putSync(cid, block.bytes);
      return falsyToUndef(block);
    }
  };

  // src/blockstore/commit-queue.ts
  init_cement();
  var CommitQueue = class {
    constructor() {
      this.queue = [];
      this.processing = false;
      this._waitIdleItems = /* @__PURE__ */ new Set();
    }
    waitIdle() {
      if (this.queue.length === 0 && !this.processing) {
        return Promise.resolve();
      }
      const fn = new Future();
      this._waitIdleItems.add(fn);
      return fn.asPromise();
    }
    async enqueue(fn) {
      return new Promise((resolve7, reject) => {
        const queueFn = async () => {
          try {
            resolve7(await fn());
          } catch (e) {
            reject(e);
          } finally {
            this.processing = false;
            this.processNext();
          }
        };
        this.queue.push(queueFn);
        if (!this.processing) {
          this.processNext();
        }
      });
    }
    processNext() {
      if (this.queue.length > 0 && !this.processing) {
        this.processing = true;
        const queueFn = this.queue.shift();
        if (queueFn) {
          queueFn().finally(() => {
          });
        }
      }
      if (this.queue.length === 0 && !this.processing) {
        const toResolve = Array.from(this._waitIdleItems);
        this._waitIdleItems.clear();
        toResolve.map((fn) => fn.resolve());
      }
    }
  };

  // src/runtime/key-bag.ts
  var key_bag_exports = {};
  __export(key_bag_exports, {
    KeyBag: () => KeyBag,
    getKeyBag: () => getKeyBag,
    registerKeyBagProviderFactory: () => registerKeyBagProviderFactory
  });
  init_cement();
  init_utils();
  init_base58();
  var KeyBag = class {
    constructor(rt) {
      this.rt = rt;
      this._seq = new ResolveSeq();
      this.logger = ensureLogger(rt.sthis, "KeyBag", {
        id: rt.id()
      });
      this.logger.Debug().Msg("KeyBag created");
    }
    async subtleKey(key) {
      return await this.rt.crypto.importKey(
        "raw",
        // raw or jwk
        base58btc.decode(key),
        // hexStringToUint8Array(key), // raw data
        "AES-GCM",
        false,
        // extractable
        ["encrypt", "decrypt"]
      );
    }
    async ensureKeyFromUrl(url, keyFactory) {
      const storeKey = url.getParam("storekey");
      if (storeKey === "insecure") {
        return Result.Ok(url);
      }
      if (!storeKey) {
        const keyName = `@${keyFactory()}@`;
        const ret = await this.getNamedKey(keyName);
        if (ret.isErr()) {
          return ret;
        }
        const urb = url.build().setParam("storekey", keyName);
        return Result.Ok(urb.URI());
      }
      if (storeKey.startsWith("@") && storeKey.endsWith("@")) {
        const ret = await this.getNamedKey(storeKey);
        if (ret.isErr()) {
          return ret;
        }
      }
      return Result.Ok(url);
    }
    async toKeyWithFingerPrint(keyStr) {
      const material = base58btc.decode(keyStr);
      const key = await this.subtleKey(keyStr);
      const fpr = await this.rt.crypto.digestSHA256(material);
      return Result.Ok({
        key,
        fingerPrint: base58btc.encode(new Uint8Array(fpr))
      });
    }
    async setNamedKey(name7, key) {
      return this._seq.add(() => this._setNamedKey(name7, key));
    }
    // avoid deadlock
    async _setNamedKey(name7, key) {
      const item = {
        name: name7,
        key
      };
      const bag = await this.rt.getBag();
      this.logger.Debug().Str("name", name7).Msg("setNamedKey");
      await bag.set(name7, item);
      return await this.toKeyWithFingerPrint(item.key);
    }
    async getNamedKey(name7, failIfNotFound = false) {
      const id = this.rt.sthis.nextId(4).str;
      return this._seq.add(async () => {
        const bag = await this.rt.getBag();
        const named = await bag.get(name7);
        if (named) {
          const fpr = await this.toKeyWithFingerPrint(named.key);
          this.logger.Debug().Str("id", id).Str("name", name7).Result("fpr", fpr).Msg("fingerPrint getNamedKey");
          return fpr;
        }
        if (failIfNotFound) {
          this.logger.Debug().Str("id", id).Str("name", name7).Msg("failIfNotFound getNamedKey");
          return Result.Err(new Error(`Key not found: ${name7}`));
        }
        const ret = await this._setNamedKey(name7, base58btc.encode(this.rt.crypto.randomBytes(this.rt.keyLength)));
        this.logger.Debug().Str("id", id).Str("name", name7).Result("fpr", ret).Msg("createKey getNamedKey-post");
        return ret;
      });
    }
  };
  var keyBagProviderFactories = new Map(
    [
      {
        protocol: "file:",
        factory: async (url, sthis) => {
          const { KeyBagProviderFile } = await Promise.resolve().then(() => __toESM(require_bundle_not_impl(), 1));
          return new KeyBagProviderFile(url, sthis);
        }
      },
      {
        protocol: "indexdb:",
        factory: async (url, sthis) => {
          const { KeyBagProviderIndexDB: KeyBagProviderIndexDB2 } = await Promise.resolve().then(() => (init_key_bag_indexdb(), key_bag_indexdb_exports));
          return new KeyBagProviderIndexDB2(url, sthis);
        }
      }
    ].map((i) => [i.protocol, i])
  );
  function registerKeyBagProviderFactory(item) {
    const protocol = item.protocol.endsWith(":") ? item.protocol : item.protocol + ":";
    keyBagProviderFactories.set(protocol, {
      ...item,
      protocol
    });
  }
  function defaultKeyBagOpts(sthis, kbo) {
    if (kbo.keyRuntime) {
      return kbo.keyRuntime;
    }
    const logger = ensureLogger(sthis, "KeyBag");
    let url;
    if (kbo.url) {
      url = URI.from(kbo.url);
      logger.Debug().Url(url).Msg("from opts");
    } else {
      let bagFnameOrUrl = sthis.env.get("FP_KEYBAG_URL");
      if (runtimeFn().isBrowser) {
        url = URI.from(bagFnameOrUrl || "indexdb://fp-keybag");
      } else {
        if (!bagFnameOrUrl) {
          const home = sthis.env.get("HOME");
          bagFnameOrUrl = `${home}/.fireproof/keybag`;
          url = URI.from(`file://${bagFnameOrUrl}`);
        } else {
          url = URI.from(bagFnameOrUrl);
        }
      }
      logger.Debug().Url(url).Msg("from env");
    }
    let keyProviderFactory;
    switch (url.protocol) {
      case "file:":
        keyProviderFactory = async () => {
          const { KeyBagProviderFile } = await Promise.resolve().then(() => __toESM(require_bundle_not_impl(), 1));
          return new KeyBagProviderFile(url, sthis);
        };
        break;
      case "indexdb:":
        keyProviderFactory = async () => {
          const { KeyBagProviderIndexDB: KeyBagProviderIndexDB2 } = await Promise.resolve().then(() => (init_key_bag_indexdb(), key_bag_indexdb_exports));
          return new KeyBagProviderIndexDB2(url, sthis);
        };
        break;
      default:
        throw logger.Error().Url(url).Msg("unsupported protocol").AsError();
    }
    if (url.hasParam("masterkey")) {
      throw logger.Error().Url(url).Msg("masterkey is not supported").AsError();
    }
    return {
      url,
      crypto: kbo.crypto || toCryptoRuntime({}),
      sthis,
      logger,
      keyLength: kbo.keyLength || 16,
      getBag: keyProviderFactory,
      id: () => {
        return url.toString();
      }
    };
  }
  var _keyBags = new KeyedResolvOnce();
  async function getKeyBag(sthis, kbo = {}) {
    await sthis.start();
    const rt = defaultKeyBagOpts(sthis, kbo);
    return _keyBags.get(rt.id()).once(async () => new KeyBag(rt));
  }

  // src/blockstore/commitor.ts
  async function encodeCarFile(roots, t, codec) {
    let size = 0;
    const headerSize = headerLength({ roots });
    size += headerSize;
    for (const { cid, bytes } of t.entries()) {
      size += blockLength({ cid, bytes });
    }
    const buffer2 = new Uint8Array(size);
    const writer = createWriter3(buffer2, { headerSize });
    for (const r of roots) {
      writer.addRoot(r);
    }
    for (const { cid, bytes } of t.entries()) {
      writer.write({ cid, bytes });
    }
    writer.close();
    return await encode4({ value: writer.bytes, hasher: sha256, codec });
  }
  async function createCarFile(encoder2, cid, t) {
    return encodeCarFile([cid], t, encoder2);
  }
  async function commitFiles(fileStore, walStore, t, done) {
    const { files: roots } = makeFileCarHeader(done);
    const cids = [];
    const codec = (await fileStore.keyedCrypto()).codec();
    const cars = await prepareCarFilesFiles(codec, roots, t);
    for (const car of cars) {
      const { cid, bytes } = car;
      await fileStore.save({ cid, bytes });
      await walStore.enqueueFile(
        cid
        /*, !!opts.public*/
      );
      cids.push(cid);
    }
    return cids;
  }
  function makeFileCarHeader(result) {
    const files = [];
    for (const [, meta] of Object.entries(result.files || {})) {
      if (meta && typeof meta === "object" && "cid" in meta && meta !== null) {
        files.push(meta.cid);
      }
    }
    return { ...result, files };
  }
  async function prepareCarFilesFiles(encoder2, roots, t) {
    return [await encodeCarFile(roots, t, encoder2)];
  }
  function makeCarHeader(meta, cars, compact = false) {
    const coreHeader = compact ? { cars: [], compact: cars } : { cars, compact: [] };
    return { ...coreHeader, meta };
  }
  async function encodeCarHeader(fp) {
    return await encode4({
      value: { fp },
      hasher: sha256,
      codec: src_exports
    });
  }
  async function commit2(params, t, done, opts = { noLoader: false, compact: false }) {
    const fp = makeCarHeader(done, params.carLog, !!opts.compact);
    const rootBlock = await encodeCarHeader(fp);
    const cars = await prepareCarFiles(params.encoder, params.threshold, rootBlock, t);
    const cids = [];
    for (const car of cars) {
      const { cid, bytes } = car;
      await params.carStore.save({ cid, bytes });
      cids.push(cid);
    }
    const newDbMeta = { cars: cids };
    await params.WALStore.enqueue(newDbMeta, opts);
    await params.metaStore.save(newDbMeta);
    return { cgrp: cids, header: fp };
  }
  async function prepareCarFiles(encoder2, threshold, rootBlock, t) {
    const carFiles = [];
    threshold = threshold || 1e3 * 1e3;
    let clonedt = new CarTransaction(t.parent, { add: false, noLoader: false });
    clonedt.putSync(rootBlock.cid, rootBlock.bytes);
    let newsize = blockLength(toCIDBlock(rootBlock));
    let cidRootBlock = rootBlock;
    for (const { cid, bytes } of t.entries()) {
      newsize += blockLength(toCIDBlock({ cid, bytes }));
      if (newsize >= threshold) {
        carFiles.push(await createCarFile(encoder2, cidRootBlock.cid, clonedt));
        clonedt = new CarTransaction(t.parent, { add: false, noLoader: false });
        clonedt.putSync(cid, bytes);
        cidRootBlock = { cid, bytes };
        newsize = blockLength(toCIDBlock({ cid, bytes }));
      } else {
        clonedt.putSync(cid, bytes);
      }
    }
    carFiles.push(await createCarFile(encoder2, cidRootBlock.cid, clonedt));
    return carFiles;
  }

  // src/blockstore/loader.ts
  function carLogIncludesGroup(list, cids) {
    return list.some((arr) => {
      return arr.toString() === cids.toString();
    });
  }
  function uniqueCids(list, remove3 = /* @__PURE__ */ new Set()) {
    const byString = /* @__PURE__ */ new Map();
    for (const cid of list) {
      if (remove3.has(cid.toString())) continue;
      byString.set(cid.toString(), cid);
    }
    return [...byString.values()];
  }
  var Loader = class {
    constructor(name7, ebOpts, sthis) {
      this.commitQueue = new CommitQueue();
      this.isCompacting = false;
      this.carReaders = /* @__PURE__ */ new Map();
      this.seenCompacted = /* @__PURE__ */ new Set();
      this.processedCars = /* @__PURE__ */ new Set();
      this.carLog = [];
      this.getBlockCache = /* @__PURE__ */ new Map();
      this.seenMeta = /* @__PURE__ */ new Set();
      this.writeLimit = pLimit(1);
      this.onceReady = new ResolveOnce();
      this.name = name7;
      this.sthis = sthis;
      this.ebOpts = defaultedBlockstoreRuntime(
        sthis,
        {
          ...ebOpts,
          name: name7
        },
        "Loader"
      );
      this.logger = this.ebOpts.logger;
    }
    // readonly id = uuidv4();
    async keyBag() {
      return getKeyBag(this.sthis, this.ebOpts.keyBag);
    }
    async carStore() {
      return this.ebOpts.storeRuntime.makeDataStore(this);
    }
    async fileStore() {
      return this.ebOpts.storeRuntime.makeDataStore(this);
    }
    async WALStore() {
      return this.ebOpts.storeRuntime.makeWALStore(this);
    }
    async metaStore() {
      return this.ebOpts.storeRuntime.makeMetaStore(this);
    }
    async ready() {
      return this.onceReady.once(async () => {
        const metas = this.ebOpts.meta ? [this.ebOpts.meta] : await (await this.metaStore()).load();
        if (metas) {
          await this.handleDbMetasFromStore(metas);
        }
      });
    }
    async close() {
      const toClose = await Promise.all([this.carStore(), this.metaStore(), this.fileStore(), this.WALStore()]);
      await Promise.all(toClose.map((store) => store.close()));
    }
    async destroy() {
      const toDestroy = await Promise.all([this.carStore(), this.metaStore(), this.fileStore(), this.WALStore()]);
      await Promise.all(toDestroy.map((store) => store.destroy()));
    }
    // async snapToCar(carCid: AnyLink | string) {
    //   await this.ready
    //   if (typeof carCid === 'string') {
    //     carCid = CID.parse(carCid)
    //   }
    //   const carHeader = await this.loadCarHeaderFromMeta({ car: carCid, key: this.key || null })
    //   this.carLog = [carCid, ...carHeader.cars]
    //   await this.getMoreReaders(carHeader.cars)
    //   await this._applyCarHeader(carHeader, true)
    // }
    async handleDbMetasFromStore(metas) {
      this.logger.Debug().Any("metas", metas).Msg("handleDbMetasFromStore");
      for (const meta of metas) {
        await this.writeLimit(async () => {
          await this.mergeDbMetaIntoClock(meta);
        });
      }
    }
    async mergeDbMetaIntoClock(meta) {
      if (this.isCompacting) {
        throw this.logger.Error().Msg("cannot merge while compacting").AsError();
      }
      if (this.seenMeta.has(meta.cars.toString())) return;
      this.seenMeta.add(meta.cars.toString());
      if (carLogIncludesGroup(this.carLog, meta.cars)) {
        return;
      }
      const carHeader = await this.loadCarHeaderFromMeta(meta);
      carHeader.compact.map((c) => c.toString()).forEach(this.seenCompacted.add, this.seenCompacted);
      await this.getMoreReaders(carHeader.cars.flat());
      this.carLog = [...uniqueCids([meta.cars, ...this.carLog, ...carHeader.cars], this.seenCompacted)];
      await this.ebOpts.applyMeta?.(carHeader.meta);
    }
    // protected async ingestKeyFromMeta(meta: DbMeta): Promise<void> {
    //   const { key } = meta;
    //   if (key) {
    //     await this.setKey(key);
    //   }
    // }
    async loadCarHeaderFromMeta({ cars: cids }) {
      const reader = await this.loadCar(cids[0]);
      return await parseCarFile(reader, this.logger);
    }
    // async _getKey(): Promise<string | undefined> {
    //   if (this.key) return this.key;
    //   // generate a random key
    //   if (!this.ebOpts.public) {
    //     await this.setKey(toHexString(this.ebOpts.crypto.randomBytes(32)));
    //   }
    //   return this.key || undefined;
    // }
    async commitFiles(t, done) {
      await this.ready();
      const fstore = await this.fileStore();
      const wstore = await this.WALStore();
      return this.commitQueue.enqueue(() => commitFiles(fstore, wstore, t, done));
    }
    async loadFileCar(cid) {
      return await this.storesLoadCar(cid, await this.fileStore(), this.remoteFileStore);
    }
    async commit(t, done, opts = { noLoader: false, compact: false }) {
      await this.ready();
      const fstore = await this.fileStore();
      const params = {
        encoder: (await fstore.keyedCrypto()).codec(),
        carLog: this.carLog,
        carStore: fstore,
        WALStore: await this.WALStore(),
        metaStore: await this.metaStore()
      };
      return this.commitQueue.enqueue(async () => {
        await this.cacheTransaction(t);
        const ret = await commit2(params, t, done, opts);
        await this.updateCarLog(ret.cgrp, ret.header, !!opts.compact);
        return ret.cgrp;
      });
    }
    async updateCarLog(cids, fp, compact) {
      if (compact) {
        const previousCompactCid = fp.compact[fp.compact.length - 1];
        fp.compact.map((c) => c.toString()).forEach(this.seenCompacted.add, this.seenCompacted);
        this.carLog = [...uniqueCids([...this.carLog, ...fp.cars, cids], this.seenCompacted)];
        await this.removeCidsForCompact(previousCompactCid[0]).catch((e) => e);
      } else {
        this.carLog.unshift(cids);
      }
    }
    async cacheTransaction(t) {
      for await (const block of t.entries()) {
        const sBlock = block.cid.toString();
        if (!this.getBlockCache.has(sBlock)) {
          this.getBlockCache.set(sBlock, block);
        }
      }
    }
    async cacheCarReader(carCidStr, reader) {
      if (this.processedCars.has(carCidStr)) return;
      this.processedCars.add(carCidStr);
      for await (const block of reader.blocks()) {
        const sBlock = block.cid.toString();
        if (!this.getBlockCache.has(sBlock)) {
          this.getBlockCache.set(sBlock, block);
        }
      }
    }
    async removeCidsForCompact(cid) {
      const carHeader = await this.loadCarHeaderFromMeta({
        cars: [cid]
      });
      for (const cids of carHeader.compact) {
        for (const cid2 of cids) {
          await (await this.carStore()).remove(cid2);
        }
      }
    }
    // async flushCars() {
    //   await this.ready
    //   // for each cid in car log, make a dbMeta
    //   for (const cid of this.carLog) {
    //     const dbMeta = { car: cid, key: this.key || null } as DbMeta
    //     await this.remoteWAL!.enqueue(dbMeta, { public: false })
    //   }
    // }
    async *entries(cache3 = true) {
      await this.ready();
      if (cache3) {
        for (const [, block] of this.getBlockCache) {
          yield block;
        }
      } else {
        for (const [, block] of this.getBlockCache) {
          yield block;
        }
        for (const cids of this.carLog) {
          for (const cid of cids) {
            const reader = await this.loadCar(cid);
            if (!reader) throw this.logger.Error().Ref("cid", cid).Msg("missing car reader").AsError();
            for await (const block of reader.blocks()) {
              const sCid = block.cid.toString();
              if (!this.getBlockCache.has(sCid)) {
                yield block;
              }
            }
          }
        }
      }
    }
    async getBlock(cid) {
      await this.ready();
      const sCid = cid.toString();
      if (this.getBlockCache.has(sCid)) return this.getBlockCache.get(sCid);
      const getCarCid = async (carCid) => {
        if (this.getBlockCache.has(sCid)) return this.getBlockCache.get(sCid);
        const reader = await this.loadCar(carCid);
        if (!reader) {
          throw this.logger.Error().Ref("cid", carCid).Msg("missing car reader").AsError();
        }
        await this.cacheCarReader(carCid.toString(), reader).catch(() => {
          return;
        });
        if (this.getBlockCache.has(sCid)) return this.getBlockCache.get(sCid);
        throw this.logger.Error().Str("cid", sCid).Msg("block not in reader").AsError();
      };
      const getCompactCarCids = async (carCid) => {
        const reader = await this.loadCar(carCid);
        if (!reader) {
          throw this.logger.Error().Str("cid", carCid.toString()).Msg("missing car reader").AsError();
        }
        const header = await parseCarFile(reader, this.logger);
        const compacts = header.compact;
        let got2;
        const batchSize2 = 5;
        for (let i = 0; i < compacts.length; i += batchSize2) {
          const promises = [];
          for (let j = i; j < Math.min(i + batchSize2, compacts.length); j++) {
            for (const cid2 of compacts[j]) {
              promises.push(getCarCid(cid2));
            }
          }
          try {
            got2 = await Promise.any(promises);
          } catch {
          }
          if (got2) break;
        }
        if (this.getBlockCache.has(sCid)) return this.getBlockCache.get(sCid);
        throw this.logger.Error().Str("cid", sCid).Msg("block not in compact reader").AsError();
      };
      let got;
      const batchSize = 5;
      for (let i = 0; i < this.carLog.length; i += batchSize) {
        const batch2 = this.carLog.slice(i, i + batchSize);
        const promises = batch2.flatMap((slice3) => slice3.map(getCarCid));
        try {
          got = await Promise.any(promises);
        } catch {
        }
        if (got) break;
      }
      if (!got) {
        try {
          got = await getCompactCarCids(this.carLog[this.carLog.length - 1][0]);
        } catch {
        }
      }
      return got;
    }
    async loadCar(cid) {
      if (!this.carStore) {
        throw this.logger.Error().Msg("car store not initialized").AsError();
      }
      const loaded = await this.storesLoadCar(cid, await this.carStore(), this.remoteCarStore);
      return loaded;
    }
    async makeDecoderAndCarReader(cid, local, remote) {
      const cidsString = cid.toString();
      let loadedCar = void 0;
      let activeStore = local;
      try {
        this.logger.Debug().Str("cid", cidsString).Msg("loading car");
        loadedCar = await local.load(cid);
        this.logger.Debug().Bool("loadedCar", loadedCar).Msg("loaded");
      } catch (e) {
        if (remote) {
          const remoteCar = await remote.load(cid);
          if (remoteCar) {
            this.logger.Debug().Ref("cid", remoteCar.cid).Msg("saving remote car locally");
            await local.save(remoteCar);
            loadedCar = remoteCar;
            activeStore = remote;
          }
        } else {
          this.logger.Error().Str("cid", cidsString).Err(e).Msg("loading car");
        }
      }
      if (!loadedCar) {
        throw this.logger.Error().Url(local.url()).Str("cid", cidsString).Msg("missing car files").AsError();
      }
      const bytes = await decode6({ bytes: loadedCar.bytes, hasher: sha256, codec: (await activeStore.keyedCrypto()).codec() });
      const rawReader = await CarReader.fromBytes(bytes.value);
      const readerP = Promise.resolve(rawReader);
      const cachedReaderP = readerP.then(async (reader) => {
        await this.cacheCarReader(cidsString, reader).catch((e) => {
          this.logger.Error().Err(e).Str("cid", cidsString).Msg("error caching car reader");
          return;
        });
        return reader;
      });
      this.carReaders.set(cidsString, cachedReaderP);
      return readerP;
    }
    //What if instead it returns an Array of CarHeader
    async storesLoadCar(cid, local, remote) {
      const cidsString = cid.toString();
      let dacr = this.carReaders.get(cidsString);
      if (!dacr) {
        dacr = this.makeDecoderAndCarReader(cid, local, remote);
        this.carReaders.set(cidsString, dacr);
      }
      return dacr;
    }
    async getMoreReaders(cids) {
      const limit = pLimit(5);
      const missing = cids.filter((cid) => !this.carReaders.has(cid.toString()));
      await Promise.all(missing.map((cid) => limit(() => this.loadCar(cid))));
    }
  };

  // src/runtime/keyed-crypto.ts
  var keyed_crypto_exports = {};
  __export(keyed_crypto_exports, {
    BlockIvKeyIdCodec: () => BlockIvKeyIdCodec,
    keyedCryptoFactory: () => keyedCryptoFactory
  });
  init_utils();
  init_base58();
  var generateIV = {
    random: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      calc: async (ko, crypto2, data) => {
        return crypto2.randomBytes(ko.ivLength);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      verify: async (ko, crypto2, iv, data) => {
        return true;
      }
    },
    hash: {
      calc: async (ko, crypto2, data) => {
        const hash2 = await sha256.digest(data);
        const hashBytes = new Uint8Array(hash2.bytes);
        const hashArray = new Uint8Array(ko.ivLength * 8);
        for (let i = 0; i < hashBytes.length; i++) {
          hashArray[i % ko.ivLength] ^= hashBytes[i];
        }
        return hashArray;
      },
      verify: async function(ko, crypto2, iv, data) {
        return ko.url.getParam("ivverify") !== "disable" && UInt8ArrayEqual(iv, await this.calc(ko, crypto2, data));
      }
    }
  };
  function getGenerateIVFn(url, opts) {
    const ivhash = opts.ivCalc || url.getParam("ivhash") || "hash";
    return generateIV[ivhash] || generateIV["hash"];
  }
  var BlockIvKeyIdCodec = class {
    constructor(ko, iv, opts) {
      this.code = 3147065;
      this.name = "Fireproof@encrypted-block:aes-gcm";
      this.ko = ko;
      this.iv = iv;
      this.opts = opts || {};
    }
    async encode(data) {
      const calcIv = this.iv || await getGenerateIVFn(this.ko.url, this.opts).calc(this.ko, this.ko.crypto, data);
      const { iv } = this.ko.algo(calcIv);
      const fprt = await this.ko.fingerPrint();
      const keyId = base58btc.decode(fprt);
      this.ko.logger.Debug().Str("fp", fprt).Msg("encode");
      return encode5({
        iv,
        keyId,
        data: await this.ko._encrypt({ iv, bytes: data })
      });
    }
    async decode(abytes) {
      let bytes;
      if (abytes instanceof Uint8Array) {
        bytes = abytes;
      } else {
        bytes = new Uint8Array(abytes);
      }
      const { iv, keyId, data } = decode7(bytes);
      const fprt = await this.ko.fingerPrint();
      this.ko.logger.Debug().Str("fp", base58btc.encode(keyId)).Msg("decode");
      if (base58btc.encode(keyId) !== fprt) {
        throw this.ko.logger.Error().Str("fp", fprt).Str("keyId", base58btc.encode(keyId)).Msg("keyId mismatch").AsError();
      }
      const result = await this.ko._decrypt({ iv, bytes: data });
      if (!this.opts?.noIVVerify && !await getGenerateIVFn(this.ko.url, this.opts).verify(this.ko, this.ko.crypto, iv, result)) {
        throw this.ko.logger.Error().Msg("iv missmatch").AsError();
      }
      return result;
    }
  };
  var keyedCrypto = class {
    constructor(url, key, cyopt, sthis) {
      this.ivLength = 12;
      this.isEncrypting = true;
      this.logger = ensureLogger(sthis, "keyedCrypto");
      this.crypto = cyopt;
      this.key = key;
      this.url = url;
    }
    fingerPrint() {
      return Promise.resolve(this.key.fingerPrint);
    }
    codec(iv, opts) {
      return new BlockIvKeyIdCodec(this, iv, opts);
    }
    algo(iv) {
      return {
        name: "AES-GCM",
        iv: iv || this.crypto.randomBytes(this.ivLength),
        tagLength: 128
      };
    }
    async _decrypt(data) {
      this.logger.Debug().Len(data.bytes).Str("fp", this.key.fingerPrint).Msg("decrypting");
      return new Uint8Array(await this.crypto.decrypt(this.algo(data.iv), this.key.key, data.bytes));
    }
    async _encrypt(data) {
      this.logger.Debug().Len(data.bytes).Str("fp", this.key.fingerPrint).Msg("encrypting");
      const a = this.algo(data.iv);
      return new Uint8Array(await this.crypto.encrypt(a, this.key.key, data.bytes));
    }
  };
  var nullCodec = class {
    constructor() {
      this.code = 0;
      this.name = "Fireproof@unencrypted-block";
    }
    encode(data) {
      return data;
    }
    decode(data) {
      return data;
    }
  };
  var noCrypto = class {
    constructor(url, cyrt, sthis) {
      this.ivLength = 0;
      this.code = 0;
      this.name = "Fireproof@unencrypted-block";
      this.isEncrypting = false;
      this._fingerPrint = "noCrypto:" + Math.random();
      this.logger = ensureLogger(sthis, "noCrypto");
      this.crypto = cyrt;
      this.url = url;
    }
    fingerPrint() {
      return Promise.resolve(this._fingerPrint);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    codec(iv) {
      return new nullCodec();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    algo(iv) {
      return {
        name: "noCrypto",
        iv: new Uint8Array(),
        tagLength: 0
      };
    }
    _decrypt() {
      throw this.logger.Error().Msg("noCrypto.decrypt not implemented").AsError();
    }
    _encrypt() {
      throw this.logger.Error().Msg("noCrypto.decrypt not implemented").AsError();
    }
  };
  async function keyedCryptoFactory(url, kb, sthis) {
    const storekey = url.getParam("storekey");
    if (storekey && storekey !== "insecure") {
      let rkey = await kb.getNamedKey(storekey, true);
      if (rkey.isErr()) {
        try {
          rkey = await kb.toKeyWithFingerPrint(storekey);
        } catch (e) {
          throw sthis.logger.Error().Err(e).Str("keybag", kb.rt.id()).Str("name", storekey).Msg("getNamedKey failed").AsError();
        }
      }
      return new keyedCrypto(url, rkey.Ok(), kb.rt.crypto, sthis);
    }
    return new noCrypto(url, kb.rt.crypto, sthis);
  }

  // src/blockstore/fragment-gateway.ts
  init_base58();
  function getFragSize(url) {
    const fragSize = url.getParam("fragSize");
    let ret = 0;
    if (fragSize) {
      ret = parseInt(fragSize);
    }
    if (isNaN(ret) || ret <= 0) {
      ret = 0;
    }
    return ret;
  }
  async function getFrags(url, innerGW, headerSize, logger) {
    const fragSize = getFragSize(url);
    if (!fragSize) {
      const res = await innerGW.get(url);
      if (res.isErr()) {
        return [res];
      }
      const data = res.unwrap();
      return [
        Result.Ok({
          fid: new Uint8Array(0),
          ofs: 0,
          len: data.length,
          data
        })
      ];
    }
    const firstRaw = await innerGW.get(url.build().setParam("ofs", "0").URI());
    if (firstRaw.isErr()) {
      return [firstRaw];
    }
    const firstFragment = decode7(firstRaw.unwrap());
    const blockSize = firstFragment.data.length;
    const ops = [Promise.resolve(Result.Ok(firstFragment))];
    const fidStr = base58btc.encode(firstFragment.fid);
    const fragUrl = url.build().setParam("fid", fidStr).setParam("len", firstFragment.len.toString()).setParam("headerSize", headerSize.toString());
    for (let ofs = blockSize; ofs < firstFragment.len; ofs += blockSize) {
      ops.push(
        (async (furl, ofs2) => {
          const raw = await innerGW.get(furl);
          if (raw.isErr()) {
            return raw;
          }
          const fragment = decode7(raw.unwrap());
          if (base58btc.encode(fragment.fid) !== fidStr) {
            return Result.Err(logger.Error().Msg("Fragment fid mismatch").AsError());
          }
          if (fragment.ofs !== ofs2) {
            return Result.Err(logger.Error().Uint64("ofs", ofs2).Msg("Fragment ofs mismatch").AsError());
          }
          return Result.Ok(fragment);
        })(fragUrl.setParam("ofs", ofs.toString()).URI(), ofs)
      );
    }
    return Promise.all(ops);
  }
  var FragmentGateway = class {
    constructor(sthis, innerGW) {
      this.fidLength = 4;
      this.headerSize = 32;
      this.sthis = ensureSuperLog(sthis, "FragmentGateway");
      this.logger = this.sthis.logger;
      this.innerGW = innerGW;
    }
    slicer(url, body) {
      const fragSize = getFragSize(url);
      if (!fragSize) {
        return [this.innerGW.put(url, body)];
      }
      const blocksize = fragSize - this.headerSize;
      if (blocksize <= 0) {
        throw this.logger.Error().Uint64("fragSize", fragSize).Uint64("headerSize", this.headerSize).Msg("Fragment size is too small").AsError();
      }
      const ops = [];
      const fid = this.sthis.nextId(this.fidLength);
      const fragUrl = url.build().setParam("fid", fid.str).setParam("len", body.length.toString()).setParam("headerSize", this.headerSize.toString());
      for (let ofs = 0; ofs < body.length; ofs += blocksize) {
        const block = encode5({
          fid: fid.bin,
          ofs,
          len: body.length,
          data: body.slice(ofs, ofs + blocksize)
        });
        if (block.length > fragSize) {
          throw this.logger.Error().Uint64("block", block.length).Uint64("fragSize", fragSize).Msg("Block size to big").AsError();
        }
        ops.push(this.innerGW.put(fragUrl.setParam("ofs", ofs.toString()).URI(), block));
      }
      return ops;
    }
    buildUrl(baseUrl, key) {
      return this.innerGW.buildUrl(baseUrl, key);
    }
    async destroy(iurl) {
      return this.innerGW.destroy(iurl);
    }
    async start(url) {
      this.headerSize = encode5({
        fid: this.sthis.nextId(this.fidLength).bin,
        ofs: 1024 * 1024,
        // 32bit
        len: 16 * 1024 * 1024,
        // 32bit
        data: new Uint8Array(1024)
      }).length - 1024;
      return this.innerGW.start(url);
    }
    async close(url) {
      return this.innerGW.close(url);
    }
    async put(url, body) {
      await Promise.all(this.slicer(url, body));
      return Result.Ok(void 0);
    }
    async get(url) {
      const rfrags = await getFrags(url, this.innerGW, this.headerSize, this.logger);
      let buffer2 = void 0;
      for (const rfrag of rfrags) {
        if (rfrag.isErr()) {
          return Result.Err(rfrag.Err());
        }
        const frag = rfrag.Ok();
        buffer2 = buffer2 || new Uint8Array(frag.len);
        buffer2.set(frag.data, frag.ofs);
      }
      return Result.Ok(buffer2 || new Uint8Array(0));
    }
    async delete(url) {
      const rfrags = await getFrags(url, this.innerGW, this.headerSize, this.logger);
      for (const rfrag of rfrags) {
        if (rfrag.isErr()) {
          return Result.Err(rfrag.Err());
        }
        const frag = rfrag.Ok();
        const fidStr = base58btc.encode(frag.fid);
        const fragUrl = url.build().setParam("fid", fidStr).setParam("len", frag.len.toString()).setParam("headerSize", this.headerSize.toString()).URI();
        await this.innerGW.delete(fragUrl);
      }
      return Result.Ok(void 0);
    }
  };

  // src/blockstore/store.ts
  function guardVersion(url) {
    if (!url.hasParam("version")) {
      return Result.Err(`missing version: ${url.toString()}`);
    }
    return Result.Ok(url);
  }
  var BaseStoreImpl = class {
    constructor(name7, url, opts, sthis, logger) {
      this._onStarted = [];
      this._onClosed = [];
      this.name = name7;
      this._url = url;
      this.keybag = opts.keybag;
      this.sthis = sthis;
      this.logger = logger.With().Ref("url", () => this._url.toString()).Str("name", name7).Logger();
      this.gateway = new FragmentGateway(this.sthis, opts.gateway);
      this.loader = opts.loader;
    }
    url() {
      return this._url;
    }
    onStarted(fn) {
      this._onStarted.push(fn);
    }
    onClosed(fn) {
      this._onClosed.push(fn);
    }
    async keyedCrypto() {
      return keyedCryptoFactory(this._url, await this.keybag(), this.sthis);
    }
    async start() {
      this.logger.Debug().Str("storeType", this.storeType).Msg("starting-gateway-pre");
      this._url = this._url.build().setParam("store", this.storeType).URI();
      const res = await this.gateway.start(this._url);
      if (res.isErr()) {
        this.logger.Error().Result("gw-start", res).Msg("started-gateway");
        return res;
      }
      this._url = res.Ok();
      const kb = await this.keybag();
      const skRes = await kb.ensureKeyFromUrl(this._url, () => {
        const idx = this._url.getParam("index");
        const storeKeyName = [this.name];
        if (idx) {
          storeKeyName.push(idx);
        }
        storeKeyName.push(this.storeType);
        return storeKeyName.join(":");
      });
      if (skRes.isErr()) {
        return skRes;
      }
      this._url = skRes.Ok();
      const version = guardVersion(this._url);
      if (version.isErr()) {
        this.logger.Error().Result("version", version).Msg("guardVersion");
        await this.close();
        return version;
      }
      if (this.ready) {
        const fn = this.ready.bind(this);
        const ready = await exception2Result(fn);
        if (ready.isErr()) {
          await this.close();
          return ready;
        }
      }
      this._onStarted.forEach((fn) => fn());
      this.logger.Debug().Msg("started");
      return version;
    }
  };
  var MetaStoreImpl = class extends BaseStoreImpl {
    constructor(sthis, name7, url, opts) {
      super(
        name7,
        url,
        {
          ...opts
        },
        sthis,
        ensureLogger(sthis, "MetaStoreImpl")
      );
      this.storeType = "meta";
      this.subscribers = /* @__PURE__ */ new Map();
      this.parents = [];
    }
    makeHeader({ cars }) {
      const toEncode = { cars };
      return format2(toEncode);
    }
    async createEventBlock(bytes) {
      const data = {
        dbMeta: bytes
      };
      const event = await EventBlock.create(
        data,
        this.parents
      );
      return event;
    }
    async decodeEventBlock(bytes) {
      const event = await decodeEventBlock(bytes);
      return event;
    }
    async decodeMetaBlocks(bytes) {
      const crdtEntry = JSON.parse(this.sthis.txt.decode(bytes));
      const eventBytes = decodeFromBase64(crdtEntry.data);
      const eventBlock = await this.decodeEventBlock(eventBytes);
      return {
        eventCid: eventBlock.cid,
        dbMeta: parse2(this.sthis.txt.decode(eventBlock.value.data.dbMeta))
      };
    }
    async handleByteHeads(byteHeads) {
      try {
        const dbMetas = await Promise.all(byteHeads.map((bytes) => this.decodeMetaBlocks(bytes)));
        return dbMetas;
      } catch (e) {
        throw this.logger.Error().Err(e).Msg("parseHeader").AsError();
      }
    }
    async load() {
      const branch = "main";
      this.logger.Debug().Str("branch", branch).Msg("loading");
      const url = await this.gateway.buildUrl(this.url(), branch);
      if (url.isErr()) {
        throw this.logger.Error().Result("buidUrl", url).Str("branch", branch).Msg("got error from gateway.buildUrl").AsError();
      }
      const bytes = await this.gateway.get(url.Ok());
      if (bytes.isErr()) {
        if (isNotFoundError(bytes)) {
          return void 0;
        }
        throw this.logger.Error().Url(url.Ok()).Result("bytes:", bytes).Msg("gateway get").AsError();
      }
      const dbMetas = await this.handleByteHeads([bytes.Ok()]);
      await this.loader?.handleDbMetasFromStore(dbMetas.map((m) => m.dbMeta));
      const cids = dbMetas.map((m) => m.eventCid);
      const uniqueParentsMap = new Map([...this.parents, ...cids].map((p) => [p.toString(), p]));
      this.parents = Array.from(uniqueParentsMap.values());
      return dbMetas.map((m) => m.dbMeta);
    }
    async encodeEventWithParents(event) {
      const base64String = encodeToBase64(event.bytes);
      const crdtEntry = {
        cid: event.cid.toString(),
        data: base64String,
        parents: this.parents.map((p) => p.toString())
      };
      return this.sthis.txt.encode(JSON.stringify(crdtEntry));
    }
    async save(meta, branch) {
      branch = branch || "main";
      this.logger.Debug().Str("branch", branch).Any("meta", meta).Msg("saving meta");
      const event = await this.createEventBlock(this.sthis.txt.encode(this.makeHeader(meta)));
      const bytes = await this.encodeEventWithParents(event);
      const url = await this.gateway.buildUrl(this.url(), branch);
      if (url.isErr()) {
        throw this.logger.Error().Err(url.Err()).Str("branch", branch).Msg("got error from gateway.buildUrl").AsError();
      }
      const res = await this.gateway.put(url.Ok(), bytes);
      if (res.isErr()) {
        throw this.logger.Error().Err(res.Err()).Msg("got error from gateway.put").AsError();
      }
      await this.loader?.handleDbMetasFromStore([meta]);
      this.parents = [event.cid];
      return res;
    }
    async close() {
      await this.gateway.close(this.url());
      this._onClosed.forEach((fn) => fn());
      return Result.Ok(void 0);
    }
    async destroy() {
      return this.gateway.destroy(this.url());
    }
  };
  var DataStoreImpl = class extends BaseStoreImpl {
    // readonly tag: string = "car-base";
    constructor(sthis, name7, url, opts) {
      super(
        name7,
        url,
        {
          ...opts
        },
        sthis,
        ensureLogger(sthis, "DataStoreImpl")
      );
      this.storeType = "data";
    }
    async load(cid) {
      this.logger.Debug().Any("cid", cid).Msg("loading");
      const url = await this.gateway.buildUrl(this.url(), cid.toString());
      if (url.isErr()) {
        throw this.logger.Error().Err(url.Err()).Str("cid", cid.toString()).Msg("got error from gateway.buildUrl").AsError();
      }
      const res = await this.gateway.get(url.Ok());
      if (res.isErr()) {
        throw res.Err();
      }
      return { cid, bytes: res.Ok() };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async save(car, opts) {
      this.logger.Debug().Any("cid", car.cid.toString()).Msg("saving");
      const url = await this.gateway.buildUrl(this.url(), car.cid.toString());
      if (url.isErr()) {
        throw this.logger.Error().Err(url.Err()).Ref("cid", car.cid).Msg("got error from gateway.buildUrl").AsError();
      }
      const res = await this.gateway.put(url.Ok(), car.bytes);
      if (res.isErr()) {
        throw this.logger.Error().Err(res.Err()).Msg("got error from gateway.put").AsError();
      }
      return res.Ok();
    }
    async remove(cid) {
      const url = await this.gateway.buildUrl(this.url(), cid.toString());
      if (url.isErr()) {
        return url;
      }
      return this.gateway.delete(url.Ok());
    }
    async close() {
      await this.gateway.close(this.url());
      this._onClosed.forEach((fn) => fn());
      return Result.Ok(void 0);
    }
    destroy() {
      return this.gateway.destroy(this.url());
    }
  };
  var WALStoreImpl = class extends BaseStoreImpl {
    constructor(loader, url, opts) {
      super(
        loader.name,
        url,
        {
          ...opts
        },
        loader.sthis,
        ensureLogger(loader.sthis, "WALStoreImpl")
      );
      this.storeType = "wal";
      this._ready = new ResolveOnce();
      this.walState = { operations: [], noLoaderOps: [], fileOperations: [] };
      this.processing = void 0;
      this.processQueue = new CommitQueue();
      this.ready = async () => {
        return this._ready.once(async () => {
          const walState = await this.load().catch((e) => {
            this.logger.Error().Any("error", e).Msg("error loading wal");
            return void 0;
          });
          if (!walState) {
            this.walState.operations = [];
            this.walState.fileOperations = [];
          } else {
            this.walState.operations = walState.operations || [];
            this.walState.fileOperations = walState.fileOperations || [];
          }
        });
      };
      this.loader = loader;
    }
    async enqueue(dbMeta, opts) {
      await this.ready();
      if (opts.noLoader) {
        this.walState.noLoaderOps.push(dbMeta);
      } else {
        this.walState.operations.push(dbMeta);
      }
      await this.save(this.walState);
      void this.process();
    }
    async enqueueFile(fileCid, publicFile = false) {
      await this.ready();
      this.walState.fileOperations.push({ cid: fileCid, public: publicFile });
    }
    async process() {
      await this.ready();
      if (!this.loader.remoteCarStore) return;
      await this.processQueue.enqueue(async () => {
        try {
          await this._doProcess();
        } catch (e) {
          this.logger.Error().Any("error", e).Msg("error processing wal");
        }
        if (this.walState.operations.length || this.walState.fileOperations.length || this.walState.noLoaderOps.length) {
          setTimeout(() => void this.process(), 0);
        }
      });
    }
    async _doProcess() {
      if (!this.loader.remoteCarStore) return;
      const rmlp = (async () => {
        const operations = [...this.walState.operations];
        const fileOperations = [...this.walState.fileOperations];
        const uploads = [];
        const noLoaderOps = [...this.walState.noLoaderOps];
        const limit = pLimit(5);
        if (operations.length + fileOperations.length + noLoaderOps.length === 0) return;
        for (const dbMeta of noLoaderOps) {
          const uploadP = limit(async () => {
            for (const cid of dbMeta.cars) {
              const car = await (await this.loader.carStore()).load(cid);
              if (!car) {
                if (carLogIncludesGroup(this.loader.carLog, dbMeta.cars))
                  throw this.logger.Error().Ref("cid", cid).Msg("missing local car").AsError();
              } else {
                await throwFalsy(this.loader.remoteCarStore).save(car);
              }
              this.walState.noLoaderOps = this.walState.noLoaderOps.filter((op) => op !== dbMeta);
            }
          });
          uploads.push(uploadP);
        }
        for (const dbMeta of operations) {
          const uploadP = limit(async () => {
            for (const cid of dbMeta.cars) {
              const car = await (await this.loader.carStore()).load(cid).catch(() => null);
              if (!car) {
                if (carLogIncludesGroup(this.loader.carLog, dbMeta.cars))
                  throw this.logger.Error().Ref("cid", cid).Msg(`missing local car`).AsError();
              } else {
                await throwFalsy(this.loader.remoteCarStore).save(car);
              }
            }
            this.walState.operations = this.walState.operations.filter((op) => op !== dbMeta);
          });
          uploads.push(uploadP);
        }
        if (fileOperations.length) {
          const dbLoader = this.loader;
          for (const { cid: fileCid, public: publicFile } of fileOperations) {
            const uploadP = limit(async () => {
              const fileBlock = await (await dbLoader.fileStore()).load(fileCid);
              await dbLoader.remoteFileStore?.save(fileBlock, { public: publicFile });
              this.walState.fileOperations = this.walState.fileOperations.filter((op) => op.cid !== fileCid);
            });
            uploads.push(uploadP);
          }
        }
        try {
          const res = await Promise.allSettled(uploads);
          const errors = res.filter((r) => r.status === "rejected");
          if (errors.length) {
            throw this.logger.Error().Any("errors", errors).Msg("error uploading").AsError();
          }
          if (operations.length) {
            const lastOp = operations[operations.length - 1];
            await this.loader.remoteMetaStore?.save(lastOp).catch((e) => {
              this.walState.operations.push(lastOp);
              throw this.logger.Error().Any("error", e).Msg("error saving remote meta").AsError();
            });
          }
        } finally {
          await this.save(this.walState);
        }
      })();
      await rmlp;
    }
    async load() {
      this.logger.Debug().Msg("loading");
      const filepath = await this.gateway.buildUrl(this.url(), "main");
      if (filepath.isErr()) {
        throw this.logger.Error().Err(filepath.Err()).Url(this.url()).Msg("error building url").AsError();
      }
      const bytes = await this.gateway.get(filepath.Ok());
      if (bytes.isErr()) {
        if (isNotFoundError(bytes)) {
          return void 0;
        }
        throw this.logger.Error().Err(bytes.Err()).Msg("error get").AsError();
      }
      try {
        return bytes && parse2(this.sthis.txt.decode(bytes.Ok()));
      } catch (e) {
        throw this.logger.Error().Err(e).Msg("error parse").AsError();
      }
    }
    async save(state) {
      const filepath = await this.gateway.buildUrl(this.url(), "main");
      if (filepath.isErr()) {
        throw this.logger.Error().Err(filepath.Err()).Url(this.url()).Msg("error building url").AsError();
      }
      let encoded;
      try {
        encoded = format2(state);
      } catch (e) {
        throw this.logger.Error().Err(e).Any("state", state).Msg("error format").AsError();
      }
      const res = await this.gateway.put(filepath.Ok(), this.sthis.txt.encode(encoded));
      if (res.isErr()) {
        throw this.logger.Error().Err(res.Err()).Str("filePath", filepath.Ok().toString()).Msg("error saving").AsError();
      }
    }
    async close() {
      await this.gateway.close(this.url());
      this._onClosed.forEach((fn) => fn());
      return Result.Ok(void 0);
    }
    destroy() {
      return this.gateway.destroy(this.url());
    }
  };
  function encodeToBase64(bytes) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let base643 = "";
    let i;
    for (i = 0; i < bytes.length - 2; i += 3) {
      base643 += chars[bytes[i] >> 2];
      base643 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
      base643 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
      base643 += chars[bytes[i + 2] & 63];
    }
    if (i < bytes.length) {
      base643 += chars[bytes[i] >> 2];
      if (i === bytes.length - 1) {
        base643 += chars[(bytes[i] & 3) << 4];
        base643 += "==";
      } else {
        base643 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base643 += chars[(bytes[i + 1] & 15) << 2];
        base643 += "=";
      }
    }
    return base643;
  }
  function decodeFromBase64(base643) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const bytes = new Uint8Array(base643.length * 3 / 4);
    let i;
    let j = 0;
    for (i = 0; i < base643.length; i += 4) {
      const a = chars.indexOf(base643[i]);
      const b = chars.indexOf(base643[i + 1]);
      const c = chars.indexOf(base643[i + 2]);
      const d = chars.indexOf(base643[i + 3]);
      bytes[j++] = a << 2 | b >> 4;
      if (base643[i + 2] !== "=") {
        bytes[j++] = (b & 15) << 4 | c >> 2;
      }
      if (base643[i + 3] !== "=") {
        bytes[j++] = (c & 3) << 6 | d;
      }
    }
    return bytes.slice(0, j);
  }

  // src/blockstore/store-factory.ts
  init_utils();
  function ensureIsIndex(url, isIndex) {
    if (isIndex) {
      return url.build().setParam("index", isIndex).URI();
    }
    return url.build().delParam("index").URI();
  }
  function ensureName(name7, url) {
    if (!url.hasParam("name")) {
      return url.build().setParam("name", name7).URI();
    }
    return url;
  }
  var storeFactory = /* @__PURE__ */ new Map();
  function buildURL(optURL, loader) {
    const storeOpts = loader.ebOpts.store;
    const obuItem = Array.from(storeFactory.values()).find((items) => items.overrideBaseURL);
    let obuUrl;
    if (obuItem && obuItem.overrideBaseURL) {
      obuUrl = URI.from(obuItem.overrideBaseURL);
    }
    const ret = ensureIsIndex(
      URI.from(optURL || obuUrl || dataDir(loader.sthis, loader.name, storeOpts.stores?.base)),
      storeOpts.isIndex
    );
    return ret;
  }
  var onceGateway = new KeyedResolvOnce();
  async function getGatewayFromURL(url, sthis) {
    return onceGateway.get(url.toString()).once(async () => {
      const item = storeFactory.get(url.protocol);
      if (item) {
        const ret = {
          gateway: await item.gateway(sthis),
          test: await item.test(sthis)
        };
        const res = await ret.gateway.start(url);
        if (res.isErr()) {
          sthis.logger.Error().Result("start", res).Msg("start failed");
          return void 0;
        }
        return ret;
      }
      sthis.logger.Warn().Url(url).Msg("unsupported protocol");
      return void 0;
    });
  }
  function registerStoreProtocol(item) {
    let protocol = item.protocol;
    if (!protocol.endsWith(":")) {
      protocol += ":";
    }
    if (storeFactory.has(protocol)) {
      if (!item.overrideBaseURL && storeFactory.get(protocol) !== item) {
        throw new Error(`we need a logger here`);
        return () => {
        };
      }
    }
    if (item.overrideBaseURL) {
      Array.from(storeFactory.values()).forEach((items) => {
        items.overrideBaseURL = void 0;
      });
    }
    storeFactory.set(protocol, item);
    return () => {
      storeFactory.delete(protocol);
    };
  }
  async function dataStoreFactory(loader) {
    const url = ensureName(loader.name, buildURL(loader.ebOpts.store.stores?.data, loader)).build().setParam("store", "data").URI();
    const sthis = ensureSuperLog(loader.sthis, "dataStoreFactory", { url: url.toString() });
    const gateway = await getGatewayFromURL(url, sthis);
    if (!gateway) {
      throw sthis.logger.Error().Url(url).Msg("gateway not found").AsError();
    }
    const store = new DataStoreImpl(sthis, loader.name, url, {
      gateway: gateway.gateway,
      keybag: () => getKeyBag(loader.sthis, {
        ...loader.ebOpts.keyBag
      })
    });
    return store;
  }
  async function metaStoreFactory(loader) {
    const url = ensureName(loader.name, buildURL(loader.ebOpts.store.stores?.meta, loader)).build().setParam("store", "meta").URI();
    const sthis = ensureSuperLog(loader.sthis, "metaStoreFactory", { url: () => url.toString() });
    sthis.logger.Debug().Str("protocol", url.protocol).Msg("pre-protocol switch");
    const gateway = await getGatewayFromURL(url, sthis);
    if (!gateway) {
      throw sthis.logger.Error().Url(url).Msg("gateway not found").AsError();
    }
    const store = new MetaStoreImpl(loader.sthis, loader.name, url, {
      gateway: gateway.gateway,
      keybag: () => getKeyBag(loader.sthis, {
        ...loader.ebOpts.keyBag
      })
    });
    return store;
  }
  async function remoteWalFactory(loader) {
    const url = ensureName(loader.name, buildURL(loader.ebOpts.store.stores?.wal, loader)).build().setParam("store", "wal").URI();
    const sthis = ensureSuperLog(loader.sthis, "remoteWalFactory", { url: url.toString() });
    const gateway = await getGatewayFromURL(url, sthis);
    if (!gateway) {
      throw sthis.logger.Error().Url(url).Msg("gateway not found").AsError();
    }
    sthis.logger.Debug().Str("prepared", url.toString()).Msg("produced");
    const store = new WALStoreImpl(loader, url, {
      gateway: gateway.gateway,
      keybag: () => getKeyBag(loader.sthis, {
        ...loader.ebOpts.keyBag
      })
    });
    return store;
  }
  async function testStoreFactory(url, sthis) {
    sthis = ensureSuperLog(sthis, "testStoreFactory");
    const gateway = await getGatewayFromURL(url, sthis);
    if (!gateway) {
      throw sthis.logger.Error().Url(url).Msg("gateway not found").AsError();
    }
    return gateway.test;
  }
  async function ensureStart(store, logger) {
    const ret = await store.start();
    if (ret.isErr()) {
      throw logger.Error().Result("start", ret).Msg("start failed").AsError();
    }
    logger.Debug().Url(ret.Ok(), "prepared").Msg("produced");
    return store;
  }
  function toStoreRuntime(opts, sthis) {
    const logger = ensureLogger(sthis, "toStoreRuntime", {});
    return {
      makeMetaStore: async (loader) => {
        logger.Debug().Str("fromOpts", "" + !!loader.ebOpts.store.makeMetaStore).Msg("makeMetaStore");
        return ensureStart(await (loader.ebOpts.store.makeMetaStore || metaStoreFactory)(loader), logger);
      },
      makeDataStore: async (loader) => {
        logger.Debug().Str("fromOpts", "" + !!loader.ebOpts.store.makeDataStore).Msg("makeDataStore");
        return ensureStart(await (loader.ebOpts.store.makeDataStore || dataStoreFactory)(loader), logger);
      },
      makeWALStore: async (loader) => {
        logger.Debug().Str("fromOpts", "" + !!loader.ebOpts.store.makeWALStore).Msg("makeRemoteWAL");
        return ensureStart(await (loader.ebOpts.store.makeWALStore || remoteWalFactory)(loader), logger);
      },
      encodeFile: opts.encodeFile || encodeFile2,
      decodeFile: opts.decodeFile || decodeFile
    };
  }
  registerStoreProtocol({
    protocol: "file:",
    gateway: async (sthis) => {
      const { FileGateway } = await Promise.resolve().then(() => __toESM(require_bundle_not_impl(), 1));
      return new FileGateway(sthis);
    },
    test: async (sthis) => {
      const { FileTestStore } = await Promise.resolve().then(() => __toESM(require_bundle_not_impl(), 1));
      return new FileTestStore(sthis);
    }
  });
  registerStoreProtocol({
    protocol: "indexdb:",
    gateway: async (sthis) => {
      const { IndexDBGateway: IndexDBGateway2 } = await Promise.resolve().then(() => (init_gateway(), gateway_exports));
      return new IndexDBGateway2(sthis);
    },
    test: async (sthis) => {
      const { IndexDBTestStore: IndexDBTestStore2 } = await Promise.resolve().then(() => (init_gateway(), gateway_exports));
      return new IndexDBTestStore2(sthis);
    }
  });

  // src/blockstore/task-manager.ts
  init_utils();
  var TaskManager = class {
    constructor(loader) {
      this.eventsWeHandled = /* @__PURE__ */ new Set();
      this.queue = [];
      this.isProcessing = false;
      this.loader = loader;
      this.logger = ensureLogger(loader.sthis, "TaskManager");
    }
    async handleEvent(eventBlock) {
      const cid = eventBlock.cid.toString();
      const parents = eventBlock.value.parents.map((cid2) => cid2.toString());
      for (const parent of parents) {
        this.eventsWeHandled.add(parent);
      }
      this.queue.push({ cid, eventBlock, retries: 0 });
      this.queue = this.queue.filter(({ cid: cid2 }) => !this.eventsWeHandled.has(cid2));
      void this.processQueue();
    }
    async processQueue() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      const filteredQueue = this.queue.filter(({ cid }) => !this.eventsWeHandled.has(cid));
      const first = filteredQueue[0];
      if (!first) {
        return;
      }
      try {
        if (this.loader.remoteMetaStore) {
          const eventData = await this.loader.remoteMetaStore.handleByteHeads([first.eventBlock.value.data.dbMeta]);
          await this.loader.handleDbMetasFromStore(eventData.map((m) => m.dbMeta));
        }
        this.eventsWeHandled.add(first.cid);
        this.queue = this.queue.filter(({ cid }) => !this.eventsWeHandled.has(cid));
      } catch (err) {
        if (first.retries++ > 3) {
          this.logger.Error().Str("cid", first.cid).Msg("failed to process event block after 3 retries");
          this.queue = this.queue.filter(({ cid }) => cid !== first.cid);
        }
        await new Promise((resolve7) => setTimeout(resolve7, 50));
        throw this.logger.Error().Err(err).Msg("failed to process event block").AsError();
      } finally {
        this.isProcessing = false;
        if (this.queue.length > 0) {
          void this.processQueue();
        }
      }
    }
  };

  // src/blockstore/store-remote.ts
  async function RemoteDataStore(sthis, name7, url, opts) {
    const ds = new DataStoreImpl(sthis, name7, url, opts);
    await ds.start();
    return ds;
  }
  async function RemoteMetaStore(sthis, name7, url, opts) {
    const ms = new MetaStoreImpl(sthis, name7, url, opts);
    await ms.start();
    return ms;
  }

  // src/blockstore/connection-base.ts
  var ConnectionBase = class {
    constructor(url, logger) {
      // can probably remove
      this.loaded = Promise.resolve();
      this.logger = logger;
      this.url = url;
    }
    async refresh() {
      await throwFalsy(throwFalsy(this.loader).remoteMetaStore).load();
      await (await throwFalsy(this.loader).WALStore()).process();
    }
    async connect_X({ loader }) {
      if (!loader) throw this.logger.Error().Msg("loader is required").AsError();
      await this.connectMeta_X({ loader });
      await this.connectStorage_X({ loader });
    }
    async connectMeta_X({ loader }) {
      if (!loader) throw this.logger.Error().Msg("connectMeta_X: loader is required").AsError();
      this.loader = loader;
      this.taskManager = new TaskManager(loader);
      await this.onConnect();
      const metaUrl = this.url.build().defParam("store", "meta").URI();
      const gateway = await getGatewayFromURL(metaUrl, this.loader.sthis);
      if (!gateway) throw this.logger.Error().Url(metaUrl).Msg("connectMeta_X: gateway is required").AsError();
      const name7 = metaUrl.toString();
      const remote = await RemoteMetaStore(loader.sthis, name7, metaUrl, {
        gateway: gateway.gateway,
        keybag: () => getKeyBag(loader.sthis, loader.ebOpts.keyBag),
        loader
      });
      this.loader.remoteMetaStore = remote;
      this.loaded = this.loader.ready().then(async () => {
        remote.load().then(async () => {
          (await throwFalsy(this.loader).WALStore()).process();
        });
      });
    }
    async connectStorage_X({ loader }) {
      if (!loader) throw this.logger.Error().Msg("connectStorage_X: loader is required").AsError();
      this.loader = loader;
      const dataUrl = this.url.build().defParam("store", "data").URI();
      const gateway = await getGatewayFromURL(dataUrl, this.loader.sthis);
      if (!gateway) throw this.logger.Error().Url(dataUrl).Msg("connectStorage_X: gateway is required").AsError();
      const name7 = dataUrl.toString();
      loader.remoteCarStore = await RemoteDataStore(loader.sthis, name7, this.url, {
        gateway: gateway.gateway,
        keybag: () => getKeyBag(loader.sthis, this.loader?.ebOpts.keyBag)
      });
      loader.remoteFileStore = loader.remoteCarStore;
    }
    // move this stuff to connect
    // async getDashboardURL(compact = true) {
    //   const baseUrl = 'https://dashboard.fireproof.storage/'
    //   if (!this.loader?.remoteCarStore) return new URL('/howto', baseUrl)
    //   // if (compact) {
    //   //   await this.compact()
    //   // }
    //   const currents = await this.loader?.metaStore?.load()
    //   if (!currents) throw new Error("Can't sync empty database: save data first")
    //   if (currents.length > 1)
    //     throw new Error("Can't sync database with split heads: make an update first")
    //   const current = currents[0]
    //   const params = {
    //     car: current.car.toString()
    //   }
    //   if (current.key) {
    //     // @ts-ignore
    //     params.key = current.key.toString()
    //   }
    //   // @ts-ignore
    //   if (this.name) {
    //     // @ts-ignore
    //     params.name = this.name
    //   }
    //   const url = new URL('/import#' + new URLSearchParams(params).toString(), baseUrl)
    //   console.log('Import to dashboard: ' + url.toString())
    //   return url
    // }
    // openDashboard() {
    //   void this.getDashboardURL().then(url => {
    //     if (url) window.open(url.toString(), '_blank')
    //   })
    // }
  };

  // src/crdt-helpers.ts
  function time(tag2) {
  }
  function timeEnd(tag2) {
  }
  function toString4(key, logger) {
    switch (typeof key) {
      case "string":
      case "number":
        return key.toString();
      default:
        throw logger.Error().Msg("Invalid key type").AsError();
    }
  }
  async function applyBulkUpdateToCrdt(store, tblocks, head, updates, logger) {
    let result = null;
    if (updates.length > 1) {
      const batch2 = await create6(tblocks, head);
      for (const update2 of updates) {
        const link2 = await writeDocContent(store, tblocks, update2, logger);
        await batch2.put(toString4(update2.id, logger), link2);
      }
      result = await batch2.commit();
    } else if (updates.length === 1) {
      const link2 = await writeDocContent(store, tblocks, updates[0], logger);
      result = await put3(tblocks, head, toString4(updates[0].id, logger), link2);
    }
    if (!result) throw logger.Error().Uint64("updates.len", updates.length).Msg("Missing result").AsError();
    if (result.event) {
      for (const { cid, bytes } of [
        ...result.additions,
        // ...result.removals,
        result.event
      ]) {
        tblocks.putSync(cid, bytes);
      }
    }
    return { head: result.head };
  }
  async function writeDocContent(store, blocks, update2, logger) {
    let value;
    if (update2.del) {
      value = { del: true };
    } else {
      if (!update2.value) throw logger.Error().Msg("Missing value").AsError();
      await processFiles(store, blocks, update2.value, logger);
      value = { doc: update2.value };
    }
    const block = await encode4({ value, hasher: sha256, codec: src_exports });
    blocks.putSync(block.cid, block.bytes);
    return block.cid;
  }
  async function processFiles(store, blocks, doc, logger) {
    if (doc._files) {
      await processFileset(logger, store, blocks, doc._files);
    }
    if (doc._publicFiles) {
      await processFileset(
        logger,
        store,
        blocks,
        doc._publicFiles
        /*, true*/
      );
    }
  }
  async function processFileset(logger, store, blocks, files) {
    const dbBlockstore = blocks.parent;
    if (!dbBlockstore.loader) throw logger.Error().Msg("Missing loader, database name is required").AsError();
    const t = new CarTransaction(dbBlockstore);
    const didPut = [];
    for (const filename in files) {
      if (File === files[filename].constructor) {
        const file = files[filename];
        const { cid, blocks: fileBlocks } = await store.encodeFile(file);
        didPut.push(filename);
        for (const block of fileBlocks) {
          t.putSync(block.cid, block.bytes);
        }
        files[filename] = { cid, type: file.type, size: file.size };
      } else {
        const { cid, type: type2, size, car } = files[filename];
        if (cid && type2 && size && car) {
          files[filename] = { cid, type: type2, size, car };
        }
      }
    }
    if (didPut.length) {
      const car = await dbBlockstore.loader.commitFiles(
        t,
        { files }
      );
      if (car) {
        for (const name7 of didPut) {
          files[name7] = { car, ...files[name7] };
        }
      }
    }
  }
  async function getValueFromCrdt(blocks, head, key, logger) {
    if (!head.length) throw logger.Debug().Msg("Getting from an empty database").AsError();
    const link2 = await get3(blocks, head, key);
    if (!link2) throw logger.Error().Str("key", key).Msg(`Missing key`).AsError();
    return await getValueFromLink(blocks, link2, logger);
  }
  function readFiles(blocks, { doc }) {
    if (!doc) return;
    if (doc._files) {
      readFileset(blocks, doc._files);
    }
    if (doc._publicFiles) {
      readFileset(blocks, doc._publicFiles, true);
    }
  }
  function readFileset(blocks, files, isPublic = false) {
    for (const filename in files) {
      const fileMeta = files[filename];
      if (fileMeta.cid) {
        if (isPublic) {
          fileMeta.url = `https://${fileMeta.cid.toString()}.ipfs.w3s.link/`;
        }
        if (fileMeta.car) {
          fileMeta.file = async () => await blocks.ebOpts.storeRuntime.decodeFile(
            {
              get: async (cid) => {
                return await blocks.getFile(throwFalsy(fileMeta.car), cid);
              }
            },
            fileMeta.cid,
            fileMeta
          );
        }
      }
      files[filename] = fileMeta;
    }
  }
  async function getValueFromLink(blocks, link2, logger) {
    const block = await blocks.get(link2);
    if (!block) throw logger.Error().Str("link", link2.toString()).Msg(`Missing linked block`).AsError();
    const { value } = await decode6({ bytes: block.bytes, hasher: sha256, codec: src_exports });
    const cvalue = {
      ...value,
      cid: link2
    };
    readFiles(blocks, cvalue);
    return cvalue;
  }
  var DirtyEventFetcher = class extends EventFetcher {
    constructor(logger, blocks) {
      super(blocks);
      this.logger = logger;
    }
    async get(link2) {
      try {
        return super.get(link2);
      } catch (e) {
        this.logger.Error().Ref("link", link2.toString()).Err(e).Msg("Missing event");
        return { value: void 0 };
      }
    }
  };
  async function clockChangesSince(blocks, head, since, opts, logger) {
    const eventsFetcher = opts.dirty ? new DirtyEventFetcher(logger, blocks) : new EventFetcher(blocks);
    const keys = /* @__PURE__ */ new Set();
    const updates = await gatherUpdates(
      blocks,
      eventsFetcher,
      head,
      since,
      [],
      keys,
      /* @__PURE__ */ new Set(),
      opts.limit || Infinity,
      logger
    );
    return { result: updates.reverse(), head };
  }
  async function gatherUpdates(blocks, eventsFetcher, head, since, updates = [], keys, didLinks, limit, logger) {
    if (limit <= 0) return updates;
    const sHead = head.map((l) => l.toString());
    for (const link2 of since) {
      if (sHead.includes(link2.toString())) {
        return updates;
      }
    }
    for (const link2 of head) {
      if (didLinks.has(link2.toString())) continue;
      didLinks.add(link2.toString());
      const { value: event } = await eventsFetcher.get(link2);
      if (!event) continue;
      const { type: type2 } = event.data;
      let ops = [];
      if (type2 === "batch") {
        ops = event.data.ops;
      } else if (type2 === "put") {
        ops = [event.data];
      }
      for (let i = ops.length - 1; i >= 0; i--) {
        const { key, value } = ops[i];
        if (!keys.has(key)) {
          const docValue = await getValueFromLink(blocks, value, logger);
          updates.push({ id: key, value: docValue.doc, del: docValue.del, clock: link2 });
          limit--;
          keys.add(key);
        }
      }
      if (event.parents) {
        updates = await gatherUpdates(blocks, eventsFetcher, event.parents, since, updates, keys, didLinks, limit, logger);
      }
    }
    return updates;
  }
  async function* getAllEntries(blocks, head, logger) {
    for await (const [key, link2] of entries2(blocks, head)) {
      const docValue = await getValueFromLink(blocks, link2, logger);
      yield { id: key, value: docValue.doc, del: docValue.del };
    }
  }
  async function* clockVis(blocks, head) {
    for await (const line of vis(blocks, head)) {
      yield line;
    }
  }
  var isCompacting = false;
  async function doCompact(blockLog, head, logger) {
    if (isCompacting) {
      return;
    }
    isCompacting = true;
    time("compact head");
    for (const cid of head) {
      const bl = await blockLog.get(cid);
      if (!bl) throw logger.Error().Ref("cid", cid).Msg("Missing head block").AsError();
    }
    timeEnd("compact head");
    time("compact all entries");
    for await (const _entry of getAllEntries(blockLog, head, logger)) {
      continue;
    }
    timeEnd("compact all entries");
    time("compact clock vis");
    for await (const _line of vis(blockLog, head)) {
    }
    timeEnd("compact clock vis");
    time("compact root");
    const result = await root(blockLog, head);
    timeEnd("compact root");
    time("compact root blocks");
    for (const { cid, bytes } of [...result.additions, ...result.removals]) {
      blockLog.loggedBlocks.putSync(cid, bytes);
    }
    timeEnd("compact root blocks");
    time("compact changes");
    await clockChangesSince(blockLog, head, [], {}, logger);
    timeEnd("compact changes");
    isCompacting = false;
  }
  async function getBlock(blocks, cidString) {
    const block = await blocks.get(parse(cidString));
    if (!block) throw new Error(`Missing block ${cidString}`);
    const { cid, value } = await decode6({ bytes: block.bytes, codec: src_exports, hasher: sha256 });
    return new Block2({ cid, value, bytes: block.bytes });
  }

  // src/indexer-helpers.ts
  var import_charwise = __toESM(require_charwise(), 1);

  // node_modules/.pnpm/prolly-trees@1.0.4/node_modules/prolly-trees/esm/src/utils.js
  var readUInt32LE = (buffer2) => {
    const offset = buffer2.byteLength - 4;
    return (buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16) + buffer2[offset + 3] * 16777216;
  };
  var MAX_UINT32 = 4294967295;
  var bf = (factor) => {
    const threshold = Math.floor(MAX_UINT32 / factor);
    return async (entry) => {
      const identity5 = await entry.identity();
      if (typeof identity5 !== "number") {
        throw new Error("Identity must be a number");
      }
      if (identity5 <= threshold) {
        return true;
      }
      return false;
    };
  };
  var simpleCompare = (a, b) => {
    if (a === b)
      return 0;
    if (a > b)
      return 1;
    return -1;
  };
  var CIDCounter = class {
    constructor() {
      this._cids = /* @__PURE__ */ new Set();
    }
    add(node) {
      if (!node.address) {
        throw new Error("Cannot add node without address");
      }
      if (node.address.then) {
        const p = node.address.then((cid) => this._cids.add(cid.toString()));
        this._cids.add(p);
        p.then(() => this._cids.delete(p));
      } else {
        this._cids.add(node.address.toString());
      }
    }
    async all() {
      await Promise.all([...this._cids]);
      return this._cids;
    }
  };

  // node_modules/.pnpm/prolly-trees@1.0.4/node_modules/prolly-trees/esm/src/base.js
  var Entry = class {
    constructor({ key, address }, opts = {}) {
      this.key = key;
      this.address = address;
      this.codec = opts.codec;
      this.hasher = opts.hasher;
    }
    get isEntry() {
      return true;
    }
  };
  var EntryList = class {
    constructor({ entries: entries3, closed }) {
      if (typeof closed !== "boolean")
        throw new Error('Missing required argument "closed"');
      this.entries = entries3;
      this.closed = closed;
      this.startKey = entries3[0].key;
    }
    find(key, compare4) {
      const { entries: entries3 } = this;
      for (let i = entries3.length - 1; i > -1; i--) {
        const entry = entries3[i];
        const comp = compare4(key, entry.key);
        if (comp > -1) {
          return [
            i,
            entry
          ];
        }
      }
      return null;
    }
    findMany(keys, compare4, sorted = false, strict = false) {
      const { entries: entries3 } = this;
      const results = /* @__PURE__ */ new Map();
      if (!sorted) {
        keys = keys.sort(compare4);
      } else {
        keys = [...keys];
      }
      for (let i = entries3.length - 1; i > -1; i--) {
        if (!keys.length)
          break;
        const entry = entries3[i];
        const found = [];
        while (keys.length) {
          let key = keys[keys.length - 1];
          key = key.key ? key.key : key;
          const comp = compare4(key, entry.key);
          if (!strict) {
            if (comp > -1) {
              found.push(keys.pop());
            } else {
              break;
            }
          } else {
            if (comp === 0) {
              found.push(keys.pop());
            } else if (comp > 0) {
              keys.pop();
            } else {
              break;
            }
          }
        }
        if (found.length) {
          results.set(i, [
            entry,
            found
          ]);
        }
      }
      return results;
    }
    findRange(start, end, compare4) {
      const { entries: entries3 } = this;
      let last2;
      let first = 0;
      for (let i = entries3.length - 1; i > -1; i--) {
        const entry = entries3[i];
        const comp = compare4(end, entry.key);
        if (comp > 0) {
          last2 = i;
          break;
        }
      }
      for (let i = 0; i < entries3.length; i++) {
        const entry = entries3[i];
        const comp = compare4(start, entry.key);
        if (comp === 0) {
          first = i;
          break;
        } else if (comp < 0) {
          break;
        }
        first = i;
      }
      return {
        first,
        last: last2,
        entries: entries3.slice(first, last2 + 1)
      };
    }
  };
  var stringKey = (key) => typeof key === "string" ? key : JSON.stringify(key);
  function sortBulk(bulk, opts) {
    return bulk.sort(({ key: a }, { key: b }) => opts.compare(a, b));
  }
  async function filterLeftmostInserts(first, bulk, compare4) {
    const inserts = [];
    for (const b of bulk) {
      const { key, del: del2 } = b;
      if (compare4(key, first) < 0) {
        if (!del2)
          inserts.push(b);
      } else {
        break;
      }
    }
    return inserts;
  }
  async function generateNewLeaves(inserts, opts, { chunker, compare: compare4 }) {
    return await Node3.from({
      entries: inserts.map((insert) => new opts.LeafEntryClass(insert, opts)).sort((a, b) => compare4(a.key, b.key)),
      chunker,
      NodeClass: opts.LeafClass,
      distance: 0,
      opts
    });
  }
  async function generateBranchEntries(that, newLeaves, results, opts) {
    return await Promise.all(newLeaves.map(async (node) => {
      const block = await node.encode();
      results.blocks.push({
        block,
        node
      });
      that.cache.set(node);
      const newBranchEntry = new opts.BranchEntryClass({
        key: node.key,
        address: await node.address
      }, opts);
      return newBranchEntry;
    }));
  }
  async function processRoot(that, results, bulk, nodeOptions) {
    const root2 = results.root;
    results.blocks.push({
      block: await root2.encode(),
      node: root2
    });
    that.cache.set(root2);
    const opts = nodeOptions.opts;
    const distance = root2.distance;
    const first = root2.entryList.startKey;
    const inserts = await filterLeftmostInserts(first, bulk, that.compare);
    if (inserts.length) {
      const newLeaves = await generateNewLeaves(inserts, opts, that);
      const branchEntries = await generateBranchEntries(that, newLeaves, results, opts);
      const firstRootEntry = new opts.BranchEntryClass({
        key: root2.entryList.startKey,
        address: await root2.address
      }, opts);
      const newBranchEntries = [
        firstRootEntry,
        ...branchEntries
      ].sort(({ key: a }, { key: b }) => opts.compare(a, b));
      let newBranches = await Node3.from({
        ...nodeOptions,
        entries: newBranchEntries,
        chunker: that.chunker,
        NodeClass: opts.BranchClass,
        distance: distance + 1
      });
      let allBranches = [...newBranches];
      while (newBranches.length > 1) {
        const newBranchEntries2 = await Promise.all(newBranches.map(async (l) => new opts.BranchEntryClass({
          key: l.key,
          address: await l.address
        }, opts)));
        newBranches = await Node3.from({
          ...nodeOptions,
          entries: newBranchEntries2.sort(({ key: a }, { key: b }) => opts.compare(a, b)),
          chunker: that.chunker,
          NodeClass: opts.BranchClass,
          distance: distance + 1
        });
        allBranches = [
          ...allBranches,
          ...newBranches
        ];
      }
      await Promise.all(allBranches.map(async (m) => {
        const block = await m.encode();
        that.cache.set(m);
        results.blocks.push({
          block,
          node: m
        });
      }));
      results.root = newBranches[0];
      results.nodes = [
        ...results.nodes,
        ...allBranches
      ];
    }
  }
  var Node3 = class _Node {
    constructor({ entryList, chunker, distance, getNode, compare: compare4, cache: cache3 }) {
      this.entryList = entryList;
      this.chunker = chunker;
      this.distance = distance;
      this.getNode = getNode;
      this.compare = compare4;
      this.cache = cache3;
    }
    get closed() {
      return this.entryList.closed;
    }
    get key() {
      return this.entryList.startKey;
    }
    async getEntry(key, cids = new CIDCounter()) {
      const result = await this._getEntry(key, cids);
      return {
        result,
        cids
      };
    }
    async _getEntry(key, cids) {
      cids.add(this);
      let node = this;
      while (!node.isLeaf) {
        const result2 = node.entryList.find(key, this.compare);
        if (result2 === null)
          throw new Error("Not found");
        const [, entry2] = result2;
        node = await this.getNode(await entry2.address);
        cids.add(node);
      }
      const result = node.entryList.find(key, this.compare);
      if (result === null || result[1].key.toString() !== key.toString())
        throw new Error("Not found");
      const [, entry] = result;
      return entry;
    }
    async getAllEntries(cids = new CIDCounter()) {
      const result = await this._getAllEntries(cids);
      return {
        result,
        cids
      };
    }
    _getAllEntries(cids) {
      cids.add(this);
      if (this.isLeaf) {
        return this.entryList.entries;
      } else {
        const { entries: entries3 } = this.entryList;
        const mapper = async (entry) => this.getNode(await entry.address).then((node) => node._getAllEntries(cids)).catch(async (err) => {
          throw err;
        });
        return Promise.all(entries3.map(mapper)).then((results) => results.flat());
      }
    }
    async *vis(cids = /* @__PURE__ */ new Set()) {
      const renderNodeLabel = async (node) => {
        if (node.isLeaf) {
          const entries3 = node.entryList.entries.map((e) => `[${e.key},${JSON.stringify(e.value).replace(/"/g, "'")}]`).join(", ");
          return `Leaf [${entries3}]`;
        } else {
          const entries3 = node.entryList.entries.map((e) => `[${e.key}]`).join(", ");
          return `Branch [${entries3}]`;
        }
      };
      const shortCid = (cid) => cid.toString().slice(0, 4) + cid.toString().slice(-4);
      const visit = async function* (node, parentId, cids2) {
        const nodeId = await node.address;
        if (!cids2.has(nodeId)) {
          cids2.add(nodeId);
          const nodeLabel = await renderNodeLabel(node);
          yield `  node [shape=ellipse fontname="Courier"]; ${shortCid(nodeId)} [label="${nodeLabel}"];`;
          yield `  ${shortCid(parentId)} -> ${shortCid(nodeId)};`;
          for (const entry of node.entryList.entries) {
            if (entry.address) {
              const entryId = await entry.address;
              try {
                const childNode = await node.getNode(entryId);
                yield* await visit(childNode, nodeId, cids2);
              } catch (err) {
                yield `  ${shortCid(nodeId)} -> ${shortCid(entryId)};`;
                yield `  node [shape=ellipse fontname="Courier"]; ${shortCid(entryId)} [label="Error: ${err.message}"];`;
              }
            }
          }
        }
      };
      yield "digraph tree {";
      yield '  node [shape=ellipse fontname="Courier"]; rootnode;';
      for await (const line of visit(this, "rootnode", cids)) {
        yield line;
      }
      yield "}";
    }
    async getEntries(keys, sorted = false, cids = new CIDCounter()) {
      const result = await this._getEntries(keys, sorted, cids);
      return {
        result,
        cids
      };
    }
    async _getEntries(keys, sorted, cids) {
      cids.add(this);
      if (!sorted)
        keys = keys.sort(this.compare);
      const results = this.entryList.findMany(keys, this.compare, true, this.isLeaf);
      if (this.isLeaf) {
        return [...results.values()].map(([entry]) => entry);
      }
      let entries3 = [];
      for (const [entry, keys2] of [...results.values()].reverse()) {
        const p = this.getNode(await entry.address);
        entries3.push(p.then((node) => node._getEntries(keys2.reverse(), true, cids)));
      }
      entries3 = await Promise.all(entries3);
      return entries3.flat();
    }
    async getRangeEntries(start, end, cids = new CIDCounter()) {
      const result = await this._getRangeEntries(start, end, cids);
      return {
        result,
        cids
      };
    }
    _getRangeEntries(start, end, cids) {
      cids.add(this);
      const { entries: entries3 } = this.entryList.findRange(start, end, this.compare);
      if (this.isLeaf) {
        return entries3.filter((entry) => {
          const s = this.compare(start, entry.key);
          const e = this.compare(end, entry.key);
          if (s <= 0 && e >= 0)
            return true;
          return false;
        });
      }
      if (!entries3.length)
        return [];
      const thenRange = async (entry) => this.getNode(await entry.address).then((node) => node._getRangeEntries(start, end, cids));
      const results = [thenRange(entries3.shift())];
      if (!entries3.length)
        return results[0];
      const last2 = thenRange(entries3.pop());
      while (entries3.length) {
        const thenAll = async (entry) => this.getNode(await entry.address).then(async (node) => node._getAllEntries(cids));
        results.push(thenAll(entries3.shift()));
      }
      results.push(last2);
      return Promise.all(results).then((results2) => results2.flat());
    }
    async transaction(bulk, opts = {}) {
      opts = {
        codec: this.codec,
        hasher: this.hasher,
        getNode: this.getNode,
        compare: this.compare,
        cache: this.cache,
        ...opts
      };
      const nodeOptions = {
        chunker: this.chunker,
        opts
      };
      const results = this.entryList.findMany(bulk, opts.compare, true, this.isLeaf);
      if (this.isLeaf) {
        return await this.transactionLeaf(bulk, opts, nodeOptions, results);
      } else {
        return await this.transactionBranch(bulk, opts, nodeOptions, results);
      }
    }
    async transactionLeaf(bulk, opts, nodeOptions, results) {
      const { LeafClass: LeafClass2, LeafEntryClass } = opts;
      const { entries: entries3, previous } = this.processLeafEntries(bulk, results, LeafEntryClass, opts);
      const _opts = {
        ...nodeOptions,
        entries: entries3,
        NodeClass: LeafClass2,
        distance: 0
      };
      const nodes = await _Node.from(_opts);
      return {
        nodes,
        previous,
        blocks: await Promise.all(nodes.map(async (n) => {
          const block = await n.encode();
          this.cache.set(n);
          return {
            block,
            node: n
          };
        })),
        distance: 0
      };
    }
    processLeafEntries(bulk, results, LeafEntryClass, opts) {
      const previous = [];
      let entries3 = [];
      const changes = {};
      const deletes = /* @__PURE__ */ new Map();
      for (const { key, del: del2, value } of bulk) {
        const skey = stringKey(key);
        if (del2) {
          if (typeof changes[skey] === "undefined")
            deletes.set(skey, null);
        } else {
          changes[skey] = {
            key,
            value
          };
          deletes.delete(skey);
        }
      }
      entries3 = [...this.entryList.entries];
      for (const [i, [entry]] of results) {
        previous.push(entry);
        const skey = stringKey(entry.key);
        if (deletes.has(skey)) {
          deletes.set(skey, i);
        } else {
          entries3[i] = new LeafEntryClass(changes[skey], opts);
          delete changes[skey];
        }
      }
      let count = 0;
      for (const [, i] of deletes) {
        if (i !== null)
          entries3.splice(i - count++, 1);
      }
      const appends = Object.values(changes).map((obj) => new LeafEntryClass(obj, opts));
      entries3 = entries3.concat(appends).sort(({ key: a }, { key: b }) => opts.compare(a, b));
      return {
        entries: entries3,
        previous
      };
    }
    async transactionBranch(bulk, opts, nodeOptions, results) {
      const { BranchClass: BranchClass2, BranchEntryClass } = opts;
      let distance = 0;
      for (const [i, [entry, keys]] of results) {
        const p = this.getNode(await entry.address).then((node) => node.transaction(keys.reverse(), {
          ...opts,
          sorted: true
        })).then((r) => ({
          entry,
          keys,
          distance,
          ...r
        }));
        results.set(i, p);
      }
      let entries3 = [...this.entryList.entries];
      const final = {
        previous: [],
        blocks: [],
        nodes: []
      };
      for (const [i, p] of results) {
        const {
          nodes,
          previous,
          blocks,
          distance: _distance
        } = await p;
        distance = _distance;
        entries3[i] = nodes;
        if (previous.length)
          final.previous = final.previous.concat(previous);
        if (blocks.length)
          final.blocks = final.blocks.concat(blocks);
        if (nodes.length)
          final.nodes = final.nodes.concat(nodes);
      }
      entries3 = entries3.flat();
      const newEntries = await this.handlePrepend(entries3, opts, nodeOptions, final, distance);
      distance++;
      const toEntry = async (branch) => {
        if (branch.isEntry)
          return branch;
        const block = await branch.encode();
        final.blocks.push({
          block,
          node: branch
        });
        this.cache.set(branch);
        return new BranchEntryClass(branch, opts);
      };
      entries3 = await Promise.all(newEntries.map(toEntry));
      const _opts = {
        ...nodeOptions,
        entries: entries3,
        NodeClass: BranchClass2,
        distance
      };
      const newNodes = await _Node.from(_opts);
      await Promise.all(newNodes.map(async (n) => {
        const block = await n.encode();
        final.blocks.push({
          block,
          node: n
        });
        this.cache.set(n);
      }));
      final.nodes = newNodes;
      return {
        ...final,
        distance
      };
    }
    async handlePrepend(entries3, opts, nodeOptions, final, distance) {
      const { BranchClass: BranchClass2, LeafClass: LeafClass2 } = opts;
      let newEntries = [];
      let prepend = null;
      for (const entry of entries3) {
        if (prepend) {
          const mergeEntries = await this.mergeFirstLeftEntries(entry, prepend, nodeOptions, final, distance);
          prepend = null;
          const NodeClass = !mergeEntries[0].address ? LeafClass2 : BranchClass2;
          const _opts = {
            ...nodeOptions,
            entries: mergeEntries.sort(({ key: a }, { key: b }) => opts.compare(a, b)),
            NodeClass,
            distance
          };
          const nodes = await _Node.from(_opts);
          if (!nodes[nodes.length - 1].closed) {
            prepend = nodes.pop();
          }
          if (nodes.length) {
            newEntries = newEntries.concat(nodes);
          }
        } else {
          if (!entry.isEntry && !entry.closed) {
            prepend = entry;
          } else {
            newEntries.push(entry);
          }
        }
      }
      if (prepend) {
        newEntries.push(prepend);
      }
      return newEntries;
    }
    async getNodeFirstFromBlocks(blocks, addr) {
      for (const { block, node } of blocks) {
        if (await block.cid === addr)
          return node;
      }
      return await this.getNode(addr);
    }
    async mergeFirstLeftEntries(entry, prepend, nodeOptions, final, distance) {
      const opts = nodeOptions.opts;
      const { LeafClass: LeafClass2, BranchClass: BranchClass2, BranchEntryClass } = opts;
      if (entry.isEntry) {
        const addr = await entry.address;
        entry = await this.getNodeFirstFromBlocks(final.blocks, addr);
      }
      const es = entry.entryList.entries;
      if (!es.length)
        throw new Error("unreachable no entries");
      const basicMerge = (entries1, entries22) => {
        return entries1.concat(entries22);
      };
      const processNodesAndCreateEntries = async (nodes, final2, opts2) => {
        return await Promise.all(nodes.map(async (l) => {
          final2.blocks.push({
            block: await l.encode(),
            node: l
          });
          this.cache.set(l);
          return new BranchEntryClass({
            key: l.key,
            address: await l.address
          }, opts2);
        }));
      };
      if (es[0].constructor.name === prepend.entryList.entries[0].constructor.name) {
        return await basicMerge(prepend.entryList.entries, es);
      } else {
        const leftEntry = es.shift();
        if (!leftEntry)
          throw new Error("unreachable no left entry");
        if (!leftEntry.address)
          throw new Error("unreachable existing leaf, no leftEntry.address");
        const mergeLeftEntries = await this.mergeFirstLeftEntries(leftEntry, prepend, nodeOptions, final, distance - 1);
        const esf = es.shift();
        if (!esf) {
          return mergeLeftEntries;
        }
        if (!esf.address)
          throw new Error("unreachable existing leaf, no esf.address");
        const oldFront = await this.getNodeFirstFromBlocks(final.blocks, await esf.address);
        if (!oldFront.entryList.entries[0].address) {
          const leftLeafEntries = await basicMerge(mergeLeftEntries, oldFront.entryList.entries);
          const leftLeafNodes = await _Node.from({
            ...nodeOptions,
            entries: leftLeafEntries.sort(({ key: a }, { key: b }) => opts.compare(a, b)),
            NodeClass: LeafClass2,
            distance
          });
          const leftBranches = await processNodesAndCreateEntries(leftLeafNodes, final, opts);
          return await basicMerge(leftBranches, es);
        } else {
          if (mergeLeftEntries[0].address) {
            return mergeLeftEntries.concat(oldFront.entryList.entries);
          } else {
            const mergeLeftNodes = await _Node.from({
              ...nodeOptions,
              entries: mergeLeftEntries.sort(({ key: a }, { key: b }) => opts.compare(a, b)),
              NodeClass: LeafClass2,
              distance
            });
            const mergeLeftBranchEntries = await processNodesAndCreateEntries(mergeLeftNodes, final, opts);
            const newFirstNodes = await _Node.from({
              ...nodeOptions,
              entries: [
                ...oldFront.entryList.entries,
                ...mergeLeftBranchEntries,
                ...es
              ].sort(({ key: a }, { key: b }) => opts.compare(a, b)),
              NodeClass: BranchClass2,
              distance
            });
            const newBranchEntries = await processNodesAndCreateEntries(newFirstNodes, final, opts);
            return newBranchEntries;
          }
        }
      }
    }
    async bulk(bulk, opts = {}, isRoot = true) {
      const { BranchClass: BranchClass2 } = opts;
      opts = {
        codec: this.codec,
        hasher: this.hasher,
        getNode: this.getNode,
        compare: this.compare,
        cache: this.cache,
        ...opts
      };
      if (!opts.sorted) {
        bulk = sortBulk(bulk, opts);
        opts.sorted = true;
      }
      const nodeOptions = {
        chunker: this.chunker,
        opts
      };
      const results = await this.transaction(bulk, opts);
      while (results.nodes.length > 1) {
        const newDistance = results.nodes[0].distance + 1;
        const branchEntries = await Promise.all(results.nodes.map(async (node) => {
          const block = await node.encode();
          results.blocks.push({
            block,
            node
          });
          this.cache.set(node);
          return new opts.BranchEntryClass(node, opts);
        }));
        const newNodes = await _Node.from({
          ...nodeOptions,
          entries: branchEntries,
          NodeClass: BranchClass2,
          distance: newDistance
        });
        await Promise.all(newNodes.map(async (node) => {
          const block = await node.encode();
          this.cache.set(node);
          results.blocks.push({
            block,
            node
          });
        }));
        results.nodes = newNodes;
      }
      results.root = results.nodes[0];
      if (isRoot && results.root) {
        await processRoot(this, results, bulk, nodeOptions);
      }
      results.blocks = results.blocks.map(({ block }) => block);
      return results;
    }
    static async from({ entries: entries3, chunker, NodeClass, distance, opts }) {
      if (!entries3.every((entry) => entry.constructor.name === entries3[0].constructor.name))
        throw new Error("all entries must be of the same type");
      const parts = [];
      let chunk = [];
      for (const entry of entries3) {
        chunk.push(entry);
        if (await chunker(entry, distance)) {
          parts.push(new EntryList({
            entries: chunk,
            closed: true
          }));
          chunk = [];
        }
      }
      if (chunk.length) {
        parts.push(new EntryList({
          entries: chunk,
          closed: false
        }));
      }
      return parts.map((entryList) => new NodeClass({
        entryList,
        chunker,
        distance,
        ...opts
      }));
    }
  };
  var IPLDNode = class extends Node3 {
    constructor({ codec, hasher, block, ...opts }) {
      super(opts);
      this.codec = codec;
      this.hasher = hasher;
      if (!block) {
        this.block = this.encode();
        this.address = this.block.then((block2) => block2.cid);
      } else {
        this.block = block;
        this.address = block.cid;
      }
    }
    async get(key) {
      const {
        result: entry,
        cids
      } = await this.getEntry(key);
      return {
        result: entry.key,
        cids
      };
    }
    async encode() {
      if (this.block)
        return this.block;
      const value = await this.encodeNode();
      const opts = {
        codec: this.codec,
        hasher: this.hasher,
        value
      };
      this.block = await encode3(opts);
      return this.block;
    }
  };
  var IPLDBranch = class extends IPLDNode {
    async encodeNode() {
      const { entries: entries3 } = this.entryList;
      const mapper = async (entry) => {
        if (!entry.address)
          throw new Error("entry.address required");
        return [
          entry.key,
          await entry.address
        ];
      };
      const list = await Promise.all(entries3.map(mapper));
      return {
        branch: [
          this.distance,
          list
        ],
        closed: this.closed
      };
    }
    get isBranch() {
      return true;
    }
  };
  var IPLDLeaf = class extends IPLDNode {
    async encodeNode() {
      const list = await Promise.all(this.entryList.entries.map(async (entry) => await entry.encodeNode()));
      return {
        leaf: list,
        closed: this.closed
      };
    }
    get isLeaf() {
      return true;
    }
  };
  var create13 = async function* (obj) {
    let { LeafClass: LeafClass2, LeafEntryClass, BranchClass: BranchClass2, BranchEntryClass, list, chunker, compare: compare4, ...opts } = obj;
    list = list.map((value) => new LeafEntryClass(value, opts));
    opts.compare = compare4;
    let nodes = await Node3.from({
      entries: list,
      chunker,
      NodeClass: LeafClass2,
      distance: 0,
      opts
    });
    yield* nodes;
    let distance = 1;
    while (nodes.length > 1) {
      const mapper = async (node) => new BranchEntryClass({
        key: node.key,
        address: await node.address
      }, opts);
      const entries3 = await Promise.all(nodes.map(mapper));
      nodes = await Node3.from({
        entries: entries3,
        chunker,
        NodeClass: BranchClass2,
        distance,
        opts
      });
      yield* nodes;
      distance++;
    }
  };

  // node_modules/.pnpm/prolly-trees@1.0.4/node_modules/prolly-trees/esm/src/map.js
  var MapEntry = class extends Entry {
    async identity() {
      const encoded = await this.codec.encode(await this.encodeNode());
      const hash2 = await this.hasher.encode(encoded);
      return readUInt32LE(hash2);
    }
  };
  var MapLeafEntry = class extends MapEntry {
    constructor(node, opts) {
      super(node, opts);
      this.value = node.value;
    }
    encodeNode() {
      return [
        this.key,
        this.value
      ];
    }
  };
  var MapBranchEntry = class extends MapEntry {
    constructor(node, opts) {
      if (!node.address)
        throw new Error("Cannot create MapBranchEntry without address");
      super(node, opts);
    }
    async encodeNode() {
      return [
        this.key,
        await this.address
      ];
    }
  };
  var getValue = async (node, key) => {
    const {
      result: entry,
      cids
    } = await node.getEntry(key);
    return {
      result: entry.value,
      cids
    };
  };
  var getManyValues = async (node, keys) => {
    const {
      result: entries3,
      cids
    } = await node.getEntries(keys);
    return {
      result: entries3.map((entry) => entry.value),
      cids
    };
  };
  var MapLeaf = class extends IPLDLeaf {
    get(key) {
      return getValue(this, key);
    }
    getMany(keys) {
      return getManyValues(this, keys);
    }
    bulk(bulk, opts = {}, isRoot = true) {
      return super.bulk(bulk, {
        ...classes,
        ...opts
      }, isRoot);
    }
  };
  var MapBranch = class extends IPLDBranch {
    get(key) {
      return getValue(this, key);
    }
    getMany(keys) {
      return getManyValues(this, keys);
    }
    bulk(bulk, opts = {}, isRoot = true) {
      return super.bulk(bulk, {
        ...classes,
        ...opts
      }, isRoot);
    }
  };
  var classes = {
    LeafClass: MapLeaf,
    LeafEntryClass: MapLeafEntry,
    BranchClass: MapBranch,
    BranchEntryClass: MapBranchEntry
  };
  var createGetNode = (get7, cache3, chunker, codec, hasher, compare4, opts) => {
    const LeafClass2 = opts.LeafClass || MapLeaf;
    const LeafEntryClass = opts.LeafEntryClass || MapLeafEntry;
    const BranchClass2 = opts.BranchClass || MapBranch;
    const BranchEntryClass = opts.BranchEntryClass || MapBranchEntry;
    const getNode = async (cid) => {
      if (cache3.has(cid))
        return cache3.get(cid);
      return get7(cid).then((block) => decoder2(block));
    };
    const decoder2 = makeDecoder({
      chunker,
      cache: cache3,
      getNode,
      codec,
      hasher,
      compare: compare4,
      LeafEntryClass,
      LeafClass: LeafClass2,
      BranchEntryClass,
      BranchClass: BranchClass2
    });
    return getNode;
  };
  var create14 = ({ get: get7, cache: cache3, chunker, list, codec, hasher, sorted, compare: compare4, ...opts }) => {
    if (!sorted)
      list = list.sort(({ key: a }, { key: b }) => compare4(a, b));
    const getNode = createGetNode(get7, cache3, chunker, codec, hasher, compare4, opts);
    const _opts = {
      list,
      codec,
      hasher,
      chunker,
      getNode,
      sorted,
      compare: compare4,
      cache: cache3,
      LeafClass: opts.LeafClass || MapLeaf,
      LeafEntryClass: opts.LeafEntryClass || MapLeafEntry,
      BranchClass: opts.BranchClass || MapBranch,
      BranchEntryClass: opts.BranchEntryClass || MapBranchEntry
    };
    return create13(_opts);
  };
  var load = ({ cid, get: get7, cache: cache3, chunker, codec, hasher, compare: compare4, ...opts }) => {
    const getNode = createGetNode(get7, cache3, chunker, codec, hasher, compare4, opts);
    return getNode(cid);
  };
  function makeDecoder({ chunker, cache: cache3, getNode, codec, hasher, compare: compare4, LeafEntryClass, LeafClass: LeafClass2, BranchEntryClass, BranchClass: BranchClass2 }) {
    const entryOpts = {
      codec,
      hasher
    };
    return (block) => {
      const { value } = block;
      const opts = {
        chunker,
        cache: cache3,
        block,
        getNode,
        codec,
        hasher,
        compare: compare4
      };
      let entries3;
      let CLS;
      if (value.leaf) {
        entries3 = value.leaf.map(([key, value2]) => new LeafEntryClass({
          key,
          value: value2
        }, entryOpts));
        CLS = LeafClass2;
      } else if (value.branch) {
        const [distance, _entries] = value.branch;
        opts.distance = distance;
        entries3 = _entries.map(([key, address]) => new BranchEntryClass({
          key,
          address
        }, entryOpts));
        CLS = BranchClass2;
      } else {
        throw new Error("Unknown block data, does not match schema");
      }
      const entryList = new EntryList({
        entries: entries3,
        closed: value.closed
      });
      const node = new CLS({
        entryList,
        ...opts
      });
      cache3.set(node);
      return node;
    };
  }

  // node_modules/.pnpm/prolly-trees@1.0.4/node_modules/prolly-trees/esm/src/db-index.js
  var compare2 = (a, b) => {
    const [aKey, aRef] = a;
    const [bKey, bRef] = b;
    const comp = simpleCompare(aKey, bKey);
    if (comp !== 0)
      return comp;
    return refCompare(aRef, bRef);
  };
  var refCompare = (aRef, bRef) => {
    if (Number.isNaN(aRef))
      return -1;
    if (Number.isNaN(bRef))
      throw new Error("ref may not be Infinity or NaN");
    if (!Number.isFinite(aRef))
      return 1;
    return simpleCompare(aRef, bRef);
  };
  var getIndex = async (node, key) => {
    const start = [
      key,
      NaN
    ];
    const end = [
      key,
      Infinity
    ];
    const {
      result: entries3,
      cids
    } = await node.getRangeEntries(start, end);
    return {
      result: entries3.map((entry) => {
        const [key2, id] = entry.key;
        return {
          id,
          key: key2,
          row: entry.value
        };
      }),
      cids
    };
  };
  var getRange = async (node, start, end) => {
    start = [
      start,
      NaN
    ];
    end = [
      end,
      Infinity
    ];
    const {
      result: entries3,
      cids
    } = await node.getRangeEntries(start, end);
    const result = entries3.map((entry) => {
      const [key, id] = entry.key;
      return {
        id,
        key,
        row: entry.value
      };
    });
    return {
      result,
      cids
    };
  };
  var DBIndexLeaf = class extends MapLeaf {
    get(key) {
      return getIndex(this, key);
    }
    range(start, end) {
      return getRange(this, start, end);
    }
    bulk(bulk, opts = {}, isRoot = true) {
      return super.bulk(bulk, {
        ...classes2,
        ...opts
      }, isRoot);
    }
  };
  var DBIndexBranch = class extends MapBranch {
    get(key) {
      return getIndex(this, key);
    }
    range(start, end) {
      return getRange(this, start, end);
    }
    bulk(bulk, opts = {}, isRoot = true) {
      return super.bulk(bulk, {
        ...classes2,
        ...opts
      }, isRoot);
    }
  };
  var LeafClass = DBIndexLeaf;
  var BranchClass = DBIndexBranch;
  var classes2 = {
    LeafClass,
    BranchClass,
    LeafEntryClass: MapLeafEntry,
    BranchEntryClass: MapBranchEntry
  };
  var defaults4 = {
    ...classes2,
    compare: compare2
  };
  var create15 = (opts) => {
    opts = {
      ...defaults4,
      ...opts
    };
    return create14(opts);
  };
  var load2 = (opts) => {
    opts = {
      ...defaults4,
      ...opts
    };
    return load(opts);
  };

  // node_modules/.pnpm/prolly-trees@1.0.4/node_modules/prolly-trees/esm/src/cache.js
  var nocache = {
    has: () => false,
    get: () => {
      throw new Error("Cannot ask for entries from nocache");
    },
    set: () => {
    }
  };

  // src/indexer-helpers.ts
  var IndexTree = class {
  };
  function refCompare2(aRef, bRef) {
    if (Number.isNaN(aRef)) return -1;
    if (Number.isNaN(bRef)) throw new Error("ref may not be Infinity or NaN");
    if (aRef === Infinity) return 1;
    return simpleCompare(aRef, bRef);
  }
  function compare3(a, b) {
    const [aKey, aRef] = a;
    const [bKey, bRef] = b;
    const comp = simpleCompare(aKey, bKey);
    if (comp !== 0) return comp;
    return refCompare2(aRef, bRef);
  }
  var byKeyOpts = { cache: nocache, chunker: bf(30), codec: src_exports, hasher: sha256, compare: compare3 };
  var byIdOpts = { cache: nocache, chunker: bf(30), codec: src_exports, hasher: sha256, compare: simpleCompare };
  function indexEntriesForChanges(changes, mapFn) {
    const indexEntries = [];
    changes.forEach(({ id: key, value, del: del2 }) => {
      if (del2 || !value) return;
      let mapCalled = false;
      const mapReturn = mapFn({ ...value, _id: key }, (k, v) => {
        mapCalled = true;
        if (typeof k === "undefined") return;
        indexEntries.push({
          key: [import_charwise.default.encode(k), key],
          value: v || null
        });
      });
      if (!mapCalled && mapReturn) {
        indexEntries.push({
          key: [import_charwise.default.encode(mapReturn), key],
          value: null
        });
      }
    });
    return indexEntries;
  }
  function makeProllyGetBlock(blocks) {
    return async (address) => {
      const block = await blocks.get(address);
      if (!block) throw new Error(`Missing block ${address.toString()}`);
      const { cid, bytes } = block;
      return create2({ cid, bytes, hasher: sha256, codec: src_exports });
    };
  }
  async function bulkIndex(tblocks, inIndex, indexEntries, opts) {
    if (!indexEntries.length) return inIndex;
    if (!inIndex.root) {
      if (!inIndex.cid) {
        let returnRootBlock = void 0;
        let returnNode = void 0;
        for await (const node of await create15({
          get: makeProllyGetBlock(tblocks),
          list: indexEntries,
          ...opts
        })) {
          const block = await node.block;
          await tblocks.put(block.cid, block.bytes);
          returnRootBlock = block;
          returnNode = node;
        }
        if (!returnNode || !returnRootBlock) throw new Error("failed to create index");
        return { root: returnNode, cid: returnRootBlock.cid };
      } else {
        inIndex.root = await load2({ cid: inIndex.cid, get: makeProllyGetBlock(tblocks), ...opts });
      }
    }
    const { root: root2, blocks: newBlocks } = await inIndex.root.bulk(indexEntries);
    if (root2) {
      for await (const block of newBlocks) {
        await tblocks.put(block.cid, block.bytes);
      }
      return { root: root2, cid: (await root2.block).cid };
    } else {
      return { root: void 0, cid: void 0 };
    }
  }
  async function loadIndex(tblocks, cid, opts) {
    return await load2({ cid, get: makeProllyGetBlock(tblocks), ...opts });
  }
  async function applyQuery(crdt, resp, query) {
    if (query.descending) {
      resp.result = resp.result.reverse();
    }
    if (query.limit) {
      resp.result = resp.result.slice(0, query.limit);
    }
    if (query.includeDocs) {
      resp.result = await Promise.all(
        resp.result.map(async (row) => {
          const val = await crdt.get(row.id);
          const doc = val ? { ...val.doc, _id: row.id } : void 0;
          return { ...row, doc };
        })
      );
    }
    return {
      rows: resp.result.map(({ key, ...row }) => {
        return {
          key: import_charwise.default.decode(key),
          ...row
        };
      })
    };
  }
  function encodeRange(range) {
    return [import_charwise.default.encode(range[0]), import_charwise.default.encode(range[1])];
  }
  function encodeKey(key) {
    return import_charwise.default.encode(key);
  }

  // src/indexer.ts
  init_utils();
  function index(sthis, { _crdt }, name7, mapFn, meta) {
    if (mapFn && meta) throw _crdt.logger.Error().Msg("cannot provide both mapFn and meta").AsError();
    if (mapFn && mapFn.constructor.name !== "Function") throw _crdt.logger.Error().Msg("mapFn must be a function").AsError();
    if (_crdt.indexers.has(name7)) {
      const idx = _crdt.indexers.get(name7);
      idx.applyMapFn(name7, mapFn, meta);
    } else {
      const idx = new Index(sthis, _crdt, name7, mapFn, meta);
      _crdt.indexers.set(name7, idx);
    }
    return _crdt.indexers.get(name7);
  }
  var Index = class {
    constructor(sthis, crdt, name7, mapFn, meta) {
      this.mapFnString = "";
      this.byKey = new IndexTree();
      this.byId = new IndexTree();
      this.includeDocsDefault = false;
      this.logger = ensureLogger(sthis, "Index");
      this.blockstore = crdt.indexBlockstore;
      this.crdt = crdt;
      this.applyMapFn(name7, mapFn, meta);
      this.name = name7;
      if (!(this.mapFnString || this.initError)) throw this.logger.Error().Msg("missing mapFnString").AsError();
    }
    ready() {
      return Promise.all([this.blockstore.ready(), this.crdt.ready()]).then(() => {
      });
    }
    close() {
      return Promise.all([this.blockstore.close(), this.crdt.close()]).then(() => {
      });
    }
    destroy() {
      return Promise.all([this.blockstore.destroy(), this.crdt.destroy()]).then(() => {
      });
    }
    applyMapFn(name7, mapFn, meta) {
      if (mapFn && meta) throw this.logger.Error().Msg("cannot provide both mapFn and meta").AsError();
      if (this.name && this.name !== name7) throw this.logger.Error().Msg("cannot change name").AsError();
      this.name = name7;
      try {
        if (meta) {
          if (this.indexHead && this.indexHead.map((c) => c.toString()).join() !== meta.head.map((c) => c.toString()).join()) {
            throw this.logger.Error().Msg("cannot apply different head meta").AsError();
          }
          if (this.mapFnString) {
            if (this.mapFnString !== meta.map) {
              this.logger.Warn().Msg(`cannot apply different mapFn meta: old mapFnString ${this.mapFnString} new mapFnString ${meta.map}`);
            } else {
              this.byId.cid = meta.byId;
              this.byKey.cid = meta.byKey;
              this.indexHead = meta.head;
            }
          } else {
            this.mapFnString = meta.map;
            this.byId.cid = meta.byId;
            this.byKey.cid = meta.byKey;
            this.indexHead = meta.head;
          }
        } else {
          if (this.mapFn) {
            if (mapFn) {
              if (this.mapFn.toString() !== mapFn.toString()) {
                throw this.logger.Error().Msg("cannot apply different mapFn app2").AsError();
              }
            }
          } else {
            if (!mapFn) {
              mapFn = (doc) => doc[name7] ?? void 0;
            }
            if (this.mapFnString) {
              if (this.mapFnString !== mapFn.toString()) {
                throw this.logger.Error().Str("mapFnString", this.mapFnString).Str("mapFn", mapFn.toString()).Msg("cannot apply different mapFn app").AsError();
              }
            } else {
              this.mapFnString = mapFn.toString();
            }
            this.mapFn = mapFn;
          }
        }
        const matches = /=>\s*(.*)/.test(this.mapFnString);
        this.includeDocsDefault = matches;
      } catch (e) {
        this.initError = e;
      }
    }
    async query(opts = {}) {
      await this.ready();
      await this._updateIndex();
      await this._hydrateIndex();
      if (!this.byKey.root) {
        return await applyQuery(this.crdt, { result: [] }, opts);
      }
      if (this.includeDocsDefault && opts.includeDocs === void 0) opts.includeDocs = true;
      if (opts.range) {
        const eRange = encodeRange(opts.range);
        return await applyQuery(this.crdt, await throwFalsy(this.byKey.root).range(eRange[0], eRange[1]), opts);
      }
      if (opts.key) {
        const encodedKey = encodeKey(opts.key);
        return await applyQuery(this.crdt, await throwFalsy(this.byKey.root).get(encodedKey), opts);
      }
      if (Array.isArray(opts.keys)) {
        const results = await Promise.all(
          opts.keys.map(async (key) => {
            const encodedKey = encodeKey(key);
            return (await applyQuery(this.crdt, await throwFalsy(this.byKey.root).get(encodedKey), opts)).rows;
          })
        );
        return { rows: results.flat() };
      }
      if (opts.prefix) {
        if (!Array.isArray(opts.prefix)) opts.prefix = [opts.prefix];
        const start = [...opts.prefix, NaN];
        const end = [...opts.prefix, Infinity];
        const encodedR = encodeRange([start, end]);
        return await applyQuery(this.crdt, await this.byKey.root.range(...encodedR), opts);
      }
      const all = await this.byKey.root.getAllEntries();
      return await applyQuery(
        this.crdt,
        {
          // @ts-expect-error getAllEntries returns a different type than range
          result: all.result.map(({ key: [k, id], value }) => ({
            key: k,
            id,
            value
          }))
        },
        opts
      );
    }
    _resetIndex() {
      this.byId = new IndexTree();
      this.byKey = new IndexTree();
      this.indexHead = void 0;
    }
    async _hydrateIndex() {
      if (this.byId.root && this.byKey.root) return;
      if (!this.byId.cid || !this.byKey.cid) return;
      this.byId.root = await loadIndex(this.blockstore, this.byId.cid, byIdOpts);
      this.byKey.root = await loadIndex(this.blockstore, this.byKey.cid, byKeyOpts);
    }
    async _updateIndex() {
      await this.ready();
      if (this.initError) throw this.initError;
      if (!this.mapFn) throw this.logger.Error().Msg("No map function defined").AsError();
      let result, head;
      if (!this.indexHead || this.indexHead.length === 0) {
        ({ result, head } = await this.crdt.allDocs());
      } else {
        ({ result, head } = await this.crdt.changes(this.indexHead));
      }
      if (result.length === 0) {
        this.indexHead = head;
      }
      let staleKeyIndexEntries = [];
      let removeIdIndexEntries = [];
      if (this.byId.root) {
        const removeIds = result.map(({ id: key }) => key);
        const { result: oldChangeEntries } = await this.byId.root.getMany(removeIds);
        staleKeyIndexEntries = oldChangeEntries.map((key) => ({ key, del: true }));
        removeIdIndexEntries = oldChangeEntries.map((key) => ({ key: key[1], del: true }));
      }
      const indexEntries = indexEntriesForChanges(result, this.mapFn);
      const byIdIndexEntries = indexEntries.map(({ key }) => ({
        key: key[1],
        value: key
      }));
      const indexerMeta = { indexes: /* @__PURE__ */ new Map() };
      for (const [name7, indexer] of this.crdt.indexers) {
        if (indexer.indexHead) {
          indexerMeta.indexes?.set(name7, {
            byId: indexer.byId.cid,
            byKey: indexer.byKey.cid,
            head: indexer.indexHead,
            map: indexer.mapFnString,
            name: indexer.name
          });
        }
      }
      if (result.length === 0) {
        return indexerMeta;
      }
      const { meta } = await this.blockstore.transaction(async (tblocks) => {
        this.byId = await bulkIndex(tblocks, this.byId, removeIdIndexEntries.concat(byIdIndexEntries), byIdOpts);
        this.byKey = await bulkIndex(tblocks, this.byKey, staleKeyIndexEntries.concat(indexEntries), byKeyOpts);
        this.indexHead = head;
        if (this.byId.cid && this.byKey.cid) {
          const idxMeta = {
            byId: this.byId.cid,
            byKey: this.byKey.cid,
            head,
            map: this.mapFnString,
            name: this.name
          };
          indexerMeta.indexes?.set(this.name, idxMeta);
        }
        return indexerMeta;
      });
      return meta;
    }
  };

  // src/crdt-clock.ts
  init_cement();

  // src/apply-head-queue.ts
  function applyHeadQueue(worker, logger) {
    const queue = [];
    let isProcessing = false;
    async function* process() {
      if (isProcessing || queue.length === 0) return;
      isProcessing = true;
      const allUpdates = [];
      try {
        while (queue.length > 0) {
          queue.sort((a, b) => b.updates ? 1 : -1);
          const task = queue.shift();
          if (!task) continue;
          await worker(task.newHead, task.prevHead, task.updates !== null).catch((e) => {
            throw logger.Error().Err(e).Msg("int_applyHead worker error").AsError();
          });
          if (task.updates) {
            allUpdates.push(...task.updates);
          }
          if (!queue.some((t) => t.updates) || task.updates) {
            const allTasksHaveUpdates = queue.every((task2) => task2.updates !== null);
            yield { updates: allUpdates, all: allTasksHaveUpdates };
            allUpdates.length = 0;
          }
        }
      } finally {
        isProcessing = false;
        const generator = process();
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      }
    }
    return {
      push(task) {
        queue.push(task);
        return process();
      },
      size() {
        return queue.length;
      }
    };
  }

  // src/crdt-clock.ts
  init_utils();
  var CRDTClock = class {
    constructor(blockstore) {
      // todo: track local and remote clocks independently, merge on read
      // that way we can drop the whole remote if we need to
      // should go with making sure the local clock only references locally available blockstore on write
      this.head = [];
      this.zoomers = /* @__PURE__ */ new Set();
      this.watchers = /* @__PURE__ */ new Set();
      this.emptyWatchers = /* @__PURE__ */ new Set();
      this._ready = new ResolveOnce();
      this.blockstore = blockstore;
      this.logger = ensureLogger(blockstore.sthis, "CRDTClock");
      this.applyHeadQueue = applyHeadQueue(this.int_applyHead.bind(this), this.logger);
    }
    async ready() {
      return this._ready.once(async () => {
        await this.blockstore.ready();
      });
    }
    async close() {
      await this.blockstore.close();
    }
    setHead(head) {
      this.head = head;
    }
    async applyHead(newHead, prevHead, updates) {
      for await (const { updates: updatesAcc, all } of this.applyHeadQueue.push({
        newHead,
        prevHead,
        updates
      })) {
        return this.processUpdates(updatesAcc, all, prevHead);
      }
    }
    async processUpdates(updatesAcc, all, prevHead) {
      let internalUpdates = updatesAcc;
      if (this.watchers.size && !all) {
        const changes = await clockChangesSince(throwFalsy(this.blockstore), this.head, prevHead, {}, this.logger);
        internalUpdates = changes.result;
      }
      this.zoomers.forEach((fn) => fn());
      this.notifyWatchers(internalUpdates || []);
    }
    notifyWatchers(updates) {
      this.emptyWatchers.forEach((fn) => fn());
      this.watchers.forEach((fn) => fn(updates || []));
    }
    onTick(fn) {
      this.watchers.add(fn);
    }
    onTock(fn) {
      this.emptyWatchers.add(fn);
    }
    onZoom(fn) {
      this.zoomers.add(fn);
    }
    async int_applyHead(newHead, prevHead, localUpdates) {
      const ogHead = sortClockHead(this.head);
      newHead = sortClockHead(newHead);
      if (compareClockHeads(ogHead, newHead)) {
        return;
      }
      const ogPrev = sortClockHead(prevHead);
      if (compareClockHeads(ogHead, ogPrev)) {
        this.setHead(newHead);
        return;
      }
      const noLoader = !localUpdates;
      if (!this.blockstore) {
        throw this.logger.Error().Msg("missing blockstore").AsError();
      }
      await validateBlocks(this.logger, newHead, this.blockstore);
      const { meta } = await this.blockstore.transaction(
        async (tblocks) => {
          const advancedHead = await advanceBlocks(this.logger, newHead, tblocks, this.head);
          const result = await root(tblocks, advancedHead);
          for (const { cid, bytes } of [
            ...result.additions
            // ...result.removals
          ]) {
            tblocks.putSync(cid, bytes);
          }
          return { head: advancedHead };
        },
        { noLoader, add: false }
      );
      this.setHead(meta.head);
    }
  };
  function sortClockHead(clockHead) {
    return clockHead.sort((a, b) => a.toString().localeCompare(b.toString()));
  }
  async function validateBlocks(logger, newHead, blockstore) {
    if (!blockstore) throw logger.Error().Msg("missing blockstore");
    newHead.map(async (cid) => {
      const got = await blockstore.get(cid);
      if (!got) {
        throw logger.Error().Str("cid", cid.toString()).Msg("int_applyHead missing block").AsError();
      }
    });
  }
  function compareClockHeads(head1, head2) {
    return head1.toString() === head2.toString();
  }
  async function advanceBlocks(logger, newHead, tblocks, head) {
    for (const cid of newHead) {
      try {
        head = await advance(tblocks, head, cid);
      } catch (e) {
        logger.Debug().Err(e).Msg("failed to advance head");
        continue;
      }
    }
    return head;
  }

  // src/crdt.ts
  init_utils();
  var CRDT = class {
    constructor(sthis, name7, opts = {}) {
      this.indexers = /* @__PURE__ */ new Map();
      this.onceReady = new ResolveOnce();
      this.sthis = sthis;
      this.name = name7;
      this.logger = ensureLogger(sthis, "CRDT");
      this.opts = opts;
      this.blockstore = blockstoreFactory(sthis, {
        name: name7,
        applyMeta: async (meta) => {
          const crdtMeta = meta;
          if (!crdtMeta.head) throw this.logger.Error().Msg("missing head").AsError();
          await this.clock.applyHead(crdtMeta.head, []);
        },
        compact: async (blocks) => {
          await doCompact(blocks, this.clock.head, this.logger);
          return { head: this.clock.head };
        },
        autoCompact: this.opts.autoCompact || 100,
        store: { ...this.opts.store, isIndex: void 0 },
        public: this.opts.public,
        meta: this.opts.meta,
        threshold: this.opts.threshold
      });
      this.indexBlockstore = blockstoreFactory(sthis, {
        name: name7,
        applyMeta: async (meta) => {
          const idxCarMeta = meta;
          if (!idxCarMeta.indexes) throw this.logger.Error().Msg("missing indexes").AsError();
          for (const [name8, idx] of Object.entries(idxCarMeta.indexes)) {
            index(this.sthis, { _crdt: this }, name8, void 0, idx);
          }
        },
        store: { ...this.opts.store, isIndex: this.opts.store?.isIndex || "idx" },
        public: this.opts.public
      });
      this.clock = new CRDTClock(this.blockstore);
      this.clock.onZoom(() => {
        for (const idx of this.indexers.values()) {
          idx._resetIndex();
        }
      });
    }
    async bulk(updates) {
      await this.ready();
      const prevHead = [...this.clock.head];
      const done = await this.blockstore.transaction(async (blocks) => {
        const { head } = await applyBulkUpdateToCrdt(
          this.blockstore.ebOpts.storeRuntime,
          blocks,
          this.clock.head,
          updates,
          this.logger
        );
        updates = updates.map((dupdate) => {
          readFiles(this.blockstore, { doc: dupdate.value });
          return dupdate;
        });
        return { head };
      });
      await this.clock.applyHead(done.meta.head, prevHead, updates);
      return done.meta;
    }
    async ready() {
      return this.onceReady.once(async () => {
        try {
          await Promise.all([this.blockstore.ready(), this.indexBlockstore.ready(), this.clock.ready()]);
        } catch (e) {
          throw this.logger.Error().Err(e).Msg("CRDT not ready").AsError();
        }
      });
    }
    async close() {
      await Promise.all([this.blockstore.close(), this.indexBlockstore.close(), this.clock.close()]);
    }
    async destroy() {
      await Promise.all([this.blockstore.destroy(), this.indexBlockstore.destroy()]);
    }
    // if (snap) await this.clock.applyHead(crdtMeta.head, this.clock.head)
    async allDocs() {
      await this.ready();
      const result = [];
      for await (const entry of getAllEntries(this.blockstore, this.clock.head, this.logger)) {
        result.push(entry);
      }
      return { result, head: this.clock.head };
    }
    async vis() {
      await this.ready();
      const txt = [];
      for await (const line of clockVis(this.blockstore, this.clock.head)) {
        txt.push(line);
      }
      return txt.join("\n");
    }
    async getBlock(cidString) {
      await this.ready();
      return await getBlock(this.blockstore, cidString);
    }
    async get(key) {
      await this.ready();
      const result = await getValueFromCrdt(this.blockstore, this.clock.head, key, this.logger);
      if (result.del) return void 0;
      return result;
    }
    async changes(since = [], opts = {}) {
      await this.ready();
      return await clockChangesSince(this.blockstore, this.clock.head, since, opts, this.logger);
    }
    async compact() {
      const blocks = this.blockstore;
      return await blocks.compact();
    }
  };

  // src/database.ts
  init_utils();
  var Database = class {
    constructor(name7, opts) {
      this.opts = {};
      this._listening = false;
      this._listeners = /* @__PURE__ */ new Set();
      this._noupdate_listeners = /* @__PURE__ */ new Set();
      this._ready = new ResolveOnce();
      this.name = name7;
      this.opts = opts || this.opts;
      this.sthis = ensureSuperThis(this.opts);
      this.logger = ensureLogger(this.sthis, "Database");
      this._crdt = new CRDT(this.sthis, name7, this.opts);
      this.blockstore = this._crdt.blockstore;
      this._writeQueue = writeQueue(async (updates) => {
        return await this._crdt.bulk(updates);
      });
      this._crdt.clock.onTock(() => {
        this._no_update_notify();
      });
    }
    static {
      this.databases = /* @__PURE__ */ new Map();
    }
    async close() {
      await this.ready();
      await this._crdt.close();
      await this.blockstore.close();
    }
    async destroy() {
      await this.ready();
      await this._crdt.destroy();
      await this.blockstore.destroy();
    }
    async ready() {
      return this._ready.once(async () => {
        await this.sthis.start();
        await this._crdt.ready();
        await this.blockstore.ready();
      });
    }
    async get(id) {
      if (!id) throw this.logger.Error().Str("db", this.name).Msg(`Doc id is required`).AsError();
      await this.ready();
      this.logger.Debug().Str("id", id).Msg("get");
      const got = await this._crdt.get(id).catch((e) => {
        throw new NotFoundError(`Not found: ${id} - ${e.message}`);
      });
      if (!got) throw new NotFoundError(`Not found: ${id}`);
      const { doc } = got;
      return { ...doc, _id: id };
    }
    async put(doc) {
      await this.ready();
      this.logger.Debug().Str("id", doc._id).Msg("put");
      const { _id, ...value } = doc;
      const docId = _id || this.sthis.nextId().str;
      const result = await this._writeQueue.push({
        id: docId,
        value: {
          ...value,
          _id: docId
        }
      });
      return { id: docId, clock: result?.head, name: this.name };
    }
    async del(id) {
      await this.ready();
      this.logger.Debug().Str("id", id).Msg("del");
      const result = await this._writeQueue.push({ id, del: true });
      return { id, clock: result?.head, name: this.name };
    }
    async changes(since = [], opts = {}) {
      await this.ready();
      this.logger.Debug().Any("since", since).Any("opts", opts).Msg("changes");
      const { result, head } = await this._crdt.changes(since, opts);
      const rows = result.map(({ id: key, value, del: del2, clock }) => ({
        key,
        value: del2 ? { _id: key, _deleted: true } : { _id: key, ...value },
        clock
      }));
      return { rows, clock: head, name: this.name };
    }
    async allDocs(opts = {}) {
      await this.ready();
      this.logger.Debug().Msg("allDocs");
      const { result, head } = await this._crdt.allDocs();
      const rows = result.map(({ id: key, value, del: del2 }) => ({
        key,
        value: del2 ? { _id: key, _deleted: true } : { _id: key, ...value }
      }));
      return { rows, clock: head, name: this.name };
    }
    async allDocuments() {
      return this.allDocs();
    }
    subscribe(listener, updates) {
      this.logger.Debug().Bool("updates", updates).Msg("subscribe");
      if (updates) {
        if (!this._listening) {
          this._listening = true;
          this._crdt.clock.onTick((updates2) => {
            void this._notify(updates2);
          });
        }
        this._listeners.add(listener);
        return () => {
          this._listeners.delete(listener);
        };
      } else {
        this._noupdate_listeners.add(listener);
        return () => {
          this._noupdate_listeners.delete(listener);
        };
      }
    }
    // todo if we add this onto dbs in fireproof.ts then we can make index.ts a separate package
    async query(field, opts = {}) {
      await this.ready();
      this.logger.Debug().Any("field", field).Any("opts", opts).Msg("query");
      const _crdt = this._crdt;
      const idx = typeof field === "string" ? index(this.sthis, { _crdt }, field) : index(this.sthis, { _crdt }, makeName(field.toString()), field);
      return await idx.query(opts);
    }
    async compact() {
      await this.ready();
      await this._crdt.compact();
    }
    async _notify(updates) {
      await this.ready();
      if (this._listeners.size) {
        const docs = updates.map(({ id, value }) => ({ ...value, _id: id }));
        for (const listener of this._listeners) {
          await (async () => await listener(docs))().catch((e) => {
            this.logger.Error().Err(e).Msg("subscriber error");
          });
        }
      }
    }
    async _no_update_notify() {
      await this.ready();
      if (this._noupdate_listeners.size) {
        for (const listener of this._noupdate_listeners) {
          await (async () => await listener([]))().catch((e) => {
            this.logger.Error().Err(e).Msg("subscriber error");
          });
        }
      }
    }
  };
  function toSortedArray(set3) {
    if (!set3) return [];
    return Object.entries(set3).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ [k]: v }));
  }
  function fireproof(name7, opts) {
    const key = JSON.stringify(
      toSortedArray({
        name: name7,
        stores: toSortedArray(opts?.store?.stores)
      })
    );
    let db = Database.databases.get(key);
    if (!db) {
      db = new Database(name7, opts);
      Database.databases.set(key, db);
    }
    return db;
  }
  function makeName(fnString) {
    const regex = /\(([^,()]+,\s*[^,()]+|\[[^\]]+\],\s*[^,()]+)\)/g;
    let found = null;
    const matches = Array.from(fnString.matchAll(regex), (match) => match[1].trim());
    if (matches.length === 0) {
      found = /=>\s*{?\s*([^{}]+)\s*}?/.exec(fnString);
      if (found && found[1].includes("return")) {
        found = null;
      }
    }
    if (!found) {
      return fnString;
    } else {
      return found[1];
    }
  }

  // src/runtime/index.ts
  var runtime_exports = {};
  __export(runtime_exports, {
    FILESTORE_VERSION: () => FILESTORE_VERSION,
    INDEXDB_VERSION: () => INDEXDB_VERSION,
    files: () => files_exports,
    getFileName: () => getFileName,
    getFileSystem: () => getFileSystem,
    getPath: () => getPath,
    kb: () => key_bag_exports,
    kc: () => keyed_crypto_exports,
    mf: () => wait_pr_multiformats_exports,
    toArrayBuffer: () => toArrayBuffer
  });
  init_utils2();

  // src/runtime/wait-pr-multiformats/index.ts
  var wait_pr_multiformats_exports = {};
  __export(wait_pr_multiformats_exports, {
    block: () => block_exports,
    codec: () => codec_interface_exports
  });

  // src/runtime/wait-pr-multiformats/codec-interface.ts
  var codec_interface_exports = {};

  // src/runtime/gateways/file/version.ts
  var FILESTORE_VERSION = "v0.19-file";

  // src/runtime/index.ts
  init_version();

  // src/index.ts
  init_utils();

  // src/version.ts
  var PACKAGE_VERSION = Object.keys({
    "0.0.0-smoke": "xxxx"
  })[0];
  return __toCommonJS(src_exports5);
})();
//# sourceMappingURL=index.global.js.map