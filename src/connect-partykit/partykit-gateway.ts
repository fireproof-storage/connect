import PartySocket from 'partysocket'
import { Logger, Result, URI } from "@adviser/cement";
import {bs, rt, ensureLogger, exception2Result, exceptionWrapper, NotFoundError} from "@fireproof/core";
import { EventBlock, decodeEventBlock } from '@web3-storage/pail/clock'
import { MemoryBlockstore } from '@web3-storage/pail/block'
import { EventView } from '@web3-storage/pail/clock/api'

import { Base64 } from 'js-base64'
import type { Link } from 'multiformats'
import {NoSuchKey} from "@aws-sdk/client-s3";
import {s3Client, S3Gateway, S3TestStore} from "../s3/s3-gateway";


type DbMetaEventBlock = EventBlock<{ dbMeta: Uint8Array }>
type CarClockHead = Link<DbMetaEventBlock>[]

export class PartyKitGateway implements bs.Gateway {
    readonly logger: Logger;
    party: PartySocket | null
    parents: CarClockHead = []
    eventBlocks = new MemoryBlockstore()

    messagePromise: Promise<Uint8Array[]>
    messageResolve?: (value: Uint8Array[] | PromiseLike<Uint8Array[]>) => void

    constructor(logger: Logger) {
        this.logger = ensureLogger(logger, "PartyKitGateway");
        this.party = null

        this.messagePromise = new Promise<Uint8Array[]>((resolve, reject) => {
            this.messageResolve = resolve
        })
    }

    async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
        return Result.Ok(baseUrl.build().setParam("key", key).URI());
    }

    async start(url: URI): Promise<Result<URI>> {
        await rt.SysContainer.start();
        this.logger.Debug().Str("url", url.toString()).Msg("start");
        const ret = url.build().defParam("version", "v0.1-partykit").URI();

        const room = url.getParam('room');
        console.log(`starting with ${room}`)
        this.party = new PartySocket({
            party: 'fireproof',
            host: url.host,
            room: room,
            WebSocket: rt.SysContainer.websocket()
        })

        const ready = new Promise<void>((resolve, reject) => {
            this.party?.addEventListener('open', () => {
                resolve()
            })
        })
        console.log('waiting for party to open')
        await ready.then()
        console.log('party open for business')

        this.party.addEventListener('message', (event: MessageEvent<string>) => {
            const afn = async () => {
                const base64String = event.data
                const uint8ArrayBuffer = Base64.toUint8Array(base64String)
                const eventBlock = await this.decodeEventBlock(uint8ArrayBuffer)

                // FIXME we lack a way to do this right now
                //await this.taskManager!.handleEvent(eventBlock)

                // @ts-ignore
                this.messageResolve?.([eventBlock.value.data.dbMeta as Uint8Array])
                // add the cid to our parents so we delete it when we send the update
                this.parents.push(eventBlock.cid)
                setTimeout(() => {
                    this.messagePromise = new Promise<Uint8Array[]>((resolve, reject) => {
                        this.messageResolve = resolve
                    })
                }, 0)
            }
            void afn()
        })

        return Result.Ok(ret);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async close(url: URI): Promise<bs.VoidResult> {
        return Result.Ok(undefined);
    }

    async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
        return exception2Result(async () => {
            const store = url.getParam("store");
            switch (store) {
                case "data":
                    const key = url.getParam("key");
                    const host = url.host
                    const room = url.getParam('room')
                    let uploadUrl = `http://${host}/parties/fireproof/${room}?car=${key}`
                    console.log('putting to url', uploadUrl);
                    const response = await fetch(uploadUrl, {method: 'PUT', body: body})
                    console.log(`got ${response.statusText}`)
                    if (response.status === 404) {
                        throw new Error('Failure in uploading data!')
                    }

                    break;
                case "meta":
                    console.log(`got a put for meta`)
                    const event = await this.createEventBlock(body)
                    const base64String = Base64.fromUint8Array(event.bytes)
                    const partyMessage = {
                        data: base64String,
                        cid: event.cid.toString(),
                        parents: this.parents.map(p => p.toString())
                    }
                    this.party?.send(JSON.stringify(partyMessage))
                    this.parents = [event.cid]
                    break;
                default:
                    throw this.logger.Error().Url(url).Msg(`store ${store} not supported`).AsError();
            }
        })
    }

    async decodeEventBlock(bytes: Uint8Array): Promise<DbMetaEventBlock> {
        const event = await decodeEventBlock<{ dbMeta: Uint8Array }>(bytes)
        return event as EventBlock<{ dbMeta: Uint8Array }> // todo test these `as` casts
    }

    async createEventBlock(bytes: Uint8Array): Promise<DbMetaEventBlock> {
        const data = {
            dbMeta: bytes
        }
        const event = await EventBlock.create(
            data,
            this.parents as unknown as Link<EventView<{ dbMeta: Uint8Array }>, number, number, 1>[]
        )
        await this.eventBlocks.put(event.cid, event.bytes)
        return event as EventBlock<{ dbMeta: Uint8Array }> // todo test these `as` casts
    }

    async get(url: URI): Promise<bs.GetResult> {
        try {
                    const store = url.getParam("store");
                    switch (store) {
                        case "data":
                            const key = url.getParam("key");
                            const host = url.host
                            const room = url.getParam('room')
                            let uploadUrl = `${host}/parties/fireproof/${room}?car=${key}`
                            const response = await fetch(uploadUrl, {method: 'GET'})
                            if (response.status === 404) {
                                throw new Error('Failure in downloading data!')
                            }
                            const data = await response.arrayBuffer()
                            // const data = Base64.toUint8Array(base64String)
                            return Result.Ok(new Uint8Array(data));
                            break;
                        case "meta":
                            const datas = await this.messagePromise
                            return Result.Ok(datas[0]) // WTF?
                        break;
                    }
            return Result.Err(new NotFoundError(`fyou error`));
        } catch (e) {
            if ((e as NoSuchKey).name === "NoSuchKey") {
                return Result.Err(new NotFoundError(`fyou two error`));
            }
            return Result.Err(e as Error);
        }
    }

    async delete(url: URI): Promise<bs.VoidResult> {
        return Result.Ok(undefined);
    }

    async destroy(baseURL: URI): Promise<Result<void>> {
        return Result.Ok(undefined);
    }
}

export class PartyKitTestStore implements bs.TestGateway {
    readonly logger: Logger;
    readonly gateway: bs.Gateway;
    constructor(gw: bs.Gateway, ilogger: Logger) {
        const logger = ensureLogger(ilogger, "PartyKitTestStore");
        this.logger = logger;
        this.gateway = gw;
    }
    async get(iurl: URI, key: string): Promise<Uint8Array> {
        const url = iurl.build().setParam("key", key).URI();
        const dbFile = rt.SysContainer.join(rt.getPath(url, this.logger), rt.getFileName(url, this.logger));
        this.logger.Debug().Url(url).Str("dbFile", dbFile).Msg("get");
        const buffer = await this.gateway.get(url);
        this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
        return buffer.Ok();
    }
}

export function registerPartyKitStoreProtocol(protocol = "partykit:", overrideBaseURL?: string) {
    return bs.registerStoreProtocol({
        protocol,
        overrideBaseURL,
        gateway: async (logger) => {
            return new PartyKitGateway(logger);
        },
        test: async (logger: Logger) => {
            const gateway = new PartyKitGateway(logger);
            return new PartyKitTestStore(gateway, logger);
        },
    });
}