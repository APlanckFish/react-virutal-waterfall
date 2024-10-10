import { useState, useRef, useEffect, memo, useCallback } from "react";
import "./App.css";
import VirtualWaterfall from "./VirtualWaterfall";
import MockCard, { randomColor } from "./MockCard";

import { faker } from "@faker-js/faker";

function App() {
  const [list, setList] = useState<string[]>([]);
  const [showLoader, setShowLoader] = useState(false);
  const [colors, setColors] = useState<any>({});
  const listRef = useRef<any>();

  const heightsRef = useRef(new Array(100));
  // 预估高度
  const estimatedItemHeight = 200;

  const getHeight = (index: number) => {
    return heightsRef.current[index] ?? estimatedItemHeight;
  };

  const setHeight = (index: number, height: number | undefined) => {
    if (heightsRef.current[index] !== height) {
      heightsRef.current[index] = height;
      // 让 VariableSizeList 组件更新高度
      listRef.current?.resetHeight();
    }
  };

  const fetchNewList: () => Promise<string[]> = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newList = new Array(32)
          .fill(0)
          .map(() => faker.lorem.paragraph());
        resolve(newList);
      }, 1000);
    });
  };

  const Item = memo(({ index, data }: { index: number; data: any }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      setHeight(index, itemRef.current?.getBoundingClientRect().height);
    }, [setHeight, index]);

    return (
      <div ref={itemRef} style={{ background: colors[index] }}>
        {data}
      </div>
    );
  });

  const memoItem = useCallback(
    (index: number, data: any) => {
      return <Item index={index} data={data} />;
    },
    [Item]
  );

  useEffect(() => {
    fetchNewList().then((list) => {
      setList(list);
    });
  }, []);

  useEffect(() => {
    const newColors: any = {};
    list.forEach((_, index) => {
      if (!colors[index]) {
        newColors[index] = randomColor();
      }
    });
    setColors({ ...newColors, ...colors });
  }, [list.length]);

  /** 若传入骨架图，高度需与estimatedItemHeight高度一致 */
  const skeleton = (
    <MockCard background="gray" title="" backgroundHeight={200} />
  );

  return (
    <>
      <VirtualWaterfall
        ref={(ref) => {
          listRef.current = ref;
        }}
        renderItem={memoItem}
        dataSource={list}
        getItemHeight={getHeight}
        containerHeight={window.innerHeight}
        columnGap={22}
        columnCount={2}
        next={() => {
          setShowLoader(true);
          fetchNewList().then((newList) => {
            setList([...list, ...newList]);
            setShowLoader(false);
          });
        }}
        scrollThreshold={1}
        loader={<div>loading...</div>}
        endMessage={<div>list end</div>}
        end={false}
        skeleton={skeleton}
        averageItemHeight={estimatedItemHeight}
        skeletonCount={16}
        rowGap={20}
        showLoader={showLoader}
        // onScroll={() => {}}
        paddingCount={0}
        onItemRendered={(index) => {
          console.log("index show", index);
        }}
        onItemDispeared={(index, duration) => {
          console.log("index dispeared", index, duration, "ms");
        }}
        appearOnce={true}
      ></VirtualWaterfall>
    </>
  );
}

export default App;
