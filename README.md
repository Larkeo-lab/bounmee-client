# Vite & HeroUI Template

This is a template for creating applications using Vite and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/vite-template)

## Technologies Used

- [Vite](https://vitejs.dev/guide/)
- [HeroUI](https://heroui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)
- [React Router DOM](https://reactrouter.com/en/main)
- [React Query](https://react-query.tanstack.com)
- [Lucide-react](https://lucide.dev)

## How to Use

To clone the project, run the following command:

```bash
git clone https://github.com/heroui-inc/vite-template.git
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
pnpm install
```

### Run the development server

```bash
pnpm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## Docker Deployment

### Quick Start with Helper Scripts

```bash
# Start the application
./docker-start.sh

# Check status and get URL
./docker-status.sh
```

### Manual Docker Commands

**Using Docker Compose (Recommended):**

```bash
# Build and start the container
docker-compose up -d --build

# The application will be available at:
# 👉 http://localhost:8080
```

**Using Docker directly:**

```bash
# Build the image
docker build -t smart-odsc-admin .

# Run the container
docker run -p 8080:80 --name smart-odsc-admin smart-odsc-admin
```

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Restart the container
docker-compose restart

# Rebuild without cache
docker-compose build --no-cache

# Check container status
docker ps
```

### Application URL

Once the container is running, access the application at:

- **Local:** http://localhost:8080
- **Network:** http://YOUR_IP:8080 (replace YOUR_IP with your machine's IP)

## Developed by

LaiLaoLab ICT Solution., LTD

- [https://www.lailaolab.com](https://www.lailaolab.com)
