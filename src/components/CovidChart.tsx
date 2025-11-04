import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import { CovidRecord } from "../types/CovidData";
import CountryFilter from "./CountryFilter";

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip);

interface Props {
  data: CovidRecord[];
  countryFilter: string;
  dateFrom?: string;
  dateTo?: string;
  onCountryFilterChange: (country: string) => void;
}

export default function CovidChart({ data, countryFilter, dateFrom, dateTo, onCountryFilterChange }: Props) {
  // Extract unique countries from the data
  const countries = Array.from(new Set(data.map(d => d.countriesAndTerritories))).sort();
  // Filter data by country and date range
  let filteredData = countryFilter 
    ? data.filter(d => 
        d.countriesAndTerritories.toLowerCase().includes(countryFilter.toLowerCase())
      )
    : data.slice(0, 10); // Show top 10 countries if no filter is applied
  
  // Apply date filters if provided
  if (dateFrom) {
    filteredData = filteredData.filter(record => {
      const recordDate = new Date(`${record.year}-${record.month}-${record.day}`);
      return recordDate >= new Date(dateFrom);
    });
  }
  if (dateTo) {
    filteredData = filteredData.filter(record => {
      const recordDate = new Date(`${record.year}-${record.month}-${record.day}`);
      return recordDate <= new Date(dateTo);
    });
  }
  
  // Sort data by date in chronological order (from earlier to later)
  filteredData.sort((a, b) => {
    const dateA = new Date(`${a.year}-${a.month}-${a.day}`);
    const dateB = new Date(`${b.year}-${b.month}-${b.day}`);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Create labels with country and date information
  const labels = filteredData.map(d => `${d.countriesAndTerritories} (${d.day}/${d.month}/${d.year})`);
  const cases = filteredData.map(d => d.cases);
  const deaths = filteredData.map(d => d.deaths);

  const chartData = {
    labels: labels,
    datasets: [
      { 
        label: "Заболевшие", 
        data: cases,
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        borderColor: 'rgba(66, 133, 244, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        pointBackgroundColor: 'rgba(66, 133, 244, 1)',
        fill: false,
        tension: 0.1,
      },
      { 
        label: "Смерти", 
        data: deaths,
        backgroundColor: 'rgba(234, 67, 53, 0.1)',
        borderColor: 'rgba(234, 67, 53, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        pointBackgroundColor: 'rgba(234, 67, 53, 1)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h4>График по странам</h4>
      <div className="mb-3">
        <CountryFilter
          country={countryFilter}
          countries={countries}
          onChange={onCountryFilterChange}
        />
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
}
