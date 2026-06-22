terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  
  # Uncomment and configure when ready for remote state
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "resume-website/terraform.tfstate"
  #   region = "us-west-2"
  # }
}