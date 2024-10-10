import React from "react";
import "./MockCard.css";

export interface MockCardProps {
  background: string;
  backgroundHeight?: number;
  title: string;
  style?: React.CSSProperties;
}

export default function MockCard(props: MockCardProps) {
  const { background, backgroundHeight = 200, title, style } = props;
  return (
    <div className="card" style={style}>
      <div style={{ background, height: backgroundHeight }} />
      <div className="title">{title}</div>
    </div>
  );
}

export const randomColor = () => {
  return (
    "#" + ("00000" + ((Math.random() * 0x1000000) << 0).toString(16)).slice(-6)
  );
};

export const getRandomMockCard = (index?: number) => {
  const randomString = (e?: number) => {
    //形参e,需要产生随机字符串的长度
    //如果没有传参，默认生成32位长度随机字符串
    e = e || 32;
    //模拟随机字符串库
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
      a = t.length, //字符串t的长度，随机数生成最大值
      n = "";
    for (let i = 0; i < e; i++) {
      //随机生成长度为e的随机字符串拼接
      n += t.charAt(Math.floor(Math.random() * a));
    }
    //返回随机组合字符串
    return index + " " + n;
  };

  return (
    <MockCard
      background={randomColor()}
      backgroundHeight={Math.floor(Math.random() * 100) + 200}
      title={randomString(Math.floor(Math.random() * 40))}
    />
  );
};
