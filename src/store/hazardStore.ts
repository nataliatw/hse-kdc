import { create } from "zustand";
import * as XLSX from "xlsx";

interface HazardStore {
  filteredData: any[];
  setFilteredData: (data: any[]) => void;

  filteredDownloadData: any[];
  setFilteredDownloadData: (data: any[]) => void;

  startDate: string | null;
  setStartDate: (date: string | null) => void;

  endDate: string | null;
  setEndDate: (date: string | null) => void;
}

export const useHazardStore = create<HazardStore>((set) => ({
  filteredData: [],
  setFilteredData: (data) => set({ filteredData: data }),

  filteredDownloadData: [],
  setFilteredDownloadData: (data) => set({ filteredDownloadData: data }),

  startDate: null,
  setStartDate: (date) => set({ startDate: date }),

  endDate: null,
  setEndDate: (date) => set({ endDate: date }),
}));

const convertToCSV = (data: any[]) => {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]).join(",") + "\n";
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  return headers + rows;
};

export const downloadHazardJSON = () => {
  const { startDate, endDate, filteredDownloadData } = useHazardStore.getState();
  const dataToDownload = filteredDownloadData;

  if (dataToDownload.length === 0) {
    alert("Tidak ada data untuk diunduh!");
    return;
  }

  const filenameSuffix = (startDate && endDate) ? "_Filtered" : "_Full";
  const filename = `Hazard_data${filenameSuffix}.json`;

  const jsonContent = JSON.stringify(dataToDownload, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadHazardCSV = () => {
  const { startDate, endDate, filteredDownloadData } = useHazardStore.getState();
  const dataToDownload = filteredDownloadData;

  if (dataToDownload.length === 0) {
    alert("Tidak ada data untuk diunduh!");
    return;
  }

  const filenameSuffix = (startDate && endDate) ? "_Filtered" : "_Full";
  const filename = `Hazard_data${filenameSuffix}.csv`;

  const csvContent = convertToCSV(dataToDownload);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadHazardExcel = () => {
  const { filteredDownloadData } = useHazardStore.getState();
  const dataToDownload = filteredDownloadData;

  if (!dataToDownload || dataToDownload.length === 0) {
    alert("Tidak ada data untuk diunduh!");
    return;
  }

  try {
    // Data sudah sesuai format downloadableRows
    const formattedData = dataToDownload.map(item => ({
      Date: item.Date || "-", // Pastikan ada Date, kalau tidak kosong
      "Company Name": item["Company Name"] || "-",
      "Site Name": item["Site Name"] || "-",
      "Department Name": item["Department Name"] || "-",
      "Department Value": item["Department Value"] ?? "",
      "Position Name": item["Position Name"] || "-",
      "Position Value": item["Position Value"] ?? "",
      "Location Name": item["Location Name"] || "-",
      "Location Value": item["Location Value"] ?? "",
    }));

    // Urutkan berdasarkan Date kalau mau (optional)
    formattedData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    const headers = [
      "Date",
      "Company Name",
      "Site Name",
      "Department Name",
      "Department Value",
      "Position Name",
      "Position Value",
      "Location Name",
      "Location Value",
    ];

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });

    // Auto adjust kolom
    const maxWidths = headers.map(header => {
      const maxLength = Math.max(
        header.length,
        ...formattedData.map(item => String((item as Record<string, any>)[header] ?? "").length)
      );
      return { wch: maxLength + 5 };
    });    
    worksheet["!cols"] = maxWidths;

    // Freeze header
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    // Styling header
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // Format kolom Value rata kanan
    const valueColumns = [4, 6, 8]; // Department Value, Position Value, Location Value
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (const col of valueColumns) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].t = "n"; // angka
          worksheet[cellAddress].z = "#,##0"; // format angka
          worksheet[cellAddress].s = { alignment: { horizontal: "right" } };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hazard Details");
    XLSX.writeFile(workbook, "Hazard_Details.xlsx");

  } catch (error) {
    console.error("Gagal generate Excel:", error);
    alert("Terjadi kesalahan saat mengunduh file Excel.");
  }
};