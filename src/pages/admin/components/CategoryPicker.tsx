const CATEGORIES = ["Cybersecurity", "Compliance", "AI & Automation", "IT Strategy", "News & Updates"];

interface CategoryPickerProps {
  value: string;
  onChange: (v: string) => void;
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">Category</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded-md p-2 text-sm bg-background"
      >
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}
