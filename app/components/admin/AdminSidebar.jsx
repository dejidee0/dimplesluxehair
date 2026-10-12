import { motion } from "framer-motion";
import Image from "next/image";
import { BarChart3, ShoppingCart, Package, Users, LogOut, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../../lib/store";
import { useRouter } from "next/navigation";

const AdminSidebar = ({ activeTab, setActiveTab, tabs }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const tabIcons = {
    dashboard: <BarChart3 className="h-5 w-5" />,
    orders: <ShoppingCart className="h-5 w-5" />,
    products: <Package className="h-5 w-5" />,
    customers: <Users className="h-5 w-5" />,
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-black text-white">
      <div className="border-b border-white/10 p-6">
        <div className="space-y-2">
          <Image
            src="/images/dimplesluxe-logo-light.png"
            alt="Dimplesluxe — The Hair Destination"
            width={708}
            height={135}
            className="h-auto w-48"
          />
          <p className="text-[0.55rem] font-black uppercase tracking-[0.17em] text-white/38">
            Store command centre
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {tabs.map((tab, index) => (
          <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className={`group relative flex w-full items-center justify-between overflow-hidden px-4 py-4 text-left transition ${activeTab === tab.id ? "bg-[#ff1783] text-black" : "text-white/55 hover:bg-white/8 hover:text-white"}`}>
            <div className="flex items-center gap-3"><span>{tabIcons[tab.id]}</span><span className="text-xs font-black uppercase tracking-[0.1em]">{tab.label}</span></div>
            {activeTab === tab.id ? <><motion.div layoutId="activeIndicator" className="absolute bottom-0 right-0 top-0 w-1 bg-white" /><ChevronRight className="h-4 w-4" /></> : <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-70" />}
          </motion.button>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="bg-white/[.06] p-3">
          <div className="mb-3 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#ff1783] text-sm font-black text-black">{user?.email?.charAt(0).toUpperCase() || "A"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{user?.first_name || "Admin"} {user?.last_name || "User"}</p><p className="truncate text-xs text-white/38">{user?.email || "admin@dimplesluxe.com"}</p></div></div>
          <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 border border-white/15 px-3 py-2.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-white/65 transition hover:border-[#ff1783] hover:text-[#ff1783]"><LogOut className="h-3.5 w-3.5" /> Log out</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
