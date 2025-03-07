#!/bin/bash

# Stop on any error
set -e

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting FitBeast deployment...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running or not installed${NC}"
  exit 1
fi

echo -e "${GREEN}1. Copying ESLint configuration to frontend directory...${NC}"
cp .eslintrc.js frontend/

echo -e "${GREEN}2. Copying empty PlaylistsPage.vue if it doesn't exist...${NC}"
mkdir -p frontend/src/views
if [ ! -s frontend/src/views/PlaylistsPage.vue ]; then
  echo "Creating PlaylistsPage.vue template"
  cat > frontend/src/views/PlaylistsPage.vue << 'EOL'
<template>
  <div class="playlists-page container">
    <h1>Плейлисты</h1>
    <p>В разработке...</p>
  </div>
</template>

<script>
export default {
  name: 'PlaylistsPage'
}
</script>
EOL
fi

echo -e "${GREEN}3. Building and starting containers...${NC}"
docker-compose down
docker-compose build --no-cache
# docker-compose build
docker-compose up -d

echo -e "${GREEN}4. Checking service health...${NC}"
sleep 5
echo "Postgres: $(docker-compose ps postgres | grep Up || echo 'Not running')"
echo "Backend: $(docker-compose ps backend | grep Up || echo 'Not running')"
echo "Frontend: $(docker-compose ps frontend | grep Up || echo 'Not running')"

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Application should be available at http://localhost${NC}"