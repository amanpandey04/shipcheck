import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ApolloServer } from "@apollo/server";

vi.mock("../src/services/releaseService.js", () => ({
  getReleases: vi.fn(),
  getReleaseById: vi.fn(),
  createRelease: vi.fn(),
  setStepCompletion: vi.fn(),
  updateReleaseAdditionalInfo: vi.fn(),
  deleteRelease: vi.fn(),
}));

import {
  getReleases,
  getReleaseById,
  createRelease,
  setStepCompletion,
  updateReleaseAdditionalInfo,
  deleteRelease,
} from "../src/services/releaseService.js";

import { RELEASE_STEPS } from "../src/constants/releaseSteps.js";
import { typeDefs } from "../src/graphql/typeDefs.js";
import { resolvers } from "../src/graphql/resolvers.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const sampleRelease = {
  id: "release-123",
  name: "Version 1.2.0",
  date: new Date("2026-11-01T00:00:00.000Z"),
  additionalInfo: "Release notes",
  completedStepIds: [RELEASE_STEPS[0].id],
};

async function executeOperation(query, variables) {
  const response = await server.executeOperation({
    query,
    variables,
  });

  expect(response.body.kind).toBe("single");

  return response.body.singleResult;
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterAll(async () => {
  await server.stop();
});

describe("GraphQL queries", () => {
  it("fetches releases with their calculated fields and checklist", async () => {
    getReleases.mockResolvedValue([sampleRelease]);

    const result = await executeOperation(`
      query {
        releases {
          id
          name
          date
          additionalInfo
          status
          completedStepsCount
          totalSteps
          steps {
            id
            label
            completed
          }
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(result.data.releases).toHaveLength(1);

    const release = result.data.releases[0];

    expect(release.id).toBe("release-123");
    expect(release.name).toBe("Version 1.2.0");
    expect(release.date).toBe("2026-11-01T00:00:00.000Z");
    expect(release.additionalInfo).toBe("Release notes");
    expect(release.status).toBe("ONGOING");
    expect(release.completedStepsCount).toBe(1);
    expect(release.totalSteps).toBe(RELEASE_STEPS.length);

    expect(release.steps).toEqual(
      RELEASE_STEPS.map((step) => ({
        id: step.id,
        label: step.label,
        completed: step.id === RELEASE_STEPS[0].id,
      })),
    );

    expect(getReleases).toHaveBeenCalledOnce();
  });

  it("fetches one release by ID", async () => {
    getReleaseById.mockResolvedValue(sampleRelease);

    const result = await executeOperation(
      `
        query ReleaseById($id: ID!) {
          release(id: $id) {
            id
            name
            status
          }
        }
      `,
      { id: "release-123" },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.release).toEqual({
      id: "release-123",
      name: "Version 1.2.0",
      status: "ONGOING",
    });

    expect(getReleaseById).toHaveBeenCalledWith("release-123");
  });
});

describe("GraphQL mutations", () => {
  it("creates a release", async () => {
    createRelease.mockResolvedValue(sampleRelease);

    const input = {
      name: "Version 1.2.0",
      date: "2026-11-01",
      additionalInfo: "Release notes",
    };

    const result = await executeOperation(
      `
        mutation CreateRelease($input: CreateReleaseInput!) {
          createRelease(input: $input) {
            id
            name
            date
            status
          }
        }
      `,
      { input },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.createRelease).toEqual({
      id: "release-123",
      name: "Version 1.2.0",
      date: "2026-11-01T00:00:00.000Z",
      status: "ONGOING",
    });

    expect(createRelease).toHaveBeenCalledWith(input);
  });

  it("updates checklist completion", async () => {
    const completedRelease = {
      ...sampleRelease,
      completedStepIds: [RELEASE_STEPS[0].id, RELEASE_STEPS[1].id],
    };

    setStepCompletion.mockResolvedValue(completedRelease);

    const input = {
      releaseId: "release-123",
      stepId: RELEASE_STEPS[1].id,
      completed: true,
    };

    const result = await executeOperation(
      `
        mutation SetStepCompletion($input: SetStepCompletionInput!) {
          setStepCompletion(input: $input) {
            id
            status
            completedStepsCount
            totalSteps
          }
        }
      `,
      { input },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.setStepCompletion).toEqual({
      id: "release-123",
      status: "ONGOING",
      completedStepsCount: 2,
      totalSteps: RELEASE_STEPS.length,
    });

    expect(setStepCompletion).toHaveBeenCalledWith(input);
  });

  it("updates additional release information", async () => {
    const updatedRelease = {
      ...sampleRelease,
      additionalInfo: "Updated deployment instructions",
    };

    updateReleaseAdditionalInfo.mockResolvedValue(updatedRelease);

    const input = {
      releaseId: "release-123",
      additionalInfo: "Updated deployment instructions",
    };

    const result = await executeOperation(
      `
        mutation UpdateAdditionalInfo(
          $input: UpdateReleaseAdditionalInfoInput!
        ) {
          updateReleaseAdditionalInfo(input: $input) {
            id
            additionalInfo
          }
        }
      `,
      { input },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.updateReleaseAdditionalInfo).toEqual({
      id: "release-123",
      additionalInfo: "Updated deployment instructions",
    });

    expect(updateReleaseAdditionalInfo).toHaveBeenCalledWith(input);
  });

  it("deletes a release", async () => {
    deleteRelease.mockResolvedValue(true);

    const result = await executeOperation(
      `
        mutation DeleteRelease($id: ID!) {
          deleteRelease(id: $id)
        }
      `,
      { id: "release-123" },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.deleteRelease).toBe(true);
    expect(deleteRelease).toHaveBeenCalledWith("release-123");
  });
});

describe("GraphQL validation and errors", () => {
  it("rejects a field that does not exist in the schema", async () => {
    const result = await executeOperation(`
      query {
        releases {
          unknownField
        }
      }
    `);

    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toContain(
      'Cannot query field "unknownField" on type "Release".',
    );

    expect(getReleases).not.toHaveBeenCalled();
  });

  it("returns a GraphQL error when a service operation fails", async () => {
    getReleaseById.mockRejectedValue(new Error("Release not found."));

    const result = await executeOperation(
      `
        query ReleaseById($id: ID!) {
          release(id: $id) {
            id
          }
        }
      `,
      { id: "missing-release" },
    );

    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toBe("Release not found.");
    expect(result.data.release).toBeNull();
  });
});
