import { Module } from "@nestjs/common";
import { OrderInfrastructureModule } from "../order/order-infrastructure.module";
import { CartInfrastructureModule } from "../cart/cart-infrastructure.module";
import { PRODUCT_GATEWAY } from "../../domain/checkout/product-gateway";
import { HttpProductGateway } from "./http-product-gateway";

/**
 * Wires checkout's dependencies: the order + cart repositories (re-exported from
 * their own infra modules) and the product-service gateway. Re-exporting the
 * order/cart infra modules also carries their `AuthInfrastructureModule`
 * (TOKEN_VERIFIER) through, so the checkout presentation module needs only this
 * single infra import.
 */
@Module({
  imports: [OrderInfrastructureModule, CartInfrastructureModule],
  providers: [{ provide: PRODUCT_GATEWAY, useClass: HttpProductGateway }],
  exports: [
    PRODUCT_GATEWAY,
    OrderInfrastructureModule,
    CartInfrastructureModule,
  ],
})
export class CheckoutInfrastructureModule {}
