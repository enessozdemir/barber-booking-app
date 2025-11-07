import { NavLink } from "react-router-dom";

type AuthRedirectMessageProps = {
  question: string;
  linkText: string;
  linkTo: string;
};

const AuthRedirectMessage = ({
  question,
  linkText,
  linkTo,
}: AuthRedirectMessageProps) => {
  return (
    <p className="mt-3 text-center text-sm text-lighter">
      {question}{" "}
      <NavLink
        to={linkTo}
        className="text-blue-500 hover:underline transition-all"
      >
        {linkText}
      </NavLink>
    </p>
  );
};

export default AuthRedirectMessage;
