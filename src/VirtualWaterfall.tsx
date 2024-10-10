import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useMemo,
  useRef,
} from "react";
import { VirtualWaterFallProps } from "types";

interface Offsets {
  offsetsColumnNum: number;
  listTotalHeight: number;
  list: {
    [index: number]: number; //该元素的偏移量
  };
}

interface ListItemRef {
  [index: number]: {
    io: IntersectionObserver | null;
    browseTime: number;
    leaveTime: number;
    hasBrowse: boolean;
  };
}

const VariableSizeList = forwardRef<{}, VirtualWaterFallProps>((props, ref) => {
  const {
    renderItem: Item,
    dataSource,
    containerHeight = window.innerHeight,
    getItemHeight,
    columnCount = 2,
    columnGap = 0,
    rowGap = 0,
    next,
    scrollThreshold = 1,
    loader,
    end,
    endMessage,
    skeleton,
    skeletonCount = 8,
    averageItemHeight = 40,
    showLoader,
    paddingCount = 0,
    onItemRendered,
    onItemDispeared,
    appearOnce = true,
    className,
    style,
  } = props;

  const [scrollTop, setScrollTop] = useState(0); // 滚动高度
  const [scrollStartIdx, setScrollStartIdx] = useState(0); // 滚动开始的索引
  const [scrollEndIdx, setScrollEndIdx] = useState(dataSource.length); // 滚动结束的索引
  const [itemHeightReseted, setItemHeightReseted] = useState(false); // 是否取到了item的真实高度

  /** 存储每列的高度 */
  const columnHeightList = new Array(columnCount).fill(0);
  /** 是否触发过next勾子 */
  const updateFlag = useRef(false);
  const listItemRef = useRef<ListItemRef>();
  const containerRef = useRef<HTMLDivElement>(null);
  /** 容器宽度 */
  const clientWidhth = containerRef?.current?.clientWidth || window.innerWidth;

  const defaultOffsets = Array(columnCount)
    .fill(0)
    .map((_, index) => {
      return {
        offsetsColumnNum: index,
        listTotalHeight: 0,
        list: [],
      };
    });

  const genOffsets = () => {
    const offsetsList: Offsets[] = Array(columnCount)
      .fill(0)
      .map((_, index) => {
        return {
          offsetsColumnNum: index,
          listTotalHeight: 0,
          list: [],
        };
      });

    for (let i = 0; i < dataSource.length; i++) {
      /** 获取高度最小的列 */
      const minHeight = Math.min(...columnHeightList);
      /** 高度最小列的index（第几列） */
      const minHeightColumn = columnHeightList.indexOf(minHeight);
      if (i < columnCount) {
        offsetsList[i].list = { [i]: 0 };
        offsetsList[i].listTotalHeight = 0;
        columnHeightList[i] = getItemHeight(i);
      } else {
        offsetsList[minHeightColumn].list = {
          ...offsetsList[minHeightColumn].list,
          [i]: minHeight + rowGap,
        };
        offsetsList[minHeightColumn].listTotalHeight =
          getItemHeight(i) + minHeight + rowGap;
        columnHeightList[minHeightColumn] =
          getItemHeight(i) + minHeight + rowGap;
      }
    }
    return offsetsList;
  };

  // 所有 items 的位置
  const [offsets, setOffsets] = useState<Offsets[]>(defaultOffsets);

  useEffect(() => {
    setOffsets(genOffsets());
  }, [dataSource]);

  const contentHeight = Math.max(
    ...Array(columnCount)
      .fill(0)
      .map((_, index) => {
        return offsets[index].listTotalHeight - containerHeight;
      })
  );

  useEffect(() => {
    const tempStartKey: number[] = [];
    const tempEndKey: number[] = [];
    offsets.forEach((offsets) => {
      Object.keys(offsets.list).some((key) => {
        if (offsets.list[Number(key)] > scrollTop) {
          tempStartKey.push(Number(key));
          return true;
        }
      });
    });
    setScrollStartIdx(Math.min(...tempStartKey) - columnCount);
    offsets.forEach((offsets) => {
      Object.keys(offsets.list).some((key) => {
        if (offsets.list[Number(key)] > scrollTop + containerHeight) {
          tempEndKey.push(Number(key));
          return true;
        }
      });
    });
    setScrollEndIdx(Math.min(...tempEndKey));
  }, [scrollTop, offsets]);

  const showStartIdx = useMemo(() => {
    return Math.max(scrollStartIdx - paddingCount, 0); // 处理越界情况
  }, [scrollStartIdx, dataSource]);

  const showEndIdx = useMemo(() => {
    return Math.min(scrollEndIdx + paddingCount, dataSource.length - 1);
  }, [scrollEndIdx, dataSource]);

  const loaderDom = () => {
    if (end) return null;
    return (
      <div
        style={{
          position: "absolute",
          top: contentHeight + containerHeight,
          justifyContent: "center",
          display: "flex",
          width: "100%",
        }}
      >
        {loader}
      </div>
    );
  };

  const endMessageDom = () => (
    <div
      style={{
        position: "absolute",
        top: contentHeight + containerHeight,
        justifyContent: "center",
        display: "flex",
        width: "100%",
      }}
    >
      {endMessage}
    </div>
  );

  useImperativeHandle(ref, () => ({
    resetHeight: () => {
      setOffsets(genOffsets());
      setItemHeightReseted(true);
    },
  }));

  useEffect(() => {
    updateFlag.current = false;
  }, [dataSource.length]);

  const sekeletonDom = Array(skeletonCount)
    .fill(0)
    .map((_, index) => {
      const cardWidth =
        (clientWidhth - columnGap * (columnCount - 1)) / columnCount; //每张卡片的宽度

      const columnIndex = index % columnCount;
      const row = Math.floor(index / columnCount);
      const nextTop = row * (averageItemHeight + rowGap) + "px";
      const nextLeft = columnIndex * cardWidth + columnIndex * columnGap + "px";
      return (
        <div
          className="waterfall-item"
          key={index}
          data-list-index={index}
          id={`waterfall-item-skeleton-${index}`}
          style={{
            width: cardWidth + "px",
            height: averageItemHeight,
            position: "absolute",
            top: nextTop,
            left: nextLeft,
          }}
        >
          {skeleton}
        </div>
      );
    });

  const CacheVirtualList = useMemo(() => {
    return dataSource
      .map((itemData, index) => {
        const minHeightColumn = offsets.filter((offset) => {
          if (offset.list[index] !== undefined) {
            return true;
          } else {
            return false;
          }
        })?.[0]?.offsetsColumnNum;
        if (minHeightColumn === undefined) return null;
        const cardWidth =
          (clientWidhth - columnGap * (columnCount - 1)) / columnCount; //每张卡片的宽度

        const nextTop = offsets[minHeightColumn].list[index] + "px";
        const nextLeft =
          minHeightColumn * cardWidth + minHeightColumn * columnGap + "px";
        return (
          <div
            className="waterfall-item"
            key={index}
            data-list-index={index}
            id={`waterfall-item-${index}`}
            style={{
              width: cardWidth + "px",
              height: getItemHeight(index),
              position: "absolute",
              top: nextTop,
              left: nextLeft,
            }}
            ref={(ref) => {
              if (!ref) return;
              if (!itemHeightReseted) return; //高度还在初始化的时候不要进行ref更新

              const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    if (listItemRef.current?.[index]) {
                      const {
                        io: lastIo,
                        browseTime,
                        leaveTime,
                      } = listItemRef.current?.[index];
                      if (browseTime && leaveTime === 0) {
                        // 由于虚拟滚动重新生成ref，重新触发曝光
                        lastIo?.disconnect();
                        // 销毁旧io，更新新io
                        listItemRef.current = {
                          ...listItemRef.current,
                          [index]: {
                            io: io,
                            browseTime,
                            leaveTime: 0,
                            hasBrowse: true,
                          },
                        };
                        return;
                      }
                      if (browseTime && leaveTime) {
                        if (appearOnce && lastIo === null) {
                          // io已忽略
                          return;
                        }
                      }
                    }

                    const browseTime = Date.now();
                    onItemRendered?.(index);
                    listItemRef.current = {
                      ...listItemRef.current,
                      [index]: {
                        io: io,
                        browseTime,
                        leaveTime: 0,
                        hasBrowse: true,
                      },
                    };
                  } else {
                    const browseTime =
                      listItemRef.current?.[index]?.browseTime || 0;
                    const lastLeaveTime =
                      listItemRef.current?.[index]?.leaveTime || 0;
                    const hasBrowse =
                      listItemRef.current?.[index]?.hasBrowse || false;
                    if (browseTime === 0) return;
                    if (browseTime && !lastLeaveTime) {
                      // 第一次离开
                      const leaveTime = Date.now();
                      onItemDispeared?.(index, leaveTime - browseTime);
                      if (appearOnce) {
                        io?.disconnect();
                      }
                      listItemRef.current = {
                        ...listItemRef.current,
                        [index]: {
                          io: appearOnce ? null : io,
                          browseTime,
                          leaveTime,
                          hasBrowse: false,
                        },
                      };
                      return;
                    }
                    if (browseTime && lastLeaveTime) {
                      // 多次离开
                      if (hasBrowse) {
                        const leaveTime = Date.now();
                        onItemDispeared?.(index, leaveTime - browseTime);
                        listItemRef.current = {
                          ...listItemRef.current,
                          [index]: {
                            io: appearOnce ? null : io,
                            browseTime,
                            leaveTime,
                            hasBrowse: false,
                          },
                        };
                      }
                    }
                  }
                });
              });
              io.observe(ref);
            }}
          >
            {Item(index, itemData)}
          </div>
        );
      })
      .splice(showStartIdx, showEndIdx - showStartIdx + 1);
  }, [
    dataSource,
    showStartIdx,
    showEndIdx,
    offsets,
    clientWidhth,
    columnGap,
    columnCount,
  ]);

  if (dataSource.length === 0) {
    if (!skeleton) return null;
    return (
      <div
        style={{
          height: containerHeight,
          overflow: "auto",
          position: "relative",
        }}
      >
        <div style={{ height: contentHeight }}>{sekeletonDom}</div>
      </div>
    );
  }

  const showList = JSON.stringify(offsets) !== JSON.stringify(defaultOffsets);

  return (
    <div
      style={{
        height: containerHeight,
        overflow: "auto",
        position: "relative",
        ...style,
      }}
      className={className}
      onScroll={(e: any) => {
        setScrollTop(e.target.scrollTop);
        if (!updateFlag.current) {
          if (
            e.target.scrollTop / Math.floor(contentHeight) >=
            scrollThreshold
          ) {
            next?.();
            updateFlag.current = true;
          }
        }
      }}
    >
      <div
        style={{ height: Math.floor(contentHeight), position: "relative" }}
        ref={containerRef}
      >
        {showList && CacheVirtualList}
        {showLoader && loaderDom()}
        {end && endMessageDom()}
      </div>
    </div>
  );
});

export default VariableSizeList;
