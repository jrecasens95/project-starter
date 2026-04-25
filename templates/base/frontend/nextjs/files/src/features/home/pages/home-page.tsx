import { Hero } from "../components";
import { FeatureShell } from "../../../shared/components";

export function HomePage() {
  return (
    <FeatureShell>
      <Hero />
      <section className="feature-grid">
        <article className="feature-card">
          <h2>Feature boundaries</h2>
          <p>Each feature can expose a small public API through an index barrel.</p>
        </article>
        <article className="feature-card">
          <h2>Shared primitives</h2>
          <p>Common components, hooks, and utilities live in shared folders, not inside pages.</p>
        </article>
      </section>
    </FeatureShell>
  );
}
