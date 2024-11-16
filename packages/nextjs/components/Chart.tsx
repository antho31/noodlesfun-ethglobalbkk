"use client";

import React, { useEffect, useRef } from "react";
import { ColorType, IChartApi, createChart } from "lightweight-charts";

export const ChartComponent = (props: any) => {
  const chartContainerRef = useRef<HTMLDivElement>();
  const chart = useRef<IChartApi>();
  const resizeObserver = useRef<ResizeObserver>();

  const { data } = props;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#2b2933",
        },
        textColor: "#C3BCDB",
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: "#444" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });
    chart.current.timeScale().fitContent();

    const newSeries = chart.current.addAreaSeries({
      lineColor: "rgb(34, 197, 94)",
      topColor: "rgba(34, 197, 94, 0.4)",
      bottomColor: "rgba(34, 197, 94, 0)",
    });
    newSeries.setData(data);

    return () => {
      chart.current?.remove();
    };
  }, [data]);

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.current?.applyOptions({ width, height });
      setTimeout(() => {
        chart.current?.timeScale().fitContent();
      }, 0);
    });

    resizeObserver.current.observe(chartContainerRef.current!);

    return () => resizeObserver.current?.disconnect();
  }, []);

  // @ts-expect-error skip
  return <div ref={chartContainerRef} className="w-full h-full rounded-lg" />;
};
