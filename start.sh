#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Merry Go Round Chamaa Development Environment${NC}"

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Creating environment files...${NC}"

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
fi

echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
docker-compose exec backend npm run migrate

echo -e "${GREEN}✅ Environment is ready!${NC}"
echo -e "${GREEN}📱 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}🔌 Backend: http://localhost:5000${NC}"
echo -e "${GREEN}🗄️  Database: localhost:5432${NC}"
echo -e "${GREEN}💾 Redis: localhost:6379${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  docker-compose logs -f backend  # View backend logs"
echo "  docker-compose logs -f frontend # View frontend logs"
echo "  docker-compose down             # Stop all services"
echo "  ./stop.sh                       # Stop development"
