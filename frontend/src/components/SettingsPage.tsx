const SettingsPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4 animate-fade-in">
    <h1 className="text-2xl font-semibold text-foreground mb-2">Settings</h1>
    <p className="text-sm text-muted-foreground mb-8">Manage your account and preferences.</p>

    <div className="space-y-6">
      {["Account", "Notifications", "Privacy"].map((section) => (
        <div key={section} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-1">{section}</h3>
          <p className="text-xs text-muted-foreground">Configure your {section.toLowerCase()} settings.</p>
        </div>
      ))}
    </div>
  </div>
);

export default SettingsPage;
