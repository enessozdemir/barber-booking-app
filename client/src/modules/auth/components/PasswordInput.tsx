type InputProps = {
  label?: string;
  placeholder?: string;
  password: string;
  setPassword: (value: string) => void;
};

const PasswordInput = ({
  label,
  placeholder,
  password,
  setPassword,
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1 mt-2">
      <label htmlFor="password" className="text-sm">
        {label}
      </label>
      <input
        id="password"
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        onKeyDown={(e) => {
          if (e.key.length === 1 && /\D/.test(e.key)) e.preventDefault();
          if (
            password.length >= 6 &&
            e.key !== "Backspace" &&
            e.key !== "Delete" &&
            e.key.length === 1
          )
            e.preventDefault();
        }}
        placeholder={placeholder}
        className="w-full mb-3 p-3 rounded bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default PasswordInput;
