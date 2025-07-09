import { useState } from "react";
import Filters from "../../components/Filters";
import { useNavigate } from "react-router-dom";

export default function Ambulance() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    areaType: "panchayat" as "panchayat" | "ward",
    selectedArea: "",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-red-700 mb-6">Ambulance Services</h2>
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      <Filters onFilterChange={setFilters} />

      {/* Placeholder table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          List of Names ({filters.selectedArea || "No area selected"})
        </h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">#</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Contact</th>
              <th className="py-2 px-4 border">Availability</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border">1</td>
              <td className="py-2 px-4 border">John Ambulance</td>
              <td className="py-2 px-4 border">+91 1234567890</td>
              <td className="py-2 px-4 border">Available</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">2</td>
              <td className="py-2 px-4 border">Ravi Ambulance</td>
              <td className="py-2 px-4 border">+91 9876543210</td>
              <td className="py-2 px-4 border">On Duty</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
