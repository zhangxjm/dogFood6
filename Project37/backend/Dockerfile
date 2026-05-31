FROM docker.1ms.run/library/maven:3.8.6-openjdk-11-slim AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

FROM docker.1ms.run/library/eclipse-temurin:11-jre-alpine

WORKDIR /app

COPY --from=build /app/target/document-archive-1.0.0.jar app.jar

RUN mkdir -p /app/data /app/data/documents

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
