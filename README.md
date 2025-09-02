# 🗽 Freedom Wall

A professional social media platform built with Next.js, featuring a modern Facebook-inspired design with authentication, user profiles, and a component-based architecture.

## 🌟 Project Overview

Freedom Wall is a professional-grade social media platform that allows users to:

- **Authenticate** securely with JWT tokens
- **Create and share** posts with text and images
- **Build profiles** with customizable information
- **Navigate seamlessly** between dashboard and profile pages
- **Experience responsive design** across all devices

## 🚀 Features Built Today

### ✅ **Authentication System**

- **User Registration** with secure password hashing
- **User Login** with JWT token generation
- **Protected Routes** for authenticated users only
- **Session Management** with localStorage

### ✅ **User Interface**

- **Professional Landing Page** with green theme
- **Modern Login/Signup Forms** with validation
- **Facebook-style Dashboard** with post creation
- **Comprehensive Profile Page** with tabs and sections
- **Responsive Header** with navigation and search

### ✅ **Component Architecture**

- **Reusable Header Component** with working navigation
- **Mobile Bottom Navigation** for mobile devices
- **Post Creation Component** with image support
- **Post Card Component** for displaying content
- **Modular Design** for easy maintenance

### ✅ **Navigation & Routing**

- **Working Home Icon** navigation between pages
- **Profile Page Integration** with proper routing
- **Mobile-responsive Design** across all components
- **Active State Management** for current page highlighting

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and effects

### **Backend & Database**

- **MongoDB** - NoSQL database with Mongoose ODM
- **Node.js** - Server-side JavaScript runtime
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security

### **Development Tools**

- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Git** - Version control and collaboration

## 📁 Project Structure

```
freedomewall/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── auth/         # Authentication endpoints
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── profile/           # User profile page
│   │   ├── login/             # Login page
│   │   └── signup/            # Registration page
│   ├── components/            # Reusable UI components
│   │   ├── Header.tsx        # Main navigation header
│   │   ├── MobileBottomNav.tsx # Mobile navigation
│   │   ├── CreatePost.tsx    # Post creation form
│   │   └── PostCard.tsx      # Post display component
│   ├── lib/                   # Utility libraries
│   │   └── mongodb.ts        # Database connection
│   └── models/                # Data models
│       └── User.ts           # User schema and model
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

## 🎨 Design Features

### **Color Scheme**

- **Primary Green**: `#16a34a` (Green-600)
- **Secondary Colors**: Gray scale for text and backgrounds
- **Accent Colors**: Red for notifications, blue for links

### **UI Components**

- **Modern Forms** with focus states and validation
- **Responsive Grid Layouts** for different screen sizes
- **Interactive Elements** with hover effects and transitions
- **Professional Typography** with proper hierarchy

### **Mobile Experience**

- **Bottom Navigation** for mobile devices
- **Responsive Headers** that adapt to screen size
- **Touch-friendly Interface** with proper spacing
- **Optimized Layouts** for small screens

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- MongoDB Atlas account
- Git for version control

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/KlienGumapac/freedomewall.git
   cd freedomewall
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

1. **User Registration** → Creates account with hashed password
2. **User Login** → Validates credentials and generates JWT
3. **Protected Routes** → Checks JWT token for access
4. **Session Management** → Stores user data and token locally

## 📱 Pages & Features

### **Landing Page** (`/`)

- Professional introduction to Freedom Wall
- Call-to-action for registration
- Feature highlights and community showcase

### **Dashboard** (`/dashboard`)

- Welcome message for authenticated users
- Post creation interface
- Navigation to other sections

### **Profile Page** (`/profile`)

- User profile information and bio
- Photo gallery and personal details
- Posts display with list/grid view options
- Tabbed navigation for different sections

### **Authentication Pages**

- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - New user registration

## 🎯 Future Roadmap

### **Phase 2: Core Social Features**

- [ ] News feed with posts from followed users
- [ ] Like and comment system
- [ ] User following/follower relationships
- [ ] Real-time notifications

### **Phase 3: Advanced Features**

- [ ] Image and video upload support
- [ ] Search functionality
- [ ] User groups and communities
- [ ] Direct messaging system

### **Phase 4: Enhancement**

- [ ] Advanced analytics and insights
- [ ] Mobile app development
- [ ] API documentation
- [ ] Performance optimization

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### **Development Guidelines**

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component reusability
- Write clean, readable code
- Test thoroughly before submitting

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

**Klien Gumapac**

- GitHub: [@KlienGumapac](https://github.com/KlienGumapac)
- Email: Kliengumapac5@gmail.com
- Location: Polomolok, South Cotabato, Philippines
- Education: SEAIT - South East Asian Institute of Technology

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS approach
- **MongoDB** for the robust database solution
- **Open Source Community** for inspiration and tools

---

**Built with ❤️ and ☕ by Klien Gumapac**

_"Building the future, one line of code at a time"_
