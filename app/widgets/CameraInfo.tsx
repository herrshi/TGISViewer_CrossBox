/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import watchUtils = require("esri/core/watchUtils");

import { renderable, tsx } from "esri/widgets/support/widget";

import Point = require("esri/geometry/Point");
import SceneView = require("esri/views/SceneView");

import webMercatorUtils = require("esri/geometry/support/webMercatorUtils");



interface Center {
  heading: number;
  tilt: number;
  position: Point;
}

interface State extends Center {
  interacting: boolean;
}

interface Style {
  textShadow: string;
}

const CSS = {
  base: "camera-info-tool"
};

@subclass("esri.widgets.CameraInfo")
class CameraInfo extends declared(Widget) {
  constructor(options: any) {
    super();
    this._onViewChange = this._onViewChange.bind(this);
  }

  postInitialize() {
    watchUtils.init(this, "view.interacting, view.camera", () =>
      this._onViewChange()
    );
  }
  //property
  @property()
  @renderable()
  view: SceneView;

  @property()
  @renderable()
  state: State;

  //public method
  render() {
    let { heading, tilt, position } = this.state;
    const styles: Style = {
      textShadow: this.state.interacting
        ? "-1px 0 red, 0 1px red, 1px 0 red, 0 -1px red"
        : ""
    };
    if (this.view.spatialReference.isWebMercator) {
      position = new Point(webMercatorUtils.webMercatorToGeographic(position));
    }
    return (
      <div bind={this} class={CSS.base} style={styles}>
        <p>heading: {Number(heading).toFixed(3)}</p>
        <p>tilt: {Number(tilt).toFixed(3)}</p>
        <p>x: {Number(position.x).toFixed(6)}</p>
        <p>y: {Number(position.y).toFixed(6)}</p>
        <p>z: {Number(position.z).toFixed(6)}</p>
      </div>
    );
  }

  //private method
  private _onViewChange() {
    let {interacting, camera} = this.view;
    this.state = {
      heading: camera.heading,
      tilt: camera.tilt,
      position: camera.position,
      interacting: interacting
    };
  }
}

export = CameraInfo;
