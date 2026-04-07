"use client";
import { useState } from "react";

// helpers
const formatNumber = (value) => {
  if (!value) return "";
  return Number(value).toLocaleString();
};

const parseNumber = (value) => {
  return value.replace(/[^0-9]/g, "");
};

// format kiểu 50k, 100k
const formatK = (value) => {
  if (!value) return "0k";
  return Math.round(value / 1000) + "k";
};
export default function App() {
  // Fixed player list
  const fixedPlayers = ["Bằng", "Minh", "Thuỷ", "Thảo", "Dạ", "Vân", "Hiếu", "Xuân", "Cao"];

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [courtFee, setCourtFee] = useState("");
  const [shuttleQty, setShuttleQty] = useState("");
  const shuttlePrice = 26100; // giá cố định mỗi quả cầu
  const [otherFee, setOtherFee] = useState("");

  const togglePlayer = (player) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p !== player));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const shuttleFee = Number(shuttleQty || 0) * shuttlePrice;
  const total = Number(courtFee || 0) + shuttleFee + Number(otherFee || 0);
  const perPerson = selectedPlayers.length
    ? Math.ceil(total / selectedPlayers.length)
    : 0;

  // Generate copy text
  const generateText = () => {
    if (selectedPlayers.length === 0) return "Chưa chọn người chơi";

    const today = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    });
    let text = `🏸 TÍNH TIỀN CẦU LÔNG NGÀY ${today} \n`;
    text += `Tổng: ${formatK(total)}\n`;
    text += `${selectedPlayers.length} người: mỗi người ${formatK(perPerson)}\n\n`;
    

    text += `Danh sách:\n`;
    selectedPlayers.forEach((p) => {
      text += `- ${p}: ${formatK(perPerson)}\n`;
    });

    return text;
  };

  const copyToClipboard = () => {
    const text = generateText();
    navigator.clipboard.writeText(text);
    alert("Đã copy kết quả!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">🏸 Tính tiền cầu lông</h1>

        {/* Player selection */}
        <div className="mb-4">
          <h2 className="font-semibold mb-2 text-gray-900">Chọn người chơi</h2>
          <div className="grid grid-cols-2 gap-2">
            {fixedPlayers.map((p) => (
              <label key={p} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(p)}
                  onChange={() => togglePlayer(p)}
                />
                {p}
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Đã chọn: {selectedPlayers.length} người
          </p>
        </div>

        {/* Fees */}
        <div className="space-y-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-1 text-gray-900">Tiền sân</p>
            <div className="relative">
              <input
                type="text"
                value={formatNumber(courtFee)}
                onChange={(e) => setCourtFee(parseNumber(e.target.value))}
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
              Giá mỗi quả: {shuttlePrice.toLocaleString()} VND → Tiền cầu: {shuttleFee.toLocaleString()} VND
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
          <p>
            Tổng: <strong>{total.toLocaleString()} VND</strong>
          </p>
          <p>
            Mỗi người: <strong>{perPerson.toLocaleString()} VND</strong>
          </p>
        </div>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="w-full bg-green-500 text-white py-2 rounded-xl font-semibold"
        >
          📋 Copy gửi nhóm
        </button>
      </div>
    </div>
  );
}
