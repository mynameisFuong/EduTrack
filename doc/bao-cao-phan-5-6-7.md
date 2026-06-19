# BÁO CÁO THIẾT KẾ PHẦN 5-6-7

**Tên hệ thống:** Website quản lý cơ sở vật chất và thiết bị phòng học  
**Phạm vi báo cáo:** Thiết kế cấp cao, thiết kế chi tiết và kế hoạch triển khai  
**Công nghệ chính:** React/Vite, Express.js, Prisma ORM, PostgreSQL, JWT, bcrypt, Docker  

---

# TUẦN 5: THIẾT KẾ CẤP CAO

## 5.1. Thiết kế thành phần

### 5.1.1. Sơ đồ thành phần

Hệ thống được tổ chức theo mô hình nhiều lớp. Frontend React chịu trách nhiệm hiển thị giao diện và gọi API. Backend Express xử lý xác thực, phân quyền, kiểm tra dữ liệu đầu vào và thao tác dữ liệu thông qua Prisma. PostgreSQL lưu trữ dữ liệu nghiệp vụ gồm người dùng, phòng học, thiết bị, phiếu báo hỏng, lịch sử sửa chữa và thông báo.

```text
Presentation Layer
  LoginPage
  DashboardPage
  RoomsPage
  DeviceInventoryPage / DevicesPage / DeviceHistoryPage
  ReportCreatePage / ReportsPage
  RepairLogFormPage
  NotificationsPage
  UsersPage
        |
        v
API / Controller Layer
  AuthRoutes
  DashboardRoutes
  RoomRoutes
  RoomDeviceRoutes
  DeviceRoutes
  ReportRoutes
  RepairLogRoutes
  NotificationRoutes
  UserRoutes
  ExportRoutes
        |
        v
Business Logic Layer
  Authentication logic
  Authorization middleware
  Room validation logic
  Device validation logic
  Damage report workflow
  Repair log workflow
  Notification workflow
  Dashboard aggregation logic
  CSV export logic
        |
        v
Data Access Layer
  Prisma Client
  User model
  Room model
  Device model
  DamageReport model
  DamageReportDevice model
  RepairLog model
  Notification model
        |
        v
Database
  PostgreSQL facility_management
```

### 5.1.2. Danh mục thành phần

| Thành phần | Lớp | Trách nhiệm | Yêu cầu triển khai | Phụ thuộc |
|---|---|---|---|---|
| LoginPage | Presentation | Hiển thị form đăng nhập, gửi username/password, lưu token và thông tin người dùng vào localStorage. Điều hướng người dùng vào dashboard sau khi đăng nhập thành công. | REQ-01 | Auth API |
| AppLayout | Presentation | Cung cấp bố cục chung gồm sidebar, topbar, thông tin người dùng, nút đăng xuất và chuông thông báo. Lọc menu người dùng theo vai trò ADMIN. | REQ-02, REQ-15 | Notification API, React Router |
| DashboardPage | Presentation | Hiển thị số phòng, số thiết bị hỏng, số phiếu chờ xử lý và top phòng có nhiều thiết bị hỏng. Cho phép xuất file CSV danh sách thiết bị và lịch sử sửa chữa. | REQ-03, REQ-14 | Dashboard API, Export API |
| RoomsPage | Presentation | Quản lý danh sách phòng học, tìm kiếm phòng, thêm/sửa/xóa phòng và xem thiết bị trong từng phòng. | REQ-04 | Room API |
| DeviceInventoryPage | Presentation | Quản lý toàn bộ thiết bị, lọc theo phòng/loại/trạng thái, thêm/sửa/xóa thiết bị và mở lịch sử sửa chữa. | REQ-05, REQ-06 | Device API, Room API |
| DevicesPage | Presentation | Hiển thị thiết bị thuộc một phòng cụ thể, hỗ trợ thêm thiết bị vào phòng, sửa, xóa, đổi trạng thái. | REQ-05, REQ-06 | RoomDevice API, Device API |
| ReportCreatePage | Presentation | Cho phép người dùng chọn phòng, chọn thiết bị hỏng và nhập mô tả sự cố để tạo phiếu báo hỏng. | REQ-07 | Room API, Report API |
| ReportsPage | Presentation | Hiển thị danh sách phiếu báo hỏng cho ADMIN/TECHNICIAN, cho phép chuyển trạng thái phiếu. | REQ-08 | Report API |
| RepairLogFormPage | Presentation | Ghi nhận nội dung sửa chữa, số lượng, ngày sửa, trạng thái sau sửa và liên kết với phiếu báo hỏng nếu có. | REQ-09 | RepairLog API, DeviceHistory API |
| DeviceHistoryPage | Presentation | Hiển thị thông tin thiết bị và toàn bộ lịch sử sửa chữa của thiết bị. | REQ-10 | Device repair logs API |
| NotificationsPage | Presentation | Hiển thị thông báo theo tất cả/chưa đọc/đã đọc, đánh dấu đã đọc, đánh dấu tất cả đã đọc, ADMIN gửi thông báo hệ thống. | REQ-11, REQ-12 | Notification API |
| UsersPage | Presentation | ADMIN quản lý tài khoản, tìm kiếm, lọc vai trò, thêm/sửa người dùng, khóa/mở khóa tài khoản. | REQ-13 | User API |
| AuthRoutes | API/Controller | Xử lý đăng nhập, kiểm tra mật khẩu bằng bcrypt, phát hành JWT và trả thông tin người dùng hiện tại. Có cơ chế khóa tài khoản sau 5 lần đăng nhập sai trong 15 phút. | REQ-01, REQ-16 | Prisma User, bcrypt, jsonwebtoken |
| AuthMiddleware | Business Logic | Kiểm tra JWT từ Authorization header và kiểm tra quyền theo vai trò. Các route bảo vệ sử dụng authenticate và authorize để ngăn truy cập trái phép. | REQ-02, REQ-16 | JWT |
| RoomRoutes | API/Controller | Cung cấp API CRUD phòng học, tìm kiếm phòng và kiểm tra không xóa phòng khi còn thiết bị. | REQ-04 | Prisma Room, Prisma Device |
| DeviceRoutes | API/Controller | Cung cấp API danh sách thiết bị, lọc thiết bị, sửa/xóa thiết bị, đổi trạng thái và xem lịch sử sửa chữa. | REQ-05, REQ-06, REQ-10 | Prisma Device, RepairLog |
| RoomDeviceRoutes | API/Controller | Quản lý thiết bị trong phạm vi một phòng, gồm danh sách thiết bị của phòng và thêm thiết bị vào phòng. | REQ-05 | Prisma Room, Prisma Device |
| ReportRoutes | API/Controller | Tạo phiếu báo hỏng, cập nhật trạng thái phiếu, tự động chuyển thiết bị sang BROKEN và tạo thông báo cho ADMIN/TECHNICIAN. | REQ-07, REQ-08, REQ-11 | Prisma DamageReport, Device, Notification |
| RepairLogRoutes | API/Controller | Ghi lịch sử sửa chữa, kiểm tra thiết bị thuộc phiếu báo hỏng, cập nhật trạng thái thiết bị và trạng thái phiếu liên quan. | REQ-09 | Prisma RepairLog, Device, DamageReport |
| NotificationRoutes | API/Controller | Quản lý thông báo cá nhân, đếm thông báo chưa đọc, đánh dấu đã đọc và tạo thông báo hệ thống từ ADMIN. | REQ-11, REQ-12 | Prisma Notification, User |
| UserRoutes | API/Controller | ADMIN quản lý tài khoản, hash mật khẩu, lọc người dùng theo vai trò và trạng thái, khóa/mở tài khoản. | REQ-13 | Prisma User, bcrypt |
| DashboardRoutes | API/Controller | Tổng hợp số liệu thống kê nhanh bằng count và groupBy trên dữ liệu phòng, thiết bị, phiếu báo hỏng. | REQ-03 | Prisma Room, Device, DamageReport |
| ExportRoutes | API/Controller | Xuất CSV danh sách thiết bị và lịch sử sửa chữa, xử lý escape dữ liệu CSV và header tải file. | REQ-14 | Prisma Device, RepairLog |
| Prisma Client | Data Access | Là lớp truy cập dữ liệu chính, ánh xạ các model Prisma sang bảng PostgreSQL và thực hiện truy vấn an toàn. | Tất cả yêu cầu dữ liệu | PostgreSQL |

