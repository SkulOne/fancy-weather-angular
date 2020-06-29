import {Injectable} from '@angular/core';
import {combineLatest, from, Observable, of, Subject, throwError} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';
import {fromFetch} from 'rxjs/fetch';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor() {
  }

  private _weatherData: any;
  private _trigger = new Subject();

  get trigger(): Observable<any> {
    return this._trigger.asObservable();
  }

  get weatherData(): any {
    return this._weatherData;
  }

  getWeather(city: string): void {
    this._weatherData = combineLatest([0, 0, 0, 0].map((v, i) => this.makeReq(i, city))).pipe(
      switchMap((responses) => combineLatest(
        responses.map((rsp) => from(
          rsp.ok
            ? rsp.json()
            : (rsp.status === 400
              ? of(null)
              : throwError(`${rsp.status}`)
            ),
        )),
      )),
      map(([first, ...rest]: [any, any[]]) => {
        return {first, rest};
      })
    );
  }

  private makeReq(i: number, city: string): Observable<Response>{
    const apiKey = '5c1b1eabad7f4b35af8144627202405';
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateParse = `${date.getFullYear()}-${this.getFormatDate(date.getMonth() + 1)}-${this.getFormatDate(date.getDate())}`;
    return fromFetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&dt=${dateParse}`,
    );
  }

  private getFormatDate(date: number): string {
    return date < 10 ? `0${date}` : date.toString();
  }

  public weatherTrigger(city: string): void{
    this._trigger.next(city);
  }
}

