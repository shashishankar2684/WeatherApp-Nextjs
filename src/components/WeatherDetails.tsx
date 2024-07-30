import React from 'react'
import { FiDroplet } from 'react-icons/fi';
import { ImMeter } from 'react-icons/im';
import { LuEye, LuSunrise, LuSunset } from 'react-icons/lu';
import { MdAir } from 'react-icons/md';

export interface WeatherDetailsProps{
    visability: string;
    humidity: string;
    windspeed: string;
    airPressure: string;
    sunrise: string;
    sunset: string;
}

export default function WeatherDetails(props: WeatherDetailsProps) {
    const {
    visability = "25km",
    humidity = "61%",
    windspeed= "7 km/h",
    airPressure= "1012 hPa",
    sunrise= "6.20",
    sunset= "18:48"
    } = props;

  return (
    <>
    <SingleWeatherDetail
    icon = {<LuEye/>}
    information='Visability'
    value={props.visability}
    />
     <SingleWeatherDetail
    icon = {<FiDroplet/>}
    information='Humidity'
    value={props.humidity}
    />
     <SingleWeatherDetail
    icon = {<MdAir/>}
    information='Windspeed'
    value={props.windspeed}
    />
     <SingleWeatherDetail
    icon = {<ImMeter/>}
    information='Air Pressure'
    value={props.airPressure}
    />
     <SingleWeatherDetail
    icon = {<LuSunrise/>}
    information='Sunrise'
    value={props.sunrise}
    />
     <SingleWeatherDetail
    icon = {<LuSunset/>}
    information='Sunset'
    value={props.sunset}
    />
    </>
  )
}

export interface SingleWeatherDetailProps {
    information:string;
    icon: React.ReactNode;
    value:string;
}

function SingleWeatherDetail(props: SingleWeatherDetailProps) {
    return (
        <div className='flex flex-col justify-center gap-2 items-center text-xs font-semibold text-black/80'>
            <p className='whitespace-nowrap'>{props.information}</p>
            <div className='text-3xl'>{props.icon}</div>
            <p>{props.value}</p>

        </div>
    )
}