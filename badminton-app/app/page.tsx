"use client";
import { useState, useEffect, useRef } from "react";

const formatNumber = (value: string) => {
  if (!value) return "";
  return Number(value).toLocaleString();
};

const parseNumber = (value: string) => value.replace(/[^0-9]/g, "");

const formatK = (value: number) => {
  if (!value) return "0k";
  return Math.round(value / 1000) + "k";
};

const DEFAULT_GENDERS: Record<string, "nam" | "nu"> = {
  Bằng: "nam", Minh: "nam", Thuỷ: "nu", Thảo: "nu",
  Dạ: "nu", Vân: "nu", Hiếu: "nam", Xuân: "nam", Cao: "nam",
};

const QR_STORAGE_KEY = "playerQRs";

export default function App() {
  const defaultPlayers = ["Bằng", "Minh", "Thuỷ", "Thảo", "Dạ", "Vân", "Hiếu", "Xuân", "Cao"];

  const [players, setPlayers] = useState<string[]>(defaultPlayers);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [courtFee, setCourtFee] = useState("");
  const [shuttleQty, setShuttleQty] = useState("");
  const shuttlePrice = 26100;
  const [otherFee, setOtherFee] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [genderMode, setGenderMode] = useState(false);
  const [genders, setGenders] = useState<Record<string, "nam" | "nu">>(DEFAULT_GENDERS);
  const [receiver, setReceiver] = useState<string>("");
  const [playerQRs, setPlayerQRs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string>("");

  useEffect(() => {
    setCourtFee(localStorage.getItem("lastCourtFee") ?? "");
    const savedQRs = localStorage.getItem(QR_STORAGE_KEY);
    if (savedQRs) setPlayerQRs(JSON.parse(savedQRs));
  }, []);

  const getGender = (name: string) => genders[name] ?? "nam";

  const toggleGender = (name: string) => {
    setGenders((prev) => ({ ...prev, [name]: getGender(name) === "nam" ? "nu" : "nam" }));
  };

  const togglePlayer = (player: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(player) ? prev.filter((p) => p !== player) : [...prev, player]
    );
  };

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name || players.includes(name)) return;
    setPlayers([...players, name]);
    setNewPlayerName("");
  };

  const removePlayer = (player: string) => {
    setPlayers((prev) => prev.filter((p) => p !== player));
    setSelectedPlayers((prev) => prev.filter((p) => p !== player));
    if (receiver === player) setReceiver("");
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const updated = { ...playerQRs, [uploadingFor]: base64 };
      setPlayerQRs(updated);
      localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeQR = (name: string) => {
    const updated = { ...playerQRs };
    delete updated[name];
    setPlayerQRs(updated);
    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(updated));
  };

  const triggerUpload = (name: string) => {
    setUploadingFor(name);
    fileInputRef.current?.click();
  };

  const shuttleFee = Number(shuttleQty || 0) * shuttlePrice;
  const total = Number(courtFee || 0) + shuttleFee + Number(otherFee || 0);
  const n = selectedPlayers.length;

  const maleCount = genderMode ? selectedPlayers.filter((p) => getGender(p) === "nam").length : 0;
  const femalePay = n > 0 ? Math.ceil((total - maleCount * 10000) / n) : 0;
  const malePay = genderMode ? femalePay + 10000 : femalePay;
  const perPerson = (name: string) =>
    genderMode && getGender(name) === "nam" ? malePay : femalePay;

  const buildText = () => {
    const today = new Date().toLocaleDateString("vi-VN", {
      weekday: "long", day: "2-digit", month: "2-digit",
    });
    let text = `🏸 TÍNH TIỀN CẦU LÔNG NGÀY ${today}\n`;
    text += `Tổng: ${formatK(total)}\n`;
    if (genderMode) {
      text += `Nam: ${formatK(malePay)} / Nữ: ${formatK(femalePay)}\n\n`;
    } else {
      text += `${n} người: mỗi người ${formatK(femalePay)}\n\n`;
    }
    text += `Danh sách:\n`;
    selectedPlayers.forEach((p) => { text += `- ${p}: ${formatK(perPerson(p))}\n`; });
    if (receiver) text += `\nChuyển khoản cho: ${receiver}`;
    return text;
  };

  const copyToClipboard = async () => {
    if (n === 0) { alert("Chưa chọn người chơi."); return; }
    const text = buildText();

    // Nếu có QR và trình duyệt hỗ trợ Web Share với file → share cả text + ảnh
    if (receiverQR && typeof navigator.share === "function") {
      try {
        const blob = await fetch(receiverQR).then((r) => r.blob());
        const file = new File([blob], "qr.png", { type: blob.type });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ text, files: [file] });
          return;
        }
      } catch {
        // share bị cancel hoặc không hỗ trợ → fallback
      }
    }

    // Fallback: chỉ copy text
    await navigator.clipboard.writeText(text);
    alert("Đã copy!");
  };

  const receiverQR = receiver ? playerQRs[receiver] : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">🏸 Tính tiền cầu lông</h1>

        {/* Player selection */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Chọn người chơi</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={genderMode}
                onChange={(e) => setGenderMode(e.target.checked)}
              />
              Chênh 10k Nam/Nữ
            </label>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {players.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(p)}
                    onChange={() => togglePlayer(p)}
                  />
                  {p}
                </label>
                {genderMode && (
                  <button
                    onClick={() => toggleGender(p)}
                    className={`text-xs px-1.5 py-0.5 rounded font-medium border ${
                      getGender(p) === "nam"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-pink-50 text-pink-500 border-pink-200"
                    }`}
                  >
                    {getGender(p) === "nam" ? "Nam" : "Nữ"}
                  </button>
                )}
                <button
                  onClick={() => removePlayer(p)}
                  className="text-red-400 hover:text-red-600 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Thêm người mới..."
              className="border p-2 rounded flex-1 text-sm"
            />
            <button
              onClick={addPlayer}
              className="bg-blue-500 text-white px-3 rounded text-sm font-medium hover:bg-blue-600"
            >
              + Thêm
            </button>
          </div>

          <p className="text-sm text-gray-700 mt-2">Đã chọn: {n} người</p>
        </div>

        {/* Fees */}
        <div className="space-y-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-1 text-gray-900">Tiền sân</p>
            <div className="relative">
              <input
                type="text"
                value={formatNumber(courtFee)}
                onChange={(e) => {
                  const v = parseNumber(e.target.value);
                  setCourtFee(v);
                  localStorage.setItem("lastCourtFee", v);
                }}
                className="border p-2 rounded w-full pr-14"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">VND</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1 text-gray-900">Số lượng cầu</p>
            <input
              type="text"
              value={formatNumber(shuttleQty)}
              onChange={(e) => setShuttleQty(parseNumber(e.target.value))}
              className="border p-2 rounded w-full mb-1"
            />
            <p className="text-sm text-gray-700">
              Giá mỗi quả: {shuttlePrice.toLocaleString()} VND → Tiền cầu:{" "}
              {shuttleFee.toLocaleString()} VND
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1 text-gray-900">Chi phí khác</p>
            <div className="relative">
              <input
                type="text"
                value={formatNumber(otherFee)}
                onChange={(e) => setOtherFee(parseNumber(e.target.value))}
                className="border p-2 rounded w-full pr-14"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">VND</span>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="bg-gray-50 p-4 rounded mb-4 text-gray-900">
          <p>Tổng: <strong>{total.toLocaleString()} VND</strong></p>
          {genderMode ? (
            <>
              <p>Nam: <strong>{malePay.toLocaleString()} VND</strong></p>
              <p>Nữ: <strong>{femalePay.toLocaleString()} VND</strong></p>
            </>
          ) : (
            <p>Mỗi người: <strong>{femalePay.toLocaleString()} VND</strong></p>
          )}
        </div>

        {/* Chuyển khoản cho */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2 text-gray-900">Chuyển khoản cho</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {players.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <label className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="receiver"
                    checked={receiver === p}
                    onChange={() => setReceiver(p)}
                  />
                  {p}
                </label>
                {playerQRs[p] ? (
                  <button
                    onClick={() => removeQR(p)}
                    className="text-xs text-gray-400 hover:text-red-500"
                    title="Xoá QR"
                  >
                    🗑️
                  </button>
                ) : (
                  <button
                    onClick={() => triggerUpload(p)}
                    className="text-xs text-blue-400 hover:text-blue-600"
                    title="Tải QR lên"
                  >
                    📷
                  </button>
                )}
              </div>
            ))}
          </div>
          {receiver && (
            <button
              onClick={() => setReceiver("")}
              className="text-xs text-gray-400 hover:text-gray-600 mt-2"
            >
              Bỏ chọn
            </button>
          )}
        </div>

        {/* QR hiển thị */}
        {receiverQR && (
          <div className="mb-4 flex flex-col items-center bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              QR chuyển khoản — {receiver}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiverQR} alt={`QR ${receiver}`} className="w-48 h-48 object-contain rounded" />
          </div>
        )}

        {receiver && !receiverQR && (
          <div
            className="mb-4 flex flex-col items-center bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-300"
            onClick={() => triggerUpload(receiver)}
          >
            <p className="text-sm text-gray-400">📷 Tải ảnh QR cho {receiver}</p>
          </div>
        )}

        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleQRUpload}
        />

        <button
          onClick={copyToClipboard}
          className="w-full bg-green-500 text-white py-2 rounded-xl font-semibold hover:bg-green-600"
        >
          📋 Copy gửi nhóm
        </button>
      </div>
    </div>
  );
}
