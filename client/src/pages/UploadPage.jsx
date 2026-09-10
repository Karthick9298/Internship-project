import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Lock, Clock, Hash, X, ChevronDown } from "lucide-react";
import api from "../api/axios";
import ShareCodeCard from "../components/ShareCodeCard";
import toast from "react-hot-toast";
import "./UploadPage.css";

const EXPIRY_OPTIONS = [
  { value: "1h",  label: "1 hour" },
  { value: "6h",  label: "6 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d",  label: "7 days" },
];

const DOWNLOAD_OPTIONS = [
  { value: "",    label: "Unlimited" },
  { value: "5",   label: "5 downloads" },
  { value: "10",  label: "10 downloads" },
  { value: "25",  label: "25 downloads" },
  { value: "50",  label: "50 downloads" },
];

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const UploadPage = () => {
  const [file, setFile]             = useState(null);
  const [expiry, setExpiry]         = useState("24h");
  const [maxDownloads, setMaxDownloads] = useState("");
  const [password, setPassword]     = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [result, setResult]         = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === "file-too-large") toast.error("File too large. Max size is 50MB.");
      else toast.error(err?.message || "File rejected.");
    },
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file first."); return; }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expiry", expiry);
    if (maxDownloads) formData.append("maxDownloads", maxDownloads);
    if (usePassword && password) formData.append("password", password);

    setUploading(true);
    try {
      const { data } = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setFile(null);
      toast.success("File uploaded successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Upload failed.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setFile(null);
    setPassword("");
    setUsePassword(false);
    setExpiry("24h");
    setMaxDownloads("");
  };

  if (result) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 600 }}>
          <ShareCodeCard data={result} onUploadAnother={resetForm} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="fade-in">
          <div className="upload-header">
            <h1>Upload a File</h1>
            <p className="text-secondary">Select a file and configure sharing options. No account needed.</p>
          </div>

          <form className="card" onSubmit={handleUpload}>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? "dragover" : ""} ${file ? "has-file" : ""}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="dropzone-file">
                  <div className="dropzone-file-icon">
                    <File size={28} />
                  </div>
                  <div className="dropzone-file-info">
                    <div className="dropzone-file-name">{file.name}</div>
                    <div className="text-sm text-muted">{formatBytes(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <div className="dropzone-icon">
                    <Upload size={30} />
                  </div>
                  <p className="dropzone-label">
                    {isDragActive ? "Drop it here!" : "Drag & drop a file, or click to browse"}
                  </p>
                  <p className="text-xs text-muted">Max 50MB · Images, PDFs, Docs, Archives, Videos &amp; more</p>
                </div>
              )}
            </div>

            <hr className="divider" />

            {/* Options */}
            <div className="upload-options">
              {/* Expiry */}
              <div className="form-group">
                <label className="form-label">
                  <Clock size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  Expiration
                </label>
                <div className="option-pills">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`option-pill ${expiry === opt.value ? "active" : ""}`}
                      onClick={() => setExpiry(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download limit */}
              <div className="form-group">
                <label className="form-label">
                  <Hash size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  Maximum Downloads
                </label>
                <div className="select-wrapper">
                  <select
                    className="form-input"
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                  >
                    {DOWNLOAD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>

              {/* Password toggle */}
              <div className="form-group">
                <div className="password-toggle">
                  <label className="form-label" style={{ margin: 0 }}>
                    <Lock size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                    Password Protection
                  </label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {usePassword && (
                  <div className="fade-in" style={{ marginTop: 10 }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password for this file"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={100}
                    />
                    <p className="form-hint" style={{ marginTop: 4 }}>
                      Recipients will need this password to download.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={uploading || !file}
            >
              {uploading ? (
                <><span className="spinner" /> Uploading…</>
              ) : (
                <><Upload size={18} /> Upload & Generate Code</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
