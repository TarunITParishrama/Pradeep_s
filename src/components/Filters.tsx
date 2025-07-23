import React, { useState, useEffect } from "react";
import axios from "axios";
export type FiltersChange = (filters: {
  areaType: "panchayat" | "ward";
  selectedArea: string;
  selectedVillage?: string;
}) => void;
interface FiltersProps {
  onFilterChange: FiltersChange;
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [areaType, setAreaType] = useState<"panchayat" | "ward">("panchayat");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [panchayats, setPanchayats] = useState([]);
  const [wards, setWards] = useState([]);
  const [villages, setVillages] = useState([]);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/getDistinctAreas`)
      .then((res) => {
        const sortedPanchayats = (res.data.panchayats || []).sort((a: string, b: string) =>
          a.localeCompare(b)
        );
        const sortedWards = (res.data.wards || []).sort((a: string, b: string) => {
          const numA = parseInt(a.replace(/\D/g, ""), 10);
          const numB = parseInt(b.replace(/\D/g, ""), 10);
          return numA - numB;
        });

        setPanchayats(sortedPanchayats);
        setWards(sortedWards);
      })
      .catch((err) => console.error("Error fetching areas", err));
  }, [BASE_URL]);

  const fetchVillagesForPanchayat = async (panchayatName: string) => {
    setLoadingVillages(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/getVillagesForPanchayat/${encodeURIComponent(panchayatName)}`
      );
      setVillages(response.data.villages || []);
    } catch (error) {
      console.error("Error fetching villages:", error);
      setVillages([]);
    } finally {
      setLoadingVillages(false);
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as "panchayat" | "ward";
    setAreaType(value);
    setSelectedArea("");
    setSelectedVillage("");
    setShowVillageDropdown(false);
    setPage(1);
    onFilterChange({ areaType: value, selectedArea: "" });
  };

  const handleAreaClick = async (area: string) => {
    setSelectedArea(area);
    setSelectedVillage("");
    
    if (areaType === "panchayat") {
      await fetchVillagesForPanchayat(area);
      setShowVillageDropdown(true);
    } else {
      setShowVillageDropdown(false);
      onFilterChange({ areaType, selectedArea: area });
    }
  };

  const handleVillageSelect = (village: string) => {
    setSelectedVillage(village);
    setShowVillageDropdown(false);
    onFilterChange({ 
      areaType, 
      selectedArea, 
      selectedVillage: village 
    });
  };

  const options = areaType === "panchayat" ? panchayats : wards;
  const totalPages = Math.ceil(options.length / ITEMS_PER_PAGE);
  const currentOptions = options.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 p-4">
      {/* Radio Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Area Type:</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="panchayat"
              checked={areaType === "panchayat"}
              onChange={handleRadioChange}
            />
            Panchayat
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="ward"
              checked={areaType === "ward"}
              onChange={handleRadioChange}
            />
            Ward No
          </label>
        </div>
      </div>

      {/* Area Options */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Select {areaType}:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {currentOptions.map((area) => (
            <button
              key={area}
              onClick={() => handleAreaClick(area)}
              className={`cursor-pointer px-4 py-2 text-center rounded border ${
                selectedArea === area
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-blue-100"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Village Dropdown for Panchayat */}
      {areaType === "panchayat" && selectedArea && showVillageDropdown && (
        <div className="relative">
          <h3 className="text-lg font-semibold mb-3">
            Select Village/Ward in {selectedArea}:
          </h3>
          
          {loadingVillages ? (
            <div className="text-center py-4">Loading villages...</div>
          ) : (
            <div className="border rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
              {villages.length > 0 ? (
                villages.map((village) => (
                  <button
                    key={village}
                    onClick={() => handleVillageSelect(village)}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 ${
                      selectedVillage === village ? "bg-blue-100" : ""
                    }`}
                  >
                    {village}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No villages found</div>
              )}
            </div>
          )}
          
          <button
            onClick={() => setShowVillageDropdown(false)}
            className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
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
        <div className="mt-4 p-3 bg-green-50 rounded border">
          <strong>Selected:</strong> {selectedArea}
          {selectedVillage && (
            <span> → <strong>Village:</strong> {selectedVillage}</span>
          )}
        </div>
      )}
    </div>
  );
}
