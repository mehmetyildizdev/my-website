import { MotionValue } from "framer-motion";

declare global {
  interface Window {
     
    gtag: (...args: any[]) => void;
  }

  interface GAProps {
    trackingID: string;
  }

  interface OpeningProps extends ViewState {}

  interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    logoSrc: string;
    navLinks: { href: string; label: string }[];
    socialLinks: { href: string; icon: React.ReactNode }[];
  }

  /** Core traits for homepage components */
  interface ViewState {
    id?: string;
    isActive?: boolean;
    hideContent?: boolean;
  }

  /** Definition for a summary tab/section */
  interface SummaryTab {
    name: string;
    color: string;
    icon: any;
    Component: React.ComponentType<any>;
    noScroll?: boolean;
  }

  /**
   * Unified interface for Summary components (Desktop, Mobile, Sub-components).
   * Combines all possible props with optionality to allow broad reuse.
   */
  interface SummaryUIProps extends ViewState {
    // Tab State
    index?: number;
    activeIdx?: number;
    onTabChange?: (index: number) => void;

    // Animation & Visuals
    angle?: MotionValue<number>;
    gradient?: MotionValue<string> | string;
    animPauseStyle?: React.CSSProperties;

    // Interaction & Refs
    onScroll?: () => void;
    onToggleCheck?: (checking: boolean) => void;
    containerRef?: React.RefObject<any>;

    // Content
    tab?: SummaryTab;
  }

  interface ContactMeProps {
    onCheckingChange?: (checking: boolean) => void;
  }
}

export {};
