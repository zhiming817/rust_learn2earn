use crate::models::user::{SysUser, LoginRequest, LoginResponse, UserResponse, CreateUserRequest};
use crate::utils::jwt::JwtService;
use sqlx::MySqlPool;
use bcrypt::{hash, verify, DEFAULT_COST};
use actix_web::{web, HttpResponse, Result};
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;

pub struct AuthService {
    jwt_service: JwtService,
}

impl AuthService {
    pub fn new() -> Self {
        AuthService {
            jwt_service: JwtService::new(),
        }
    }

    fn generate_salt(&self) -> String {
        thread_rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect()
    }

    pub async fn login(&self, pool: &MySqlPool, login_data: LoginRequest) -> Result<HttpResponse> {
        // 查找用户
        let user = sqlx::query_as::<_, SysUser>(
            "SELECT id, username, password_hash, salt, status, created_at FROM sys_user WHERE username = ? AND status = 1"
        )
        .bind(&login_data.username)
        .fetch_optional(pool)
        .await;

        match user {
            Ok(Some(user)) => {
                // 生成用于验证的密码hash
                let password_with_salt = format!("{}{}", login_data.password, user.salt);
                
                if verify(&password_with_salt, &user.password_hash).unwrap_or(false) {
                    // 获取用户角色
                    let roles: Vec<String> = sqlx::query_scalar(
                        "SELECT r.role_key FROM sys_role r 
                         JOIN sys_user_role ur ON r.id = ur.role_id 
                         WHERE ur.user_id = ? AND r.status = 1"
                    )
                    .bind(user.id)
                    .fetch_all(pool)
                    .await
                    .unwrap_or_default();

                    // 获取用户权限
                    let permissions: Vec<String> = sqlx::query_scalar(
                        "SELECT DISTINCT p.perm_key FROM sys_permission p
                         JOIN sys_role_perm rp ON p.id = rp.perm_id
                         JOIN sys_user_role ur ON rp.role_id = ur.role_id
                         WHERE ur.user_id = ?"
                    )
                    .bind(user.id)
                    .fetch_all(pool)
                    .await
                    .unwrap_or_default();

                    let token = self.jwt_service.create_token(
                        &user.id.to_string(), 
                        &user.username
                    ).unwrap();
                    
                    Ok(HttpResponse::Ok().json(LoginResponse {
                        token,
                        user: UserResponse {
                            id: user.id,
                            username: user.username,
                            roles,
                            permissions,
                        },
                    }))
                } else {
                    Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                        "error": "Invalid credentials"
                    })))
                }
            }
            Ok(None) => Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid credentials"
            }))),
            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            }))),
        }
    }

    pub async fn create_user(&self, pool: &MySqlPool, user_data: CreateUserRequest) -> Result<HttpResponse> {
        // 检查用户是否已存在
        let existing_user = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM sys_user WHERE username = ?"
        )
        .bind(&user_data.username)
        .fetch_one(pool)
        .await;

        if let Ok(count) = existing_user {
            if count > 0 {
                return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "User already exists"
                })));
            }
        }

        // 生成盐值和密码hash
        let salt = self.generate_salt();
        let password_with_salt = format!("{}{}", user_data.password, salt);
        let password_hash = match hash(&password_with_salt, DEFAULT_COST) {
            Ok(hash) => hash,
            Err(_) => return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to hash password"
            }))),
        };

        // 开始事务
        let mut tx = pool.begin().await.unwrap();

        // 创建用户
        let user_result = sqlx::query(
            "INSERT INTO sys_user (username, password_hash, salt) VALUES (?, ?, ?)"
        )
        .bind(&user_data.username)
        .bind(&password_hash)
        .bind(&salt)
        .execute(&mut *tx)
        .await;

        match user_result {
            Ok(result) => {
                let user_id = result.last_insert_id() as i64;

                // 分配角色
                for role_id in user_data.role_ids {
                    sqlx::query("INSERT INTO sys_user_role (user_id, role_id) VALUES (?, ?)")
                        .bind(user_id)
                        .bind(role_id)
                        .execute(&mut *tx)
                        .await
                        .unwrap();
                }

                tx.commit().await.unwrap();

                Ok(HttpResponse::Created().json(serde_json::json!({
                    "message": "User created successfully",
                    "user_id": user_id
                })))
            }
            Err(_) => {
                tx.rollback().await.unwrap();
                Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to create user"
                })))
            }
        }
    }

    // 初始化默认用户密码（用于启动时重建demo用户密码）
    pub async fn init_default_users(&self, pool: &MySqlPool) -> Result<(), sqlx::Error> {
        // 为admin用户设置密码 admin123
        let admin_salt = self.generate_salt();
        let admin_password = format!("{}{}", "admin123", admin_salt);
        let admin_hash = hash(&admin_password, DEFAULT_COST).unwrap();
        
        sqlx::query("UPDATE sys_user SET password_hash = ?, salt = ? WHERE username = 'admin'")
            .bind(&admin_hash)
            .bind(&admin_salt)
            .execute(pool)
            .await?;

        // 为demo用户设置密码 user123
        let demo_salt = self.generate_salt();
        let demo_password = format!("{}{}", "user123", demo_salt);
        let demo_hash = hash(&demo_password, DEFAULT_COST).unwrap();
        
        sqlx::query("UPDATE sys_user SET password_hash = ?, salt = ? WHERE username = 'demo'")
            .bind(&demo_hash)
            .bind(&demo_salt)
            .execute(pool)
            .await?;

        println!("Default users initialized: admin/admin123, demo/user123");
        Ok(())
    }
}