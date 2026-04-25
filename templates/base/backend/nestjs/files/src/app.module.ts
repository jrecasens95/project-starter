import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
{{nodeBackendPrismaProviderImport}}{{nodeBackendDrizzleProviderImport}}{{nodeBackendSupabaseProviderImport}}{{nodeBackendAuthModuleImport}}
@Module({
  imports: [HealthModule, {{nodeBackendPrismaProviderEntry}}{{nodeBackendDrizzleProviderEntry}}{{nodeBackendSupabaseProviderEntry}}{{nodeBackendAuthModuleEntry}}],
  controllers: [],
  providers: []
})
export class AppModule {}
