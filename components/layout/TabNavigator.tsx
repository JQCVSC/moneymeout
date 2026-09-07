import React from 'react';

interface TabNavigatorProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="bg-[#101626]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 inline-flex max-w-full overflow-x-auto no-scrollbar shadow-xl">
      <nav className="flex space-x-1.5" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-2.5 px-4 rounded-xl font-bold text-sm md:text-base transition-all duration-200
              ${activeTab === tab
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigator;