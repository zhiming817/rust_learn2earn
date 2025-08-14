use sqlx::MySqlPool;
use crate::config::settings::DatabaseSettings;

pub async fn create_pool() -> MySqlPool {
    let db_settings = DatabaseSettings::from_env();
    
    MySqlPool::connect(&db_settings.url)
        .await
        .expect("Failed to connect to MySQL")
}