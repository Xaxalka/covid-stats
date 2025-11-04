import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { CovidRecord } from '../types/CovidData';

interface Props {
  from: Date | null;
  to: Date | null;
  onFromChange: (value: Date | null) => void;
  onToChange: (value: Date | null) => void;
  onReset: () => void;
  data: CovidRecord[];
  countryFilter?: string;
}

const DateFilter: React.FC<Props> = ({ from, to, onFromChange, onToChange, onReset, data, countryFilter }) => {
  const [fromDateExists, setFromDateExists] = useState<boolean>(true);
  const [toDateExists, setToDateExists] = useState<boolean>(true);

  // Convert Date to YYYY-MM-DD string format for input
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // Check if a date exists in the data for the selected country
  const dateExistsInData = (date: Date | null): boolean => {
    if (!date || data.length === 0) return true;
    
    const dateStr = date.toISOString().split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Filter data by country if a country filter is applied
    const filteredData = countryFilter && countryFilter !== ''
      ? data.filter(record => record.countriesAndTerritories === countryFilter)
      : data;
    
    // If no data exists after country filtering, consider all dates valid
    if (filteredData.length === 0) return true;
    
    return filteredData.some(record => 
      record.year === year && 
      record.month === month && 
      record.day === day
    );
  };

  // Validate dates when they change or when data changes
  useEffect(() => {
    // Reset error states when dates change
    if (from === null) setFromDateExists(true);
    else setFromDateExists(dateExistsInData(from));
    
    if (to === null) setToDateExists(true);
    else setToDateExists(dateExistsInData(to));
  }, [from, to, data, countryFilter]);

  // Handle date input changes
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newDate = value ? new Date(value) : null;
    onFromChange(newDate);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newDate = value ? new Date(value) : null;
    onToChange(newDate);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Период</Form.Label>
      <Row className="g-2">
        <Col xs={12} sm={4} md={3}>
          <Form.Control
            type="date"
            value={formatDateForInput(from)}
            onChange={handleFromChange}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={4} md={3}>
          <Form.Control
            type="date"
            value={formatDateForInput(to)}
            onChange={handleToChange}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={4} md={6}>
          <Button variant="secondary" onClick={onReset} size="sm">
            Показать весь период
          </Button>
        </Col>
      </Row>
      {(!fromDateExists || !toDateExists) && (
        <Alert variant="warning" className="mt-2">
          Внимание: Результаты могут быть неточными. Так как данные стран отличаются по наличию информации за определённые даты.
        </Alert>
      )}
    </Form.Group>
  );
};

export default DateFilter;