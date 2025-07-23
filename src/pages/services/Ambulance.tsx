import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Filters,{type FiltersChange} from "../../components/Filters";
import * as XLSX from "xlsx";
type FilterState = {
  areaType: "panchayat" | "ward";
  selectedArea: string;
  selectedVillage: string;
};
type ExcelRow = {
  Date?: string;
  "Patient Name"?: string;
  Gender?: string;
  Age?: string | number;
  Diagnosis?: string;
  Pickup?: string;
  Drop?: string;
  Panchayat?: string;
  Village?: string;
  Mobile?: string | number;
  "Father Name"?: string;
  "Staff Attended"?: string;
};

interface AmbulanceRecord {
  _id?: string;
  areaType: string;
  areaName: string;
  villageOrWard: string;
  patientName: string;
  ageGender?: string;
  healthIssue?: string;
  pickupFrom?: string;
  dropTo?: string;
  mobileNumber?: string;
  parentName?: string;
  parentMobile?: string;
  address?: string;
  staffAttended?: string;
  ambulanceName?: string;
  dateTime: string;
}

interface Counts {
  panchayat: number;
  ward: number;
  filtered: number;
}

const Ambulance = () => {
  const [ambulanceData, setAmbulanceData] = useState<AmbulanceRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    areaType: "panchayat" as "panchayat" | "ward",
    selectedArea: "",
    selectedVillage: "",
  });
  const [counts, setCounts] = useState<Counts>({
    panchayat: 0,
    ward: 0,
    filtered: 0,
  });
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState<AmbulanceRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [isParsing, setIsParsing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setBulkData([]); // Clear old preview

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: ExcelRow[] = XLSX.utils.sheet_to_json<ExcelRow>(ws, {
        defval: "",
      });

      // Normalize keys
      const formatted: AmbulanceRecord[] = data.map((row) => {
        const normalizedRow: Record<string, string> = {};
        Object.keys(row as ExcelRow).forEach((key) => {
          normalizedRow[key.trim().toLowerCase()] = String(
            row[key as keyof ExcelRow] || ""
          );
        });

        const areaName = String(
          normalizedRow.panchayat || normalizedRow.village || ""
        );
        return {
          areaType: normalizedRow.panchayat ? "Panchayat" : "Ward",
          areaName,
          villageOrWard: String(normalizedRow.village || areaName),
          patientName: String(normalizedRow["patient name"] || ""),
          ageGender: `${normalizedRow.age || ""},${(
            normalizedRow.gender || ""
          ).charAt(0)}`,
          healthIssue: String(normalizedRow.diagnosis || ""),
          pickupFrom: String(normalizedRow.pickup || ""),
          dropTo: String(normalizedRow.drop || ""),
          mobileNumber: String(normalizedRow.mobile || ""),
          parentName: String(normalizedRow["father name"] || ""),
          parentMobile: "",
          address: `${normalizedRow.village || ""}, ${areaName}`,
          staffAttended: String(normalizedRow["staff attended"] || ""),
          ambulanceName: "Ambulance 01",
          dateTime: String(normalizedRow.date || ""),
        };
      });

      // Filter out invalid rows
      const filtered = formatted.filter((r) => r.patientName && r.areaName);
      setBulkData(filtered);
      setIsParsing(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      const batchSize = 200; // Send 200 records per request
      for (let i = 0; i < bulkData.length; i += batchSize) {
        const batch = bulkData.slice(i, i + batchSize);
        console.log(
          `Uploading batch ${i / batchSize + 1} with ${batch.length} records`
        );
        await axios.post(`${BASE_URL}/api/addambulancerecords`, batch);
      }
      alert("All records uploaded successfully!");
      setBulkData([]);
      // Refresh data after upload
      fetchAmbulanceData();
    } catch (err) {
      console.error("Upload error", err);
      alert("Error during upload. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const fetchAmbulanceData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      params.areaType = filters.areaType;

      if (filters.selectedArea) params.selectedArea = filters.selectedArea;
      if (filters.selectedVillage) params.selectedVillage = filters.selectedVillage;

      const res = await axios.get(`${BASE_URL}/api/getambulancerecords`, {
        params,
      });

      setAmbulanceData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setCounts(res.data.counts || { panchayat: 0, ward: 0, filtered: 0 });
    } catch (err) {
      console.error("Error fetching ambulance data", err);
      setAmbulanceData([]);
      setCounts({ panchayat: 0, ward: 0, filtered: 0 });
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, filters.areaType, filters.selectedArea, filters.selectedVillage, page]);

  const handleFilterChange: FiltersChange = (incoming) => {
    setPage(1);
    setFilters({
      areaType: incoming.areaType,
      selectedArea: incoming.selectedArea,
      // ensure selectedVillage is always a string
      selectedVillage: incoming.selectedVillage ?? "",
    });
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchAmbulanceData();
  }, [fetchAmbulanceData]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Ambulance Records Management</h1>
      
      {/* Filters Component */}
      <Filters onFilterChange={handleFilterChange} />

      {/* Record Counts Display */}
      <div className="my-6 bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Record Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-3 rounded text-center">
            <div className="text-2xl font-bold text-blue-600">{counts.panchayat}</div>
            <div className="text-sm text-gray-600">Panchayat Records</div>
          </div>
          <div className="bg-green-100 p-3 rounded text-center">
            <div className="text-2xl font-bold text-green-600">{counts.ward}</div>
            <div className="text-sm text-gray-600">Ward Records</div>
          </div>
          <div className="bg-purple-100 p-3 rounded text-center">
            <div className="text-2xl font-bold text-purple-600">{counts.filtered}</div>
            <div className="text-sm text-gray-600">Filtered Results</div>
          </div>
        </div>
        
        {/* Current Filter Info */}
        {(filters.selectedArea || filters.selectedVillage) && (
          <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <p className="text-sm">
              <strong>Current Filter:</strong> 
              {filters.areaType === "panchayat" ? " Panchayat" : " Ward"} 
              {filters.selectedArea && ` → ${filters.selectedArea}`}
              {filters.selectedVillage && ` → ${filters.selectedVillage}`}
            </p>
          </div>
        )}
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">Bulk Upload Ambulance Records</h3>
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileUpload}
          className="mb-3"
        />

        {isParsing && (
          <div className="flex items-center gap-2 text-blue-600">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Reading file, please wait...</span>
          </div>
        )}

        {!isParsing && bulkData.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-2">
              {bulkData.length} records ready for upload
            </p>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Now"}
            </button>

            {/* Preview */}
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Patient</th>
                    <th className="p-2 border">Issue</th>
                    <th className="p-2 border">Pickup</th>
                    <th className="p-2 border">Drop</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkData.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{r.dateTime || "-"}</td>
                      <td className="p-2 border">{r.patientName || "-"}</td>
                      <td className="p-2 border">{r.healthIssue || "-"}</td>
                      <td className="p-2 border">{r.pickupFrom || "-"}</td>
                      <td className="p-2 border">{r.dropTo || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Showing first 5 records
              </p>
            </div>
          </>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading records...</p>
        </div>
      )}

      {/* Records Table */}
      {!loading && (
        ambulanceData.length > 0 ? (
          <>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="p-2 border">Date & Time</th>
                    <th className="p-2 border">Patient</th>
                    <th className="p-2 border">Age/Gender</th>
                    {/* <th className="p-2 border">Area</th>
                    <th className="p-2 border">Village/Ward</th> */}
                    <th className="p-2 border">Issue</th>
                    <th className="p-2 border">Pickup</th>
                    <th className="p-2 border">Drop</th>
                    {/* <th className="p-2 border">Mobile</th> */}
                  </tr>
                </thead>
                <tbody>
                  {ambulanceData.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="p-2 border">{record.dateTime}</td>
                      <td className="p-2 border">{record.patientName}</td>
                      <td className="p-2 border">{record.ageGender}</td>
                      {/* <td className="p-2 border text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.areaType === 'Panchayat' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.areaType}
                        </span>
                        <div className="mt-1">{record.areaName}</div>
                      </td>
                      <td className="p-2 border">{record.villageOrWard}</td> */}
                      <td className="p-2 border">{record.healthIssue}</td>
                      <td className="p-2 border">{record.pickupFrom}</td>
                      <td className="p-2 border">{record.dropTo}</td>
                      {/* <td className="p-2 border">{record.mobileNumber}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Showing {ambulanceData.length} of {counts.filtered} filtered records
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No records found</div>
            <p className="text-gray-400 text-sm mt-2">
              {filters.selectedArea || filters.selectedVillage 
                ? "Try adjusting your filters to see more results"
                : "Upload some records or adjust your filters to get started"
              }
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Ambulance;
