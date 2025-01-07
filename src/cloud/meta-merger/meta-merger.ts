/*
class MetaMerger {
    mergeMeta(meta) {
    }

    getMeta() {
    }
}
*/

import { CRDTEntry, SuperThis } from "@fireproof/core";
import { MetaByTenantLedgerSql } from "./meta-by-tenant-ledger.js";
import { MetaSendSql } from "./meta-send.js";
import { TenantLedgerSql } from "./tenant-ledger.js";
import { TenantSql } from "./tenant.js";
import { SQLDatabase } from "./abstract-sql.js";
import { QSId, TenantLedger } from "../msg-types.js";

export interface Connection {
  readonly tenant: TenantLedger;
  readonly conn: QSId;
}

export interface MetaMerge {
  readonly connection: Connection;
  readonly metas: CRDTEntry[];
  readonly now?: Date;
}

export interface ByConnection {
  readonly tenant: string;
  readonly ledger: string;
  readonly reqId: string;
  readonly resId: string;
}

function toByConnection(connection: Connection): ByConnection {
  return {
    ...connection.conn,
    ...connection.tenant,
  };
}

export class MetaMerger {
  readonly db: SQLDatabase;
  readonly sthis: SuperThis;
  readonly sql: {
    readonly tenant: TenantSql;
    readonly tenantLedger: TenantLedgerSql;
    readonly metaByTenantLedger: MetaByTenantLedgerSql;
    readonly metaSend: MetaSendSql;
  };

  constructor(sthis: SuperThis, db: SQLDatabase) {
    this.db = db;
    this.sthis = sthis;
    const tenant = new TenantSql(db);
    const tenantLedger = new TenantLedgerSql(db, tenant);
    this.sql = {
      tenant,
      tenantLedger,
      metaByTenantLedger: new MetaByTenantLedgerSql(db, tenantLedger),
      metaSend: new MetaSendSql(db),
    };
  }

  async createSchema(drop = false) {
    for (const i of this.sql.metaSend.sqlCreateMetaSend(drop)) {
      await i.run();
    }
  }

  async addMeta(mm: MetaMerge) {
    if (!mm.metas.length) {
      return;
    }
    const now = mm.now || new Date();
    const byConnection = toByConnection(mm.connection);
    const connCIDs = {
      ...byConnection,
      metaCIDs: mm.metas.map((meta) => meta.cid),
    };
    await this.sql.metaSend.deleteByConnection(connCIDs);
    await this.sql.metaByTenantLedger.deleteByConnection(connCIDs);
    await this.sql.tenantLedger.ensure({
      ...mm.connection.tenant,
      createdAt: now,
    });
    for (const meta of mm.metas) {
      try {
        await this.sql.metaByTenantLedger.ensure({
          ...byConnection,
          metaCID: meta.cid,
          meta: meta,
          updateAt: now,
        });
      } catch (e) {
        this.sthis.logger.Warn().Err(e).Str("metaCID", meta.cid).Msg("addMeta");
      }
    }
  }

  async metaToSend(sink: Connection, now = new Date()): Promise<CRDTEntry[]> {
    const bySink = toByConnection(sink);
    const rows = await this.sql.metaSend.selectToAddSend({ ...bySink, now });
    await this.sql.metaSend.insert(
      rows.map((row) => ({
        metaCID: row.metaCID,
        reqId: row.reqId,
        resId: row.resId,
        sendAt: row.sendAt,
      }))
    );
    return rows.map((row) => row.meta);
  }
}
