import React from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  country: string;
  countries: string[];
  onChange: (value: string) => void;
}

const CountryFilter: React.FC<Props> = ({ country, countries, onChange }) => {
  return (
    <Form.Group controlId="countryFilter">
      <Form.Label>Выберите страну</Form.Label>
      <Form.Select
        value={country}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Все страны</option>
        {countries.map((countryName) => (
          <option key={countryName} value={countryName}>
            {countryName}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default CountryFilter;