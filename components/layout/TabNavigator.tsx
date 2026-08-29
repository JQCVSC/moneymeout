import React from 'react';

interface TabNavigatorProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-[var(--border-color)]">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-base transition-colors duration-200
              ${activeTab === tab
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-gray-700 hover:border-gray-400'
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