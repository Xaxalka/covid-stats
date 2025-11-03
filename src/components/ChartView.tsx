import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CovidRecord } from '../types/CovidData';

interface Props {
  data: CovidRecord[];
  country: string;
}

const ChartView: React.FC<Props> = ({ data, country }) => {
  const filtered = country
    ? data.filter((d) => d.countriesAndTerritories === country)
    : data;

  const chartData = filtered.map((d) => ({
    date: `${d.day}/${d.month}/${d.year}`,
    cases: d.cases,
    deaths: d.deaths,
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cases" stroke="#8884d8" name="Случаи" />
          <Line type="monotone" dataKey="deaths" stroke="#ff4d4f" name="Смерти" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartView;