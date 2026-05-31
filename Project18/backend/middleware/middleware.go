package middleware

import (
	"log"
	"time"

	"github.com/labstack/echo/v4"
)

func Logger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()
			err := next(c)
			latency := time.Since(start)

			log.Printf("[%s] %s %s %d %v",
				c.Request().Method,
				c.Request().RequestURI,
				c.RealIP(),
				c.Response().Status,
				latency,
			)

			return err
		}
	}
}

func CORS() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Access-Control-Allow-Origin", "*")
			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Response().Header().Set("Access-Control-Max-Age", "86400")

			if c.Request().Method == "OPTIONS" {
				return c.NoContent(204)
			}

			return next(c)
		}
	}
}
