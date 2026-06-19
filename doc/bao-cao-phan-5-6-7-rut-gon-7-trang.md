# BÁO CÁO THIẾT KẾ PHẦN 5-6-7

**Hệ thống:** Website quản lý cơ sở vật chất và thiết bị phòng học.  
**Công nghệ:** React/Vite, Express.js, Prisma ORM, PostgreSQL, JWT, bcrypt, Docker.  
**Phạm vi:** Rút gọn tối đa 7 trang để ghép với 3 trang báo cáo trước, vẫn giữ đủ đầu mục theo form mẫu.

## 5.1. Thiết kế thành phần

Kiến trúc hệ thống gồm 4 lớp: Presentation Layer, API/Controller Layer, Business Logic Layer và Data Access Layer. Frontend React hiển thị giao diện và gọi API; backend Express xử lý xác thực, phân quyền, validation và workflow nghiệp vụ; Prisma truy cập PostgreSQL.

| Lớp | Thành phần chính | Trách nhiệm | Yêu cầu |
|---|---|---|---|
| Presentation | Login, Dashboard, Rooms, Devices, Reports, RepairLog, Notifications, Users | Hiển thị UI, gọi API, lưu token, điều hướng theo vai trò | Đăng nhập, quản lý, báo hỏng, thông báo |
| API/Controller | auth, room, room-device, device, report, repair-log, notification, user, dashboard, export routes | Nhận request, kiểm tra quyền, gọi Prisma/logic nghiệp vụ, trả JSON/CSV | Toàn bộ API |
| Business Logic | AuthMiddleware, validators, report workflow, repair workflow, notification workflow | JWT, role-based authorization, kiểm tra dữ liệu, transaction cập nhật trạng thái | Bảo mật, nghiệp vụ |
| Data Access | Prisma Client; User, Room, Device, DamageReport, RepairLog, Notification | Ánh xạ model, truy vấn PostgreSQL an toàn, quản lý quan hệ dữ liệu | Lưu trữ dữ liệu |

| Thành phần | Phụ thuộc chính |
|---|---|
| LoginPage/AuthRoutes | User model, bcrypt, JWT |
| RoomsPage/RoomRoutes | Room model, Device count khi xóa |
| Device pages/DeviceRoutes | Room model, Device model, RepairLog model |
| Report pages/ReportRoutes | Room, Device, DamageReport, Notification, transaction |
| RepairLogForm/RepairLogRoutes | Device, DamageReportDevice, RepairLog |
| NotificationsPage/NotificationRoutes | Notification, User, Report |
| UsersPage/UserRoutes | User, bcrypt, authorize ADMIN |
| Dashboard/ExportRoutes | Room, Device, DamageReport, RepairLog, CSV writer |

<!-- pagebreak -->

## 5.2. Thiết kế API

| Mục | Đặc tả |
|---|---|
| Base URL | `http://localhost:5000/api`; frontend dùng `VITE_API_URL` hoặc mặc định localhost |
| Xác thực | JWT Bearer Token; header `Authorization: Bearer <token>`; token hết hạn 30 phút |
| Vai trò | ADMIN, TECHNICIAN, REPORTER |
| Định dạng | JSON cho nghiệp vụ, CSV cho export |
| Mã lỗi | 400, 401, 403, 404, 409, 500 |

