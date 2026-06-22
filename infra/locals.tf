locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
  
  svg_images  = fileset("../website/images", "*.svg")
  jpeg_images = fileset("../website/images", "*.JPEG")
}
