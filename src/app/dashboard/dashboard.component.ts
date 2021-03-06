import { faLayerGroup, faMapSigns, faAtlas, faDrawPolygon, faCircle, faGripLines, faDownload, faTasks } from '@fortawesome/free-solid-svg-icons';

import 'ol/ol.css';
import { registerLocaleData } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { View, Map, Tile, Overlay } from 'ol';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { get as GetProjection, transform } from 'ol/proj'
import TileLayer from 'ol/layer/Tile';
import { BingMaps, Stamen, TileWMS, Vector, Vector as VectorSource, XYZ } from 'ol/source';
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
import { mapToMapExpression } from '@angular/compiler/src/render3/util';
import OverlayPositioning from 'ol/OverlayPositioning';
import GeometryType from 'ol/geom/GeometryType';
import { parse } from '@fortawesome/fontawesome-svg-core';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  map: Map;
  bingMapAerial: TileLayer;
  osmMap: TileLayer;
  baseLayerGroup: LayerGroup;
  layerGroup: LayerGroup;
  view: View;
  projection: Projection;
  coordinates: any;
  coord_x: any;
  coord_y: any;
  // vectorLayerPoligon: VectorLayer;
  vectorLayerNokta: VectorLayer;
  mousePositionControl: MousePosition;
  ControlOptions: Control[];
  baseLayerElements: any;
  baseLayerGroupElements: any;
  layergroup = faLayerGroup;
  mapsigns = faMapSigns;
  atlas = faAtlas;
  DrawPolygon = faDrawPolygon;
  circle = faCircle;
  GripLines = faGripLines;
  Download = faDownload;
  Task = faTasks;
  buttonInfo: boolean;

  constructor() {
    this.buttonInfo = false;
  }

  ngOnInit(): void {

    //************** BASE MAP LAYERS *************//
    // Google Road Base Map Layer
    const googleRoadMap = new TileLayer({
      source: new XYZ({
        url: "http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        attributions: "© Google Roads Map",
      }),
      visible: false
    })
    googleRoadMap.set("title", "googleRoadMap");

    const googleSatelliteMap = new TileLayer({
      source: new XYZ({
        url: "http://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attributions: "© Google Satellite Map",
        attributionsCollapsible: false
      }),
      visible: true
    })
    googleSatelliteMap.set("title", "googleSatelliteMap");

    // OSM Standard Base Map Layer
    this.osmMap = new TileLayer({
      source: new OSM(),
      visible: false,
    });
    this.osmMap.set('title', 'OSMStandard');

    // OSM Humanitarian Map Layer
    const osmHumanitarianLayer = new TileLayer({
      source: new OSM({
        url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      }),
      visible: false,
    });
    osmHumanitarianLayer.set('title', 'OSMHumanitarian');

    // Bing Base Map Layer
    this.bingMapAerial = new TileLayer({
      source: new BingMaps({
        key: "AvEPE9OOrtC2me4zpFzF60eXuZPtmxFMNi5TvJYlRZNlxlQfcZHvl9M0f66lbqGa",
        imagerySet: 'Aerial',
      }),
      visible: false,
    });
    this.bingMapAerial.set('title', 'BingMaps');

    // CartoDb Positron without labels Base Map Layer
    const cartoDbLightMap = new TileLayer({
      source: new XYZ({
        url: 'https://{1-4}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
        attributions: '© CARTO'
      }),
      visible: false,
    });
    cartoDbLightMap.set('title', 'CartoDBLight');

    // CartoDb Dark Matter with labels Base Map Layer
    const cartoDbDarkMap = new TileLayer({
      source: new XYZ({
        url: 'https://{1-4}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        attributions: '© CARTO'
      }),
      visible: false,
    });
    cartoDbDarkMap.set('title', 'CartoDBDark');

    // Stamen Toner Map
    const stamenTonerMap = new TileLayer({
      source: new XYZ({
        url: 'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
        attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
      }),
      visible: false
    });
    stamenTonerMap.set('title', 'stamenTonerMap');

    // Stamen Watercolor Map
    const stamenWatercolornMap = new TileLayer({
      source: new Stamen({
        layer: 'watercolor',      /// or "toner"or "terrain-labels" for alternative
      }),
      visible: false
    });
    stamenWatercolornMap.set('title', 'stamenWatercolornMap');


    //************** Vector LAYERS *************//
    // The city boundries of Turkey using GeoJSON data
    // this.vectorLayerPoligon = new VectorLayer({
    const TcCitiesGeoJSON = new VectorLayer({
      source: new Vector({
        format: new GeoJSON({
          dataProjection: 'EPSG:4326'
        }),
        url: "./assets/TcIller.geojson",
        // attributions: []
      }),
      visible: false,
    });
    TcCitiesGeoJSON.set('title', 'TcCitiesGeoJSON')

    // turkiyenin il merkez noktalari geojson
    // this.vectorLayerNokta = new VectorLayer({
    const TcCityCentersGeoJSON = new VectorLayer({
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
      // zIndex: 1,
      visible: false
    });
    TcCityCentersGeoJSON.set('title', 'TcCityCentersGeoJSON');

    //************** Services LAYERS *************//
    const roadsInAnkara = new TileLayer({
      source: new TileWMS({
        url: "http://localhost:8080/geoserver/Burhan/wms",
        params: {
          'LAYERS': 'Burhan:ankara_roads',
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
          'TILE': true
        },
        serverType: 'geoserver',
      }),
      visible: false
    });
    roadsInAnkara.set('title', "roadsInAnkara");

    const clusteringMap = new TileLayer({
      source: new TileWMS({
        url: "http://localhost:8080/geoserver/Burhan/wms",
        params: {
          'LAYERS': 'Burhan:RandomPointsInTurkey',
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
          'TILE': true
        },
        serverType: 'geoserver'
      }),
      visible: true
    });
    clusteringMap.set('title', 'ClusteringInTurkey');


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
      controls: this.ControlOptions,           // defaults
      // controls: DefaultControls().extend([this.mousePositionControl]),
      // interactions: olInteraction.defaults(),
      interactions: olInteraction.defaults().extend(
        [
          /// yuklenen geojson'a secme imkani sagliyor !!!
          new olInteraction.Select({ layers: [TcCitiesGeoJSON, this.vectorLayerNokta] }),
        ]
      ),
      view: new View({      // harita acilince merkez ve zooom seviyesini tanimlar !
        center: transform([34, 39], 'EPSG:4326', 'EPSG:3857'),      //// ol.proj.transform()
        zoom: 6
      })
    });


    // Adding Base Map Layer as a Layer group
    this.baseLayerGroup = new LayerGroup({
      layers: [
        googleRoadMap, googleSatelliteMap, this.osmMap, this.bingMapAerial, osmHumanitarianLayer, cartoDbLightMap, cartoDbDarkMap,
        stamenTonerMap, stamenWatercolornMap
      ]
    });
    this.map.addLayer(this.baseLayerGroup);

    /// Radio Settings for Base Map Layers
    this.baseLayerGroupElements = document.querySelectorAll('.sidenav > input[type=radio]');
    for (let baseLayerGroupElement of this.baseLayerGroupElements) {
      let baseLayerGroupLayers = this.baseLayerGroup.getLayers();
      baseLayerGroupElement.addEventListener('change', function (e) {
        let baseLayerGroupValue = e.target.value;
        baseLayerGroupLayers.forEach(function (element, index, array) {
          let baseLayerName = element.get('title');
          element.setVisible(baseLayerName === baseLayerGroupValue);
          console.log(baseLayerName, baseLayerGroupValue);
        })
      })
    };


    // layer group olusturuldu cunku array olarak add islemi yapilamaz !
    this.layerGroup = new LayerGroup({
      layers: [TcCitiesGeoJSON, TcCityCentersGeoJSON, roadsInAnkara, clusteringMap]
    });
    this.map.addLayer(this.layerGroup);

    // Checkbox settings for switching based on layers
    const layerCheckboxElements = document.querySelectorAll('.sidenav > input[type=checkbox]');
    layerCheckboxElements.forEach((layerCheckboxElement) => {
      layerCheckboxElement.addEventListener('click', (event) => {
        let selectedLayer;
        let layerCheckboxElementTarget = event.target as HTMLInputElement;      /// to reach "value" in the template of checkbox
        let layerCheckboxElementValue = layerCheckboxElementTarget.value;
        // console.log(this.layerGroup.getLayers());
        this.layerGroup.getLayers().forEach(function (element, index, array) {
          if (layerCheckboxElementValue === element.get('title')) {
            selectedLayer = element;
          }
        })
        let inEvent = event.target as HTMLInputElement;
        inEvent.checked ? selectedLayer.setVisible(true) : selectedLayer.setVisible(false);
      })
    })


    ///// Getting info from features !!!!
    const overlayLayer = new Overlay({
      element: document.querySelector('.overlay-popup-container') as HTMLInputElement,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
      offset: [9, 9]
    });

    this.map.addOverlay(overlayLayer);

    this.map.on('click', (evt) => {
      // evt.map.forEachLayerAtPixel(evt.pixel, function(feature, layer) {      /// sağlıklı yaklasim degil -- arrow daha iyi
      this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        overlayLayer.setPosition(undefined);
        // console.log(feature, layer);
        // console.log(feature.getProperties());
        let clickedCoordinate = evt.coordinate;
        let clickedFeatureName = feature.get("iladi");
        let clickedFeatureCode = feature.get("il_prinx");
        if (clickedFeatureCode && clickedFeatureName != undefined) {
          // overlayLayer.setPositioning("TOP_LEFT" as OverlayPositioning);
          // console.log(clickedFeatureName);
          document.getElementById('popup-feature-name').innerHTML = clickedFeatureName;
          document.getElementById('popup-feature-info').innerHTML = clickedFeatureCode;
          overlayLayer.setPosition(clickedCoordinate);
        }
      })
    });


    //////// To perform get info from WFS ---> developing ! -- BURAYA DEVAM ET  ///////

    this.map.on('click',  function(evt)  {

      var feature = this.map.forEachFeatureAtPixel(evt.pixel,  (feature, layer) => {
        return feature;
      });

      if (feature) {

        var coord = feature.getGeometry().getCoordinates();
        var props = feature.getProperties();
        console.log(props);

      }
    }
    )}




    // var polygonSelect = document.getElementById("polygon-type");


    /*var sourceForDrawnPolygon = new VectorSource({ wrapX: false });
    var vectorForDrawnPolygon = new VectorLayer({ source: sourceForDrawnPolygon });
    this.map.addLayer(vectorForDrawnPolygon);

    const drawPolygon = new olInteraction.Draw({
      type: 'Polygon' as GeometryType,
      source: sourceForDrawnPolygon
    });

    drawPolygon.on('drawend', function(evt) {
      let parser = new GeoJSON();
      let drawnFeatureObject = parser.writeFeaturesObject([evt.feature]);       /// as an object json
      let drawnFeature = parser.writeFeatures([evt.feature]);                 /// as an string json
      console.log(drawnFeature);
    });

    this.map.addInteraction(drawPolygon);*/

    /*
    var sourceForDrawnPolygon = new VectorSource({ wrapX: false });
    var vectorForDrawnPolygon = new VectorLayer({ source: sourceForDrawnPolygon });
    this.map.addLayer(vectorForDrawnPolygon);
    var drawPolygon; // for doing global, later it is removed !
      var value = "Polygon" as GeometryType
      drawPolygon = new olInteraction.Draw({
        source: sourceForDrawnPolygon,
        type: value
    })
    this.map.addInteraction(drawPolygon);
    */




  drawPolygonButton() {
    // var firstClicked = true;    // for testing
    var startDrawing = false;     // for testing

    var sourceForDrawnPolygon = new VectorSource({
      wrapX: false,
      format: new GeoJSON({
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      })
    });

    var vectorForDrawnPolygon = new VectorLayer({ source: sourceForDrawnPolygon });

    this.map.addLayer(vectorForDrawnPolygon);

    var drawPolygon = new olInteraction.Draw({
      type: 'Polygon' as GeometryType,
      source: sourceForDrawnPolygon
    });

    drawPolygon.on('drawstart', (evt) => {
      startDrawing = true;    // for testing
      // console.log(startDrawing);
    });

    drawPolygon.on('drawend', (evt) => {
      startDrawing = false;   // for testing
      this.map.removeInteraction(drawPolygon);      /**** this is important due to finish drawing process ! ***/
    });

    this.map.addInteraction(drawPolygon);
    // drawPolygon.abortDrawing();      /// for testing

    /******* drawn the polygon is download after clicking it ! --- developing !!!!!! ******/
    this.map.on('click', (evt) => {
      this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        // console.log(feature.getGeometry());
        // console.log(feature.getProperties());
        var parser = new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857"
        });
        var selectedDrawnFeature = feature as Feature;
        var drawnFeatureJsonObject = parser.writeFeaturesObject([selectedDrawnFeature]);       /// as an object json
        var drawnFeatureJsonString = parser.writeFeatures([selectedDrawnFeature]);            /// as an string json
        console.log(drawnFeatureJsonString);

        var txtFile = "test.txt";
        var file = new File([""], txtFile, { type: "text/plain" });
        var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(drawnFeatureJsonString);
        var link = (<HTMLAnchorElement>document.getElementById('link')).href = dataUri;
      })
    });

  }


  drawPointButton() {
    var startDrawing = false;
    var sourceForDrawnPoint = new VectorSource({ wrapX: false });
    var vectorForDrawnPoint = new VectorLayer({ source: sourceForDrawnPoint });
    this.map.addLayer(vectorForDrawnPoint);

    var drawPoint = new olInteraction.Draw({
      type: 'Point' as GeometryType,
      source: sourceForDrawnPoint
    });

    drawPoint.on('drawstart', (evt) => {
      startDrawing = true;    // for testing
      console.log(startDrawing);
    });

    drawPoint.on('drawend', (evt) => {
      var parser = new GeoJSON();
      var drawnFeatureObject = parser.writeFeaturesObject([evt.feature]);       /// as an object json
      var drawnFeature = parser.writeFeatures([evt.feature]);                 /// as an string json
      //console.log(drawnFeature);
      startDrawing = false;   // for testing
      this.map.removeInteraction(drawPoint);      /**** this is important due to finish drawing process ! ***/
    });

    this.map.addInteraction(drawPoint);
  }

  drawLineButton() {
    var startDrawing = false;
    var sourceForDrawnLine = new VectorSource({ wrapX: false });
    var vectorForDrawnLine = new VectorLayer({ source: sourceForDrawnLine });
    this.map.addLayer(vectorForDrawnLine);

    var drawLine = new olInteraction.Draw({
      type: 'LineString' as GeometryType,
      source: sourceForDrawnLine
    });

    drawLine.on('drawstart', (evt) => {
      console.log(startDrawing);
    });

    drawLine.on('drawend', (evt) => {
      var parser = new GeoJSON();
      var drawnFeatureObject = parser.writeFeaturesObject([evt.feature]);       /// as an object json
      var drawnFeature = parser.writeFeatures([evt.feature]);                 /// as an string json
      //console.log(drawnFeature);
      this.map.removeInteraction(drawLine);      /**** this is important due to finish drawing process ! ***/
    });

    this.map.addInteraction(drawLine);
  }

}


