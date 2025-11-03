import React from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  country: string;
  onChange: (value: string) => void;
}

const CountryFilter: React.FC<Props> = ({ country, onChange }) => {
  return (
    <Form.Group controlId="countryFilter">
      <Form.Label>Поиск страны</Form.Label>
      <Form.Control
        type="text"
        placeholder="Введите название страны..."
        value={country}
        onChange={(e) => onChange(e.target.value)}
      />
    </Form.Group>
  );
};

export default CountryFilter;