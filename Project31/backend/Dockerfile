FROM docker.1ms.run/library/eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/digital-twin-backend-1.0.0.jar app.jar

RUN mkdir -p /app/data

EXPOSE 8080

ENV JAVA_OPTS="-Xms512m -Xmx1024m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
