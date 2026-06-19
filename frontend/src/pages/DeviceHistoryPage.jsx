import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import AppLayout from "../components/AppLayout";

const statusLabels = {
  GOOD: "Tốt",
  BROKEN: "Hỏng",
  REPAIRING: "Đang sửa chữa"
};

const permissionDeniedMessage = "Bạn không có quyền thực hiện thao tác này";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

function getStatusClass(status) {
  if (status === "GOOD") return "status-pill good";
  if (status === "REPAIRING") return "status-pill warning";
  return "status-pill danger";
}

export default function DeviceHistoryPage() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const [device, setDevice] = useState(null);
  const [repairLogs, setRepairLogs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const canViewRepairHistory = user?.role === "ADMIN" || user?.role === "TECHNICIAN";

  async function loadHistory() {
    if (!canViewRepairHistory) {
      setError(permissionDeniedMessage);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await api.get(`/devices/${deviceId}/repair-logs`);
      setDevice(res.data.device);
      setRepairLogs(res.data.repairLogs);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được lịch sử sửa chữa");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [deviceId, canViewRepairHistory]);

  return (
    <AppLayout
      active="devices"
      title="Lịch sử sửa chữa"
      subtitle={device ? `${device.code} - ${device.name}` : "Theo dõi các lần bảo trì và sửa chữa thiết bị"}
      user={user}
    >
      <nav className="breadcrumb history-breadcrumb">
        <Link to="/dashboard">Trang chủ</Link>
        <span>/</span>
        <Link to="/devices">Thiết bị</Link>
        <span>/</span>
        <strong>{device?.code || "Lịch sử sửa chữa"}</strong>
      </nav>

      {!canViewRepairHistory ? (
        <p className="error-message">{permissionDeniedMessage}</p>
      ) : (
        <>
          <section className="repair-summary-panel history-summary-panel">
            <div>
              <span>Thiết bị</span>
              <strong>{device ? `${device.code} - ${device.name}` : "Đang tải..."}</strong>
            </div>
            <div>
              <span>Phòng</span>
              <strong>{device?.room?.code || "..."}</strong>
            </div>
            <div>
              <span>Số lần sửa chữa</span>
              <strong>{repairLogs.length}</strong>
            </div>
          </section>

          <div className="history-actions">
            <button type="button" className="secondary-button" onClick={() => navigate("/devices")}>Quay lại</button>
            <button type="button" onClick={() => navigate(`/repair-logs/new?deviceId=${deviceId}`)}>Ghi nhận sửa chữa</button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <section className="dark-table-wrap history-table-wrap">
            <table className="admin-data-table">
            <thead>
              <tr>
                <th>Ngày sửa</th>
                <th>Nội dung sửa</th>
                <th>Kỹ thuật viên</th>
                <th>Số lượng</th>
                <th>Trạng thái sau sửa</th>
                <th>Phiếu liên quan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6">Đang tải dữ liệu...</td></tr>
              ) : repairLogs.length === 0 ? (
                <tr><td colSpan="6">Thiết bị chưa có lịch sử sửa chữa</td></tr>
              ) : repairLogs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.repairedAt)}</td>
                  <td>{log.content}</td>
                  <td>{log.technician?.fullName}</td>
                  <td>{log.quantity}</td>
                  <td><span className={getStatusClass(log.afterStatus)}>{statusLabels[log.afterStatus]}</span></td>
                  <td>{log.report ? `#${log.report.id}` : "Không có"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </section>
        </>
      )}
    </AppLayout>
  );
}
