const Footer = () => {
  return (
    <footer className="no-print flex h-10 shrink-0 items-center justify-between border-t border-slate-800 bg-slate-900 px-4 text-xs text-slate-400 sm:px-6">
      <span>&copy; {new Date().getFullYear()} National Grid Upgrade Programme &mdash; internal demo</span>
      <span>Data source: P6 export (mock)</span>
    </footer>
  );
};

export default Footer;