### 5.1.3. Ma trận trách nhiệm

| Thành phần | REQ-01 Đăng nhập | REQ-02 Phân quyền | REQ-03 Dashboard | REQ-04 Phòng | REQ-05 Thiết bị | REQ-07 Báo hỏng | REQ-09 Sửa chữa | REQ-11 Thông báo | REQ-13 Người dùng | REQ-14 Xuất CSV |
|---|---|---|---|---|---|---|---|---|---|---|
| LoginPage/AuthRoutes | X |  |  |  |  |  |  |  |  |  |
| AuthMiddleware |  | X |  |  |  |  |  |  |  |  |
| DashboardPage/DashboardRoutes |  | X | X |  |  |  |  |  |  |  |
| RoomsPage/RoomRoutes |  | X |  | X |  |  |  |  |  |  |
| Device pages/DeviceRoutes |  | X |  |  | X |  | X |  |  |  |
| Report pages/ReportRoutes |  | X |  |  | X | X |  | X |  |  |
| RepairLogFormPage/RepairLogRoutes |  | X |  |  | X |  | X | X |  |  |
| NotificationsPage/NotificationRoutes |  | X |  |  |  |  |  | X |  |  |
| UsersPage/UserRoutes |  | X |  |  |  |  |  |  | X |  |
| ExportRoutes |  | X |  |  | X |  | X |  |  | X |

## 5.2. Thiết kế API

### 5.2.1. Tổng quan API

| Mục | Nội dung |
|---|---|
| Base URL phát triển | `http://localhost:5000/api` |
| Base URL frontend dùng | `import.meta.env.VITE_API_URL` hoặc mặc định `http://localhost:5000/api` |
| Định dạng dữ liệu | JSON cho API nghiệp vụ, CSV cho API export |
| Xác thực | JWT Bearer Token |
| Header xác thực | `Authorization: Bearer <token>` |
| Vai trò | ADMIN, TECHNICIAN, REPORTER |
| Mã thành công | 200 OK, 201 Created |
| Mã lỗi phổ biến | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error |

### 5.2.2. Endpoint xác thực

#### POST `/api/auth/login`

Mô tả: Đăng nhập bằng username và password. Nếu sai mật khẩu 5 lần, tài khoản bị khóa 15 phút.

Yêu cầu:

```json
{
  "username": "admin",
  "password": "123456"
}
```

Phản hồi 200:

```json
{
  "message": "Đăng nhập thành công",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "fullName": "Quản trị viên CSVC",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

Lỗi: 400 thiếu thông tin, 401 sai thông tin đăng nhập, 403 tài khoản bị khóa, 500 lỗi server.

#### GET `/api/auth/me`

Mô tả: Lấy thông tin người dùng hiện tại từ JWT.

Phản hồi 200:

```json
{
  "id": 1,
  "fullName": "Quản trị viên CSVC",
  "username": "admin",
  "role": "ADMIN"
}
```

### 5.2.3. Endpoint phòng học

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/rooms?search=P101` | ADMIN, TECHNICIAN, REPORTER | Lấy danh sách phòng, có thể tìm theo mã phòng |
| POST | `/api/rooms` | ADMIN | Tạo phòng học mới |
| PUT | `/api/rooms/{id}` | ADMIN | Cập nhật phòng học |
| DELETE | `/api/rooms/{id}` | ADMIN | Xóa phòng nếu phòng không còn thiết bị |

Ví dụ tạo phòng:

```json
{
  "code": "P301",
  "type": "THEORY",
  "capacity": 60,
  "status": "ACTIVE"
}
```

Phản hồi 201:

```json
{
  "id": 9,
  "code": "P301",
  "type": "THEORY",
  "capacity": 60,
  "status": "ACTIVE",
  "createdAt": "2026-06-16T10:00:00.000Z",
  "updatedAt": "2026-06-16T10:00:00.000Z"
}
```

### 5.2.4. Endpoint thiết bị

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/devices?search=&type=&status=&roomId=` | ADMIN, TECHNICIAN, REPORTER | Lấy danh sách thiết bị, hỗ trợ lọc |
| GET | `/api/rooms/{roomId}/devices?search=` | ADMIN, TECHNICIAN, REPORTER | Lấy thiết bị thuộc một phòng |
| POST | `/api/rooms/{roomId}/devices` | ADMIN | Thêm thiết bị vào phòng |
| PUT | `/api/devices/{id}` | ADMIN | Cập nhật thông tin thiết bị |
| PATCH | `/api/devices/{id}/status` | ADMIN, TECHNICIAN | Cập nhật trạng thái thiết bị |
| DELETE | `/api/devices/{id}` | ADMIN | Xóa thiết bị nếu chưa bị ràng buộc bởi báo hỏng/sửa chữa |
| GET | `/api/devices/{id}/repair-logs` | ADMIN, TECHNICIAN | Xem lịch sử sửa chữa thiết bị |

Ví dụ thêm thiết bị:

```json
{
  "code": "MC-P301-01",
  "name": "Máy chiếu P301",
  "type": "PROJECTOR",
  "status": "GOOD",
  "importedAt": "2026-06-16"
}
```

Các giá trị hợp lệ:

```text
DeviceType: PROJECTOR, TV, AIR_CONDITIONER, COMPUTER, SPEAKER, TABLE_CHAIR, OTHER
DeviceStatus: GOOD, BROKEN, REPAIRING
```

### 5.2.5. Endpoint phiếu báo hỏng

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/reports` | Người dùng đã đăng nhập | Tạo phiếu báo hỏng |
| GET | `/api/reports` | ADMIN, TECHNICIAN | Xem danh sách phiếu báo hỏng |
| PATCH | `/api/reports/{id}/status` | ADMIN, TECHNICIAN | Cập nhật trạng thái phiếu |

Ví dụ tạo phiếu báo hỏng:

```json
{
  "roomId": 1,
  "deviceIds": [1, 2],
  "description": "Máy chiếu không lên hình và TV không nhận tín hiệu."
}
```

Phản hồi 201 gồm thông tin người báo, phòng, danh sách thiết bị. Khi tạo phiếu thành công, hệ thống tự động:

- Tạo bản ghi `DamageReport`.
- Tạo các bản ghi liên kết trong `DamageReportDevice`.
- Chuyển trạng thái thiết bị liên quan sang `BROKEN`.
- Tạo thông báo cho người dùng có vai trò ADMIN và TECHNICIAN.

### 5.2.6. Endpoint sửa chữa

#### POST `/api/repair-logs`

Quyền: ADMIN, TECHNICIAN.

Yêu cầu:

```json
{
  "deviceId": 1,
  "reportId": 1,
  "quantity": 1,
  "repairedAt": "2026-06-16",
  "content": "Thay cáp HDMI và kiểm tra lại tín hiệu.",
  "afterStatus": "GOOD"
}
```

Phản hồi 201: bản ghi lịch sử sửa chữa kèm thiết bị, phiếu liên quan và kỹ thuật viên. Nếu `afterStatus` là `GOOD`, phiếu liên quan chuyển sang `COMPLETED`; nếu không, phiếu chuyển sang `IN_PROGRESS`.

### 5.2.7. Endpoint thông báo

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/notifications?filter=all|unread|read` | Người dùng đã đăng nhập | Lấy thông báo cá nhân |
| GET | `/api/notifications/unread-count` | Người dùng đã đăng nhập | Đếm thông báo chưa đọc |
| POST | `/api/notifications/admin` | ADMIN | Gửi thông báo hệ thống |
| PATCH | `/api/notifications/{id}/read` | Người dùng đã đăng nhập | Đánh dấu một thông báo đã đọc |
| PATCH | `/api/notifications/mark-all-read` | Người dùng đã đăng nhập | Đánh dấu tất cả thông báo đã đọc |

### 5.2.8. Endpoint người dùng

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/users?search=&role=` | ADMIN | Lấy danh sách người dùng |
| POST | `/api/users` | ADMIN | Tạo người dùng |
| PUT | `/api/users/{id}` | ADMIN | Cập nhật người dùng |
| PATCH | `/api/users/{id}/status` | ADMIN | Khóa/mở khóa tài khoản |

