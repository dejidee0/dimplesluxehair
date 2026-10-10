import { Bell } from "lucide-react";

const descriptions = {
  dashboard: "Live store performance, recent orders and inventory at a glance.",
  orders: "Manage and track every customer order.",
  products: "Manage the live Dimplesluxe catalogue and inventory.",
  customers: "View and manage customer relationships.",
};

const AdminHeader = ({ activeTab, showNotifications, setShowNotifications }) => (
  <div className="border-b border-black/12 bg-white px-8 py-5">
    <div className="flex items-center justify-between">
      <div><p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#f51578]">Dimplesluxe operations</p><h1 className="mt-1 text-3xl font-black uppercase tracking-[-0.05em] text-black">{activeTab}</h1><p className="mt-1 text-sm font-medium text-black/45">{descriptions[activeTab] || ""}</p></div>
      <div className="flex items-center gap-3"><button onClick={() => setShowNotifications(!showNotifications)} className="relative grid h-11 w-11 place-items-center border border-black/12 transition hover:border-[#ff1783] hover:bg-[#ff1783]" aria-label="Notifications"><Bell className="h-5 w-5 text-black" /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#ff1783]" /></button><div className="grid h-11 w-11 place-items-center rounded-full bg-black text-sm font-black text-[#ff1783]">A</div></div>
    </div>
  </div>
);

export default AdminHeader;
