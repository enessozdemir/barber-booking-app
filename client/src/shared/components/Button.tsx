const Button = ({ content }: { content: string }) => {
  return (
    <button
    className="w-full py-3 px-4 mt-2 font-semibold bg-navy hover:opacity-90 transition-all rounded-xl cursor-pointer"
      type="submit"
    >
      {content}
    </button>
  );
};

export default Button;
