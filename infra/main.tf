# Default provider
provider "aws" {
  region = var.aws_region
}

# US-East-1 provider for ACM certificates
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}