import { getDictionary, localeFromCookie } from "@/lib/i18n";
import type { SessionUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon, type IconName } from "@/components/Icon";

export async function AppNav({ user }: { user: SessionUser }) {
  const jar = await cookies();
  const locale = localeFromCookie(jar.get("sb_locale")?.value);
  const t = getDictionary(locale);

  const items: { href: string; key: string; icon: IconName; adminOnly?: boolean }[] = [
    { href: "/dashboard", key: "nav.dashboard", icon: "grid" },
    { href: "/employees", key: "nav.employees", icon: "users" },
    { href: "/departments", key: "nav.departments", icon: "building" },
    { href: "/positions", key: "nav.positions", icon: "briefcase" },
    { href: "/leaves", key: "nav.leaves", icon: "calendar" },
    { href: "/settings", key: "nav.settings", icon: "settings" },
    { href: "/admin/users", key: "nav.admin", icon: "shield", adminOnly: true },
  ];

  const visible = items.filter((i) => !i.adminOnly || user.role === "admin");

  return (
    <aside className="border-b border-border bg-surface md:min-h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border p-3 md:p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size={30} />
            <span className="font-serif text-lg font-bold">StaffBase</span>
          </Link>
          <form method="POST" action="/api/auth/logout" className="md:hidden">
            <button className="btn btn-ghost btn-sm" aria-label={t["common.logout"]}>
              <Icon name="logout" size={16} />
            </button>
          </form>
        </div>

        <nav aria-label="Разделы системы" className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-0.5 md:overflow-visible md:p-3">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href as never}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
            >
              <Icon name={item.icon} size={18} />
              {t[item.key as keyof typeof t]}
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-border p-4 md:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-2">Вы вошли как</p>
          <p className="mt-1 truncate text-sm font-bold text-text" title={user.fullName}>{user.fullName}</p>
          <p className="truncate text-xs text-text-2">{user.email}</p>
          <p className="mt-1 inline-flex rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-strong">
            {user.role === "admin" ? "Администратор (HR)" : user.role === "manager" ? "Руководитель" : "Сотрудник"}
          </p>
          <form method="POST" action="/api/auth/logout" className="mt-3">
            <button className="btn btn-ghost btn-sm w-full justify-center">
              <Icon name="logout" size={16} />
              {t["common.logout"]}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
