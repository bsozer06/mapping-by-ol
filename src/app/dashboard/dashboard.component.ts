import 'ol/ol.css';
import { registerLocaleData } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { View, Map, Tile } from 'ol';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { get as GetProjection } from 'ol/proj'
import TileLayer from 'ol/layer/Tile';
import { BingMaps, TileWMS, Vector, Vector as VectorSource } from 'ol/source';
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
import Layer from 'ol/layer/Layer';
import LayerGroup from 'ol/layer/Group';
import { title } from 'process';
import BaseObject from 'ol/Object';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  map: Map;
  // center: Coordinate = [3912489.7690, 4842274.4180];
  // zoom: number = 5.5;
  bingMapAerial: TileLayer;
  osmMap: TileLayer;
  baseLayerGroup: LayerGroup;
  layerGroup: LayerGroup;
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
  baseLayerElements: any;
  baseLayerGroupElements: any;

  constructor() { }

  ngOnInit(): void {

    // OSM map
    this.osmMap = new TileLayer({
      source: new OSM(),
      visible: true,
    });
    this.osmMap.set('title', 'OSMStandard');

    // bing map
    this.bingMapAerial = new TileLayer({
      source: new BingMaps({
        key: "AvEPE9OOrtC2me4zpFzF60eXuZPtmxFMNi5TvJYlRZNlxlQfcZHvl9M0f66lbqGa",
        imagerySet: 'Aerial',
      }),
      visible: false,
    });
    this.bingMapAerial.set('title', 'BingMaps');

  //   const openstreetMapHumanitarianLayer = new TileLayer({
  //     source: new OSM({
  //         url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
  //     }),
  //     visible: false,
  // })

    // turkiyenin il siniri poligon geojson
    this.vectorLayerPoligon = new VectorLayer({
      source: new Vector({
        format: new GeoJSON({
          dataProjection: 'EPSG:4326'
        }),
        url: "./assets/TcIller.geojson",
        attributions: []
      }),
      visible: true,
      zIndex: 1
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
      }),
      zIndex: 1,
      visible: true
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
      // layers: this.baseLayerGroup,     // harit katmanlar on harita
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

    // layer group olusturuldu cunku array olarak add islemi yapilamaz !
    this.layerGroup = new LayerGroup({
      layers: [this.vectorLayerPoligon, this.vectorLayerNokta]
    });
    this.map.addLayer(this.layerGroup);


    this.baseLayerGroup = new LayerGroup({
      layers: [this.osmMap, this.bingMapAerial]
    });
    this.map.addLayer(this.baseLayerGroup);


    this.baseLayerGroupElements = document.querySelectorAll('.sidenav > input[type=radio]');
    for (let baseLayerGroupElement of this.baseLayerGroupElements) {
      let baseLayerGroupLayers = this.baseLayerGroup.getLayers();
      baseLayerGroupElement.addEventListener('change',function(e) {
        let baseLayerGroupValue = e.target.value;
        baseLayerGroupLayers.forEach(function(element, index, array) {
          // let baseLayerName = element.getClassName();
          let baseLayerName = element.get('title');
          element.setVisible(baseLayerName === baseLayerGroupValue);
          console.log(baseLayerName, baseLayerGroupValue);

        })
      })
    }

    //  console.log(baseLayerGroupElements);


    // this.baseLayerGroup.getLayers().foreach(function(element, index, array) {
    //     let baseLayerName = element.get('title')
    //     console.log(baseLayerName);
    // };


    // this.baseLayerElements = document.querySelectorAll('.sidenav > input[type=radio]');
    // for (let baseLayerElement of this.baseLayerElements) {
    //   baseLayerElement.addEventListener('change', function() {
    //     console.log(this.value);
    //     let baseLayerElementValue = this.value;
    //     console.log(this.baseLayerGroup.getLayers());
    //     // this.baseLayerGroup.getLayers().forEach(function(element, index, array){
    //     //   let baseLayerName = element.get('title');
    //     //   element.setVisible(baseLayerName === baseLayerElementValue)
    //     // })
    //   })
    // }


    // this.map.addControl(this.mousePositionControl);






  }
}
