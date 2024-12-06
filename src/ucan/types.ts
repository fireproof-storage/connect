import { type URI } from "@adviser/cement";
import { type Agent } from "@web3-storage/access/agent";
import type {
  Delegation,
  DID,
  Failure,
  InferInvokedCapability,
  Link,
  Principal,
  ServiceMethod,
  Signer,
  Unit,
} from "@ucanto/interface";
import * as W3 from "@web3-storage/capabilities/types";

import * as ClockCaps from "./clock/capabilities.js";
import * as StoreCaps from "./store/capabilities.js";

// AGENT

export type { Agent } from "@web3-storage/access/agent";

export interface AgentWithStoreName {
  readonly agent: Agent<Service>;
  readonly id: Principal<DID<"key">>;
  readonly storeName: string;
}

// CLOCK

export interface Clock {
  readonly delegation: Delegation;
  readonly id: Principal<DID<"key">>;
  readonly isNew: boolean;
  readonly signer?: Signer<DID<"key">>;
  readonly storeName: string;
}

export interface ClockWithoutDelegation {
  readonly id: Principal<DID<"key">>;
  readonly isNew: false;
}

export type ClockAdvance = InferInvokedCapability<typeof ClockCaps.advance>;
export type ClockAuthorizeShare = InferInvokedCapability<typeof ClockCaps.authorizeShare>;
export type ClockClaimShare = InferInvokedCapability<typeof ClockCaps.claimShare>;
export type ClockClaimShares = InferInvokedCapability<typeof ClockCaps.claimShares>;
export type ClockConfirmShare = InferInvokedCapability<typeof ClockCaps.confirmShare>;
export type ClockHead = InferInvokedCapability<typeof ClockCaps.head>;
export type ClockRegister = InferInvokedCapability<typeof ClockCaps.register>;

export interface ClockAdvanceSuccess {
  readonly head: string;
}

export interface ClockAuthorizeShareSuccess {
  readonly url: string;
}

export interface ClockClaimShareSuccess {
  readonly delegations: Record<string, Uint8Array>;
}

export interface ClockClaimSharesSuccess {
  readonly delegations: Record<string, Uint8Array>;
}

export interface ClockHeadSuccess {
  readonly head?: string;
}

// SERVER

export interface Server {
  readonly id: Principal;
  readonly uri: URI;
}

// SERVICE

export interface Service {
  readonly access: {
    readonly authorize: ServiceMethod<W3.AccessAuthorize, W3.AccessAuthorizeSuccess, Failure>;
    readonly claim: ServiceMethod<W3.AccessClaim, W3.AccessClaimSuccess, W3.AccessClaimFailure>;
    readonly confirm: ServiceMethod<W3.AccessConfirm, W3.AccessConfirmSuccess, W3.AccessConfirmFailure>;
    readonly delegate: ServiceMethod<W3.AccessDelegate, W3.AccessDelegateSuccess, W3.AccessDelegateFailure>;
  };
  readonly clock: {
    readonly advance: ServiceMethod<ClockAdvance, ClockAdvanceSuccess, Failure>;
    readonly "authorize-share": ServiceMethod<ClockAuthorizeShare, ClockAuthorizeShareSuccess, Failure>;
    readonly "claim-share": ServiceMethod<ClockClaimShare, ClockClaimShareSuccess, Failure>;
    readonly "claim-shares": ServiceMethod<ClockClaimShares, ClockClaimSharesSuccess, Failure>;
    readonly "confirm-share": ServiceMethod<ClockConfirmShare, Unit, Failure>;
    readonly head: ServiceMethod<ClockHead, ClockHeadSuccess, Failure>;
    readonly register: ServiceMethod<ClockRegister, Unit, Failure>;
  };
  readonly store: {
    readonly add: ServiceMethod<StoreAdd, StoreAddSuccess, Failure>;
    readonly get: ServiceMethod<StoreGet, StoreGetSuccess, Failure>;
  };
}

// STORE

export type StoreAdd = InferInvokedCapability<typeof StoreCaps.add>;
export type StoreGet = InferInvokedCapability<typeof StoreCaps.get>;

export interface StoreAddSuccess {
  readonly allocated: number;
  readonly link: Link;
  readonly status: string;
  readonly url: string;
}

export interface StoreGetSuccess {
  readonly data: undefined | Uint8Array;
}