Ví dụ tạo người dùng:

```json
{
  "fullName": "Nguyễn Văn A",
  "username": "nva",
  "password": "123456",
  "role": "TECHNICIAN",
  "status": "ACTIVE"
}
```

### 5.2.9. Endpoint dashboard và export

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/dashboard/stats` | ADMIN, TECHNICIAN, REPORTER | Lấy số liệu tổng quan |
| GET | `/api/export/devices` | ADMIN, TECHNICIAN | Xuất CSV danh sách thiết bị |
| GET | `/api/export/repair-logs` | ADMIN, TECHNICIAN | Xuất CSV lịch sử sửa chữa |

Phản hồi dashboard:

```json
{
  "totalRooms": 8,
  "brokenDevices": 6,
  "pendingReports": 1,
  "topBrokenRooms": [
    {
      "roomId": 1,
      "roomCode": "P101",
      "roomType": "THEORY",
      "brokenCount": 2
    }
  ]
}
```

## 5.3. Kiến trúc dữ liệu vật lý

### 5.3.1. Tổng quan CSDL

| Mục | Nội dung |
|---|---|
| Hệ quản trị CSDL | PostgreSQL 16 |
| ORM | Prisma Client |
| Database | `facility_management` |
| Quy ước bảng | Prisma model dạng PascalCase, khi ánh xạ vật lý có thể hiểu tương ứng bảng users, rooms, devices, damage_reports, repair_logs, notifications |
| Kiểu khóa chính | Integer tự tăng |
| Quan hệ chính | User - DamageReport, Room - Device, DamageReport - Device, Device - RepairLog, User - Notification |

### 5.3.2. ERD vật lý dạng văn bản

```text
User (1) ------ (N) DamageReport
User (1) ------ (N) RepairLog
User (1) ------ (N) Notification as recipient
User (1) ------ (N) Notification as actor

Room (1) ------ (N) Device
Room (1) ------ (N) DamageReport

DamageReport (N) ------ (N) Device
  thông qua DamageReportDevice(reportId, deviceId)

