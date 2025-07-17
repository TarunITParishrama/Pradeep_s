import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Filters from "../../components/Filters";
import * as XLSX from "xlsx";
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

const Ambulance = () => {
  const [ambulanceData, setAmbulanceData] = useState<AmbulanceRecord[]>([]);
  const [filters, setFilters] = useState({
    areaType: "panchayat",
    selectedArea: "",
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
        await axios.post(
          `${BASE_URL}/api/addambulancerecords`,
          batch
        );
      }
      alert("All records uploaded successfully!");
      setBulkData([]);
    } catch (err) {
      console.error("Upload error", err);
      alert("Error during upload. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const fetchAmbulanceData = useCallback(async () => {
    //if (!filters.selectedArea) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/getambulancerecords`,
        {
          params: {
            areaType: filters.areaType,
            selectedArea: filters.selectedArea,
            page,
            limit: ITEMS_PER_PAGE,
          },
        }
      );

      setAmbulanceData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching ambulance data", err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, filters.areaType, filters.selectedArea, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchAmbulanceData();
  }, [fetchAmbulanceData]);

  return (
    <div className="p-4">
      <Filters onFilterChange={setFilters} />
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

      {loading ? (
        <div className="text-center text-gray-500">Loading records...</div>
      ) : ambulanceData.length > 0 ? (
        <>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 border">Date & Time</th>
                  <th className="p-2 border">Patient</th>
                  <th className="p-2 border">Age/Gender</th>
                  <th className="p-2 border">Issue</th>
                  <th className="p-2 border">Pickup</th>
                  <th className="p-2 border">Drop</th>
                  {/* <th className="p-2 border">Ambulance</th> */}
                  {/* <th className="p-2 border">Staff</th> */}
                </tr>
              </thead>
              <tbody>
                {ambulanceData.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{record.dateTime}</td>
                    <td className="p-2 border">{record.patientName}</td>
                    <td className="p-2 border">{record.ageGender}</td>
                    <td className="p-2 border">{record.healthIssue}</td>
                    <td className="p-2 border">{record.pickupFrom}</td>
                    <td className="p-2 border">{record.dropTo}</td>
                    {/* <td className="p-2 border">{record.ambulanceName}</td> */}
                    {/* <td className="p-2 border">{record.staffAttended}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
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
        </>
      ) : (
        <p className="text-gray-500 mt-4">No records found.</p>
      )}
    </div>
  );
};

export default Ambulance;
