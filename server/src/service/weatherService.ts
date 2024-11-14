import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(city: string, date: string,  icon: string, description: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = description;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {

  private baseURL?: string;
  private apiKey?: string;
  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }

  async fetchLocationData(query: string): Promise<any> {
    try {
      const geocodeResult = this.buildGeocodeQuery(query);
      const response = await fetch(geocodeResult);
      if (!response.ok) {
        throw new Error('Network response failed');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching location data:", error);
      return null;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any[]): Coordinates {
    const coordinates = {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    }
    return coordinates;
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(cityName: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates, queryType:  'currentWeather' | 'forecast' = 'forecast'): string {
    const { lat, lon } = coordinates;
    if (queryType === 'forecast') {
    const response = `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
    return response;
    } else {
    const response = `${this.baseURL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
    return response;
    }
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(query: string): Promise<Coordinates> {
    const data = await this.fetchLocationData(query);
    return this.destructureLocationData(data);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates, queryType: 'currentWeather' | 'forecast' = 'forecast') {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates, queryType);
      const response = await fetch(weatherQuery);
      if (!response.ok) {
        throw new Error('Network response failed');
      }
      const weatherData = await response.json();
      return weatherData;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    if (!response) {
      throw new Error('Network response failed');
    }
    const date = new Date(response.dt * 1000).toLocaleDateString();

    return {
      city: response.name,
      date: date,
      icon: response.weather[0].icon,
      iconDescription: response.weather[0].description,
      tempF: response.main.temp,
      windSpeed: response.wind.speed,
      humidity: response.main.humidity
    };
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(forecastData: any[]) {
    const forecast = forecastData.slice(1, 6).map((forecastSliced) => {
      return {
        date: forecastSliced.dt_txt,
        tempF: forecastSliced.main.temp,
        iconDescription: forecastSliced.weather[0].description,
        icon: forecastSliced.weather[0].icon,
        windSpeed: forecastSliced.wind.speed,
        humidity: forecastSliced.main.humidity,
      };
    });
    return forecast
  }
  // TODO: Complete getWeatherForCity method+
  async getWeatherForCity(city: string): Promise<any> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    console.log (`City of ${city} has coordinates of:`, coordinates)
    const currentWeatherData = await this.fetchWeatherData(coordinates, 'currentWeather');
    console.log (`Retrieved current weather successfully...`)
    const forecastData = await this.fetchWeatherData(coordinates, 'forecast');
    console.log (`Retrieved weather forecast successfully...`)
    const currentWeather = this.parseCurrentWeather(currentWeatherData);
    const forecast = this.buildForecastArray(forecastData.list);
    console.log (`Built current weather object and forecast array successfully...`)
    return { currentWeather, forecast };
  }
}

export default new WeatherService();
