# MotorSpa Landing Page

Trang landing page giới thiệu dự án MotorSpa - Hệ sinh thái chăm sóc xe máy toàn diện.

## 📋 Mô tả

Landing page này được thiết kế để giới thiệu dự án MotorSpa, bao gồm:

- **Tổng quan về dự án**: Giới thiệu ứng dụng và giải pháp
- **Tính năng chính**: 6 module chính của hệ thống
- **Công nghệ sử dụng**: NestJS, React Native, PostgreSQL, Expo
- **Kiến trúc hệ thống**: Fullstack architecture với Frontend/Backend/Database layers
- **Demo & Documentation**: Links đến API docs, source code, video demo

## 🏗️ Cấu trúc

```
intro/
├── index.html       # Trang chính
├── style.css        # Stylesheet
├── vercel.json      # Vercel configuration
└── README.md        # File này
```

## 🎨 Tính năng

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Smooth scrolling navigation
- ✅ Animated elements on scroll
- ✅ Modern UI/UX với gradient và shadows
- ✅ SEO optimized với meta tags
- ✅ Social media ready (Open Graph & Twitter Cards)
- ✅ Cross-browser compatible

## 🚀 Deploy lên Vercel

### Phương pháp 1: Deploy từ GitHub (Khuyến nghị - Auto Deploy)

1. **Push code lên GitHub**
   ```bash
   git add .
   git commit -m "Update landing page"
   git push origin main
   ```

2. **Truy cập Vercel Dashboard**
   - Đi đến [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Đăng nhập hoặc đăng ký tài khoản (có thể dùng GitHub)

3. **Import Project**
   - Nhấn **"Add New..."** → **"Project"**
   - Chọn **"Import Git Repository"**
   - Tìm và chọn repository **MotorSpa**

4. **Configure Project**
   - **Framework Preset**: Chọn **"Other"** (hoặc để tự động)
   - **Root Directory**: Nhấn **"Edit"** và nhập **`intro`**
   - **Build Command**: Để trống (không cần build)
   - **Output Directory**: Để trống

5. **Deploy**
   - Nhấn **"Deploy"**
   - Đợi vài giây để Vercel deploy

6. **Auto Deploy đã được kích hoạt**
   - Mỗi khi bạn push code lên GitHub (branch main), Vercel sẽ tự động build và deploy lại
   - Bạn sẽ nhận được thông báo qua email mỗi khi deploy thành công

### Phương pháp 2: Deploy bằng Vercel CLI

1. **Cài đặt Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login vào Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd intro
   vercel
   ```

4. **Deploy Production**
   ```bash
   vercel --prod
   ```

### Phương pháp 3: Drag & Drop

1. Truy cập [https://vercel.com/new](https://vercel.com/new)
2. Kéo thả thư mục `intro` vào trang web
3. Đợi deploy hoàn tất

## 🔧 Cấu hình Auto Deploy

Auto deploy đã được cấu hình sẵn khi bạn deploy từ GitHub. Vercel sẽ:

- ✅ Tự động deploy khi có commit mới trên branch `main`
- ✅ Tạo preview deployment cho mọi Pull Request
- ✅ Gửi thông báo deployment qua email
- ✅ Tự động invalidate CDN cache

### Cài đặt nâng cao

Trong **Project Settings** trên Vercel:

1. **Git Integration**
   - Production Branch: `main`
   - Preview Branch: Tất cả branches

2. **Deployment Protection** (Tùy chọn)
   - Bật để yêu cầu password khi truy cập preview deployments

3. **Environment Variables** (Nếu cần)
   - Thêm biến môi trường nếu có

## 🌐 Custom Domain (Tùy chọn)

Sau khi deploy, bạn có thể thêm custom domain:

1. Vào **Project Settings** → **Domains**
2. Nhấn **"Add"**
3. Nhập domain của bạn (ví dụ: motorspa.com)
4. Làm theo hướng dẫn để cấu hình DNS

## 📝 Chỉnh sửa nội dung

### Thay đổi thông tin

Mở `index.html` và chỉnh sửa:

- **Tên giảng viên**: Tìm `[Tên GV]` và thay thế
- **Links**: Cập nhật các link GitHub, social media, demo
- **Nội dung**: Chỉnh sửa text trong các sections

### Thay đổi màu sắc

Mở `style.css` và chỉnh sửa trong section `:root`:

```css
:root {
    --primary-color: #2563eb;      /* Màu chính */
    --secondary-color: #1e40af;    /* Màu phụ */
    --text-color: #1f2937;         /* Màu text */
    --light-bg: #f3f4f6;           /* Background sáng */
}
```

### Thêm hình ảnh

Thêm hình ảnh vào section hero:

```css
.hero {
    background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
                url('YOUR_IMAGE_URL');
}
```

## 🧪 Test Local

Để test trên máy local:

1. **Sử dụng Live Server** (VS Code Extension)
   - Cài extension "Live Server"
   - Right-click vào `index.html`
   - Chọn "Open with Live Server"

2. **Sử dụng Python**
   ```bash
   cd intro
   python -m http.server 8000
   ```
   Truy cập: http://localhost:8000

3. **Sử dụng Node.js**
   ```bash
   npx serve intro
   ```

## 📱 Preview

Sau khi deploy, bạn sẽ nhận được URL dạng:
- Production: `https://your-project-name.vercel.app`
- Preview: `https://your-project-name-git-branch-name.vercel.app`

## 🔗 Links hữu ích

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Custom Domains Guide](https://vercel.com/docs/concepts/projects/custom-domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 💡 Tips

- Commit và push code thường xuyên để trigger auto deploy
- Kiểm tra deployment logs nếu có lỗi
- Sử dụng preview deployments để test trước khi merge vào main
- Tối ưu hình ảnh để tăng tốc độ load trang
- Sử dụng Vercel Analytics để theo dõi traffic

## 📞 Support

Nếu gặp vấn đề khi deploy:
- Kiểm tra [Vercel Status](https://www.vercel-status.com/)
- Xem deployment logs trong Vercel dashboard
- Đọc [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Lưu ý**: File `vercel.json` đã được cấu hình sẵn để deploy trang tĩnh HTML/CSS. Không cần thay đổi gì thêm.
