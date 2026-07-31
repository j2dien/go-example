package model

const (
	RoleUser       = "user"
	RoleAdmin      = "admin"
	RoleSuperAdmin = "superadmin"
)

func IsValidRole(role string) bool {
	switch role {
	case RoleUser, RoleAdmin, RoleSuperAdmin:
		return true
	default:
		return false
	}
}

func RoleHierarchy(role string) int {
	switch role {
	case RoleSuperAdmin:
		return 3
	case RoleAdmin:
		return 2
	case RoleUser:
		return 1
	default:
		return 0
	}
}
