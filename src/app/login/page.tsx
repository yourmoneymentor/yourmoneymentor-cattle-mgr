import Link from "next/link";

export default function LoginRemoved() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">No login</h1>
      <p className="text-sm text-slate-600">
        This app is configured for a single farm and does not require email login.
      </p>
      <Link className="inline-block rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/">
        Go home
      </Link>
    </div>
  );
}
