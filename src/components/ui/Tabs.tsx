import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  colour?: string; // Optional custom accent
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pills' | 'segmented';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'segmented',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`border-b border-slate-200 dark:border-slate-800 ${className}`}>
        <nav className="flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#1F3A6E] text-[#1F3A6E] dark:border-teal-400 dark:text-teal-300 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Segmented control style (standard)
  return (
    <div
      className={`flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
};
