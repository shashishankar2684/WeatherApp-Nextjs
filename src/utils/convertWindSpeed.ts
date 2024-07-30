
export function convertWindSpeed(speedInMeterPerSecond : number): string {
    const speedInKilometersPerHour = speedInMeterPerSecond * 3.6  // conversion from m/s to km/h
    return `${speedInKilometersPerHour.toFixed(0)}km/h`;
}