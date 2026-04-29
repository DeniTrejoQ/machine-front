"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { BarChart3, FileUp, ListFilter, Search, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

import { api, CategoryOptions, DashboardSummary, Review } from "@/lib/api";

type View = "dashboard" | "upload" | "analysis" | "records";
type AnalysisForm = {
  comentario: string;
  categoria: string;
  subcategoria: string;
  sentimiento: string;
  producto: string;
  detalle: string;
};
type FilterState = {
  category: string;
  subcategory: string;
  sentiment: string;
  product: string;
  classification: string;
  search: string;
};

const emptySummary: DashboardSummary = {
  total_reviews: 0,
  high_churn_intent: 0,
  likely_retention: 0,
  by_category: [],
  by_subcategory: [],
  trend: []
};

const emptyOptions: CategoryOptions = {
  categories: [],
  subcategories: [],
  sentiments: [],
  products: [],
  classifications: []
};

const palette = ["#1558a8", "#1d6ed0", "#38a3d1", "#42b883", "#f59e0b", "#64748b"];

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [options, setOptions] = useState<CategoryOptions>(emptyOptions);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    subcategory: "",
    sentiment: "",
    product: "",
    classification: "",
    search: ""
  });
  const [analysisForm, setAnalysisForm] = useState<AnalysisForm>({
    comentario: "",
    categoria: "",
    subcategoria: "",
    sentimiento: "",
    producto: "",
    detalle: ""
  });
  const [prediction, setPrediction] = useState<{
    predicted_classification: string;
    prediction_confidence: number | null;
    recommendation: string;
  } | null>(null);

  const loadSummary = async () => {
    const [summaryData, categoryData] = await Promise.all([api.summary(), api.categories()]);
    setSummary(summaryData);
    setOptions(categoryData);
  };

  const loadReviews = async () => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const data = await api.reviews(query.toString() ? `?${query.toString()}` : "");
    setReviews(data);
  };

  useEffect(() => {
    loadSummary().catch((error) => setStatus(error.message));
  }, []);

  useEffect(() => {
    if (view === "records") {
      loadReviews().catch((error) => setStatus(error.message));
    }
  }, [view]);

  const title = useMemo(() => {
    if (view === "dashboard") return "Dashboard general";
    if (view === "upload") return "Carga de CSV";
    if (view === "analysis") return "Analisis individual";
    return "Registros";
  }, [view]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus("");
    try {
      const result = await api.uploadCsv(file);
      const warning = result.prediction_warnings.length
        ? ` Advertencia: ${result.prediction_warnings[0]} Se uso la clasificacion original como respaldo.`
        : "";
      const details = result.error_details.length ? ` Primeros errores: ${result.error_details.join(" | ")}` : "";
      setStatus(
        `Insertados: ${result.inserted}. Duplicados omitidos: ${result.skipped}. Errores: ${result.errors}.${warning}${details}`
      );
      await loadSummary();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo cargar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setPrediction(null);
    setStatus("");
    try {
      const result = await api.predict(analysisForm);
      setPrediction(result);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo generar la prediccion.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await loadReviews();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudieron cargar registros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">ELEMENT ELITE FLEET</div>
        <nav className="nav" aria-label="Navegacion principal">
          <NavButton active={view === "dashboard"} icon={<BarChart3 size={18} />} onClick={() => setView("dashboard")}>
            Dashboard
          </NavButton>
          <NavButton active={view === "upload"} icon={<FileUp size={18} />} onClick={() => setView("upload")}>
            Cargar CSV
          </NavButton>
          <NavButton active={view === "analysis"} icon={<Sparkles size={18} />} onClick={() => setView("analysis")}>
            Analisis
          </NavButton>
          <NavButton active={view === "records"} icon={<ListFilter size={18} />} onClick={() => setView("records")}>
            Registros
          </NavButton>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Inteligencia comercial</p>
            <h1>{title}</h1>
          </div>
          <button className="button secondary" onClick={() => loadSummary()} type="button">
            <ShieldCheck size={18} />
            Actualizar
          </button>
        </header>

        {view === "dashboard" && <Dashboard summary={summary} />}
        {view === "upload" && <UploadPanel loading={loading} onUpload={handleUpload} status={status} />}
        {view === "analysis" && (
          <AnalysisPanel
            form={analysisForm}
            loading={loading}
            options={options}
            prediction={prediction}
            setForm={setAnalysisForm}
            status={status}
            onSubmit={handlePredict}
          />
        )}
        {view === "records" && (
          <RecordsPanel
            filters={filters}
            loading={loading}
            options={options}
            reviews={reviews}
            selectedReview={selectedReview}
            setFilters={setFilters}
            setSelectedReview={setSelectedReview}
            onSubmit={applyFilters}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({
  active,
  children,
  icon,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick} type="button">
      {icon}
      {children}
    </button>
  );
}

function Dashboard({ summary }: { summary: DashboardSummary }) {
  return (
    <>
      <section className="grid stats">
        <Metric title="Resenas analizadas" value={summary.total_reviews} />
        <Metric title="Alta intencion de abandono" value={summary.high_churn_intent} />
        <Metric title="Retencion probable" value={summary.likely_retention} />
      </section>

      <section className="grid charts">
        <div className="card">
          <p className="card-title">Tendencia por mes o trimestre</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.trend}>
              <CartesianGrid stroke="#dbe4f0" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1558a8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <p className="card-title">Distribucion por categoria</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={summary.by_category} dataKey="value" nameKey="name" outerRadius={96} label>
                {summary.by_category.map((_, index) => (
                  <Cell fill={palette[index % palette.length]} key={index} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card full">
          <p className="card-title">Distribucion por subcategoria</p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={summary.by_subcategory.slice(0, 18)}>
              <CartesianGrid stroke="#dbe4f0" />
              <XAxis dataKey="name" interval={0} angle={-20} height={90} textAnchor="end" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1d6ed0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="card">
      <p className="card-title">{title}</p>
      <div className="metric">{value.toLocaleString("es-MX")}</div>
    </div>
  );
}

function UploadPanel({
  loading,
  onUpload,
  status
}: {
  loading: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  status: string;
}) {
  return (
    <section className="card">
      <p className="card-title">Archivo con estructura de clasificacion_comentarios.csv</p>
      <label>
        CSV de comentarios
        <input accept=".csv,text/csv" disabled={loading} onChange={onUpload} type="file" />
      </label>
      <p className="muted">
        Se validan las columnas requeridas y se omiten duplicados cuando el campo ID ya existe.
      </p>
      {status && <p className="status">{status}</p>}
    </section>
  );
}

function AnalysisPanel({
  form,
  loading,
  options,
  prediction,
  setForm,
  status,
  onSubmit
}: {
  form: AnalysisForm;
  loading: boolean;
  options: CategoryOptions;
  prediction: { predicted_classification: string; prediction_confidence: number | null; recommendation: string } | null;
  setForm: (value: AnalysisForm) => void;
  status: string;
  onSubmit: (event: FormEvent) => void;
}) {
  const update = (key: string, value: string) => setForm({ ...form, [key]: value });
  return (
    <section className="grid charts">
      <form className="card form-grid" onSubmit={onSubmit}>
        <label className="full">
          Comentario
          <textarea required value={form.comentario} onChange={(event) => update("comentario", event.target.value)} />
        </label>
        <Field label="Categoria" options={options.categories} value={form.categoria} onChange={(value) => update("categoria", value)} />
        <Field
          label="Subcategoria"
          options={options.subcategories}
          value={form.subcategoria}
          onChange={(value) => update("subcategoria", value)}
        />
        <Field label="Sentimiento" options={options.sentiments} value={form.sentimiento} onChange={(value) => update("sentimiento", value)} />
        <Field label="Producto" options={options.products} value={form.producto} onChange={(value) => update("producto", value)} />
        <label className="full">
          Detalle
          <textarea value={form.detalle} onChange={(event) => update("detalle", event.target.value)} />
        </label>
        <button className="button" disabled={loading} type="submit">
          <UserCheck size={18} />
          Generar prediccion
        </button>
      </form>
      <div className="card">
        <p className="card-title">Resultado</p>
        {prediction ? (
          <>
            <span className="pill">{prediction.predicted_classification}</span>
            <p className="metric">
              {prediction.prediction_confidence === null
                ? "N/D"
                : `${Math.round(prediction.prediction_confidence * 100)}%`}
            </p>
            <p className="muted">Confianza del modelo</p>
            <p>{prediction.recommendation}</p>
          </>
        ) : (
          <p className="muted">Completa el formulario para obtener clasificacion, confianza y recomendacion comercial.</p>
        )}
        {status && <p className="status">{status}</p>}
      </div>
    </section>
  );
}

function Field({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input list={`${label}-options`} required={label === "Categoria" || label === "Subcategoria"} value={value} onChange={(event) => onChange(event.target.value)} />
      <datalist id={`${label}-options`}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
}

function RecordsPanel({
  filters,
  loading,
  options,
  reviews,
  selectedReview,
  setFilters,
  setSelectedReview,
  onSubmit
}: {
  filters: FilterState;
  loading: boolean;
  options: CategoryOptions;
  reviews: Review[];
  selectedReview: Review | null;
  setFilters: (value: FilterState) => void;
  setSelectedReview: (review: Review | null) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const update = (key: string, value: string) => setFilters({ ...filters, [key]: value });
  return (
    <section className="card">
      <form className="filters" onSubmit={onSubmit}>
        <SelectFilter label="Categoria" options={options.categories} value={filters.category} onChange={(value) => update("category", value)} />
        <SelectFilter label="Subcategoria" options={options.subcategories} value={filters.subcategory} onChange={(value) => update("subcategory", value)} />
        <SelectFilter label="Sentimiento" options={options.sentiments} value={filters.sentiment} onChange={(value) => update("sentiment", value)} />
        <SelectFilter label="Producto" options={options.products} value={filters.product} onChange={(value) => update("product", value)} />
        <SelectFilter
          label="Clasificacion"
          options={options.classifications}
          value={filters.classification}
          onChange={(value) => update("classification", value)}
        />
        <label>
          Buscar
          <input value={filters.search} onChange={(event) => update("search", event.target.value)} />
        </label>
        <button className="button" disabled={loading} type="submit">
          <Search size={18} />
          Filtrar
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Comentario</th>
              <th>Categoria</th>
              <th>Subcategoria</th>
              <th>Sentimiento</th>
              <th>Producto</th>
              <th>Clasificacion</th>
              <th>Confianza</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.external_id || review.id}</td>
                <td>{review.comment}</td>
                <td>{review.category}</td>
                <td>{review.subcategory}</td>
                <td>{review.sentiment}</td>
                <td>{review.product}</td>
                <td>
                  <span className="pill">{review.predicted_classification || "N/D"}</span>
                </td>
                <td>{review.prediction_confidence === null ? "N/D" : `${Math.round(review.prediction_confidence * 100)}%`}</td>
                <td>
                  <button className="button secondary" onClick={() => setSelectedReview(review)} type="button">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReview && (
        <div className="card detail-panel">
          <p className="card-title">Detalle del comentario</p>
          <p>{selectedReview.comment}</p>
          <p className="muted">{selectedReview.detail || "Sin detalle adicional"}</p>
          <button className="button secondary" onClick={() => setSelectedReview(null)} type="button">
            Cerrar
          </button>
        </div>
      )}
    </section>
  );
}

function SelectFilter({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
