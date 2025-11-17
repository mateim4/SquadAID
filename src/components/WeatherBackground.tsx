import React from 'react';

const WeatherBackground: React.FC = () => {
  return (
    <>
      <div className="weather-background">
        <div className="weather-sun"></div>
        <div className="weather-particles">
          <div className="weather-particle"></div>
          <div className="weather-particle"></div>
          <div className="weather-particle"></div>
          <div className="weather-particle"></div>
          <div className="weather-particle"></div>
          <div className="weather-particle"></div>
          <div className="weather-particle"></div>
          <div className="weather-particle"></div>
        </div>
      </div>
      <div className="dof-background"></div>
    </>
  );
};

export default WeatherBackground;