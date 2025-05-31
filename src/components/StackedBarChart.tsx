import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ChartData = {
  name: string; // lokasi
  [company: string]: string | number; // perusahaan sebagai key
};

type Props = {
  data: ChartData[];
};

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1',
  '#a4de6c', '#d0ed57', '#d88884', '#a28eff', '#ffb3ba'
];

export const StackedBarChartComponent = ({ data }: Props) => {
  const companyNames = Object.keys(data[0] || {}).filter(key => key !== 'name');

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip />
        <Legend />
        {companyNames.map((company, index) => (
          <Bar
            key={company}
            dataKey={company}
            stackId="a"
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
