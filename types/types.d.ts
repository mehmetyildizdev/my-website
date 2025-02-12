declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
  interface htmlProps {
    id?: string;
  }
  interface GAProps {
    trackingID: string;
  }
}

export {};
