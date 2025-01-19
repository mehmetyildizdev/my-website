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
        <div className="ml-24 w-96 h-96 bg-conic/[in_hsl_longer_hue] from-red-600 to-red-600 border-2 border-ruby rounded-full flex justify-center items-center ">
          <div className="w-80 h-80 border-2 border-sapphire rounded-full">
            <Image
              src="/images/my-pp-t.png"
              className="rounded-full"
              alt="me"
              width={512}
              height={512}
            />
          </div>
        </div>
        a
      </div>
      <div className="border-2 border-gold w-3/5">b</div>
    </section>
  );
}

export default Summary;
