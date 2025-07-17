import React, { useState, useEffect } from "react";
import axios from "axios";

type FiltersProps = {
  onFilterChange: (filters: {
    areaType: "panchayat" | "ward";
    selectedArea: string;
  }) => void;
};

export default function Filters({ onFilterChange }: FiltersProps) {
  const [areaType, setAreaType] = useState<"panchayat" | "ward">("panchayat");
  const [selectedArea, setSelectedArea] = useState("");
  const [panchayats, setPanchayats] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  console.log(BASE_URL);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/getDistinctAreas`)
      .then((res) => {
        const sortedPanchayats = (res.data.panchayats || []).sort(
          (a: string, b: string) => a.localeCompare(b)
        );
        const sortedWards = (res.data.wards || []).sort(
          (a: string, b: string) => {
            const numA = parseInt(a.replace(/\D/g, ""), 10);
            const numB = parseInt(b.replace(/\D/g, ""), 10);
            return numA - numB;
          }
        );

        setPanchayats(sortedPanchayats);
        setWards(sortedWards);
      })
      .catch((err) => console.error("Error fetching areas", err));
  }, [BASE_URL]);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as "panchayat" | "ward";
    setAreaType(value);
    setSelectedArea("");
    setPage(1); // Reset pagination when switching area type
    onFilterChange({ areaType: value, selectedArea: "" });
  };

  const options = areaType === "panchayat" ? panchayats : wards;
  const totalPages = Math.ceil(options.length / ITEMS_PER_PAGE);
  const currentOptions = options.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {/* Radio Buttons */}
      <div className="mb-4">
        <label className="font-medium mr-4">Select Area Type:</label>
        <label className="mr-4">
          <input
            type="radio"
            name="areaType"
            value="panchayat"
            checked={areaType === "panchayat"}
            onChange={handleRadioChange}
            className="mr-1"
          />
          Panchayat
        </label>
        <label>
          <input
            type="radio"
            name="areaType"
            value="ward"
            checked={areaType === "ward"}
            onChange={handleRadioChange}
            className="mr-1"
          />
          Ward No
        </label>
      </div>

      {/* Area Options */}
      <div className="mb-4">
        <label className="font-medium block mb-2">Select {areaType}:</label>
        <div className="grid grid-cols-2 gap-4">
          {currentOptions.map((area) => (
            <div
              key={area}
              onClick={() => {
                setSelectedArea(area);
                onFilterChange({ areaType, selectedArea: area });
              }}
              className={`cursor-pointer px-4 py-2 text-center rounded border ${
                selectedArea === area
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-blue-100"
              }`}
            >
              {area}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-3">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Selected Info */}
      {selectedArea && (
        <div className="text-gray-700 mt-2">
          Showing results for <strong>{selectedArea}</strong>
        </div>
      )}
    </div>
  );
}
