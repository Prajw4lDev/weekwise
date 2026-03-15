# Stage 1: Build the Angular frontend
FROM node:22 AS frontend-build
WORKDIR /app/frontend

# Increase memory for the Angular build to prevent OOM on Render
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copy frontend source
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build the .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app/backend

# Copy backend source
COPY backend/ ./
RUN dotnet restore "src/Weekwise.Api/Weekwise.Api.csproj"
RUN dotnet publish "src/Weekwise.Api/Weekwise.Api.csproj" -c Release -o /app/publish

# Stage 3: Setup the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published backend
COPY --from=backend-build /app/publish .

# Copy built frontend into the wwwroot directory of the backend
COPY --from=frontend-build /app/frontend/dist/weekwise-frontend/browser ./wwwroot

# Expose the port (Render provides the PORT env variable)
EXPOSE 8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the app
ENTRYPOINT ["dotnet", "Weekwise.Api.dll"]
