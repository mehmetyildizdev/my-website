import Image from 'next/image';
import { useState } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/shadcn/utils';

const lotusMask = `url('data:image/svg+xml;charset=UTF-8,%3Csvg%20viewBox%3D%220%200%20400%20400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20transform%3D%22translate%28200%2C%20200%29%20rotate%28-90%29%22%3E%3Cpath%20d%3D%22M%200%200%20C%20100%20-120%2C%20200%20-80%2C%20200%200%20C%20200%2080%2C%20100%20120%2C%200%200%20Z%22%20fill%3D%22black%22%2F%3E%3Cpath%20d%3D%22M%200%200%20C%20100%20-120%2C%20200%20-80%2C%20200%200%20C%20200%2080%2C%20100%20120%2C%200%200%20Z%22%20fill%3D%22black%22%20transform%3D%22rotate%2872%29%22%2F%3E%3Cpath%20d%3D%22M%200%200%20C%20100%20-120%2C%20200%20-80%2C%20200%200%20C%20200%2080%2C%20100%20120%2C%200%200%20Z%22%20fill%3D%22black%22%20transform%3D%22rotate%28144%29%22%2F%3E%3Cpath%20d%3D%22M%200%200%20C%20100%20-120%2C%20200%20-80%2C%20200%200%20C%20200%2080%2C%20100%20120%2C%200%200%20Z%22%20fill%3D%22black%22%20transform%3D%22rotate%28216%29%22%2F%3E%3Cpath%20d%3D%22M%200%200%20C%20100%20-120%2C%20200%20-80%2C%20200%200%20C%20200%2080%2C%20100%20120%2C%200%200%20Z%22%20fill%3D%22black%22%20transform%3D%22rotate%28288%29%22%2F%3E%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%22150%22%20fill%3D%22black%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')`;

export function SummaryDesktopPhoto({ gradient, angle, hideContent }: SummaryUIProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div id="photo" className="z-30 flex justify-end relative w-120 h-120">
      <m.div
        style={{
          background: gradient as string,
          WebkitMaskImage: lotusMask,
          WebkitMaskSize: '100% 100%',
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: lotusMask,
          maskSize: '100% 100%',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          rotate: angle,
        }}
        className="absolute h-full aspect-square left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 after:opacity-25 shadow-xl drop-shadow-2xl"
      />
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div
          className={cn(
            'w-96 h-96 rounded-full relative transition-opacity duration-300 pointer-events-auto',
            hideContent ? 'opacity-0' : 'opacity-100'
          )}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 rounded-full w-full h-full animate-pulse bg-muted/50" />
          )}
          <Image
            src="/images/pp.webp"
            className={cn(
              'rounded-l-full transition-opacity duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            alt="me"
            width={480}
            height={480}
            priority
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
