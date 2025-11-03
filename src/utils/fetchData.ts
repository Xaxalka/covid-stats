import axios from 'axios';
import { CovidRecord } from '../types/CovidData';

export const fetchCovidData = async (): Promise<CovidRecord[]> => {
  const response = await axios.get(
    'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/'
  );
  return response.data.records;
};