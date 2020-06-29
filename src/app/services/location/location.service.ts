import {Injectable} from '@angular/core';

import {Map} from 'yandex-maps';
import * as mapboxgl from 'mapbox-gl/dist/mapbox-gl';


interface ICoords {
  latitude: {
    int: number;
    frac: number;
  };
  longitude: {
    int: number;
    frac: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(){
    mapboxgl.accessToken = this._mapboxApiKey;
}

  private _mapCoords: ICoords;
  private readonly _openCageApiKey = '018fa99938d148e0a40836542e00445e';
  private readonly _ipInfoApiKey = 'eb5b90bb77d46a';
  private readonly _mapboxApiKey = 'pk.eyJ1Ijoic2t1bG9uZSIsImEiOiJja2J4dmhpcGUwdHNrMnJwN2Z4NmwxZTV0In0.4pNMO3S1MBUQMb0S0mPuJQ';
  private _map;

  mapInit(){
    mapboxgl.accessToken = this._mapboxApiKey;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11'
    });
  }

  get mapCoords(): ICoords {
    return this._mapCoords;
  }

  set mapCoords(value: ICoords) {
    this._mapCoords = value;

  }

  get openCageApiKey(): string {
    return this._openCageApiKey;
  }

  get ipInfoApiKey(): string {
    return this._ipInfoApiKey;
  }

  get map(): any {
    return this._map;
  }

  set map(value: any) {
    this._map = value;
  }

  getLocation(city: string) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${this.openCageApiKey}`;
    return fetch(url)
      .then((res) => res.json());
  }

  getUserLocation() {
    return fetch(`https://ipinfo.io/json?token=${this.ipInfoApiKey}`)
      .then((res) => res.json());
  }

  parseCoords(latitude: number, longitude: number): ICoords {
    return {
      latitude: {
        int: Math.trunc(latitude),
        frac: Math.trunc(latitude % 1 * 100),
      },
      longitude: {
        int: Math.trunc(longitude),
        frac: Math.trunc(longitude % 1 * 100),
      }
    };
  }

}
