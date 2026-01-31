"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Loader2,
  File,
  Image,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  documentType: string;
  createdAt: Date;
}

interface DocumentUploadProps {
  unitId: string;
  documents: Document[];
  canEdit?: boolean;
}

const documentTypeLabels: Record<string, string> = {
  CERTIFICATE: "Certificate",
  INSPECTION_REPORT: "Inspection Report",
  MAINTENANCE_REPORT: "Maintenance Report",
  MANUAL: "Manual",
  SCHEMATIC: "Schematic",
  PHOTO: "Photo",
  OTHER: "Other",
};

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("pdf")) return FileText;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUpload({ unitId, documents, canEdit = true }: DocumentUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("OTHER");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("unitId", unitId);
      formData.append("documentType", documentType);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      router.refresh();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(documentId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-ink/60 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
        </h3>
        
        {canEdit && (
          <div className="flex items-center gap-2">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1"
            >
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload
            </Button>
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">No documents yet</p>
          {canEdit && (
            <p className="text-xs text-slate-400 mt-1">
              Upload certificates, manuals, or photos
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const FileIcon = getFileIcon(doc.mimeType);
            
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg border border-slate-200">
                  <FileIcon className="h-5 w-5 text-slate-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-1.5 py-0.5 bg-slate-200 rounded">
                      {documentTypeLabels[doc.documentType] || doc.documentType}
                    </span>
                    {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                    <span>•</span>
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
