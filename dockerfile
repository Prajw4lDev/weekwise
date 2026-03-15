# Stage 1: Build the Angular frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npx ng build --configuration=production

# Stage 2: Build the .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app/backend

COPY backend/ ./
RUN dotnet restore "src/Weekwise.Api/Weekwise.Api.csproj"
RUN dotnet publish "src/Weekwise.Api/Weekwise.Api.csproj" -c Release -o /app/publish

# Stage 3: Setup the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=backend-build /app/publish .

# Copy built frontend into the wwwroot directory
COPY --from=frontend-build /app/frontend/dist/weekwise-frontend/browser ./wwwroot

EXPOSE 8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Weekwise.Api.dll"]
