const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // 이전과 같이 키를 넣어주세요.

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findStore(data) {
  try {
    const { data: storeData, error } = await supabase
      .from('lotto_stores')
      .select('id')
      .eq('store_name', data.store_name)
      .eq('address', data.address)
      .limit(1);

    if (error) throw new Error(`Error fetching store: ${error.message}`);

    return storeData && storeData[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function insertStore(data) {
  try {
    // GPS 좌표를 배열로 변환
    const [lat, lon] = data.gps.replace(/[()]/g, '').split(', ').map(Number);

    // POINT geometry 생성
    const pointGeom = `POINT(${lon} ${lat})`;
    console.log({ pointGeom });

    const { data: insertedStore, error } = await supabase
      .from('lotto_stores')
      .insert({
        store_name: data.store_name,
        address: data.address,
        gps: pointGeom,
      })
      .select();

    if (error) throw new Error(`Error inserting store: ${error.message}`);

    console.log({ insertedStore });
    return insertedStore[0].id;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function insertWinner(data, storeId) {
  try {
    const { error } = await supabase.from('lotto_winners').insert([
      {
        round: data.round,
        store_id: storeId,
        lotto_type: data.type,
      },
    ]);

    if (error) throw new Error(`Error inserting winner: ${error.message}`);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function insertStoreAndWinner(data) {
  try {
    const store = await findStore(data);
    let storeId;
    if (!store) {
      storeId = await insertStore(data);
    } else {
      storeId = store.id;
    }
    await insertWinner(data, storeId);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// 예제 데이터로 함수 호출
const data = {
  round: 1087,
  store_name: '골드리치',
  address: '서울 강남구 자곡로 192 1층 102호(강남푸르지오시티 2차)',
  gps: '37.1234, 127.1234',
  type: 'auto',
};

insertStoreAndWinner(data).catch(console.error);
