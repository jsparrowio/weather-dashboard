import dotenv from 'dotenv';
dotenv.config();

// Defines an interface for the Coordinates object that is used once a location is destructered
interface Coordinates {
  lat: number;
  lon: number;
}

// Defines a class for the Weather object to be used for current weather
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(city: string, date: string, icon: string, description: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = description;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// WeatherService class to serve as the main function of the weather API
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
  // destructureLocationData method to grab the coordiantes from destructed location data
  private destructureLocationData(locationData: any[]): Coordinates {
    const coordinates = {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    }
    return coordinates;
  }
  // Creates a buildGeocodeQuery method to specify which external API URL to use to grab locationData from a city name
  private buildGeocodeQuery(cityName: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${this.apiKey}`;
  }
  // Creates a buildWeatherQuery method to specify which external API URL to use to grab weather data. Uses current weather or forecase types to check for specific calls.
  private buildWeatherQuery(coordinates: Coordinates, queryType: 'currentWeather' | 'forecast' = 'forecast'): string {
    const { lat, lon } = coordinates;
    if (queryType === 'forecast') {
      const response = `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
      return response;
    } else {
      const response = `${this.baseURL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
      return response;
    }
  }
  // Create a fetchAndDestructureLocationData method that calls two methods defined elsewhere to grab, destructure, and grab coordinates from locationData
  private async fetchAndDestructureLocationData(query: string): Promise<Coordinates> {
    const data = await this.fetchLocationData(query);
    return this.destructureLocationData(data);
  }
  // Creates a fetchWeatherData method that calls the buildWeatherQuery method to fetch from the URL defined in said method using an HTML Query
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
  // Builds a parseCurrentWeather method that parses the current weather from JSON data thrown from the response argument
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
  // buildForecastArray method to build an array of forecast data from the JSON forecast data thrown into the argument
  private buildForecastArray(forecastList: any[]) {
    const currentDate = new Date().toLocaleDateString();
    const forecastFiltered = [];
    for (var i = 0; i < forecastList.length; i++) {
      const forecastDate = new Date(forecastList[i].dt * 1000).toLocaleDateString();
      if (currentDate !== forecastDate) {
        forecastFiltered.push(forecastList[i]);
      }
    }
    const forecast = [];
    for (var i = 4; i < forecastFiltered.length; i += 8) {
      const date = new Date(forecastFiltered[i].dt * 1000).toLocaleDateString();
      const forecastObj = {
        date: date,
        tempF: forecastFiltered[i].main.temp,
        iconDescription: forecastFiltered[i].weather[0].description,
        icon: forecastFiltered[i].weather[0].icon,
        windSpeed: forecastFiltered[i].wind.speed,
        humidity: forecastFiltered[i].main.humidity,
      }
      forecast.push(forecastObj);
    }
    return forecast;
  }
  // getWeatherForCity method that uses all the methods defined above to grab current weather and weather forecast using a city name thrown by the search of the user, then returns all said data
  async getWeatherForCity(city: string): Promise<any> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    console.log(`City of ${city} has coordinates of:`, coordinates)
    const currentWeatherData = await this.fetchWeatherData(coordinates, 'currentWeather');
    console.log(`Retrieved current weather successfully...`)
    const forecastData = await this.fetchWeatherData(coordinates, 'forecast');
    console.log(`Retrieved weather forecast successfully...`)
    const currentWeather = this.parseCurrentWeather(currentWeatherData);
    const forecast = this.buildForecastArray(forecastData.list);
    console.log(`Built current weather object and forecast array successfully...`)
    return { currentWeather, forecast };
  }
}

// Allows the weatherService to be imported elsewhere in the application when needed
export default new WeatherService();
