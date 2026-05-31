package config

type Config struct {
	Port string
	Env  string
}

var AppConfig = Config{
	Port: "8080",
	Env:  "development",
}
