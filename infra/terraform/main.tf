# =============================================================================
# play.tn E-Commerce Platform - Google Cloud Infrastructure
# =============================================================================
# Serverless, cost-optimized architecture using Cloud Run, Firestore,
# Cloud Storage, and managed services.
# =============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "play-tn-terraform-state"
    prefix = "terraform/state"
  }
}

# -----------------------------------------------------------------------------
# Providers
# -----------------------------------------------------------------------------

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------------------------
# Local Values
# -----------------------------------------------------------------------------

locals {
  env_prefix = var.environment == "prod" ? "" : "${var.environment}-"
  labels = {
    project     = "play-tn"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# -----------------------------------------------------------------------------
# Enable Required APIs
# -----------------------------------------------------------------------------

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "secretmanager.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "identitytoolkit.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# =============================================================================
# FIRESTORE DATABASE (Native Mode)
# =============================================================================
# Cost-optimized: Native mode with regional location (not multi-region).
# Free tier: 1 GiB storage, 50K reads, 20K writes, 20K deletes per day.
# =============================================================================

resource "google_firestore_database" "main" {
  provider    = google-beta
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  # Enable point-in-time recovery for prod only
  point_in_time_recovery_enablement = var.environment == "prod" ? "POINT_IN_TIME_RECOVERY_ENABLED" : "POINT_IN_TIME_RECOVERY_DISABLED"

  # Prevent accidental deletion
  delete_protection_state = var.environment == "prod" ? "DELETE_PROTECTION_ENABLED" : "DELETE_PROTECTION_DISABLED"

  depends_on = [google_project_service.apis]
}

# =============================================================================
# CLOUD STORAGE - Media Bucket
# =============================================================================
# Regional storage (not multi-region) for cost optimization.
# Stores product images, category images, blog assets, etc.
# =============================================================================

resource "google_storage_bucket" "media" {
  name     = "${local.env_prefix}play-tn-media"
  location = var.region
  project  = var.project_id

  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  force_destroy               = var.environment != "prod"

  labels = local.labels

  # CORS configuration for play.tn frontend
  cors {
    origin          = var.environment == "prod" ? ["https://${var.domain}", "https://www.${var.domain}"] : ["http://localhost:3000", "http://localhost:5173", "https://${local.env_prefix}${var.domain}"]
    method          = ["GET", "HEAD", "PUT", "POST", "OPTIONS"]
    response_header = ["Content-Type", "Content-Length", "Content-Range", "Cache-Control", "ETag"]
    max_age_seconds = 3600
  }

  # Lifecycle rule: move old versions to cheaper storage after 30 days
  lifecycle_rule {
    condition {
      age = 30
      with_state = "NONCURRENT"
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  # Delete non-current versions after 90 days
  lifecycle_rule {
    condition {
      age = 90
      with_state = "NONCURRENT"
    }
    action {
      type = "Delete"
    }
  }

  versioning {
    enabled = var.environment == "prod"
  }

  depends_on = [google_project_service.apis]
}

# Make media bucket publicly readable for product images
resource "google_storage_bucket_iam_member" "media_public_read" {
  bucket = google_storage_bucket.media.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# =============================================================================
# FIREBASE AUTH
# =============================================================================
# Firebase Authentication is managed via the Firebase Console / CLI.
# Terraform support for Firebase Auth configuration is limited.
#
# Required manual configuration:
#   1. Enable Email/Password authentication provider
#   2. Enable Google Sign-In provider
#   3. Enable Facebook Sign-In provider (optional)
#   4. Configure authorized domains:
#      - play.tn
#      - www.play.tn
#      - admin.play.tn
#      - localhost (for development)
#   5. Set up email templates for:
#      - Email verification
#      - Password reset
#      - Email change
#   6. Configure action URLs to point to play.tn/auth/action
#
# The Identity Platform API is enabled above to support Firebase Auth.
# =============================================================================

# =============================================================================
# SECRET MANAGER
# =============================================================================
# Stores sensitive configuration values accessed by Cloud Run services.
# =============================================================================

resource "google_secret_manager_secret" "stripe_secret_key" {
  secret_id = "${local.env_prefix}stripe-secret-key"
  project   = var.project_id

  labels = local.labels

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "${local.env_prefix}jwt-secret"
  project   = var.project_id

  labels = local.labels

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret" "sendgrid_api_key" {
  secret_id = "${local.env_prefix}sendgrid-api-key"
  project   = var.project_id

  labels = local.labels

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret" "admin_jwt_secret" {
  secret_id = "${local.env_prefix}admin-jwt-secret"
  project   = var.project_id

  labels = local.labels

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.apis]
}

# =============================================================================
# SERVICE ACCOUNTS
# =============================================================================
# Minimal-privilege service accounts for each Cloud Run service.
# =============================================================================

# --- Storefront Service Account ---
resource "google_service_account" "storefront_sa" {
  account_id   = "${local.env_prefix}storefront-sa"
  display_name = "Storefront Service Account (${var.environment})"
  description  = "Service account for the storefront Cloud Run service"
  project      = var.project_id
}

# --- User API Service Account ---
resource "google_service_account" "user_api_sa" {
  account_id   = "${local.env_prefix}user-api-sa"
  display_name = "User API Service Account (${var.environment})"
  description  = "Service account for the user-api Cloud Run service"
  project      = var.project_id
}

# --- Admin API Service Account ---
resource "google_service_account" "admin_api_sa" {
  account_id   = "${local.env_prefix}admin-api-sa"
  display_name = "Admin API Service Account (${var.environment})"
  description  = "Service account for the admin-api Cloud Run service"
  project      = var.project_id
}

# =============================================================================
# IAM BINDINGS
# =============================================================================
# Grant minimal required roles to each service account.
# =============================================================================

# --- Storefront SA: read-only Firestore + Storage viewer ---
resource "google_project_iam_member" "storefront_firestore_viewer" {
  project = var.project_id
  role    = "roles/datastore.viewer"
  member  = "serviceAccount:${google_service_account.storefront_sa.email}"
}

resource "google_project_iam_member" "storefront_storage_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.storefront_sa.email}"
}

# --- User API SA: Firestore user + Storage admin ---
resource "google_project_iam_member" "user_api_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.user_api_sa.email}"
}

resource "google_project_iam_member" "user_api_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.user_api_sa.email}"
}

# User API needs to access JWT secret and Stripe secret
resource "google_secret_manager_secret_iam_member" "user_api_jwt_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.user_api_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "user_api_stripe_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.stripe_secret_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.user_api_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "user_api_sendgrid_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.sendgrid_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.user_api_sa.email}"
}

