import React, { ReactNode } from "react";

type ListProps<T = any> = {
  onScroll?: ((e: any) => any) | undefined;

  /** 需要渲染的Item数据
   * @param index 当前索引
   * @param data 当前list对应index数据
   * @returns 渲染的元素ReactNode
   */
  renderItem: (index: number, data: any) => ReactNode;

  /** 总数据列表 */
  dataSource: T[];

  /** 瀑布流有几列 */
  columnCount: number;

  /** 列间隙 */
  columnGap?: number;

  /** 行间隙 */
  rowGap?: number;

  /** 触发next勾子滚动比例 */
  scrollThreshold?: number;

  /** 滑动到底函数 */
  next?: () => void;

  /** 预估卡片高度 */
  averageItemHeight?: number;

  /** 容器高度，建议设置为视窗高度 */
  containerHeight: number;

  /** 获取item元素实际高度的方法，请传入真实元素DOM高度 */
  getItemHeight: (index: number) => number;

  /** 是否已结束 */
  end?: boolean;

  /** 加载图标 */
  loader?: React.ReactNode;

  /** 加载完成 */
  endMessage?: React.ReactNode;

  /** 自定义骨架 */
  skeleton?: React.ReactNode;

  /** 显示的骨架图数量 */
  skeletonCount?: number;

  /** 是否显示加载元素 */
  showLoader?: boolean;

  /** 缓冲元素的偏移量 */
  paddingCount?: number;
};

export interface VirtualWaterFallProps<T = any> extends ListProps<T> {
  /** 元素曝光 */
  onItemRendered?: (index: number) => void;

  /** 元素离开 */
  onItemDispeared?: (index: number, duration: number) => void;

  /** 元素是否只曝光一次 */
  appearOnce?: boolean;

  /**支持传入自定义样式 */
  className?: string;

  style?: React.CSSProperties;
}

declare const VirtualWaterfall: React.FC<VirtualWaterFallProps>;

export default VirtualWaterfall;
