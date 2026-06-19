"use client";

import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function TryOnContent() {
  const searchParams = useSearchParams();
  const clothUrl = searchParams.get("cloth_url") || "";
  const productName = searchParams.get("product_name") || "Sản phẩm";

  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Ảnh không được vượt quá 10MB");
        return;
      }

      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(file));
      setError(null);
      setResultImage(null);
    },
    []
  );

  const handleTryOn = async () => {
    if (!personFile || !clothUrl) return;

    setIsProcessing(true);
    setError(null);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("person", personFile);
      formData.append("cloth_url", clothUrl);

      const res = await fetch(`${API_URL}/ai/change-cloth-url`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Có lỗi xảy ra");
      }

      const data = await res.json();

      // Proxy ảnh kết quả qua backend để tránh CORS từ ComfyUI
      const proxyUrl = `${API_URL}/ai/proxy-image?url=${encodeURIComponent(data.output_image)}`;
      setResultImage(proxyUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xử lý ảnh. Vui lòng thử lại."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPersonFile(null);
    setPersonPreview(null);
    setResultImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 font-serif">
                Thử Đồ Với AI
              </h1>
              <p className="text-xs text-gray-500">{productName}</p>
            </div>
          </div>
          <button
            onClick={() => window.close()}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Hướng dẫn:</strong> Upload ảnh của bạn (chụp đứng thẳng,
            toàn thân, nền đơn giản) để AI thử quần áo lên người bạn. Quá trình
            xử lý mất khoảng 30 giây - 2 phút.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Cloth Image */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Quần áo thử
                </h2>
              </div>
              <div className="p-4">
                {clothUrl ? (
                  <div className="aspect-[3/4] max-h-[400px] mx-auto overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={clothUrl}
                      alt="Cloth"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-400">Không có ảnh sản phẩm</p>
                  </div>
                )}
              </div>
            </div>

            {/* Person Image Upload */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Ảnh của bạn
                </h2>
              </div>
              <div className="p-4">
                {personPreview ? (
                  <div className="space-y-3">
                    <div className="aspect-[3/4] max-h-[400px] mx-auto overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={personPreview}
                        alt="Person"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={handleReset}
                      className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Chọn ảnh khác
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[3/4] max-h-[300px] flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors mx-auto w-full">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                      />
                    </svg>
                    <p className="text-sm text-gray-600 font-medium">
                      Click để upload ảnh
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG (tối đa 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleTryOn}
              disabled={!personFile || !clothUrl || isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-white uppercase tracking-wider transition-all shadow-lg ${
                !personFile || !clothUrl || isProcessing
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
              }`}
            >
              {isProcessing ? "ĐANG XỬ LÝ..." : "THỬ ĐỒ NGAY"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Result */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Kết quả AI
              </h2>
            </div>
            <div className="p-4">
              {isProcessing ? (
                <div className="aspect-[3/4] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-6 text-sm font-medium text-gray-700">
                    AI đang xử lý ảnh...
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Quá trình này mất khoảng 30s - 2 phút
                  </p>
                  <div className="mt-4 w-48 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full animate-pulse w-2/3"></div>
                  </div>
                </div>
              ) : resultImage ? (
                <div className="space-y-3">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={resultImage}
                      alt="AI Result"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <a
                    href={resultImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 text-center text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Xem ảnh đầy đủ
                  </a>
                </div>
              ) : (
                <div className="aspect-[3/4] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                  <svg
                    className="w-16 h-16 text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400">
                    Kết quả sẽ hiển thị ở đây
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Upload ảnh và nhấn &quot;Thử đồ ngay&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <TryOnContent />
    </Suspense>
  );
}
