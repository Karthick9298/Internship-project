import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Files, Download, HardDrive, Share2,
  Trash2, ToggleLeft, ToggleRight, Copy, Check, AlertCircle,
  Upload, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./DashboardPage.css";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric"
});

const isExpired = (iso) => new Date(iso) < new Date();

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + "18", color }}>
      <Icon size={22} />
    </div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats]   = useState(null);
  const [files, setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [filter, setFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, filesRes] = await Promise.all([
        api.get("/files/stats"),
        api.get("/files/my-files"),
      ]);
      setStats(statsRes.data);
      setFiles(filesRes.data.files);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteFile = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/files/${id}`);
      toast.success("File deleted.");
      setFiles((prev) => prev.filter((f) => f._id !== id));
      fetchData(); // refresh stats
    } catch {
      toast.error("Failed to delete file.");
    }
  };

  const toggleSharing = async (id) => {
    try {
      const { data } = await api.patch(`/files/${id}/toggle`);
      setFiles((prev) =>
        prev.map((f) => f._id === id ? { ...f, isActive: data.isActive } : f)
      );
      toast.success(data.message);
    } catch {
      toast.error("Failed to toggle sharing.");
    }
  };

  // Sort & filter
  const processedFiles = [...files]
    .filter((f) => {
      if (filter === "active")  return f.isActive && !isExpired(f.expiresAt);
      if (filter === "expired") return isExpired(f.expiresAt);
      if (filter === "disabled") return !f.isActive;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest")    return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")    return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "downloads") return b.downloadCount - a.downloadCount;
      if (sortBy === "size")      return b.size - a.size;
      return 0;
    });

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="fade-in">
          {/* Header */}
          <div className="dash-header">
            <div>
              <h1>
                <LayoutDashboard size={26} style={{ display: "inline", marginRight: 10, verticalAlign: "middle", color: "var(--primary)" }} />
                Dashboard
              </h1>
              <p className="text-secondary">Welcome back, {user?.name}!</p>
            </div>
            <div className="dash-header-actions">
              <button className="btn btn-ghost btn-sm" onClick={fetchData} title="Refresh">
                <RefreshCw size={16} />
              </button>
              <Link to="/upload" className="btn btn-primary">
                <Upload size={16} /> Upload File
              </Link>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="stats-grid">
              {[1,2,3,4].map((i) => (
                <div key={i} className="stat-card skeleton" style={{ height: 90 }} />
              ))}
            </div>
          ) : stats && (
            <div className="stats-grid">
              <StatCard icon={Files}    label="Total Files"    value={stats.totalFiles}      color="#4F46E5" />
              <StatCard icon={Download} label="Total Downloads" value={stats.totalDownloads}  color="#10B981" />
              <StatCard icon={HardDrive} label="Storage Used"  value={formatBytes(stats.totalStorage)} color="#F59E0B" />
              <StatCard icon={Share2}   label="Active Shares"  value={stats.activeShares}    color="#6366F1" />
            </div>
          )}

          {/* File table */}
          <div className="card" style={{ marginTop: 28, padding: 0 }}>
            <div className="table-header">
              <h2 className="table-title">My Files</h2>
              <div className="table-controls">
                {/* Filter */}
                <select
                  className="form-input table-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All files</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="disabled">Disabled</option>
                </select>
                {/* Sort */}
                <select
                  className="form-input table-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="downloads">Most downloaded</option>
                  <option value="size">Largest first</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="table-loading">
                <div className="skeleton" style={{ height: 52, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 52, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 52 }} />
              </div>
            ) : processedFiles.length === 0 ? (
              <div className="table-empty">
                <AlertCircle size={36} style={{ color: "var(--text-muted)" }} />
                <p className="text-secondary">
                  {files.length === 0 ? "You haven't uploaded any files yet." : "No files match this filter."}
                </p>
                {files.length === 0 && (
                  <Link to="/upload" className="btn btn-primary btn-sm">
                    <Upload size={14} /> Upload your first file
                  </Link>
                )}
              </div>
            ) : (
              <div className="file-table-wrap">
                <table className="file-table">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Code</th>
                      <th>Downloads</th>
                      <th>Expires</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedFiles.map((file) => {
                      const expired = isExpired(file.expiresAt);
                      const limitHit = file.maxDownloads && file.downloadCount >= file.maxDownloads;
                      const statusBadge = expired ? "badge-warning" :
                        !file.isActive ? "badge-neutral" :
                        limitHit ? "badge-danger" : "badge-success";
                      const statusLabel = expired ? "Expired" :
                        !file.isActive ? "Disabled" :
                        limitHit ? "Limit hit" : "Active";

                      return (
                        <tr key={file._id}>
                          <td>
                            <div className="file-name-cell">
                              <div className="file-name">{file.originalName}</div>
                              <div className="file-size text-xs text-muted">{formatBytes(file.size)}</div>
                            </div>
                          </td>
                          <td>
                            <div className="code-cell">
                              <span className="code-chip">{file.shareCode}</span>
                              <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => copyCode(file.shareCode, file._id)}
                                title="Copy code"
                              >
                                {copiedId === file._id ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div>
                              <span className="font-semibold">{file.downloadCount}</span>
                              {file.maxDownloads && (
                                <span className="text-muted text-xs"> / {file.maxDownloads}</span>
                              )}
                              {file.maxDownloads && (
                                <div className="progress-bar" style={{ marginTop: 4, height: 4 }}>
                                  <div
                                    className={`progress-bar-fill ${
                                      file.downloadCount / file.maxDownloads >= 0.9 ? "danger" :
                                      file.downloadCount / file.maxDownloads >= 0.7 ? "warning" : ""
                                    }`}
                                    style={{ width: `${Math.min((file.downloadCount / file.maxDownloads) * 100, 100)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm" style={{ color: expired ? "var(--danger)" : "var(--text-secondary)" }}>
                              {formatDate(file.expiresAt)}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${statusBadge}`}>{statusLabel}</span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => toggleSharing(file._id)}
                                title={file.isActive ? "Disable sharing" : "Enable sharing"}
                              >
                                {file.isActive
                                  ? <ToggleRight size={18} style={{ color: "var(--success)" }} />
                                  : <ToggleLeft size={18} style={{ color: "var(--text-muted)" }} />}
                              </button>
                              <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => deleteFile(file._id, file.originalName)}
                                title="Delete file"
                                style={{ color: "var(--danger)" }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
