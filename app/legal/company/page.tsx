import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Реквизиты компании",
  description: "Реквизиты ТОО «DeWorld StaffBase» — оператора системы StaffBase.",
};

export default function CompanyPage() {
  return (
    <LegalPage title="Реквизиты компании" updated="17 ноября 2026">
      <p>Оператором системы StaffBase и владельцем персональных данных, обрабатываемых в системе, является:</p>
      <table>
        <tbody>
          <tr><th>Наименование</th><td>ТОО «DeWorld StaffBase»</td></tr>
          <tr><th>БИН</th><td>260440001234</td></tr>
          <tr><th>Юридический адрес</th><td>140000, Республика Казахстан, Павлодарская обл., г. Павлодар, ул. Торайгырова, 91/1, офис 214</td></tr>
          <tr><th>Телефон</th><td>+7 (7182) 55-01-01</td></tr>
          <tr><th>Электронная почта</th><td><a href="mailto:info@staffbase.kz">info@staffbase.kz</a></td></tr>
          <tr><th>Банковские реквизиты</th><td>АО «Народный Банк Казахстана», ИИК KZ86 601A 0000 0000 1234 56, БИК HSBKKZKX</td></tr>
          <tr><th>Директор</th><td>Нуркенов С. Б.</td></tr>
        </tbody>
      </table>
      <p>
        Настоящий раздел содержит учебные (вымышленные) реквизиты: сайт создан в рамках курсовой работы
        и не является предложением товаров или услуг. Любые совпадения с реальными организациями случайны.
      </p>
    </LegalPage>
  );
}
