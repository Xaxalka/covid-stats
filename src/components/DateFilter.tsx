import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

interface Props {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
}

const DateFilter: React.FC<Props> = ({ from, to, onFromChange, onToChange, onReset }) => {
  return (
    
    <Form.Group className="mb-3">
      <Form.Label>Период</Form.Label>
      <Row>
        <Col>
          <Form.Control
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
          />
        </Col>
        <Col>
          <Form.Control
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
          />
        </Col>
        <Col>
          <Button variant="secondary" onClick={onReset}>
            Показать весь период
          </Button>
        </Col>
      </Row>
    </Form.Group>
  );
};

export default DateFilter;