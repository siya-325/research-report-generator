const AboutPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4 animate-fade-in">
    <h1 className="text-2xl font-semibold text-foreground mb-2">About</h1>
    <p className="text-sm text-muted-foreground mb-8">
      Research is an AI-powered research assistant that helps you explore and understand scientific literature.
    </p>

    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-foreground mb-2">Our Mission</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        We believe research should be accessible to everyone. Our platform uses AI to help you find, understand,
        and synthesize research papers from millions of publications across all fields of study.
      </p>
    </div>

    <div className="mt-4 bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-foreground mb-2">Version</h3>
      <p className="text-xs text-muted-foreground">Research App v1.0.0</p>
    </div>
  </div>
);

export default AboutPage;
