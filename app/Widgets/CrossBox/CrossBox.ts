import QueueLength from "app/Widgets/CrossBox/QueueLength";

export default class CrossBox {
  private static instance: CrossBox;

  private queueLength: QueueLength;

  constructor() {
    this.queueLength = QueueLength.getInstance();
  }

  public setQueueLength(queueDatas: Array<QueueData>) {
    const queueLength: QueueLength = QueueLength.getInstance();
    queueLength.setQueueLength(queueDatas);
  }

  static getInstance(): CrossBox {
    if (!this.instance) {
      this.instance = new CrossBox();
    }

    return this.instance;
  }

}