| Nhóm API | Endpoint chính | Quyền | Mục đích |
|---|---|---|---|
| Auth | POST `/auth/login`; GET `/auth/me` | Public/User | Đăng nhập, lấy user hiện tại |
| Rooms | GET/POST `/rooms`; PUT/DELETE `/rooms/:id` | GET: mọi vai trò; ghi: ADMIN | CRUD phòng, tìm kiếm theo mã, chặn xóa phòng còn thiết bị |
| Devices | GET `/devices`; PUT/DELETE `/devices/:id`; PATCH `/devices/:id/status`; GET `/devices/:id/repair-logs` | Theo vai trò | Lọc thiết bị, cập nhật thông tin/trạng thái, xem lịch sử |
| Room devices | GET/POST `/rooms/:roomId/devices` | GET: mọi vai trò; POST: ADMIN | Quản lý thiết bị trong một phòng |
| Reports | POST `/reports`; GET `/reports`; PATCH `/reports/:id/status` | Tạo: login; xử lý: ADMIN/TECHNICIAN | Tạo phiếu báo hỏng, chuyển thiết bị BROKEN, cập nhật trạng thái phiếu |
| Repair logs | POST `/repair-logs` | ADMIN/TECHNICIAN | Ghi sửa chữa, cập nhật trạng thái thiết bị và phiếu |
| Notifications | GET `/notifications`; GET `/unread-count`; PATCH read; POST `/admin` | Login; gửi hệ thống: ADMIN | Nhận, lọc, đánh dấu đã đọc, gửi thông báo |
| Users | GET/POST/PUT `/users`; PATCH `/users/:id/status` | ADMIN | Quản lý tài khoản, vai trò, khóa/mở khóa |
| Dashboard/Export | GET `/dashboard/stats`; GET `/export/devices`; GET `/export/repair-logs` | Dashboard: mọi vai trò; export: ADMIN/TECHNICIAN | Thống kê và xuất CSV |

Ví dụ nghiệp vụ quan trọng: POST `/reports` nhận `{ roomId, deviceIds, description }`, tạo DamageReport trạng thái PENDING, chuyển thiết bị sang BROKEN và gửi thông báo cho ADMIN/TECHNICIAN. POST `/repair-logs` nhận `{ deviceId, reportId, quantity, repairedAt, content, afterStatus }`, tạo lịch sử sửa chữa và cập nhật trạng thái thiết bị/phiếu.

<!-- pagebreak -->

## 5.3. Kiến trúc dữ liệu vật lý

CSDL dùng PostgreSQL 16, quản lý qua Prisma schema. Khóa chính là Int autoincrement. Các enum chính gồm Role, UserStatus, RoomType, RoomStatus, DeviceType, DeviceStatus, ReportStatus và NotificationType.

| Bảng/Model | Mục đích | Khóa và cột quan trọng | Quan hệ |
|---|---|---|---|
| User | Tài khoản và phân quyền | id PK, username UNIQUE, passwordHash, role, status, failedLoginCount, lockedUntil | 1-N DamageReport, RepairLog, Notification |
| Room | Phòng học/phòng lab | id PK, code UNIQUE, type, capacity, status | 1-N Device, 1-N DamageReport |
| Device | Thiết bị thuộc phòng | id PK, code UNIQUE, name, type, status, importedAt, roomId FK | N-1 Room, N-N DamageReport, 1-N RepairLog |
| DamageReport | Phiếu báo hỏng | id PK, reporterId FK, roomId FK, description, status | N-1 User/Room, N-N Device, 1-N RepairLog/Notification |
| DamageReportDevice | Bảng trung gian phiếu-thiết bị | PK(reportId, deviceId), 2 FK | Liên kết nhiều-nhiều DamageReport và Device |
| RepairLog | Lịch sử sửa chữa | id PK, deviceId FK, reportId FK nullable, technicianId FK, quantity, repairedAt, afterStatus | N-1 Device/User/Report |
| Notification | Thông báo | id PK, type, title, message, isRead, recipientId, actorId, reportId | N-1 User/Report |

| Quan hệ ERD | Ý nghĩa |
|---|---|
| User 1-N DamageReport | Một người báo hỏng tạo nhiều phiếu |
| Room 1-N Device | Một phòng chứa nhiều thiết bị |
| DamageReport N-N Device qua DamageReportDevice | Một phiếu có nhiều thiết bị hỏng; một thiết bị có thể xuất hiện ở nhiều phiếu theo thời gian |
| Device 1-N RepairLog | Một thiết bị có nhiều lần sửa chữa |
| User 1-N Notification | Mỗi user nhận nhiều thông báo; actorId lưu người tạo/cập nhật |

