import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { resolvers } from "../src/graphql/resolvers.js";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Query resolvers", () => {
  it("returns the list of releases", async () => {
    const releases = [{ id: "release-1" }, { id: "release-2" }];

    getReleases.mockResolvedValue(releases);

    const result = await resolvers.Query.releases();

    expect(result).toEqual(releases);
    expect(getReleases).toHaveBeenCalledOnce();
  });

  it("fetches a release using its ID", async () => {
    const release = { id: "release-123" };

    getReleaseById.mockResolvedValue(release);

    const result = await resolvers.Query.release({}, { id: "release-123" });

    expect(result).toEqual(release);
    expect(getReleaseById).toHaveBeenCalledWith("release-123");
  });
});

describe("Release field resolvers", () => {
  it("formats the release date as an ISO string", () => {
    const result = resolvers.Release.date({
      date: new Date("2026-11-01T00:00:00.000Z"),
    });

    expect(result).toBe("2026-11-01T00:00:00.000Z");
  });

  it("returns PLANNED when no steps are completed", () => {
    const result = resolvers.Release.status({
      completedStepIds: [],
    });

    expect(result).toBe("PLANNED");
  });

  it("returns ONGOING when some steps are completed", () => {
    const result = resolvers.Release.status({
      completedStepIds: [RELEASE_STEPS[0].id],
    });

    expect(result).toBe("ONGOING");
  });

  it("returns DONE when every step is completed", () => {
    const result = resolvers.Release.status({
      completedStepIds: RELEASE_STEPS.map((step) => step.id),
    });

    expect(result).toBe("DONE");
  });

  it("returns all checklist steps with the correct completion states", () => {
    const completedStepIds = [RELEASE_STEPS[1].id, RELEASE_STEPS[3].id];

    const result = resolvers.Release.steps({
      completedStepIds,
    });

    expect(result).toEqual(
      RELEASE_STEPS.map((step) => ({
        ...step,
        completed: completedStepIds.includes(step.id),
      })),
    );
  });

  it("returns the number of completed steps", () => {
    const result = resolvers.Release.completedStepsCount({
      completedStepIds: [RELEASE_STEPS[0].id, RELEASE_STEPS[1].id],
    });

    expect(result).toBe(2);
  });

  it("returns the total number of checklist steps", () => {
    const result = resolvers.Release.totalSteps();

    expect(result).toBe(RELEASE_STEPS.length);
  });
});

describe("Mutation resolvers", () => {
  it("passes the input to createRelease", async () => {
    const input = {
      name: "Version 1.2.0",
      date: "2026-11-01",
      additionalInfo: "Important changes",
    };

    const release = { id: "release-123", ...input };

    createRelease.mockResolvedValue(release);

    const result = await resolvers.Mutation.createRelease({}, { input });

    expect(result).toEqual(release);
    expect(createRelease).toHaveBeenCalledWith(input);
  });

  it("passes the input to setStepCompletion", async () => {
    const input = {
      releaseId: "release-123",
      stepId: RELEASE_STEPS[0].id,
      completed: true,
    };

    const release = { id: "release-123" };

    setStepCompletion.mockResolvedValue(release);

    const result = await resolvers.Mutation.setStepCompletion({}, { input });

    expect(result).toEqual(release);
    expect(setStepCompletion).toHaveBeenCalledWith(input);
  });

  it("passes the input to updateReleaseAdditionalInfo", async () => {
    const input = {
      releaseId: "release-123",
      additionalInfo: "Deployment instructions",
    };

    const release = { id: "release-123" };

    updateReleaseAdditionalInfo.mockResolvedValue(release);

    const result = await resolvers.Mutation.updateReleaseAdditionalInfo({}, { input });

    expect(result).toEqual(release);
    expect(updateReleaseAdditionalInfo).toHaveBeenCalledWith(input);
  });

  it("passes the release ID to deleteRelease", async () => {
    deleteRelease.mockResolvedValue(true);

    const result = await resolvers.Mutation.deleteRelease({}, { id: "release-123" });

    expect(result).toBe(true);
    expect(deleteRelease).toHaveBeenCalledWith("release-123");
  });
});

describe("Resolver error handling", () => {
  it("propagates errors from the service layer", async () => {
    const error = new Error("Database connection failed.");

    getReleases.mockRejectedValue(error);

    await expect(resolvers.Query.releases()).rejects.toBe(error);
  });
});
