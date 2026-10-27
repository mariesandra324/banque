FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY erp-bankin-api/pom.xml erp-bankin-api/pom.xml
COPY erp-bankin-api/src erp-bankin-api/src
RUN mvn -B -f erp-bankin-api/pom.xml -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/erp-bankin-api/target/erp-bankin-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx350m", "-jar", "app.jar"]