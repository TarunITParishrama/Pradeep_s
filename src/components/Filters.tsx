import React, { useState } from "react";

type FiltersProps = {
  onFilterChange: (filters: {
    areaType: "panchayat" | "ward";
    selectedArea: string;
  }) => void;
};

const panchayats = ["Panchayat 1", "Panchayat 2", "Panchayat 3"];
const wards = ["Ward 1", "Ward 2", "Ward 3"];

export default function Filters({ onFilterChange }: FiltersProps) {
  const [areaType, setAreaType] = useState<"panchayat" | "ward">("panchayat");
  const [selectedArea, setSelectedArea] = useState("");

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as "panchayat" | "ward";
    setAreaType(value);
    setSelectedArea("");
    onFilterChange({ areaType: value, selectedArea: "" });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArea(e.target.value);
    onFilterChange({ areaType, selectedArea: e.target.value });
  };

  const options = areaType === "panchayat" ? panchayats : wards;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
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

      <div className="mb-4">
        <label className="font-medium block mb-1">Select {areaType}:</label>
        <select
          value={selectedArea}
          onChange={handleSelectChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Select --</option>
          {options.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {selectedArea && (
        <div className="text-gray-700">
          Showing results for <strong>{selectedArea}</strong>
        </div>
      )}
    </div>
  );
}
