import Link from "next/link";
import { cx } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cattle", label: "Cattle" },
  { href: "/feedings", label: "Feed" },
  { href: "/tasks", label: "Tasks" },
  { href: "/finance", label: "Finance" },
];

export function Nav({ current }: { current: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl justify-between px-3 py-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={cx(
              "rounded-lg px-2 py-2 text-xs font-medium",
              current === it.href ? "bg-green-100 text-green-900" : "text-slate-700"
            )}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
