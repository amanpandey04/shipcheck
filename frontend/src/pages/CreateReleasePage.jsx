import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate } from "react-router";

import { addReleaseToList } from "../graphql/cacheUpdates";

import { CREATE_RELEASE } from "../graphql/mutations";

export default function CreateReleasePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [createRelease, { loading, error }] = useMutation(CREATE_RELEASE, {
    update(cache, { data }) {
      if (data?.createRelease) {
        addReleaseToList(cache, data.createRelease);
      }
    },

    onCompleted: (data) => {
      navigate(`/releases/${data.createRelease.id}`);
    },
  });

  async function handleSubmit(event) {
    event.preventDefault();

    const versionOrLabel = name.trim();

    if (!versionOrLabel) {
      return;
    }

    try {
      await createRelease({
        variables: {
          input: {
            name: `Version ${versionOrLabel}`,
            date,
            additionalInfo: additionalInfo.trim() || null,
          },
        },
      });
    } catch {
      // Apollo exposes the error through the hook's error state.
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          ← Back to Releases
        </Link>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">Create Release</h1>

        <p className="mt-2 text-base-content/70">
          Add a new release and start tracking its checklist.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <label className="form-control w-full">
            <span className="mb-2 block font-medium">Release Name:</span>

            <div className="flex w-full">
              <span className="flex shrink-0 items-center rounded-l-lg border border-r-0 border-base-300 bg-base-200 px-4 text-sm font-medium text-base-content/70">
                Version
              </span>

              <input
                type="text"
                className="input input-bordered w-full rounded-l-none border-base-300 bg-base-200 text-base-content placeholder:text-base-content/50 focus:border-[#8bd3dd] focus:ring-0"
                placeholder="2.4.0, beta, alpha"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                pattern={".*\\S.*"}
                title="Enter a version number or label."
              />
            </div>
          </label>

          <label className="form-control w-full">
            <span className="mb-2 block font-medium">Date:</span>

            <input
              type="date"
              className="input input-bordered w-full border-base-300 bg-base-200 text-base-content focus:border-[#8bd3dd] focus:ring-0"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="mb-2 block font-medium">Additional Information:</span>

            <textarea
              className="textarea textarea-bordered mt-2 min-h-36 w-full border-base-300 bg-base-200 text-base-content placeholder:text-base-content/50 focus:border-[#8bd3dd] focus:ring-0"
              placeholder="Optional notes about this release..."
              value={additionalInfo}
              onChange={(event) => setAdditionalInfo(event.target.value)}
            />
          </label>

          {error && (
            <div className="alert alert-error">
              <span>{error.message}</span>
            </div>
          )}

          <div className="card-actions justify-end">
            <Link to="/" className="btn btn-ghost">
              Cancel
            </Link>

            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating...
                </>
              ) : (
                "Create Release"
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
