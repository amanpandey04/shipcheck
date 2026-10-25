import { describe, expect, it } from "vitest";
import { RELEASE_STEPS } from "../src/constants/releaseSteps.js";
import { calculateReleaseStatus } from "../src/utils/releaseStatus.js";

describe("calculateReleaseStatus", () => {
  it("returns PLANNED when no steps are completed", () => {
    expect(calculateReleaseStatus([])).toBe("PLANNED");
  });

  it("returns ONGOING when some steps are completed", () => {
    const completedStepIds = [RELEASE_STEPS[0].id];

    expect(calculateReleaseStatus(completedStepIds)).toBe("ONGOING");
  });

  it("returns DONE when all steps are completed", () => {
    const completedStepIds = RELEASE_STEPS.map((step) => step.id);

    expect(calculateReleaseStatus(completedStepIds)).toBe("DONE");
  });
});
