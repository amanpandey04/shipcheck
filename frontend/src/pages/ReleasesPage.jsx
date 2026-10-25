import { useQuery } from "@apollo/client/react";

import ReleaseCard from "../components/ReleaseCard";
import { GET_RELEASES } from "../graphql/queries";

export default function ReleasesPage() {
  const { data, loading, error } = useQuery(GET_RELEASES);

  if (loading) {
    return (
      <section className="flex min-h-60 items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-error/30 bg-error/10 p-6">
        <h1 className="text-xl font-semibold text-error">Failed to load releases</h1>

        <p className="mt-2 text-sm text-base-content/70">{error.message}</p>
      </section>
    );
  }

  const releases = data?.releases ?? [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Release Checklist
        </p>

        <h1 className="mt-1 text-3xl text-primary font-bold tracking-tight sm:text-4xl">
          Releases
        </h1>

        <p className="mt-2 max-w-2xl text-base-content/70">
          Track the progress of your software releases from planning through production.
        </p>
      </div>

      {releases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 bg-base-100 p-8 text-center">
          <h2 className="text-lg font-semibold">No releases yet</h2>

          <p className="mt-2 text-sm text-base-content/60">
            Create your first release to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {releases.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </div>
      )}
    </section>
  );
}
