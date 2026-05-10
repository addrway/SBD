import React, { useCallback, useEffect, useState } from "react";
import Papa from "papaparse";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabase";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip);

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const navigation = [
  "Dashboard",
  "Projects",
  "Finance",
  "Logistics",
  "Inventory",
  "Customers",
  "Reports",
  "Uploads",
  "Invoices",
  "Receipts",
  "Payroll",
  "Contractors",
  "Time Tracking",
  "Command Center",
  "Settings"
];
const moduleCards = ["Projects", "Finance", "Inventory", "Uploads", "Reports", "Command Center"];
const featureCards = [
  "Manual data entry",
  "CSV upload workflow",
  "KPI cards",
  "Project dashboards",
  "Finance tracking",
  "Inventory alerts",
  "Reports",
  "Admin command center",
  "Subscription-ready plans"
];
const defaultTask = { task_name: "", phase: "Planning", status: "Todo", priority: "Medium" };
const statuses = ["Todo", "In Progress", "Completed", "Blocked"];
const priorities = ["Low", "Medium", "High"];
const phases = ["Planning", "Operations", "Finance", "Delivery", "Review"];
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/28E28s5VE0HL8Qg1gqdnW00";

export default function App() {
  const { session, loading, trialActive } = useAuth();
  const [page, setPage] = useState("home");
  const protectedPage = ["dashboard", ...navigation.map(slug)].includes(page);

  if (loading) return <><Styles /><div className="loading">Loading SBD Pro...</div></>;
  if (!session && protectedPage) return <><Styles /><AuthPage mode="login" setPage={setPage} /></>;
  if (session && protectedPage && !trialActive()) return <><Styles /><TrialExpired setPage={setPage} /></>;

  const publicPages = {
    home: <Home setPage={setPage} />,
    features: <Features />,
    pricing: <Pricing setPage={setPage} />,
    login: <AuthPage mode="login" setPage={setPage} />,
    signup: <AuthPage mode="signup" setPage={setPage} />
  };

  return (
    <>
      <Styles />
      {publicPages[page] ? <PublicNav page={page} setPage={setPage} /> : null}
      {publicPages[page] || <Shell active={page} setPage={setPage} />}
    </>
  );
}

function PublicNav({ page, setPage }) {
  return (
    <header className="public-nav">
      <button className="brand" onClick={() => setPage("home")}>SBD Pro</button>
      <nav>
        {["home", "features", "pricing"].map((item) => <button className={page === item ? "active" : ""} key={item} onClick={() => setPage(item)}>{item}</button>)}
        <button onClick={() => setPage("login")}>Login</button>
        <button className="primary" onClick={() => setPage("signup")}>Start free</button>
      </nav>
    </header>
  );
}

function Home({ setPage }) {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Simple Business Dashboards</p>
          <h1>Enter your data. See your business clearly.</h1>
          <p>SBD helps small businesses, logistics teams, managers, and consultants turn daily work into clean dashboards, reports, and decisions.</p>
          <div className="actions">
            <button className="primary" onClick={() => setPage("signup")}>Start 24-hour trial</button>
            <button onClick={() => setPage("pricing")}>View pricing</button>
          </div>
        </div>
        <div className="hero-panel">
          <Kpi title="Revenue" value="$42,810" />
          <Kpi title="Open Tasks" value="28" tone="blue" />
          <Kpi title="High Priority" value="6" tone="amber" />
        </div>
      </section>
      <section className="stats"><b>Manual entry</b><b>CSV uploads</b><b>Dashboards</b><b>Reports</b></section>
      <Section title="How It Works"><div className="grid four">{["Create account", "Enter or upload data", "Review dashboards", "Share reports"].map((step, index) => <Card key={step} title={`${index + 1}. ${step}`} text="Designed for beginners who need clear business visibility." />)}</div></Section>
      <Section title="Business Modules"><div className="grid three">{moduleCards.map((item) => <Card key={item} title={item} text={`${item} tools for daily business operations.`} />)}</div></Section>
      <section className="quote"><blockquote>"SBD gives operators the command center they wanted without the spreadsheet mess."</blockquote><span>Launch-ready SaaS MVP</span></section>
      <section className="cta"><h2>Simple dashboards for real business work.</h2><button className="primary" onClick={() => setPage("signup")}>Create account</button></section>
    </main>
  );
}

