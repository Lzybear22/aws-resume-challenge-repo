variable "aws_profile" {
  description = "AWS CLI profile name"
  type        = string
  default     = "hunter.test"
}

provider "aws" {
  region  = "us-west-2"
  profile = var.aws_profile
}