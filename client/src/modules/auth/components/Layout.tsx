import RazorIcons from "./RazorIcons";

const Layout = ({ element }: { element: React.ReactNode }) => {
  return (
    <div className="w-xl max-w-11/12 border border-lighter rounded-2xl p-6 shadow-sm shadow-lighter">
      <RazorIcons />
      {element}
    </div>
  );
};

export default Layout;
