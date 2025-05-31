import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { RoundedBar } from './roundedbar';

// Definisi tipe data untuk memastikan `data` valid
type ChartData = { name: string; value: number; highlight?: boolean; };

export const VertikalBarChartComponent = ({ data }: { data: ChartData[] }) => {
  return (
    <BarChart 
      width={480} 
      height={320} 
      data={data} 
      layout="vertical"
    >
      <XAxis type="number" /> 
      <YAxis dataKey="name" type="category" /> 
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
  );
};

