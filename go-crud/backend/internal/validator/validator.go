package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

func ValidateStruct(s interface{}) map[string]string {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	errors := make(map[string]string)
	for _, err := range err.(validator.ValidationErrors) {
		field := err.Field()
		tag := err.Tag()
		switch tag {
		case "required":
			errors[field] = fmt.Sprintf("%s is required", field)
		case "email":
			errors[field] = fmt.Sprintf("%s must be a valid email", field)
		case "min":
			errors[field] = fmt.Sprintf("%s must be at least %s characters", field, err.Param())
		case "max":
			errors[field] = fmt.Sprintf("%s must not exceed %s characters", field, err.Param())
		case "oneof":
			errors[field] = fmt.Sprintf("%s must be one of [%s]", field, err.Param())
		default:
			errors[field] = fmt.Sprintf("%s failed validation on '%s'", field, tag)
		}
	}
	return errors
}
