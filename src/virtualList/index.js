import React, {useRef, useState, useEffect} from 'react'
import styled from 'styled-components'
import PropsType from 'prop-types'

const InfiniteListContainer = styled.div`
  margin: 0 auto;
  height: 500px;
  width: 350px;
  overflow: auto;
  position: relative;
  .infinite-list-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
  }
  .infinite-list {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    text-align: center;
  }
  .infinite-list-item {
    padding: 10px;
    color: #555;
    box-sizing: border-box;
    border-bottom: 1px solid #999;
    text-align: left;
    width: 300px;
    > label {
      color: red;
      margin-right: 5px;
    }
  }
`

const VirtualList = (props) => {
  const {dataList, bufferSize = 1, estimatedItemSize = 100} = props
  const [startOffset, setStartOffset] = useState(0)
  const [visibleData, setVisibleData] = useState([])
  const [listHeight, setListHeight] = useState(dataList.length * estimatedItemSize)
  const [positions, setPositions] = useState([])
  const list = useRef(null)
  const items = useRef([])

  useEffect(() => {
    let newPositions = []
    dataList.forEach((data, index) => {
      newPositions.push({
        ...data,
        height: estimatedItemSize,
        top: index * estimatedItemSize,
        bottom: (index + 1) * estimatedItemSize,
      })
    })
    let endIndex = Math.ceil(list.current.clientHeight / estimatedItemSize)
    let data = dataList.slice(0, endIndex)
    updateListItem(0)
    setPositions(newPositions)
    setListHeight(newPositions[newPositions.length - 1].bottom)
    setVisibleData(data)
  }, [estimatedItemSize, dataList])

  const handleScroll = () => {
    let scrollTop = list.current.scrollTop
    let startIndex = getStartIndex(scrollTop)
    let endIndex = startIndex + visibleCount()
    let data = dataList.slice(startIndex - aboveCount(startIndex), endIndex + belowCount(endIndex))
    for(let i = startIndex; i <= data[data.length - 1].id; i++) {
      dataList[i] && updateListItem(dataList[i].id)
    }
    setStartOffset(computedStartOffset(startIndex))
    setVisibleData(data)
  }

  const updateListItem = (startIndex) => {
    let item = items.current[startIndex]
    if (item) {
      const index = +item.getAttribute('id')
      const rect = item.getBoundingClientRect()
      const height = rect.height
      const oldHeight = positions[index].height
      const dValue = oldHeight - height
      if (dValue && height) {
        item.style.height = height
        setPositions(prevState => {
          prevState[index].bottom = prevState[index].bottom - dValue
          prevState[index].height = height
          for (let i = index + 1; i < prevState.length; i++) {
            prevState[i].top = prevState[i - 1].bottom
            prevState[i].bottom = prevState[i].bottom - dValue
          }
          return prevState
        })
        setListHeight(positions[positions.length - 1].bottom)
      }
    }
  }

  const computedStartOffset = (start) => {
    if (start >= 1) {
      const size = positions[start].top - (positions[start - aboveCount(start)] ? positions[start - aboveCount(start)].top : 0)
      return positions[start - 1].bottom - size
    } else {
      return 0
    }
  }

  const getStartIndex = (scrollTop = 0) => {
    return binarySearch(scrollTop)
  }

  const binarySearch = (target) => {
    let start = 0
    let end = positions.length - 1
    let tmpIndex = null
    while (start <= end) {
      let midIndex = parseInt((start + end) / 2)
      let midValue = positions[midIndex].bottom
      if (midValue < target) {
        start = midIndex + 1
      } else if (midValue > target) {
        if (tmpIndex === null || tmpIndex > midIndex) {
          tmpIndex = midIndex
        }
        end = end - 1
      } else return midIndex + 1
    }
    return tmpIndex
  }

  const visibleCount = () => {
    return Math.ceil(list.current.clientHeight / estimatedItemSize)
  }

  const aboveCount = (start) => {
    return Math.min(start, bufferSize * visibleCount())
  }

  const belowCount = (end) => {
    return Math.min(dataList.length - end, bufferSize * visibleCount())
  }

  const setRef = (dom, id) => {
    if (dom && items.current.indexOf(dom) === -1) {
      items.current[id] = dom
    }
  }

  return (
    <InfiniteListContainer ref={list} onScroll={handleScroll}>
      <div className="infinite-list-phantom" style={{height: `${listHeight}px`}}></div>
      <div className="infinite-list" style={{transform: `translate3d(0, ${startOffset}px, 0)`}}>
        {
          visibleData?.map((item, index) => (
            <div
              id={item.id}
              ref={(_this) => setRef(_this, item.id)}
              key={item.id}
              className="infinite-list-item"
            ><label>{item.id}</label>{item.value}</div>
          ))
        }
      </div>
    </InfiniteListContainer>
  )
}

VirtualList.propsType = {
  dataList: PropsType.array,
  estimatedItemSize: PropsType.number,
}

export default VirtualList
