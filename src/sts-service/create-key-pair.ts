// deno run --allow-env --unstable-sloppy-imports /Users/menabe/Software/fproof/connect/src/sts-service/create-key-pair.ts
import { envKeyDefaults, SessionTokenService } from "./sts-service.js";

const { strings } = await SessionTokenService.generateKeyPair();

// console.log(">", await exportJWK(privateKey))

// eslint-disable-next-line no-console
console.log(`${envKeyDefaults.PUBLIC}=${strings.publicKey}`);
// eslint-disable-next-line no-console
console.log(`${envKeyDefaults.SECRET}=${strings.privateKey}`);

// const txtEncoder = new TextEncoder()
// const inPubKey = await exportJWK(publicKey)
// const publicTxt =base64.encode(txtEncoder.encode(JSON.stringify(inPubKey)))
// console.log("Public:", publicTxt)
// const inPrivKey = await exportJWK(privateKey)
// const privateTxt =base64.encode(txtEncoder.encode(JSON.stringify(inPrivKey)))
// console.log("Private:", privateTxt)

// const publicJWT = JSON.parse(txtDecoder.decode(base64.decode(publicTxt)))
// console.log("Public=", await exportJWK(await importJWK(publicJWT, "Ed25519")), inPubKey)

// const privateJWT = JSON.parse(txtDecoder.decode(base64.decode(privateTxt)))
// console.log("Private=", await exportJWK(await importJWK(privateJWT, "Ed25519", { extractable: true})), inPrivKey)

//const key = await env2jwk(strings.privateKey, "ES256");
//
//const txtDecoder = new TextDecoder();
//const keyData = JSON.parse(txtDecoder.decode(base58btc.decode(strings.privateKey)));
//console.log(">>>>>>keydata:", keyData);
//
////const keyData: types.JWK = { ...jwk }
////  delete keyData.alg
////  delete keyData.use
//
//// const sub = await crypto.subtle.importKey(
//  "jwk",
//  keyData,
//  {
//    name: "ECDSA",
//    namedCurve: "P-256",
//  },
//  true,
//  ["sign"]
//);
//
//// console.log(">>>>>>", sub[Symbol.toStringTag], sub.constructor.name);
//
//// console.log(">>>>>>", key[Symbol.toStringTag]);
//
//const token = await new SignJWT({
//  userId: "userId",
//  tenants: ["tenant"],
//  ledgers: ["ledger"],
//})
//  .setProtectedHeader({ alg: "ES256" }) // algorithm
//  .setIssuedAt()
//  .setIssuer("issuer") // issuer
//  .setAudience("audience") // audience
//  .setExpirationTime(Date.now() + 3600) // expiration time
//  .sign(key);
//
//console.log(`TOKEN=${token}`, material.privateKey);
