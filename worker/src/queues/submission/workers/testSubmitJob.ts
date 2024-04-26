import { getConsumer } from "../../../Consumer";

/**
 * Run this function locally (by importing it into index.ts, and running `sendTestJob()`) to test functionality.
 */
export async function sendTestJob() {
  const boss = await getConsumer();
  await boss.send(
    "submission",
    {
      data: {
        name: "Digital Form Builder - Runner test",
        questions: [
          {
            category: "checkBeforeYouStart",
            question: "Do you have a UK passport?",
            fields: [
              {
                key: "ukPassport",
                title: "Do you have a UK passport?",
                type: "list",
                answer: true,
              },
            ],
            index: 0,
          },
          {
            category: "applicantDetails",
            question: "How many applicants are there?",
            fields: [
              {
                key: "numberOfApplicants",
                title: "How many applicants are there?",
                type: "list",
                answer: 1,
              },
            ],
            index: 0,
          },
          {
            category: "applicantOneDetails",
            question: "Applicant 1",
            fields: [
              {
                key: "firstName",
                title: "First name",
                type: "text",
                answer: "0",
              },
              {
                key: "middleName",
                title: "Middle name",
                type: "text",
                answer: null,
              },
              { key: "lastName", title: "Surname", type: "text", answer: "0" },
            ],
            index: 0,
          },
          {
            category: "applicantOneDetails",
            question: "Address",
            fields: [
              {
                key: "address",
                title: "Address",
                type: "text",
                answer: "0, 0, ec1y8pp",
              },
            ],
            index: 0,
          },
          {
            category: "applicantDetails",
            question: "Applicant contact details",
            fields: [
              {
                key: "phoneNumber",
                title: "Phone number",
                type: "text",
                answer: "0",
              },
              {
                key: "emailAddress",
                title: "Your email address",
                type: "text",
                answer: "jen@cautionyourblast.com",
              },
            ],
            index: 0,
          },
          {
            category: null,
            question: "Declaration",
            fields: [
              {
                key: "declaration",
                title: "Declaration",
                type: "boolean",
                answer: true,
              },
            ],
          },
        ],
        metadata: { paymentSkipped: false },
      },
      webhook_url: "",
    },
    {
      retryBackoff: true,
    }
  );
}
