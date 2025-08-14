use sqlx::{MySqlPool, mysql::MySqlPoolOptions};
use crate::config::settings::DatabaseSettings;

pub async fn create_pool() -> MySqlPool {
    let db_settings = DatabaseSettings::from_env();
    
    MySqlPoolOptions::new()
        .max_connections(db_settings.max_connections)
        .min_connections(db_settings.min_connections)
        .connect(&db_settings.url)
        .await
        .expect("Failed to connect to MySQL")
}