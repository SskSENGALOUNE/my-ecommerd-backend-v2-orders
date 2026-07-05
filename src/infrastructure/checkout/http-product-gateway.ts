import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IProductGateway,
  ReserveItem,
  ReservedProduct,
} from "../../domain/checkout/product-gateway";
import {
  BusinessRuleViolationException,
  NotFoundDomainException,
} from "../../domain/exceptions";
import type { AppConfig } from "../../config/app.config";

interface ReserveResponse {
  success?: boolean;
  data?: ReservedProduct[];
  error?: { code?: string; message?: string };
}

/**
 * Calls product-service's internal reserve endpoint over HTTP, authenticating
 * with the shared internal API key. Product-service's error envelope is mapped
 * back to our own domain exceptions so the checkout endpoint returns a sensible
 * status (404 unknown product, 422 inactive/out of stock).
 */
@Injectable()
export class HttpProductGateway implements IProductGateway {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    const cfg = config.get<AppConfig>("app")!.productService;
    this.baseUrl = cfg.url;
    this.apiKey = cfg.internalApiKey;
  }

  async reserveStock(items: ReserveItem[]): Promise<ReservedProduct[]> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/internal/products/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": this.apiKey,
        },
        body: JSON.stringify({ items }),
      });
    } catch {
      throw new BusinessRuleViolationException(
        "Product service is unavailable; please try again",
      );
    }

    const raw = await res.text();
    const json = (raw ? JSON.parse(raw) : null) as ReserveResponse | null;

    if (!res.ok || json?.success === false) {
      const message = json?.error?.message ?? "Failed to reserve stock";
      if (res.status === 404) {
        throw new NotFoundDomainException(message);
      }
      throw new BusinessRuleViolationException(message);
    }

    return json?.data ?? [];
  }
}
