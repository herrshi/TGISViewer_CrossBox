import QueueLength from "app/Widgets/CrossBox/QueueLength";
import ShiftStage from "app/Widgets/CrossBox/ShiftStage";
import SignalLamp from "app/Widgets/CrossBox/SignalLamp";

export default class CrossBox {
  // private queueLength: QueueLength;
  // private shiftStage: ShiftStage;

  constructor() {
    // this.queueLength = QueueLength.getInstance();
    // this.shiftStage = ShiftStage.getInstance();
  }

  public static async setQueueLength(queueDatas: Array<QueueData>) {
    const queueLength: QueueLength = QueueLength.getInstance();
    await queueLength.setQueueLength(queueDatas);
  }

  public static async shiftStage(crossId: string, stage: string) {
    const shiftStage: ShiftStage = ShiftStage.getInstance();
    await shiftStage.shiftStage(crossId, stage);
  }

  public static async showSignalLamps() {
    const signalLamp: SignalLamp = SignalLamp.getInstance();
    await signalLamp.showSignalLamps();
  }

}