Ràng buộc và chỉ mục: UNIQUE(username), UNIQUE(room.code), UNIQUE(device.code); CHECK capacity > 0, quantity > 0; index cho devices(roomId,status,type), reports(status,createdAt), repair_logs(deviceId,repairedAt), notifications(recipientId,isRead).

<!-- pagebreak -->

## 5.4. Thiết kế bảo mật

| Nội dung | Thiết kế áp dụng |
|---|---|
| Xác thực | Username/password; password hash bằng bcrypt; JWT trả về sau đăng nhập; frontend gắn token vào Authorization header |
| Khóa tài khoản | Sai mật khẩu 5 lần thì status LOCKED và lockedUntil = hiện tại + 15 phút; hết hạn khóa thì tự mở khi đăng nhập lại |
| Ủy quyền | Middleware authenticate kiểm tra token; authorize(...roles) chặn API theo ADMIN/TECHNICIAN/REPORTER |
| Bảo vệ dữ liệu | Không trả passwordHash; không log mật khẩu/token; Prisma giảm nguy cơ SQL injection; CORS giới hạn origin; production cần HTTPS |

| Vai trò | Quyền chính |
|---|---|
| ADMIN | Quản lý phòng, thiết bị, phiếu, người dùng, thông báo hệ thống, export CSV |
| TECHNICIAN | Xem phòng/thiết bị, xử lý phiếu, ghi sửa chữa, xem lịch sử, export CSV |
| REPORTER | Xem dashboard/phòng/thiết bị cơ bản, tạo phiếu báo hỏng, nhận thông báo |

## 6.1. Thiết kế lớp

Project hiện tại tổ chức backend theo Express routes; trong thiết kế lớp, các route tương ứng Controller, logic validation/workflow tương ứng Service, Prisma model tương ứng Entity/Repository.

| Nhóm | Lớp/mô-đun tiêu biểu |
|---|---|
| Entity/Model | User, Room, Device, DamageReport, DamageReportDevice, RepairLog, Notification |
| Controller | AuthController, RoomController, DeviceController, ReportController, RepairLogController, NotificationController, UserController, DashboardController, ExportController |
| Service | AuthService, RoomService, DeviceService, ReportService, RepairLogService, NotificationService, UserService, DashboardService, ExportService |
| DTO | LoginRequest/Response, RoomRequest, DeviceRequest, CreateReportRequest, CreateRepairLogRequest, UserRequest |
| Middleware | AuthMiddleware, RoleAuthorizationMiddleware |

| Lớp nghiệp vụ | Phương thức/chức năng chính |
|---|---|
| AuthService | login(), verifyPassword(), generateToken(), handleFailedLogin(), getCurrentUser() |
| ReportService | createReport(), validateDevicesInRoom(), updateReportStatus(), createReportNotifications() |
| RepairLogService | createRepairLog(), validateReportDevice(), updateDeviceStatus(), updateRelatedReport() |
| DeviceService | listDevices(), updateDevice(), changeStatus(), getRepairHistory() |

<!-- pagebreak -->

## 6.2. Thiết kế trình tự

| Luồng | Trình tự xử lý rút gọn |
|---|---|
| Đăng nhập | LoginPage -> POST /auth/login -> tìm User -> bcrypt.compare -> reset/tăng failedLoginCount -> jwt.sign -> lưu token -> Dashboard |
| Tạo báo hỏng | ReportCreatePage -> GET rooms/devices -> POST /reports -> kiểm tra room/device -> transaction tạo report, link device, Device=BROKEN, tạo Notification |
| Ghi sửa chữa | RepairLogForm -> POST /repair-logs -> kiểm tra device/report-device -> transaction tạo RepairLog, cập nhật Device, cập nhật Report COMPLETED/IN_PROGRESS |
| Đọc thông báo | NotificationsPage -> GET /notifications?filter -> lọc theo recipientId/isRead -> PATCH read hoặc mark-all-read |

