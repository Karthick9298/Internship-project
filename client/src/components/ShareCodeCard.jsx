import { useState } from "react";
import { Copy, Check, Download, QrCode, Upload, Shield, Clock, Hash } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./ShareCodeCard.css";

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatExpiry = (isoDate) => {
  const diff = new Date(isoDate) - new Date();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d} day${d > 1 ? "s" : ""}`;
  return `${h} hour${h !== 1 ? "s" : ""}`;
};

const ShareCodeCard = ({ data, onUploadAnother }) => {
  const [copied, setCopied]     = useState(false);
  const [qrCode, setQrCode]     = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const shareUrl = `${window.location.origin}/share/${data.shareCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(data.shareCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  const fetchQR = async () => {
    if (qrCode) return;
    setLoadingQr(true);
    try {
      const { data: qrData } = await api.get(`/share/${data.shareCode}/qr`);
      setQrCode(qrData.qrCode);
    } catch {
      toast.error("Failed to load QR code.");
    } finally {
      setLoadingQr(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `codeshare-${data.shareCode}-qr.png`;
    link.click();
  };

  return (
    <div className="share-card fade-in">
      {/* Success header */}
      <div className="share-card-header">
        <div className="share-success-icon">✓</div>
        <div>
          <h2>File Uploaded!</h2>
          <p className="text-secondary text-sm">Share the code below with anyone</p>
        </div>
      </div>

      {/* The code */}
      <div className="share-code-display">
        <div className="share-code-label text-xs text-muted">Your Share Code</div>
        <div className="share-code-value">{data.shareCode}</div>
        <button className="btn btn-primary" onClick={copyCode} id="copy-code-btn">
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Code</>}
        </button>
      </div>

      {/* File meta */}
      <div className="share-meta-grid">
        <div className="share-meta-item">
          <span className="text-xs text-muted">File</span>
          <span className="font-semibold text-sm" style={{ wordBreak: "break-all" }}>{data.originalName}</span>
        </div>
        <div className="share-meta-item">
          <span className="text-xs text-muted"><Clock size={12} style={{ display: "inline" }} /> Expires in</span>
          <span className="font-semibold text-sm">{formatExpiry(data.expiresAt)}</span>
        </div>
        <div className="share-meta-item">
          <span className="text-xs text-muted">Size</span>
          <span className="font-semibold text-sm">{formatBytes(data.size)}</span>
        </div>
        <div className="share-meta-item">
          <span className="text-xs text-muted"><Hash size={12} style={{ display: "inline" }} /> Max Downloads</span>
          <span className="font-semibold text-sm">{data.maxDownloads ?? "Unlimited"}</span>
        </div>
        {data.isPasswordProtected && (
          <div className="share-meta-item share-meta-password">
            <Shield size={14} style={{ color: "var(--primary)" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--primary)" }}>Password Protected</span>
          </div>
        )}
      </div>

      {/* QR Code section */}
      <div className="share-qr-section">
        {!qrCode ? (
          <button
            className="btn btn-secondary btn-full"
            onClick={fetchQR}
            disabled={loadingQr}
            id="show-qr-btn"
          >
            {loadingQr
              ? <><span className="spinner spinner-dark" /> Loading QR…</>
              : <><QrCode size={16} /> Show QR Code</>}
          </button>
        ) : (
          <div className="qr-display fade-in">
            <img src={qrCode} alt={`QR code for ${data.shareCode}`} className="qr-image" />
            <p className="text-xs text-muted text-center">Scan to open the download page</p>
            <button className="btn btn-secondary btn-sm" onClick={downloadQR} id="download-qr-btn">
              <Download size={14} /> Download QR
            </button>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="share-footer">
        <button className="btn btn-ghost btn-sm" onClick={copyLink}>
          <Copy size={14} /> Copy Link
        </button>
        <button className="btn btn-primary btn-sm" onClick={onUploadAnother} id="upload-another-btn">
          <Upload size={14} /> Upload Another
        </button>
      </div>
    </div>
  );
};

export default ShareCodeCard;
