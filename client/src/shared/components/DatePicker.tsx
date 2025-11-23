import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
}

export default function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const handlePrevDay = () => {
    const currentDate = new Date(value);
    currentDate.setDate(currentDate.getDate() - 1);
    onChange(currentDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(value);
    currentDate.setDate(currentDate.getDate() + 1);
    onChange(currentDate.toISOString().split('T')[0]);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePrevDay}
        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        type="button"
      >
        <PiCaretLeftBold className="text-xl" />
      </button>
      
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
      />
      
      <button
        onClick={handleNextDay}
        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        type="button"
      >
        <PiCaretRightBold className="text-xl" />
      </button>
    </div>
  );
}
