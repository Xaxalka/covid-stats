import React, { useState, useMemo } from 'react';
import { Table, Form, Button, Pagination } from 'react-bootstrap';
import { CovidRecord } from '../types/CovidData';

interface Props {
  data: CovidRecord[];
  dateFrom: string;
  dateTo: string;
  countryFilter: string;
  valueField: string;
  minValue: number | '';
  maxValue: number | '';
  onResetFilters: () => void;
  
}

const PAGE_SIZE = 20;

const TableView: React.FC<Props> = ({
  data,
  countryFilter,
  valueField,
  minValue,
  maxValue,
  onResetFilters,
  dateFrom,
  dateTo,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'countriesAndTerritories' | 'cases' | 'deaths'>('countriesAndTerritories');
  const [sortAsc, setSortAsc] = useState(true);

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
        const minOk = minValue === '' || value >= minValue;
        const maxOk = maxValue === '' || value <= maxValue;
        return minOk && maxOk;
      });
    }

    return filtered;
  }, [data, countryFilter, valueField, minValue, maxValue, dateFrom, dateTo]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortAsc]);

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

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="Поиск страны..."
          value={countryFilter}
          onChange={(e) => {
            setCurrentPage(1);
            // Note: The actual filter value is managed by the parent component
          }}
          readOnly
        />
        <Button variant="secondary" onClick={onResetFilters}>
          Сбросить фильтры
        </Button>
      </div>

      {pagedData.length === 0 ? (
        <p>Пo вашему критерию ничего не найдено</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => handleSort('countriesAndTerritories')}>Страна</th>
                <th onClick={() => handleSort('cases')}>Случаи</th>
                <th onClick={() => handleSort('deaths')}>Смерти</th>
                <th>Всего случаев</th>
                <th>Всего смертей</th>
                <th>Случаи на 1000</th>
                <th>Смерти на 1000</th>
                <th>Дата</th>
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

          <Pagination>
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </>
  );
};

export default TableView;