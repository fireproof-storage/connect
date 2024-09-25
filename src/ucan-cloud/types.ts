import { Failure, InferInvokedCapability, Link, ServiceMethod, Unit } from "@ucanto/interface";
import * as W3 from "@web3-storage/capabilities/types";

import * as ClockCaps from "./clock/capabilities";
import * as StoreCaps from "./store/capabilities";

export interface Service {
  access: {
    authorize: ServiceMethod<W3.AccessAuthorize, W3.AccessAuthorizeSuccess, Failure>;
    claim: ServiceMethod<W3.AccessClaim, W3.AccessClaimSuccess, W3.AccessClaimFailure>;
    confirm: ServiceMethod<W3.AccessConfirm, W3.AccessConfirmSuccess, W3.AccessConfirmFailure>;
    delegate: ServiceMethod<W3.AccessDelegate, W3.AccessDelegateSuccess, W3.AccessDelegateFailure>;
  };
  clock: {
    advance: ServiceMethod<ClockAdvance, ClockAdvanceSuccess, Failure>;
    "authorize-share": ServiceMethod<ClockAuthorizeShare, ClockAuthorizeShareSuccess, Failure>;
    "claim-share": ServiceMethod<ClockClaimShare, ClockClaimShareSuccess, Failure>;
    "claim-shares": ServiceMethod<ClockClaimShares, ClockClaimSharesSuccess, Failure>;
    "confirm-share": ServiceMethod<ClockConfirmShare, Unit, Failure>;
    head: ServiceMethod<ClockHead, ClockHeadSuccess, Failure>;
    register: ServiceMethod<ClockRegister, Unit, Failure>;
  };
  store: {
    add: ServiceMethod<StoreAdd, StoreAddSuccess, Failure>;
    get: ServiceMethod<StoreGet, StoreGetSuccess, Failure>;
  };
}

// CLOCK

export type ClockAdvance = InferInvokedCapability<typeof ClockCaps.advance>;
export type ClockAuthorizeShare = InferInvokedCapability<typeof ClockCaps.authorizeShare>;
export type ClockClaimShare = InferInvokedCapability<typeof ClockCaps.claimShare>;
export type ClockClaimShares = InferInvokedCapability<typeof ClockCaps.claimShares>;
export type ClockConfirmShare = InferInvokedCapability<typeof ClockCaps.confirmShare>;
export type ClockHead = InferInvokedCapability<typeof ClockCaps.head>;
export type ClockRegister = InferInvokedCapability<typeof ClockCaps.register>;

export interface ClockAdvanceSuccess {
  head: string;
}

export interface ClockAuthorizeShareSuccess {
  url: string;
}

export interface ClockClaimShareSuccess {
  delegations: Record<string, Uint8Array>;
}

export interface ClockClaimSharesSuccess {
  delegations: Record<string, Uint8Array>;
}

export interface ClockHeadSuccess {
  head: string | undefined;
}

// STORE

export type StoreAdd = InferInvokedCapability<typeof StoreCaps.add>;
export type StoreGet = InferInvokedCapability<typeof StoreCaps.get>;

export interface StoreAddSuccess {
  allocated: number;
  link: Link;
  status: string;
  url: string;
}

export type StoreGetSuccess = Uint8Array;
