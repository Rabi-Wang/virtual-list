import React from 'react'
import faker from 'faker'
import VirtualList from './virtualList'

function getDataList() {
  let dataList = []
  for (let i = 0; i < 1000; i++) {
    dataList.push({
      id: i,
      value: faker.lorem.sentences(),
    })
  }
  return dataList
}

function App() {
  return (
    <VirtualList dataList={getDataList()}></VirtualList>
  );
}

export default App;
