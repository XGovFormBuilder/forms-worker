import config from "config";
import PgBoss from "pg-boss";
import { ApplicationError } from "../utils/ApplicationError";
import pino from "pino";

const URL = config.get<string>("Queue.url");
const logger = pino().child({ method: "Consumer.create" });
let consumer;

const MINUTE_IN_S = 60;
const HOUR_IN_S = MINUTE_IN_S * 60;
const DAY_IN_S = HOUR_IN_S * 24;

const archiveFailedAfterDays = parseInt(config.get<string>("Queue.archiveFailedInDays"));
const deleteAfterDays = parseInt(config.get<string>("Queue.deleteArchivedAfterDays"));

logger.info(`archiveFailedAfterDays: ${archiveFailedAfterDays}, deleteAfterDays: ${deleteAfterDays}`);

/**
 * Sets up database connection via PgBoss and creates an instance of a "consumer" (consumes the queue).
 */
export async function create() {
  const boss = new PgBoss({
    connectionString: URL,
    archiveFailedAfterSeconds: archiveFailedAfterDays * DAY_IN_S,
    deleteAfterDays,
  });

  boss.on("error", (error) => {
    throw error;
  });

  try {
    await boss.start();
  } catch (e: any) {
    if (e.errors) {
      throw new ApplicationError("CONSUMER", "START_FAILED", `Failed to start listener ${e.errors}. Exiting`);
    }
    throw new ApplicationError("CONSUMER", "START_FAILED", `Failed to start listener ${e.message}. Exiting`);
  }

  logger.info(`Successfully started consumer at ${URL}`);
  return boss;
}

/**
 * `getConsumer` should be used whenever an instance of a consumer is needed.
 * This is to prevent too many database connections from being opened unnecessarily.
 */
export async function getConsumer() {
  try {
    if (!consumer) {
      const boss = await create();
      consumer = boss;
    }
    return consumer;
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
}
