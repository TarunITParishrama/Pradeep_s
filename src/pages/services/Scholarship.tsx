import { useState } from "react";
import Filters from "../../components/Filters";
import { useNavigate } from "react-router-dom";

export default function Scholarship() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    areaType: "panchayat" as "panchayat" | "ward",
    selectedArea: "",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Digital Services</h2>
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
          Applicants List ({filters.selectedArea || "No area selected"})
        </h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">#</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Complaint</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border">1</td>
              <td className="py-2 px-4 border">Asha Kumari</td>
              <td className="py-2 px-4 border">Light Issue</td>
              <td className="py-2 px-4 border">Resolved</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">2</td>
              <td className="py-2 px-4 border">Ramesh Das</td>
              <td className="py-2 px-4 border">Road Issue</td>
              <td className="py-2 px-4 border">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
