import { ChevronDown } from 'lucide-react';

interface FilterOption<T extends string> {
  label: string;
  value: T;
}

interface FilterSelectProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function FilterSelect<T extends string>({
  options,
  value,
  onChange,
  label,
}: FilterSelectProps<T>) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/35">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          // appearance-none strips the OS-native control so the black-border,
          // mono-uppercase treatment matches the rest of the app.
          className="appearance-none border border-black/20 bg-white py-2 pr-8 pl-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-black outline-none transition-colors hover:border-black focus:border-black"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-black/40"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}
