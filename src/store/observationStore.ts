import { create } from "zustand";
import * as XLSX from "xlsx";

interface ObservationStore {
  filteredData: any[];
  setFilteredData: (data: any[]) => void;

  filteredDownloadData: any[];
  setFilteredDownloadData: (data: any[]) => void;
}

export const useObservationStore = create<ObservationStore>((set) => ({
  filteredData: [],
  setFilteredData: (data) => set({ filteredData: data }),

  filteredDownloadData: [],
  setFilteredDownloadData: (data) => set({ filteredDownloadData: data }),
}));


const convertToCSV = (data: any[]) => {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]).join(",") + "\n";
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  return headers + rows;
};

export const downloadObservationCSV = () => {
  const data = useObservationStore.getState().filteredData;
  if (data.length === 0) {
    alert("Tidak ada data untuk diunduh!");
    return;
  }

  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "observation_data.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadObservationJSON = () => {
  const data = useObservationStore.getState().filteredData;
  if (data.length === 0) {
    alert("Tidak ada data untuk diunduh!");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "observation_data.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadObservationExcel = () => {
  const dataArray = useObservationStore.getState().filteredDownloadData;

  if (!dataArray || dataArray.length === 0) {
    alert("Tidak ada data untuk diunduh!");
    return;
  }

  try {
    // Sesuaikan struktur datanya
    const formattedData = dataArray.map(item => ({
      Date: item.Date || "-",
      "Site Name": item["Site Name"] || "-",
      "Department Name": item["Department Name"] || "-",
      "Department Value": item["Department Value"] ?? "",
      "Position Name": item["Position Name"] || "-",
      "Position Value": item["Position Value"] ?? "",
      "Location Name": item["Location Name"] || "-",
      "Location Value": item["Location Value"] ?? "",
    }));

    // Optional: Sortir berdasarkan Date
    formattedData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    const headers = [
      "Date",
      "Site Name",
      "Department Name",
      "Department Value",
      "Position Name",
      "Position Value",
      "Location Name",
      "Location Value",
    ];

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });

    // Auto width kolom
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

    // Styling header bold
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // Kolom value rata kanan
    const valueColumns = [3, 5, 7]; // Department Value, Position Value, Location Value
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (const col of valueColumns) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].t = "n"; // tipe number
          worksheet[cellAddress].z = "#,##0"; // format angka
          worksheet[cellAddress].s = { alignment: { horizontal: "right" } };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Observation Details");
    XLSX.writeFile(workbook, "Observation_Details.xlsx");

  } catch (error) {
    console.error("Gagal generate Excel:", error);
    alert("Terjadi kesalahan saat mengunduh file Excel.");
  }
};