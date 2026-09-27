const SETTING_SECTIONS = [
  {
    title: "General",
    items: [
      { label: "Display Name", value: "TRACEFIX User", type: "text" },
      { label: "Email", value: "user@example.com", type: "text" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { label: "GitHub OAuth", value: "Connected", type: "status-ok" },
      { label: "GitLab OAuth", value: "Not connected", type: "status-off" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { label: "Investigation complete", value: "Enabled", type: "status-ok" },
      { label: "Weekly digest", value: "Disabled", type: "status-off" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-sm text-[#6b7280]">
          Manage your account preferences and integrations.
        </p>
      </div>

      {SETTING_SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
            {section.title}
          </h2>
          <div className="flex flex-col divide-y divide-[#1e1e2e] bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <span className="text-sm text-[#9ca3af]">{item.label}</span>
                <span
                  className={`text-sm font-medium ${
                    item.type === "status-ok"
                      ? "text-[#22c55e]"
                      : item.type === "status-off"
                      ? "text-[#6b7280]"
                      : "text-white"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-[#6b7280] px-1">
        Full settings management will be available in the next release.
      </p>
    </div>
  );
}