DamageReport (1) ------ (N) RepairLog
DamageReport (1) ------ (N) Notification
Device (1) ------ (N) RepairLog
```

### 5.3.3. Đặc tả bảng

#### Bảng `users`

Mục đích: Lưu tài khoản đăng nhập, vai trò và trạng thái khóa tài khoản.

| Cột | Kiểu dữ liệu | Null | Default | Ràng buộc |
|---|---|---|---|---|
| id | INTEGER | NOT NULL | autoincrement | PK |
| fullName | TEXT/VARCHAR | NOT NULL |  |  |
| username | TEXT/VARCHAR | NOT NULL |  | UNIQUE |
| passwordHash | TEXT/VARCHAR | NOT NULL |  | Lưu hash bcrypt |
| role | Role enum | NOT NULL |  | ADMIN/TECHNICIAN/REPORTER |
| status | UserStatus enum | NOT NULL | ACTIVE | ACTIVE/LOCKED |
| failedLoginCount | INTEGER | NOT NULL | 0 | >= 0 |
| lockedUntil | TIMESTAMP | NULL |  | Thời điểm mở khóa |
| createdAt | TIMESTAMP | NOT NULL | now() |  |

Chỉ mục: unique index trên `username`; index đề xuất trên `role`, `status`.

#### Bảng `rooms`

Mục đích: Lưu danh sách phòng học/phòng thực hành.

| Cột | Kiểu dữ liệu | Null | Default | Ràng buộc |
|---|---|---|---|---|
| id | INTEGER | NOT NULL | autoincrement | PK |
| code | TEXT/VARCHAR | NOT NULL |  | UNIQUE |
| type | RoomType enum | NOT NULL |  | THEORY/COMPUTER_LAB/LAB |
| capacity | INTEGER | NOT NULL |  | > 0 |
| status | RoomStatus enum | NOT NULL | ACTIVE | ACTIVE/MAINTENANCE |
| createdAt | TIMESTAMP | NOT NULL | now() |  |
| updatedAt | TIMESTAMP | NOT NULL | updatedAt |  |

Chỉ mục: unique index trên `code`; index đề xuất trên `type`, `status`.

#### Bảng `devices`

Mục đích: Lưu thiết bị được gắn với từng phòng.

| Cột | Kiểu dữ liệu | Null | Default | Ràng buộc |
|---|---|---|---|---|
| id | INTEGER | NOT NULL | autoincrement | PK |
| code | TEXT/VARCHAR | NOT NULL |  | UNIQUE |
| name | TEXT/VARCHAR | NOT NULL |  |  |
| type | DeviceType enum | NOT NULL |  | PROJECTOR/TV/AIR_CONDITIONER/COMPUTER/SPEAKER/TABLE_CHAIR/OTHER |
| status | DeviceStatus enum | NOT NULL | GOOD | GOOD/BROKEN/REPAIRING |
| importedAt | TIMESTAMP | NOT NULL | now() |  |
| roomId | INTEGER | NOT NULL |  | FK -> rooms.id, onDelete Restrict |
| createdAt | TIMESTAMP | NOT NULL | now() |  |
| updatedAt | TIMESTAMP | NOT NULL | updatedAt |  |

Chỉ mục: unique index trên `code`; index đề xuất trên `roomId`, `type`, `status`.

#### Bảng `damage_reports`

Mục đích: Lưu phiếu báo hỏng do người dùng tạo.

| Cột | Kiểu dữ liệu | Null | Default | Ràng buộc |
|---|---|---|---|---|
| id | INTEGER | NOT NULL | autoincrement | PK |
| reporterId | INTEGER | NOT NULL |  | FK -> users.id, onDelete Restrict |
| roomId | INTEGER | NOT NULL |  | FK -> rooms.id, onDelete Restrict |
| description | TEXT | NOT NULL |  |  |
| status | ReportStatus enum | NOT NULL | PENDING | PENDING/IN_PROGRESS/COMPLETED |
| createdAt | TIMESTAMP | NOT NULL | now() |  |
| updatedAt | TIMESTAMP | NOT NULL | updatedAt |  |

Chỉ mục: index đề xuất trên `reporterId`, `roomId`, `status`, `createdAt`.

#### Bảng `damage_report_devices`

Mục đích: Bảng trung gian thể hiện một phiếu báo hỏng có thể liên quan nhiều thiết bị.

| Cột | Kiểu dữ liệu | Null | Default | Ràng buộc |
|---|---|---|---|---|
| reportId | INTEGER | NOT NULL |  | FK -> damage_reports.id, onDelete Cascade |
| deviceId | INTEGER | NOT NULL |  | FK -> devices.id, onDelete Restrict |

Khóa chính: `(reportId, deviceId)`.

#### Bảng `repair_logs`

Mục đích: Lưu lịch sử sửa chữa thiết bị.

| Cột | Kiểu dữ liệu | Null | Default | Ràng buộc |
|---|---|---|---|---|
| id | INTEGER | NOT NULL | autoincrement | PK |
| deviceId | INTEGER | NOT NULL |  | FK -> devices.id |
| reportId | INTEGER | NULL |  | FK -> damage_reports.id, onDelete SetNull |
| technicianId | INTEGER | NOT NULL |  | FK -> users.id |
| quantity | INTEGER | NOT NULL | 1 | > 0 |
| repairedAt | TIMESTAMP | NOT NULL |  |  |
| content | TEXT | NOT NULL |  |  |
| afterStatus | DeviceStatus enum | NOT NULL |  | GOOD/BROKEN/REPAIRING |
| createdAt | TIMESTAMP | NOT NULL | now() |  |

Chỉ mục: index đề xuất trên `deviceId`, `reportId`, `technicianId`, `repairedAt`.

#### Bảng `notifications`

Mục đích: Lưu thông báo cá nhân, thông báo phiếu báo hỏng, thông báo cập nhật sửa chữa và thông báo hệ thống.

| Cột | Kiểu dữ liệu | Null | Default | Ràng buộc |
|---|---|---|---|---|
| id | INTEGER | NOT NULL | autoincrement | PK |
| type | NotificationType enum | NOT NULL |  | DAMAGE_REPORT/ADMIN_ANNOUNCEMENT/REPAIR_UPDATE |
| title | TEXT/VARCHAR | NOT NULL |  |  |
| message | TEXT | NOT NULL |  |  |
| isRead | BOOLEAN | NOT NULL | false |  |
| recipientId | INTEGER | NULL |  | FK -> users.id, onDelete Cascade |
| actorId | INTEGER | NULL |  | FK -> users.id, onDelete SetNull |
| reportId | INTEGER | NULL |  | FK -> damage_reports.id, onDelete Cascade |
| createdAt | TIMESTAMP | NOT NULL | now() |  |
| updatedAt | TIMESTAMP | NOT NULL | updatedAt |  |

Chỉ mục: index đề xuất trên `recipientId`, `isRead`, `createdAt`, `reportId`.

### 5.3.4. Ràng buộc và chỉ mục đề xuất

| Bảng | Ràng buộc/chỉ mục | Mục đích |
|---|---|---|
| users | UNIQUE(username) | Không trùng tài khoản |
| users | INDEX(role, status) | Lọc người dùng trong trang quản trị |
| rooms | UNIQUE(code) | Không trùng mã phòng |
| rooms | CHECK(capacity > 0) | Sức chứa hợp lệ |
| devices | UNIQUE(code) | Không trùng mã thiết bị |
| devices | INDEX(roomId), INDEX(status), INDEX(type) | Lọc thiết bị nhanh |
| damage_reports | INDEX(status), INDEX(createdAt DESC) | Lọc và sắp xếp phiếu |
| damage_report_devices | PK(reportId, deviceId) | Tránh trùng thiết bị trong cùng phiếu |
| repair_logs | INDEX(deviceId), INDEX(repairedAt DESC) | Xem lịch sử sửa chữa theo thiết bị |
| notifications | INDEX(recipientId, isRead) | Đếm và lọc thông báo chưa đọc |

## 5.4. Thiết kế bảo mật

### 5.4.1. Xác thực

Hệ thống sử dụng cơ chế đăng nhập bằng username/password. Password không lưu trực tiếp mà được hash bằng bcrypt. Sau khi đăng nhập thành công, backend cấp JWT có thời hạn 30 phút. Frontend lưu token trong localStorage và tự động gắn vào header `Authorization`.

Quy trình:

1. Người dùng nhập username/password.
2. Backend tìm người dùng theo username.
3. Nếu tài khoản đang bị khóa và `lockedUntil` chưa hết hạn, trả 403.
4. Backend so sánh mật khẩu bằng bcrypt.
5. Nếu sai 5 lần, tài khoản bị khóa 15 phút.
6. Nếu đúng, backend reset số lần sai và phát hành JWT.

### 5.4.2. Ủy quyền

| Vai trò | Quyền chính |
|---|---|
| ADMIN | Toàn quyền quản lý phòng, thiết bị, người dùng, phiếu báo hỏng, thông báo, xuất CSV |
| TECHNICIAN | Xem phòng/thiết bị, xử lý phiếu báo hỏng, ghi lịch sử sửa chữa, xem lịch sử và xuất CSV |
| REPORTER | Xem dashboard/phòng/thiết bị cơ bản, tạo phiếu báo hỏng, nhận thông báo |

Mỗi API được bảo vệ bằng middleware:

- `authenticate`: kiểm tra token.
- `authorize(...roles)`: kiểm tra vai trò có được phép truy cập route hay không.

### 5.4.3. Bảo vệ dữ liệu

| Dữ liệu nhạy cảm | Cách bảo vệ |
|---|---|
| Mật khẩu | Hash bằng bcrypt, không trả về frontend |
| JWT | Có thời hạn 30 phút, gửi qua Authorization header |
| Thông tin người dùng | API user chỉ trả các trường cần thiết, không trả passwordHash |
| Dữ liệu phiếu/sửa chữa | Chỉ ADMIN/TECHNICIAN được xem toàn bộ phiếu và lịch sử |
| Log hệ thống | Không ghi mật khẩu, token hoặc dữ liệu nhạy cảm vào log |

### 5.4.4. Điều khiển bảo mật cơ bản

- Kiểm tra dữ liệu đầu vào cho mã phòng, mã thiết bị, loại thiết bị, trạng thái, sức chứa, ngày nhập, ngày sửa.
- Prisma ORM giúp giảm nguy cơ SQL injection do truy vấn không ghép chuỗi SQL thủ công.
- CORS giới hạn origin được phép, bao gồm localhost và domain Vercel.
- Các thao tác ghi dữ liệu quan trọng yêu cầu vai trò phù hợp.
- Cơ chế khóa tài khoản sau 5 lần đăng nhập sai làm giảm rủi ro brute force.
- Khi triển khai thật cần dùng HTTPS để bảo vệ token và dữ liệu truyền qua mạng.

---

# TUẦN 6: THIẾT KẾ CHI TIẾT

## 6.1. Thiết kế lớp

### 6.1.1. Danh sách lớp/mô-đun

Trong project hiện tại, backend được tổ chức theo Express routes và Prisma model. Với tài liệu thiết kế lớp, có thể mô tả các route hiện có như controller và các logic nghiệp vụ bên trong route như service/validator tương ứng.

| Nhóm | Lớp/mô-đun |
|---|---|
| Entity/Model | User, Room, Device, DamageReport, DamageReportDevice, RepairLog, Notification |
| Controller | AuthController, RoomController, RoomDeviceController, DeviceController, ReportController, RepairLogController, NotificationController, UserController, DashboardController, ExportController |
| Service/Business | AuthService, RoomService, DeviceService, ReportService, RepairLogService, NotificationService, UserService, DashboardService, ExportService |
| Middleware | AuthMiddleware, RoleAuthorizationMiddleware |
| DTO | LoginRequest, LoginResponse, RoomRequest, DeviceRequest, CreateReportRequest, UpdateReportStatusRequest, CreateRepairLogRequest, NotificationResponse, UserRequest |

### 6.1.2. Cấu trúc lớp chính

#### User

Thuộc tính: `id`, `fullName`, `username`, `passwordHash`, `role`, `status`, `failedLoginCount`, `lockedUntil`, `createdAt`.

Phương thức nghiệp vụ đề xuất:

- `isLocked(now): boolean`
- `canUnlock(now): boolean`
- `recordFailedLogin(): void`
- `resetLoginFailures(): void`

#### Room

Thuộc tính: `id`, `code`, `type`, `capacity`, `status`, `createdAt`, `updatedAt`.

Phương thức nghiệp vụ đề xuất:

- `normalizeCode(): string`
- `validateCapacity(): boolean`
- `canDelete(deviceCount): boolean`

#### Device

Thuộc tính: `id`, `code`, `name`, `type`, `status`, `importedAt`, `roomId`, `createdAt`, `updatedAt`.

Phương thức nghiệp vụ đề xuất:

- `markBroken(): void`
- `changeStatus(status): void`
- `isRepairable(): boolean`

#### DamageReport

Thuộc tính: `id`, `reporterId`, `roomId`, `description`, `status`, `createdAt`, `updatedAt`.

Phương thức nghiệp vụ đề xuất:

- `canChangeStatus(status): boolean`
- `markInProgress(): void`
- `markCompleted(): void`

#### RepairLog

Thuộc tính: `id`, `deviceId`, `reportId`, `technicianId`, `quantity`, `repairedAt`, `content`, `afterStatus`, `createdAt`.

Phương thức nghiệp vụ đề xuất:

- `validateQuantity(): boolean`
- `resolveReportStatus(): ReportStatus`

#### AuthController/AuthService

Phương thức:

- `login(username, password): LoginResponse`
- `getCurrentUser(userId): User`
- `verifyPassword(password, passwordHash): boolean`
- `generateToken(user): string`
- `handleFailedLogin(user): void`

#### ReportController/ReportService

Phương thức:

- `createReport(reporterId, roomId, deviceIds, description): DamageReport`
- `validateDevicesInRoom(roomId, deviceIds): boolean`
- `updateReportStatus(reportId, status, actorId): DamageReport`
- `createReportNotifications(report, actorId): void`
- `createStatusNotification(report, actorId, status): void`

#### RepairLogController/RepairLogService

Phương thức:

- `createRepairLog(payload, technicianId): RepairLog`
- `validateReportDevice(reportId, deviceId): boolean`
- `updateDeviceStatus(deviceId, afterStatus): Device`
- `updateRelatedReport(reportId, afterStatus): DamageReport`

### 6.1.3. Quan hệ lớp

```text
AuthController -> AuthService -> User model -> PostgreSQL
RoomController -> RoomService -> Room model, Device model -> PostgreSQL
DeviceController -> DeviceService -> Device model, RepairLog model -> PostgreSQL
ReportController -> ReportService -> DamageReport, DamageReportDevice, Device, Notification -> PostgreSQL
RepairLogController -> RepairLogService -> RepairLog, Device, DamageReport -> PostgreSQL
NotificationController -> NotificationService -> Notification, User -> PostgreSQL
UserController -> UserService -> User model -> PostgreSQL
DashboardController -> DashboardService -> Room, Device, DamageReport -> PostgreSQL
ExportController -> ExportService -> Device, RepairLog -> CSV response
```

## 6.2. Thiết kế trình tự

### 6.2.1. Đăng nhập

```text
User -> LoginPage: nhập username/password
LoginPage -> POST /api/auth/login: gửi thông tin đăng nhập
AuthRoutes -> User table: tìm username
AuthRoutes -> bcrypt: so sánh password
AuthRoutes -> JWT: tạo token 30 phút
AuthRoutes -> LoginPage: trả token và user
LoginPage -> localStorage: lưu token, user
LoginPage -> DashboardPage: điều hướng
```

### 6.2.2. Tạo phiếu báo hỏng

```text
Reporter -> ReportCreatePage: chọn phòng, thiết bị, nhập mô tả
ReportCreatePage -> GET /api/rooms: tải phòng
ReportCreatePage -> GET /api/rooms/{roomId}/devices: tải thiết bị
ReportCreatePage -> POST /api/reports: gửi roomId, deviceIds, description
ReportRoutes -> Room table: kiểm tra phòng tồn tại
ReportRoutes -> Device table: kiểm tra thiết bị thuộc phòng
ReportRoutes -> Transaction:
  tạo DamageReport
  tạo DamageReportDevice
  cập nhật Device.status = BROKEN
  tạo Notification cho ADMIN/TECHNICIAN
