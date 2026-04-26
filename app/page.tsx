import Opening from "@/components/homepage/Opening";
import Summary from "@/components/homepage/Summary";

export default function Home() {
  return (
    <section className="bg-diamond pt-16">
      <Opening id="hero" />
      <Summary id="aboutme" />
    </section>
  );
}
