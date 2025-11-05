// TableView: displays filtered, sorted and paginated covid data
// - Derives totals per country (cases/deaths)
// - Supports text search by country and numeric range filter by chosen field
// - Sorting supports raw fields and derived metrics (per 1000, totals)
// - Pagination is client-side with compact controls
import React, { useState, useMemo, useEffect } from 'react';
import { Table, Form, Button, Pagination, Row, Col } from 'react-bootstrap';
import { CovidRecord } from '../types/CovidData';
import ValueFilter from './ValueFilter';

interface Props {
  data: CovidRecord[];
  dateFrom: string;
  dateTo: string;
  onResetFilters: () => void;
  onCountryFilterChange?: (value: string) => void;
}

const PAGE_SIZE = 20;

const TableView: React.FC<Props> = ({
  data,
  onResetFilters,
  dateFrom,
  dateTo,
  onCountryFilterChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'countriesAndTerritories' | 'cases' | 'deaths'| 'popData2019'|'dateRep'|'totalCases'|'totalDeaths'|'casesPer1000'|'deathsPer1000'>('countriesAndTerritories');
  const [sortAsc, setSortAsc] = useState(true);
  const [valueField, setValueField] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  
  const handleResetValueFilters = () => {
    setValueField('');
    setMinValue('');
    setMaxValue('');
    setCountryFilter('');
  };
  
  // Notify parent component when countryFilter changes
  useEffect(() => {
    if (onCountryFilterChange) {
      onCountryFilterChange(countryFilter);
    }
  }, [countryFilter, onCountryFilterChange]);
  
  // Calculate totals by country
  const countryTotals = useMemo(() => {
    const totals = new Map<string, { totalCases: number; totalDeaths: number }>();
    
    data.forEach(record => {
      const country = record.countriesAndTerritories;
      const current = totals.get(country) || { totalCases: 0, totalDeaths: 0 };
      
      totals.set(country, {
        totalCases: current.totalCases + record.cases,
        totalDeaths: current.totalDeaths + record.deaths
      });
    });
    
    return totals;
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (dateFrom) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(`${record.year}-${record.month}-${record.day}`);
        return recordDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(`${record.year}-${record.month}-${record.day}`);
        return recordDate <= new Date(dateTo);
      });
    }

    if (countryFilter) {
      filtered = filtered.filter(record =>
        record.countriesAndTerritories.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    if (valueField && (minValue !== '' || maxValue !== '')) {
      filtered = filtered.filter(record => {
        const value = record[valueField as keyof CovidRecord] as number;
        const minOk = minValue === '' || value >= Number(minValue);
        const maxOk = maxValue === '' || value <= Number(maxValue);
        return minOk && maxOk;
      });
    }

    return filtered;
  }, [data, countryFilter, valueField, minValue, maxValue, dateFrom, dateTo]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      if (sortField === 'totalCases') {
        aVal = countryTotals.get(a.countriesAndTerritories)?.totalCases || 0;
        bVal = countryTotals.get(b.countriesAndTerritories)?.totalCases || 0;
      } else if (sortField === 'totalDeaths') {
        aVal = countryTotals.get(a.countriesAndTerritories)?.totalDeaths || 0;
        bVal = countryTotals.get(b.countriesAndTerritories)?.totalDeaths || 0;
      } else if (sortField === 'casesPer1000') {
        aVal = a.popData2019 > 0 ? (a.cases / a.popData2019 * 1000) : 0;
        bVal = b.popData2019 > 0 ? (b.cases / b.popData2019 * 1000) : 0;
      } else if (sortField === 'deathsPer1000') {
        aVal = a.popData2019 > 0 ? (a.deaths / a.popData2019 * 1000) : 0;
        bVal = b.popData2019 > 0 ? (b.deaths / b.popData2019 * 1000) : 0;
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }
      
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortAsc, countryTotals]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const SortIcon: React.FC<{ field: typeof sortField }> = ({ field }) => { //Иконка сортировки стрелочкой вверх и вниз.
    const isActive = sortField === field;
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        fill="currentColor" 
        className="bi bi-arrow-down-up ms-1" 
        viewBox="0 0 16 16"
        style={{ opacity: isActive ? 1 : 0.5 }}
      >
        <path 
          fillRule="evenodd" 
          d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"
        />
      </svg>
    );
  };

  return (
    <>
      <div className="mb-3">
        <Row className="align-items-end g-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Поиск страны</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите название..."
                value={countryFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentPage(1);
                  setCountryFilter(e.target.value);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <ValueFilter
              field={valueField}
              min={minValue}
              max={maxValue}
              onFieldChange={setValueField}
              onMinChange={setMinValue}
              onMaxChange={setMaxValue}
            />
          </Col>
          <Col md={3}>
            <Button 
              variant="secondary" 
              onClick={() => {
                onResetFilters();
                handleResetValueFilters();
              }}
              className="w-100"
            >
              Сбросить все фильтры
            </Button>
          </Col>
        </Row>
      </div>

      {pagedData.length === 0 ? (
        <p className="text-center text-muted mt-4">Ничего не найдено</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => handleSort('countriesAndTerritories')} style={{ cursor: 'pointer' }}>
                  Страна <SortIcon field="countriesAndTerritories" />
                </th>
                <th onClick={() => handleSort('cases')} style={{ cursor: 'pointer' }}>
                  Случаи <SortIcon field="cases" />
                </th>
                <th onClick={() => handleSort('deaths')} style={{ cursor: 'pointer' }}>
                  Смерти <SortIcon field="deaths" />
                </th>
                <th onClick={() => handleSort('totalCases')} style={{ cursor: 'pointer' }}>
                  Всего случаев <SortIcon field="totalCases" />
                </th>
                <th onClick={() => handleSort('totalDeaths')} style={{ cursor: 'pointer' }}>
                  Всего смертей <SortIcon field="totalDeaths" />
                </th>
                <th onClick={() => handleSort('casesPer1000')} style={{ cursor: 'pointer' }}>
                  Случаи на 1000 <SortIcon field="casesPer1000" />
                </th>
                <th onClick={() => handleSort('deathsPer1000')} style={{ cursor: 'pointer' }}>
                  Смерти на 1000 <SortIcon field="deathsPer1000" />
                </th>
                <th onClick={() => handleSort('dateRep')} style={{ cursor: 'pointer' }}>
                  Дата <SortIcon field="dateRep" />
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((record, index) => (
                <tr key={index}>
                  <td>{record.countriesAndTerritories}</td>
                  <td>{record.cases}</td>
                  <td>{record.deaths}</td>
                  <td>{countryTotals.get(record.countriesAndTerritories)?.totalCases || 0}</td>
                  <td>{countryTotals.get(record.countriesAndTerritories)?.totalDeaths || 0}</td>
                  <td>{(record.cases / record.popData2019 * 1000).toFixed(2)}</td>
                  <td>{(record.deaths / record.popData2019 * 1000).toFixed(2)}</td>
                  <td>{`${record.day}/${record.month}/${record.year}`}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.First 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
              />
              <Pagination.Prev 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
              
              {/* Logic for displaying pages */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5; // Maximum number of visible page buttons
                
                // Always show first page
                if (currentPage > 3) {
                  pages.push(
                    <Pagination.Item 
                      key={1} 
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Pagination.Item>
                  );
                  
                  // Show ellipsis if there are pages between first and current - 1
                  if (currentPage > 4) {
                    pages.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
                  }
                }
                
                // Calculate range of visible page buttons
                const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                // Generate visible page buttons
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Pagination.Item
                      key={i}
                      active={i === currentPage}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </Pagination.Item>
                  );
                }
                
                // Show ellipsis if there are more pages after the visible range
                if (endPage < totalPages - 1) {
                  pages.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
                }
                
                // Always show last page if it's not in the visible range
                if (endPage < totalPages) {
                  pages.push(
                    <Pagination.Item
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Pagination.Item>
                  );
                }
                
                return pages;
              })()}
              
              <Pagination.Next
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}
    </>
  );
};

export default TableView;