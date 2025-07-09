import { useState } from "react";
import Select, { type SingleValue, type StylesConfig } from "react-select";
import { useNavigate } from "react-router-dom";

type FamilyMemberOption = {
  value: string;
  label: string;
};

const familyMembers: FamilyMemberOption[] = [
  { value: "john", label: "John Doe" },
  { value: "jane", label: "Jane Smith" },
  { value: "raj", label: "Raj Kumar" },
  { value: "anita", label: "Anita Devi" },
];

// Custom styles for react-select
const customStyles: StylesConfig<FamilyMemberOption, false> = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.75rem",
    borderColor: "#d1d5db",
    padding: "0.25rem",
    fontSize: "1rem",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#4F46E5",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#E0E7FF" : "white",
    color: "#1F2937",
    padding: "0.6rem 1rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#111827",
    fontWeight: 500,
  }),
};

export default function FamilyTree() {
  const [selectedMember, setSelectedMember] =
    useState<FamilyMemberOption | null>(null);
  const navigate = useNavigate();

  const handleChange = (newValue: SingleValue<FamilyMemberOption>) => {
    setSelectedMember(newValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-blue-100 py-10 px-4 flex flex-col items-center">
      <h2 className="text-4xl font-bold text-green-800 mb-6">Family Tree</h2>

      <button
        onClick={() => navigate(-1)}
        className="self-start mb-6 text-blue-600 font-medium hover:underline"
      >
        ← Back
      </button>

      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl">
        <label className="block text-gray-700 text-lg font-medium mb-3">
          Search Family Member:
        </label>

        <Select
          options={familyMembers}
          value={selectedMember}
          onChange={handleChange}
          placeholder="Select a member..."
          styles={customStyles}
        />

        {selectedMember && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center shadow-inner">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Selected Member
            </h3>
            <p className="text-gray-600 text-lg">{selectedMember.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
