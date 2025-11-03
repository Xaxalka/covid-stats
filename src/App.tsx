import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { CovidRecord } from './types/CovidData';
import { fetchCovidData } from './utils/fetchData';
import CountryFilter from './components/CountryFilter';
import ValueFilter from './components/ValueFilter';
import TableView from './components/TableView';
import DateFilter from './components/DateFilter';

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleResetDates = () => {
  setDateFrom('');
  setDateTo('');
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
        from={minValue}
        to={maxValue}
        onFromChange={setMinValue}
        onToChange={setMaxValue}
        onReset={handleResetFilters}
      />

      <TableView
        data={data}
        countryFilter={countryFilter}
        valueField={valueField}
        minValue={minValue === '' ? '' : Number(minValue)}
        maxValue={maxValue === '' ? '' : Number(maxValue)}
        onResetFilters={handleResetFilters}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </Container>
  );
};

export default App;