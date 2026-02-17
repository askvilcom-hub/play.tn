# =============================================================================
# play.tn Terraform Outputs
# =============================================================================

# -----------------------------------------------------------------------------
# Cloud Run Service URLs
# -----------------------------------------------------------------------------

output "storefront_url" {
  description = "The URL of the storefront Cloud Run service"
  value       = google_cloud_run_v2_service.storefront.uri
}

output "user_api_url" {
  description = "The URL of the user-api Cloud Run service"
  value       = google_cloud_run_v2_service.user_api.uri
}

output "admin_api_url" {
  description = "The URL of the admin-api Cloud Run service"
  value       = google_cloud_run_v2_service.admin_api.uri
}

output "admin_frontend_url" {
  description = "The URL of the admin-frontend Cloud Run service"
  value       = google_cloud_run_v2_service.admin_frontend.uri
}

# -----------------------------------------------------------------------------
# Storage
# -----------------------------------------------------------------------------

output "media_bucket_name" {
  description = "The name of the media Cloud Storage bucket"
  value       = google_storage_bucket.media.name
}

output "media_bucket_url" {
  description = "The public URL for the media bucket"
  value       = "https://storage.googleapis.com/${google_storage_bucket.media.name}"
}

# -----------------------------------------------------------------------------
# Firestore
# -----------------------------------------------------------------------------

output "firestore_database" {
  description = "The Firestore database name"
  value       = google_firestore_database.main.name
}

# -----------------------------------------------------------------------------
# Load Balancer / CDN
# -----------------------------------------------------------------------------

output "storefront_lb_ip" {
  description = "The global static IP address for the storefront load balancer"
  value       = google_compute_global_address.storefront.address
}

output "storefront_ssl_certificate" {
  description = "The managed SSL certificate resource name"
  value       = google_compute_managed_ssl_certificate.storefront.name
}

# -----------------------------------------------------------------------------
# Service Accounts
# -----------------------------------------------------------------------------

output "storefront_service_account" {
  description = "The email of the storefront service account"
  value       = google_service_account.storefront_sa.email
}

output "user_api_service_account" {
  description = "The email of the user-api service account"
  value       = google_service_account.user_api_sa.email
}

output "admin_api_service_account" {
  description = "The email of the admin-api service account"
  value       = google_service_account.admin_api_sa.email
}

# -----------------------------------------------------------------------------
# Artifact Registry
# -----------------------------------------------------------------------------

output "docker_registry_url" {
  description = "The URL of the Docker Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}"
}

# -----------------------------------------------------------------------------
# Secret Manager
# -----------------------------------------------------------------------------

output "secret_ids" {
  description = "Map of secret names to their Secret Manager resource IDs"
  value = {
    stripe_secret_key = google_secret_manager_secret.stripe_secret_key.secret_id
    jwt_secret        = google_secret_manager_secret.jwt_secret.secret_id
    sendgrid_api_key  = google_secret_manager_secret.sendgrid_api_key.secret_id
    admin_jwt_secret  = google_secret_manager_secret.admin_jwt_secret.secret_id
  }
}

# -----------------------------------------------------------------------------
# DNS Configuration Helper
# -----------------------------------------------------------------------------

output "dns_records_required" {
  description = "DNS records that need to be configured for the domain"
  value = {
    storefront = {
      type  = "A"
      name  = var.environment == "prod" ? "@" : var.environment
      value = google_compute_global_address.storefront.address
    }
    storefront_www = var.environment == "prod" ? {
      type  = "CNAME"
      name  = "www"
      value = "${var.domain}."
    } : null
    user_api = {
      type  = "CNAME"
      name  = var.environment == "prod" ? "api" : "${var.environment}-api"
      value = "ghs.googlehosted.com."
      note  = "Configure via Cloud Run domain mapping"
    }
    admin = {
      type  = "CNAME"
      name  = var.environment == "prod" ? "admin" : "${var.environment}-admin"
      value = "ghs.googlehosted.com."
      note  = "Configure via Cloud Run domain mapping"
    }
  }
}

# -----------------------------------------------------------------------------
# Project Info
# -----------------------------------------------------------------------------

output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "The GCP region"
  value       = var.region
}

output "environment" {
  description = "The deployment environment"
  value       = var.environment
}
