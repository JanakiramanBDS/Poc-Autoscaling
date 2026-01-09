# NovaStream - Netflix-Style OTT Platform

## 🎬 Overview

A fully functional Netflix-style streaming platform built as a POC for AWS ECS Fargate autoscaling demonstration. Features a comprehensive movie catalog, dynamic content browsing, user profiles, watchlist management, and a premium dark-themed UI.

## ✨ Features

### Frontend
- **Netflix-Style Interface** - Premium dark theme with smooth animations
- **50+ Movie Catalog** - Organized across 7 categories
- **Profile Management** - Multiple user profiles with color-coded avatars
- **Hero Section** - Featured content with large banner
- **Movie Carousels** - Horizontal scrolling rows by category
- **Real-Time Search** - Instant search across titles, descriptions, and genres
- **Interactive Watchlist** - Add/remove movies per profile
- **Video Player Modal** - Simulated playback with controls
- **Responsive Design** - Works on desktop, tablet, and mobile

### Backend
- **RESTful API** - Comprehensive endpoints for movies, search, and watchlist
- **50 Movies** - Across Trending, Action, Sci-Fi, Drama, Comedy, Horror, Documentaries
- **Category Filtering** - Browse by genre/category
- **Search Functionality** - Multi-field search capability
- **Profile System** - User profile management with colors

### Infrastructure
- **AWS ECS Fargate** - Containerized deployment
- **Auto-scaling** - CPU/Memory-based scaling policies
- **CloudWatch** - Monitoring and alerting
- **Application Load Balancer** - Traffic distribution
- **ECR** - Container registry

## 🚀 Quick Start

### Deploy to AWS

```bash
cd scripts
./deploy.sh
```

This will:
1. Build the Docker image
2. Push to ECR
3. Update ECS service
4. Deploy to your infrastructure

After deployment, access the app at the ALB URL shown in the output.

### Local Development

```bash
# Install dependencies
cd app
npm install
cd client
npm install

# Build the client
npm run build

# Start the server
cd ..
npm start
```

Visit `http://localhost:80`

## 📁 Project Structure

```
ecs-enterprise-poc/
├── app/
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── App.jsx        # Main React component
│   │   │   ├── App.css        # Netflix-style CSS
│   │   │   ├── index.css      # Base styles
│   │   │   └── main.jsx       # React entry point
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── server.js              # Express backend with movie catalog
│   ├── Dockerfile
│   └── package.json
├── infra/                     # Terraform infrastructure
│   ├── autoscaling.tf
│   ├── ecs.tf
│   ├── network.tf
│   └── ...
└── scripts/
    ├── deploy.sh              # Deployment script
    ├── load-test.sh           # Load testing
    └── cost-report.sh         # Cost analysis
```

## 🎯 API Endpoints

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get specific movie
- `GET /api/movies/category/:category` - Filter by category
- `GET /api/search?q=query` - Search movies

### Profiles
- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create new profile
- `DELETE /api/profiles/:id` - Delete profile

### Watchlist
- `GET /api/watchlist` - Get watchlist items
- `POST /api/watchlist` - Add to watchlist (movieId, profileId)
- `DELETE /api/watchlist/:id` - Remove from watchlist
- `DELETE /api/watchlist/movie/:movieId` - Remove by movie ID

### Health
- `GET /health` - Health check for ALB

## 🎨 Categories

1. **Trending Now** - Popular current titles
2. **New Releases** - Latest additions
3. **Action & Adventure** - High-octane content
4. **Sci-Fi Collection** - Futuristic stories
5. **Drama & Romance** - Emotional narratives
6. **Comedy** - Light-hearted entertainment
7. **Horror & Thriller** - Suspenseful content
8. **Documentaries** - Educational content

## 🧪 Testing

### Manual Testing
1. Select a profile
2. Browse movie categories
3. Hover over movies to see details
4. Click Play to open video player
5. Add/remove movies from watchlist
6. Use search to find movies
7. Test on different screen sizes

### Load Testing
```bash
cd scripts
./load-test.sh
```

Monitor ECS service scaling in AWS Console and CloudWatch dashboard.

### API Testing
```bash
# Get all movies
curl http://YOUR_ALB_URL/api/movies

# Search
curl http://YOUR_ALB_URL/api/search?q=action

# Get category
curl http://YOUR_ALB_URL/api/movies/category/trending
```

## 📊 Monitoring

- **CloudWatch Dashboard** - Executive dashboard with metrics
- **CloudWatch Alarms** - High CPU/Memory alerts
- **ECS Service Metrics** - Task count, CPU, memory usage
- **ALB Metrics** - Request count, latency, health checks

## 🔧 Configuration

Edit `.env` file to configure:
- AWS region
- Project name
- Alert email
- IP whitelist for bastion

## 💡 Key Technologies

- **Frontend**: React, Vite, CSS3
- **Backend**: Node.js, Express
- **Infrastructure**: AWS ECS Fargate, Terraform
- **Containerization**: Docker
- **Monitoring**: CloudWatch

## 📝 Notes

- Movie thumbnails use Picsum placeholder service
- Video player simulates playback (no actual video streaming)
- Watchlist is in-memory (resets on server restart)
- All data is demo/mock data for POC purposes

## 🎓 Learning Outcomes

This POC demonstrates:
- ✅ Container orchestration with ECS Fargate
- ✅ Auto-scaling based on metrics
- ✅ Infrastructure as Code with Terraform
- ✅ Full-stack application development
- ✅ RESTful API design
- ✅ Modern React patterns and hooks
- ✅ Responsive web design
- ✅ CloudWatch monitoring and alerting

## 📧 Support

For issues or questions, check the CloudWatch logs or review the walkthrough documentation in `.gemini/antigravity/brain/*/walkthrough.md`.

---

**Built with ❤️ for AWS ECS Fargate Autoscaling Demonstration**
