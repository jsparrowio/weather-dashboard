import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  // TODO: GET weather data from city name
  const cityName = req.body.cityName;
  try {
   console.log(`Attempting to get weather data for: ${cityName}...`);
  const weatherData = await WeatherService.getWeatherForCity(cityName);
  await HistoryService.addCity(cityName);
  res.json(weatherData);
  console.log(`Weather data for ${cityName} retrieved succesfully!`)
  // TODO: save city to search history
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const savedCities = await HistoryService.getCities();
    res.json(savedCities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(400).json({ msg: 'City id is required' });
    }
    await HistoryService.removeCity(req.params.id);
    res.json({ success: 'City successfully removed from search history' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
