import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@apollo/client/react";

import { UPDATE_RELEASE_ADDITIONAL_INFO } from "../graphql/mutations";

export default function AdditionalInfoForm({ release }) {
  const savedInfo = (release.additionalInfo ?? "").trim();

  const [additionalInfo, setAdditionalInfo] = useState(savedInfo);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const toastTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const [updateAdditionalInfo, { loading: savingInfo }] = useMutation(
    UPDATE_RELEASE_ADDITIONAL_INFO,
  );

  const normalizedAdditionalInfo = additionalInfo.trim();
  const hasChanges = normalizedAdditionalInfo !== savedInfo;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasChanges) return;

    setSaveMessage("");
    setSaveError("");

    try {
      const result = await updateAdditionalInfo({
        variables: {
          input: {
            releaseId: release.id,
            additionalInfo: normalizedAdditionalInfo || null,
          },
        },
      });

      const savedValue = result.data?.updateReleaseAdditionalInfo?.additionalInfo ?? "";

      setAdditionalInfo(savedValue);
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current);
      }

      setSaveMessage("Saved!");

      toastTimer.current = window.setTimeout(() => {
        setSaveMessage("");
        toastTimer.current = null;
      }, 2000);
    } catch (error) {
      setSaveError(error.message);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Additional Information</h2>

          <textarea
            name="additionalInfo"
            className="textarea textarea-bordered mt-2 min-h-32 w-full border-base-300 bg-base-200 text-base-content placeholder:text-base-content/50 focus:border-[#8bd3dd] focus:ring-0"
            value={additionalInfo}
            onChange={(event) => {
              setAdditionalInfo(event.target.value);

              if (toastTimer.current !== null) {
                window.clearTimeout(toastTimer.current);
                toastTimer.current = null;
              }

              setSaveMessage("");
              setSaveError("");
            }}
            placeholder="Add notes about this release..."
          />

          {saveError && (
            <div className="alert alert-error mt-3">
              <span>{saveError}</span>
            </div>
          )}

          <div className="card-actions mt-2 justify-end">
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={!hasChanges || savingInfo}
            >
              {savingInfo ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving...
                </>
              ) : (
                "Save Information"
              )}
            </button>
          </div>
        </div>
      </form>
      {saveMessage &&
        createPortal(
          <div className="pointer-events-none fixed bottom-5 right-5 z-100 max-w-[calc(100vw-2rem)]">
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-1.5 rounded-xl border border-[#9ac9a8]/30 bg-[#2d4536] px-3 py-2 text-sm font-semibold text-[#c9e4cf] shadow-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <span>{saveMessage}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
