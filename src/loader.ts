import {StationStatsItem, getStats} from "./ws";
import {db} from "./db";

export function plusHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours*60*60*1000);
}

export function truncateToDate(date: Date) {
  const truncated = new Date(date);
  truncated.setHours(0, 0, 0, 0);
  return truncated;
}

export function yesterday(): Date {
  return plusHours(new Date(), -24);
}

export class Loader {

  private dates: Date[] = [];
  private sinceTimestamp?: number;
  private tillTimestamp?: number;

  static async loadDays(since: Date, till: Date) {
    const loader = new Loader();
    loader.dates = Loader.getAllDates(since,till);
    loader.sinceTimestamp = since.getTime();
    loader.tillTimestamp = till.getTime();
    await loader.load();
  }

  static async loadYesterday() {
    const _yesterday = yesterday();
    const loader = new Loader();
    loader.dates = [_yesterday];
    await loader.load();
  }

  static async loadLastHours(hours: number) {
    const now = new Date();
    const loader = new Loader();
    loader.dates = [now];
    loader.sinceTimestamp = now.getTime() - hours*60*60*1000;
    await loader.load();
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
    console.log(`Loading data of ${date}.`);
    const stats = await getStats(date);
    for(const item of
      this.getRequested(stats)
    ) {
      await db.load(item);
    }
  }

  private getRequested(items: StationStatsItem[]) {
    return items.filter(i => this.isRequested(i));
  }

  private isRequested(item: StationStatsItem): boolean {
    if (this.sinceTimestamp && this.sinceTimestamp > item.timestamp) {
      return false;
    }
    if (this.tillTimestamp && this.tillTimestamp < item.timestamp) {
      return false;
    }
    return true;
  }
}