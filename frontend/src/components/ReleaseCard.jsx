import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@apollo/client/react";

import { DELETE_RELEASE } from "../graphql/mutations";
import { removeReleaseFromList } from "../graphql/cacheUpdates";

import { formatReleaseDate } from "../utils/formatReleaseDate";

const statusStyles = {
  PLANNED: "badge-ghost",
  ONGOING: "badge-warning",
  DONE: "badge-success",
};

export default function ReleaseCard({ release }) {
  const [deleteError, setDeleteError] = useState("");

  const [deleteRelease, { loading: deleting }] = useMutation(DELETE_RELEASE, {
    update(cache, { data }) {
      if (data?.deleteRelease) {
        removeReleaseFromList(cache, release.id);
      }
    },
  });

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${release.name}"? This cannot be undone.`);

    if (!confirmed) return;

    setDeleteError("");

    try {
      await deleteRelease({
        variables: {
          id: release.id,
        },
      });
    } catch (error) {
      setDeleteError(error.message);
    }
  }

  const progress =
    release.totalSteps === 0
      ? 0
      : Math.round((release.completedStepsCount / release.totalSteps) * 100);

  return (
    <article className="card border border-base-300 bg-base-100 shadow-sm transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary hover:shadow-xl">
      <div className="card-body gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="card-title release-name">{release.name}</h2>

            <p className="text-sm text-base-content/60">{formatReleaseDate(release.date)}</p>
          </div>

          <span className={`badge ${statusStyles[release.status]}`}>{release.status}</span>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-mono text-base-content/70">Checklist Progress</span>

            <span className="font-mono font-medium tabular-nums">
              {release.completedStepsCount}/{release.totalSteps}
            </span>
          </div>

          <progress className="progress progress-primary w-full" value={progress} max="100" />
        </div>

        {deleteError && <p className="text-sm text-error">{deleteError}</p>}

        <div className="card-actions justify-end">
          <button
            type="button"
            className="btn btn-error btn-soft btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>

          <Link to={`/releases/${release.id}`} className="btn btn-soft btn-view btn-sm">
            View Release
          </Link>
        </div>
      </div>
    </article>
  );
}
