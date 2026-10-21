import { useState } from "react";
import { useMutation } from "@apollo/client/react";

import { SET_STEP_COMPLETION } from "../graphql/mutations";

export default function Checklist({ release }) {
  const steps = release.steps;

  const [pendingStepIds, setPendingStepIds] = useState(() => new Set());
  const [mutationError, setMutationError] = useState("");

  const [setStepCompletion] = useMutation(SET_STEP_COMPLETION);

  async function handleChange(step) {
    if (pendingStepIds.has(step.id)) return;

    const completed = !step.completed;

    // Calculate the expected state immediately.
    const completedIds = new Set(steps.filter((item) => item.completed).map((item) => item.id));

    if (completed) {
      completedIds.add(step.id);
    } else {
      completedIds.delete(step.id);
    }

    const completedStepsCount = completedIds.size;
    const totalSteps = release.totalSteps;

    const status =
      completedStepsCount === 0
        ? "PLANNED"
        : completedStepsCount === totalSteps
          ? "DONE"
          : "ONGOING";

    const updatedSteps = steps.map((item) => ({
      ...item,
      completed: item.id === step.id ? completed : item.completed,
    }));

    setMutationError("");

    setPendingStepIds((current) => {
      const next = new Set(current);
      next.add(step.id);
      return next;
    });

    try {
      await setStepCompletion({
        variables: {
          input: {
            releaseId: release.id,
            stepId: step.id,
            completed,
          },
        },

        // Show the expected result immediately while the
        // server saves the actual change.
        optimisticResponse: {
          setStepCompletion: {
            __typename: "Release",
            id: release.id,
            name: release.name,
            date: release.date,
            additionalInfo: release.additionalInfo,
            status,
            completedStepsCount,
            totalSteps,
            steps: updatedSteps.map((item) => ({
              __typename: "ReleaseStep",
              ...item,
            })),
          },
        },
      });
    } catch (error) {
      setMutationError(error.message);
    } finally {
      setPendingStepIds((current) => {
        const next = new Set(current);
        next.delete(step.id);
        return next;
      });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {mutationError && (
        <div className="alert alert-error" role="alert">
          <span>{mutationError}</span>
        </div>
      )}

      {steps.map((step) => (
        <label
          key={step.id}
          className="checklist-item flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3 transition-[border-color,background-color,box-shadow] duration-200 sm:p-4"
        >
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={step.completed}
            onChange={() => handleChange(step)}
            disabled={pendingStepIds.has(step.id)}
          />

          <span
            className={`min-w-0 font-mono font-bold text-sm leading-relaxed sm:text-md ${
              step.completed ? "line-through opacity-60" : ""
            }`}
          >
            {step.label}
          </span>
        </label>
      ))}
    </div>
  );
}
