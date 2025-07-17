import { useNavigate } from "react-router-dom";
import mdpic from "../assets/MDPhoto.jpg";

type DashboardItem = {
  label: string;
  icon: string;
  route?: string;
  onClick?: (navigate: ReturnType<typeof useNavigate>) => void;
};

export default function Home() {
  const navigate = useNavigate();

  const dashboardItems: DashboardItem[] = [
    {
      label: "Services",
      icon: "https://img.icons8.com/3d-fluency/94/trust.png",
      route: "/services",
    },
    {
      label: "Family tree",
      icon: "https://img.icons8.com/3d-fluency/94/acacia.png",
      route: "/family-tree",
    },
    {
      label: "Logout",
      icon: "https://img.icons8.com/3d-fluency/94/shutdown.png",
      onClick: (navigate) => {
        localStorage.removeItem("loggedIn");
        navigate("/");
        window.location.href = "/";
      },
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-green-100 to-orange-100 overflow-hidden p-8">
      {/* Background MD image */}
      <img
        src={mdpic}
        alt="MD"
        className="flex top-0 left-28 h-full opacity-70 object-contain z-0 pointer-events-none"
      />

      {/* Overlay to fade behind the tiles */}
      <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-lg z-10" />

      {/* Dashboard content */}
      <div className="relative z-20">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-700">
          Pradeep Eshwar's Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-56">
          {dashboardItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() =>
                item.route ? navigate(item.route) : item.onClick?.(navigate)
              }
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 text-center cursor-pointer transform hover:-translate-y-1"
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-14 h-14 mx-auto mb-4"
              />
              <p className="text-lg font-semibold text-indigo-900">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