ReportRoutes -> ReportCreatePage: trả phiếu mới
```

### 6.2.3. Ghi lịch sử sửa chữa

```text
Technician -> RepairLogFormPage: nhập nội dung sửa chữa
RepairLogFormPage -> POST /api/repair-logs: gửi deviceId, reportId, content, afterStatus
RepairLogRoutes -> Device table: kiểm tra thiết bị tồn tại
RepairLogRoutes -> DamageReportDevice: kiểm tra thiết bị thuộc phiếu nếu có reportId
RepairLogRoutes -> Transaction:
  tạo RepairLog
  cập nhật Device.status = afterStatus
  nếu reportId tồn tại:
    afterStatus GOOD -> DamageReport.status = COMPLETED
    ngược lại -> DamageReport.status = IN_PROGRESS
RepairLogRoutes -> RepairLogFormPage: trả bản ghi sửa chữa
```

### 6.2.4. Quản lý thông báo

```text
User -> NotificationsPage: mở trung tâm thông báo
NotificationsPage -> GET /api/notifications?filter=unread: tải thông báo
NotificationRoutes -> Notification table: lọc theo recipientId và isRead
NotificationRoutes -> NotificationsPage: trả danh sách và số lượng
User -> NotificationsPage: chọn đánh dấu đã đọc
NotificationsPage -> PATCH /api/notifications/{id}/read
NotificationRoutes -> Notification table: kiểm tra notification thuộc user
NotificationRoutes -> Notification table: cập nhật isRead = true
```

## 6.3. Mockups UI độ trung thực cao

### 6.3.1. Hệ thống thiết kế

| Thành phần | Đặc tả |
|---|---|
| Màu thương hiệu | Đỏ PTIT `#b0002a`, đỏ đậm `#8f0021`, nền đỏ nhạt `#fff1f4` |
| Màu trạng thái | Xanh `#059669`, đỏ lỗi `#dc2626`, vàng cảnh báo dùng cho trạng thái đang sửa |
| Nền | `#f7f8fb` cho trang, `#ffffff` cho panel/card |
| Font | Inter, system-ui, Segoe UI, Arial |
| Border radius | Chủ yếu 8px-12px |
| Spacing | 8px, 10px, 12px, 14px, 16px, 18px, 24px |
| Thành phần chính | Sidebar, topbar, form, modal, table, status pill, notification tab, action menu |

### 6.3.2. Mockup màn hình chính

| Màn hình | Thành phần giao diện | Chức năng |
|---|---|---|
| Đăng nhập | Panel thương hiệu PTIT, form username/password, checkbox ghi nhớ, nút đăng nhập | Xác thực người dùng |
| Dashboard | Sidebar, các thẻ thống kê, bảng top phòng có thiết bị hỏng, nút export | Theo dõi nhanh tình trạng CSVC |
| Quản lý phòng | Tìm kiếm, lưới card phòng, modal thêm/sửa, nút xem thiết bị | Quản lý phòng học |
| Danh sách thiết bị | Bộ lọc tìm kiếm/loại/trạng thái/phòng, bảng thiết bị, menu hành động | Quản lý tài sản thiết bị |
| Tạo phiếu báo hỏng | Dropdown phòng, danh sách thiết bị, ô mô tả sự cố | Gửi báo hỏng |
| Phiếu báo hỏng | Bảng phiếu, chi tiết thiết bị, chọn trạng thái | Theo dõi xử lý sự cố |
| Ghi sửa chữa | Thông tin thiết bị, form ngày sửa/nội dung/trạng thái sau sửa | Lưu lịch sử sửa chữa |
| Thông báo | Tabs tất cả/chưa đọc/đã đọc, chi tiết thông báo, nút đánh dấu đã đọc | Nhận và quản lý thông báo |
| Người dùng | Bộ lọc vai trò, bảng user, modal tạo/sửa, khóa/mở khóa | Quản trị tài khoản |

### 6.3.3. Thư viện thành phần

- `AppLayout`: bố cục ứng dụng sau đăng nhập.
- `ProtectedRoute`: chặn truy cập khi chưa có token.
- Status pill: hiển thị GOOD/BROKEN/REPAIRING, ACTIVE/MAINTENANCE, PENDING/IN_PROGRESS/COMPLETED.
- Modal form: dùng cho thêm/sửa phòng, thiết bị, người dùng.
- Action menu: gom các thao tác sửa, xóa, xem lịch sử, ghi sửa chữa.
- Notification bell: hiển thị số thông báo chưa đọc.

## 6.4. Chi tiết thiết kế cơ sở dữ liệu

### 6.4.1. Tập lệnh tạo bảng rút gọn

Project hiện tại dùng Prisma migration. Dưới đây là DDL tham khảo tương ứng với schema Prisma.