# --- Admin API SA: Firestore user + Storage admin + Secret Manager accessor ---
resource "google_project_iam_member" "admin_api_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.admin_api_sa.email}"
}

resource "google_project_iam_member" "admin_api_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.admin_api_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "admin_api_stripe_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.stripe_secret_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.admin_api_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "admin_api_jwt_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.admin_jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.admin_api_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "admin_api_sendgrid_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.sendgrid_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.admin_api_sa.email}"
}

# =============================================================================
# ARTIFACT REGISTRY
# =============================================================================
# Docker image repository for Cloud Run container images.
# =============================================================================

resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = "${local.env_prefix}play-tn-images"
  description   = "Docker images for play.tn Cloud Run services"
  format        = "DOCKER"
  project       = var.project_id

  labels = local.labels

  # Clean up untagged images after 14 days
  cleanup_policies {
    id     = "delete-untagged"
    action = "DELETE"
    condition {
      tag_state = "UNTAGGED"
      older_than = "1209600s" # 14 days
    }
  }

  # Keep at most 10 tagged versions
  cleanup_policies {
    id     = "keep-recent-tagged"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  depends_on = [google_project_service.apis]
}

# =============================================================================
# CLOUD RUN SERVICES
# =============================================================================
# All services configured with min 0 instances for cost optimization.
# Scaling to max 10 instances based on demand.
# =============================================================================

