import { useState } from "react";
import Filters from "../../components/Filters";
import { useNavigate } from "react-router-dom";

export default function Materialistic() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    areaType: "panchayat" as "panchayat" | "ward",
    selectedArea: "",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-yellow-700 mb-6">Hospital Service</h2>
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
          Aid Requests ({filters.selectedArea || "No area selected"})
        </h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">#</th>
              <th className="py-2 px-4 border">Applicant</th>
              <th className="py-2 px-4 border">Item Requested</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border">1</td>
              <td className="py-2 px-4 border">Mohan Yadav</td>
              <td className="py-2 px-4 border">Wheelchair</td>
              <td className="py-2 px-4 border">Provided</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">2</td>
              <td className="py-2 px-4 border">Leela Bai</td>
              <td className="py-2 px-4 border">Bedsheets</td>
              <td className="py-2 px-4 border">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