```sql
CREATE TYPE role AS ENUM ('ADMIN', 'TECHNICIAN', 'REPORTER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'LOCKED');
CREATE TYPE room_type AS ENUM ('THEORY', 'COMPUTER_LAB', 'LAB');
CREATE TYPE room_status AS ENUM ('ACTIVE', 'MAINTENANCE');
CREATE TYPE device_type AS ENUM ('PROJECTOR', 'TV', 'AIR_CONDITIONER', 'COMPUTER', 'SPEAKER', 'TABLE_CHAIR', 'OTHER');
CREATE TYPE device_status AS ENUM ('GOOD', 'BROKEN', 'REPAIRING');
CREATE TYPE report_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE notification_type AS ENUM ('DAMAGE_REPORT', 'ADMIN_ANNOUNCEMENT', 'REPAIR_UPDATE');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role role NOT NULL,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type room_type NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status room_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type device_type NOT NULL,
  status device_status NOT NULL DEFAULT 'GOOD',
  imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE damage_reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE damage_report_devices (
  report_id INTEGER NOT NULL REFERENCES damage_reports(id) ON DELETE CASCADE,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
  PRIMARY KEY (report_id, device_id)
);

CREATE TABLE repair_logs (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
  report_id INTEGER NULL REFERENCES damage_reports(id) ON DELETE SET NULL,
  technician_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  repaired_at TIMESTAMP NOT NULL,
  content TEXT NOT NULL,
  after_status device_status NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  recipient_id INTEGER NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  report_id INTEGER NULL REFERENCES damage_reports(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 6.4.2. Tập lệnh tạo chỉ mục

```sql
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_rooms_type_status ON rooms(type, status);
CREATE INDEX idx_devices_room ON devices(room_id);
CREATE INDEX idx_devices_type_status ON devices(type, status);
CREATE INDEX idx_damage_reports_status_created ON damage_reports(status, created_at DESC);
CREATE INDEX idx_damage_reports_reporter ON damage_reports(reporter_id);
CREATE INDEX idx_repair_logs_device_date ON repair_logs(device_id, repaired_at DESC);
CREATE INDEX idx_repair_logs_report ON repair_logs(report_id);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 6.4.3. Dữ liệu tham chiếu

Dữ liệu tham chiếu được định nghĩa bằng enum trong Prisma. Dữ liệu mẫu được tạo qua `backend/prisma/seed.js`, gồm:

- Tài khoản demo: `admin`, `tech`, `reporter`, mật khẩu mặc định `123456`.
- Phòng học demo: P101, P102, LAB01, P201, P202, LAB02, LAB-HOA, LAB-LY.
- Thiết bị demo: máy chiếu, TV, điều hòa, máy tính, loa, bàn ghế, thiết bị khác.
- Phiếu báo hỏng và lịch sử sửa chữa mẫu.
- Thông báo mẫu cho admin, kỹ thuật viên và người báo hỏng.

### 6.4.4. Cách chạy migration/seed

```bash
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Hoặc chạy bằng Docker:

```bash
docker compose up -d postgres
docker compose --profile seed up seed
docker compose up -d backend frontend
```

---

# TUẦN 7: LẬP KẾ HOẠCH TRIỂN KHAI

## 7.1. Thiết kế thuật toán

### 7.1.1. Thuật toán đăng nhập và khóa tài khoản

Mục đích: Ngăn dò mật khẩu bằng cách khóa tài khoản sau 5 lần đăng nhập sai.

Lớp/phương thức: `AuthService.login` tương ứng logic trong `auth.routes.js`.

Đầu vào: username, password.  
Đầu ra: JWT và thông tin user hoặc lỗi.

Mã giả:

```text
Tìm user theo username
NẾU không tìm thấy user
    trả lỗi 401

now = thời gian hiện tại
NẾU user.status = LOCKED VÀ user.lockedUntil > now
    trả lỗi 403 tài khoản đang bị khóa

NẾU user.status = LOCKED VÀ user.lockedUntil <= now
    mở khóa user
    failedLoginCount = 0

So sánh password với passwordHash bằng bcrypt
NẾU password sai
    failedLoginCount = failedLoginCount + 1
    NẾU failedLoginCount >= 5
        status = LOCKED
        lockedUntil = now + 15 phút
        trả lỗi 403
    NGƯỢC LẠI
        cập nhật failedLoginCount
        trả lỗi 401

NẾU password đúng
    reset failedLoginCount = 0
    status = ACTIVE
    tạo JWT hết hạn sau 30 phút
    trả token và user
```

Ví dụ: user `admin` nhập sai 5 lần liên tiếp, hệ thống đặt `status = LOCKED` và `lockedUntil = hiện tại + 15 phút`.

### 7.1.2. Thuật toán tạo phiếu báo hỏng

Mục đích: Đảm bảo phiếu báo hỏng hợp lệ, thiết bị thuộc đúng phòng và trạng thái thiết bị được cập nhật đồng bộ.

Lớp/phương thức: `ReportService.createReport`.

Đầu vào: reporterId, roomId, deviceIds, description.  
Đầu ra: phiếu báo hỏng mới.

Mã giả:

```text
Kiểm tra roomId là số nguyên
Kiểm tra deviceIds không rỗng
Kiểm tra description không rỗng

Tìm phòng theo roomId
NẾU không có phòng
    trả lỗi 404

Tìm danh sách thiết bị có id trong deviceIds và roomId = roomId
NẾU số thiết bị tìm được khác số deviceIds
    trả lỗi 400 thiết bị không thuộc phòng đã chọn

Bắt đầu transaction
    Tạo DamageReport với status = PENDING
    Tạo DamageReportDevice cho từng deviceId
    Cập nhật các Device.status = BROKEN
    Tìm người nhận role ADMIN hoặc TECHNICIAN
    Tạo Notification cho từng người nhận
Kết thúc transaction

Trả phiếu báo hỏng đã tạo
```

Ví dụ: Người báo hỏng chọn phòng P101 và hai thiết bị MC-P101-01, TV-P101-01. Sau khi tạo phiếu, cả hai thiết bị chuyển sang `BROKEN` và admin/kỹ thuật viên nhận thông báo.

### 7.1.3. Thuật toán ghi sửa chữa và cập nhật trạng thái

Mục đích: Khi kỹ thuật viên ghi nhận sửa chữa, trạng thái thiết bị và phiếu liên quan phải được cập nhật nhất quán.

Lớp/phương thức: `RepairLogService.createRepairLog`.

Đầu vào: deviceId, reportId, quantity, repairedAt, content, afterStatus, technicianId.  
Đầu ra: repair log mới.

Mã giả:

```text
Kiểm tra deviceId hợp lệ
Kiểm tra quantity là số nguyên > 0
Kiểm tra repairedAt hợp lệ
Kiểm tra content không rỗng
Kiểm tra afterStatus thuộc GOOD/BROKEN/REPAIRING

Tìm thiết bị theo deviceId
NẾU không có thiết bị
    trả lỗi 404

NẾU có reportId
    kiểm tra cặp reportId-deviceId tồn tại trong DamageReportDevice
    NẾU không tồn tại
        trả lỗi 400

Bắt đầu transaction
    Tạo RepairLog
    Cập nhật Device.status = afterStatus
    NẾU có reportId
        NẾU afterStatus = GOOD
            DamageReport.status = COMPLETED
        NGƯỢC LẠI
            DamageReport.status = IN_PROGRESS
Kết thúc transaction