function Features() {
  return <Section title="Features"><div className="grid three">{featureCards.map((feature) => <Card key={feature} title={feature} text="Clean, premium, and simple enough for non-technical teams." />)}</div></Section>;
}

function Pricing({ setPage }) {
  return (
    <main className="pricing">
      <h1>Pricing</h1>
      <div className="grid three">
        <Card title="SBD Pro · $29.99/month" text="All dashboards, projects, uploads, finance tools, reports, and business modules in one simple plan." />
        <Card title="24-hour free trial" text="No credit card required to create an account and test the dashboard." />
        <Card title="Everything included" text="No confusing tiers. Simple Business Dashboards stays simple." />
      </div>
      <div className="panel">
        <h2>Subscriptions</h2>
        <p>Stripe Checkout is connected through a hosted payment link. Billing Portal, plan limits, and subscription status still need secure backend work later.</p>
        <div className="actions">
          <a className="button-link primary" href={STRIPE_CHECKOUT_URL} target="_blank" rel="noreferrer">Subscribe with Stripe</a>
          <button onClick={() => setPage("signup")}>Start trial</button>
        </div>
      </div>
    </main>
  );
}

function AuthPage({ mode, setPage }) {
  const { signIn, signUp } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const signup = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      signup ? await signUp(form) : await signIn(form);
      setPage("dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>{signup ? "Start SBD Pro" : "Login"}</h1>
        {signup && <p>24-hour free trial. No credit card required.</p>}
        {signup && <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required minLength="6" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button className="primary">{signup ? "Create account" : "Login"}</button>
        <button type="button" onClick={() => setPage(signup ? "login" : "signup")}>{signup ? "I already have an account" : "Create an account"}</button>
      </form>
    </main>
  );
}

function TrialExpired({ setPage }) {
  const { signOut, planLabel } = useAuth();

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <h1>Trial ended</h1>
        <p>Your {planLabel()} is not active right now. Subscribe for $29.99/month to keep using SBD Pro.</p>
        <a className="button-link primary" href={STRIPE_CHECKOUT_URL} target="_blank" rel="noreferrer">Subscribe with Stripe</a>
        <button type="button" onClick={() => setPage("pricing")}>View pricing</button>
        <button type="button" onClick={signOut}>Logout</button>
      </div>
    </main>
  );
}

