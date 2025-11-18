#!/bin/sh

# Setup steps for working with LocalStack and DynamoDB local instead of AWS.
# Assumes aws cli is installed and LocalStack and DynamoDB local are running.

# Setup AWS environment variables
echo "Setting AWS environment variables for LocalStack"

echo "AWS_ACCESS_KEY_ID=test"
export AWS_ACCESS_KEY_ID=ASIA2UC27PXR2WCVHW64

echo "AWS_SECRET_ACCESS_KEY=test"
export AWS_SECRET_ACCESS_KEY=9JCLdHTbI774rpP7yxZ9jVDc0McoUdffC2M5QTse

echo "AWS_SESSION_TOKEN=test"
export AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEPH//////////wEaCXVzLXdlc3QtMiJHMEUCIFEDGXtqc8OERAYPR7QlGV2vn5KtWRir536dfGig4PSaAiEApzHGei+YBGelYa+vwlGM2IwD1+LJFfS4uIkOhqcmwQMqugIIuv//////////ARAAGgw3MzAzMzUyNDc4NDMiDBcSKJYybx1iXsMKLCqOAuI6h+weeqneTe1AZ3lXPY3lM4CQD591RgldQVqdd9GM9Xs+oRclGzNGDWLMD2HGbMx8krCtZuOnslQ4U7xILWNvv164oQFkuYBSbmBeC6IDeu3lO0vKYD6gejfU5gcsifQLC1BQIFmW+nL0XdAxFC7tPz4WVig+itMsrS/S7x6U1ztzZR3G1jugSeGMUaXd6ZA3eHQUsd0L/4BBu9c4BY2KZIgDvyKZuhy4xSJWzvBdqW1wyfdVXFARGaGlCulo+iMxAg8mF1wDwf/Uc1mKpNAOBpsg4NAOJ+lj58N6N2oidfJQpPxmD0lcZnmfuYq7TKxNIjn42Mhf9Z+w06K2bWezIt43mzMbsh2Csko6EjDUhO/IBjqdAeu+PVsnrzrgEBaeNES5Si5vPvxrBjTdJvj+zkBesYfWrSqD9OtL3LuhVGLrv9VtgO9YYJ5kv4vRTkJLpCMPszKP4SBiCsSYF2Vg9sg2XDuqFKk8DjUNUFf8x33FmTzr1xoF+d+pwtnWlEyxgL0lk6rNkty41W2Y3RtFiUWIIn2UYkmPBB8R4iIQnm6SvVhh6Bbi0rGJSlzywhDwUa8=

export AWS_DEFAULT_REGION=us-east-1
echo "AWS_DEFAULT_REGION=us-east-1"

# Wait for LocalStack to be ready, by inspecting the response from healthcheck
echo 'Waiting for LocalStack S3...'
until (curl --silent http://localhost:4566/_localstack/health | grep "\"s3\": \"\(running\|available\)\"" > /dev/null); do
    sleep 5
done
echo 'LocalStack S3 Ready'

# Create our S3 bucket with LocalStack
echo "Creating LocalStack S3 bucket: fragments"
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments

# Setup DynamoDB Table with dynamodb-local, see:
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html
echo "Creating DynamoDB-Local DynamoDB table: fragments"
aws --endpoint-url=http://localhost:8000 \
dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

# Wait until the Fragments table exists in dynamodb-local, so we can use it, see:
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/wait/table-exists.html
aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments
