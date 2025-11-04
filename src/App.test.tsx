import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { CovidRecord } from './types/CovidData';
import { fetchCovidData } from './utils/fetchData';
import TableView from './components/TableView';

const App: React.FC = () => {
  const [data, setData] = useState<CovidRecord[]>([]);
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    fetchCovidData().then(setData).catch(console.error);
  }, []);

  const handleResetFilters = () => {
    setCountryFilter('');
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">COVID-19 Statistika</h2>

      <TableView
        data={data}
        onCountryFilterChange={setCountryFilter}
        onResetFilters={handleResetFilters}
        dateFrom={''}
        dateTo={''}
      />
    </Container>
  );
};

export default App;