function Shell({ active, setPage }) {
  const { signOut, profile, planLabel, hoursLeft } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const refresh = useCallback(async function refresh() {
    const [taskRows, transactionRows] = await Promise.all([
      supabase.select("tasks", "?select=*&order=created_at.desc").catch(() => []),
      supabase.select("transactions", "?select=*&order=date.desc,created_at.desc").catch(() => [])
    ]);
    setTasks(taskRows || []);
    setTransactions(transactionRows || []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const props = { tasks, transactions, refresh };
  const pages = {
    dashboard: <Dashboard {...props} />,
    projects: <Projects {...props} />,
    finance: <Finance {...props} />,
    uploads: <Uploads {...props} />,
    reports: <Reports tasks={tasks} transactions={transactions} />,
    invoices: <Invoices />,
    receipts: <Receipts />,
    inventory: <Inventory />,
    payroll: <Payroll />,
    contractors: <Contractors />,
    "time-tracking": <TimeTracking />,
    "command-center": <CommandCenter tasks={tasks} profile={profile} />,
    settings: <Settings profile={profile} />
  };

  return (
    <div className="app-shell">
      <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
        <button className="sidebar-brand" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "S" : "SBD Pro"}</button>
        {navigation.map((item) => <button className={active === slug(item) ? "active" : ""} key={item} onClick={() => setPage(slug(item))}>{collapsed ? item[0] : item}</button>)}
      </aside>
      <section className="workspace">
        <div className="topbar">
          <span className="pill green">Live</span>
          <span className="pill amber">{planLabel()} · {hoursLeft()}h left</span>
          <button onClick={signOut}>Logout</button>
        </div>
        {pages[active] || <ComingSoon title={label(active)} />}
      </section>
    </div>
  );
}

function Dashboard({ tasks, transactions }) {
  const stats = taskStats(tasks);
  const finance = financeStats(transactions);
  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid four">
        <Kpi title="Total Tasks" value={stats.total} />
        <Kpi title="Completed" value={stats.completed} tone="green" />
        <Kpi title="Profit" value={money.format(finance.profit)} tone="blue" />
        <Kpi title="High Priority" value={stats.highPriority} tone="amber" />
      </div>
      <div className="grid two"><ChartPanel title="Task Status"><Pie data={statusData(tasks)} /></ChartPanel><ChartPanel title="Cash Flow"><Line data={cashFlowData(transactions)} /></ChartPanel></div>
    </>
  );
}

function Projects({ tasks, refresh }) {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultTask);
  const [editingId, setEditingId] = useState(null);
  const stats = taskStats(tasks);

  async function save(event) {
    event.preventDefault();
    if (editingId) await supabase.update("tasks", `?id=eq.${editingId}`, form);
    else await supabase.insert("tasks", [{ ...form, user_id: user.id }]);
    setForm(defaultTask);
    setEditingId(null);
    await refresh();
  }

  async function remove(id) {
    await supabase.remove("tasks", `?id=eq.${id}`);
    await refresh();
  }

  return (
    <>
      <h1>Projects</h1>
      <div className="grid four">
        <Kpi title="Total Tasks" value={stats.total} />
        <Kpi title="Completed" value={stats.completed} tone="green" />
        <Kpi title="High Priority" value={stats.highPriority} tone="amber" />
        <Kpi title="Progress" value={`${stats.progress}%`} tone="blue" />
      </div>
      <div className="grid three"><ChartPanel title="Status"><Doughnut data={statusData(tasks)} /></ChartPanel><ChartPanel title="Tasks By Phase"><Bar data={phaseData(tasks)} /></ChartPanel><ChartPanel title="Progress"><Line data={progressData(stats.progress)} /></ChartPanel></div>
      <form className="panel form-row" onSubmit={save}>
        <input required placeholder="Task name" value={form.task_name} onChange={(e) => setForm({ ...form, task_name: e.target.value })} />
        <select value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })}>{phases.map(option)}</select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map(option)}</select>
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorities.map(option)}</select>
        <button className="primary">{editingId ? "Update task" : "Create task"}</button>
      </form>
      <DataTable rows={tasks} columns={["task_name", "phase", "status", "priority"]} actions={(row) => <><button onClick={() => { setForm(pickTask(row)); setEditingId(row.id); }}>Edit</button><button onClick={() => remove(row.id)}>Delete</button></>} />
    </>
  );
}

function Uploads({ refresh }) {
  const { user } = useAuth();
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("CSV works now. Excel uses SheetJS later. PDF parsing uses PDF.js later.");

  function parseFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setMessage("CSV is supported now. XLSX, PDF, receipts, and invoices are placeholders for the next backend/parser pass.");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.map(pickTask).filter((row) => row.task_name);
        setPreview(rows);
        setMessage(`${rows.length} valid task rows ready to import.`);
      }
    });
  }

  async function importRows() {
    await supabase.insert("tasks", preview.map((row) => ({ ...row, user_id: user.id })));
    setPreview([]);
    setMessage("Tasks imported and dashboard refreshed.");
    await refresh();
  }

  return (
    <>
      <h1>Uploads</h1>
      <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); parseFile(e.dataTransfer.files[0]); }}>
        <strong>Drop CSV here</strong>
        <p>Columns: task_name, phase, status, priority</p>
        <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={(e) => parseFile(e.target.files[0])} />
      </div>
      <p>{message}</p>
      {preview.length > 0 && <><DataTable rows={preview} columns={["task_name", "phase", "status", "priority"]} /><button className="primary" onClick={importRows}>Import valid rows</button></>}
      <div className="grid three"><Card title="Excel Upload" text="SheetJS placeholder for XLSX imports." /><Card title="PDF Upload" text="PDF.js placeholder for parsing documents." /><Card title="Receipts & Invoices" text="Upload placeholders for receipt and invoice workflows." /></div>
    </>
  );
}

