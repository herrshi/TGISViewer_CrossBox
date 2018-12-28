import EsriMap = require("esri/Map");
import Basemap = require("esri/Basemap");
import SceneView = require("esri/views/SceneView");
import Layer = require("esri/layers/Layer");
import TileLayer = require("esri/layers/TileLayer");
import MapImageLayer = require("esri/layers/MapImageLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Home = require("esri/widgets/Home");

import CameraInfo = require("app/Widgets/CameraInfo/CameraInfo");
import Graphic = __esri.Graphic;

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
            baseLayerConfig.url = baseLayerConfig.url.replace(/{gisServer}/i, appConfig.map.gisServer);
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
        optLayerConfig.url = optLayerConfig.url.replace(/{gisServer}/i, appConfig.map.gisServer);

        switch (optLayerConfig.type) {
          case "map-image":
            //创建图层的参数中不能含有type
            delete optLayerConfig.type;
            layer = new MapImageLayer(optLayerConfig);
            break;

          case "feature":
            delete optLayerConfig.type;
            layer = new FeatureLayer(optLayerConfig);
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
      // ui.remove("attribution");
      // ui.remove("navigation-toggle");
      //
      // const homeWidget: Home = new Home({
      //   view: view
      // });
      //
      // const cameraInfoWidget: CameraInfo = new CameraInfo({
      //   view: view
      // });
      //
      // ui.add([
      //   {
      //     component: homeWidget,
      //     position: "top-left",
      //     index: 1
      //   },
      //   {
      //     component: cameraInfoWidget,
      //     position: "top-right",
      //     index: 0
      //   }
      // ]);

      //不显示UI
      ui.empty("top-left");

      //点击事件
      view.on("click", async event => {
        const response = await view.hitTest(event);
        const result = response.results[0];
        if (result) {
          const graphic = result.graphic;
          showGisDeviceInfo(graphic.attributes.FEATURETYPE, graphic.attributes.FEATUREID);
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
