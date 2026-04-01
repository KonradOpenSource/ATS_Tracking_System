# ATS Frontend - Angular 21

## 📋 Project Overview

This is the frontend application for the Applicant Tracking System (ATS) built with Angular 21, Angular Material, and modern standalone components.

## 🏗️ Architecture

### Standalone Components
- All components are standalone (no NgModule required)
- Modern Angular 21 approach
- Lazy loading with `loadComponent()`

### Key Features
- **Authentication**: Login/Register with JWT
- **Layout**: Responsive sidebar + topbar
- **Candidate Management**: CRUD operations
- **Material Design**: Angular Material components
- **Error Handling**: Global error interceptor
- **Security**: JWT token interceptor

## 📁 Structure

```
src/app/
├── app.component.ts              # Root component
├── app.config.ts                 # Application configuration
├── app.routes.ts                 # Routing configuration
├── models/                       # TypeScript interfaces
│   ├── auth.model.ts            # Auth related models
│   └── candidate.model.ts       # Candidate models
├── services/                     # Business logic
│   ├── auth.service.ts          # Authentication service
│   └── candidate.service.ts     # Candidate API service
├── interceptors/                 # HTTP interceptors
│   ├── auth.interceptor.ts       # JWT token interceptor
│   └── error.interceptor.ts     # Error handling interceptor
├── guards/                       # Route guards
│   └── auth.guard.ts            # Authentication guard
├── layout/                       # Layout components
│   └── layout.component.ts      # Main layout with sidebar
└── pages/                        # Page components
    ├── login/                    # Login page
    ├── register/                 # Registration page
    ├── candidates/              # Candidates list
    ├── candidate-form/           # Add/Edit candidate
    └── job-offers/              # Job offers (placeholder)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 17+

### Installation
```bash
npm install
```

### Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/`

### Build
```bash
ng build
```

### Testing
```bash
ng test
```

## 🔧 Configuration

### Backend API
- Base URL: `http://localhost:8081/api`
- Authentication: JWT Bearer tokens
- Error handling: Global interceptor

### Environment Variables
The app connects to the backend at `http://localhost:8081/api`. Update in service files if needed.

## 📱 Features

### Authentication
- **Login**: Username/password authentication
- **Register**: User registration with role selection
- **JWT**: Automatic token management
- **Guard**: Protected routes for authenticated users

### Layout
- **Responsive**: Works on desktop and mobile
- **Sidebar**: Navigation menu
- **Topbar**: User menu and app title
- **Material Design**: Consistent UI components

### Candidate Management
- **List**: Searchable table of candidates
- **Create**: Add new candidates
- **Edit**: Update existing candidates
- **Delete**: Remove candidates with confirmation
- **Search**: Real-time search functionality

### Error Handling
- **Global**: HTTP error interceptor
- **Notifications**: MatSnackBar for user feedback
- **Validation**: Form validation with Material Design

## 🔐 Security

### JWT Implementation
- **Storage**: LocalStorage for tokens
- **Interceptor**: Automatic token injection
- **Guard**: Route protection
- **Logout**: Token cleanup

### Best Practices
- **Input Validation**: Form validation
- **XSS Protection**: Angular's built-in protection
- **CSRF**: Not implemented (add if needed)

## 📦 Dependencies

### Core Dependencies
- `@angular/core`: Angular framework
- `@angular/material`: Material Design components
- `@angular/router`: Routing
- `@angular/forms`: Reactive forms
- `@angular/common/http`: HTTP client

### Dev Dependencies
- `@angular/cli`: Angular CLI
- `@angular/compiler`: Angular compiler
- `typescript`: TypeScript compiler

## 🎨 Styling

### Material Theme
- **Theme**: Indigo-Pink
- **Typography**: Roboto font
- **Spacing**: Material Design spacing
- **Colors**: Consistent color scheme

### Custom Styles
- **Responsive**: Mobile-first design
- **Components**: Component-specific styles
- **Global**: Global styles in `styles.css`

## 🔧 Development

### Adding New Components
```bash
# Create standalone component
ng generate component components/new-component --standalone

# Add to routing
# Update app.routes.ts
```

### Adding New Services
```bash
# Generate service
ng generate service services/new-service

# Add to providers in app.config.ts if needed
```

### API Integration
```typescript
// Example service method
getItems(): Observable<Item[]> {
  return this.http.get<Item[]>(`${this.API_URL}/items`);
}
```

## 🧪 Testing

### Unit Tests
```bash
ng test
```

### E2E Tests
```bash
ng e2e
```

### CI/CD
- Tests run on CI/CD pipeline
- Code quality checks
- Build verification

## 📱 Mobile Support

### Responsive Design
- **Breakpoints**: Mobile-first approach
- **Navigation**: Collapsible sidebar
- **Forms**: Mobile-friendly layouts
- **Tables**: Horizontal scroll on mobile

### Touch Support
- **Buttons**: Touch-friendly sizes
- **Forms**: Mobile input types
- **Navigation**: Touch gestures

## 🚀 Deployment

### Build Process
```bash
# Production build
ng build --configuration production

# Output: dist/ats-frontend/
```

### Docker
```dockerfile
# Multi-stage build
FROM node:18-alpine AS build
# ... build steps
FROM nginx:alpine
# ... production setup
```

### Environment Variables
- **API_URL**: Backend API URL
- **ENVIRONMENT**: Production/Development

## 🔍 Troubleshooting

### Common Issues

#### Module Not Found
```bash
# Install dependencies
npm install

# Check Angular CLI version
ng version
```

#### Build Errors
```bash
# Clean build
rm -rf dist/
ng build
```

#### Routing Issues
- Check `app.routes.ts`
- Verify component imports
- Check guard implementations

### Debug Tips
- **Console**: Check browser console
- **Network**: Verify API calls
- **Local Storage**: Check JWT tokens
- **Forms**: Validate form state

## 📈 Performance

### Optimization
- **Lazy Loading**: Route-level lazy loading
- **Bundle Size**: Tree shaking enabled
- **Caching**: Service worker (add if needed)
- **Images**: Optimize images

### Monitoring
- **Bundle Analysis**: `ng build --stats-json`
- **Performance**: Lighthouse scores
- **Error Tracking**: Add error tracking service

## 🔄 Future Enhancements

### Planned Features
- **Job Offers**: Complete job management
- **Interviews**: Interview scheduling
- **Reports**: Analytics dashboard
- **File Upload**: Resume/CV upload
- **Notifications**: Real-time updates

### Technical Improvements
- **PWA**: Progressive Web App
- **Service Worker**: Offline support
- **State Management**: NgRx or RxAngular
- **Testing**: E2E test coverage

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review Angular Material docs
3. Consult Angular documentation
4. Contact development team

---

**Built with ❤️ using Angular 21 and Angular Material**
