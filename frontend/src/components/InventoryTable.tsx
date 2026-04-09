import { InventoryItem } from "../services/api";
import StatusBadge from "./StatusBadge";

interface InventoryTableProps {
  rows: InventoryItem[];
}

export default function InventoryTable({ rows }: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#ecddd0] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#f0e4d9]">
          <thead className="bg-[#fff8f3]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-6 py-4">Blood Group</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Expiring Soon</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3e9e0]">
            {rows.map((row) => (
              <tr key={`${row.district}-${row.blood_group}`} className="transition hover:bg-[#fffdfb]">
                <td className="px-6 py-5">
                  <div className="font-display text-xl text-ink">{row.blood_group}</div>
                  <div className="mt-1 text-sm text-slate-500">{row.district}</div>
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-slate-700">{row.current_stock_units} units</td>
                <td className="px-6 py-5 text-sm text-slate-600">{row.expiring_72h_units} units</td>
                <td className="px-6 py-5">
                  <StatusBadge value={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
