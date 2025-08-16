mod models;
mod controllers;
mod services;
mod routes;
mod database;
mod config;
mod utils;
mod middleware;

use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_web_httpauth::middleware::HttpAuthentication;
use actix_cors::Cors;
use database::connection::create_pool;
use routes::{
    task_routes::configure_task_routes, 
    task_submission_routes::configure_task_submission_routes,
    auth_routes::{configure_auth_routes, configure_protected_auth_routes}
};
use utils::jwt::jwt_validator;
use services::auth_service::AuthService;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 加载环境变量
    dotenv::dotenv().ok();
    
    // 初始化日志
    env_logger::init();
    
    // 创建数据库连接池
    let pool = create_pool().await;
    
    // 初始化默认用户密码
    let auth_service = AuthService::new();
    if let Err(e) = auth_service.init_default_users(&pool).await {
        eprintln!("Failed to initialize default users: {}", e);
    }
    
    println!("Connected to MySQL database");
    println!("Default users: admin/admin123, demo/user123");
    println!("Server starting at http://127.0.0.1:8080");
    
    HttpServer::new(move || {
        // 配置 CORS
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173")
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .max_age(3600);
        
        // JWT 认证中间件
        let auth = HttpAuthentication::bearer(jwt_validator);
        
        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .configure(configure_auth_routes) // 公开的认证路由
            .service(
                web::scope("/api")
                    .wrap(auth) // 需要JWT认证的路由
                    .configure(configure_protected_auth_routes)
                    .configure(configure_task_routes)
                    .configure(configure_task_submission_routes)
                    
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
