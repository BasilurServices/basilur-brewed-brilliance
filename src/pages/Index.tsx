import TeaCupAnimation from "@/components/TeaCupAnimation";
import ReviewSystem from "@/components/ReviewSystem";

const Index = () => {
  return (
    <main className="bg-white min-h-screen relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-6">
        <div className="text-slate-900 font-extrabold text-base sm:text-lg tracking-[0.2em] uppercase">
          Basilur
        </div>
        <div className="hidden sm:flex items-center gap-8 text-xs tracking-[0.2em] uppercase text-slate-600">
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Collection</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Story</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Process</span>
        </div>
      </nav>

      {/* Hero Section: Review System (Loads First) */}
      <ReviewSystem />

      {/* Scrollytelling Canvas: Cup Animation (Triggers on Scroll) */}
      <div data-tea-container>
        <TeaCupAnimation />
      </div>

      {/* Footer */}
      <footer className="bg-white py-20 px-6 sm:px-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-slate-900 font-bold text-lg tracking-[0.15em] uppercase">
            Basilur
          </div>
          <p className="text-xs text-slate-600 tracking-wide">
            Premium Fresh Tea · Sri Lanka
          </p>
          <p className="text-xs text-slate-600/50">
            © 2026 Basilur Tea
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
