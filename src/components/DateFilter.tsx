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

  // Handle date input changes with validation
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newDate = value ? new Date(value) : null;
    
    // Validate range if 'to' date is set
    if (newDate && to) {
      // Check minimum range (1 month)
      const minDate = new Date(newDate);
      minDate.setMonth(minDate.getMonth() + 1);
      if (to < minDate) {
        // Adjust 'to' date if it's less than 1 month from 'from'
        const adjustedTo = new Date(minDate);
        onToChange(adjustedTo);
      }
      
      // Check maximum range (1 year)
      const maxDate = new Date(newDate);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (to > maxDate) {
        // Adjust 'to' date if it exceeds 1 year from 'from'
        const adjustedTo = new Date(maxDate);
        onToChange(adjustedTo);
      }
    }
    
    onFromChange(newDate);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newDate = value ? new Date(value) : null;
    
    // Validate range if 'from' date is set
    if (newDate && from) {
      // Check minimum range (1 month)
      const minDate = new Date(from);
      minDate.setMonth(minDate.getMonth() + 1);
      if (newDate < minDate) {
        // Don't allow 'to' date to be less than 1 month from 'from'
        onToChange(minDate);
        return;
      }
      
      // Check maximum range (1 year)
      const maxDate = new Date(from);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (newDate > maxDate) {
        // Limit 'to' date to 1 year from 'from'
        onToChange(maxDate);
        return;
      }
    }
    
    onToChange(newDate);
  };

  // Calculate max date for 'to' input (1 year from 'from')
  const getMaxToDate = (): string | undefined => {
    if (from) {
      const maxDate = new Date(from);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      return formatDateForInput(maxDate);
    }
    return undefined;
  };

  // Calculate min date for 'from' input (1 year before 'to')
  const getMinFromDate = (): string | undefined => {
    if (to) {
      const minDate = new Date(to);
      minDate.setFullYear(minDate.getFullYear() - 1);
      return formatDateForInput(minDate);
    }
    return undefined;
  };

  // Calculate min date for 'to' input (1 month from 'from')
  const getMinToDate = (): string | undefined => {
    if (from) {
      const minDate = new Date(from);
      minDate.setMonth(minDate.getMonth() + 1);
      return formatDateForInput(minDate);
    }
    return undefined;
  };

  // Calculate max date for 'from' input (1 month before 'to')
  const getMaxFromDate = (): string | undefined => {
    if (to) {
      const maxDate = new Date(to);
      maxDate.setMonth(maxDate.getMonth() - 1);
      return formatDateForInput(maxDate);
    }
    return undefined;
  };

  return (
    <Form.Group className="mb-3 period-controls">
      <Form.Label>Период</Form.Label>
      <Row className="g-2 align-items-stretch">
        <Col xs={12} sm="auto" md="auto">
          <Form.Control
            type="date"
            value={formatDateForInput(from)}
            onChange={handleFromChange}
            max={getMaxFromDate()}
            min={getMinFromDate()}
            size="sm"
          />
        </Col>
        <Col xs={12} sm="auto" md="auto">
          <Form.Control
            type="date"
            value={formatDateForInput(to)}
            onChange={handleToChange}
            min={getMinToDate()}
            max={getMaxToDate()}
            size="sm"
          />
        </Col>
        <Col xs={12} sm="auto" md="auto">
          <Button variant="secondary" onClick={onReset} size="sm" className="py-1" style={{ whiteSpace: 'nowrap' }}>
            Показать весь период
          </Button>
        </Col>
      </Row>
      {(!fromDateExists || !toDateExists) && (
        <Alert variant="warning" className="mt-2">
          Внимание: Результаты могут быть неточными. Так как данные стран отличаются по наличию информации за определённые даты.
          <br />
          (Так же присутствует лимит: минимальный диапазон 1 месяц, максимальный диапазон 1 год)
        </Alert>
      )}
    </Form.Group>
  );
};

export default DateFilter;