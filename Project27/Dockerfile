FROM maven:3.8.6-openjdk-11 AS backend-build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=frontend-build /app/dist /app/static
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
