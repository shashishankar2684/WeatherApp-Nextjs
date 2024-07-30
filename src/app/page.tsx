'use client'

import Container from "@/components/Container";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import Navbar from "@/components/Navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { metersToKilometers } from "@/utils/metersToKilometers";
import axios from "axios";
import { format, formatDistance, fromUnixTime, parseISO } from "date-fns";
import Image from "next/image";
import { useQuery } from "react-query";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";


// http://api.openweathermap.org/data/2.5/forecast?q=pune&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56

type WeatherData = {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherSnapshot[];
  city: {
      id: number;
      name: string;
      coord: {
          lat: number;
          lon: number;
      };
      country: string;
      population: number;
      timezone: number;
      sunrise: number;
      sunset: number;
  };
};

type WeatherSnapshot = {
  dt: number;
  main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
  };
  weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
  }[];
  clouds: {
      all: number;
  };
  wind: {
      speed: number;
      deg: number;
      gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
      pod: string;
  };
  dt_txt: string;
};

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, ] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>('repoData', async () => 
    {
      const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`);
      return data;
    }
    // fetch('https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56').then(res =>
    //   res.json()
    // )
  );

  useEffect(() => {
    refetch();
  }, [place , refetch])
  

  const firstData = data?.list[0];

  console.log("data", data?.city.name);
  console.log("data", data);

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  //Filtering data to get the first entry after 6am for each unique date

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toDateString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6 ;
    });
  });

  if (isLoading) return (
    <div className="flex items-center min-h-screen justify-center">
      <p className="animate-bounce">Loading...</p>

    </div>
  )
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
    <Navbar location={data?.city.name}/>
    <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
      {/* today data */}
      {loadingCity ? <SkeletonLoader/> :
      <>
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="flex gap-1 text-2xl items-end">
            <p>{format(parseISO(firstData?.dt_txt ??""),"EEEE")}</p>
            <p className="text-lg">{format(parseISO(firstData?.dt_txt ??""),"dd.mm.yyyy")}</p>
          </h2>
          <Container className="gap-10 px-6 items-center">
            {/* temperature */}
            <div className="flex flex-col px-4">
              <span className="text-5xl">
              {convertKelvinToCelsius(firstData?.main.temp ?? 296.37)}°
              </span>
              <p className="text-xs space-x-1 whitespace-nowrap">
                <span>Feels like</span>
                <span>
              {convertKelvinToCelsius(firstData?.main.temp ?? 0)}°
              </span>
                </p>
              <p className="text-xs space-x-2">
                <span>
                {convertKelvinToCelsius(firstData?.main.temp_min?? 0)}°↓{" "}
                </span>
                <span>
                {" "}
                {convertKelvinToCelsius(firstData?.main.temp_max?? 0)}°↑
                </span>
              </p>
            </div>
            {/* time and weather */}
            <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
              {data?.list.map((d, i) => (
                <div
                 key={i}
                 className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                  > 
                  <p className="whitespace-nowrap">{format(parseISO(d.dt_txt),"h:mm a")}</p>

                  <WeatherIcon iconName={d.weather[0].icon}/> 

                  <p>{convertKelvinToCelsius(d?.main.temp ?? 0)}°</p>

                </div>
              ))}
            </div>
          </Container>

        </div>
        <div className="flex gap-4">
          {/* Left */}
          <Container className="w-fit justify-center flex-col px-4 items-center">
            <p className="capitalize text-center">{firstData?.weather[0].description}</p>
          <WeatherIcon iconName={firstData?.weather[0].icon ?? ""}/> 
          </Container>

          {/* Right */}
          <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
          <WeatherDetails  
          visability={metersToKilometers(firstData?.visibility ?? 10000)} 
          humidity={`${firstData?.main.humidity}%`}
          windspeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
          airPressure={`${firstData?.main.pressure} hPa`} 
          sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702949452), "H:mm")}
          sunset={format(fromUnixTime(data?.city.sunset ?? 1702517657), "H:mm")}
          />
          </Container>

        </div>
      </section>
      
      {/* 7 day forecast data */}

      <section className="flex w-full flex-col gap-4">
        <p className="text-2xl">Forecast (7days)</p>
        {firstDataForEachDate.map((d,i) => (
          <ForecastWeatherDetail key={i} 
          weatherIcon={firstData?.weather[0].icon ??""} 
          date={format(parseISO(firstData?.dt_txt ?? ""), "dd.MM")} 
          day={format(parseISO(firstData?.dt_txt ?? ""), "EEEE")} 
          feels_like={firstData?.main.feels_like ?? 0} 
          temp={firstData?.main.temp ?? 0} 
          temp_min={firstData?.main.temp_min ?? 0} 
          temp_max={firstData?.main.temp_min ?? 0} 
          description={firstData?.weather[0].description??""} 
          visability={`${metersToKilometers(firstData?.visibility ?? 10000)}`} 
          humidity={`${firstData?.main.humidity}% `} 
          windspeed={`${convertWindSpeed(firstData?.wind.speed ?? 1.64)} `} 
          airPressure={`${firstData?.main.pressure} hPa `} 
          sunrise={format(
            fromUnixTime(data?.city.sunrise ?? 17025117657),
            "H:mm"
          )} 
          sunset={format(
            fromUnixTime(data?.city.sunset ?? 17025117657),
            "H:mm"
          )} />
        ))}
        
      </section>
      </> }
    </main>
    </div>
  )
}


// import { Skeleton } from 'some-skeleton-library'; // You can also use a library or custom styles

const SkeletonLoader = () => {
  return (
    <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
      {/* Today data */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="flex gap-1 text-2xl items-end">
            <div className="w-32 h-8 bg-gray-300 animate-pulse rounded"></div>
            <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
          </h2>
          <div className="flex gap-10 px-6 items-center">
            {/* Temperature */}
            <div className="flex flex-col px-4">
              <div className="w-24 h-12 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-32 h-6 bg-gray-300 animate-pulse rounded mt-2"></div>
              <div className="w-48 h-6 bg-gray-300 animate-pulse rounded mt-2"></div>
            </div>
            {/* Time and Weather */}
            <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
              {Array(4).fill(1).map((_, i) => (
                <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                  <div className="w-16 h-4 bg-gray-300 animate-pulse rounded"></div>
                  <div className="w-12 h-12 bg-gray-300 animate-pulse rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Left */}
          <div className="w-fit justify-center flex-col px-4 items-center">
            <div className="w-32 h-6 bg-gray-300 animate-pulse rounded mb-2"></div>
            <div className="w-12 h-12 bg-gray-300 animate-pulse rounded"></div>
          </div>

          {/* Right */}
          <div className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
            <div className="flex flex-col gap-2">
              <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-32 h-6 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-32 h-6 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-32 h-6 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </section>
      {/* 7-day forecast data */}
      <section className="flex w-full flex-col gap-4">
        <p className="text-2xl w-48 h-6 bg-gray-300 animate-pulse rounded"></p>
        {Array(7).fill(2).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="w-full h-24 bg-gray-300 animate-pulse rounded"></div>
          </div>
        ))}
      </section>
    </main>
  );
};


