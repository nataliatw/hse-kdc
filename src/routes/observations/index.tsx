import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { VertikalBarChartComponent } from '../../components/VertikalBarChart';
import { PieChartComponent } from '../../components/PieChart';
import  HeatMapComponent  from '../../components/HeatMapChart';
import { observationsData } from '../../data/observationdata';
import { useObservationStore } from '../../store/observationStore';

export const Route = createFileRoute('/observations/')({
  component: Observations,
});

function Observations() {
  const [selectedSite, setSelectedSite] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const setFilteredData = useObservationStore((state) => state.setFilteredData);
  const filteredData = useObservationStore((state) => state.filteredData);
  const setFilteredDownloadData = useObservationStore((state) => state.setFilteredDownloadData);
  const reportData = filteredData.filter(item => item.type === 'report');

  const handleSiteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSite(event.target.value);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEndDate(event.target.value);
  };

  useEffect(() => {
    const dataMap = new Map<string, { name: string; value: number; type: string }>();
    const uniqueDates = new Set<string>();
    const uniqueSites = new Set<string>();
    const downloadableRows: any[] = [];
  
    const accumulate = (name: string, value: number, type: string, extraData: any = {}) => {
      const key = `${type}-${name}`;
      const current = dataMap.get(key);
      if (current) {
        dataMap.set(key, { ...current, value: current.value + value });
      } else {
        dataMap.set(key, { name, value, type, ...extraData });
      }
    };
  
    const extractAndAccumulate = (data: any[], type: string) => {
      data.forEach(item => {
        const extraData = type === "report" ? { jabatan: item.jabatan } : {};
        accumulate(item.name, item.value ?? 0, type, extraData);
      });
    };
  
    const pushToDownloadRows = (date: string | null, site: any) => {
      const departments = site.departements || [];
      const positions = site.position || [];
      const locations = site.location || [];
  
      const maxLength = Math.max(
        departments.length,
        positions.length,
        locations.length,
        1
      );
  
      for (let i = 0; i < maxLength; i++) {
        downloadableRows.push({
          ...(date ? { Date: date } : {}),
          "Site Name": site.name,
          "Department Name": departments[i]?.name || "",
          "Department Value": departments[i]?.value ?? "",
          "Position Name": positions[i]?.name || "",
          "Position Value": positions[i]?.value ?? "",
          "Location Name": locations[i]?.name || "",
          "Location Value": locations[i]?.value ?? "",
        });
      }
    };
  
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      const rangeData = observationsData.date.filter(d => {
        const dDate = new Date(d.name);
        return dDate >= start && dDate <= end;
      });
  
      rangeData.forEach(dateData => {
        uniqueDates.add(dateData.name);
  
        dateData.sites.forEach(site => {
          if (!selectedSite || site.name === selectedSite) {
            uniqueSites.add(site.name);
            accumulate(site.name, site.value ?? 0, "site");
            extractAndAccumulate(site.departements || [], "department");
            extractAndAccumulate(site.position || [], "position");
            extractAndAccumulate(site.location || [], "location");
            extractAndAccumulate(site.report || [], "report");
            pushToDownloadRows(dateData.name, site);
          }
        });
      });
  
    } else if (selectedSite) {
      const filteredDates = observationsData.date.filter(date =>
        date.sites.some(site => site.name === selectedSite)
      );
  
      filteredDates.forEach(dateData => {
        uniqueDates.add(dateData.name);
        const site = dateData.sites.find(site => site.name === selectedSite);
        if (site) {
          uniqueSites.add(site.name);
          accumulate(site.name, site.value ?? 0, "site");
          extractAndAccumulate(site.departements || [], "department");
          extractAndAccumulate(site.position || [], "position");
          extractAndAccumulate(site.location || [], "location");
          extractAndAccumulate(site.report || [], "report");
          pushToDownloadRows(dateData.name, site);
        }
      });
  
    } else {
      observationsData.date.forEach(d => {
        uniqueDates.add(d.name);
        d.sites.forEach(site => {
          uniqueSites.add(site.name);
          accumulate(site.name, site.value ?? 0, "site");
          extractAndAccumulate(site.departements || [], "department");
          extractAndAccumulate(site.position || [], "position");
          extractAndAccumulate(site.location || [], "location");
          extractAndAccumulate(site.report || [], "report");
          pushToDownloadRows(d.name, site);
        });
      });
    }
  
    setAvailableDates(Array.from(uniqueDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()));
    setAvailableSites(Array.from(uniqueSites).sort());
  
    const allData = Array.from(dataMap.values());
    const noFilters = !startDate && !endDate && !selectedSite;
  
    let finalFilteredData: typeof allData;
  
    if (noFilters) {
      const groupedByType = allData.reduce((acc, curr) => {
        if (!acc[curr.type]) acc[curr.type] = [];
        acc[curr.type].push(curr);
        return acc;
      }, {} as Record<string, typeof allData>);
  
      finalFilteredData = [];
  
      Object.entries(groupedByType).forEach(([type, items]) => {
        let processedItems = [];
          
        if (["department", "position", "location", "report"].includes(type)) {
          // Data banyak, ambil top 10
          const top10 = items.sort((a, b) => b.value - a.value).slice(0, 10);
          processedItems = top10.map((item, index) => ({
          ...item,
          highlight: index === 0, // Highlight item tertinggi
        }));
        } else {
        // Data < 10, tampilkan semua
          const sorted = items.sort((a, b) => b.value - a.value);
          processedItems = sorted.map((item, index) => ({
          ...item,
          highlight: index === 0, // Tetap highlight yang tertinggi
          }));
        }
          
        finalFilteredData.push(...processedItems);
      });  
    } else {
          // Tetap kasih highlight setelah filter
          const groupedByType = allData.reduce((acc, curr) => {
            if (!acc[curr.type]) acc[curr.type] = [];
            acc[curr.type].push(curr);
            return acc;
          }, {} as Record<string, typeof allData>);

          finalFilteredData = [];

          Object.entries(groupedByType).forEach(([_, items]) => {
            const sorted = items.sort((a, b) => b.value - a.value);
            const processedItems = sorted.map((item, index) => ({
              ...item,
              highlight: index === 0, // Tetap highlight item tertinggi
            }));
            finalFilteredData.push(...processedItems);
          });
        }
  
    setFilteredData(finalFilteredData);
    setFilteredDownloadData(downloadableRows);
  }, [startDate, endDate, selectedSite, observationsData]); 
  
    const calculateTotalObservations = () => {
        let total = 0;

        observationsData?.date?.forEach(date => {
          date.sites?.forEach(site => {
              const value = Number(site.value) || 0;
              total += value;
          });
        });

        return total;
      };

      const calculateFilteredTotal = () => {
        let total = 0;

        // Fungsi bantu buat ngecek apakah tanggal ada dalam range
        const isWithinDateRange = (dateString: string) : boolean => {
          const date = new Date(dateString);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          return (!start || date >= start) && (!end || date <= end);
        };

        observationsData?.date?.forEach(dateItem => {
          if (!isWithinDateRange(dateItem.name)) return;

          dateItem.sites?.forEach(site => {
            if (selectedSite && site.name !== selectedSite) return;
              const value = Number(site.value) || 0;
              total += value;
          });
        });

        return total;
      };

      // Cek apakah filter aktif
      const isFilterActive = startDate || endDate || selectedSite ;

      const totalAllObservations = isFilterActive
        ? calculateFilteredTotal()
        : calculateTotalObservations();
  
  return (
    <div className="p-6 min-h-screen">
      {/* Baris 1: Judul + Filter */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="font-bold text-4xl text-gray-800">Observations</h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedSite}
            onChange={handleSiteChange}
            className="border border-gray-300 px-4 py-2 rounded-xl text-sm bg-white shadow-sm"
          >
            <option value="">All Sites</option>
            {availableSites.map((site, index) => (
              <option key={index} value={site}>{site}</option>
            ))}
          </select>

          <select
            value={startDate}
            onChange={handleStartDateChange}
            className="border border-gray-300 px-4 py-2 rounded-xl text-sm bg-white shadow-sm"
          >
            <option value="">Start Date</option>
            {availableDates.map((date, idx) => (
              <option key={idx} value={date}>{date}</option>
            ))}
          </select>

          <select
            value={endDate}
            onChange={handleEndDateChange}
            className="border border-gray-300 px-4 py-2 rounded-xl text-sm bg-white shadow-sm"
          >
            <option value="">End Date</option>
            {availableDates.map((date, idx) => (
              <option key={idx} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="flex flex-wrap gap-4 justify-start items-center mb-6">
        <div className="bg-green-50 border border-green-200 px-5 py-4 shadow-md rounded-2xl flex items-center gap-3 min-w-[160px]">
          <img src="src/assets/icons/progress-complete.png" alt="Closed" className="w-6 h-6" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">Closed</h3>
            <p className="text-green-600 text-lg font-bold">45</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-5 py-4 shadow-md rounded-2xl flex items-center gap-3 min-w-[160px]">
          <img src="src/assets/icons/refresh.png" alt="In Progress" className="w-6 h-6" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">In Progress</h3>
            <p className="text-blue-600 text-lg font-bold">30</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 px-5 py-4 shadow-md rounded-2xl flex items-center gap-3 min-w-[160px]">
          <img src="src/assets/icons/duration.png" alt="Pending" className="w-6 h-6" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">Pending</h3>
            <p className="text-yellow-600 text-lg font-bold">15</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 px-6 py-4 shadow-md rounded-2xl flex items-center gap-3 min-w-[180px] ml-auto">
          <img src="src/assets/icons/shield-exclamation.svg" alt="Total Observation" className="w-6 h-6" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">Total Observation</h3>
            <p className="text-red-600 text-xl font-bold">{totalAllObservations}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-center mb-3 text-gray-800">Total Observations by Site</h2>
          <VertikalBarChartComponent data={filteredData.filter((d) => d.type === "site")} />
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-center mb-3 text-gray-800">Total Observations by Location</h2>
          <HeatMapComponent data={filteredData.filter((d) => d.type === "location")} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Total Observations by Department</h2>
          <div className="w-full max-w-[600px]">
            <PieChartComponent data={filteredData.filter((d) => d.type === "department")} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Total Observations by Jabatan Pelapor</h2>
          <div className="w-full max-w-[600px]">
            <PieChartComponent data={filteredData.filter((d) => d.type === "position")} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-lg mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-center">Nama Pelapor</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Jabatan Pelapor</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Jumlah Observation</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border border-gray-300">{item.name}</td>
                <td className="py-2 px-4 border border-gray-300 text-center align-middle">{item.jabatan}</td>
                <td className="py-2 px-4 border border-gray-300 text-center align-middle">{item.value}</td>
              </tr>
            ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}