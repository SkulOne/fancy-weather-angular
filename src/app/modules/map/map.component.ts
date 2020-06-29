import {Component, OnInit} from '@angular/core';
import {LocationService} from '../../services/location/location.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  constructor(private location: LocationService) {
  }

  coords;

  ngOnInit(): void {
    this.location.mapInit();
    this.coords = this.location.mapCoords;
  }
}