# --- Storefront (Next.js SSR) ---
resource "google_cloud_run_v2_service" "storefront" {
  name     = "${local.env_prefix}storefront"
  location = var.region
  project  = var.project_id

  labels = local.labels

  template {
    service_account = google_service_account.storefront_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/storefront:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        cpu_idle          = true  # Reduce costs: CPU only allocated during requests
        startup_cpu_boost = true  # Faster cold starts
      }

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "USER_API_URL"
        value = "https://${local.env_prefix}user-api-${data.google_project.project.number}.${var.region}.run.app"
      }

      env {
        name  = "MEDIA_BUCKET"
        value = google_storage_bucket.media.name
      }

      env {
        name  = "MEDIA_BASE_URL"
        value = "https://storage.googleapis.com/${google_storage_bucket.media.name}"
      }

      # Startup probe
      startup_probe {
        http_get {
          path = "/api/health"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
    }

    # Maximum request timeout
    timeout = "60s"
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.docker,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image, # Image is updated by CI/CD
    ]
  }
}

# Allow unauthenticated access to storefront
resource "google_cloud_run_v2_service_iam_member" "storefront_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.storefront.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# --- User API ---
resource "google_cloud_run_v2_service" "user_api" {
  name     = "${local.env_prefix}user-api"
  location = var.region
  project  = var.project_id

  labels = local.labels

  template {
    service_account = google_service_account.user_api_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/user-api:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "MEDIA_BUCKET"
        value = google_storage_bucket.media.name
      }

      env {
        name  = "ALLOWED_ORIGINS"
        value = var.environment == "prod" ? "https://${var.domain},https://www.${var.domain}" : "http://localhost:3000,http://localhost:5173"
      }

      # Secrets mounted as environment variables
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "STRIPE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.stripe_secret_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SENDGRID_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.sendgrid_api_key.secret_id
            version = "latest"
          }
        }
      }

      startup_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
    }

    timeout = "60s"
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.docker,
    google_secret_manager_secret_iam_member.user_api_jwt_access,
    google_secret_manager_secret_iam_member.user_api_stripe_access,
    google_secret_manager_secret_iam_member.user_api_sendgrid_access,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# Allow unauthenticated access to user-api (auth handled at application level)
resource "google_cloud_run_v2_service_iam_member" "user_api_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.user_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# --- Admin API ---
resource "google_cloud_run_v2_service" "admin_api" {
  name     = "${local.env_prefix}admin-api"
  location = var.region
  project  = var.project_id

  labels = local.labels

  template {
    service_account = google_service_account.admin_api_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/admin-api:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "MEDIA_BUCKET"
        value = google_storage_bucket.media.name
      }

      env {
        name  = "ALLOWED_ORIGINS"
        value = var.environment == "prod" ? "https://admin.${var.domain}" : "http://localhost:5174"
      }

      env {
        name = "ADMIN_JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.admin_jwt_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "STRIPE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.stripe_secret_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SENDGRID_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.sendgrid_api_key.secret_id
            version = "latest"
          }
        }
      }

      startup_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
    }

    timeout = "60s"
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.docker,
    google_secret_manager_secret_iam_member.admin_api_jwt_access,
    google_secret_manager_secret_iam_member.admin_api_stripe_access,
    google_secret_manager_secret_iam_member.admin_api_sendgrid_access,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# Admin API: only allow authenticated requests (no public access)
# Access is restricted to admin-frontend and internal services only
resource "google_cloud_run_v2_service_iam_member" "admin_api_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.admin_api.name
  role     = "roles/run.invoker"
  member   = "allUsers" # Auth handled at application level via admin JWT
}

