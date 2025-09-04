# 📚 Bab's Bookstore - Frontend

Modern Angular-based e-commerce platform - Bookstore frontend application

[![Angular](https://img.shields.io/badge/Angular-18.2-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat-square&logo=reactivex)](https://rxjs.dev/)

## 🚀 About The Project

Bab's Bookstore is a modern e-commerce platform where users can purchase books, and administrators can manage books, categories, publishers, and orders.

### 🌟 Key Features

#### 👤 Customer Panel

- 🔐 User registration/login system
- 📖 Book search and filtering
- 🛒 Shopping cart management
- 💳 Order placement and tracking
- 👤 Profile management
- 📍 Address management

#### 🔧 Admin Panel

- 📊 Dashboard and statistics
- 📚 Book management (CRUD)
- 🏷️ Category management
- 🏢 Publisher management
- 📦 Order management
- 👥 User management

## 🏗️ Technical Architecture

### Frontend Technologies

- **Framework**: Angular 18.2
- **UI Framework**: Bootstrap 5.3 + Bootstrap Icons
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Forms**: Angular Reactive Forms
- **Authentication**: JWT Token-based

### Project Architecture

```
src/
├── app/
│   ├── admin/              # Admin panel module
│   │   ├── features/       # Admin features
│   │   ├── layout/         # Admin layout components
│   │   └── core/          # Admin services
│   ├── client/            # Customer panel module
│   │   ├── features/      # Customer features
│   │   └── layout/        # Customer layout components
│   ├── core/              # Shared services and models
│   │   ├── guards/        # Route guard services
│   │   ├── interceptors/  # HTTP interceptors
│   │   ├── models/        # TypeScript models
│   │   └── services/      # API services
│   └── shared/            # Shared components
```

## 🔗 Backend Integration

This frontend application integrates with the following backend API:

- **Backend Repository**: [BabsKitapEvi](https://github.com/berkaychi/BabsKitapEvi)
- **API Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token

### API Endpoint Categories

- `/auth` - Authentication
- `/books` - Book operations
- `/categories` - Category operations
- `/publishers` - Publisher operations
- `/orders` - Order operations
- `/users` - User operations
- `/addresses` - Address operations

## 🛠️ Installation and Setup

### Prerequisites

- Node.js (18.x or higher)
- npm (9.x or higher)
- Angular CLI (18.x)

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/berkaychi/BabsKitapEviWeb.git
cd BabsKitapEviWeb/kitap-evi
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm start
# or
ng serve
```

4. **Access the application**
   - Frontend: http://localhost:4200
   - Admin Panel: http://localhost:4200/admin

### Other Commands

```bash
# Build for production
npm run build

# Run tests
npm test

# Build in watch mode
npm run watch
```

## 🔑 Authentication

### Customer Login

- Register/Login through the authentication pages
- JWT token is automatically stored
- Automatic redirection when token expires

### Admin Login

- Access to `/admin` route is protected by admin guard
- Only users with admin role can access
- Separate admin layout and navigation

## 🛡️ Security Features

- **Route Guards**: Protection services that prevent unauthorized access
- **HTTP Interceptors**: Automatic token addition and error handling
- **Role-based Access**: Admin and customer role separation
- **Form Validation**: Comprehensive form validation
- **Error Handling**: Centralized error management

## 🎨 UI/UX Features

- **Responsive Design**: Compatible with all devices
- **Bootstrap 5.3**: Modern and consistent design
- **Bootstrap Icons**: Comprehensive icon set
- **Toast Notifications**: User notifications
- **Loading States**: Loading state indicators
- **Form Validation**: Real-time validation

## 📱 Responsive Design

- **Mobile First**: Mobile device-first design approach
- **Tablet Support**: Optimized for tablet devices
- **Desktop**: Wide screen support
- **Cross-browser**: Tested on all modern browsers

## 🚀 Performance Optimizations

- **Lazy Loading**: Loading modules on demand
- **OnPush Strategy**: Change detection optimization
- **HTTP Caching**: API response caching
- **Bundle Optimization**: Webpack bundle optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Berkay Erdoğan**

- GitHub: [@berkaychi](https://github.com/berkaychi)

## 🔗 Related Repositories

- **Backend API**: [BabsKitapEvi](https://github.com/berkaychi/BabsKitapEvi)

---

⭐ If you like this project, don't forget to give it a star!
