import { getConsumer } from "../../Consumer";
import { setupSubmissionWorkers } from "./workers";

getConsumer().then(() => setupSubmissionWorkers());
