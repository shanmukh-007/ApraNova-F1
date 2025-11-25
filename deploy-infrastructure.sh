#!/bin/bash
set -e

echo "Starting AWS Infrastructure Deployment..."
echo ""

cd terraform

echo "Step 1: Validating Terraform configuration..."
terraform validate

echo ""
echo "Step 2: Creating execution plan..."
terraform plan -var-file=terraform.tfvars -out=tfplan

echo ""
echo "Step 3: Applying infrastructure changes..."
terraform apply tfplan

echo ""
echo "Step 4: Saving outputs..."
terraform output > ../terraform-outputs.txt

echo ""
echo "✅ Infrastructure deployment complete!"
echo ""
echo "Outputs saved to terraform-outputs.txt"
cat ../terraform-outputs.txt
