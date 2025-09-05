import { memo } from 'react';

interface DropdownItem {
  id: string;
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  buttonLabel: string;
  items: DropdownItem[];
  className?: string;
}

const Dropdown = memo(({ buttonLabel, items, className = '' }: DropdownProps) => {
  return (
    <div className="group/dropdown relative">
      <button
        onMouseDown={e => e.stopPropagation()}
        className={`rounded bg-violet-600 px-2 py-1 text-xs font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-violet-700 active:scale-95 ${className}`}
        type="button"
      >
        {buttonLabel} ▼
      </button>
      <div className="invisible absolute top-full left-0 z-20 mt-1 w-32 rounded border border-gray-600 bg-zinc-800 opacity-0 shadow-lg transition-all duration-200 group-focus-within/dropdown:visible group-focus-within/dropdown:opacity-100 group-hover/dropdown:visible group-hover/dropdown:opacity-100">
        {items.map(item => (
          <button
            key={item.id}
            onClick={item.onClick}
            onMouseDown={e => e.stopPropagation()}
            className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-zinc-700 focus:bg-zinc-700 focus:outline-none"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
