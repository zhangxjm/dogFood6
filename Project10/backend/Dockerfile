FROM docker.1ms.run/library/maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM docker.1ms.run/library/eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/pet-grooming-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
