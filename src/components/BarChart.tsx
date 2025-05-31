import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RoundedBar } from './roundedbar';

type ChartData = { name: string; value: number; highlight?: boolean; };

export const BarChartComponent = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          angle={-30} // Rotasi agar tidak bertumpuk
          textAnchor="end"
          interval={0} // Pastikan semua label ditampilkan
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" shape={<RoundedBar/>}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.highlight ? '#d32f2f' : '#3498DB'}
          />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
