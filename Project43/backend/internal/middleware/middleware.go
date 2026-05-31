package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"bci-rehab/pkg/security"
)

func JWTMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未提供认证令牌"})
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "认证令牌格式错误"})
			}

			claims, err := security.ValidateToken(parts[1])
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "认证令牌无效或已过期"})
			}

			c.Set("userID", claims.UserID)
			c.Set("username", claims.Username)
			c.Set("role", claims.Role)

			return next(c)
		}
	}
}

func RoleMiddleware(allowedRoles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			role, ok := c.Get("role").(string)
			if !ok {
				return c.JSON(http.StatusForbidden, map[string]string{"error": "无法获取用户角色"})
			}

			for _, allowed := range allowedRoles {
				if role == allowed {
					return next(c)
				}
			}

			return c.JSON(http.StatusForbidden, map[string]string{"error": "权限不足"})
		}
	}
}

func SecurityHeaders() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("X-Content-Type-Options", "nosniff")
			c.Response().Header().Set("X-Frame-Options", "DENY")
			c.Response().Header().Set("X-XSS-Protection", "1; mode=block")
			c.Response().Header().Set("Content-Security-Policy", "default-src 'self'")
			c.Response().Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
			return next(c)
		}
	}
}

func CORSMiddleware(allowedOrigin string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Response().Header().Set("Access-Control-Allow-Credentials", "true")

			if c.Request().Method == http.MethodOptions {
				return c.NoContent(http.StatusNoContent)
			}

			return next(c)
		}
	}
}

func AuditLog() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userID, _ := c.Get("userID").(int64)
			method := c.Request().Method
			path := c.Request().URL.Path

			go func(uid int64, m, p string) {
				if uid > 0 {
					// Audit logging can be implemented here
				}
			}(userID, method, path)

			return next(c)
		}
	}
}
