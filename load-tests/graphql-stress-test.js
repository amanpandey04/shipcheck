import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000/";

const payload = JSON.stringify({
  query: `
    query {
      releases {
        id
        name
        date
        status
        completedStepsCount
        totalSteps
      }
    }
  `,
});

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "30s", target: 25 },
    { duration: "30s", target: 50 },
    { duration: "10s", target: 0 },
  ],

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const response = http.post(BASE_URL, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  let body = null;

  try {
    body = response.json();
  } catch {
    // A non-JSON response will fail the response checks below.
  }

  check(response, {
    "HTTP status is 200": (res) => res.status === 200,
    "GraphQL response contains data": () => body !== null && body.data !== undefined,
    "GraphQL response has no errors": () => body !== null && body.errors === undefined,
  });

  sleep(1);
}
