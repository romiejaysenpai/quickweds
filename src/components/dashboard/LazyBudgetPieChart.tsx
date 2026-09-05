'use client';

import { useEffect, useRef, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';

type BudgetPieDatum = {
    name: string;
    value: number;
};

type LazyBudgetPieChartProps = {
    data: BudgetPieDatum[];
    colors: string[];
    currencySymbol: string;
    innerRadius?: number;
    outerRadius?: number;
    paddingAngle?: number;
    tooltipRadius?: number;
};

export default function LazyBudgetPieChart({
    data,
    colors,
    currencySymbol,
    innerRadius = 50,
    outerRadius = 70,
    paddingAngle = 8,
    tooltipRadius = 16,
}: LazyBudgetPieChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartSize, setChartSize] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const updateSize = () => {
            const { width, height } = element.getBoundingClientRect();
            const nextWidth = Math.floor(width);
            const nextHeight = Math.floor(height);
            setChartSize(nextWidth > 0 && nextHeight > 0 ? { width: nextWidth, height: nextHeight } : null);
        };

        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="h-full min-h-[1px] w-full min-w-[1px]">
            {chartSize && (
                    <PieChart width={chartSize.width} height={chartSize.height}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={paddingAngle}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} className="outline-none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: `${tooltipRadius}px`,
                                border: 'none',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: unknown) => [
                                `${currencySymbol}${Number(value || 0).toLocaleString()}`,
                                'Amount',
                            ]}
                        />
                    </PieChart>
            )}
        </div>
    );
}