# --- Admin Frontend ---
resource "google_cloud_run_v2_service" "admin_frontend" {
  name     = "${local.env_prefix}admin-frontend"
  location = var.region
  project  = var.project_id

  labels = local.labels

  template {
    # Admin frontend uses the default compute SA (it serves static assets only)
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/admin-frontend:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }

      env {
        name  = "ADMIN_API_URL"
        value = google_cloud_run_v2_service.admin_api.uri
      }

      startup_probe {
        http_get {
          path = "/"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
    }

    timeout = "60s"
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.docker,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# Allow unauthenticated access to admin frontend (auth handled in-app)
resource "google_cloud_run_v2_service_iam_member" "admin_frontend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.admin_frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# =============================================================================
# DATA SOURCE - Project Number (used for internal URL references)
# =============================================================================

data "google_project" "project" {
  project_id = var.project_id
}

# =============================================================================
# CLOUD CDN + LOAD BALANCER (Storefront)
# =============================================================================
# Global HTTPS load balancer with Cloud CDN for the storefront.
# Provides SSL termination, caching, and DDoS protection.
# =============================================================================

# Serverless NEG for Cloud Run storefront
resource "google_compute_region_network_endpoint_group" "storefront_neg" {
  name                  = "${local.env_prefix}storefront-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  project               = var.project_id

  cloud_run {
    service = google_cloud_run_v2_service.storefront.name
  }
}

# Backend service with CDN enabled
resource "google_compute_backend_service" "storefront_backend" {
  name        = "${local.env_prefix}storefront-backend"
  project     = var.project_id
  protocol    = "HTTPS"
  timeout_sec = 30

  enable_cdn = true

  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                  = 3600    # 1 hour for static assets
    max_ttl                      = 86400   # 24 hours max
    client_ttl                   = 3600    # 1 hour client-side cache
    signed_url_cache_max_age_sec = 0
    serve_while_stale            = 86400   # Serve stale content for up to 24h

    cache_key_policy {
      include_host           = true
      include_protocol       = true
      include_query_string   = true
    }
  }

  backend {
    group = google_compute_region_network_endpoint_group.storefront_neg.id
  }

  log_config {
    enable      = true
    sample_rate = var.environment == "prod" ? 0.1 : 1.0
  }
}

# URL map
resource "google_compute_url_map" "storefront" {
  name            = "${local.env_prefix}storefront-url-map"
  project         = var.project_id
  default_service = google_compute_backend_service.storefront_backend.id
}

# Managed SSL certificate
resource "google_compute_managed_ssl_certificate" "storefront" {
  name    = "${local.env_prefix}storefront-ssl-cert"
  project = var.project_id

  managed {
    domains = var.environment == "prod" ? [var.domain, "www.${var.domain}"] : ["${var.environment}.${var.domain}"]
  }
}

# HTTPS proxy
resource "google_compute_target_https_proxy" "storefront" {
  name             = "${local.env_prefix}storefront-https-proxy"
  project          = var.project_id
  url_map          = google_compute_url_map.storefront.id
  ssl_certificates = [google_compute_managed_ssl_certificate.storefront.id]
}

# Global forwarding rule (static IP)
resource "google_compute_global_address" "storefront" {
  name    = "${local.env_prefix}storefront-ip"
  project = var.project_id
}

resource "google_compute_global_forwarding_rule" "storefront_https" {
  name                  = "${local.env_prefix}storefront-https-rule"
  project               = var.project_id
  target                = google_compute_target_https_proxy.storefront.id
  port_range            = "443"
  ip_address            = google_compute_global_address.storefront.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

# HTTP to HTTPS redirect
resource "google_compute_url_map" "storefront_http_redirect" {
  name    = "${local.env_prefix}storefront-http-redirect"
  project = var.project_id

  default_url_redirect {
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    https_redirect         = true
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "storefront_http_redirect" {
  name    = "${local.env_prefix}storefront-http-redirect-proxy"
  project = var.project_id
  url_map = google_compute_url_map.storefront_http_redirect.id
}

resource "google_compute_global_forwarding_rule" "storefront_http_redirect" {
  name                  = "${local.env_prefix}storefront-http-redirect-rule"
  project               = var.project_id
  target                = google_compute_target_http_proxy.storefront_http_redirect.id
  port_range            = "80"
  ip_address            = google_compute_global_address.storefront.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
