/**
 * StaffBase — наполнение БД учебными данными.
 * Запуск: node scripts/seed.mjs  (читает DATABASE_URL из .env.local)
 * Пересоздаёт таблицы (DROP + CREATE) и заполняет их заново.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const envText = readFileSync(path.join(root, ".env.local"), "utf8");
const DATABASE_URL = envText.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!DATABASE_URL) throw new Error("DATABASE_URL not found in .env.local");

const sql = neon(DATABASE_URL);
const schema = readFileSync(path.join(root, "scripts", "schema.sql"), "utf8");

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const departments = [
  ["ADM", "Администрация", "Дирекция и общее управление"],
  ["IT", "Отдел информационных технологий", "Разработка, сопровождение и инфраструктура"],
  ["HR", "Отдел кадров", "Кадровый учёт и документооборот"],
  ["FIN", "Финансовый отдел", "Бухгалтерия и расчёт заработной платы"],
  ["OPS", "Отдел эксплуатации", "Эксплуатация оборудования и инфраструктуры"],
];

const positions = [
  ["Директор", "Ведущий специалист"],
  ["Заместитель директора", "Ведущий специалист"],
  ["Руководитель отдела", "Ведущий специалист"],
  ["Инженер-программист", "Специалист I категории"],
  ["Системный администратор", "Специалист II категории"],
  ["Бухгалтер", "Специалист II категории"],
  ["Специалист по кадрам", "Специалист I категории"],
  ["Инженер по охране труда", "Специалист II категории"],
  ["Специалист службы поддержки", "Специалист III категории"],
  ["Менеджер по продажам", "Специалист II категории"],
];

// Имя, фамилия, отчество, отдел, должность, год приёма, год рождения, зарплата
const staff = [
  ["Колот", "Денис", "Дмитриевич", "IT", "Инженер-программист", 2024, 2003, 480000],
  ["Нуркенов", "Султан", "Болатович", "ADM", "Директор", 2015, 1978, 950000],
  ["Соколова", "Елена", "Валерьевна", "HR", "Руководитель отдела", 2018, 1985, 620000],
  ["Данияров", "Данияр", "Ерланович", "FIN", "Руководитель отдела", 2019, 1988, 600000],
  ["Абдрахманов", "Ерлан", "Маратович", "IT", "Руководитель отдела", 2017, 1983, 650000],
  ["Касымова", "Айгерим", "Нурлановна", "HR", "Специалист по кадрам", 2022, 1995, 380000],
  ["Токтаров", "Нурлан", "Серикович", "IT", "Системный администратор", 2020, 1990, 450000],
  ["Жумабаева", "Мадина", "Каиржановна", "FIN", "Бухгалтер", 2021, 1992, 400000],
  ["Оразбеков", "Дастан", "Муратович", "IT", "Инженер-программист", 2023, 1998, 440000],
  ["Сатпаева", "Гульнара", "Аскаровна", "OPS", "Инженер по охране труда", 2016, 1981, 420000],
  ["Ибрагимов", "Тимур", "Русланович", "IT", "Инженер-программист", 2025, 2001, 430000],
  ["Ахметова", "Дана", "Бауыржановна", "HR", "Специалист по кадрам", 2025, 2002, 360000],
  ["Бекетов", "Арман", "Кайратович", "OPS", "Специалист службы поддержки", 2022, 1996, 370000],
  ["Мустафина", "Алия", "Марсовна", "FIN", "Бухгалтер", 2023, 1999, 390000],
  ["Ержанов", "Куаныш", "Алиевич", "IT", "Системный администратор", 2019, 1987, 460000],
  ["Темирова", "Лаура", "Сериковна", "OPS", "Специалист службы поддержки", 2024, 2000, 355000],
  ["Сулейменов", "Мурат", "Жандосович", "IT", "Инженер-программист", 2018, 1986, 520000],
  ["Каримова", "Индира", "Таировна", "HR", "Специалист по кадрам", 2020, 1993, 395000],
  ["Байтурсынов", "Олжас", "Ермекович", "FIN", "Бухгалтер", 2017, 1984, 415000],
  ["Нургалиева", "Назгуль", "Айдосовна", "IT", "Инженер-программист", 2021, 1994, 470000],
  ["Жаксылыков", "Ринат", "Болатович", "OPS", "Инженер по охране труда", 2022, 1991, 425000],
  ["Алиакбарова", "Сауле", "Маратовна", "ADM", "Заместитель директора", 2016, 1979, 680000],
  ["Мусин", "Бауыржан", "Жанатулы", "OPS", "Специалист службы поддержки", 2023, 1997, 350000],
  ["Досанова", "Фариза", "Канаткызы", "FIN", "Бухгалтер", 2024, 2001, 385000],
  ["Тлеубаев", "Ержан", "Самидинович", "IT", "Системный администратор", 2015, 1975, 500000],
  ["Шаймерденова", "Жанна", "Рашитовна", "HR", "Специалист по кадрам", 2019, 1990, 410000],
  ["Габдуллин", "Талгат", "Ережепович", "OPS", "Инженер по охране труда", 2018, 1982, 435000],
  ["Кенжебаева", "Динара", "Сериковна", "IT", "Инженер-программист", 2022, 1995, 445000],
  ["Усербаев", "Улан", "Муратович", "OPS", "Специалист службы поддержки", 2021, 1993, 365000],
  ["Рахимова", "Лейла", "Кадыркызы", "FIN", "Бухгалтер", 2020, 1989, 405000],
  ["Есенова", "Парасат", "Нуржанулы", "IT", "Инженер-программист", 2026, 2004, 340000],
  ["Билалов", "Шахизада", "Ерланович", "ADM", "Менеджер по продажам", 2023, 1998, 380000],
  ["Кудайбергенов", "Даурен", "Абилкайырович", "IT", "Инженер-программист", 2017, 1985, 540000],
  ["Смагулова", "Асель", "Данияровна", "HR", "Специалист по кадрам", 2021, 1996, 375000],
  ["Ахметов", "Диас", "Сергазинович", "FIN", "Бухгалтер", 2025, 2003, 350000],
  ["Ильясов", "Руслан", "Талгатович", "OPS", "Специалист службы поддержки", 2019, 1988, 370000],
  ["Зайцева", "Ольга", "Владимировна", "ADM", "Менеджер по продажам", 2022, 1994, 390000],
  ["Ковалёв", "Дмитрий", "Андреевич", "IT", "Инженер-программист", 2020, 1991, 490000],
  ["Ким", "Екатерина", "Алексеевна", "FIN", "Бухгалтер", 2016, 1983, 420000],
  ["Садыков", "Адилет", "Беркинович", "OPS", "Инженер по охране труда", 2025, 2002, 345000],
];

const translit = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",ә:"a",і:"i",ң:"n",ғ:"g",ү:"u",ұ:"u",қ:"k",ө:"o",һ:"h" };
const toLatin = (s) => s.toLowerCase().split("").map((c) => translit[c] ?? c).join("");

(async () => {
  console.log("Recreating schema…");
  const statements = schema
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.replace(/--[^\n]*/g, "").trim())
    .filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log("Inserting departments and positions…");
  const deptId = {};
  for (const [code, name, description] of departments) {
    const rows = await sql`INSERT INTO departments (code, name, description) VALUES (${code}, ${name}, ${description}) RETURNING id`;
    deptId[code] = rows[0].id;
  }
  const posId = {};
  for (const [title, grade] of positions) {
    const rows = await sql`INSERT INTO positions (title, salary_grade) VALUES (${title}, ${grade}) RETURNING id`;
    posId[title] = rows[0].id;
  }

  console.log("Inserting employees…");
  const empId = {};
  for (let i = 0; i < staff.length; i++) {
    const [last, first, middle, dept, pos, hireYear, birthYear, salary] = staff[i];
    const personnel = `TB-${String(i + 1).padStart(4, "0")}`;
    const email = `${toLatin(first)}.${toLatin(last)}${i + 1}@staffbase.kz`;
    const hire = `${hireYear}-0${(i % 9) + 1}-15`;
    const birth = `${birthYear}-${String((i % 12) + 1).padStart(2, "0")}-${String((i * 7) % 27 + 1).padStart(2, "0")}`;
    const status = i === 5 ? "vacation" : i === 11 ? "sick_leave" : "active";
    const rows = await sql`
      INSERT INTO employees (personnel_number, last_name, first_name, middle_name, position_id, department_id,
                             hire_date, birth_date, email, phone, salary, status)
      VALUES (${personnel}, ${last}, ${first}, ${middle}, ${posId[pos]}, ${deptId[dept]},
              ${hire}, ${birth}, ${email}, ${"+7 701 " + String(100 + i * 37).slice(-3) + "-" + String(1000 + i * 137).slice(-4)},
              ${salary}, ${status})
      RETURNING id`;
    empId[personnel] = rows[0].id;
  }

  console.log("Inserting users…");
  const password = hashPassword("StaffBase2026");
  const adminEmp = empId["TB-0001"]; // Колот Д. Д. — администратор (учебная учётка)
  const managerEmp = empId["TB-0002"]; // Нуркенов С. Б. — директор
  const employeeEmp = empId["TB-0004"]; // Данияров Д. Е. — руководитель отдела
  await sql`INSERT INTO users (email, password_hash, full_name, role, employee_id) VALUES
    ('hr@staffbase.kz', ${password}, 'Колот Денис Дмитриевич', 'admin', ${adminEmp})`;
  await sql`INSERT INTO users (email, password_hash, full_name, role, employee_id) VALUES
    ('manager@staffbase.kz', ${password}, 'Нуркенов Султан Болатович', 'manager', ${managerEmp})`;
  await sql`INSERT INTO users (email, password_hash, full_name, role, employee_id) VALUES
    ('employee@staffbase.kz', ${password}, 'Данияров Данияр Ерланович', 'employee', ${employeeEmp})`;

  console.log("Inserting leaves…");
  const leaveRows = [
    [empId["TB-0006"], "vacation", "2026-11-10", "2026-11-30", "approved", "Ежегодный оплачиваемый отпуск"],
    [empId["TB-0012"], "sick_leave", "2026-11-16", "2026-11-21", "approved", "Больничный лист № 114-2026"],
    [empId["TB-0005"], "vacation", "2026-12-14", "2026-12-28", "pending", "Заявка на новогодние каникулы"],
    [empId["TB-0009"], "vacation", "2026-10-05", "2026-10-19", "approved", "Ежегодный оплачиваемый отпуск"],
    [empId["TB-0017"], "sick_leave", "2026-10-28", "2026-10-30", "approved", "ОРВИ"],
    [empId["TB-0023"], "vacation", "2026-12-01", "2026-12-12", "rejected", "Пересечение с датами сдачи отчётности"],
    [empId["TB-0031"], "vacation", "2026-11-20", "2026-12-04", "pending", "По семейным обстоятельствам"],
    [empId["TB-0001"], "sick_leave", "2026-09-14", "2026-09-16", "approved", "Больничный лист № 087-2026"],
  ];
  for (const [emp, type, from, to, status, comment] of leaveRows) {
    await sql`INSERT INTO leaves (employee_id, type, starts_on, ends_on, status, comment)
              VALUES (${emp}, ${type}, ${from}, ${to}, ${status}, ${comment})`;
  }

  const counts = await sql`SELECT (SELECT count(*) FROM employees) AS e, (SELECT count(*) FROM leaves) AS l, (SELECT count(*) FROM users) AS u, (SELECT count(*) FROM departments) AS d, (SELECT count(*) FROM positions) AS p`;
  console.log("Done:", counts[0]);
})().catch((e) => { console.error(e); process.exit(1); });
