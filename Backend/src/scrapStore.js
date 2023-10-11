import axios from 'axios';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';

const URL =
  'https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645';
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
};

const fetchHtml = async (url) => {
  const response = await axios.get(url, {
    headers,
    responseType: 'arraybuffer',
  });
  const htmlContent = iconv.decode(response.data, 'euc-kr');
  return htmlContent;
};

const parseHtml = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const firstPlaceTable = $('.group_content:first .tbl_data.tbl_data_col');
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

  return winningStores;
};

const fetchData = async () => {
  try {
    const htmlContent = await fetchHtml(URL);
    const winningStores = parseHtml(htmlContent);
    winningStores.forEach((store) => {
      console.log(store);
    });
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    throw error;
  }
};

fetchData();
