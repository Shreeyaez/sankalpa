import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Used Budget", value: 56.3 },
  { name: "Remaining Budget", value: 43.7 },
];

const COLORS = ["#ef4444", "#22c55e"];

export default function BudgetStatus() {
  return (
    <div className="bg-white p-4 rounded border h-full">
      <h3 className="font-semibold mb-3">Budget Status</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={90}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="text-sm mt-3 space-y-1">
        <p className="text-red-500">Used Budget: 56.3%</p>
        <p className="text-green-500">Remaining Budget: 43.7%</p>
      </div>
    </div>
  );
}
