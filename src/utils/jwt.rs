use actix_web::{dev::ServiceRequest, Error, HttpMessage};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use chrono::{Duration, Utc};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // 用户ID
    pub role: String, // 用户角色
    pub exp: i64,     // 过期时间
    pub iat: i64,     // 签发时间
}

pub struct JwtService;

impl JwtService {
    pub fn new() -> Self {
        JwtService
    }

    pub fn create_token(&self, user_id: &str, role: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string());
        let now = Utc::now();
        let expire = now + Duration::hours(24); // 24小时过期

        let claims = Claims {
            sub: user_id.to_owned(),
            role: role.to_owned(),
            exp: expire.timestamp(),
            iat: now.timestamp(),
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_ref()),
        )
    }

    pub fn verify_token(&self, token: &str) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
        let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string());
        
        decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_ref()),
            &Validation::default(),
        )
    }
}

// JWT 验证中间件
pub async fn jwt_validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let jwt_service = JwtService::new();
    let token = credentials.token();

    match jwt_service.verify_token(token) {
        Ok(token_data) => {
            // 将用户信息添加到请求扩展中
            req.extensions_mut().insert(token_data.claims);
            Ok(req)
        }
        Err(_) => {
            let error = actix_web::error::ErrorUnauthorized("Invalid token");
            Err((error, req))
        }
    }
}