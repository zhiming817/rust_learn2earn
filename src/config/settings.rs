pub struct DatabaseSettings {
    pub url: String,
}

impl DatabaseSettings {
    pub fn from_env() -> Self {
        Self {
            url: std::env::var("DATABASE_URL")
                .expect("DATABASE_URL must be set"),
        }
    }
}