export default function MyPhilosophy() {
  return (
    <section className="p-8 md:p-12 space-y-8">
      <header className="space-y-2">
        <h3 className="text-xl font-black tracking-tighter uppercase italic bg-linear-to-r from-sapphire via-platinum to-emerald bg-clip-text text-transparent">
          The Alchemist&apos;s Code
        </h3>
        <div className="h-1 w-20 bg-linear-to-r from-sapphire to-transparent rounded-full" />
      </header>

      <div className="space-y-6 text-foreground/80 leading-relaxed text-sm md:text-base lg:text-lg italic font-light">
        <p>
          I have always viewed development as the modern equivalent of alchemy, not as a collection
          of static tools, but as a dynamic process of transmuting raw logic and complex engineering
          into something elegant, intuitive, and valuable. To build software is to follow a chain of
          thought that mirrors the ancient pursuit of the &quot;Great Work.&quot;
        </p>

        <div className="space-y-6 not-italic font-normal">
          <p>
            In my forge, the &quot;engine&quot; of development follows two immutable principles.
            First is <strong>The Purity of the Process</strong>. Just as an alchemist must isolate
            materials before they can be combined, software must be ruthlessly decoupled. I see the
            re-writing of existing code as the ultimate impurity, a waste of intellectual energy. By
            breaking a system down into pure, logical classifications of state and structure, we
            ensure that every element is a reusable &quot;elemental&quot; building block, ready to
            be synthesized into any new form without redundancy.
          </p>

          <p>
            Second is <strong>The Unity of the System</strong>. Historical alchemy taught that the
            microcosm reflects the macrocosm; nothing exists in isolation. I reject the modern trend
            of &quot;walled gardens,&quot; software silos designed to hoard data and trap users
            within digital islands. My philosophy is rooted in the open-source ethos: software
            should be engineered to flow, communicate, and integrate seamlessly within the broader
            digital universe.
          </p>

          <p>
            We live in an age of <strong>Holistic Fragmentation</strong>. While we must break our
            builds into granular pieces to achieve precision, our outcomes must always incline
            toward the holistic. This approach is increasingly what the world demands, systems like{' '}
            <em>headless CMSs</em> or <em>standardized APIs</em> that favor interoperability over
            isolation.
          </p>
        </div>

        <p className="italic text-foreground/60 border-l-2 border-sapphire/30 pl-4 mt-6">
          Even when existing tools make total unification feel impossible, the philosophy remains
          the goal, to build software that acts not as a cage, but as a bridge to the broader
          macrocosm of human knowledge.
        </p>
      </div>
    </section>
  );
}
