# FitBeast - Fitness Tracking Application

FitBeast is a comprehensive web application for tracking nutritional information of food products and managing workout playlists. The application is built with a Vue.js frontend, Node.js backend, and PostgreSQL database.

## 🌟 Features

- **Products Database**: Browse and search a database of food products with detailed nutritional information
- **Workout Playlists**: Access music playlists organized by workout type and intensity
- **User Accounts**: Register, login, and manage user profiles
- **Favorites**: Save favorite products and playlists for quick access
- **Responsive Design**: Works on both desktop and mobile devices

## 🛠️ Technical Stack

- **Frontend**: Vue 3, Vuex, Vue Router, SCSS
- **Backend**: Node.js, Express.js, JWT authentication
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Development Tools**: ESLint, Babel

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (for local development only)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://your-repository-url/fitbeast.git
   cd fitbeast
   ```

2. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

4. Access the application at [http://localhost](http://localhost)

### Manual Setup

If you prefer to set up the application manually:

1. Create the ESLint configuration file in the `frontend` directory:
   ```bash
   cp .eslintrc.js frontend/
   ```

2. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

3. Wait for the containers to start and access the application at [http://localhost](http://localhost)

## 🏗️ Project Structure

```
fitbeast/
├── backend/               # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── config/            # Configuration files
│   └── utils/             # Utility functions
├── frontend/              # Vue.js frontend
│   ├── public/            # Static files
│   └── src/               # Source code
│       ├── assets/        # Images, styles, etc.
│       ├── components/    # Vue components
│       ├── views/         # Page components
│       ├── store/         # Vuex store
│       ├── router/        # Vue Router
│       └── services/      # API services
├── parser/                # Python data parser
├── .eslintrc.js           # ESLint configuration
├── docker-compose.yml     # Docker Compose configuration
├── deploy.sh              # Deployment script
└── README.md              # Project documentation
```

## 🔧 Development

### Local Development

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Run frontend development server:
   ```bash
   cd frontend
   npm run serve
   ```

4. Run backend development server:
   ```bash
   cd backend
   npm run dev
   ```

### Building for Production

Run the build script in the frontend directory:
```bash
cd frontend
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **Docker Containers Not Starting**:
   - Check Docker logs: `docker-compose logs`
   - Ensure ports 80 and 3000 are not being used by other applications

2. **Frontend Build Errors**:
   - Ensure ESLint configuration is present
   - Check that all Vue component files have at least an empty template or script section

3. **Database Connection Issues**:
   - Verify PostgreSQL container is running: `docker-compose ps postgres`
   - Check database connection parameters in backend environment variables

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ by the FitBeast Team
