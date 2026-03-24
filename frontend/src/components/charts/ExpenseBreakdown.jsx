import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Construction", amount: 2600000 },
  { name: "Materials", amount: 1300000 },
  { name: "Labor", amount: 700000 },
  { name: "Equipment", amount: 300000 },
  { name: "Other", amount: 200000 },
];

export default function ExpenseBreakdown() {
  return (
    <div className="bg-white p-4 rounded border h-full">
      <h3 className="font-semibold mb-3">Expense Breakdown</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
