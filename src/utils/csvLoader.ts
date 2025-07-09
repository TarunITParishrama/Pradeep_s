import Papa from "papaparse";
import type { AmbulanceRecord } from "../types";

export const loadAmbulanceData = async (): Promise<AmbulanceRecord[]> => {
  const response = await fetch("/src/assets/Ambulance.csv");
  const csvText = await response.text();

  return new Promise((resolve) => {
    Papa.parse<AmbulanceRecord>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
    });
  });
};
