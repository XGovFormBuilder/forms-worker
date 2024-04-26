import { submitHandler } from "../workers/submit";
import * as axios from "axios";
jest.mock("axios");

const config = {
  meta: {},
};

test("submitHandler returns reference if there was one", async () => {
  const job = {
    data: {
      favouriteEgg: "scrambled",
    },
    webhook_url: "some_url",
  };

  axios.post.mockResolvedValueOnce({
    config,
    data: {
      reference: "ABC-DEFG",
    },
  });

  expect(submitHandler(job));
});
