# main.tf
variable "aws_profile" {
  description = "AWS CLI profile name"
  type        = string
  default     = "hunter.test"
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
