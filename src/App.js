import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const API_URL = "https://moderateai-backend-production.up.railway.app/";

const api = axios.create({
  baseURL: API_URL,
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsLoggedIn(true);
    }
    setIsLoading(false); // Done checking
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  // Wait for auth check to complete
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "submissions" && <Submissions />}
        {currentPage === "clients" && <Clients />}
        {currentPage === "test" && <TestAPI />}
      </main>
    </div>
  );
}

// ==================== LOGIN ====================

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@moderateai.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/admin/login", { email, password });
      const token = res.data.token;

      // Save token
      localStorage.setItem("token", token);

      // Set axios header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Call onLogin
      onLogin();
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🛡️ ModerateAI</h1>
          <p>AI-Powered Content Moderation Platform</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@moderateai.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="login-footer">
          <small>Default: admin@moderateai.com / admin123</small>
        </div>
      </div>
    </div>
  );
}

// ==================== NAVBAR ====================

function Navbar({ currentPage, setCurrentPage, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>🛡️ ModerateAI</h2>
      </div>
      <div className="nav-links">
        <button
          className={currentPage === "dashboard" ? "active" : ""}
          onClick={() => setCurrentPage("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={currentPage === "submissions" ? "active" : ""}
          onClick={() => setCurrentPage("submissions")}
        >
          📋 Submissions
        </button>
        <button
          className={currentPage === "clients" ? "active" : ""}
          onClick={() => setCurrentPage("clients")}
        >
          👥 Clients
        </button>
        <button
          className={currentPage === "test" ? "active" : ""}
          onClick={() => setCurrentPage("test")}
        >
          🧪 Test API
        </button>
      </div>
      <button className="btn-logout" onClick={onLogout}>
        Logout
      </button>
    </nav>
  );
}

// ==================== DASHBOARD ====================

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Making API call to /api/analytics/overview"); // DEBUG
    console.log(
      "Current auth header:",
      api.defaults.headers.common["Authorization"],
    ); // DEBUG

    api
      .get("/api/analytics/overview")
      .then((res) => {
        console.log("Analytics response:", res.data); // DEBUG
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics error:", err.response?.data || err.message); // DEBUG
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!analytics) return <div className="error">Failed to load analytics</div>;

  const pieData = [
    {
      name: "Approved",
      value: parseInt(analytics.overview.approved),
      color: "#10b981",
    },
    {
      name: "Review",
      value: parseInt(analytics.overview.review),
      color: "#f59e0b",
    },
    {
      name: "Rejected",
      value: parseInt(analytics.overview.rejected),
      color: "#ef4444",
    },
  ];

  const barData = analytics.recent_activity.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    submissions: parseInt(item.count),
  }));

  return (
    <div className="dashboard">
      <h1>Analytics Overview</h1>

      <div className="stats-grid">
        <StatCard
          title="Total Submissions"
          value={analytics.overview.total_submissions}
          icon="📝"
          color="#3b82f6"
        />
        <StatCard
          title="Spam Detected"
          value={analytics.overview.spam_detected}
          icon="🚫"
          color="#ef4444"
        />
        <StatCard
          title="Toxic Content"
          value={analytics.overview.toxic_detected}
          icon="⚠️"
          color="#f59e0b"
        />
        <StatCard
          title="Avg Processing"
          value={`${parseFloat(analytics.overview.avg_processing_time).toFixed(
            2,
          )}ms`}
          icon="⚡"
          color="#10b981"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Moderation Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} submissions`} />
              <Legend
                verticalAlign="bottom"
                formatter={(value, entry) =>
                  `${value}: ${entry.payload.value} (${(
                    (entry.payload.value /
                      pieData.reduce((sum, d) => sum + d.value, 0)) *
                    100
                  ).toFixed(0)}%)`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Recent Activity (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Top Clients</h3>
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Requests</th>
            </tr>
          </thead>
          <tbody>
            {analytics.top_clients.map((client, idx) => (
              <tr key={idx}>
                <td>{client.name}</td>
                <td>{client.request_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color + "20" }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
}

// ==================== SUBMISSIONS ====================

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const params =
      filter !== "all" ? `?recommendation=${filter.toUpperCase()}` : "";
    api
      .get(`/api/submissions${params}`)
      .then((res) => {
        setSubmissions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [filter]);

  if (loading) return <div className="loading">Loading submissions...</div>;

  return (
    <div className="submissions">
      <div className="submissions-header">
        <h1>Content Submissions</h1>
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "approve" ? "active" : ""}
            onClick={() => setFilter("approve")}
          >
            ✅ Approved
          </button>
          <button
            className={filter === "review" ? "active" : ""}
            onClick={() => setFilter("review")}
          >
            ⚠️ Review
          </button>
          <button
            className={filter === "reject" ? "active" : ""}
            onClick={() => setFilter("reject")}
          >
            ❌ Rejected
          </button>
        </div>
      </div>

      <div className="submissions-list">
        {submissions.length === 0 ? (
          <div className="empty-state">No submissions found</div>
        ) : (
          submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ submission }) {
  const statusColors = {
    APPROVE: "#10b981",
    REVIEW: "#f59e0b",
    REJECT: "#ef4444",
  };

  // Fix: Handle both array and string formats
  const flaggedWords = Array.isArray(submission.flagged_words)
    ? submission.flagged_words
    : [];

  return (
    <div className="submission-card">
      <div className="submission-header">
        <div>
          <span className="submission-id">#{submission.id}</span>
          <span className="submission-client">{submission.client_name}</span>
        </div>
        <span
          className="submission-status"
          style={{
            backgroundColor: statusColors[submission.recommendation] + "20",
            color: statusColors[submission.recommendation],
          }}
        >
          {submission.recommendation}
        </span>
      </div>

      <div className="submission-content">
        <p className="submission-text">{submission.content_text}</p>
      </div>

      <div className="submission-details">
        <div className="detail-item">
          <span className="detail-label">Spam</span>
          <span
            className={`detail-badge ${
              submission.is_spam ? "danger" : "success"
            }`}
          >
            {submission.is_spam ? "Yes" : "No"} (
            {(submission.spam_score * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Toxic</span>
          <span
            className={`detail-badge ${
              submission.is_toxic ? "danger" : "success"
            }`}
          >
            {submission.is_toxic ? "Yes" : "No"} (
            {(submission.toxicity_score * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Inappropriate</span>
          <span
            className={`detail-badge ${
              submission.is_inappropriate ? "danger" : "success"
            }`}
          >
            {submission.is_inappropriate ? "Yes" : "No"} (
            {(submission.inappropriate_score * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {flaggedWords.length > 0 && (
        <div className="flagged-words">
          <strong>Flagged Words:</strong> {flaggedWords.join(", ")}
        </div>
      )}

      <div className="submission-footer">
        <span>Confidence: {(submission.confidence * 100).toFixed(1)}%</span>
        <span>
          {(() => {
            const date = new Date(submission.created_at);
            return date.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          })()}
        </span>
      </div>
    </div>
  );
}

// ==================== CLIENTS ====================

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    api
      .get("/api/clients")
      .then((res) => {
        setClients(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const toggleClient = async (id) => {
    try {
      await api.patch(`/api/clients/${id}/toggle`);
      loadClients();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading clients...</div>;

  return (
    <div className="clients">
      <div className="clients-header">
        <h1>API Clients</h1>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Client"}
        </button>
      </div>

      {showAddForm && (
        <AddClientForm
          onSuccess={() => {
            loadClients();
            setShowAddForm(false);
          }}
        />
      )}

      <div className="clients-grid">
        {clients.map((client) => (
          <div key={client.id} className="client-card">
            <div className="client-header">
              <h3>{client.name}</h3>
              <span
                className={`client-status ${
                  client.is_active ? "active" : "inactive"
                }`}
              >
                {client.is_active ? "🟢 Active" : "🔴 Inactive"}
              </span>
            </div>
            <div className="client-details">
              <p>
                <strong>Email:</strong> {client.email}
              </p>
              <p>
                <strong>API Key:</strong> <code>{client.api_key}</code>
              </p>
              <p>
                <strong>Total Requests:</strong> {client.total_requests}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(client.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              className={`btn-toggle ${
                client.is_active ? "btn-danger" : "btn-success"
              }`}
              onClick={() => toggleClient(client.id)}
            >
              {client.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddClientForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/clients", { name, email });
      onSuccess();
    } catch (err) {
      alert("Error creating client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-client-form" onSubmit={handleSubmit}>
      <h3>Add New Client</h3>
      <input
        type="text"
        placeholder="Client Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Creating..." : "Create Client"}
      </button>
    </form>
  );
}

// ==================== TEST API ====================

function TestAPI() {
  const [text, setText] = useState(
    "Congratulations! You won a FREE prize! Click here to claim your $1000!",
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("mod_test_key_12345678901234567890");

  const testModeration = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/moderate`,
        { text },
        { headers: { "X-API-Key": apiKey } },
      );
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-api">
      <h1>Test Moderation API</h1>

      <div className="test-form">
        <div className="form-group">
          <label>API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="mod_test_key..."
          />
        </div>

        <div className="form-group">
          <label>Text to Moderate</label>
          <textarea
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to moderate..."
          />
        </div>

        <button
          className="btn-primary"
          onClick={testModeration}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "🧪 Test Moderation"}
        </button>
      </div>

      {result && (
        <div className="test-result">
          <h3>Result</h3>
          {result.error ? (
            <div className="error-message">{result.error}</div>
          ) : (
            <div>
              <div className="result-badges">
                <span
                  className={`badge ${result.is_spam ? "danger" : "success"}`}
                >
                  Spam: {result.is_spam ? "Yes" : "No"} (
                  {(result.spam_score * 100).toFixed(0)}%)
                </span>
                <span
                  className={`badge ${result.is_toxic ? "danger" : "success"}`}
                >
                  Toxic: {result.is_toxic ? "Yes" : "No"} (
                  {(result.toxicity_score * 100).toFixed(0)}%)
                </span>
                <span
                  className={`badge ${
                    result.recommendation === "REJECT"
                      ? "danger"
                      : result.recommendation === "REVIEW"
                        ? "warning"
                        : "success"
                  }`}
                >
                  {result.recommendation}
                </span>
              </div>

              {result.flagged_words.length > 0 && (
                <div className="flagged-section">
                  <strong>Flagged Words:</strong>{" "}
                  {result.flagged_words.join(", ")}
                </div>
              )}

              <div className="result-details">
                <p>
                  <strong>Confidence:</strong>{" "}
                  {(result.confidence * 100).toFixed(1)}%
                </p>
                <p>
                  <strong>Processing Time:</strong> {result.processing_time_ms}
                  ms
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
