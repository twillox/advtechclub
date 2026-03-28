export default function TopNav({ title = "TechClub", rightComponent }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#f9f9f9]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl shadow-[0px_12px_32px_rgba(45,52,53,0.04)]">
      <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/10">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtrrADlUs2IZ-oBSzaaHQDwYBFA2MnYhIvwqmNwVE_DDJOrdP3iAzZNspuFKPVE8EnedIWq1E01fnWgWpijhQR9AGM9BTTGMKBYceIJCxhYN5Vahhx6C7J4M9LHb19mSVqvkqzo-CPYh8gIY1AISbnPA11S-ehya_7OaKYCWBWMRoITKKOX0G54OqyMPH0jYxR9YQN38yzV3Oum2DEW-1EIx5ts0pQFtCMazObm15QmujAhjjcdx93gaNm-NqMoc_99bJJgGpcfhLQ" 
            />
          </div>
          <span className="text-lg font-bold tracking-tighter text-[#1a1a1a] dark:text-[#ffffff]">{title}</span>
        </div>
        <div className="flex items-center gap-4 text-[#5f5e5e] dark:text-[#dde4e5]">
          {rightComponent || (
            <button className="hover:text-[#1a1a1a] dark:hover:text-[#ffffff] transition-colors scale-98 active:opacity-80 transition-all">
              <span className="material-symbols-outlined">search</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
