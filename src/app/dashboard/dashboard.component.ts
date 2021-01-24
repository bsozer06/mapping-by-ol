import { registerLocaleData } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { View, Map } from 'ol';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { get as GetProjection } from 'ol/proj'
import TileLayer from 'ol/layer/Tile';
import { TileWMS, Vector, Vector as VectorSource } from 'ol/source';
import Projection from 'ol/proj/Projection';
import OSM, { ATTRIBUTION } from 'ol/source/OSM';
import { ScaleLine, defaults as DefaultControls, MousePosition, Zoom, Rotate, Attribution, ZoomSlider, OverviewMap, defaults, Control } from 'ol/control';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as olInteraction from 'ol/interaction';
import Style from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { CoordinateFormat } from 'ol/coordinate';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  map: Map;
  // center: Coordinate = [3912489.7690, 4842274.4180];
  // zoom: number = 5.5;
  view: View;
  projection: Projection;
  // extent: Extent = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
  coordinates: any;
  coord_x: any;
  coord_y: any;
  vectorLayerPoligon: VectorLayer;
  vectorLayerNokta: VectorLayer;
  mousePositionControl: MousePosition;
  ControlOptions: Control[];

  constructor() { }

  ngOnInit(): void {

    // turkiyenin il siniri poligon geojson
    this.vectorLayerPoligon = new VectorLayer({
      source: new Vector({
        format: new GeoJSON({
          dataProjection: 'EPSG:4326'
        }),
        url: "./assets/TcIller.geojson",
        attributions: []
      })
    });

    // turkiyenin il merkez noktalari geojson
    this.vectorLayerNokta = new VectorLayer({
      source: new Vector({
        format: new GeoJSON({
          dataProjection: 'EPSG:4326'
        }),
        url: "./assets/TcIllerNokta.geojson",
      }),
      style: new Style({
        image: new RegularShape({
          points: 5,
          stroke: new Stroke({
            width: 0.7,
            color: [6, 15, 34, 1]
          }),
          fill: new Fill({
            color: [15, 245, 75, 0.3]
          }),
          radius1: 5,
          radius2: 8,
          rotation: Math.PI
        })
      })
    });

    this.ControlOptions = [     // in the book
      new Zoom({
        target: 'toolbar'
      }),
      new Rotate(),
      new Attribution(),
      // define some new controls
      new ZoomSlider(),
      new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:4326',
        className: 'custom-mouse-position',
        target: document.getElementById('coordinates'),
        undefinedHTML: '&nbsp;'
      }),
      new ScaleLine(),
      new OverviewMap()
    ];

    this.map = new Map({
      target: 'map',    // div icerisinde cagrilacak sinif
      layers: [new TileLayer({ source: new OSM() }), this.vectorLayerPoligon, this.vectorLayerNokta],     // harit katmanlar on harita
      controls: this.ControlOptions,           // defaults
      // controls: DefaultControls().extend([this.mousePositionControl]),
      interactions: olInteraction.defaults().extend(
        [
          /// yuklenen geojson'a secme imkani sagliyor !!!
          new olInteraction.Select({ layers: [this.vectorLayerPoligon, this.vectorLayerNokta] }),
        ]
      ),
      view: new View({      // harita acilince merkez ve zooom seviyesini tanimlar !
        center: [0, 0],
        zoom: 2
      })
    });

    // this.map.addControl(this.mousePositionControl);

    var layerTree = function (options) {
      'use strict';
      if (!(this instanceof layerTree)) {
        throw new Error('layerTree must be constructed with the new keyword.');
      }
      else if (typeof options === 'object' && options.map && options.target) {
        if (!(options.map instanceof Map)) {
          throw new Error('Please provide a valid OpenLayers map object.');
        }
        this.map = options.map;
        var containerDiv = document.getElementById(options.target);
        if (containerDiv === null || containerDiv.nodeType !== 1) {
          throw new Error('Please provide a valid element id.');
        }
        this.messages = document.getElementById(options.messages) || document.createElement('span');
        var controlDiv = document.createElement('div');
        controlDiv.className = 'layertree-buttons';
        containerDiv.appendChild(controlDiv);
        this.layerContainer = document.createElement('div');
        this.layerContainer.className = 'layercontainer';
        containerDiv.appendChild(this.layerContainer);
      }
    }




  }
}
