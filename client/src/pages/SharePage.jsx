import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Shield, File, Clock, Hash, AlertCircle, CheckCircle } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./SharePage.css";

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (iso) => new Date(iso).toLocaleString();

const SharePage = () => {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();

  const [code, setCode]         = useState(urlCode || "");
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [downloading, setDownloading] = useState(false);

  // Auto-lookup if code is in URL
  useEffect(() => {
    if (urlCode) lookupCode(urlCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode]);

  const lookupCode = async (c) => {
    const trimmed = (c || code).trim().toUpperCase();
    if (!trimmed) { toast.error("Enter a share code."); return; }
    setLoading(true);
    setError(null);
    setFileInfo(null);
    setVerified(false);
    setPassword("");
    try {
      const { data } = await api.get(`/share/${trimmed}`);
      setFileInfo(data);
      if (!data.isPasswordProtected) setVerified(true);
      navigate(`/share/${trimmed}`, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "File not found.";
      setError({ message: msg, reason: err.response?.data?.reason });
    } finally {
      setLoading(false);
    }
  };

  const verifyPassword = async () => {
    setVerifying(true);
    try {
      await api.post("/share/verify", { code: code.trim().toUpperCase(), password });
      setVerified(true);
      toast.success("Password correct!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect password.");
    } finally {
      setVerifying(false);
    }
  };

  const downloadFile = async () => {
    setDownloading(true);
    try {
      const params = {};
      if (fileInfo.isPasswordProtected && password) params.password = password;

      const { data } = await api.get(`/share/${fileInfo.shareCode}/download`, { params });

      // Trigger browser download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.originalName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!");
      // Refresh file info to show updated count
      const { data: refreshed } = await api.get(`/share/${fileInfo.shareCode}`);
      setFileInfo(refreshed);
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const progressPercent = fileInfo?.maxDownloads
    ? Math.min((fileInfo.downloadCount / fileInfo.maxDownloads) * 100, 100)
    : null;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="fade-in">
          <div className="share-page-header">
            <h1>Get a File</h1>
            <p className="text-secondary">Enter the 6-character share code to access a file</p>
          </div>

          {/* Code input */}
          <div className="card card-sm">
            <div className="code-input-row">
              <input
                type="text"
                className="form-input code-input"
                placeholder="Enter code  e.g. K7P2X9"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && lookupCode()}
                id="share-code-input"
              />
              <button
                className="btn btn-primary"
                onClick={() => lookupCode()}
                disabled={loading || code.length < 6}
                id="lookup-btn"
              >
                {loading ? <span className="spinner" /> : "Look Up"}
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className={`alert ${error.reason === "expired" || error.reason === "limit_exceeded" ? "alert-warning" : "alert-danger"} fade-in`} style={{ marginTop: 20 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error.message}</span>
            </div>
          )}

          {/* File info card */}
          {fileInfo && (
            <div className="card share-file-card fade-in" style={{ marginTop: 20 }}>
              {/* File header */}
              <div className="share-file-header">
                <div className="share-file-icon">
                  <File size={24} />
                </div>
                <div className="share-file-meta">
                  <div className="share-file-name">{fileInfo.originalName}</div>
                  <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                    <span className="text-xs text-muted">{formatBytes(fileInfo.size)}</span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted">{fileInfo.mimeType}</span>
                  </div>
                </div>
                {fileInfo.isPasswordProtected && (
                  <div className="badge badge-primary">
                    <Shield size={11} /> Protected
                  </div>
                )}
              </div>

              <hr className="divider" />

              {/* Stats */}
              <div className="share-stats">
                <div className="share-stat">
                  <Clock size={14} />
                  <span className="text-sm"><strong>Expires:</strong> {formatDate(fileInfo.expiresAt)}</span>
                </div>
                <div className="share-stat">
                  <Hash size={14} />
                  <span className="text-sm">
                    <strong>Downloads:</strong>{" "}
                    {fileInfo.maxDownloads
                      ? `${fileInfo.downloadCount} / ${fileInfo.maxDownloads}`
                      : `${fileInfo.downloadCount} (unlimited)`}
                  </span>
                </div>
              </div>

              {/* Download progress bar */}
              {progressPercent !== null && (
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${progressPercent >= 90 ? "danger" : progressPercent >= 70 ? "warning" : ""}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <hr className="divider" />

              {/* Password gate */}
              {fileInfo.isPasswordProtected && !verified && (
                <div className="password-section fade-in">
                  <p className="text-sm font-semibold" style={{ marginBottom: 10 }}>
                    <Shield size={14} style={{ display: "inline", marginRight: 6 }} />
                    This file is password protected
                  </p>
                  <div className="code-input-row">
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
                      id="file-password-input"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={verifyPassword}
                      disabled={verifying || !password}
                      id="verify-password-btn"
                    >
                      {verifying ? <span className="spinner" /> : "Unlock"}
                    </button>
                  </div>
                </div>
              )}

              {/* Verified indicator */}
              {fileInfo.isPasswordProtected && verified && (
                <div className="alert alert-success fade-in" style={{ marginBottom: 16 }}>
                  <CheckCircle size={16} /> Password verified. Ready to download.
                </div>
              )}

              {/* Download button */}
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={downloadFile}
                disabled={downloading || !verified}
                id="download-btn"
              >
                {downloading
                  ? <><span className="spinner" /> Preparing Download…</>
                  : <><Download size={18} /> Download File</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharePage;
