# Chạy EduTrack bằng image Docker Hub

## 1. Build và push image

Đăng nhập Docker Hub:

```bash
docker login
```

```bash
export DOCKERHUB_NAMESPACE=mynameisfuong
export IMAGE_TAG=latest

docker build -t $DOCKERHUB_NAMESPACE/edutrack-backend:$IMAGE_TAG ./backend
docker build -t $DOCKERHUB_NAMESPACE/edutrack-frontend:$IMAGE_TAG ./frontend

docker push $DOCKERHUB_NAMESPACE/edutrack-backend:$IMAGE_TAG
docker push $DOCKERHUB_NAMESPACE/edutrack-frontend:$IMAGE_TAG
```

## 2. File gửi cho người chạy thử

Gửi 2 file:

- `docker-compose.hub.yml`
- `.env` tạo từ `docker-hub.env.example`

File `docker-hub.env.example` đã cấu hình sẵn `DOCKERHUB_NAMESPACE=mynameisfuong`.

## 3. Chạy project

```bash
cp docker-hub.env.example .env
docker compose -f docker-compose.hub.yml up -d
```

Mở app tại:

```text
http://localhost:5173
```

Tài khoản demo:

```text
admin / 123456
tech / 123456
reporter / 123456
```

## 4. Reset dữ liệu demo

Nếu muốn xóa database Docker và seed lại từ đầu:

```bash
docker compose -f docker-compose.hub.yml down -v
docker compose -f docker-compose.hub.yml up -d
```
