import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

interface Props {
  field: string;
  min: string;
  max: string;
  onFieldChange: (value: string) => void;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

const ValueFilter: React.FC<Props> = ({
  field,
  min,
  max,
  onFieldChange,
  onMinChange,
  onMaxChange,
}) => {
  return (
    <Form.Group>
      <Form.Label>Фильтр по значению</Form.Label>
      <Row>
        <Col md={4}>
          <Form.Select value={field} onChange={(e) => onFieldChange(e.target.value)}>
            <option value="">Выберите поле</option>
            <option value="cases">Случаи</option>
            <option value="deaths">Смерти</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Минимум"
            value={min}
            onChange={(e) => onMinChange(e.target.value)}
            style={{ backgroundColor: isNaN(Number(min)) && min !== '' ? '#f8d7da' : undefined }}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Максимум"
            value={max}
            onChange={(e) => onMaxChange(e.target.value)}
            style={{ backgroundColor: isNaN(Number(max)) && max !== '' ? '#f8d7da' : undefined }}
          />
        </Col>
      </Row>
    </Form.Group>
  );
};

export default ValueFilter;