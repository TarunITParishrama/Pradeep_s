export type AmbulanceRecord = {
  slNo: string;
  areaType: "Panchayat" | "Ward";
  areaName: string;
  villageOrWardArea: string;
  patientName: string;
  ageGender: string;
  healthIssue: string;
  pickupFrom: string;
  dropTo: string;
  mobileNumber: string;
  parentName: string;
  parentMobile: string;
  address: string;
  staffAttended: string;
  ambulanceName: string;
  dateTime: string;
};
