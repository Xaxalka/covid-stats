import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { CovidRecord } from './types/CovidData';
import { fetchCovidData } from './utils/fetchData';
import CountryFilter from './components/CountryFilter';
import ValueFilter from './components/ValueFilter';
import TableView from './components/TableView';
import DateFilter from './components/DateFilter';

// ВОТ ЭТО ИДЁТ ТУТ ↑ а не ниже
import CovidChart from './components/CovidChart';

const App: React.FC = () => {
  const [data, setData] = useState<CovidRecord[]>([]);
  const [countryFilter, setCountryFilter] = useState('');
  const [valueField, setValueField] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');

  useEffect(() => {
    fetchCovidData().then(setData).catch(console.error);
  }, []);

  const handleResetFilters = () => {
    setCountryFilter('');
    setValueField('');
    setMinValue('');
    setMaxValue('');
  };
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const handleResetDates = () => {
    setDateFrom(null);
    setDateTo(null);
  };
  
  return (
  <Container className="mt-4">
    <h2 className="mb-4">COVID-19 Statistika</h2>

    <CountryFilter country={countryFilter} onChange={setCountryFilter} />
    <ValueFilter
      field={valueField}
      min={minValue}
      max={maxValue}
      onFieldChange={setValueField}
      onMinChange={setMinValue}
      onMaxChange={setMaxValue}
    />

    <DateFilter
      from={dateFrom}
      to={dateTo}
      onFromChange={setDateFrom}
      onToChange={setDateTo}
      onReset={handleResetDates}
      data={data}
      countryFilter={countryFilter}
    />

    {/* ← ВОТ ЗДЕСЬ ДИАГРАММА */}
    <CovidChart 
      data={data} 
      countryFilter={countryFilter} 
      dateFrom={dateFrom ? dateFrom.toISOString().split('T')[0] : undefined}
      dateTo={dateTo ? dateTo.toISOString().split('T')[0] : undefined}
    />

    <TableView
      data={data}
      countryFilter={countryFilter}
      valueField={valueField}
      minValue={minValue === '' ? '' : Number(minValue)}
      maxValue={maxValue === '' ? '' : Number(maxValue)}
      onResetFilters={handleResetFilters}
      dateFrom={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
      dateTo={dateTo ? dateTo.toISOString().split('T')[0] : ''}
    />
  </Container>
  );
};

export default App;