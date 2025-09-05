# Bentostream

A simple project to be an alternative to the multistre.am with a modular interface.

## TODO / Planned Features

- [x] Swap stream positions
  - [ ] Drag and drop to swap streams
- [x] Swap streams chats
- [x] Dynamically change streams
- [x] Add/remove streams chat
- [ ] Hide/show streams
- [x] Reload streams
- [x] Persist swap state in URL parameters
- [x] Custom layouts saving
  - [ ] Add list of saved layouts
- [ ] Stream favorites/bookmarks
- [x] Add twitch support
- [ ] Add youtube support
- [ ] Add kick support

## Development

```bash
# Install dependencies
pnpm i

# Start the development server
pnpm dev
```

## Deployment

### Using Docker

The application can be deployed using Docker. A Dockerfile is provided that creates a production-ready build.

```bash
# Build the Docker image
docker build -t bentostream .

# Run the container
docker run -p 3000:3000 bentostream
```

### Deploying on Coolify with GitHub Container Registry

1. **Push your code to GitHub**:
   - The CI/CD pipeline will automatically build and push the Docker image to GitHub Container Registry

2. **Deploy on Coolify**:
   - In Coolify, create a new application
   - Select "Docker Image" as the source
   - Use the image: `ghcr.io/quentinvdr/bentostream:latest`
   - Set the port to `3000`
   - Deploy!

The Docker image uses the `serve` package to serve the built React application with SPA routing support.
