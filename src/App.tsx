// App: root component. Loads data, manages filters, tab navigation and theme toggle
// Theme is persisted in localStorage and applied by adding/removing 'theme-dark' on <body>.
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Nav, Tab, Spinner } from 'react-bootstrap';
import { CovidRecord } from './types/CovidData';
import { fetchCovidData } from './utils/fetchData';
import TableView from './components/TableView';
import DateFilter from './components/DateFilter';

// ВОТ ЭТО ИДЁТ ТУТ ↑ а не ниже
import CovidChart from './components/CovidChart';

const App: React.FC = () => {
  const [data, setData] = useState<CovidRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [countryFilter, setCountryFilter] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCovidData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
        {theme === 'dark' ? '☀️ Светлая тема' : '🌙 Тёмная тема'}
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

    {/* Loading indicator while fetching data */}
    {loading && (
      <div className="d-flex justify-content-center my-3">
        <Spinner animation="border" role="status" variant={theme === 'dark' ? 'light' : 'secondary'}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )}

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

    {showBackToTop && (
      <Button
        variant={theme === 'dark' ? 'light' : 'secondary'}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
        }}
        aria-label="Прокрутить вверх"
        title="Вверх"
      >
        ↑
      </Button>
    )}
  </Container>
  );
};

export default App;