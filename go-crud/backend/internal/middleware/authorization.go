package middleware

import (
	"go-crud-api/internal/model"
	"go-crud-api/pkg/jwt"
	"go-crud-api/pkg/response"

	"github.com/gin-gonic/gin"
)

func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claimsVal, exists := c.Get(AuthUserKey)
		if !exists {
			response.Unauthorized(c, "Unauthorized access")
			c.Abort()
			return
		}

		claims, ok := claimsVal.(*jwt.Claims)
		if !ok {
			response.Unauthorized(c, "Invalid token claims")
			c.Abort()
			return
		}

		// Superadmin always bypasses role checks
		if claims.Role == model.RoleSuperAdmin {
			c.Next()
			return
		}

		isAllowed := false
		for _, role := range allowedRoles {
			if claims.Role == role {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			response.Forbidden(c, "You do not have permission to access this resource")
			c.Abort()
			return
		}

		c.Next()
	}
}

func MinRoleMiddleware(minRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claimsVal, exists := c.Get(AuthUserKey)
		if !exists {
			response.Unauthorized(c, "Unauthorized access")
			c.Abort()
			return
		}

		claims, ok := claimsVal.(*jwt.Claims)
		if !ok {
			response.Unauthorized(c, "Invalid token claims")
			c.Abort()
			return
		}

		if model.RoleHierarchy(claims.Role) < model.RoleHierarchy(minRole) {
			response.Forbidden(c, "Insufficient permission level")
			c.Abort()
			return
		}

		c.Next()
	}
}
