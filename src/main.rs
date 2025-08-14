mod models;
mod controllers;
mod services;
mod routes;
mod database;
mod config;

use actix_web::{web, App, HttpServer};
use database::connection::create_pool;
use routes::task_routes::configure_task_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 加载环境变量
    dotenv::dotenv().ok();
    
    // 创建数据库连接池
    let pool = create_pool().await;
    
    println!("Connected to MySQL database");
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .configure(configure_task_routes)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
