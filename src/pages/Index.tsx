import TeaCupAnimation from "@/components/TeaCupAnimation";
import ReviewSystem from "@/components/ReviewSystem";

const Index = () => {
  return (
    <main className="bg-white min-h-screen min-h-[100dvh] relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-6">
        <div className="text-slate-900 font-extrabold text-base sm:text-lg tracking-[0.2em] uppercase">
          Basilur
        </div>
        <div className="hidden sm:flex items-center gap-8 text-xs tracking-[0.2em] uppercase text-slate-600 font-medium">
          <a 
            href="https://www.basilurtea.com/collections/leaf-of-ceylon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Collection
          </a>
          <button 
            onClick={() => {
              const element = document.querySelector('[data-tea-container]');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-slate-900 transition-colors cursor-pointer uppercase tracking-[0.2em]"
          >
            Story
          </button>
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
        <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-2 sm:gap-6">
          <div className="text-slate-900 font-bold text-sm sm:text-lg tracking-[0.15em] uppercase">
            Basilur
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600 tracking-wide whitespace-nowrap">
            Premium Fresh Tea · Sri Lanka
          </p>
          <p className="text-[10px] sm:text-xs text-slate-600/50 whitespace-nowrap">
            © 2026 Basilur Tea
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