## 6.3. Mockups UI độ trung thực cao

| Màn hình | Thành phần chính | Chức năng |
|---|---|---|
| Login | Panel thương hiệu PTIT, form username/password | Đăng nhập và lưu phiên |
| Dashboard | Thẻ thống kê, top phòng có thiết bị hỏng, export | Theo dõi nhanh tình trạng CSVC |
| Rooms | Tìm kiếm, card phòng, modal thêm/sửa | CRUD phòng, xem thiết bị trong phòng |
| Devices | Bộ lọc, bảng thiết bị, menu hành động | Quản lý tài sản, trạng thái, lịch sử |
| Reports | Form báo hỏng, bảng phiếu, đổi trạng thái | Tạo và xử lý phiếu báo hỏng |
| RepairLog | Thông tin thiết bị, form sửa chữa | Ghi nhận sửa chữa |
| Notifications/Users | Tabs thông báo, bảng user, khóa/mở khóa | Quản trị thông báo và tài khoản |

Design system: màu chính đỏ PTIT #b0002a, nền #f7f8fb, panel trắng, trạng thái xanh/đỏ/vàng. Font Inter/system-ui; border radius 8-12px; spacing theo bội số 8px; bảng responsive có overflow-x. Thành phần dùng lại gồm AppLayout, ProtectedRoute, status pill, modal form, action menu, notification bell.

## 6.4. Chi tiết CSDL/DDL

Project dùng Prisma migration. Khi triển khai: tạo enum Role/UserStatus/RoomType/DeviceStatus/ReportStatus/NotificationType; tạo bảng users, rooms, devices, damage_reports, damage_report_devices, repair_logs, notifications; tạo index cho FK và cột lọc; seed dữ liệu demo bằng `backend/prisma/seed.js`. Lệnh chạy: `npx prisma migrate dev`, `npm run prisma:seed`; Docker: `docker compose --profile seed up seed`.

<!-- pagebreak -->

## 7.1. Thiết kế thuật toán

| Thuật toán | Mục đích | Mã giả rút gọn |
|---|---|---|
| Đăng nhập/khóa tài khoản | Chống dò mật khẩu | Tìm user -> nếu LOCKED còn hạn trả 403 -> bcrypt.compare -> sai thì tăng failedLoginCount, >=5 khóa 15 phút -> đúng thì reset counter và trả JWT 30 phút |
| Tạo phiếu báo hỏng | Đồng bộ phiếu-thiết bị-thông báo | Validate roomId/deviceIds/description -> kiểm tra thiết bị thuộc phòng -> transaction: tạo DamageReport, DamageReportDevice, Device=BROKEN, Notification cho ADMIN/TECHNICIAN |
| Ghi sửa chữa | Đồng bộ lịch sử và trạng thái | Validate device/report/quantity/date/content/afterStatus -> transaction: tạo RepairLog, cập nhật Device.status, nếu có report thì GOOD -> COMPLETED, khác -> IN_PROGRESS |

## 7.2. Thiết kế xử lý lỗi

| Lỗi | Status | Xử lý |
|---|---|---|
| Thiếu/sai dữ liệu đầu vào | 400 | Trả message tiếng Việt rõ ràng |
| Thiếu token/token hết hạn | 401 | Frontend xóa token và chuyển /login |
| Không đủ quyền | 403 | authorize(...roles) chặn thao tác |
| Không tìm thấy | 404 | Ánh xạ Prisma P2025 hoặc findUnique null |
| Trùng mã/username | 409 | Ánh xạ Prisma P2002 |
| Vi phạm khóa ngoại khi xóa | 409 | Ánh xạ Prisma P2003, báo dữ liệu đang được sử dụng |
| Lỗi server | 500 | Log server, trả message chung |

## 7.3. Chiến lược kiểm thử