Trả repair log mới
```

Ví dụ: Kỹ thuật viên sửa máy chiếu, chọn `afterStatus = GOOD`. Hệ thống tạo lịch sử sửa chữa, chuyển thiết bị về `GOOD` và chuyển phiếu liên quan sang `COMPLETED`.

## 7.2. Thiết kế xử lý lỗi

### 7.2.1. Định dạng phản hồi lỗi

Project hiện tại dùng trường `message`. Để thống nhất theo mẫu báo cáo, định dạng chuẩn đề xuất là:

```json
{
  "message": "Thông báo lỗi ngắn gọn",
  "details": "Chi tiết bổ sung nếu cần"
}
```

Ví dụ:

```json
{
  "message": "Thiết bị không thuộc phòng đã chọn",
  "details": "Một hoặc nhiều deviceIds không có roomId tương ứng"
}
```

### 7.2.2. Các lỗi phổ biến

| Tình huống | HTTP status | Thông báo |
|---|---|---|
| Thiếu username/password | 400 | Vui lòng nhập tên đăng nhập và mật khẩu |
| Sai username/password | 401 | Tên đăng nhập hoặc mật khẩu không đúng |
| Tài khoản bị khóa | 403 | Tài khoản đang bị khóa tạm thời |
| Thiếu token | 401 | Thiếu token xác thực |
| Token hết hạn/không hợp lệ | 401 | Token không hợp lệ hoặc đã hết hạn |
| Không đủ quyền | 403 | Bạn không có quyền thực hiện thao tác này |
| ID không hợp lệ | 400 | ID không hợp lệ |
| Không tìm thấy bản ghi | 404 | Không tìm thấy dữ liệu yêu cầu |
| Trùng mã phòng/thiết bị/username | 409 | Dữ liệu đã tồn tại |
| Không thể xóa do ràng buộc | 400 hoặc 409 | Không thể xóa dữ liệu đang được sử dụng |
| Lỗi máy chủ | 500 | Lỗi server |

### 7.2.3. Hướng dẫn xử lý lỗi

- Controller bắt lỗi validation trước khi gọi Prisma.
- Lỗi Prisma `P2002` được ánh xạ sang 409 Conflict.
- Lỗi Prisma `P2025` được ánh xạ sang 404 Not Found.
- Lỗi Prisma `P2003` khi vi phạm khóa ngoại được ánh xạ sang 409 Conflict.
- Frontend hiển thị lỗi từ `error.response.data.message`.
- Interceptor của Axios tự xóa token và chuyển về `/login` khi nhận 401.

## 7.3. Chiến lược kiểm thử

### 7.3.1. Cách tiếp cận kiểm thử

| Mức kiểm thử | Phạm vi | Công cụ đề xuất |
|---|---|---|
| Unit test | Hàm validate, logic đăng nhập, tạo phiếu, ghi sửa chữa, tạo CSV | Jest |
| Integration test | Gọi API Express với database test | Jest + Supertest |
| Manual test | Kiểm tra luồng UI đầy đủ trên trình duyệt | Trình duyệt, Postman |
| API test | Kiểm tra endpoint, status code, payload | Postman hoặc REST Client |

Mục tiêu bao phủ: tối thiểu 70% cho các logic quan trọng như xác thực, phân quyền, báo hỏng, sửa chữa.

### 7.3.2. Kịch bản unit test

| ID | Tên kiểm thử | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| UT-01 | Validate room hợp lệ | code P101, type THEORY, capacity 60 | Không có lỗi |
| UT-02 | Validate room thiếu mã | code rỗng | Trả lỗi bắt buộc |
| UT-03 | Validate capacity âm | capacity -1 | Trả lỗi sức chứa |
| UT-04 | Normalize room code | p101 | P101 |
| UT-05 | Validate device type sai | type INVALID | Trả lỗi loại thiết bị |
| UT-06 | Validate status thiết bị | status GOOD | Hợp lệ |
| UT-07 | Đăng nhập sai tăng counter | password sai | failedLoginCount tăng 1 |
| UT-08 | Sai 5 lần khóa tài khoản | failedLoginCount = 4, password sai | status LOCKED |
| UT-09 | Tạo report thiếu thiết bị | deviceIds rỗng | Trả lỗi |
| UT-10 | Tạo report thiếu mô tả | description rỗng | Trả lỗi |
| UT-11 | Repair quantity không hợp lệ | quantity = 0 | Trả lỗi |
| UT-12 | Resolve report status GOOD | afterStatus GOOD | COMPLETED |
| UT-13 | Resolve report status REPAIRING | afterStatus REPAIRING | IN_PROGRESS |
| UT-14 | CSV escape có dấu phẩy | value `"A,B"` | Bọc trong dấu nháy kép |

### 7.3.3. Kịch bản integration test

| ID | API | Trường hợp | Kết quả mong đợi |
|---|---|---|---|
| IT-01 | POST `/auth/login` | Đúng tài khoản | 200, có token |
| IT-02 | POST `/auth/login` | Sai mật khẩu | 401 |
| IT-03 | GET `/rooms` | Có token hợp lệ | 200, trả danh sách |
| IT-04 | POST `/rooms` | REPORTER gọi | 403 |
| IT-05 | POST `/rooms` | ADMIN tạo phòng hợp lệ | 201 |
| IT-06 | DELETE `/rooms/{id}` | Phòng còn thiết bị | 400 |
| IT-07 | GET `/devices` | Lọc status BROKEN | 200, chỉ thiết bị hỏng |
| IT-08 | POST `/reports` | Thiết bị thuộc phòng | 201, thiết bị BROKEN |
| IT-09 | POST `/reports` | Thiết bị không thuộc phòng | 400 |
| IT-10 | PATCH `/reports/{id}/status` | TECHNICIAN cập nhật | 200 |
| IT-11 | POST `/repair-logs` | afterStatus GOOD | 201, thiết bị GOOD |
| IT-12 | GET `/notifications` | User lấy thông báo | 200 |
| IT-13 | PATCH `/notifications/mark-all-read` | Có thông báo chưa đọc | 200, updated > 0 |
| IT-14 | GET `/users` | ADMIN | 200 |
| IT-15 | GET `/export/devices` | TECHNICIAN | 200, content-type csv |

### 7.3.4. Kịch bản manual test

| ID | Luồng kiểm thử | Bước kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| MT-01 | Đăng nhập admin | Nhập admin/123456 | Vào dashboard |
| MT-02 | Quản lý phòng | Tạo phòng mới, sửa sức chứa, xóa phòng rỗng | Dữ liệu cập nhật đúng |
| MT-03 | Quản lý thiết bị | Thêm thiết bị vào phòng, đổi trạng thái | Thiết bị hiển thị đúng trạng thái |
| MT-04 | Báo hỏng | Reporter tạo phiếu cho thiết bị | Phiếu mới xuất hiện, thiết bị BROKEN |
| MT-05 | Xử lý phiếu | Technician chuyển trạng thái IN_PROGRESS | Phiếu cập nhật |
| MT-06 | Ghi sửa chữa | Technician ghi repair log GOOD | Thiết bị GOOD, phiếu COMPLETED |
| MT-07 | Thông báo | Xem, lọc, đánh dấu đã đọc | Số chưa đọc giảm |
| MT-08 | Quản lý user | ADMIN tạo user, khóa/mở khóa | Trạng thái user thay đổi |

### 7.3.5. Ví dụ test case chi tiết

**TC-01: Tạo phiếu báo hỏng hợp lệ**

- Tiền điều kiện: User REPORTER đã đăng nhập, phòng P101 có thiết bị MC-P101-01.
- Đầu vào: `roomId = P101`, `deviceIds = [MC-P101-01]`, mô tả sự cố không rỗng.
- Kết quả mong đợi: API trả 201, tạo DamageReport status PENDING, thiết bị chuyển BROKEN, ADMIN/TECHNICIAN nhận thông báo.

**TC-02: Ghi sửa chữa thành công**

- Tiền điều kiện: User TECHNICIAN đã đăng nhập, có phiếu báo hỏng liên quan thiết bị.
- Đầu vào: `afterStatus = GOOD`, nội dung sửa chữa hợp lệ.
- Kết quả mong đợi: API trả 201, tạo RepairLog, thiết bị GOOD, phiếu COMPLETED.

**TC-03: Không cho REPORTER tạo phòng**

- Tiền điều kiện: User REPORTER đã đăng nhập.
- Đầu vào: POST `/api/rooms`.
- Kết quả mong đợi: API trả 403.

## 7.4. Tiêu chuẩn phát triển

### 7.4.1. Quy ước đặt tên

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Component React | PascalCase | `DashboardPage`, `AppLayout` |
| Hàm/biến JavaScript | camelCase | `loadRooms`, `failedLoginCount` |
| File component/page | PascalCase.jsx | `RoomsPage.jsx` |
| File route backend | kebab-case.routes.js | `repair-log.routes.js` |
| Prisma model | PascalCase | `DamageReport` |
| Enum | PascalCase tên enum, UPPER_CASE giá trị | `DeviceStatus.GOOD` |
| API URL | lowercase, danh từ số nhiều | `/api/devices`, `/api/repair-logs` |

### 7.4.2. Định dạng mã

- JavaScript/JSX dùng indent 2 spaces.
- Dấu ngoặc `{}` cùng dòng với khai báo hàm/if.
- Dòng code nên giữ khoảng 100-120 ký tự nếu có thể.
- Dùng `const` cho biến không gán lại, `let` khi cần thay đổi.
- Không hard-code URL API trong component; dùng instance Axios tại `src/api.js`.
- Dữ liệu enum phải kiểm tra bằng danh sách hợp lệ trước khi ghi database.

### 7.4.3. Bình luận

- Chỉ bình luận cho logic phức tạp như transaction, rule cập nhật trạng thái, xử lý khóa tài khoản.
- Không bình luận lại những đoạn code đã rõ nghĩa.
- Thông báo lỗi hướng tới người dùng nên viết tiếng Việt rõ ràng.

### 7.4.4. Tổ chức tệp

```text
backend/
  prisma/
    schema.prisma
    seed.js
    migrations/
  src/
    app.js
    prisma.js
    middlewares/
      auth.middleware.js
    routes/
      auth.routes.js
      room.routes.js
      room-device.routes.js
      device.routes.js
      report.routes.js
      repair-log.routes.js
      notification.routes.js
      user.routes.js
      dashboard.routes.js
      export.routes.js

