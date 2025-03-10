import { Result, exception2Result } from "@adviser/cement";
import { ensureSuperThis, SuperThis } from "@fireproof/core";
import { exportJWK, importJWK, JWTPayload, JWTVerifyResult, jwtVerify, SignJWT } from "jose";
import { generateKeyPair, GenerateKeyPairOptions } from "jose/key/generate/keypair";
import { base58btc } from "multiformats/bases/base58";

interface BaseTokenParam {
  readonly alg: string; // defaults ES256
  readonly issuer: string;
  readonly audience: string;
  readonly validFor: number;
}
interface SessionTokenServiceParam extends Partial<BaseTokenParam> {
  readonly token: string; // env encoded jwk
}

interface SessionTokenServiceFromEnvParam extends Partial<BaseTokenParam> {
  readonly privateEnvKey?: string; // defaults CLOUD_SESSION_TOKEN_SECRET
  readonly publicEnvKey?: string; // defaults CLOUD_SESSION_TOKEN_PUBLIC
}

export async function jwk2env(jwk: CryptoKey, sthis = ensureSuperThis()): Promise<string> {
  const inPubKey = await exportJWK(jwk);
  return base58btc.encode(sthis.txt.encode(JSON.stringify(inPubKey)));
}

export async function env2jwk(env: string, alg: string, sthis = ensureSuperThis()): Promise<CryptoKey> {
  const inJWT = JSON.parse(sthis.txt.decode(base58btc.decode(env)));
  return importJWK(inJWT, alg, { extractable: true }) as Promise<CryptoKey>;
}

export interface FPCloudClaim extends JWTPayload {
  readonly userId: string;
  readonly tenants: { readonly id: string; readonly role: string }[];
  readonly ledgers: { readonly id: string; readonly role: string; readonly right: string }[];
}

export type TokenForParam = FPCloudClaim & Partial<BaseTokenParam>;

export const envKeyDefaults = {
  SECRET: "CLOUD_SESSION_TOKEN_SECRET",
  PUBLIC: "CLOUD_SESSION_TOKEN_PUBLIC",
};

export class SessionTokenService {
  readonly #key: CryptoKey;
  readonly #param: SessionTokenServiceParam;

  static async generateKeyPair(
    alg = "ES256",
    options: GenerateKeyPairOptions = { extractable: true }
  ): Promise<{ material: CryptoKeyPair; strings: { publicKey: string; privateKey: string } }> {
    const material = await generateKeyPair(alg, options);
    return {
      material,
      strings: {
        publicKey: await jwk2env(material.publicKey),
        privateKey: await jwk2env(material.privateKey),
      },
    };
  }

  static async createFromEnv(sp: SessionTokenServiceFromEnvParam, sthis: SuperThis = ensureSuperThis()) {
    let envToken = sthis.env.get(sp.privateEnvKey ?? envKeyDefaults.SECRET);
    if (!envToken) {
      envToken = sthis.env.get(sp.publicEnvKey ?? envKeyDefaults.PUBLIC);
    }
    if (!envToken) {
      throw new Error(
        `env not found for: ${sp.privateEnvKey ?? envKeyDefaults.SECRET} or ${sp.publicEnvKey ?? envKeyDefaults.PUBLIC}`
      );
    }
    return SessionTokenService.create({ token: envToken }, sthis);
  }

  static async create(stsparam: SessionTokenServiceParam, sthis: SuperThis = ensureSuperThis()) {
    const key = await env2jwk(stsparam.token, stsparam.alg ?? "ES256", sthis);
    return new SessionTokenService(key, stsparam);
  }

  private constructor(key: CryptoKey, stsparam: SessionTokenServiceParam) {
    this.#key = key;
    this.#param = stsparam;
  }

  get validFor() {
    let validFor = this.#param.validFor ?? 3600;
    if (!(0 <= validFor && validFor <= 3600000)) {
      validFor = 3600000;
    }
    return validFor;
  }

  get alg() {
    return this.#param.alg ?? "ES256";
  }

  get isssuer() {
    return this.#param.issuer ?? "fireproof";
  }

  get audience() {
    return this.#param.audience ?? "fireproof";
  }

  async validate(token: string): Promise<Result<JWTVerifyResult<FPCloudClaim>>> {
    return exception2Result(() => jwtVerify<FPCloudClaim>(token, this.#key));
  }

  // async getEnvKey(): Promise<string> {
  //   return jwk2env(ensureSuperThis(), this.#key);
  // }

  async tokenFor(p: TokenForParam): Promise<string> {
    if (this.#key.type !== "private") {
      throw new Error("key must be private");
    }
    const token = await new SignJWT({
      userId: p.userId,
      tenants: p.tenants,
      ledgers: p.ledgers,
    } satisfies FPCloudClaim)
      .setProtectedHeader({ alg: this.alg }) // algorithm
      .setIssuedAt()
      .setIssuer(p.issuer ?? this.isssuer) // issuer
      .setAudience(p.audience ?? this.audience) // audience
      .setExpirationTime(Date.now() + (p.validFor ?? this.validFor)) // expiration time
      .sign(this.#key);
    return token;
  }
}
