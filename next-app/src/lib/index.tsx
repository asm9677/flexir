import { MdError } from "react-icons/md";
import { toast } from "react-toastify";

export const notify = (message: string, isSuccess: boolean) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    icon: <MdError size={24} />,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: `${
      isSuccess ? "bg-success-color" : "bg-error-color"
    } text-white`,
    bodyClassName: "font-bold",
    progressClassName: `${isSuccess ? "bg-green.100" : "bg-red-600"}`,
  });
};

export const tokens = [
  {
    id: 1,
    name: "token",
    src: "",
  },
];

export const coins = [
  {
    id: 1,
    name: "USDT",
    src: "/images/logo_USDT.png",
  },
];
