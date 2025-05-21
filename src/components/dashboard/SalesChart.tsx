
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, LineChart } from "recharts";
import { SalesData } from "@/types";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

interface SalesChartProps {
  data: SalesData[];
  title?: string;
  chartType?: "line" | "bar";
  valueField?: "sales" | "inspectionValue";
  countField?: "inspections" | "salesCount";
}

const SalesChart: React.FC<SalesChartProps> = ({ 
  data, 
  title = "Vendas e Inspeções",
  chartType = "line",
  valueField = "sales",
  countField = "inspections"
}) => {
  // Check if data is empty or only has empty entries
  const hasData = data.length > 0 && data.some(item => 
    (valueField === "sales" ? item.sales > 0 : (item.inspectionValue || 0) > 0) || 
    (countField === "inspections" ? item.inspections > 0 : (item.salesCount || 0) > 0)
  );

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Sem dados disponíveis para o período selecionado
      </div>
    );
  }

  // Create a config object for our chart
  const chartConfig = {
    value: {
      label: valueField === "sales" ? "Vendas (€)" : "Valor das Inspeções (€)",
      color: "#1A1F2C"
    },
    count: {
      label: countField === "inspections" ? "Número de Inspeções" : "Número de Vendas",
      color: "#F97316"
    }
  };

  // Format tooltip values
  const formatTooltipValue = (value: number, name: string) => {
    if (name === "value") {
      return [`${value.toFixed(2)}€`, valueField === "sales" ? "Vendas" : "Valor das Inspeções"];
    }
    return [value.toString(), countField === "inspections" ? "Inspeções" : "Vendas"];
  };

  // Transform data for the chart
  const transformedData = data.map(item => ({
    month: item.month,
    value: valueField === "sales" ? item.sales : (item.inspectionValue || 0),
    count: countField === "inspections" ? item.inspections : (item.salesCount || 0)
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[350px]">
      {chartType === "line" ? (
        <LineChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#888888"
            fontSize={12}
            tickFormatter={(value) => `${value}`}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#888888"
            fontSize={12}
            tickFormatter={(value) => `${value}€`}
            tickLine={false}
          />
          <ChartTooltip 
            content={
              <ChartTooltipContent 
                formatter={(value, name) => formatTooltipValue(value as number, name as string)}
              />
            }
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="count"
            name={chartConfig.count.label}
            stroke="var(--color-count)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="value"
            name={chartConfig.value.label}
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      ) : (
        <BarChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#888888"
            fontSize={12}
            tickFormatter={(value) => `${value}`}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#888888"
            fontSize={12}
            tickFormatter={(value) => `${value}€`}
            tickLine={false}
          />
          <ChartTooltip 
            content={
              <ChartTooltipContent 
                formatter={(value, name) => formatTooltipValue(value as number, name as string)}
              />
            }
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="count"
            name={chartConfig.count.label}
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="value"
            name={chartConfig.value.label}
            fill="var(--color-value)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      )}
    </ChartContainer>
  );
};

export default SalesChart;