function Finance({ transactions }) {
  const stats = financeStats(transactions);
  return (
    <>
      <h1>Finance</h1>
      <div className="grid four"><Kpi title="Income" value={money.format(stats.income)} tone="green" /><Kpi title="Expenses" value={money.format(stats.expenses)} tone="red" /><Kpi title="Profit" value={money.format(stats.profit)} tone="blue" /><Kpi title="Cash Flow" value={money.format(stats.cashFlow)} /></div>
      <div className="grid two"><ChartPanel title="Cash Flow"><Line data={cashFlowData(transactions)} /></ChartPanel><ChartPanel title="Expense Categories"><Pie data={expenseData(transactions)} /></ChartPanel></div>
      <DataTable rows={transactions} columns={["date", "description", "category", "type", "amount"]} />
      <div className="panel"><h2>Future Connections</h2><p>Plaid, Stripe financial data, and bank account connections require secure backend routes and are intentionally placeholders.</p></div>
    </>
  );
}

function Reports({ tasks, transactions }) {
  const stats = financeStats(transactions);
  return <Module title="Reports" cards={[["Profit and Loss", money.format(stats.profit)], ["Balance Sheet", "Placeholder"], ["Cash Flow Statement", "Placeholder"], ["Project Profitability", `${taskStats(tasks).progress}% progress`]]} note="PDF export, CSV export, date filters, operational reports, and report charts are scaffolded for backend export work." />;
}

function Invoices() {
  return <Module title="Invoices" cards={[["Create Invoice", "Ready UI"], ["Invoice Status", "Paid / unpaid"], ["Due Dates", "Tracked"], ["Customer Assignment", "Planned"]]} note="Stripe payments, PayPal, and QuickBooks sync require backend integrations." />;
}

function Receipts() {
  return <Module title="Receipts" cards={[["Upload Receipt", "Ready"], ["Receipt Gallery", "Placeholder"], ["Match Expense", "Planned"], ["Category Assignment", "Planned"]]} note="OCR, AI categorization, and mobile uploads need backend/parser services." />;
}

function Inventory() {
  return <Module title="Inventory" cards={[["Stock Levels", "Tracked"], ["Low Inventory Alerts", "Ready UI"], ["Reorder Alerts", "Planned"], ["Inventory Value", "$0"]]} note="Includes placeholders for movement logs, trends, stock chart, and product profitability chart." />;
}

function Payroll() {
  return <Module title="Payroll" cards={[["Employees", "0"], ["Payroll Summary", "$0"], ["1099 Tracking", "Placeholder"], ["Gusto / ADP", "Future"]]} note="Payroll providers require secure backend integration before launch." />;
}

function Contractors() {
  return <Module title="Contractors" cards={[["Contractors", "0"], ["Payments", "$0"], ["1099 Status", "Placeholder"], ["QuickBooks Payroll", "Future"]]} note="Contractor payment workflows are scaffolded for a later backend pass." />;
}

function TimeTracking() {
  return <Module title="Time Tracking" cards={[["Clock In / Out", "Placeholder"], ["Billable Hours", "0"], ["Project Hours", "0"], ["Mileage", "0 mi"]]} note="Includes placeholders for work logs, productivity chart, and weekly summaries." />;
}

function CommandCenter({ tasks, profile }) {
  if (profile?.role !== "admin") return <div className="panel"><h1>Command Center</h1><p>Admin access required. Set your profile role to admin in Supabase after signup.</p></div>;
  const stats = taskStats(tasks);
  return <Module title="Command Center" cards={[["Total Users", "Profile count placeholder"], ["Active Workspaces", "1"], ["Uploaded Files", "Upload count placeholder"], ["Total Tasks", stats.total], ["Subscriptions", "Stripe placeholder"], ["Revenue", "Billing placeholder"], ["Recent Activity", "Placeholder"], ["Admin Testing Tools", "Enabled"]]} note="Admin data beyond the current user needs secured backend reporting or admin-only database views." />;
}

function Settings({ profile }) {
  return (
    <div className="panel">
      <h1>Settings</h1>
      <p>Signed-in role: <strong>{profile?.role || "customer"}</strong></p>
      <p>Admin test account note: create addrway@outlook.com in Supabase Auth, then change the password after testing. Do not store test passwords in code.</p>
      <pre>update profiles set role = 'admin' where email = 'addrway@outlook.com';</pre>
    </div>
  );
}

function Module({ title, cards, note }) {
  return <><h1>{title}</h1><div className="grid four">{cards.map(([a, b]) => <Kpi key={a} title={a} value={b} />)}</div><div className="panel"><p>{note}</p></div></>;
}

function ComingSoon({ title }) {
  return <div className="panel"><h1>{title}</h1><p>This module is coming soon.</p></div>;
}

