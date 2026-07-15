terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # backend "s3" {
  #   bucket  = "hunter-ulrich-tf-state"
  #   key     = "resume-website/terraform.tfstate"
  #   region  = "us-west-2"
  #   profile = "TestAdmin"
  # }
}
