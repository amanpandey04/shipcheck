import { Link } from "react-router";
import { PlusIcon } from "./Icons";

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <nav className="navbar mx-auto max-w-6xl rounded-2xl border border-[#4a4a55] bg-[#25252b] px-3 shadow-[0_10px_30px_rgba(0,0,0,0.55)] ring-1 ring-white/5 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 flex-1">
          <Link to="/" className="group inline-flex min-w-0 items-center gap-2 sm:gap-3">
            <img
              src="/shipcheck-icon.png"
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-contain"
            />

            <span className="flex min-w-0 flex-col">
              <span className="font-display text-lg font-bold leading-tight tracking-tight">
                ShipCheck
              </span>

              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-base-content/60 sm:text-[10px]">
                Release workflow
              </span>
            </span>
          </Link>
        </div>

        <div className="flex flex-none items-center gap-2">
          <Link to="/releases/new" className="btn btn-secondary btn-sm gap-2 sm:btn-md">
            <PlusIcon size={16} />
            <span className="hidden sm:inline">New Release</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
