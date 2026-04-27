import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              AIS
            </div>
            <div>
              <p className="text-sm font-semibold">Academic Inventory System</p>
              <p className="text-xs text-slate-500">Inventory & ticket lifecycle</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href="/student/dashboard"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Streamlined Resource Governance
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Manage academic resources with clarity, control, and speed.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            AIS helps students request resources, enables lab incharges to process
            item-level approvals, and gives administrators full visibility over
            inventory and ticket operations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/signin"
              className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/student/book-resource-ticket"
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Raise a Ticket
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          {[
            ["Partial Item Decisions", "Accept or reject items independently"],
            ["Role-Based Access", "Student, Lab Incharge, HOD, Admin"],
            ["Live Ticket States", "Pending, approved, issued, resolved"],
            ["Audit Friendly", "Status transitions with actor metadata"],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-slate-100 p-4">
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">How AIS works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["1. Discover", "Browse available resources by authority and category."],
              ["2. Request", "Create one ticket with multiple requested items."],
              ["3. Decide", "Lab incharge accepts/rejects each item as needed."],
              ["4. Fulfill", "Issue, return, and close lifecycle with clear tracking."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Built for every role</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Students", "Request resources and track each ticket item status."],
            ["Lab Incharge", "Process approvals, issue assets, and manage returns."],
            ["HOD", "Oversee authority-level operations and governance."],
            ["Admin", "Control departments, users, and system-wide visibility."],
          ].map(([role, detail]) => (
            <article key={role} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold">{role}</h3>
              <p className="mt-2 text-sm text-slate-600">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-14 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ready to optimize inventory operations?</h2>
            <p className="mt-2 text-sm text-slate-300">
              Start using AIS to make resource management consistent and transparent.
            </p>
          </div>
          <Link
            href="/auth/signin"
            className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Continue to Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