function DataTable({ rows, columns, actions }) {
  return (
    <div className="panel table-panel">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{label(column)}</th>)}{actions && <th>Actions</th>}</tr></thead>
        <tbody>
          {rows.map((row, index) => <tr key={row.id || index}>{columns.map((column) => <td key={column}>{String(row[column] ?? "")}</td>)}{actions && <td>{actions(row)}</td>}</tr>)}
          {rows.length === 0 && <tr><td colSpan={columns.length + (actions ? 1 : 0)}>No records yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Kpi({ title, value, tone = "neutral" }) {
  return <div className={`kpi ${tone}`}><span>{title}</span><strong>{value}</strong><svg viewBox="0 0 120 32"><path d="M2 26 L22 18 L39 22 L58 9 L78 15 L96 6 L118 12" /></svg></div>;
}

function Card({ title, text }) {
  return <article className="card"><h3>{title}</h3><p>{text}</p></article>;
}

function ChartPanel({ title, children }) {
  return <div className="panel chart"><h2>{title}</h2>{children}</div>;
}

function Section({ title, children }) {
  return <section className="section"><h2>{title}</h2>{children}</section>;
}

function option(item) {
  return <option key={item} value={item}>{item}</option>;
}

function pickTask(row) {
  return {
    task_name: row.task_name || row.Task || row.name || "",
    phase: row.phase || "Planning",
    status: row.status || "Todo",
    priority: row.priority || "Medium"
  };
}

function taskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const highPriority = tasks.filter((task) => task.priority === "High").length;
  return { total, completed, highPriority, progress: total ? Math.round((completed / total) * 100) : 0 };
}

function financeStats(rows) {
  return rows.reduce((acc, row) => {
    const amount = Number(row.amount || 0);
    if (row.type === "income") acc.income += amount;
    else acc.expenses += amount;
    acc.profit = acc.income - acc.expenses;
    acc.cashFlow = acc.profit;
    return acc;
  }, { income: 0, expenses: 0, profit: 0, cashFlow: 0 });
}

function statusData(tasks) {
  return simpleData(statuses, statuses.map((status) => tasks.filter((task) => task.status === status).length));
}

function phaseData(tasks) {
  return simpleData(phases, phases.map((phase) => tasks.filter((task) => task.phase === phase).length));
}

function progressData(progress) {
  return simpleData(["Start", "Now", "Goal"], [0, progress, 100]);
}

function cashFlowData(rows) {
  const labels = rows.slice(0, 6).reverse().map((row) => row.date || "Entry");
  const values = rows.slice(0, 6).reverse().map((row) => (row.type === "income" ? 1 : -1) * Number(row.amount || 0));
  return simpleData(labels.length ? labels : ["No data"], values.length ? values : [0]);
}

function expenseData(rows) {
  const categories = [...new Set(rows.filter((row) => row.type !== "income").map((row) => row.category || "General"))];
  return simpleData(categories.length ? categories : ["No expenses"], categories.length ? categories.map((category) => rows.filter((row) => (row.category || "General") === category).reduce((sum, row) => sum + Number(row.amount || 0), 0)) : [1]);
}

function simpleData(labels, values) {
  return { labels, datasets: [{ data: values, backgroundColor: ["#1a56db", "#0d9488", "#f59e0b", "#ef4444", "#64748b"], borderColor: "#fff", tension: 0.35 }] };
}

function slug(item) {
  return item.toLowerCase().replaceAll(" ", "-");
}

