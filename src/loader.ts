import {plusHours, truncateToDate, yesterday} from "./date";

export interface LoaderPlugin<Item> {
  load(date: Date): Promise<Item[]>
  getTimeOf(item: Item): number
  save(item: Item): Promise<void>
}

export class Loader {

  private plugins: LoaderPlugin<any>[] = [];

  private dates: Date[] = [];
  private sinceTimestamp?: number;
  private tillTimestamp?: number;

  static withPlugins(...plugins: LoaderPlugin<any>[]): Loader {
    const loader = new Loader();
    loader.plugins = [...plugins];
    return loader;
  }

  async loadDays(since: Date, till: Date) {
    this.dates = Loader.getAllDates(since,till);
    this.sinceTimestamp = since.getTime();
    this.tillTimestamp = till.getTime();
    await this.load();
  }

  async loadYesterday() {
    const _yesterday = yesterday();
    this.dates = [_yesterday];
    await this.load();
  }

  async loadLastHours(hours: number) {
    const now = new Date();
    this.dates = [now];
    this.sinceTimestamp = now.getTime() - hours*60*60*1000;
    await this.load();
  }

  static getAllDates(since: Date, till: Date): Date[] {
    const dates = [];
    let date = truncateToDate(since);
    while(date < till) {
      dates.push(date);
      date = plusHours(date, 24);
    }
    return dates;
  }

  private async load() {
    for(const date of this.dates) {
      await this.loadDate(date);
    }
  }

  private async loadDate(date: Date) {
    return Promise.all(
      this.plugins.map(p => this.loadDateWith(date, p))
    );
  }

  private async loadDateWith(date: Date, plugin: LoaderPlugin<any>) {
    console.log(`Loading ${plugin.constructor.name} data of ${date}.`);
    const items = await plugin.load(date);
    for(const item of
      this.getRequested(items, plugin)
    ) {
      await plugin.save(item);
    }
  }

  private getRequested(items: any[], plugin: LoaderPlugin<any>) {
    return items.map(i => { return {item: i, ts: plugin.getTimeOf(i)}})
      .filter(tuple => this.isRequested(tuple.ts))
      .map(tuple => tuple.item);
  }

  private isRequested(timestamp: number): boolean {
    if (this.sinceTimestamp && this.sinceTimestamp > timestamp) {
      return false;
    }
    if (this.tillTimestamp && this.tillTimestamp < timestamp) {
      return false;
    }
    return true;
  }
}