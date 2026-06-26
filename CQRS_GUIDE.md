# CQRS Implementation Guide

## Overview

This project implements the CQRS (Command Query Responsibility Segregation) pattern using NestJS CQRS module.

## Structure

### Commands (Write Operations)

Located in `src/application/[module]/commands/`

**Purpose**: Modify state (Create, Update, Delete)

**Components**:

1. **Command Class**: Plain DTO containing the data
2. **Command Handler**: Executes the business logic

**Example**:

```typescript
// create-ex-table.command.ts
export class CreateExTableCommand {
  constructor(
    public readonly name: string,
    public readonly createdBy: string,
  ) {}
}

// create-ex-table.handler.ts
@CommandHandler(CreateExTableCommand)
export class CreateExTableHandler implements ICommandHandler<CreateExTableCommand> {
  async execute(command: CreateExTableCommand) {
    // Business logic here
  }
}
```

### Queries (Read Operations)

Located in `src/application/[module]/queries/`

**Purpose**: Retrieve data without modifying state

**Components**:

1. **Query Class**: Plain DTO containing search parameters
2. **Query Handler**: Fetches and returns data

**Example**:

```typescript
// get-ex-table-by-id.query.ts
export class GetExTableByIdQuery {
  constructor(public readonly id: string) {}
}

// get-ex-table-by-id.handler.ts
@QueryHandler(GetExTableByIdQuery)
export class GetExTableByIdHandler implements IQueryHandler<GetExTableByIdQuery> {
  async execute(query: GetExTableByIdQuery) {
    // Fetch data here
  }
}
```

## Layer Responsibilities

### 1. Presentation Layer (`src/presentation/`)

- Controllers receive HTTP requests
- Dispatch commands/queries to CQRS buses
- Return responses

```typescript
@Controller('ex-tables')
export class ExTableController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateExTableDto) {
    const command = new CreateExTableCommand(dto.name, dto.createdBy);
    return await this.commandBus.execute(command);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const query = new GetExTableByIdQuery(id);
    return await this.queryBus.execute(query);
  }
}
```

### 2. Application Layer (`src/application/`)

- Command/Query handlers contain business logic
- Orchestrate domain entities
- Call repositories for persistence

### 3. Domain Layer (`src/domain/`)

- Domain entities with business rules
- Repository interfaces (contracts)
- Domain-specific types and enums

```typescript
export class ExTable {
  static create(name: string, createdBy: string) {
    // Domain logic for creating
  }

  update(name: string, updatedBy: string) {
    // Domain logic for updating
  }
}
```

### 4. Infrastructure Layer (`src/infrastructure/`)

- Repository implementations
- Database access (Prisma)
- External services integration

```typescript
@Injectable()
export class ExTableRepository implements IExTableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExTableDto): Promise<ExTableEntity> {
    return await this.prisma.exTable.create({ data });
  }
}
```

## Adding New Features

### Step 1: Define Domain

```typescript
// src/domain/your-module/your-entity.entity.ts
export class YourEntity {
  static create(...) { }
}

// src/domain/your-module/your-entity.repository.ts
export interface IYourEntityRepository {
  create(...): Promise<...>;
  findById(...): Promise<...>;
}
```

### Step 2: Implement Infrastructure

```typescript
// src/infrastructure/prisma/repositories/your-entity.repository.ts
@Injectable()
export class YourEntityRepository implements IYourEntityRepository {
  // Implementation
}
```

### Step 3: Create Application Layer

```typescript
// src/application/your-module/commands/create-your-entity.command.ts
export class CreateYourEntityCommand {}

// src/application/your-module/commands/create-your-entity.handler.ts
@CommandHandler(CreateYourEntityCommand)
export class CreateYourEntityHandler {}
```

### Step 4: Implement Presentation Layer

```typescript
// src/presentation/your-module/your-entity.controller.ts
@Controller('your-entities')
export class YourEntityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}

// src/presentation/your-module/your-entity.module.ts
@Module({
  imports: [CqrsModule],
  controllers: [YourEntityController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: YOUR_ENTITY_REPOSITORY, useClass: YourEntityRepository },
  ],
})
export class YourEntityModule {}
```

### Step 5: Register Module

```typescript
// src/app.module.ts
@Module({
  imports: [
    PrismaModule,
    ExTableModule,
    YourEntityModule, // Add here
  ],
})
export class AppModule {}
```

## Benefits of CQRS

1. **Separation of Concerns**: Read and write operations are separated
2. **Scalability**: Can optimize reads and writes independently
3. **Maintainability**: Clear structure and responsibilities
4. **Testability**: Each handler can be tested in isolation
5. **Flexibility**: Easy to add new features without affecting existing code

## Testing

### Unit Testing Handlers

```typescript
describe('CreateExTableHandler', () => {
  let handler: CreateExTableHandler;
  let repository: IExTableRepository;

  beforeEach(() => {
    repository = { create: jest.fn() } as any;
    handler = new CreateExTableHandler(repository);
  });

  it('should create an ex-table', async () => {
    const command = new CreateExTableCommand('Test', 'user-1');
    await handler.execute(command);
    expect(repository.create).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Keep Commands/Queries Simple**: They should only contain data, no logic
2. **Single Responsibility**: Each handler should do one thing well
3. **Domain Logic in Entities**: Business rules belong in domain layer
4. **Repository Pattern**: Always use interfaces, not concrete implementations
5. **Validation**: Use DTOs with class-validator in presentation layer
6. **Error Handling**: Use domain exceptions, catch in handlers
7. **Naming Convention**:
   - Commands: `VerbNoun` (e.g., `CreateUser`, `UpdateProduct`)
   - Queries: `GetNoun` or `ListNouns` (e.g., `GetUser`, `ListProducts`)

## Common Patterns

### Transactional Commands

```typescript
async execute(command: CreateOrderCommand) {
  return await this.prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data });
    await tx.orderItems.createMany({ data: items });
    return order;
  });
}
```

### Pagination Query

```typescript
export class ListExTablesQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
```

### Event Sourcing (Advanced)

```typescript
@CommandHandler(CreateExTableCommand)
export class CreateExTableHandler {
  async execute(command: CreateExTableCommand) {
    const result = await this.repository.create(command);
    // Publish event
    await this.eventBus.publish(new ExTableCreatedEvent(result.id));
    return result;
  }
}
```
