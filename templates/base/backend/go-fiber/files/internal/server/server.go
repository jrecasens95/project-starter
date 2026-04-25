package server

import (
	"github.com/gofiber/fiber/v2"

	healthhttp "{{projectSlug}}/internal/features/health/http"
{{backendFeatureImports}}{{backendModuleImports}})

func New() (*fiber.App, error) {
{{backendStartupLines}}	app := fiber.New()

	healthhttp.RegisterRoutes(app)
{{backendRouteRegistrations}}

	return app, nil
}
