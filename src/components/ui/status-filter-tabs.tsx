export interface StatusFilterOption<T extends string = string> {
  label: string;
  value: T;
}

export interface StatusFilterTabsProps<T extends string = string> {
  value: T;
  options: StatusFilterOption<T>[];
  onChange: (value: T) => void;
}

export function StatusFilterTabs<T extends string = string>({ value, options, onChange }: StatusFilterTabsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter status">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-lelampahan-gold bg-lelampahan-gold text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-lelampahan-gold hover:text-lelampahan-earth'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
