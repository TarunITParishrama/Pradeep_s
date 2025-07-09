import { useNavigate } from "react-router-dom";

const tabs = [
  {
    label: "Ambulance",
    icon: "https://img.icons8.com/3d-fluency/94/ambulance.png",
    route: "/services/ambulance",
  },
  {
    label: "Scholarship",
    icon: "https://img.icons8.com/3d-fluency/94/graduation-cap.png",
    route: "/services/scholarship",
  },
  {
    label: "Materialistic",
    icon: "https://img.icons8.com/3d-fluency/94/clothes.png",
    route: "/services/materialistic",
  },
  {
    label: "Others",
    icon: "https://img.icons8.com/3d-fluency/94/more.png",
    route: "/services/others",
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 to-blue-100 px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold text-indigo-800">Services</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Tab Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {tabs.map((tab) => (
          <div
            key={tab.label}
            onClick={() => navigate(tab.route)}
            className={`bg-white rounded-xl p-5 flex flex-col items-center cursor-pointer shadow-md transition-transform hover:shadow-xl hover:-translate-y-1 border border-gray-200 hover:border-indigo-500`}
          >
            <img src={tab.icon} alt={tab.label} className="w-16 h-16 mb-3" />
            <p className="text-md font-semibold text-indigo-900 text-center">
              {tab.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
