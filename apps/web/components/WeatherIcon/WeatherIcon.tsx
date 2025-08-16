'use client'

import React, { useEffect, useState } from 'react';

// Define TypeScript interfaces for props and state
interface WeatherIconProps {
  postalCode: string;
  date: string;  // Date as 'YYYY-MM-DD' format
  linkOut?: boolean;
}

interface ForecastData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
}

interface WeatherData {
  date: string;
  iconUrl: string;
}

// Use NEXT_PUBLIC_ prefix for client-side access
const apiKey = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;

const WeatherIcon: React.FC<WeatherIconProps> = ({
  postalCode,
  date,
  linkOut 
}) => {
  const [weatherDayData, setWeatherDayData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${postalCode}&days=10&aqi=no&alerts=no`;

  useEffect(() => {
    const fetchWeatherData = async () => {
      console.log('WEATHER DATE:', date);
      console.log('WEATHER URL:', url);
      try {
        const response = await fetch(url);
        const data = await response.json();
        // Find the weather data for the requested date
        if (data && data.forecast.forecastday.length > 0) {
          setForecastData(data);
          const matchingDay = data.forecast.forecastday.find((day: any) => day.date === date);
          if (matchingDay) {
            setWeatherDayData({
              date: matchingDay.date,
              iconUrl: matchingDay.day.condition.icon
            });
          } else {
            console.error("No weather data found for the given date.");
            setWeatherDayData(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch weather data", error);
      }
    };

    fetchWeatherData();
  }, [postalCode, date, url]);

  if (!weatherDayData) return null;

  let weatherLink;
  if (linkOut) {
    const city = forecastData?.location?.name;
    const stateAbbreviations = {
      "Alabama": 'AL',
      "Alaska": 'AK',
      "Arizona": 'AZ',
      "Arkansas": 'AR',
      "California": 'CA',
      "Colorado": 'CO',
      "Connecticut": 'CT',
      "Delaware": 'DE',
      "Florida": 'FL',
      "Georgia": 'GA',
      "Hawaii": 'HI',
      "Idaho": 'ID',
      "Illinois": 'IL',
      "Indiana": 'IN',
      "Iowa": 'IA',
      "Kansas": 'KS',
      "Kentucky": 'KY',
      "Louisiana": 'LA',
      "Maine": 'ME',
      "Maryland": 'MD',
      "Massachusetts": 'MA',
      "Michigan": 'MI',
      "Minnesota": 'MN',
      "Mississippi": 'MS',
      "Missouri": 'MO',
      "Montana": 'MT',
      "Nebraska": 'NE',
      "Nevada": 'NV',
      "New Hampshire": 'NH',
      "New Jersey": 'NJ',
      "New Mexico": 'NM',
      "New York": 'NY',
      "North Carolina": 'NC',
      "North Dakota": 'ND',
      "Ohio": 'OH',
      "Oklahoma": 'OK',
      "Oregon": 'OR',
      "Pennsylvania": 'PA',
      "Rhode Island": 'RI',
      "South Carolina": 'SC',
      "South Dakota": 'SD',
      "Tennessee": 'TN',
      "Texas": 'TX',
      "Utah": 'UT',
      "Vermont": 'VT',
      "Virginia": 'VA',
      "Washington": 'WA',
      "West Virginia": 'WV',
      "Wisconsin": 'WI',
      "Wyoming": 'WY'
    };
    const state = forecastData?.location.region;
    const stateAbbreviation = stateAbbreviations[state as keyof typeof stateAbbreviations];
    weatherLink = `https://www.wunderground.com/hourly/us/${stateAbbreviation}/${city}/${postalCode}/date/${date}`;
  }

  const icon = <img src={weatherDayData.iconUrl} alt="Weather icon" />;
  const renderIcon = () => {
    if (linkOut) {
      return <a href={weatherLink} target="_blank" rel="noopener noreferrer" className="weather-icon">{icon}</a>;
    } else {
      return <span className="weather-icon">{icon}</span>;
    }
  };

  return renderIcon();
};

export { WeatherIcon };