import { useMutation, useQuery } from "@apollo/client/react";
import { Link, useNavigate, useParams } from "react-router";

import Checklist from "../components/Checklist";
import AdditionalInfoForm from "../components/AdditionalInfoForm";
import { formatReleaseDate } from "../utils/formatReleaseDate";

import { removeReleaseFromList } from "../graphql/cacheUpdates";
import { DELETE_RELEASE } from "../graphql/mutations";
import { GET_RELEASE } from "../graphql/queries";

const statusStyles = {
  PLANNED: "badge-ghost",
  ONGOING: "badge-warning",
  DONE: "badge-success",
};

export default function ReleaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data,
    loading: releaseLoading,
    error: releaseError,
  } = useQuery(GET_RELEASE, {
    variables: { id },
  });

  const [deleteRelease, { loading: deleting }] = useMutation(DELETE_RELEASE, {
    update(cache, { data }) {
      if (data?.deleteRelease) {
        removeReleaseFromList(cache, id);
      }
    },
  });

  if (releaseLoading) {
    return (
      <section className="flex min-h-60 items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </section>
    );
  }

  if (releaseError) {
    return (
      <section className="rounded-lg border border-error/30 bg-error/10 p-6">
        <h1 className="text-xl font-semibold text-error">Failed to load release</h1>

        <p className="mt-2 text-sm text-base-content/70">{releaseError.message}</p>
      </section>
    );
  }

  if (!data?.release) {
    return (
      <section className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Release not found</h1>

        <Link to="/" className="btn btn-primary">
          Back to Releases
        </Link>
      </section>
    );
  }

  const release = data.release;

  const progress =
    release.totalSteps === 0
      ? 0
      : Math.round((release.completedStepsCount / release.totalSteps) * 100);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${release.name}"? This cannot be undone.`);

    if (!confirmed) return;

    try {
      await deleteRelease({
        variables: {
          id: release.id,
        },
      });

      navigate("/");
    } catch (error) {
      window.alert(`Failed to delete release: ${error.message}`);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          ← All Releases
        </Link>

        <button
          type="button"
          className="btn btn-error btn-sm shrink-0"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Release"}
        </button>
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="release-name text-2xl tracking-tight sm:text-3xl">{release.name}</h1>

              <p className="mt-1 text-base-content/60">{formatReleaseDate(release.date)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge badge-lg ${statusStyles[release.status]}`}>
                {release.status}
              </span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono font-medium">Progress</span>

              <span className="text-sm text-base-content/70">
                {release.completedStepsCount}/{release.totalSteps} completed
              </span>
            </div>

            <progress className="progress progress-primary w-full" value={progress} max="100" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Checklist</h2>

          <p className="mt-1 text-sm text-base-content/60">
            Complete each step as the release progresses.
          </p>
        </div>

        <Checklist release={release} />
      </div>

      <AdditionalInfoForm key={release.id} release={release} />
    </section>
  );
}
