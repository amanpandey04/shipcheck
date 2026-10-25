import { DoneIcon, OngoingIcon, PlannedIcon } from "./Icons";

const statusConfig = {
  PLANNED: {
    className: "badge-ghost",
    Icon: PlannedIcon,
  },
  ONGOING: {
    className: "badge-warning",
    Icon: OngoingIcon,
  },
  DONE: {
    className: "badge-success",
    Icon: DoneIcon,
  },
};

export default function ReleaseStatusBadge({ status, large = false }) {
  const config = statusConfig[status];

  if (!config) {
    return <span className={`badge ${large ? "badge-lg" : ""}`}>{status}</span>;
  }

  const { Icon, className } = config;

  return (
    <span
      className={`badge ${large ? "badge-lg" : ""} ${className} inline-flex items-center gap-1.5`}
    >
      <Icon size={14} />
      <span>{status}</span>
    </span>
  );
}
