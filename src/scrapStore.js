import axios from 'axios';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';

const URL =
  'https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645';
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
};

async function fetchData() {
  try {
    const response = await axios.get(URL, {
      headers,
      // Make sure to retrieve the response as an array buffer
      responseType: 'arraybuffer',
    });
    // Decode the response using iconv-lite
    const htmlContent = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(htmlContent);

    // 1등 배출점의 테이블 항목 선택
    const firstPlaceTable = $('.group_content .tbl_data.tbl_data_col');
    const rows = firstPlaceTable.find('tbody tr');

    const winningStores = [];

    rows.each((index, row) => {
      const number = $(row).find('td:nth-child(1)').text().trim();
      const storeName = $(row).find('td:nth-child(2)').text().trim();
      const selectionType = $(row).find('td:nth-child(3)').text().trim();
      const location = $(row).find('td:nth-child(4)').text().trim();

      winningStores.push({
        number: number,
        store_name: storeName,
        selection_type: selectionType,
        location: location,
      });
    });

    winningStores.forEach((store) => {
      console.log(store);
    });
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
}

fetchData();
