import EsriMap = require("esri/Map");
import Basemap = require("esri/Basemap");
import SceneView = require("esri/views/SceneView");
import Layer = require("esri/layers/Layer");
import TileLayer = require("esri/layers/TileLayer");
import MapImageLayer = require("esri/layers/MapImageLayer");
import Home = require("esri/widgets/Home");

import CameraInfo = require("app/Widgets/CameraInfo/CameraInfo");

export default class MapManager {
  private static instance: MapManager;

  private appConfig: any;
  private containerDiv: string;

  public map: EsriMap;

  public async showMap(appConfig: any, div: string) {
    console.time("Load Map");

    this.appConfig = appConfig;
    this.containerDiv = div;
    //读取底图
    const baseLayers: Array<Layer> = appConfig.map.basemaps.map(
      (baseLayerConfig: any) => {
        let layer: Layer;
        switch (baseLayerConfig.type) {
          case "tile":
            //创建图层的参数中不能含有type
            delete baseLayerConfig.type;
            layer = new TileLayer(baseLayerConfig);
            break;
        }
        return layer;
      }
    );

    //读取业务图层
    const optLayers: Array<Layer> = appConfig.map.operationallayers.map(
      (optLayerConfig: any) => {
        let layer: Layer;
        switch (optLayerConfig.type) {
          case "map-image":
            //创建图层的参数中不能含有type
            delete optLayerConfig.type;
            layer = new MapImageLayer(optLayerConfig);
            break;
        }
        return layer;
      }
    );

    const basemap: Basemap = new Basemap({
      baseLayers: baseLayers
    });
    this.map = new EsriMap({
      basemap: basemap,
      layers: optLayers
    });
    const view: SceneView = new SceneView({
      container: this.containerDiv,
      map: this.map,
      viewingMode: "local",
      camera: this.appConfig.map.camera
    });

    return await view.when(function() {
      const ui = view.ui;
      //UI
      ui.remove("attribution");
      ui.remove("navigation-toggle");

      const homeWidget: Home = new Home({
        view: view
      });

      const cameraInfoWidget: CameraInfo = new CameraInfo({
        view: view
      });

      ui.add([
        {
          component: homeWidget,
          position: "top-left",
          index: 1
        },
        {
          component: cameraInfoWidget,
          position: "top-right",
          index: 0
        }
      ]);

      view.watch("heightBreakpoint, widthBreakpoint", function() {
        if (
          view.heightBreakpoint === "xsmall" ||
          view.widthBreakpoint === "xsmall"
        ) {
          ui.components = [];
          ui.remove(homeWidget);
          ui.remove(cameraInfoWidget);
        } else {
          ui.components = ["zoom", "compass"];
          ui.add([
            {
              component: homeWidget,
              position: "top-left",
              index: 1
            },
            {
              component: cameraInfoWidget,
              position: "top-right",
              index: 0
            }
          ]);
        }
      });

      console.timeEnd("Load Map");
    });
  }

  static getInstance(): MapManager {
    if (!this.instance) {
      this.instance = new MapManager();
    }
    return this.instance;
  }
}
