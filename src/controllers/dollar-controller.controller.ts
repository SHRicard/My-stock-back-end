import {get} from '@loopback/rest';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class DollarController {
  @get('/dollar-blue')
  async getDollarBlue(): Promise<object> {
    try {
      const {data} = await axios.get('https://dolarhoy.com/');

      const $ = cheerio.load(data);
      const compraBlue = $('.compra .val').first().text().trim();
      const ventaBlue = $('.venta .val').first().text().trim();

      return {
        success: true,
        blue: {
          compra: compraBlue,
          venta: ventaBlue,
        },
      };
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      return {success: false, message: 'Error al obtener los datos'};
    }
  }
}
