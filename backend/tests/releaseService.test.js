import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/db/prisma.js", () => ({
  prisma: {
    release: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../src/db/prisma.js";
import { RELEASE_STEPS } from "../src/constants/releaseSteps.js";
import {
  getReleases,
  getReleaseById,
  createRelease,
  setStepCompletion,
  updateReleaseAdditionalInfo,
  deleteRelease,
} from "../src/services/releaseService.js";

const sampleRelease = {
  id: "release-123",
  name: "Version 1.0.0",
  date: new Date("2026-11-01T00:00:00.000Z"),
  additionalInfo: null,
  completedStepIds: [],
};

beforeEach(() => {
  vi.resetAllMocks();

  prisma.release.findMany.mockResolvedValue([]);
  prisma.release.findUnique.mockResolvedValue(null);
  prisma.release.create.mockResolvedValue(sampleRelease);
  prisma.release.update.mockResolvedValue(sampleRelease);
  prisma.release.delete.mockResolvedValue(sampleRelease);
});

describe("getReleases", () => {
  it("returns all releases ordered by date", async () => {
    const releases = [{ id: "release-1" }, { id: "release-2" }];

    prisma.release.findMany.mockResolvedValue(releases);

    const result = await getReleases();

    expect(result).toEqual(releases);
    expect(prisma.release.findMany).toHaveBeenCalledWith({
      orderBy: { date: "asc" },
    });
  });
});

describe("getReleaseById", () => {
  it("retrieves a release by its ID", async () => {
    prisma.release.findUnique.mockResolvedValue(sampleRelease);

    const result = await getReleaseById("release-123");

    expect(result).toEqual(sampleRelease);
    expect(prisma.release.findUnique).toHaveBeenCalledWith({
      where: { id: "release-123" },
    });
  });
});

describe("createRelease", () => {
  it("trims the name and additional information", async () => {
    const resultRelease = {
      ...sampleRelease,
      name: "Version 1.2.0",
      additionalInfo: "Important changes",
    };

    prisma.release.create.mockResolvedValue(resultRelease);

    const result = await createRelease({
      name: "  Version 1.2.0  ",
      date: "2026-11-01",
      additionalInfo: "  Important changes  ",
    });

    expect(result).toEqual(resultRelease);
    expect(prisma.release.create).toHaveBeenCalledWith({
      data: {
        name: "Version 1.2.0",
        date: new Date("2026-11-01"),
        additionalInfo: "Important changes",
      },
    });
  });

  it("converts blank additional information to null", async () => {
    await createRelease({
      name: "Version 1.2.0",
      date: "2026-11-01",
      additionalInfo: "   ",
    });

    expect(prisma.release.create).toHaveBeenCalledWith({
      data: {
        name: "Version 1.2.0",
        date: new Date("2026-11-01"),
        additionalInfo: null,
      },
    });
  });

  it("rejects an empty release name", async () => {
    await expect(
      createRelease({
        name: "   ",
        date: "2026-11-01",
      }),
    ).rejects.toThrow("Release name cannot be empty.");

    expect(prisma.release.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid release date", async () => {
    await expect(
      createRelease({
        name: "Version 1.2.0",
        date: "not-a-date",
      }),
    ).rejects.toThrow("Invalid release date.");

    expect(prisma.release.create).not.toHaveBeenCalled();
  });
});

describe("setStepCompletion", () => {
  it("marks a step complete and keeps completed IDs in checklist order", async () => {
    const firstStep = RELEASE_STEPS[0];
    const secondStep = RELEASE_STEPS[1];

    prisma.release.findUnique.mockResolvedValue({
      ...sampleRelease,
      completedStepIds: [secondStep.id],
    });

    const expectedCompletedIds = RELEASE_STEPS.filter((step) =>
      [firstStep.id, secondStep.id].includes(step.id),
    ).map((step) => step.id);

    await setStepCompletion({
      releaseId: "release-123",
      stepId: firstStep.id,
      completed: true,
    });

    expect(prisma.release.update).toHaveBeenCalledWith({
      where: { id: "release-123" },
      data: {
        completedStepIds: {
          set: expectedCompletedIds,
        },
      },
    });
  });

  it("removes a step when it is marked incomplete", async () => {
    const firstStep = RELEASE_STEPS[0];
    const secondStep = RELEASE_STEPS[1];

    prisma.release.findUnique.mockResolvedValue({
      ...sampleRelease,
      completedStepIds: [firstStep.id, secondStep.id],
    });

    await setStepCompletion({
      releaseId: "release-123",
      stepId: secondStep.id,
      completed: false,
    });

    expect(prisma.release.update).toHaveBeenCalledWith({
      where: { id: "release-123" },
      data: {
        completedStepIds: {
          set: [firstStep.id],
        },
      },
    });
  });

  it("rejects an invalid checklist step ID", async () => {
    await expect(
      setStepCompletion({
        releaseId: "release-123",
        stepId: "invalid-step",
        completed: true,
      }),
    ).rejects.toThrow("Invalid release step: invalid-step");

    expect(prisma.release.findUnique).not.toHaveBeenCalled();
    expect(prisma.release.update).not.toHaveBeenCalled();
  });

  it("rejects completion updates for a missing release", async () => {
    await expect(
      setStepCompletion({
        releaseId: "missing-release",
        stepId: RELEASE_STEPS[0].id,
        completed: true,
      }),
    ).rejects.toThrow("Release not found.");

    expect(prisma.release.update).not.toHaveBeenCalled();
  });
});

describe("updateReleaseAdditionalInfo", () => {
  it("trims and saves additional information", async () => {
    prisma.release.findUnique.mockResolvedValue(sampleRelease);

    await updateReleaseAdditionalInfo({
      releaseId: "release-123",
      additionalInfo: "  Deployment instructions  ",
    });

    expect(prisma.release.update).toHaveBeenCalledWith({
      where: { id: "release-123" },
      data: {
        additionalInfo: "Deployment instructions",
      },
    });
  });

  it("converts blank additional information to null", async () => {
    prisma.release.findUnique.mockResolvedValue(sampleRelease);

    await updateReleaseAdditionalInfo({
      releaseId: "release-123",
      additionalInfo: "   ",
    });

    expect(prisma.release.update).toHaveBeenCalledWith({
      where: { id: "release-123" },
      data: {
        additionalInfo: null,
      },
    });
  });

  it("rejects updates for a missing release", async () => {
    await expect(
      updateReleaseAdditionalInfo({
        releaseId: "missing-release",
        additionalInfo: "Some notes",
      }),
    ).rejects.toThrow("Release not found.");

    expect(prisma.release.update).not.toHaveBeenCalled();
  });
});

describe("deleteRelease", () => {
  it("deletes an existing release and returns true", async () => {
    prisma.release.findUnique.mockResolvedValue(sampleRelease);

    const result = await deleteRelease("release-123");

    expect(result).toBe(true);
    expect(prisma.release.delete).toHaveBeenCalledWith({
      where: { id: "release-123" },
    });
  });

  it("rejects deletion when the release does not exist", async () => {
    await expect(deleteRelease("missing-release")).rejects.toThrow("Release not found.");

    expect(prisma.release.delete).not.toHaveBeenCalled();
  });
});
