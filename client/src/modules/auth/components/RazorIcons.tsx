import { TbRazorElectric } from "react-icons/tb";
import { TbRazor } from "react-icons/tb";
import { GiRazor } from "react-icons/gi";
import { RxScissors } from "react-icons/rx";

const RazorIcons = () => {
  return (
    <div className="mb-14">
      <h2 className="text-center font-bold text-3xl sm:text-4xl mb-5">
        Mühendis Berber
      </h2>
      <div className="flex items-center justify-between">
        <TbRazorElectric className="text-4xl sm:text-5xl" color="#4A90E2" />
        <RxScissors className="text-4xl sm:text-5xl" color="#9013FE" />
        <GiRazor className="text-4xl sm:text-5xl" color="#F5A623" />
        <TbRazor className="text-4xl sm:text-5xl" color="#50E3C2" />
      </div>
    </div>
  );
};

export default RazorIcons;
