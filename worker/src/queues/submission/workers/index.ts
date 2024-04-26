import { getConsumer } from "../../../Consumer";
import * as submit from "./submit";
import pino from "pino";
import PgBoss from "pg-boss";
import config from "config";

const queue = "submission";
const logger = pino().child({
  queue,
});

const newJobCheckInterval = parseInt(config.get<"string">("newJobCheckInterval"));
export async function setupSubmissionWorkers() {
  const consumer: PgBoss = await getConsumer();

  logger.info(`starting queue '${queue}' workers, checking every ${newJobCheckInterval}ms`);

  logger.info(`starting 'submitHandler' listener`);
  await consumer.work("submission", { newJobCheckInterval: newJobCheckInterval }, submit.submitHandler);
}
