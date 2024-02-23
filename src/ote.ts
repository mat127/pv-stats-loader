import axios, {AxiosResponse} from "axios";
import {LoaderPlugin} from "./loader";
import {getDateString} from "./date";
import {db} from "./db";

const dayAheadMarketUrl = 'https://www.ote-cr.cz/en/short-term-markets/electricity/day-ahead-market/@@chart-data';

interface IntraDayMarketData {
  data: {
    dataLine: DataSerie[]
  }
}

interface DataSerie {
  title: string
  point: {
    x: string,
    y: number
  }[]
}

export class IntraDayMarketItem {

  date: Date;
  price: number;
  volume: number;

  constructor(date: Date, price: number, volume: number) {
    this.date = date;
    this.price = price;
    this.volume = volume;
  }

  static create(date: Date, hour: number, price: number, volume: number): IntraDayMarketItem {
    const hourDate = new Date(date);
    hourDate.setHours(hour, 0, 0, 0);
    return new IntraDayMarketItem(hourDate, price, volume);
  }

  getTime() {
    return this.date.getTime();
  }
}

export class IntraDayMarketLoader implements LoaderPlugin<IntraDayMarketItem> {

  public async load(date: Date): Promise<IntraDayMarketItem[]> {
    const response:AxiosResponse<IntraDayMarketData,any> = await axios.get(dayAheadMarketUrl,
      {
        params: {
          report_date: getDateString(date)
        }
      }
    );
    const itemFactory = new IntraDayMarketItemFactory(response.data);
    return itemFactory.createAllItems(date);
  }

  getTimeOf(item: IntraDayMarketItem): number {
    return item.getTime();
  }

  async save(item: IntraDayMarketItem) {
    const query = {
      text: `INSERT INTO ote(ts, price, amount)
                     VALUES($1, $2, $3)
                     ON CONFLICT (ts) DO UPDATE SET price=excluded.price, amount=excluded.amount`,
      values: [
        item.date,
        Math.round(item.price*100),
        Math.round(item.volume*100),
      ],
    };
    await db.pool.query(query);
  }
}

class IntraDayMarketItemFactory {

  private prices: Map<number,number>;
  private volumes: Map<number,number>;

  constructor(data: IntraDayMarketData) {
    this.prices = this.getSeriePoints(data, 'Price (EUR/MWh)');
    this.volumes = this.getSeriePoints(data, 'Volume (MWh)');
  }

  private getSeriePoints(data: IntraDayMarketData, title: string): Map<number,number> {
    const serie= data.data.dataLine.find(
      dl => dl.title === title
    );
    if (serie === undefined) {
      return new Map<number, number>();
    }
    return serie.point.reduce(
      (items, p) => items.set(parseInt(p.x)-1, p.y),
      new Map<number,number>()
    );
  }

  createAllItems(date: Date): IntraDayMarketItem[] {
    if (this.prices.size === 0) {
      console.log('no average prices found in the market data');
    }
    if (this.volumes.size === 0) {
      console.log('no volumes found in the market data');
    }
    return Array.from(this.prices.keys()).map(
      hour => this.createItem(date, hour)
    );
  }

  private createItem(date: Date, hour: number): IntraDayMarketItem {
    const price = this.prices.get(hour) ?? 0;
    const volume = this.volumes.get(hour) ?? 0;
    return IntraDayMarketItem.create(date, hour, price, volume);
  }
}