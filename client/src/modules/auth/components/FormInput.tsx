type InputProps = {
  label?: string;
  value: string;
  maxLength?: number;
  placeholder?: string;
  setFunction: (value: string) => void;
};

const FormInput = ({ label, value, setFunction, placeholder, maxLength }: InputProps) => {
  return (
    <div className="flex flex-col gap-1 mt-2">
      <label htmlFor="phone-number" className="text-sm">
        {label}
      </label>
      <input
        id="phone-number"
        value={value}
        maxLength={maxLength}
        onChange={(e) => setFunction(e.target.value)}
        placeholder={placeholder}
        className="w-full mb-3 p-3 rounded bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default FormInput;
