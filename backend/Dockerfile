FROM --platform=linux/amd64 eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY target/applicant-tracking-system-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
