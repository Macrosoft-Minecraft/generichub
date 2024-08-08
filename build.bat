@echo off
echo ================
echo Building image from Dockerfile...
echo ================
docker build -t gresendesa/generichub:1.0 .
echo ================
echo Pushing image...
echo ================
docker push gresendesa/generichub:1.0