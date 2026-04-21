FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/commute-split-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
