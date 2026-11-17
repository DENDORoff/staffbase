import Link from "next/link";
import { Logo } from "./Logo";

const legal = [
  { href: "/legal/privacy", label: "Политика конфиденциальности" },
  { href: "/legal/terms", label: "Условия использования" },
  { href: "/legal/cookies", label: "Политика Cookie" },
  { href: "/legal/consent", label: "Согласие на обработку ПД" },
  { href: "/legal/refund", label: "Политика возврата средств" },
  { href: "/legal/delete-data", label: "Удаление моих данных" },
  { href: "/legal/company", label: "Реквизиты" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Logo size={30} />
              <span className="font-serif text-lg font-bold text-text">StaffBase</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-2">
              ТОО «DeWorld StaffBase», БИН 260440001234.<br />
              140000, Республика Казахстан, г. Павлодар, ул. Торайгырова, 91/1.<br />
              Тел. +7 (7182) 55-01-01, казначейский офис 1.
            </p>
          </div>
          <nav aria-label="Юридическая информация" className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs sm:grid-cols-1 md:grid-cols-2">
            {legal.map((l) => (
              <Link key={l.href} href={l.href} className="text-text-2 underline-offset-2 hover:text-text hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-[11px] leading-snug text-text-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 ТОО «DeWorld StaffBase». Все права защищены. Программный продукт создан в рамках курсовой работы.</span>
          <span>Реквизиты учебные: реквизиты приведены для демонстрации требований законодательства.</span>
        </div>
      </div>
    </footer>
  );
}
