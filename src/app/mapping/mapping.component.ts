import { registerLocaleData } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { View, Map } from 'ol';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import {get as GetProjection} from 'ol/proj'
import {register}  from 'ol/proj/proj4';
import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';
import Projection from 'ol/proj/Projection';
import OSM, {ATTRIBUTION} from 'ol/source/OSM';
import { ScaleLine, defaults as DefaultControls, MousePosition} from 'ol/control';
import proj4 from 'proj4';


@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss']
})
export class MappingComponent implements AfterViewInit {

  Map: Map;
  center: Coordinate = [3912489.7690, 4842274.4180];
  zoom: number = 5.5;
  view: View;
  projection: Projection;
  extent: Extent = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
  coord: any[];
  coordX: number;
  coordY: number;
  coordString: string

  @Output() mapReady = new EventEmitter<Map>();


  constructor(private zone: NgZone, private cd: ChangeDetectorRef) { }

  // @HostListener('document:mousemove', ['$event'])


  ngAfterViewInit(): void {
    if(! this.Map) {
      this.zone.runOutsideAngular( () => this.initMap() )   // calling this method below !
    }
    setTimeout( () => this.mapReady.emit(this.Map) );

    var examplelayer = new TileLayer({
      source: new TileWMS({
        url: 'http://localhost:8080/geoserver/Burhan/wms',
        params: {
          'LAYERS': 'Burhan:NoktalarPoint',
          'TILED': true
        },
        projection: 'EPSG:3857',
        serverType: 'geoserver'
      })
    });
    // this.mapId2 = "map";
    this.Map.addLayer(examplelayer);

  }

  private initMap(): void {
    proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    register(proj4);
    this.projection = GetProjection("EPSG:3857");
    this.projection.setExtent(this.extent);

    this.view = new View({
      center: this.center,
      zoom: this.zoom,
      projection: this.projection
    });

    this.Map = new Map({
      layers: [
        new TileLayer({
          source: new OSM ( {} )
        })
      ],
      target: "map",
      view: this.view,
      controls: DefaultControls().extend([
        new ScaleLine( {} ),
        // mousePositionControl,
      ])
    });

    // var mousePositionControl = new MousePosition({
    //   coordinateFormat: createStringXY(4),
    //   projection: 'EPSG:4326',
    //   className: 'custom-mouse-position',
    //   target: document.getElementById('mouse-position'),
    //   undefinedHTML: '&nbsp;'
    // })

  }

  // When clicking, coordinates
  getCoordinates(event: any) {
    this.coord = this.Map.getEventCoordinate(event);
    // this.Map.addEventListener("mousemove", event)
    this.coordX = this.coord[0].toFixed(3);
    this.coordY = this.coord[1].toFixed(3);
    console.log(this.coord);
    this.coordString = `x and y: ${this.coord}`;
    console.log(this.coordString);


  }

  //// mause positions
  // onMouseMove(e) {
  //   console.log(e);
  // }

}
