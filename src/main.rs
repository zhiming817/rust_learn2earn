mod models;
mod controllers;
mod services;
mod routes;
mod database;
mod config;

use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use database::connection::create_pool;
use routes::task_routes::configure_task_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 加载环境变量
    dotenv::dotenv().ok();
    
    // 初始化日志
    //env_logger::init();
    
    // 创建数据库连接池
    let pool = create_pool().await;
    
    println!("Connected to MySQL database");
    println!("Server starting at http://127.0.0.1:8080");
    
    HttpServer::new(move || {
        // 配置 CORS
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173") // Vite 默认端口
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .max_age(3600);
        
        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .configure(configure_task_routes)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