function label(item) {
  return item.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function Styles() {
  return <style>{`
    :root{--bg:#f5f4f0;--sidebar:#0f0f14;--blue:#1a56db;--teal:#0d9488;--border:#dedbd2;--text:#17171d;--muted:#68645b;--card:#fff}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Figtree,system-ui,sans-serif}button,input,select,textarea{font:inherit}button,.button-link{border:1px solid var(--border);background:#fff;color:var(--text);border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}button:hover,.button-link:hover{border-color:var(--blue)}.primary{background:var(--blue);border-color:var(--blue);color:#fff}h1,h2,h3{font-family:"Playfair Display",Georgia,serif;letter-spacing:0;margin:0}h1{font-size:clamp(38px,6vw,72px);line-height:1}h2{font-size:30px}p{color:var(--muted);line-height:1.6}.loading{min-height:100vh;display:grid;place-items:center;font-weight:800}.public-nav{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:18px 6vw;background:rgba(245,244,240,.94);border-bottom:1px solid var(--border);backdrop-filter:blur(10px)}.public-nav nav{display:flex;gap:8px;flex-wrap:wrap}.public-nav button{text-transform:capitalize}.brand,.sidebar-brand{font-family:"Playfair Display",Georgia,serif;font-size:24px;border:0;background:transparent}.active{border-color:var(--blue);color:var(--blue)}main,.section{width:min(1180px,88vw);margin:0 auto}.hero{min-height:calc(100vh - 78px);display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:42px;padding:44px 0}.hero p{font-size:20px;max-width:660px}.eyebrow{text-transform:uppercase;font-size:13px!important;color:var(--teal);font-weight:800}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.hero-panel,.card,.panel,.auth-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:22px;box-shadow:0 14px 36px rgba(15,15,20,.06)}.hero-panel{display:grid;gap:14px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:36px}.stats b{background:#fff;padding:20px;text-align:center}.section{padding:52px 0}.grid{display:grid;gap:16px;margin:20px 0}.two{grid-template-columns:repeat(2,minmax(0,1fr))}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.four{grid-template-columns:repeat(4,minmax(0,1fr))}.card h3,.panel h2{font-size:22px}.quote,.cta{width:min(1180px,88vw);margin:0 auto 34px;padding:34px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}blockquote{font-family:"Playfair Display",Georgia,serif;font-size:34px;margin:0 0 10px}.cta{display:flex;justify-content:space-between;align-items:center;gap:16px}.pricing{padding:60px 0}.auth-wrap{min-height:calc(100vh - 78px);display:grid;place-items:center;padding:40px 0}.auth-card{width:min(460px,92vw);display:grid;gap:14px}input,select,textarea{width:100%;border:1px solid var(--border);border-radius:10px;padding:12px 14px;background:#fff;color:var(--text)}textarea{min-height:150px}.error{color:#b42318;margin:0}.app-shell{display:grid;grid-template-columns:auto 1fr;min-height:100vh}.sidebar{width:250px;background:var(--sidebar);color:#fff;padding:18px 12px;display:flex;flex-direction:column;gap:8px;transition:width .2s}.sidebar.collapsed{width:80px}.sidebar button{background:transparent;border-color:rgba(255,255,255,.1);color:#fff;text-align:left;min-height:42px;white-space:nowrap;overflow:hidden}.sidebar .active{background:#fff;color:var(--sidebar)}.workspace{padding:24px;min-width:0}.topbar{display:flex;justify-content:flex-end;gap:10px;align-items:center;margin-bottom:22px;flex-wrap:wrap}.pill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;text-transform:uppercase}.green{background:#dcfce7;color:#166534}.amber{background:#fef3c7;color:#92400e}.red{background:#fee2e2;color:#991b1b}.blue{background:#dbeafe;color:#1d4ed8}.neutral{background:#fff}.kpi{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;display:grid;gap:12px;box-shadow:0 12px 28px rgba(15,15,20,.05)}.kpi span{color:var(--muted);font-weight:800}.kpi strong{font-size:30px}.kpi svg{width:100%;height:34px}.kpi path{fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round}.chart{min-height:330px}.form-row{display:grid;grid-template-columns:1.2fr repeat(3,.7fr) auto;gap:10px;align-items:center}.table-panel{overflow:auto}table{width:100%;border-collapse:collapse;min-width:720px}th,td{padding:13px 10px;text-align:left;border-bottom:1px solid var(--border)}th{color:var(--muted);font-size:12px;text-transform:uppercase}.dropzone{border:2px dashed #c8c4ba;background:#fff;border-radius:14px;padding:34px;text-align:center;margin:18px 0}pre{white-space:pre-wrap;background:#f5f4f0;border:1px solid var(--border);border-radius:10px;padding:14px}@media(max-width:980px){.hero,.two,.three,.four,.form-row{grid-template-columns:1fr}.app-shell{grid-template-columns:1fr}.sidebar,.sidebar.collapsed{position:sticky;top:0;z-index:5;width:100%;flex-direction:row;overflow-x:auto}.workspace{padding:18px}.public-nav{align-items:flex-start;flex-direction:column;gap:10px}.stats{grid-template-columns:1fr}.cta{display:block}h1{font-size:42px}}
  `}</style>;
}
