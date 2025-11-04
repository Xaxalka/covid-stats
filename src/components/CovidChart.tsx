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
    : data; // Use all data when no country filter is applied
  
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
  
  // If "Все страны" is selected (empty countryFilter), aggregate data by date
  let labels: string[];
  let cases: number[];
  let deaths: number[];
  
  if (!countryFilter || countryFilter === '') {
    // Aggregate data by date for all countries
    const dateMap = new Map<string, { cases: number; deaths: number; date: Date }>();
    
    filteredData.forEach(record => {
      const dateKey = `${record.year}-${record.month}-${record.day}`;
      const existing = dateMap.get(dateKey) || { cases: 0, deaths: 0, date: new Date(`${record.year}-${record.month}-${record.day}`) };
      
      dateMap.set(dateKey, {
        cases: existing.cases + record.cases,
        deaths: existing.deaths + record.deaths,
        date: existing.date
      });
    });
    
    // Sort by date and create arrays
    const sortedEntries = Array.from(dateMap.entries()).sort((a, b) => 
      a[1].date.getTime() - b[1].date.getTime()
    );
    
    labels = sortedEntries.map(([dateKey, value]) => {
      const date = value.date;
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    });
    cases = sortedEntries.map(([, value]) => value.cases);
    deaths = sortedEntries.map(([, value]) => value.deaths);
  } else {
    // For specific country, show individual records
    filteredData.sort((a, b) => {
      const dateA = new Date(`${a.year}-${a.month}-${a.day}`);
      const dateB = new Date(`${b.year}-${b.month}-${b.day}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    labels = filteredData.map(d => `${d.countriesAndTerritories} (${d.day}/${d.month}/${d.year})`);
    cases = filteredData.map(d => d.cases);
    deaths = filteredData.map(d => d.deaths);
  }

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

  // Check if there's no data after filtering
  const hasNoData = labels.length === 0 || (cases.length === 0 && deaths.length === 0);

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
      {hasNoData ? (
        <p className="text-center text-muted mt-4">Ничего не найдено</p>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
}