| Mức test | Phạm vi | Ví dụ test case |
|---|---|---|
| Unit | Validator và service logic | Validate room/device; đăng nhập sai tăng counter; sau 5 lần khóa; resolve report status theo afterStatus; CSV escape |
| Integration | API Express + DB test | POST /auth/login; POST /rooms với REPORTER -> 403; POST /reports -> thiết bị BROKEN; POST /repair-logs GOOD -> phiếu COMPLETED |
| Manual | Luồng UI end-to-end | Admin đăng nhập, CRUD phòng/thiết bị/user; reporter tạo phiếu; technician xử lý và ghi sửa chữa; đọc thông báo; export CSV |
| Công cụ | Jest, Supertest, Postman/REST Client, kiểm thử thủ công trình duyệt | Mục tiêu bao phủ logic quan trọng >=70% |

<!-- pagebreak -->

## 7.4. Tiêu chuẩn phát triển

| Hạng mục | Quy ước |
|---|---|
| Tên file/component | React component PascalCase.jsx: DashboardPage.jsx, AppLayout.jsx; route backend kebab-case.routes.js |
| Tên biến/hàm | camelCase trong JavaScript: loadRooms, failedLoginCount; Prisma model PascalCase; enum value UPPER_CASE |
| Format | Indent 2 spaces, ưu tiên const, validate enum trước khi ghi DB, không hard-code API URL trong component |
| Comment | Chỉ bình luận logic phức tạp: transaction, khóa tài khoản, cập nhật trạng thái phiếu/thiết bị |
| Tổ chức thư mục | backend/src/routes + middlewares + prisma; frontend/src/components + pages + api.js |

## 7.5. Lập kế hoạch triển khai

| Tuần | Nội dung triển khai | Mốc hoàn thành |
|---|---|---|
| 1 | Phân tích yêu cầu, vai trò, thực thể, khởi tạo repo frontend/backend | Có cấu trúc project |
| 2 | Thiết kế Prisma schema, migration, seed, PostgreSQL/Docker | Database chạy được |
| 3 | Auth JWT, middleware phân quyền, API phòng/thiết bị cơ bản | Đăng nhập và CRUD cơ bản |
| 4 | API báo hỏng, sửa chữa, dashboard, cập nhật trạng thái | Backend nghiệp vụ hoàn chỉnh |
| 5 | UI login, layout, dashboard, phòng | UI cơ bản chạy được |
| 6 | UI thiết bị, báo hỏng, phiếu, sửa chữa | Luồng end-to-end chính |
| 7 | Thông báo, user, export CSV, integration test | Hoàn thiện quản trị |
| 8 | Sửa lỗi, responsive, manual test, tài liệu | Bản nộp cuối khóa |

| Nhóm | Tác vụ/rủi ro | Giảm thiểu |
|---|---|---|
| Database | Schema, migration, index, seed dữ liệu đủ trạng thái | Dùng Prisma migration và seed.js |
| Backend | Auth, role, CRUD, report workflow, repair workflow, notification, export | Viết transaction cho report/repair, bắt lỗi Prisma |
| Frontend | Route bảo vệ, layout, form, table, modal, filter, responsive | Dùng Axios interceptor, AppLayout, component tái sử dụng |
| Testing | Thiếu test tự động do thời gian | Ưu tiên auth/report/repair/API quyền |
| Deploy | Sai CORS/env giữa local và production | Cấu hình allowed origins, VITE_API_URL, DATABASE_URL, JWT_SECRET |
| Data integrity | Xóa dữ liệu đang có khóa ngoại hoặc lệch trạng thái | Chặn xóa, dùng Restrict/Cascade/SetNull đúng chỗ |

Tiêu chí hoàn thành: đăng nhập/phân quyền đúng 3 vai trò; ADMIN quản lý phòng, thiết bị, user; REPORTER tạo phiếu báo hỏng; TECHNICIAN/ADMIN xử lý phiếu và ghi sửa chữa; thiết bị tự cập nhật trạng thái; thông báo và export CSV hoạt động; project chạy local bằng npm/Docker; tài liệu thiết kế khớp code hiện tại.
