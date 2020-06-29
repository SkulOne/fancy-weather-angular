import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LocationService} from '../../services/location/location.service';
import {WeatherService} from '../../services/weather/weather.service';

interface WeatherData {
  first: any;
  rest: [any[]];
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {

  constructor(public translate: TranslateService, public location: LocationService, private weatherService: WeatherService) {
  }

  @ViewChildren('dayValues') dayValues: QueryList<any>;

  weatherData;
  date: string;
  weatherUnit: string;

  ngOnInit(): void {
    this.getCurrentTime();
    this.location.getUserLocation().then((data) => {
      this.weatherService.weatherTrigger(data.city);
    });

    this.weatherService.trigger.subscribe((city: string) => {
      this.weatherService.getWeather(city);
      this.weatherData = this.weatherService.weatherData;

      this.setCityOnMap(city);
    });
  }

  getWeatherIcon(value: string): string {
    const values = value.split('/').pop();
    const numbers = values[0] + values[1] + values[2];
    switch (+numbers) {
      case 119:
      case 122:
      case 248:
      case 260:
      case 143:
        return '../assets/icons/cloudy.svg';
      case 116:
        return '../assets/icons/cloudy-day-2.svg';
      case 113:
        return '../assets/icons/day.svg';
      case 293:
      case 229:
      case 353:
      case 299:
      case 305:
        return '../assets/icons/rainy-1.svg';
      case 176:
        return '../assets/icons/rainy-2.svg';
      case 311:
      case 356:
      case 308:
        return '../assets/icons/rainy-6.svg';
      case 359:
      case 314:
      case 284:
        return '../assets/icons/rainy-7.svg';
      case 227:
      case 335:
        return '../assets/icons/snowy-1.svg';
      case 389:
      case 386:
      case 392:
      case 395:
      case 200:
        return '../assets/icons/thunder.svg';
      case 329:
      case 179:
      case 323:
      case 374:
      case 350:
      case 368:
        return '../assets/icons/snowy-2.svg';
      case 182:
        return '../assets/icons/snowy-1.svg';
      case 362:
        return '../assets/icons/snowy-3.svg';
      case 263:
      case 266:
      case 281:
      case 185:
        return '../assets/icons/rainy-2.svg';
      case 332:
      case 326:
        return '../assets/icons/snowy-4.svg';
      case 371:
      case 365:
      case 377:
        return '../assets/icons/snowy-3.svg';
      case 302:
      case 296:
        return '../assets/icons/rainy-5.svg';
      case 230:
        return '../assets/icons/snowy-6.svg';
      case 312:
      case 320:
        return '../assets/icons/snowy-5.svg';
    }
  }

  getWeekDayNextThree(day: any): string {
    let date = day.forecast.forecastday[0].date.split('-');
    date = new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
    return this.getWeekDay(date.getDay());
  }

  private getCurrentTime(): void {
    setInterval(
      () => {
        const dateNow = new Date();
        const options = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        const localDate = dateNow.toLocaleString(this.translate.currentLang, options).split(',');
        localDate[0] = this.getWeekDay(dateNow.getDay());
        this.date = `${localDate.join(',')} ${dateNow.toLocaleTimeString()}`;
      }, 1000);
  }

  private getWeekDay(day: number): string {
    const daysOfWeek = {
      ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      be: ['Нядзеля', 'Панядзелак', 'Аўторак', 'Серада', 'Чацвер', 'Пятніца'],
    };
    switch (this.translate.currentLang) {
      case 'ru':
        return daysOfWeek.ru[day];
      case 'en':
        return daysOfWeek.en[day];
      case 'be':
        return daysOfWeek.be[day];
      default:
        return daysOfWeek.en[day];
    }
  }

  private setCityOnMap(city: string): void {
    this.location.getLocation(city)
      .then((geo) => {
        const coords = geo.results[0].geometry;
        this.location.mapCoords = this.location.parseCoords(coords.lat, coords.lng);
        this.location.map.flyTo({center: [coords.lng, coords.lat], zoom: 10, speed: 2});
      });
  }
}
