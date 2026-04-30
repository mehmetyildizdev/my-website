export default function Footer() {
  return (
    <footer className="bottom-0 left-0 w-full h-8 bg-pearl border-t border-silver flex items-center justify-center">
      <p className="text-xs">
        © 2023 <a href="https://mehmetyildiz.dev/">Mehmet Yildiz</a>. All rights
        reserved.
      </p>
      <div className=" hidden ml-4 space-x-4">
        <a href="/privacy" className="text-emerald text-xs">
          Privacy Policy
        </a>
        <a href="/terms" className="text-emerald text-xs">
          Terms of Service
        </a>
      </div>
    </footer>
  );
}
