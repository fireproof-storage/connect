import { CRDTEntry } from "@fireproof/core";
import { MetaByTenantLedgerSql } from "./meta-by-tenant-ledger.js";
import { MetaSendSql } from "./meta-send.js";
import { TenantLedgerSql } from "./tenant-ledger.js";
import { TenantSql } from "./tenant.js";
import { SQLDatabase } from "./abstract-sql.js";
import { QSId, TenantLedger } from "../msg-types.js";
import { Logger } from "@adviser/cement";

export interface Connection {
  readonly tenant: TenantLedger;
  readonly conn: QSId;
}

export interface MetaMerge {
  readonly logger: Logger;
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
  // readonly sthis: SuperThis;
  readonly sql: {
    readonly tenant: TenantSql;
    readonly tenantLedger: TenantLedgerSql;
    readonly metaByTenantLedger: MetaByTenantLedgerSql;
    readonly metaSend: MetaSendSql;
  };

  readonly id: string;

  constructor(id: string, db: SQLDatabase) {
    this.db = db;
    this.id = id;
    // this.sthis = sthis;
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

  async delMeta(
    mm: Omit<MetaMerge, "metas"> & { readonly metas?: CRDTEntry[] }
  ): Promise<{ now: Date; byConnection: ByConnection }> {
    const now = mm.now || new Date();
    const byConnection = toByConnection(mm.connection);
    const metaCIDs = (mm.metas ?? []).map((meta) => meta.cid);
    const connCIDs = {
      ...byConnection,
      // needs something with is not empty to delete
      metaCIDs: metaCIDs.length ? metaCIDs : [new Date().toISOString()],
    };
    await this.sql.metaSend.deleteByConnection(connCIDs);
    await this.sql.metaByTenantLedger.deleteByConnection(connCIDs);
    return { now, byConnection };
  }

  async addMeta(mm: MetaMerge) {
    if (!mm.metas.length) {
      return;
    }
    const { now, byConnection } = await this.delMeta(mm);
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
        mm.logger.Warn().Err(e).Str("metaCID", meta.cid).Msg("addMeta");
      }
    }
  }

  async metaToSend(sink: Connection, now = new Date()): Promise<CRDTEntry[]> {
    console.log("metaToSend-1", this.id);
    const bySink = toByConnection(sink);
    console.log("metaToSend-2", this.id);
    const rows = await this.sql.metaSend.selectToAddSend({ ...bySink, now });
    console.log("metaToSend-3", this.id);
    await this.sql.metaSend.insert(
      rows.map((row) => ({
        metaCID: row.metaCID,
        reqId: row.reqId,
        resId: row.resId,
        sendAt: row.sendAt,
      }))
    );
    console.log("metaToSend-4");
    return rows.map((row) => row.meta);
  }
}
