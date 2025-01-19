import Image from "next/image";
import React from "react";

/*
[border-image:conic-gradient(from_0deg,var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))_1]
*/
function Summary({ id }: htmlProps) {
  return (
    <section
      id={id}
      className="w-2/3 h-screen mx-auto flex justify-center items-center"
    >
      <div className="w-2/5">
        <div className="ml-24 w-96 h-96 border-2 border-platinum rounded-full flex justify-center items-center">
          <span className="w-96 h-96 rounded-full bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))] after:opacity-25 flex justify-center items-center relative animate-bgAnimate">
            <div className="bg-pearl w-80 h-80 border-2 border-platinum rounded-full">
              <Image
                src="/images/my-pp-t.png"
                className="rounded-full"
                alt="me"
                width={512}
                height={512}
              />
            </div>
          </span>
        </div>
        a
      </div>
      <div className="border-2 border-gold w-3/5">b</div>
    </section>
  );
}

export default Summary;