frontend/
  src/
    api.js
    App.jsx
    components/
      AppLayout.jsx
      ProtectedRoute.jsx
    pages/
      LoginPage.jsx
      DashboardPage.jsx
      RoomsPage.jsx
      DeviceInventoryPage.jsx
      DevicesPage.jsx
      ReportCreatePage.jsx
      ReportsPage.jsx
      RepairLogFormPage.jsx
      DeviceHistoryPage.jsx
      NotificationsPage.jsx
      UsersPage.jsx
```

## 7.5. Lập kế hoạch triển khai

### 7.5.1. Danh sách tác vụ

| Nhóm | Tác vụ | Ước tính | Phụ thuộc |
|---|---|---:|---|
| Database | Thiết kế schema Prisma | 1 ngày | Yêu cầu chức năng |
| Database | Tạo migration PostgreSQL | 0.5 ngày | Schema |
| Database | Viết seed dữ liệu mẫu | 0.5 ngày | Schema |
| Backend | Khởi tạo Express app, CORS, JSON middleware | 0.5 ngày | Node project |
| Backend | Kết nối Prisma Client | 0.5 ngày | Database |
| Backend | Xây dựng auth login JWT | 1 ngày | User model |
| Backend | Xây dựng middleware authenticate/authorize | 0.5 ngày | Auth |
| Backend | API quản lý phòng | 1 ngày | Room model |
| Backend | API quản lý thiết bị | 1.5 ngày | Room, Device model |
| Backend | API tạo phiếu báo hỏng | 1.5 ngày | User, Room, Device |
| Backend | API cập nhật trạng thái phiếu | 0.5 ngày | DamageReport |
| Backend | API ghi lịch sử sửa chữa | 1 ngày | RepairLog, Device |
| Backend | API thông báo | 1 ngày | Notification |
| Backend | API quản lý người dùng | 1 ngày | User |
| Backend | API dashboard stats | 0.5 ngày | Room, Device, Report |
| Backend | API export CSV | 0.5 ngày | Device, RepairLog |
| Frontend | Khởi tạo React/Vite, router, Axios | 0.5 ngày | Frontend project |
| Frontend | Màn hình đăng nhập | 0.5 ngày | Auth API |
| Frontend | ProtectedRoute và AppLayout | 1 ngày | Login |
| Frontend | Dashboard | 1 ngày | Dashboard API |
| Frontend | Quản lý phòng | 1.5 ngày | Room API |
| Frontend | Quản lý thiết bị | 2 ngày | Device API |
| Frontend | Tạo phiếu báo hỏng | 1 ngày | Room/Device/Report API |
| Frontend | Danh sách phiếu báo hỏng | 1 ngày | Report API |
| Frontend | Ghi sửa chữa và lịch sử thiết bị | 1.5 ngày | RepairLog API |
| Frontend | Trung tâm thông báo | 1.5 ngày | Notification API |
| Frontend | Quản lý người dùng | 1 ngày | User API |
| Testing | Unit test logic quan trọng | 1.5 ngày | Backend |
| Testing | Integration test API | 2 ngày | Backend + DB |
| Testing | Manual test toàn bộ luồng | 2 ngày | Frontend + Backend |
| Deploy | Docker hóa backend/frontend/postgres | 1 ngày | App ổn định |
| Deploy | Deploy frontend Vercel | 0.5 ngày | Frontend build |
| Deploy | Kiểm tra CORS/env production | 0.5 ngày | Deploy |
| Documentation | Viết hướng dẫn chạy project | 0.5 ngày | Hoàn thiện app |

### 7.5.2. Lịch biểu triển khai 8 tuần

| Tuần | Nội dung | Mốc hoàn thành |
|---|---|---|
| Tuần 1 | Phân tích yêu cầu, xác định vai trò, thực thể dữ liệu, khởi tạo repo frontend/backend | Có cấu trúc project ban đầu |
| Tuần 2 | Thiết kế Prisma schema, migration, seed dữ liệu, cấu hình PostgreSQL/Docker | Database chạy được |
| Tuần 3 | Xây auth, middleware phân quyền, API phòng và thiết bị cơ bản | Đăng nhập và CRUD phòng/thiết bị |
| Tuần 4 | Xây API phiếu báo hỏng, sửa chữa, cập nhật trạng thái, dashboard | Luồng nghiệp vụ backend hoàn chỉnh |
| Tuần 5 | Xây giao diện đăng nhập, layout, dashboard, quản lý phòng | Người dùng thao tác được UI cơ bản |
| Tuần 6 | Xây giao diện thiết bị, báo hỏng, phiếu báo hỏng, sửa chữa | Luồng báo hỏng/sửa chữa chạy end-to-end |
| Tuần 7 | Xây thông báo, quản lý user, export CSV, kiểm thử tích hợp | Hoàn thiện chức năng quản trị |
| Tuần 8 | Sửa lỗi, tối ưu giao diện, kiểm thử thủ công, viết tài liệu, chuẩn bị nộp | Bản hoàn thiện và tài liệu báo cáo |

### 7.5.3. Đăng ký rủi ro

| Rủi ro | Khả năng | Tác động | Cách giảm thiểu |
|---|---|---|---|
| Sai lệch phân quyền giữa frontend và backend | Trung bình | Cao | Backend luôn kiểm tra `authorize`, frontend chỉ dùng để ẩn menu |
| Lỗi đồng bộ trạng thái thiết bị và phiếu | Trung bình | Cao | Dùng transaction khi tạo report và repair log |
| Dữ liệu demo thiếu tình huống kiểm thử | Trung bình | Trung bình | Seed đủ trạng thái GOOD/BROKEN/REPAIRING và PENDING/IN_PROGRESS/COMPLETED |
| CORS/env khác nhau giữa local và deploy | Trung bình | Trung bình | Cấu hình allowed origins và biến môi trường rõ ràng |
| Xóa dữ liệu vi phạm khóa ngoại | Cao | Trung bình | Chặn xóa phòng còn thiết bị, bắt lỗi Prisma P2003 |
| Token hết hạn gây mất phiên | Trung bình | Trung bình | Interceptor chuyển về login khi 401, thông báo rõ cho người dùng |
| UI bảng bị tràn trên màn hình nhỏ | Trung bình | Thấp | Dùng overflow-x, layout responsive |
| Thiếu test tự động do giới hạn thời gian | Trung bình | Cao | Ưu tiên test API nghiệp vụ quan trọng trước: auth, report, repair log |

### 7.5.4. Tiêu chí hoàn thành

- Người dùng đăng nhập được theo vai trò.
- ADMIN quản lý phòng, thiết bị và người dùng.
- REPORTER tạo được phiếu báo hỏng.
- TECHNICIAN/ADMIN xử lý phiếu và ghi lịch sử sửa chữa.
- Thiết bị tự cập nhật trạng thái khi báo hỏng/sửa chữa.
- Thông báo được tạo và đọc đúng theo người nhận.
- Dashboard và export CSV hoạt động.
- Project chạy được local bằng npm và có cấu hình Docker.
- Tài liệu thiết kế khớp với code hiện tại.

