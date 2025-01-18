import Opening from "./components/Opening";
import Summary from "./components/Summary";

export default function Home() {
  return (
    <section className="bg-diamond">
      <Opening id="hero" />
      <Summary id="summary" />
    </section>
  );
}
