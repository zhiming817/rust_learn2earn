use actix_web::{web, HttpResponse, Result, HttpRequest};
use actix_web::HttpMessage;
use crate::models::user::{CreateUserRequest, LoginRequest};
use crate::services::auth_service::AuthService;
use crate::utils::jwt::Claims;
use sqlx::MySqlPool;

pub async fn login(
    pool: web::Data<MySqlPool>,
    login_data: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let auth_service = AuthService::new();
    auth_service.login(&pool, login_data.into_inner()).await
}

pub async fn create_user(
    pool: web::Data<MySqlPool>,
    user_data: web::Json<CreateUserRequest>,
) -> Result<HttpResponse> {
    let auth_service = AuthService::new();
    auth_service.create_user(&pool, user_data.into_inner()).await
}

pub async fn get_profile(req: HttpRequest) -> Result<HttpResponse> {
    if let Some(claims) = req.extensions().get::<Claims>() {
        Ok(HttpResponse::Ok().json(serde_json::json!({
            "id": claims.sub,
            "role": claims.role
        })))
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Authentication required"
        })))
    }
}

// 获取所有角色（用于创建用户时选择）
pub async fn get_roles(pool: web::Data<MySqlPool>) -> Result<HttpResponse> {
    let roles = sqlx::query_as::<_, crate::models::user::SysRole>(
        "SELECT id, role_key, role_name, status, created_at FROM sys_role WHERE status = 1"
    )
    .fetch_all(pool.as_ref())
    .await;

    match roles {
        Ok(roles) => Ok(HttpResponse::Ok().json(roles)),
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to fetch roles"
        }))),
    }
}

// 获取所有权限（用于管理界面）
pub async fn get_permissions(pool: web::Data<MySqlPool>) -> Result<HttpResponse> {
    let permissions = sqlx::query_as::<_, crate::models::user::SysPermission>(
        "SELECT id, perm_key, perm_name FROM sys_permission"
    )
    .fetch_all(pool.as_ref())
    .await;

    match permissions {
        Ok(permissions) => Ok(HttpResponse::Ok().json(permissions)),
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to fetch permissions"
        }))),
    }
}