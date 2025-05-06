
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, LineChart } from "recharts";
import { SalesData } from "@/types";

interface SalesChartProps {
  data: SalesData[];
  title?: string;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, title = "Vendas e Inspeções" }) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              stroke="#888888"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="#888888"
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#888888"
              fontSize={12}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "sales") return [`${value}€`, "Vendas"];
                return [value, "Inspeções"];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="inspections"
              name="Inspeções"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sales"
              name="Vendas"
              stroke="#1A1F2C"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
