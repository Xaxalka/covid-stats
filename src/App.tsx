import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Nav, Tab } from 'react-bootstrap';
import { CovidRecord } from './types/CovidData';
import { fetchCovidData } from './utils/fetchData';
import TableView from './components/TableView';
import DateFilter from './components/DateFilter';

// ВОТ ЭТО ИДЁТ ТУТ ↑ а не ниже
import CovidChart from './components/CovidChart';

const App: React.FC = () => {
  const [data, setData] = useState<CovidRecord[]>([]);
  const [countryFilter, setCountryFilter] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    fetchCovidData().then(setData).catch(console.error);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleResetFilters = () => {
    setCountryFilter('');
  };
  
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const handleResetDates = () => {
    setDateFrom(null);
    setDateTo(null);
  };
  
  return (
  <Container className="mt-4">
    <div className="d-flex align-items-center mb-4">
      <h2 className="m-0">COVID-19 Statistika</h2>
      <Button
        variant={theme === 'dark' ? 'light' : 'dark'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        size="sm"
        className="ms-3"
      >
        {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      </Button>
    </div>

    
    <DateFilter
      from={dateFrom}
      to={dateTo}
      onFromChange={setDateFrom}
      onToChange={setDateTo}
      onReset={handleResetDates}
      data={data}
      countryFilter={countryFilter}
    />

    {/* Tab interface for switching between chart and table views */}
    <Tab.Container id="covid-views" activeKey={activeTab} onSelect={(k: string | null) => setActiveTab(k || 'table')}>
      <Nav variant="tabs" className="mb-3 mt-3">
        <Nav.Item>
          <Nav.Link eventKey="table">Таблица</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="chart">График</Nav.Link>
        </Nav.Item>
      </Nav>
      <Tab.Content>
        <Tab.Pane eventKey="table">
          <TableView
            data={data}
            onCountryFilterChange={setCountryFilter}
            onResetFilters={handleResetFilters}
            dateFrom={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
            dateTo={dateTo ? dateTo.toISOString().split('T')[0] : ''}
          />
        </Tab.Pane>
        <Tab.Pane eventKey="chart">
          <CovidChart 
            data={data} 
            countryFilter={countryFilter} 
            onCountryFilterChange={setCountryFilter}
            dateFrom={dateFrom ? dateFrom.toISOString().split('T')[0] : undefined}
            dateTo={dateTo ? dateTo.toISOString().split('T')[0] : undefined}
          />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  </Container>
  );
};

export default App;